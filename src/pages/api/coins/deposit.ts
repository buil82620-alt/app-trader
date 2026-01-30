import type { APIContext } from 'astro';
import { requireAuth } from '../../../server/auth';
import { prisma } from '../../../server/prisma';
import { Prisma } from '@prisma/client';

/**
 * API để nạp tiền vào wallet của user
 * POST /api/coins/deposit
 * Body: { asset: string, amount: number }
 */
export async function POST(context: APIContext): Promise<Response> {
  try {
    const authResult = requireAuth(context);
    if (authResult instanceof Response) {
      return authResult;
    }
    const userId = authResult;

    let body: unknown = {};
    try {
      body = await context.request.json();
    } catch {
      return new Response(
        JSON.stringify({ error: 'Invalid JSON body' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const { asset, amount } = body as {
      asset?: string;
      amount?: number;
    };

    // Validation
    if (!asset || !amount) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: asset, amount' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    if (amount <= 0) {
      return new Response(
        JSON.stringify({ error: 'Amount must be greater than 0' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Validate asset format (uppercase: USDT, BTC, ETH, etc.)
    const assetUpper = asset.toUpperCase();

    // Use transaction to ensure atomicity
    const result = await prisma.$transaction(async (tx) => {
      // Get or create wallet
      let wallet = await tx.wallet.findUnique({
        where: { userId_asset: { userId, asset: assetUpper } },
      });

      if (!wallet) {
        // Create new wallet if doesn't exist
        wallet = await tx.wallet.create({
          data: {
            userId,
            asset: assetUpper,
            available: 0,
            locked: 0,
          },
        });
      }

      // Add amount to available balance
      const amountDecimal = new Prisma.Decimal(amount);
      const newAvailable = wallet.available.add(amountDecimal);

      const updatedWallet = await tx.wallet.update({
        where: { id: wallet.id },
        data: {
          available: newAvailable,
        },
      });

      return updatedWallet;
    });

    return new Response(
      JSON.stringify({
        success: true,
        wallet: {
          asset: result.asset,
          available: Number(result.available),
          locked: Number(result.locked),
          total: Number(result.available) + Number(result.locked),
        },
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    console.error('Deposit error:', error);
    
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

