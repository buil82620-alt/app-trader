import type { APIContext } from 'astro';
import { prisma } from '../../../../server/prisma';

/**
 * GET /api/finance/mining/products - Lấy danh sách Mining products
 */
export async function GET(context: APIContext): Promise<Response> {
  try {
    const url = new URL(context.request.url);
    const status = url.searchParams.get('status'); // ACTIVE, INACTIVE

    const where: any = {};
    if (status) {
      where.status = status;
    }

    const products = await prisma.miningProduct.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        hashRate: true,
        currency: true,
        averageDailyReturn: true,
        minimumPurchase: true,
        maximumPurchase: true,
        duration: true,
        status: true,
        createdAt: true,
      },
    });

    const productsFormatted = products.map((p) => ({
      id: p.id,
      hashRate: p.hashRate,
      currency: p.currency,
      averageDailyReturn: Number(p.averageDailyReturn),
      minimumPurchase: Number(p.minimumPurchase),
      maximumPurchase: p.maximumPurchase ? Number(p.maximumPurchase) : null,
      duration: p.duration,
      status: p.status,
      createdAt: p.createdAt.toISOString(),
    }));

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
    console.error('Get Mining products error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

