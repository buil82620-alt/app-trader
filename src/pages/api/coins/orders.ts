import type { APIContext } from 'astro';
import { requireAuth } from '../../../server/auth';
import { prisma } from '../../../server/prisma';

export async function GET(context: APIContext): Promise<Response> {
  try {
    const authResult = requireAuth(context);
    if (authResult instanceof Response) {
      return authResult;
    }
    const userId = authResult;

    const url = new URL(context.request.url);
    const symbol = url.searchParams.get('symbol');
    const status = url.searchParams.get('status');
    const limit = parseInt(url.searchParams.get('limit') || '50', 10);

    const where: any = { userId };
    if (symbol) {
      where.symbol = symbol;
    }
    if (status) {
      where.status = status;
    }

    const orders = await prisma.spotOrder.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: {
        id: true,
        symbol: true,
        side: true,
        type: true,
        price: true,
        quantity: true,
        filledQuantity: true,
        status: true,
        feeAsset: true,
        feeAmount: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    const ordersFormatted = orders.map((o) => ({
      id: o.id,
      symbol: o.symbol,
      side: o.side,
      type: o.type,
      price: o.price ? Number(o.price) : null,
      quantity: Number(o.quantity),
      filledQuantity: Number(o.filledQuantity),
      status: o.status,
      feeAsset: o.feeAsset,
      feeAmount: o.feeAmount ? Number(o.feeAmount) : null,
      createdAt: o.createdAt.toISOString(),
      updatedAt: o.updatedAt.toISOString(),
    }));

    return new Response(
      JSON.stringify({
        success: true,
        orders: ordersFormatted,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Get orders error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

