import type { APIRoute } from 'astro';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { requireAuth } from '../../../server/auth';

export const POST: APIRoute = async (context) => {
  try {
    // Require authentication
    const authResult = requireAuth(context);
    if (authResult instanceof Response) {
      return authResult; // Returns 401 if not authenticated
    }
    const userId = authResult;

    const formData = await context.request.formData();
    const file = formData.get('image') as File;

    if (!file) {
      return new Response(
        JSON.stringify({ error: 'No file provided' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return new Response(
        JSON.stringify({ error: 'File must be an image' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return new Response(
        JSON.stringify({ error: 'File size must be less than 5MB' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Generate unique filename
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    const extension = file.name.split('.').pop();
    const filename = `chat-${timestamp}-${random}.${extension}`;

    // Save file to public/uploads/chat directory
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'chat');
    const filepath = join(uploadDir, filename);

    // Create directory if it doesn't exist
    const { mkdir } = await import('fs/promises');
    await mkdir(uploadDir, { recursive: true });

    // Convert file to buffer and save
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    await writeFile(filepath, buffer);

    // Return URL
    const imageUrl = `/uploads/chat/${filename}`;

    return new Response(
      JSON.stringify({ data: { imageUrl } }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

