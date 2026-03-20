import { getDb } from '../../../src/db/index.js';
import { contactSubmissions } from '../../../src/db/schema.js';
import { eq } from 'drizzle-orm';

/**
 * Contacts API
 * GET /api/admin/contacts        - List all contact submissions
 * PUT /api/admin/contacts?id=X   - Toggle read/unread
 */

export async function onRequestGet(context) {
  const db = getDb(context.env.NEON_DATABASE_URL);
  const items = await db.select().from(contactSubmissions).orderBy(contactSubmissions.createdAt);
  return Response.json(items);
}

export async function onRequestPut(context) {
  const db = getDb(context.env.NEON_DATABASE_URL);
  const url = new URL(context.request.url);
  const id = Number(url.searchParams.get('id'));
  if (!id) return Response.json({ error: 'ID required' }, { status: 400 });
  const body = await context.request.json();
  const [item] = await db.update(contactSubmissions).set({ read: body.read }).where(eq(contactSubmissions.id, id)).returning();
  if (!item) return Response.json({ error: 'Not found' }, { status: 404 });
  return Response.json(item);
}
