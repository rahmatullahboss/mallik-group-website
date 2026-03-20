import type { APIContext } from 'astro';

/**
 * Admin Logout API
 * POST /api/admin/logout - Clear session cookie
 */
export async function POST(_context: APIContext) {
  return Response.json(
    { success: true },
    {
      headers: {
        'Set-Cookie': 'admin_token=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0',
      },
    }
  );
}
