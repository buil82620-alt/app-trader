import type { APIRoute } from 'astro';
import { prisma } from '../../../server/prisma';
import { requireAuth } from '../../../server/auth';

export const GET: APIRoute = async (context) => {
  try {
    // Require authentication
    const authResult = requireAuth(context);
    if (authResult instanceof Response) {
      return authResult; // Returns 401 if not authenticated
    }
    const userId = authResult;

    // Get user info including verification status
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        isVerified: true,
        isActive: true,
        isBanned: true,
      },
    });

    if (!user) {
      return new Response(
        JSON.stringify({ error: 'User not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Check if user has pending verification request
    const pendingRequest = await (prisma as any).verificationRequest.findFirst({
      where: {
        userId,
        status: 'PENDING',
      },
      select: {
        id: true,
        status: true,
        createdAt: true,
      },
    });

    return new Response(
      JSON.stringify({
        data: {
          ...user,
          hasPendingVerification: !!pendingRequest,
          verificationRequest: pendingRequest,
        },
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error fetching user info:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

