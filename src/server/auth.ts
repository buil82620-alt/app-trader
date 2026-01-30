import type { APIContext } from 'astro';

/**
 * Extract userId from token in Authorization header
 * Returns null if invalid or missing
 */
export function getUserIdFromRequest(context: APIContext): number | null {
  const authHeader = context.request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7); // Remove "Bearer "
  
  // Simple demo token format: "demo-token-{userId}"
  if (!token.startsWith('demo-token-')) {
    return null;
  }

  const userIdStr = token.substring(11); // Remove "demo-token-"
  const userId = parseInt(userIdStr, 10);

  if (isNaN(userId) || userId <= 0) {
    return null;
  }

  return userId;
}

/**
 * Middleware helper: returns userId or sends 401 response
 */
export function requireAuth(context: APIContext): number | Response {
  const userId = getUserIdFromRequest(context);
  
  if (!userId) {
    return new Response(
      JSON.stringify({ error: 'Unauthorized' }),
      {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  return userId;
}

