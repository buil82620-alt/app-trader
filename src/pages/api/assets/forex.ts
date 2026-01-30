import type { APIContext } from 'astro';
import { requireAuth } from '../../../server/auth';
import { prisma } from '../../../server/prisma';

/**
 * GET /api/assets/forex - Lấy balances của Forex Account
 * Forex account chỉ có USDT
 */
export async function GET(context: APIContext): Promise<Response> {
  try {
    const authResult = requireAuth(context);
    if (authResult instanceof Response) {
      return authResult;
    }
    const userId = authResult;

    const wallet = await prisma.wallet.findUnique({
      where: { userId_asset: { userId, asset: 'USDT' } },
      select: {
        asset: true,
        available: true,
        locked: true,
      },
    });

    const balances = [
      {
        asset: 'USDT',
        available: wallet ? Number(wallet.available) : 0,
        locked: wallet ? Number(wallet.locked) : 0,
        total: wallet ? Number(wallet.available) + Number(wallet.locked) : 0,
      },
    ];

    return new Response(
      JSON.stringify({
        success: true,
        balances,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Get forex account balances error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

