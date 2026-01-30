import type { APIContext } from 'astro';
import { requireAuth } from '../../../../server/auth';
import { prisma } from '../../../../server/prisma';

/**
 * GET /api/finance/ieo/investments - Lấy danh sách IEO investments của user
 */
export async function GET(context: APIContext): Promise<Response> {
  try {
    const authResult = requireAuth(context);
    if (authResult instanceof Response) {
      return authResult;
    }
    const userId = authResult;

    const investments = await prisma.iEOInvestment.findMany({
      where: { userId },
      include: {
        product: {
          select: {
            id: true,
            title: true,
            symbol: true,
            status: true,
            pricePerToken: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const investmentsFormatted = investments.map((inv) => ({
      id: inv.id,
      product: {
        id: inv.product.id,
        title: inv.product.title,
        symbol: inv.product.symbol,
        status: inv.product.status,
        pricePerToken: Number(inv.product.pricePerToken),
      },
      amount: Number(inv.amount),
      tokens: Number(inv.tokens),
      status: inv.status,
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
    console.error('Get IEO investments error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

