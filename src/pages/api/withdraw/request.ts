import type { APIContext } from 'astro';
import { Prisma } from '@prisma/client';
import { requireAuth } from '../../../server/auth';
import { prisma } from '../../../server/prisma';

type ChainKey = 'ERC20' | 'TRC20';

function getWithdrawRules(asset: string, chain: ChainKey) {
  const upper = asset.toUpperCase();
  const minWithdraw = upper === 'USDT' ? 10 : 0;

  // demo fees (same as UI)
  let fee = 0.5;
  if (upper === 'USDT') fee = chain === 'ERC20' ? 5 : 1;
  else if (upper === 'BTC') fee = 0.0005;
  else if (upper === 'ETH') fee = 0.005;

  return { minWithdraw, fee };
}

/**
 * POST /api/withdraw/request
 * Body: { asset, chain, address, amount, txPassword }
 *
 * Business:
 * - validate input
 * - check wallet balance
 * - move amount from available -> locked
 * - create WithdrawalRequest (PENDING)
 */
export async function POST(context: APIContext): Promise<Response> {
  try {
    const authResult = requireAuth(context);
    if (authResult instanceof Response) return authResult;
    const userId = authResult;

    let body: unknown = {};
    try {
      body = await context.request.json();
    } catch {
      return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { asset, chain, address, amount, txPassword } = body as {
      asset?: string;
      chain?: ChainKey;
      address?: string;
      amount?: number;
      txPassword?: string;
    };

    if (!asset || !chain || !address || !amount || !txPassword) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: asset, chain, address, amount, txPassword' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (chain !== 'ERC20' && chain !== 'TRC20') {
      return new Response(JSON.stringify({ error: 'Invalid chain' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (typeof address !== 'string' || address.trim().length < 8) {
      return new Response(JSON.stringify({ error: 'Invalid address' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!Number.isFinite(amount) || amount <= 0) {
      return new Response(JSON.stringify({ error: 'Invalid amount' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (typeof txPassword !== 'string' || txPassword.trim().length < 6) {
      return new Response(JSON.stringify({ error: 'Invalid transaction password' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const assetUpper = asset.toUpperCase();
    const { minWithdraw, fee } = getWithdrawRules(assetUpper, chain);

    if (amount < minWithdraw) {
      return new Response(
        JSON.stringify({ error: `Minimum withdrawal is ${minWithdraw} ${assetUpper}` }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const amountDec = new Prisma.Decimal(amount);
    const feeDec = new Prisma.Decimal(fee);
    const arrivalDec = amountDec.sub(feeDec);
    if (arrivalDec.lte(0)) {
      return new Response(JSON.stringify({ error: 'Amount must be greater than fee' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const req = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      let wallet = await tx.wallet.findUnique({
        where: { userId_asset: { userId, asset: assetUpper } },
      });

      if (!wallet) {
        wallet = await tx.wallet.create({
          data: {
            userId,
            asset: assetUpper,
            available: new Prisma.Decimal(0),
            locked: new Prisma.Decimal(0),
          },
        });
      }

      if (wallet.available.lt(amountDec)) {
        throw new Error('Insufficient balance');
      }

      // lock full amount (amount includes fee)
      await tx.wallet.update({
        where: { id: wallet.id },
        data: {
          available: wallet.available.sub(amountDec),
          locked: wallet.locked.add(amountDec),
        },
      });

      const withdrawal = await tx.withdrawalRequest.create({
        data: {
          userId,
          asset: assetUpper,
          chain,
          address: address.trim(),
          amount: amountDec,
          fee: feeDec,
          arrival: arrivalDec,
          status: 'PENDING',
        },
      });

      return withdrawal;
    });

    return new Response(
      JSON.stringify({
        success: true,
        request: {
          id: req.id,
          asset: req.asset,
          chain: req.chain,
          address: req.address,
          amount: Number(req.amount),
          fee: Number(req.fee),
          arrival: Number(req.arrival),
          status: req.status,
          txHash: req.txHash,
          createdAt: req.createdAt.toISOString(),
        },
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Create withdraw request error:', error);
    if (error?.message === 'Insufficient balance') {
      return new Response(JSON.stringify({ error: 'Insufficient balance' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}


