import type { APIContext } from 'astro';
import { requireAuth } from '../../../server/auth';
import { prisma } from '../../../server/prisma';

/**
 * GET /api/assets/coins - Lấy balances của Coins Account
 */
export async function GET(context: APIContext): Promise<Response> {
  try {
    const authResult = requireAuth(context);
    if (authResult instanceof Response) {
      return authResult;
    }
    const userId = authResult;

    const wallets = await prisma.wallet.findMany({
      where: { userId },
      select: {
        asset: true,
        available: true,
        locked: true,
      },
    });

    // Get prices for conversion to USDT (simplified - in production use real-time prices)
    const balances = wallets.map((w) => ({
      asset: w.asset,
      available: Number(w.available),
      locked: Number(w.locked),
      total: Number(w.available) + Number(w.locked),
    }));

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
    console.error('Get coins account balances error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

