import { getDb } from '../../../src/db/index.js';
import { news } from '../../../src/db/schema.js';
import { eq } from 'drizzle-orm';

/**
 * News CRUD API
 * GET    /api/admin/news        - List all news
 * POST   /api/admin/news        - Create news
 * PUT    /api/admin/news?id=X   - Update news
 * DELETE /api/admin/news?id=X   - Delete news
 */

function getDb_(env) {
  return getDb(env.NEON_DATABASE_URL);
}

export async function onRequestGet(context) {
  const db = getDb_(context.env);
  const items = await db.select().from(news).orderBy(news.createdAt);
  return Response.json(items);
}

export async function onRequestPost(context) {
  const db = getDb_(context.env);
  const body = await context.request.json();
  const { title, excerpt, content, date, published } = body;
  if (!title || !excerpt || !content || !date) {
    return Response.json({ error: 'Missing required fields' }, { status: 400 });
  }
  const [item] = await db.insert(news).values({ title, excerpt, content, date, published: published ?? false }).returning();
  return Response.json(item, { status: 201 });
}

export async function onRequestPut(context) {
  const db = getDb_(context.env);
  const url = new URL(context.request.url);
  const id = Number(url.searchParams.get('id'));
  if (!id) return Response.json({ error: 'ID required' }, { status: 400 });
  const body = await context.request.json();
  const { title, excerpt, content, date, published } = body;
  const [item] = await db.update(news).set({ title, excerpt, content, date, published }).where(eq(news.id, id)).returning();
  if (!item) return Response.json({ error: 'Not found' }, { status: 404 });
  return Response.json(item);
}

export async function onRequestDelete(context) {
  const db = getDb_(context.env);
  const url = new URL(context.request.url);
  const id = Number(url.searchParams.get('id'));
  if (!id) return Response.json({ error: 'ID required' }, { status: 400 });
  await db.delete(news).where(eq(news.id, id));
  return Response.json({ success: true });
}
