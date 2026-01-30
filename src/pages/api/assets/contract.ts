import type { APIContext } from 'astro';
import { requireAuth } from '../../../server/auth';
import { prisma } from '../../../server/prisma';

/**
 * GET /api/assets/contract - Lấy balances của Contract Account
 * Contract account có thể có các assets đặc biệt như HNKI, QCX, KXSE
 */
export async function GET(context: APIContext): Promise<Response> {
  try {
    const authResult = requireAuth(context);
    if (authResult instanceof Response) {
      return authResult;
    }
    const userId = authResult;

    // Contract account uses same Wallet table but may have different assets
    // For demo, we'll return USDT, HNKI, QCX, KXSE
    const contractAssets = ['USDT', 'HNKI', 'QCX', 'KXSE'];
    
    const wallets = await prisma.wallet.findMany({
      where: {
        userId,
        asset: { in: contractAssets },
      },
      select: {
        asset: true,
        available: true,
        locked: true,
      },
    });

    // Ensure all contract assets are present (with 0 balance if not found)
    const assetMap = new Map(wallets.map((w) => [w.asset, w]));
    const balances = contractAssets.map((asset) => {
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
    console.error('Get contract account balances error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

