import type { APIRoute } from 'astro';
import { z } from 'zod';
import * as Sentry from '@sentry/astro';

// Validation schemas
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

export const GET: APIRoute = async ({ locals }) => {
  try {
    const db = locals.runtime?.env?.DB;
    if (!db) {
      throw new Error('Database not available');
    }

    // Get all projects
    const stmt = db.prepare('SELECT * FROM projects ORDER BY created_at DESC');
    const result = await stmt.all();
    
    return new Response(JSON.stringify(result.results), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    Sentry.captureException(error);
    console.error('GET /api/projects error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const db = locals.runtime?.env?.DB;
    if (!db) {
      throw new Error('Database not available');
    }

    const body = await request.json();
    const validatedData = projectSchema.parse(body);

    const stmt = db.prepare(`
      INSERT INTO projects (name, description, address, status, start_date, end_date, budget_amount, actual_cost, progress_percentage)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = await stmt.bind(
      validatedData.name,
      validatedData.description || null,
      validatedData.address || null,
      validatedData.status,
      validatedData.start_date || null,
      validatedData.end_date || null,
      validatedData.budget_amount || null,
      validatedData.actual_cost,
      validatedData.progress_percentage
    ).run();

    // Get the created project
    const createdProject = await db.prepare('SELECT * FROM projects WHERE id = ?')
      .bind(result.meta.last_row_id)
      .first();

    return new Response(JSON.stringify(createdProject), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    Sentry.captureException(error);
    console.error('POST /api/projects error:', error);
    
    if (error instanceof z.ZodError) {
      return new Response(
        JSON.stringify({ error: 'Validation error', details: error.errors }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
