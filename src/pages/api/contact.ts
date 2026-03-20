import type { APIContext } from 'astro';
import { env } from 'cloudflare:workers';
import { getDb } from '../../db/index.js';
import { contactSubmissions } from '../../db/schema.js';

/**
 * Contact Form API Endpoint
 * POST /api/contact - Save to Neon DB + send email via Resend
 */
export async function POST(context: APIContext) {
  try {
    const formData = await context.request.formData();

    const name = formData.get('name')?.toString() ?? '';
    const email = formData.get('email')?.toString() ?? '';
    const phone = formData.get('phone')?.toString() ?? '';
    const message = formData.get('message')?.toString() ?? '';

    if (!name || !email || !message) {
      return Response.json({ success: false, message: 'Please fill in all required fields.' }, { status: 400 });
    }

    // Save to Neon DB
    const db = getDb(env.NEON_DATABASE_URL);
    await db.insert(contactSubmissions).values({ name, email, phone, message });

    // Send email via Resend
    if (env.RESEND_API_KEY && env.ADMIN_EMAIL) {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'Mallik Group Contact <onboarding@resend.dev>',
          to: [env.ADMIN_EMAIL],
          subject: `New Contact Form Submission from ${name}`,
          html: `
            <h2>New Contact Form Submission</h2>
            <table style="border-collapse:collapse;width:100%;font-family:sans-serif;">
              <tr><td style="padding:8px;font-weight:bold;background:#f5f5f5;">Name</td><td style="padding:8px;">${name}</td></tr>
              <tr><td style="padding:8px;font-weight:bold;background:#f5f5f5;">Email</td><td style="padding:8px;"><a href="mailto:${email}">${email}</a></td></tr>
              <tr><td style="padding:8px;font-weight:bold;background:#f5f5f5;">Phone</td><td style="padding:8px;">${phone || 'Not provided'}</td></tr>
              <tr><td style="padding:8px;font-weight:bold;background:#f5f5f5;vertical-align:top;">Message</td><td style="padding:8px;">${message.replace(/\n/g, '<br>')}</td></tr>
            </table>
            <p style="color:#666;font-size:12px;margin-top:16px;">View all submissions at <a href="https://mallikgroup.com/admin/contacts">Admin Panel</a></p>
          `,
        }),
      });
    }

    return Response.json({ success: true, message: 'Thank you! Your message has been received. We will get back to you soon.' });
  } catch (error) {
    console.error('Contact form error:', error);
    return Response.json({ success: false, message: 'An error occurred. Please try again later.' }, { status: 500 });
  }
}
