import type { APIContext } from 'astro';
import { prisma } from '../../../../server/prisma';

/**
 * GET /api/finance/ieo/products - Lấy danh sách IEO products
 */
export async function GET(context: APIContext): Promise<Response> {
  try {
    const url = new URL(context.request.url);
    const status = url.searchParams.get('status'); // UPCOMING, IN_PROGRESS, ENDED

    const where: any = {};
    if (status) {
      where.status = status;
    }

    const products = await prisma.iEOProduct.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        symbol: true,
        status: true,
        totalSupply: true,
        currentRaised: true,
        pricePerToken: true,
        startDate: true,
        endDate: true,
        createdAt: true,
      },
    });

    const productsFormatted = products.map((p) => {
      const totalSupplyNum = Number(p.totalSupply);
      const currentRaisedNum = Number(p.currentRaised);
      const remaining = totalSupplyNum - currentRaisedNum;

      return {
        id: p.id,
        title: p.title,
        symbol: p.symbol,
        status: p.status,
        current: currentRaisedNum,
        total: totalSupplyNum,
        remaining,
        pricePerToken: Number(p.pricePerToken),
        startDate: p.startDate.toISOString(),
        endDate: p.endDate ? p.endDate.toISOString() : null,
        createdAt: p.createdAt.toISOString(),
      };
    });

    return new Response(
      JSON.stringify({
        success: true,
        products: productsFormatted,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Get IEO products error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

