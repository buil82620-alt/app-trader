import type { APIContext } from 'astro';
import { requireAuth } from '../../../server/auth';
import { Prisma } from '@prisma/client';

type QuoteResponse = {
  success: true;
  quote: {
    fromAsset: string;
    toAsset: string;
    fromAmount: number;
    rate: number;
    feeRate: number;
    feeAsset: string;
    feeAmount: number;
    toAmount: number; // net after fee
    priceSource: 'binance' | 'fallback';
  };
};

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

async function getUsdtPrice(asset: string): Promise<{ price: number; source: 'binance' | 'fallback' }> {
  const a = asset.toUpperCase();
  if (a === 'USDT') return { price: 1, source: 'fallback' };

  const symbol = `${a}USDT`;
  try {
    const res = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${symbol}`);
    if (res.ok) {
      const json = (await res.json()) as { price?: string };
      const p = Number(json.price);
      if (Number.isFinite(p) && p > 0) return { price: p, source: 'binance' };
    }
  } catch {
    // ignore
  }

  return { price: FALLBACK_USDT_PRICE[a] ?? 1, source: 'fallback' };
}

function computeRate(fromAsset: string, toAsset: string, fromUsdt: number, toUsdt: number): number {
  const f = fromAsset.toUpperCase();
  const t = toAsset.toUpperCase();
  if (f === t) return 1;
  // rate: how many toAsset for 1 fromAsset
  // fromAsset -> USDT = fromUsdt; USDT -> toAsset = 1/toUsdt
  return fromUsdt / toUsdt;
}

/**
 * GET /api/exchange/quote
 * Query: fromAsset, toAsset, fromAmount
 */
export async function GET(context: APIContext): Promise<Response> {
  try {
    const authResult = requireAuth(context);
    if (authResult instanceof Response) return authResult;

    const url = new URL(context.request.url);
    const fromAsset = (url.searchParams.get('fromAsset') || '').toUpperCase();
    const toAsset = (url.searchParams.get('toAsset') || '').toUpperCase();
    const fromAmount = Number(url.searchParams.get('fromAmount') || '0');

    if (!fromAsset || !toAsset) {
      return new Response(JSON.stringify({ error: 'fromAsset and toAsset are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    if (!Number.isFinite(fromAmount) || fromAmount <= 0) {
      return new Response(JSON.stringify({ error: 'fromAmount must be > 0' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const [fromP, toP] = await Promise.all([getUsdtPrice(fromAsset), getUsdtPrice(toAsset)]);
    const rate = computeRate(fromAsset, toAsset, fromP.price, toP.price);

    const fromAmountDec = new Prisma.Decimal(fromAmount);
    const rateDec = new Prisma.Decimal(rate);
    const grossTo = fromAmountDec.mul(rateDec);
    const feeRateDec = new Prisma.Decimal(FEE_RATE);
    const feeAmount = grossTo.mul(feeRateDec);
    const netTo = grossTo.sub(feeAmount);

    const priceSource: 'binance' | 'fallback' =
      fromP.source === 'binance' || toP.source === 'binance' ? 'binance' : 'fallback';

    const payload: QuoteResponse = {
      success: true,
      quote: {
        fromAsset,
        toAsset,
        fromAmount,
        rate: Number(rateDec),
        feeRate: FEE_RATE,
        feeAsset: toAsset,
        feeAmount: Number(feeAmount),
        toAmount: Number(netTo),
        priceSource,
      },
    };

    return new Response(JSON.stringify(payload), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Exchange quote error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}


