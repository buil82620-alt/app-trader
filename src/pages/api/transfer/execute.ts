import type { APIContext } from 'astro';
import { requireAuth } from '../../../server/auth';
import { prisma } from '../../../server/prisma';
import { Prisma } from '@prisma/client';

/**
 * POST /api/transfer/execute - Thực hiện chuyển tiền giữa Coins Account và Contract Account
 * Body: { asset, amount, fromAccount, toAccount }
 * fromAccount/toAccount: 'coins' | 'contract'
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

    const {
      asset,
      amount,
      fromAccount,
      toAccount,
    } = body as {
      asset?: string;
      amount?: number;
      fromAccount?: string;
      toAccount?: string;
    };

    // Validation
    if (!asset || !amount || !fromAccount || !toAccount) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    if (fromAccount === toAccount) {
      return new Response(
        JSON.stringify({ error: 'fromAccount and toAccount must be different' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    if (fromAccount !== 'coins' && fromAccount !== 'contract') {
      return new Response(
        JSON.stringify({ error: 'fromAccount must be "coins" or "contract"' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    if (toAccount !== 'coins' && toAccount !== 'contract') {
      return new Response(
        JSON.stringify({ error: 'toAccount must be "coins" or "contract"' }),
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

    const amountDecimal = new Prisma.Decimal(amount);

    // Execute transfer in transaction
    const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // Get wallet for the asset
      let wallet = await tx.wallet.findUnique({
        where: { userId_asset: { userId, asset } },
      });

      if (!wallet) {
        throw new Error(`${asset} wallet not found`);
      }

      // Check available balance
      if (wallet.available.lt(amountDecimal)) {
        throw new Error('Insufficient balance');
      }

      // Transfer logic:
      // - Coins account: uses Wallet.available directly
      // - Contract account: also uses Wallet.available (same table, but conceptually separate)
      // In practice, both accounts share the same Wallet table
      // Transfer is just moving funds within the same wallet (no actual deduction/addition needed)
      // But we still record the transfer history for tracking

      // For now, we'll keep the balance unchanged since both accounts use the same Wallet
      // In a real exchange, you might have separate tables or a field to distinguish accounts
      // But for this demo, we'll just record the transfer without changing balances

      // Create transfer record
      const transfer = await tx.transfer.create({
        data: {
          userId,
          asset,
          amount: amountDecimal,
          fromAccount,
          toAccount,
        },
      });

      return transfer;
    });

    return new Response(
      JSON.stringify({
        success: true,
        transfer: {
          id: result.id,
          asset: result.asset,
          amount: Number(result.amount),
          fromAccount: result.fromAccount,
          toAccount: result.toAccount,
          createdAt: result.createdAt.toISOString(),
        },
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    console.error('Transfer execute error:', error);
    if (error.message === 'Insufficient balance' || error.message.includes('wallet not found')) {
      return new Response(
        JSON.stringify({ error: error.message }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

