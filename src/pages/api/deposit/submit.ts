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

    const formData = await context.request.formData();
    const amount = formData.get('amount')?.toString();
    const asset = formData.get('asset')?.toString() || 'USDT';
    const network = formData.get('network')?.toString() || 'TRC20';
    const certificate = formData.get('certificate') as File;

    if (!amount || !certificate) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: amount and certificate' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Validate amount
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      return new Response(
        JSON.stringify({ error: 'Amount must be greater than 0' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Validate file type and size
    if (!certificate.type.startsWith('image/')) {
      return new Response(
        JSON.stringify({ error: 'Certificate must be an image' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (certificate.size > 5 * 1024 * 1024) { // 5MB limit
      return new Response(
        JSON.stringify({ error: 'Certificate size must be less than 5MB' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Create upload directory
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'deposits');
    await mkdir(uploadDir, { recursive: true });

    // Generate unique filename
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    const extension = certificate.name.split('.').pop();
    const filename = `deposit-${userId}-${timestamp}-${random}.${extension}`;
    const filepath = join(uploadDir, filename);

    // Save file
    const arrayBuffer = await certificate.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    await writeFile(filepath, buffer);

    const certificateUrl = `/uploads/deposits/${filename}`;

    // Create deposit request
    // Using type assertion because TypeScript may not recognize the new model until server restart
    let depositRequest;
    try {
      depositRequest = await (prisma as any).depositRequest.create({
        data: {
          userId,
          asset,
          network,
          amount: amountNum,
          certificateUrl,
          status: 'PENDING',
        },
      });
    } catch (error: any) {
      console.error('Error creating deposit request:', error);
      // If the error is about model not found, provide helpful message
      if (error.message?.includes('depositRequest') || error.message?.includes('undefined') || error.message?.includes('Cannot read')) {
        return new Response(
          JSON.stringify({ 
            error: 'Deposit service not available. Please restart the dev server after running: npx prisma generate' 
          }),
          { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
      }
      throw error;
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        data: depositRequest 
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error submitting deposit request:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

