import type { APIRoute } from 'astro';
import { z } from 'zod';
import * as Sentry from '@sentry/astro';

const projectSchema = z.object({
  name: z.string().min(1, 'Project name is required'),
  description: z.string().optional(),
  address: z.string().optional(),
  status: z.enum(['planning', 'in_progress', 'on_hold', 'completed', 'cancelled']).default('planning'),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  budget_amount: z.number().positive().optional(),
  actual_cost: z.number().default(0),
  progress_percentage: z.number().min(0).max(100).default(0),
});

const updateProjectSchema = projectSchema.partial();

export const GET: APIRoute = async ({ params, locals }) => {
  try {
    const db = locals.runtime?.env?.DB;
    if (!db) {
      throw new Error('Database not available');
    }

    const { id } = params;
    if (!id) {
      return new Response(JSON.stringify({ error: 'Project ID is required' }), { status: 400 });
    }

    const stmt = db.prepare('SELECT * FROM projects WHERE id = ?');
    const result = await stmt.bind(id).first();

    if (!result) {
      return new Response(JSON.stringify({ error: 'Project not found' }), { status: 404 });
    }

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    Sentry.captureException(error);
    console.error(`GET /api/projects/[id] error:`, error);
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
      return new Response(JSON.stringify({ error: 'Project ID is required' }), { status: 400 });
    }

    const body = await request.json();
    const validatedData = projectSchema.parse(body);

    const stmt = db.prepare(`
      UPDATE projects
      SET name = ?, description = ?, address = ?, status = ?, start_date = ?, end_date = ?, budget_amount = ?, actual_cost = ?, progress_percentage = ?
      WHERE id = ?
    `);

    await stmt.bind(
      validatedData.name,
      validatedData.description || null,
      validatedData.address || null,
      validatedData.status,
      validatedData.start_date || null,
      validatedData.end_date || null,
      validatedData.budget_amount || null,
      validatedData.actual_cost,
      validatedData.progress_percentage,
      id
    ).run();
    
    const updatedProject = await db.prepare('SELECT * FROM projects WHERE id = ?').bind(id).first();

    return new Response(JSON.stringify(updatedProject), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    Sentry.captureException(error);
    console.error(`PUT /api/projects/[id] error:`, error);
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
      return new Response(JSON.stringify({ error: 'Project ID is required' }), { status: 400 });
    }

    const body = await request.json();
    const validatedData = updateProjectSchema.parse(body);

    const fields = Object.keys(validatedData);
    if (fields.length === 0) {
      return new Response(JSON.stringify({ error: 'No fields to update' }), { status: 400 });
    }

    const setClause = fields.map(field => `${field} = ?`).join(', ');
    const values = Object.values(validatedData);

    const stmt = db.prepare(`UPDATE projects SET ${setClause} WHERE id = ?`);
    await stmt.bind(...values, id).run();

    const updatedProject = await db.prepare('SELECT * FROM projects WHERE id = ?').bind(id).first();

    return new Response(JSON.stringify(updatedProject), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    Sentry.captureException(error);
    console.error(`PATCH /api/projects/[id] error:`, error);
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
      return new Response(JSON.stringify({ error: 'Project ID is required' }), { status: 400 });
    }

    // Verify project exists
    const existing = await db.prepare('SELECT id FROM projects WHERE id = ?').bind(id).first();
    if (!existing) {
      return new Response(JSON.stringify({ error: 'Project not found' }), { status: 404 });
    }

    const stmt = db.prepare('DELETE FROM projects WHERE id = ?');
    await stmt.bind(id).run();

    return new Response(null, { status: 204 });
  } catch (error) {
    Sentry.captureException(error);
    console.error(`DELETE /api/projects/[id] error:`, error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }
};