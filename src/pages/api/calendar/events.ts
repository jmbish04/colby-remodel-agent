
import type { APIRoute } from 'astro';
import { getCalendarService } from '@/lib/services/google-calendar';

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const calendarService = getCalendarService(locals.runtime?.env);
    const body = await request.json();

    // Basic validation
    if (!body.summary || !body.start || !body.end) {
      return new Response(JSON.stringify({ error: 'Missing required event details' }), { status: 400 });
    }

    const event = await calendarService.createEvent(body);
    return new Response(JSON.stringify(event), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Calendar API Error:', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
};
