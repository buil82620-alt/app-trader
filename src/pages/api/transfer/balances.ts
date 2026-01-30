import type { APIContext } from 'astro';
import { requireAuth } from '../../../server/auth';
import { prisma } from '../../../server/prisma';

/**
 * GET /api/transfer/balances - Lấy số dư của coins account và contract account cho một asset
 * Query params: asset (required)
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

    if (!asset) {
      return new Response(
        JSON.stringify({ error: 'Asset parameter is required' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Get wallet for the asset
    const wallet = await prisma.wallet.findUnique({
      where: { userId_asset: { userId, asset } },
      select: {
        available: true,
        locked: true,
      },
    });

    // In this implementation, both coins and contract accounts share the same Wallet table
    // So the balance is the same for both accounts
    // In a real exchange, you might have separate tables or logic to distinguish accounts
    const coinsBalance = wallet ? Number(wallet.available) : 0;
    const contractBalance = wallet ? Number(wallet.available) : 0;

    return new Response(
      JSON.stringify({
        success: true,
        balances: {
          coins: coinsBalance,
          contract: contractBalance,
        },
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Get transfer balances error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

