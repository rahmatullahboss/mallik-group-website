/**
 * Contact Form API Endpoint
 * POST /api/contact
 */

export async function onRequestPost(context) {
  try {
    const formData = await context.request.formData();
    
    const name = formData.get('name');
    const email = formData.get('email');
    const phone = formData.get('phone');
    const message = formData.get('message');
    
    // Validate required fields
    if (!name || !email || !message) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Please fill in all required fields.'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // In a real application, you would:
    // - Send email using a service like SendGrid, Mailgun, or Cloudflare Email Workers
    // - Store in a database
    // - Integrate with a CRM
    
    // For now, we'll simulate a successful submission
    console.log('Contact form submission:', { name, email, phone, message });
    
    return new Response(JSON.stringify({
      success: true,
      message: 'Thank you! Your message has been received. We will get back to you soon.'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      message: 'An error occurred. Please try again later.'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
