import type { APIRoute } from 'astro';
import { prisma } from '../../../server/prisma';
import { requireAuth } from '../../../server/auth';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

export const POST: APIRoute = async (context) => {
  try {
    // Require authentication
    const authResult = requireAuth(context);
    if (authResult instanceof Response) {
      return authResult; // Returns 401 if not authenticated
    }
    const userId = authResult;

    // Check if user already has a pending verification request
    // Using type assertion because TypeScript may not recognize the new model until server restart
    let existingRequest;
    try {
      existingRequest = await (prisma as any).verificationRequest.findFirst({
        where: {
          userId,
          status: 'PENDING',
        },
      });
    } catch (error: any) {
      console.error('Error checking existing verification request:', error);
      // If the error is about model not found, provide helpful message
      if (error.message?.includes('verificationRequest') || error.message?.includes('undefined') || error.message?.includes('Cannot read')) {
        return new Response(
          JSON.stringify({ 
            error: 'Verification service not available. Please restart the dev server after running: npx prisma generate' 
          }),
          { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
      }
      throw error;
    }

    if (existingRequest) {
      return new Response(
        JSON.stringify({ error: 'You already have a pending verification request' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Check if user is already verified
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { isVerified: true },
    });

    if (user?.isVerified) {
      return new Response(
        JSON.stringify({ error: 'Your account is already verified' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const formData = await context.request.formData();
    const name = formData.get('name') as string;
    const idNumber = formData.get('idNumber') as string;
    const frontId = formData.get('frontId') as File;
    const backId = formData.get('backId') as File;

    if (!name || !idNumber || !frontId || !backId) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Validate file types
    if (!frontId.type.startsWith('image/') || !backId.type.startsWith('image/')) {
      return new Response(
        JSON.stringify({ error: 'Files must be images' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Validate file sizes (max 5MB each)
    if (frontId.size > 5 * 1024 * 1024 || backId.size > 5 * 1024 * 1024) {
      return new Response(
        JSON.stringify({ error: 'File size must be less than 5MB' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Create upload directory
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'verification');
    await mkdir(uploadDir, { recursive: true });

    // Generate unique filenames
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    
    const frontExtension = frontId.name.split('.').pop();
    const backExtension = backId.name.split('.').pop();
    
    const frontFilename = `verify-${userId}-${timestamp}-front-${random}.${frontExtension}`;
    const backFilename = `verify-${userId}-${timestamp}-back-${random}.${backExtension}`;

    const frontPath = join(uploadDir, frontFilename);
    const backPath = join(uploadDir, backFilename);

    // Save files
    const frontArrayBuffer = await frontId.arrayBuffer();
    const backArrayBuffer = await backId.arrayBuffer();
    
    await writeFile(frontPath, Buffer.from(frontArrayBuffer));
    await writeFile(backPath, Buffer.from(backArrayBuffer));

    const frontIdUrl = `/uploads/verification/${frontFilename}`;
    const backIdUrl = `/uploads/verification/${backFilename}`;

    // Create verification request
    // Using type assertion because TypeScript may not recognize the new model until server restart
    let verificationRequest;
    try {
      verificationRequest = await (prisma as any).verificationRequest.create({
        data: {
          userId,
          name,
          idNumber,
          frontIdUrl,
          backIdUrl,
          status: 'PENDING',
        },
      });
    } catch (error: any) {
      console.error('Error creating verification request:', error);
      // If the error is about model not found, provide helpful message
      if (error.message?.includes('verificationRequest') || error.message?.includes('undefined') || error.message?.includes('Cannot read')) {
        return new Response(
          JSON.stringify({ 
            error: 'Verification service not available. Please restart the dev server after running: npx prisma generate' 
          }),
          { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
      }
      throw error;
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        data: verificationRequest 
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error submitting verification:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

