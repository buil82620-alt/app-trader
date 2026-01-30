import type { APIContext } from 'astro';
import { requireAuth } from '../../../server/auth';
import { prisma } from '../../../server/prisma';

/**
 * GET /api/assets/futures - Lấy balances của Futures Account
 * Futures account thường chỉ có USDT và USDC
 */
export async function GET(context: APIContext): Promise<Response> {
  try {
    const authResult = requireAuth(context);
    if (authResult instanceof Response) {
      return authResult;
    }
    const userId = authResult;

    const futuresAssets = ['USDT', 'USDC'];
    
    const wallets = await prisma.wallet.findMany({
      where: {
        userId,
        asset: { in: futuresAssets },
      },
      select: {
        asset: true,
        available: true,
        locked: true,
      },
    });

    // Ensure all futures assets are present
    const assetMap = new Map(wallets.map((w) => [w.asset, w]));
    const balances = futuresAssets.map((asset) => {
      const wallet = assetMap.get(asset);
      return {
        asset,
        available: wallet ? Number(wallet.available) : 0,
        locked: wallet ? Number(wallet.locked) : 0,
        total: wallet ? Number(wallet.available) + Number(wallet.locked) : 0,
      };
    });

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
    console.error('Get futures account balances error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

