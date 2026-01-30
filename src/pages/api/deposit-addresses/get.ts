import type { APIRoute } from 'astro';
import { prisma } from '../../../server/prisma';

export const GET: APIRoute = async ({ url }) => {
  try {
    const asset = url.searchParams.get('asset');
    const network = url.searchParams.get('network');

    const where: any = {
      isActive: true, // Only return active addresses
    };

    if (asset) {
      where.asset = asset.toUpperCase();
    }
    if (network) {
      where.network = network.toUpperCase();
    }

    // Using type assertion because TypeScript may not recognize the new model until server restart
    const addresses = await (prisma as any).depositAddress.findMany({
      where,
      orderBy: [
        { asset: 'asc' },
        { network: 'asc' },
      ],
    });

    return new Response(
      JSON.stringify({ data: addresses }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error fetching deposit addresses:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

