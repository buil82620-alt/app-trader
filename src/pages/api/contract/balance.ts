import type { APIContext } from 'astro';
import { requireAuth } from '../../../server/auth';
import { prisma } from '../../../server/prisma';

/**
 * GET /api/contract/balance - Lấy số dư contract account (micro account funds)
 */
export async function GET(context: APIContext): Promise<Response> {
  try {
    const authResult = requireAuth(context);
    if (authResult instanceof Response) {
      return authResult;
    }
    const userId = authResult;

    // Get USDT wallet (contract trading uses USDT)
    const wallet = await prisma.wallet.findUnique({
      where: { userId_asset: { userId, asset: 'USDT' } },
      select: {
        available: true,
        locked: true,
      },
    });

    const available = wallet ? Number(wallet.available) : 0;
    const locked = wallet ? Number(wallet.locked) : 0;
    const total = available + locked;

    // Count open positions
    const openPositionsCount = await prisma.contractPosition.count({
      where: {
        userId,
        status: 'OPEN',
      },
    });

    return new Response(
      JSON.stringify({
        success: true,
        balance: {
          available,
          locked,
          total,
          openPositionsCount,
        },
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Get contract balance error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

