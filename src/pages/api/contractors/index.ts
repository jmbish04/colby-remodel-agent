import type { APIRoute } from 'astro';
import { z } from 'zod';
import * as Sentry from '@sentry/astro';

// Validation schemas
const contractorSchema = z.object({
  name: z.string().min(1, 'Contractor name is required'),
  company: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional().nullable(),
  specialty: z.string().optional(),
  hourly_rate: z.number().positive().optional().nullable(),
  rating: z.number().min(0).max(5).optional().nullable(),
  notes: z.string().optional(),
  is_active: z.boolean().default(true),
});

export const GET: APIRoute = async ({ locals }) => {
  try {
    const db = locals.runtime?.env?.DB;
    if (!db) {
      throw new Error('Database not available');
    }

    // Get all contractors
    const stmt = db.prepare('SELECT * FROM contractors ORDER BY created_at DESC');
    const result = await stmt.all();
    
    return new Response(JSON.stringify(result.results), {
      status: 200,
      headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    Sentry.captureException(error);
    console.error('GET /api/contractors error:', error);
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
    const validatedData = contractorSchema.parse(body);

    const stmt = db.prepare(`
      INSERT INTO contractors (name, company, phone, email, specialty, hourly_rate, rating, notes, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = await stmt.bind(
      validatedData.name,
      validatedData.company || null,
      validatedData.phone || null,
      validatedData.email || null,
      validatedData.specialty || null,
      validatedData.hourly_rate || null,
      validatedData.rating || null,
      validatedData.notes || null,
      validatedData.is_active
    ).run();

    // Get the created contractor
    const createdContractor = await db.prepare('SELECT * FROM contractors WHERE id = ?')
      .bind(result.meta.last_row_id)
      .first();

    return new Response(JSON.stringify(createdContractor), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    Sentry.captureException(error);
    console.error('POST /api/contractors error:', error);
    
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
