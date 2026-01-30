import type { APIContext } from 'astro';
import { requireAuth } from '../../../server/auth';
import { prisma } from '../../../server/prisma';

/**
 * GET /api/withdraw/requests
 * Query: asset=USDT (optional), limit=50 (optional)
 */
export async function GET(context: APIContext): Promise<Response> {
  try {
    const authResult = requireAuth(context);
    if (authResult instanceof Response) return authResult;
    const userId = authResult;

    const url = new URL(context.request.url);
    const asset = url.searchParams.get('asset');
    const limit = parseInt(url.searchParams.get('limit') || '50', 10);

    const where: any = { userId };
    if (asset) where.asset = asset.toUpperCase();

    const requests = await prisma.withdrawalRequest.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: {
        id: true,
        asset: true,
        chain: true,
        address: true,
        amount: true,
        fee: true,
        arrival: true,
        status: true,
        txHash: true,
        createdAt: true,
      },
    });

    return new Response(
      JSON.stringify({
        success: true,
        requests: requests.map((r) => ({
          id: r.id,
          asset: r.asset,
          chain: r.chain,
          address: r.address,
          amount: Number(r.amount),
          fee: Number(r.fee),
          arrival: Number(r.arrival),
          status: r.status,
          txHash: r.txHash,
          createdAt: r.createdAt.toISOString(),
        })),
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Get withdraw requests error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}


