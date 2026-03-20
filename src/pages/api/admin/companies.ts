import type { APIContext } from 'astro';
import { env } from 'cloudflare:workers';
import { getDb } from '../../../db/index.js';
import { companyInfo } from '../../../db/schema.js';
import { eq } from 'drizzle-orm';

/**
 * Companies API
 * GET /api/admin/companies             - List all company info
 * PUT /api/admin/companies?slug=XXX    - Update company by slug (upsert)
 */

export async function GET(_context: APIContext) {
  const db = getDb(env.NEON_DATABASE_URL);
  const items = await db.select().from(companyInfo);
  return Response.json(items);
}

export async function PUT(context: APIContext) {
  const db = getDb(env.NEON_DATABASE_URL);
  const url = new URL(context.request.url);
  const slug = url.searchParams.get('slug');
  if (!slug) return Response.json({ error: 'Slug required' }, { status: 400 });
  const body = await context.request.json();
  const { name, description } = body;
  const existing = await db.select().from(companyInfo).where(eq(companyInfo.slug, slug));
  let item;
  if (existing.length > 0) {
    [item] = await db.update(companyInfo).set({ name, description, updatedAt: new Date() }).where(eq(companyInfo.slug, slug)).returning();
  } else {
    [item] = await db.insert(companyInfo).values({ slug, name, description }).returning();
  }
  return Response.json(item);
}
