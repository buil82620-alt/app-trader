import type { APIContext } from 'astro';
import { requireAuth } from '../../../server/auth';
import { prisma } from '../../../server/prisma';
import { Prisma } from '@prisma/client';

export async function POST(context: APIContext): Promise<Response> {
  try {
    const authResult = requireAuth(context);
    if (authResult instanceof Response) {
      return authResult;
    }
    const userId = authResult;

    let body: unknown = {};
    try {
      body = await context.request.json();
    } catch {
      return new Response(
        JSON.stringify({ error: 'Invalid JSON body' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const {
      symbol,
      side,
      type,
      price,
      quantity,
      currentPrice, // For MARKET orders
    } = body as {
      symbol?: string;
      side?: string;
      type?: string;
      price?: number;
      quantity?: number;
      currentPrice?: number;
    };

    // Validation
    if (!symbol || !side || !type || !quantity) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: symbol, side, type, quantity' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    if (side !== 'BUY' && side !== 'SELL') {
      return new Response(
        JSON.stringify({ error: 'side must be BUY or SELL' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    if (type !== 'MARKET' && type !== 'LIMIT') {
      return new Response(
        JSON.stringify({ error: 'type must be MARKET or LIMIT' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    if (type === 'LIMIT' && (!price || price <= 0)) {
      return new Response(
        JSON.stringify({ error: 'price is required for LIMIT orders' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    if (quantity <= 0) {
      return new Response(
        JSON.stringify({ error: 'quantity must be greater than 0' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Extract base and quote assets from symbol (e.g., BTCUSDT -> BTC, USDT)
    const baseAsset = symbol.replace('USDT', ''); // BTC, ETH, ...
    const quoteAsset = 'USDT';

    // Use transaction to ensure atomicity
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await prisma.$transaction(async (tx: any) => {
      // Get or create wallets
      const getOrCreateWallet = async (asset: string) => {
        let wallet = await tx.wallet.findUnique({
          where: { userId_asset: { userId, asset } },
        });

        if (!wallet) {
          wallet = await tx.wallet.create({
            data: {
              userId,
              asset,
              available: 0,
              locked: 0,
            },
          });
        }

        return wallet;
      };

      const baseWallet = await getOrCreateWallet(baseAsset);
      const quoteWallet = await getOrCreateWallet(quoteAsset);

      // Calculate amounts to lock/check
      const qtyDecimal = new Prisma.Decimal(quantity);
      const priceDecimal = type === 'LIMIT' && price
        ? new Prisma.Decimal(price)
        : null;

      let orderPrice: Prisma.Decimal | null = null;
      let totalCost: Prisma.Decimal;
      let feeRate = new Prisma.Decimal(0.00001); // 0.001%

      if (type === 'MARKET') {
        // For MARKET orders, use currentPrice to calculate cost
        if (!currentPrice || currentPrice <= 0) {
          throw new Error('currentPrice is required for MARKET orders');
        }
        orderPrice = null; // MARKET orders don't have a fixed price
        const marketPriceDecimal = new Prisma.Decimal(currentPrice);
        
        if (side === 'BUY') {
          // Buying: need USDT = currentPrice * quantity
          totalCost = marketPriceDecimal.mul(qtyDecimal);
        } else {
          // Selling: need base asset = quantity
          totalCost = qtyDecimal;
        }
      } else {
        // LIMIT order
        orderPrice = priceDecimal!;
        if (side === 'BUY') {
          totalCost = orderPrice.mul(qtyDecimal);
        } else {
          totalCost = qtyDecimal; // Selling base asset
        }
      }

      // Check balance
      if (side === 'BUY') {
        // Buying: need USDT (quote asset)
        const available = new Prisma.Decimal(quoteWallet.available);
        const needed = totalCost.mul(new Prisma.Decimal(1).add(feeRate));

        if (available.lt(needed)) {
          throw new Error('Insufficient balance');
        }

        // Lock USDT
        await tx.wallet.update({
          where: { id: quoteWallet.id },
          data: {
            available: quoteWallet.available.sub(needed),
            locked: quoteWallet.locked.add(needed),
          },
        });
      } else {
        // SELL: need base asset
        const available = new Prisma.Decimal(baseWallet.available);
        const needed = qtyDecimal;

        if (available.lt(needed)) {
          throw new Error('Insufficient balance');
        }

        // Lock base asset
        await tx.wallet.update({
          where: { id: baseWallet.id },
          data: {
            available: baseWallet.available.sub(needed),
            locked: baseWallet.locked.add(needed),
          },
        });
      }

      // Create order
      const order = await tx.spotOrder.create({
        data: {
          userId,
          symbol,
          side,
          type,
          price: orderPrice,
          quantity: qtyDecimal,
          status: type === 'MARKET' ? 'NEW' : 'NEW',
          feeAsset: side === 'BUY' ? baseAsset : quoteAsset,
        },
      });

      return order;
    });

    // For MARKET orders, simulate immediate fill (auto-execute)
    if (type === 'MARKET' && currentPrice) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await prisma.$transaction(async (tx: any) => {
          // Get the order
          const order = await tx.spotOrder.findUnique({
            where: { id: result.id },
          });

          if (!order || order.status !== 'NEW') {
            return;
          }

          const baseAsset = symbol.replace('USDT', '');
          const quoteAsset = 'USDT';

          // Get wallets
          const baseWallet = await tx.wallet.findUnique({
            where: { userId_asset: { userId, asset: baseAsset } },
          });
          const quoteWallet = await tx.wallet.findUnique({
            where: { userId_asset: { userId, asset: quoteAsset } },
          });

          if (!baseWallet || !quoteWallet) {
            throw new Error('Wallet not found');
          }

          const qtyDecimal = new Prisma.Decimal(order.quantity);
          const fillPriceDecimal = new Prisma.Decimal(currentPrice);
          const feeRate = new Prisma.Decimal(0.00001);

          if (order.side === 'BUY') {
            // BUY: Unlock USDT, add BTC to wallet
            const totalCost = fillPriceDecimal.mul(qtyDecimal);
            const feeAmount = totalCost.mul(feeRate);
            const totalPaid = totalCost.add(feeAmount);

            // Unlock USDT (trừ từ locked, không cộng lại available vì đã dùng)
            await tx.wallet.update({
              where: { id: quoteWallet.id },
              data: {
                locked: quoteWallet.locked.sub(totalPaid),
              },
            });

            // Add BTC to wallet (available)
            await tx.wallet.update({
              where: { id: baseWallet.id },
              data: {
                available: baseWallet.available.add(qtyDecimal),
              },
            });

            // Create trade fill
            await tx.tradeFill.create({
              data: {
                orderId: order.id,
                userId,
                symbol: order.symbol,
                price: fillPriceDecimal,
                quantity: qtyDecimal,
                feeAsset: baseAsset,
                feeAmount,
                side: 'BUY',
              },
            });

            // Update order status
            await tx.spotOrder.update({
              where: { id: order.id },
              data: {
                status: 'FILLED',
                filledQuantity: qtyDecimal,
                feeAmount,
              },
            });
          } else {
            // SELL: Unlock base asset, add USDT to wallet
            const totalReceived = fillPriceDecimal.mul(qtyDecimal);
            const feeAmount = totalReceived.mul(feeRate);
            const netReceived = totalReceived.sub(feeAmount);

            // Unlock base asset (trừ từ locked)
            await tx.wallet.update({
              where: { id: baseWallet.id },
              data: {
                locked: baseWallet.locked.sub(qtyDecimal),
              },
            });

            // Add USDT to wallet (available)
            await tx.wallet.update({
              where: { id: quoteWallet.id },
              data: {
                available: quoteWallet.available.add(netReceived),
              },
            });

            // Create trade fill
            await tx.tradeFill.create({
              data: {
                orderId: order.id,
                userId,
                symbol: order.symbol,
                price: fillPriceDecimal,
                quantity: qtyDecimal,
                feeAsset: quoteAsset,
                feeAmount,
                side: 'SELL',
              },
            });

            // Update order status
            await tx.spotOrder.update({
              where: { id: order.id },
              data: {
                status: 'FILLED',
                filledQuantity: qtyDecimal,
                feeAmount,
              },
            });
          }
        });
      } catch (fillError) {
        console.error('Error filling MARKET order:', fillError);
        // Order was created but fill failed - order remains in NEW status
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        order: {
          id: result.id,
          symbol: result.symbol,
          side: result.side,
          type: result.type,
          price: result.price ? Number(result.price) : null,
          quantity: Number(result.quantity),
          filledQuantity: Number(result.filledQuantity),
          status: result.status,
          createdAt: result.createdAt.toISOString(),
        },
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    console.error('Create order error:', error);
    
    if (error.message === 'Insufficient balance') {
      return new Response(
        JSON.stringify({ error: 'Insufficient balance' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

