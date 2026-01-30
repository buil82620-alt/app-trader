import type { APIContext } from 'astro';
import { requireAuth } from '../../../../server/auth';
import { prisma } from '../../../../server/prisma';
import { Prisma } from '@prisma/client';

/**
 * POST /api/finance/ieo/invest - User đầu tư vào IEO product
 * Body: { productId, amount }
 */
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

    const { productId, amount } = body as {
      productId?: number;
      amount?: number;
    };

    if (!productId || !amount) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: productId, amount' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    if (amount <= 0) {
      return new Response(
        JSON.stringify({ error: 'amount must be greater than 0' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Use transaction to ensure atomicity
    const result = await prisma.$transaction(async (tx: any) => {
      // Get product
      const product = await tx.iEOProduct.findUnique({
        where: { id: productId },
      });

      if (!product) {
        throw new Error('Product not found');
      }

      if (product.status !== 'IN_PROGRESS') {
        throw new Error('Product is not available for investment');
      }

      const now = new Date();
      if (product.startDate > now) {
        throw new Error('Product has not started yet');
      }
      if (product.endDate && product.endDate < now) {
        throw new Error('Product has ended');
      }

      // Calculate tokens to receive
      const amountDecimal = new Prisma.Decimal(amount);
      const pricePerToken = product.pricePerToken;
      const tokens = amountDecimal.div(pricePerToken);

      // Check if investment would exceed total supply
      const newRaised = product.currentRaised.add(amountDecimal);
      if (newRaised.gt(product.totalSupply)) {
        throw new Error('Investment would exceed total supply');
      }

      // Get or create USDT wallet
      let wallet = await tx.wallet.findUnique({
        where: { userId_asset: { userId, asset: 'USDT' } },
      });

      if (!wallet) {
        wallet = await tx.wallet.create({
          data: {
            userId,
            asset: 'USDT',
            available: 0,
            locked: 0,
          },
        });
      }

      // Check balance
      const available = new Prisma.Decimal(wallet.available);
      if (available.lt(amountDecimal)) {
        throw new Error('Insufficient balance');
      }

      // Deduct amount from wallet
      await tx.wallet.update({
        where: { id: wallet.id },
        data: {
          available: wallet.available.sub(amountDecimal),
        },
      });

      // Update product currentRaised
      await tx.iEOProduct.update({
        where: { id: product.id },
        data: {
          currentRaised: newRaised,
          status: newRaised.gte(product.totalSupply) ? 'ENDED' : 'IN_PROGRESS',
        },
      });

      // Create investment
      const investment = await tx.iEOInvestment.create({
        data: {
          userId,
          productId,
          amount: amountDecimal,
          tokens,
          status: 'CONFIRMED',
        },
      });

      return investment;
    });

    return new Response(
      JSON.stringify({
        success: true,
        investment: {
          id: result.id,
          productId: result.productId,
          amount: Number(result.amount),
          tokens: Number(result.tokens),
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
    console.error('IEO invest error:', error);

    if (
      error.message === 'Insufficient balance' ||
      error.message === 'Product not found' ||
      error.message === 'Product is not available for investment' ||
      error.message === 'Product has not started yet' ||
      error.message === 'Product has ended' ||
      error.message === 'Investment would exceed total supply'
    ) {
      return new Response(
        JSON.stringify({ error: error.message }),
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

