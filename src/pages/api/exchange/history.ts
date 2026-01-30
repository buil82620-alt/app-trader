import type { APIContext } from 'astro';
import { requireAuth } from '../../../server/auth';
import { prisma } from '../../../server/prisma';

/**
 * GET /api/exchange/history
 * Query: limit=50 (optional)
 */
export async function GET(context: APIContext): Promise<Response> {
  try {
    const authResult = requireAuth(context);
    if (authResult instanceof Response) return authResult;
    const userId = authResult;

    const url = new URL(context.request.url);
    const limit = parseInt(url.searchParams.get('limit') || '50', 10);

    const rows = await prisma.exchangeTransaction.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: {
        id: true,
        fromAsset: true,
        toAsset: true,
        fromAmount: true,
        toAmount: true,
        rate: true,
        feeAsset: true,
        feeAmount: true,
        createdAt: true,
      },
    });

    return new Response(
      JSON.stringify({
        success: true,
        transactions: rows.map((r) => ({
          id: r.id,
          fromAsset: r.fromAsset,
          toAsset: r.toAsset,
          fromAmount: Number(r.fromAmount),
          toAmount: Number(r.toAmount),
          rate: Number(r.rate),
          feeAsset: r.feeAsset,
          feeAmount: Number(r.feeAmount),
          createdAt: r.createdAt.toISOString(),
        })),
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Exchange history error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}


