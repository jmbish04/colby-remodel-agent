
import type { APIRoute } from 'astro';
import { getCalendarService } from '@/lib/services/google-calendar';
import { api } from '@/lib/services/api';

export const GET: APIRoute = async ({ locals }) => {
    try {
        const calendarService = getCalendarService(locals.runtime?.env);
        const db = locals.runtime?.env?.DB;

        if (!db) {
            throw new Error('Database not available');
        }

        // 1. Fetch all tasks with due dates from the database
        const { results: tasks } = await db.prepare("SELECT * FROM tasks WHERE due_date IS NOT NULL").all();

        if (!tasks || tasks.length === 0) {
            return new Response('No tasks with due dates to sync.', { status: 200 });
        }

        // In a real application, you would store the google calendar event id in your database
        // to update events instead of creating new ones. For this example, we'll just create new events.

        for (const task of tasks) {
            const eventDetails = {
                summary: task.title,
                description: task.description || 'No description provided.',
                start: {
                    dateTime: `${task.due_date}T09:00:00-07:00`, // Assuming a default time
                    timeZone: 'America/Los_Angeles',
                },
                end: {
                    dateTime: `${task.due_date}T10:00:00-07:00`, // Assuming a 1-hour duration
                    timeZone: 'America/Los_Angeles',
                },
            };

            await calendarService.createEvent(eventDetails);
        }

        return new Response('Calendar sync completed successfully.', { status: 200 });

    } catch (error: any) {
        console.error('Calendar Sync Error:', error);
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
};
