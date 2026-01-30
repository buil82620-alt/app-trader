import type { APIContext } from 'astro';
import { Prisma } from '@prisma/client';
import { requireAuth } from '../../../server/auth';
import { prisma } from '../../../server/prisma';

const FEE_RATE = 0.001; // 0.1%

const FALLBACK_USDT_PRICE: Record<string, number> = {
  USDT: 1,
  BTC: 87998.11,
  ETH: 3200,
  BCH: 250,
  LTC: 80,
  UNI: 7,
  XAU: 2400,
  FIG: 1,
  COMB: 0.5,
  EBUN: 0.2,
  KXSE: 0.5,
  ETF: 1,
  ALRA: 0.3,
};

async function getUsdtPrice(asset: string): Promise<number> {
  const a = asset.toUpperCase();
  if (a === 'USDT') return 1;
  const symbol = `${a}USDT`;
  try {
    const res = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${symbol}`);
    if (res.ok) {
      const json = (await res.json()) as { price?: string };
      const p = Number(json.price);
      if (Number.isFinite(p) && p > 0) return p;
    }
  } catch {
    // ignore
  }
  return FALLBACK_USDT_PRICE[a] ?? 1;
}

function computeRate(fromAsset: string, toAsset: string, fromUsdt: number, toUsdt: number): number {
  const f = fromAsset.toUpperCase();
  const t = toAsset.toUpperCase();
  if (f === t) return 1;
  return fromUsdt / toUsdt; // toAsset per fromAsset
}

/**
 * POST /api/exchange/execute
 * Body: { fromAsset, toAsset, fromAmount }
 *
 * Logic:
 * - compute quote server-side (rate + fee)
 * - check fromAsset wallet.available
 * - deduct fromAmount from fromAsset
 * - add net toAmount to toAsset
 * - record ExchangeTransaction
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

    const { fromAsset, toAsset, fromAmount } = body as {
      fromAsset?: string;
      toAsset?: string;
      fromAmount?: number;
    };

    const f = (fromAsset || '').toUpperCase();
    const t = (toAsset || '').toUpperCase();
    const amt = Number(fromAmount);

    if (!f || !t) {
      return new Response(JSON.stringify({ error: 'fromAsset and toAsset are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    if (!Number.isFinite(amt) || amt <= 0) {
      return new Response(JSON.stringify({ error: 'fromAmount must be > 0' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const [fromUsdt, toUsdt] = await Promise.all([getUsdtPrice(f), getUsdtPrice(t)]);
    const rate = computeRate(f, t, fromUsdt, toUsdt);
    if (!Number.isFinite(rate) || rate <= 0) {
      return new Response(JSON.stringify({ error: 'Unable to compute rate' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const fromAmountDec = new Prisma.Decimal(amt);
    const rateDec = new Prisma.Decimal(rate);
    const grossTo = fromAmountDec.mul(rateDec);
    const feeRateDec = new Prisma.Decimal(FEE_RATE);
    const feeAmountDec = grossTo.mul(feeRateDec);
    const toAmountDec = grossTo.sub(feeAmountDec);

    if (toAmountDec.lte(0)) {
      return new Response(JSON.stringify({ error: 'Amount too small' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // from wallet
      let fromWallet = await tx.wallet.findUnique({
        where: { userId_asset: { userId, asset: f } },
      });
      if (!fromWallet) {
        fromWallet = await tx.wallet.create({
          data: {
            userId,
            asset: f,
            available: new Prisma.Decimal(0),
            locked: new Prisma.Decimal(0),
          },
        });
      }
      if (fromWallet.available.lt(fromAmountDec)) {
        throw new Error('Insufficient balance');
      }

      // to wallet
      let toWallet = await tx.wallet.findUnique({
        where: { userId_asset: { userId, asset: t } },
      });
      if (!toWallet) {
        toWallet = await tx.wallet.create({
          data: {
            userId,
            asset: t,
            available: new Prisma.Decimal(0),
            locked: new Prisma.Decimal(0),
          },
        });
      }

      await tx.wallet.update({
        where: { id: fromWallet.id },
        data: { available: fromWallet.available.sub(fromAmountDec) },
      });

      await tx.wallet.update({
        where: { id: toWallet.id },
        data: { available: toWallet.available.add(toAmountDec) },
      });

      const txRecord = await tx.exchangeTransaction.create({
        data: {
          userId,
          fromAsset: f,
          toAsset: t,
          fromAmount: fromAmountDec,
          toAmount: toAmountDec,
          rate: rateDec,
          feeAsset: t,
          feeAmount: feeAmountDec,
        },
      });

      return txRecord;
    });

    return new Response(
      JSON.stringify({
        success: true,
        transaction: {
          id: result.id,
          fromAsset: result.fromAsset,
          toAsset: result.toAsset,
          fromAmount: Number(result.fromAmount),
          toAmount: Number(result.toAmount),
          rate: Number(result.rate),
          feeAsset: result.feeAsset,
          feeAmount: Number(result.feeAmount),
          createdAt: result.createdAt.toISOString(),
        },
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Exchange execute error:', error);
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


