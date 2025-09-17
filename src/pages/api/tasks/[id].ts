import type { APIRoute } from 'astro';
import { z } from 'zod';
import * as Sentry from '@sentry/astro';

const taskSchema = z.object({
  project_id: z.number().int().positive('Project ID is required'),
  contractor_id: z.number().int().positive().optional().nullable(),
  title: z.string().min(1, 'Task title is required'),
  description: z.string().optional().nullable(),
  status: z.enum(['pending', 'in_progress', 'completed', 'cancelled']).default('pending'),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  estimated_hours: z.number().positive().optional().nullable(),
  actual_hours: z.number().positive().optional().nullable(),
  estimated_cost: z.number().positive().optional().nullable(),
  actual_cost: z.number().positive().optional().nullable(),
  due_date: z.string().optional().nullable(),
  completed_date: z.string().optional().nullable(),
});

const updateTaskSchema = taskSchema.partial();

export const GET: APIRoute = async ({ params, locals }) => {
  try {
    const db = locals.runtime?.env?.DB;
    if (!db) {
      throw new Error('Database not available');
    }

    const { id } = params;
    if (!id) {
      return new Response(JSON.stringify({ error: 'Task ID is required' }), { status: 400 });
    }

    const stmt = db.prepare(`
      SELECT t.*, p.name as project_name, c.name as contractor_name 
      FROM tasks t
      LEFT JOIN projects p ON t.project_id = p.id
      LEFT JOIN contractors c ON t.contractor_id = c.id
      WHERE t.id = ?
    `);
    const result = await stmt.bind(id).first();

    if (!result) {
      return new Response(JSON.stringify({ error: 'Task not found' }), { status: 404 });
    }

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    Sentry.captureException(error);
    console.error(`GET /api/tasks/[id] error:`, error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }
};

export const PUT: APIRoute = async ({ params, request, locals }) => {
  try {
    const db = locals.runtime?.env?.DB;
    if (!db) {
      throw new Error('Database not available');
    }

    const { id } = params;
    if (!id) {
      return new Response(JSON.stringify({ error: 'Task ID is required' }), { status: 400 });
    }

    const body = await request.json();
    const validatedData = taskSchema.parse(body);

    const stmt = db.prepare(`
      UPDATE tasks
      SET project_id = ?, contractor_id = ?, title = ?, description = ?, status = ?, priority = ?, 
          estimated_hours = ?, actual_hours = ?, estimated_cost = ?, actual_cost = ?, due_date = ?, completed_date = ?
      WHERE id = ?
    `);

    await stmt.bind(
      validatedData.project_id,
      validatedData.contractor_id,
      validatedData.title,
      validatedData.description,
      validatedData.status,
      validatedData.priority,
      validatedData.estimated_hours,
      validatedData.actual_hours,
      validatedData.estimated_cost,
      validatedData.actual_cost,
      validatedData.due_date,
      validatedData.completed_date,
      id
    ).run();
    
    const updatedTask = await db.prepare('SELECT * FROM tasks WHERE id = ?').bind(id).first();

    return new Response(JSON.stringify(updatedTask), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    Sentry.captureException(error);
    console.error(`PUT /api/tasks/[id] error:`, error);
    if (error instanceof z.ZodError) {
      return new Response(JSON.stringify({ error: 'Validation error', details: error.errors }), { status: 400 });
    }
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }
};

export const PATCH: APIRoute = async ({ params, request, locals }) => {
  try {
    const db = locals.runtime?.env?.DB;
    if (!db) {
      throw new Error('Database not available');
    }

    const { id } = params;
    if (!id) {
      return new Response(JSON.stringify({ error: 'Task ID is required' }), { status: 400 });
    }

    const body = await request.json();
    const validatedData = updateTaskSchema.parse(body);

    const fields = Object.keys(validatedData);
    if (fields.length === 0) {
      return new Response(JSON.stringify({ error: 'No fields to update' }), { status: 400 });
    }

    const setClause = fields.map(field => `${field} = ?`).join(', ');
    const values = Object.values(validatedData);

    const stmt = db.prepare(`UPDATE tasks SET ${setClause} WHERE id = ?`);
    await stmt.bind(...values, id).run();

    const updatedTask = await db.prepare('SELECT * FROM tasks WHERE id = ?').bind(id).first();

    return new Response(JSON.stringify(updatedTask), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    Sentry.captureException(error);
    console.error(`PATCH /api/tasks/[id] error:`, error);
    if (error instanceof z.ZodError) {
      return new Response(JSON.stringify({ error: 'Validation error', details: error.errors }), { status: 400 });
    }
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }
};


export const DELETE: APIRoute = async ({ params, locals }) => {
  try {
    const db = locals.runtime?.env?.DB;
    if (!db) {
      throw new Error('Database not available');
    }

    const { id } = params;
    if (!id) {
      return new Response(JSON.stringify({ error: 'Task ID is required' }), { status: 400 });
    }

    const existing = await db.prepare('SELECT id FROM tasks WHERE id = ?').bind(id).first();
    if (!existing) {
      return new Response(JSON.stringify({ error: 'Task not found' }), { status: 404 });
    }

    const stmt = db.prepare('DELETE FROM tasks WHERE id = ?');
    await stmt.bind(id).run();

    return new Response(null, { status: 204 });
  } catch (error) {
    Sentry.captureException(error);
    console.error(`DELETE /api/tasks/[id] error:`, error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }
};