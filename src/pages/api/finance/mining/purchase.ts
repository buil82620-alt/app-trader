import type { APIContext } from 'astro';
import { requireAuth } from '../../../../server/auth';
import { prisma } from '../../../../server/prisma';
import { Prisma } from '@prisma/client';

/**
 * POST /api/finance/mining/purchase - User mua mining product
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
      const product = await tx.miningProduct.findUnique({
        where: { id: productId },
      });

      if (!product) {
        throw new Error('Product not found');
      }

      if (product.status !== 'ACTIVE') {
        throw new Error('Product is not available');
      }

      const amountDecimal = new Prisma.Decimal(amount);

      // Check minimum purchase
      if (amountDecimal.lt(product.minimumPurchase)) {
        throw new Error(
          `Minimum purchase amount is ${Number(product.minimumPurchase)} ${product.currency}`
        );
      }

      // Check maximum purchase if set
      if (product.maximumPurchase && amountDecimal.gt(product.maximumPurchase)) {
        throw new Error(
          `Maximum purchase amount is ${Number(product.maximumPurchase)} ${product.currency}`
        );
      }

      // Get or create wallet
      let wallet = await tx.wallet.findUnique({
        where: { userId_asset: { userId, asset: product.currency } },
      });

      if (!wallet) {
        wallet = await tx.wallet.create({
          data: {
            userId,
            asset: product.currency,
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

      // Calculate daily return
      const dailyReturn = amountDecimal.mul(product.averageDailyReturn).div(100);

      // Calculate end date
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + product.duration);

      // Create investment
      const investment = await tx.miningInvestment.create({
        data: {
          userId,
          productId,
          amount: amountDecimal,
          hashRate: product.hashRate,
          dailyReturn,
          startDate,
          endDate,
          status: 'ACTIVE',
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
          hashRate: result.hashRate,
          dailyReturn: Number(result.dailyReturn),
          startDate: result.startDate.toISOString(),
          endDate: result.endDate.toISOString(),
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
    console.error('Mining purchase error:', error);

    if (
      error.message === 'Insufficient balance' ||
      error.message === 'Product not found' ||
      error.message === 'Product is not available' ||
      error.message.includes('Minimum purchase') ||
      error.message.includes('Maximum purchase')
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

