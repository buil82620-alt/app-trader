import type { APIContext } from 'astro';
import { requireAuth } from '../../../server/auth';
import { prisma } from '../../../server/prisma';

/**
 * GET /api/contract/positions - Lấy danh sách contract positions
 * Query params: status (OPEN, CLOSED, SETTLED), symbol (optional)
 */
export async function GET(context: APIContext): Promise<Response> {
  try {
    const authResult = requireAuth(context);
    if (authResult instanceof Response) {
      return authResult;
    }
    const userId = authResult;

    const url = new URL(context.request.url);
    const status = url.searchParams.get('status'); // OPEN, CLOSED, SETTLED
    const symbol = url.searchParams.get('symbol');
    const limit = parseInt(url.searchParams.get('limit') || '50', 10);

    const where: any = { userId };
    if (status) {
      where.status = status;
    }
    if (symbol) {
      where.symbol = symbol;
    }

    const positions = await prisma.contractPosition.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: {
        id: true,
        symbol: true,
        side: true,
        entryPrice: true,
        exitPrice: true,
        amount: true,
        duration: true,
        profitability: true,
        expectedProfit: true,
        expectedPayout: true,
        actualProfit: true,
        status: true,
        result: true,
        createdAt: true,
        expiresAt: true,
        closedAt: true,
      },
    });

    const positionsFormatted = positions.map((p) => ({
      id: p.id,
      symbol: p.symbol,
      side: p.side,
      entryPrice: Number(p.entryPrice),
      exitPrice: p.exitPrice ? Number(p.exitPrice) : null,
      amount: Number(p.amount),
      duration: p.duration,
      profitability: Number(p.profitability),
      expectedProfit: Number(p.expectedProfit),
      expectedPayout: Number(p.expectedPayout),
      actualProfit: p.actualProfit ? Number(p.actualProfit) : null,
      status: p.status,
      result: p.result,
      createdAt: p.createdAt.toISOString(),
      expiresAt: p.expiresAt.toISOString(),
      closedAt: p.closedAt ? p.closedAt.toISOString() : null,
    }));

    return new Response(
      JSON.stringify({
        success: true,
        positions: positionsFormatted,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Get contract positions error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

