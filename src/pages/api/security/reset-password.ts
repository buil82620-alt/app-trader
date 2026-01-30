import type { APIContext } from 'astro';
import bcrypt from 'bcryptjs';
import { prisma } from '../../../server/prisma';
import { requireAuth } from '../../../server/auth';

type ResetType = 'login' | 'transaction';

export async function POST(context: APIContext): Promise<Response> {
  try {
    const authResult = requireAuth(context);
    if (authResult instanceof Response) {
      return authResult;
    }
    const userId = authResult;

    let body: unknown = {};
    try {
      body = await context.request.json();
    } catch {
      return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { type, oldPassword, newPassword } = body as {
      type?: ResetType;
      oldPassword?: string;
      newPassword?: string;
    };

    if (!type || (type !== 'login' && type !== 'transaction')) {
      return new Response(JSON.stringify({ error: 'Invalid type' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!newPassword) {
      return new Response(
        JSON.stringify({ error: 'Missing newPassword' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        },
      );
    }

    // For transaction password, oldPassword might be empty if user doesn't have one yet
    // For login password, oldPassword is always required
    if (type === 'login' && !oldPassword) {
      return new Response(
        JSON.stringify({ error: 'Missing oldPassword' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        },
      );
    }

    if (newPassword.length < 6) {
      return new Response(
        JSON.stringify({ error: 'Password must be at least 6 characters' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        },
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        passwordHash: true,
        transactionPasswordHash: true,
      },
    });

    if (!user) {
      return new Response(JSON.stringify({ error: 'User not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (type === 'login') {
      if (!oldPassword) {
        return new Response(JSON.stringify({ error: 'Missing oldPassword' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      const valid = await bcrypt.compare(oldPassword, user.passwordHash);
      if (!valid) {
        return new Response(JSON.stringify({ error: 'Old password incorrect' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      const newHash = await bcrypt.hash(newPassword, 10);
      await prisma.user.update({
        where: { id: userId },
        data: {
          passwordHash: newHash,
        },
      });
    } else {
      // transaction password
      if (user.transactionPasswordHash) {
        // User already has transaction password, require old transaction password
        if (!oldPassword) {
          return new Response(
            JSON.stringify({ error: 'Missing old transaction password' }),
            {
              status: 400,
              headers: { 'Content-Type': 'application/json' },
            },
          );
        }
        const valid = await bcrypt.compare(
          oldPassword,
          user.transactionPasswordHash,
        );
        if (!valid) {
          return new Response(
            JSON.stringify({ error: 'Old transaction password incorrect' }),
            {
              status: 401,
              headers: { 'Content-Type': 'application/json' },
            },
          );
        }
      } else {
        // User doesn't have transaction password yet, require login password for verification
        if (!oldPassword) {
          return new Response(
            JSON.stringify({
              error: 'Please enter your login password for verification',
            }),
            {
              status: 400,
              headers: { 'Content-Type': 'application/json' },
            },
          );
        }
        const validLogin = await bcrypt.compare(oldPassword, user.passwordHash);
        if (!validLogin) {
          return new Response(
            JSON.stringify({
              error: 'Login password incorrect',
            }),
            {
              status: 401,
              headers: { 'Content-Type': 'application/json' },
            },
          );
        }
      }

      const newHash = await bcrypt.hash(newPassword, 10);
      await prisma.user.update({
        where: { id: userId },
        data: {
          transactionPasswordHash: newHash,
        },
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Reset password API error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  }
}


