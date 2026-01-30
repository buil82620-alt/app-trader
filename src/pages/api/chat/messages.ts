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

    const url = new URL(context.request.url);
    const conversationId = parseInt(url.searchParams.get('conversationId') || '0');
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const before = url.searchParams.get('before'); // For pagination

    if (!conversationId) {
      return new Response(
        JSON.stringify({ error: 'Conversation ID required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Verify that the conversation belongs to the authenticated user
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      select: { userId: true },
    });

    if (!conversation) {
      return new Response(
        JSON.stringify({ error: 'Conversation not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (conversation.userId !== userId) {
      return new Response(
        JSON.stringify({ error: 'Access denied. This conversation does not belong to you.' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const where: any = { conversationId };
    if (before) {
      where.createdAt = { lt: new Date(before) };
    }

    const messages = await prisma.message.findMany({
      where,
      take: limit,
      orderBy: { createdAt: 'desc' },
    });

    // Mark messages as read if they're from admin (only on initial load, not when loading older messages)
    if (!before) {
      await prisma.message.updateMany({
        where: {
          conversationId,
          senderType: 'admin',
          isRead: false,
        },
        data: {
          isRead: true,
        },
      });
    }

    return new Response(
      JSON.stringify({ data: messages.reverse() }), // Reverse to show oldest first
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

export const POST: APIRoute = async (context) => {
  try {
    // Require authentication
    const authResult = requireAuth(context);
    if (authResult instanceof Response) {
      return authResult; // Returns 401 if not authenticated
    }
    const userId = authResult;

    const body = await context.request.json();
    const { conversationId, senderType, content, imageUrl } = body;

    if (!conversationId || !senderType) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Only allow users to send messages (not admins via this endpoint)
    if (senderType !== 'user') {
      return new Response(
        JSON.stringify({ error: 'Invalid sender type' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Verify that the conversation belongs to the authenticated user
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      select: { userId: true },
    });

    if (!conversation) {
      return new Response(
        JSON.stringify({ error: 'Conversation not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (conversation.userId !== userId) {
      return new Response(
        JSON.stringify({ error: 'Access denied. This conversation does not belong to you.' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!content && !imageUrl) {
      return new Response(
        JSON.stringify({ error: 'Content or imageUrl required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const message = await prisma.message.create({
      data: {
        conversationId,
        senderId: userId, // Use authenticated user's ID
        senderType: 'user',
        content: content || null,
        imageUrl: imageUrl || null,
      },
    });

    // Update conversation lastMessageAt
    await prisma.conversation.update({
      where: { id: conversationId },
      data: { lastMessageAt: new Date() },
    });

    return new Response(
      JSON.stringify({ data: message }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

