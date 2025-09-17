import type { APIRoute } from 'astro';
import { z } from 'zod';
import * as Sentry from '@sentry/astro';

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

const updateContractorSchema = contractorSchema.partial();

export const GET: APIRoute = async ({ params, locals }) => {
  try {
    const db = locals.runtime?.env?.DB;
    if (!db) {
      throw new Error('Database not available');
    }

    const { id } = params;
    if (!id) {
      return new Response(JSON.stringify({ error: 'Contractor ID is required' }), { status: 400 });
    }

    const stmt = db.prepare('SELECT * FROM contractors WHERE id = ?');
    const result = await stmt.bind(id).first();

    if (!result) {
      return new Response(JSON.stringify({ error: 'Contractor not found' }), { status: 404 });
    }

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    Sentry.captureException(error);
    console.error(`GET /api/contractors/[id] error:`, error);
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
      return new Response(JSON.stringify({ error: 'Contractor ID is required' }), { status: 400 });
    }

    const body = await request.json();
    const validatedData = contractorSchema.parse(body);

    const stmt = db.prepare(`
      UPDATE contractors
      SET name = ?, company = ?, phone = ?, email = ?, specialty = ?, hourly_rate = ?, rating = ?, notes = ?, is_active = ?
      WHERE id = ?
    `);

    await stmt.bind(
      validatedData.name,
      validatedData.company || null,
      validatedData.phone || null,
      validatedData.email || null,
      validatedData.specialty || null,
      validatedData.hourly_rate || null,
      validatedData.rating || null,
      validatedData.notes || null,
      validatedData.is_active,
      id
    ).run();
    
    const updatedContractor = await db.prepare('SELECT * FROM contractors WHERE id = ?').bind(id).first();

    return new Response(JSON.stringify(updatedContractor), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    Sentry.captureException(error);
    console.error(`PUT /api/contractors/[id] error:`, error);
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
      return new Response(JSON.stringify({ error: 'Contractor ID is required' }), { status: 400 });
    }

    const body = await request.json();
    const validatedData = updateContractorSchema.parse(body);

    const fields = Object.keys(validatedData);
    if (fields.length === 0) {
      return new Response(JSON.stringify({ error: 'No fields to update' }), { status: 400 });
    }

    const setClause = fields.map(field => `${field} = ?`).join(', ');
    const values = Object.values(validatedData);

    const stmt = db.prepare(`UPDATE contractors SET ${setClause} WHERE id = ?`);
    await stmt.bind(...values, id).run();

    const updatedContractor = await db.prepare('SELECT * FROM contractors WHERE id = ?').bind(id).first();

    return new Response(JSON.stringify(updatedContractor), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    Sentry.captureException(error);
    console.error(`PATCH /api/contractors/[id] error:`, error);
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
      return new Response(JSON.stringify({ error: 'Contractor ID is required' }), { status: 400 });
    }

    const existing = await db.prepare('SELECT id FROM contractors WHERE id = ?').bind(id).first();
    if (!existing) {
      return new Response(JSON.stringify({ error: 'Contractor not found' }), { status: 404 });
    }

    const stmt = db.prepare('DELETE FROM contractors WHERE id = ?');
    await stmt.bind(id).run();

    return new Response(null, { status: 204 });
  } catch (error) {
    Sentry.captureException(error);
    console.error(`DELETE /api/contractors/[id] error:`, error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }
};