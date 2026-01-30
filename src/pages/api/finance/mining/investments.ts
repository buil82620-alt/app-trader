import type { APIContext } from 'astro';
import { requireAuth } from '../../../../server/auth';
import { prisma } from '../../../../server/prisma';

/**
 * GET /api/finance/mining/investments - Lấy danh sách Mining investments của user
 */
export async function GET(context: APIContext): Promise<Response> {
  try {
    const authResult = requireAuth(context);
    if (authResult instanceof Response) {
      return authResult;
    }
    const userId = authResult;

    const url = new URL(context.request.url);
    const status = url.searchParams.get('status'); // ACTIVE, COMPLETED

    const where: any = { userId };
    if (status) {
      where.status = status;
    }

    const investments = await prisma.miningInvestment.findMany({
      where,
      include: {
        product: {
          select: {
            id: true,
            hashRate: true,
            currency: true,
            averageDailyReturn: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const investmentsFormatted = investments.map((inv) => ({
      id: inv.id,
      product: {
        id: inv.product.id,
        hashRate: inv.product.hashRate,
        currency: inv.product.currency,
        averageDailyReturn: Number(inv.product.averageDailyReturn),
      },
      amount: Number(inv.amount),
      hashRate: inv.hashRate,
      dailyReturn: Number(inv.dailyReturn),
      totalReturn: Number(inv.totalReturn),
      startDate: inv.startDate.toISOString(),
      endDate: inv.endDate.toISOString(),
      status: inv.status,
      lastPayoutDate: inv.lastPayoutDate ? inv.lastPayoutDate.toISOString() : null,
      createdAt: inv.createdAt.toISOString(),
    }));

    return new Response(
      JSON.stringify({
        success: true,
        investments: investmentsFormatted,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Get Mining investments error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

