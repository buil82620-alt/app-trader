import type { APIContext } from 'astro';
import { requireAuth } from '../../../server/auth';
import { prisma } from '../../../server/prisma';

/**
 * GET /api/transfer/history - Lấy lịch sử chuyển tiền
 * Query params: asset (optional), limit (optional, default 50)
 */
export async function GET(context: APIContext): Promise<Response> {
  try {
    const authResult = requireAuth(context);
    if (authResult instanceof Response) {
      return authResult;
    }
    const userId = authResult;

    const url = new URL(context.request.url);
    const asset = url.searchParams.get('asset');
    const limit = parseInt(url.searchParams.get('limit') || '50', 10);

    const where: any = { userId };
    if (asset) {
      where.asset = asset.toUpperCase();
    }

    const transfers = await prisma.transfer.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: {
        id: true,
        asset: true,
        amount: true,
        fromAccount: true,
        toAccount: true,
        createdAt: true,
      },
    });

    const transfersFormatted = transfers.map((t: any) => ({
      id: t.id,
      asset: t.asset,
      amount: Number(t.amount),
      fromAccount: t.fromAccount,
      toAccount: t.toAccount,
      createdAt: t.createdAt.toISOString(),
    }));

    return new Response(
      JSON.stringify({
        success: true,
        transfers: transfersFormatted,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Get transfer history error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

