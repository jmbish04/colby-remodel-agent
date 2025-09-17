
import type { APIRoute } from 'astro';
import { getCalendarService } from '@/lib/services/google-calendar';

export const PATCH: APIRoute = async ({ params, request, locals }) => {
  const { id } = params;
  if (!id) {
    return new Response(JSON.stringify({ error: 'Event ID is required' }), { status: 400 });
  }

  try {
    const calendarService = getCalendarService(locals.runtime?.env);
    const body = await request.json();
    
    const updatedEvent = await calendarService.updateEvent(id, body);
    return new Response(JSON.stringify(updatedEvent), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error(`Calendar API Error (PATCH /api/calendar/events/${id}):`, error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
};

export const DELETE: APIRoute = async ({ params, locals }) => {
  const { id } = params;
  if (!id) {
    return new Response(JSON.stringify({ error: 'Event ID is required' }), { status: 400 });
  }

  try {
    const calendarService = getCalendarService(locals.runtime?.env);
    await calendarService.deleteEvent(id);
    return new Response(null, { status: 204 });
  } catch (error: any) {
    console.error(`Calendar API Error (DELETE /api/calendar/events/${id}):`, error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
};
