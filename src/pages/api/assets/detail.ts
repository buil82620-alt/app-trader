import type { APIContext } from 'astro';
import { requireAuth } from '../../../server/auth';
import { prisma } from '../../../server/prisma';

/**
 * GET /api/assets/detail - Lấy chi tiết balance của một asset trong một account type
 * Query params: accountType (coins|contract|futures|forex), asset (USDT, BTC, etc.)
 */
export async function GET(context: APIContext): Promise<Response> {
  try {
    const authResult = requireAuth(context);
    if (authResult instanceof Response) {
      return authResult;
    }
    const userId = authResult;

    const url = new URL(context.request.url);
    const accountType = url.searchParams.get('accountType');
    const asset = url.searchParams.get('asset');

    if (!accountType || !asset) {
      return new Response(
        JSON.stringify({ error: 'Missing accountType or asset parameter' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const wallet = await prisma.wallet.findUnique({
      where: { userId_asset: { userId, asset } },
      select: {
        asset: true,
        available: true,
        locked: true,
      },
    });

    const balance = {
      asset,
      available: wallet ? Number(wallet.available) : 0,
      locked: wallet ? Number(wallet.locked) : 0,
      total: wallet ? Number(wallet.available) + Number(wallet.locked) : 0,
    };

    return new Response(
      JSON.stringify({
        success: true,
        balance,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Get asset detail error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

