import { createServer } from 'http';
import { Server } from 'socket.io';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const databaseUrl = process.env.DATABASE_URL;

const pool = new Pool({
  connectionString: databaseUrl,
  ssl: {
    rejectUnauthorized: false,
  },
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: [
      process.env.MAIN_APP_URL || "http://localhost:4321",
      process.env.CMS_URL || "http://localhost:4322",
      "http://localhost:3000",
      "http://localhost:4321",
      "http://localhost:4322",
    ],
    methods: ["GET", "POST"],
    credentials: true,
  },
});

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Handle ping/pong for heartbeat
  socket.on('ping', () => {
    socket.emit('pong');
  });

  // Handle typing indicators
  socket.on('typing', (data) => {
    const { conversationId, isTyping } = data;
    // Broadcast typing status to other users in the conversation
    socket.to(`conversation-${conversationId}`).emit('typing', {
      conversationId,
      isTyping,
    });
  });

  // Join conversation room
  socket.on('join-conversation', async (data) => {
    try {
      const { conversationId, userId, isAdmin } = data;
      
      if (!conversationId) {
        socket.emit('error', { message: 'Missing conversationId' });
        return;
      }

      // Verify conversation exists
      const conversation = await prisma.conversation.findUnique({
        where: { id: conversationId },
        select: { userId: true },
      });

      if (!conversation) {
        socket.emit('error', { message: 'Conversation not found' });
        return;
      }

      // If userId is provided and not admin, verify ownership
      if (userId && !isAdmin && conversation.userId !== userId) {
        socket.emit('error', { message: 'Access denied. This conversation does not belong to you.' });
        return;
      }

      // Admin (isAdmin=true or userId=0) can join any conversation
      socket.join(`conversation-${conversationId}`);
      console.log(`Socket ${socket.id} joined conversation ${conversationId} ${isAdmin ? '(admin)' : `(user ${userId})`}`);
    } catch (error) {
      console.error('Error joining conversation:', error);
      socket.emit('error', { message: 'Failed to join conversation' });
    }
  });

  // Leave conversation room
  socket.on('leave-conversation', (data) => {
    const { conversationId } = data;
    socket.leave(`conversation-${conversationId}`);
    console.log(`Socket ${socket.id} left conversation ${conversationId}`);
  });

  // Send message
  socket.on('send-message', async (data) => {
    try {
      const { conversationId, senderId, senderType, content, imageUrl } = data;

      console.log('Received send-message:', { conversationId, senderId, senderType, hasContent: !!content, hasImage: !!imageUrl });

      if (!conversationId || senderType === undefined) {
        socket.emit('error', { message: 'Missing required fields: conversationId or senderType' });
        console.error('Missing required fields:', { conversationId, senderType });
        return;
      }

      // Admin can have senderId = 0, user must have valid senderId
      if (senderType === 'user' && (!senderId || senderId <= 0)) {
        socket.emit('error', { message: 'Missing or invalid senderId for user' });
        console.error('Invalid senderId for user:', senderId);
        return;
      }

      // Verify conversation exists
      const conversation = await prisma.conversation.findUnique({
        where: { id: conversationId },
        select: { userId: true },
      });

      if (!conversation) {
        socket.emit('error', { message: 'Conversation not found' });
        return;
      }

      // If sender is user (not admin), verify ownership
      if (senderType === 'user' && conversation.userId !== senderId) {
        socket.emit('error', { message: 'Access denied. This conversation does not belong to you.' });
        return;
      }

      // Admin (senderId=0 or senderType='admin') can send to any conversation
      // For admin, use senderId = 0 if not provided
      const finalSenderId = senderType === 'admin' ? (senderId || 0) : senderId;

      console.log('Saving message to database:', { conversationId, senderId: finalSenderId, senderType, hasContent: !!content, hasImage: !!imageUrl });

      // Save message to database
      let message;
      try {
        message = await prisma.message.create({
          data: {
            conversationId,
            senderId: finalSenderId,
            senderType,
            content: content || null,
            imageUrl: imageUrl || null,
          },
        });
        console.log('Message saved to database successfully:', message.id);
      } catch (dbError) {
        console.error('Database error saving message:', dbError);
        socket.emit('error', { message: 'Failed to save message to database', error: dbError.message });
        return;
      }

      // Update conversation lastMessageAt
      try {
        await prisma.conversation.update({
          where: { id: conversationId },
          data: { lastMessageAt: new Date() },
        });
        console.log('Conversation lastMessageAt updated');
      } catch (updateError) {
        console.error('Error updating conversation lastMessageAt:', updateError);
        // Don't fail the whole operation if this fails
      }

      // Emit to all clients in the conversation room with conversationId
      const messageWithConvId = { ...message, conversationId };
      const roomName = `conversation-${conversationId}`;
      
      // Get list of sockets in the room for debugging
      const room = io.sockets.adapter.rooms.get(roomName);
      const roomSize = room ? room.size : 0;
      console.log(`Emitting new-message to room ${roomName}, room size: ${roomSize}, senderType: ${senderType}`);
      
      io.to(roomName).emit('new-message', messageWithConvId);

      // Emit notification to admin if message is from user
      if (senderType === 'user') {
        io.emit('admin-notification', {
          type: 'new-message',
          conversationId,
          message: messageWithConvId,
        });
      }
      
      // Also emit a user notification if message is from admin (for backward compatibility)
      if (senderType === 'admin') {
        // Find the user's socket and emit directly to them
        // This ensures the message is delivered even if room join failed
        const conversation = await prisma.conversation.findUnique({
          where: { id: conversationId },
          select: { userId: true },
        });
        if (conversation) {
          // Emit to all sockets (user should be in the room, but this is a fallback)
          console.log(`Admin message sent, also emitting user-notification for user ${conversation.userId}`);
        }
      }
      // Note: user-notification is redundant since new-message already broadcasts to conversation room
      // Removed to prevent duplicate messages
    } catch (error) {
      console.error('Error sending message:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        conversationId: data?.conversationId,
        senderType: data?.senderType,
      });
      socket.emit('error', { 
        message: 'Failed to send message',
        error: error.message,
      });
    }
  });

  // Mark messages as read
  socket.on('mark-read', async (data) => {
    try {
      const { conversationId, senderType } = data;

      await prisma.message.updateMany({
        where: {
          conversationId,
          senderType: senderType === 'user' ? 'admin' : 'user',
          isRead: false,
        },
        data: {
          isRead: true,
        },
      });

      io.to(`conversation-${conversationId}`).emit('messages-read', { conversationId });
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || process.env.SOCKET_PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`Socket.io server running on port ${PORT}`);
});

