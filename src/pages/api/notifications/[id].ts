
import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ params, request, locals }) => {
    const runtime = locals.runtime;
    if (!runtime?.env?.NOTIFICATION_MANAGER) {
        return new Response(JSON.stringify({ error: 'Notification manager not available' }), { status: 500 });
    }

    const { id } = params;
    if (!id) {
        return new Response('ID is required', { status: 400 });
    }

    const doId = runtime.env.NOTIFICATION_MANAGER.idFromName(id);
    const stub = runtime.env.NOTIFICATION_MANAGER.get(doId);

    // Forward the request to the Durable Object
    return stub.fetch(request);
};

export const POST: APIRoute = async ({ params, request, locals }) => {
    const runtime = locals.runtime;
    if (!runtime?.env?.NOTIFICATION_MANAGER) {
        return new Response(JSON.stringify({ error: 'Notification manager not available' }), { status: 500 });
    }

    const { id } = params;
    if (!id) {
        return new Response('ID is required', { status: 400 });
    }

    const doId = runtime.env.NOTIFICATION_MANAGER.idFromName(id);
    const stub = runtime.env.NOTIFICATION_MANAGER.get(doId);

    const message = await request.text();

    // Send the notification to the Durable Object
    await stub.fetch(`http://localhost/notify`, {
        method: 'POST',
        body: message,
    });

    return new Response('Notification sent', { status: 200 });
};
