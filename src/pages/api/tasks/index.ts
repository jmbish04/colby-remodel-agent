import type { APIRoute } from 'astro';
import { z } from 'zod';
import * as Sentry from '@sentry/astro';

// Validation schemas
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

export const GET: APIRoute = async ({ request, locals }) => {
  try {
    const db = locals.runtime?.env?.DB;
    if (!db) {
      throw new Error('Database not available');
    }

    const url = new URL(request.url);
    const projectId = url.searchParams.get('project_id');
    const contractorId = url.searchParams.get('contractor_id');

    // Get all tasks with optional filtering
    let query = `
      SELECT t.*, p.name as project_name, c.name as contractor_name 
      FROM tasks t
      LEFT JOIN projects p ON t.project_id = p.id
      LEFT JOIN contractors c ON t.contractor_id = c.id
    `;
    const conditions = [];
    const values = [];

    if (projectId) {
      conditions.push('t.project_id = ?');
      values.push(projectId);
    }

    if (contractorId) {
      conditions.push('t.contractor_id = ?');
      values.push(contractorId);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY t.created_at DESC';

    const stmt = db.prepare(query);
    const result = await stmt.bind(...values).all();
    
    return new Response(JSON.stringify(result.results), {
      status: 200,
      headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    Sentry.captureException(error);
    console.error('GET /api/tasks error:', error);
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
    const validatedData = taskSchema.parse(body);

    // Verify project exists
    const project = await db.prepare('SELECT id FROM projects WHERE id = ?')
      .bind(validatedData.project_id)
      .first();
    
    if (!project) {
      return new Response(
        JSON.stringify({ error: 'Project not found' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Verify contractor exists if provided
    if (validatedData.contractor_id) {
      const contractor = await db.prepare('SELECT id FROM contractors WHERE id = ?')
        .bind(validatedData.contractor_id)
        .first();
      
      if (!contractor) {
        return new Response(
          JSON.stringify({ error: 'Contractor not found' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }
    }

    const stmt = db.prepare(`
      INSERT INTO tasks (project_id, contractor_id, title, description, status, priority, estimated_hours, actual_hours, estimated_cost, actual_cost, due_date, completed_date)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = await stmt.bind(
      validatedData.project_id,
      validatedData.contractor_id || null,
      validatedData.title,
      validatedData.description || null,
      validatedData.status,
      validatedData.priority,
      validatedData.estimated_hours || null,
      validatedData.actual_hours || null,
      validatedData.estimated_cost || null,
      validatedData.actual_cost || null,
      validatedData.due_date || null,
      validatedData.completed_date || null
    ).run();

    // Get the created task with related data
    const createdTask = await db.prepare(`
      SELECT t.*, p.name as project_name, c.name as contractor_name 
      FROM tasks t
      LEFT JOIN projects p ON t.project_id = p.id
      LEFT JOIN contractors c ON t.contractor_id = c.id
      WHERE t.id = ?
    `).bind(result.meta.last_row_id).first();

    return new Response(JSON.stringify(createdTask), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    Sentry.captureException(error);
    console.error('POST /api/tasks error:', error);
    
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
