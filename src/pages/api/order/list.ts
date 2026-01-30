import type { APIContext } from 'astro';
import { requireAuth } from '../../../server/auth';
import { prisma } from '../../../server/prisma';

/**
 * GET /api/order/list - Lấy danh sách orders của user (bao gồm cả spot orders và contract positions)
 * Query params: status (in_transaction, position_closed)
 */
export async function GET(context: APIContext): Promise<Response> {
  try {
    const authResult = requireAuth(context);
    if (authResult instanceof Response) {
      return authResult;
    }
    const userId = authResult;

    const url = new URL(context.request.url);
    const status = url.searchParams.get('status'); // in_transaction, position_closed

    const orders: any[] = [];

    // Fetch spot orders
    const spotOrdersWhere: any = { userId };
    if (status === 'in_transaction') {
      spotOrdersWhere.status = { in: ['NEW', 'PARTIALLY_FILLED'] };
    } else if (status === 'position_closed') {
      spotOrdersWhere.status = { in: ['FILLED', 'CANCELED', 'REJECTED'] };
    }

    const spotOrders = await prisma.spotOrder.findMany({
      where: spotOrdersWhere,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        symbol: true,
        side: true,
        type: true,
        price: true,
        quantity: true,
        filledQuantity: true,
        status: true,
        createdAt: true,
      },
    });

    // Map spot orders to OrderRecord format
    spotOrders.forEach((order) => {
      const orderStatus =
        order.status === 'NEW' || order.status === 'PARTIALLY_FILLED'
          ? 'in_transaction'
          : 'position_closed';

      // Calculate amount (for display)
      const amount = order.price
        ? Number(order.price) * Number(order.quantity)
        : Number(order.quantity);

      orders.push({
        id: `spot_${order.id}`,
        type: 'spot',
        symbol: order.symbol,
        side: order.side,
        status: orderStatus,
        amount,
        price: order.price ? Number(order.price) : null,
        quantity: Number(order.quantity),
        filledQuantity: Number(order.filledQuantity),
        orderType: order.type,
        orderStatus: order.status,
        createdAt: order.createdAt.toISOString(),
      });
    });

    // Fetch contract positions
    const contractWhere: any = { userId };
    if (status === 'in_transaction') {
      contractWhere.status = 'OPEN';
    } else if (status === 'position_closed') {
      contractWhere.status = 'CLOSED';
    }

    const contractPositions = await prisma.contractPosition.findMany({
      where: contractWhere,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        symbol: true,
        side: true,
        amount: true,
        entryPrice: true,
        exitPrice: true,
        status: true,
        result: true,
        createdAt: true,
      },
    });

    // Map contract positions to OrderRecord format
    contractPositions.forEach((position) => {
      const orderStatus = position.status === 'OPEN' ? 'in_transaction' : 'position_closed';

      orders.push({
        id: `contract_${position.id}`,
        type: 'contract',
        symbol: position.symbol,
        side: position.side === 'BUY_UP' ? 'BUY' : 'SELL',
        status: orderStatus,
        amount: Number(position.amount),
        entryPrice: Number(position.entryPrice),
        exitPrice: position.exitPrice ? Number(position.exitPrice) : null,
        result: position.result,
        createdAt: position.createdAt.toISOString(),
      });
    });

    // Sort by createdAt descending
    orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return new Response(
      JSON.stringify({
        success: true,
        orders,
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

