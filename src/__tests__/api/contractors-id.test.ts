import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createTestDB, cleanupTestDB } from '../utils/test-db';
import type { Miniflare } from 'miniflare';
import { GET, PUT, PATCH, DELETE } from '../../pages/api/contractors/[id]';

// Mock the Astro context
const mockContext = (db: any, params: { id: string }, request?: Request) => ({
  locals: {
    runtime: { env: { DB: db } },
  },
  params,
  request: request || new Request(`http://localhost/api/contractors/${params.id}`),
});

describe('Contractors API: /api/contractors/[id]', () => {
  let mf: Miniflare;
  let db: any;
  let contractorId: number;

  beforeEach(async () => {
    const testDB = await createTestDB();
    mf = testDB.mf;
    db = testDB.db;

    const result = await db.prepare("INSERT INTO contractors (name, email) VALUES ('Test Contractor', 'test@contractor.com')").run();
    contractorId = result.meta.last_row_id;
  });

  afterEach(async () => {
    await cleanupTestDB(mf);
  });

  describe('GET /api/contractors/[id]', () => {
    it('should return a contractor by id', async () => {
      const context = mockContext(db, { id: contractorId.toString() });
      const response = await GET(context as any);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.id).toBe(contractorId);
      expect(data.name).toBe('Test Contractor');
    });

    it('should return 404 for a non-existent contractor', async () => {
      const context = mockContext(db, { id: '999' });
      const response = await GET(context as any);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Contractor not found');
    });
  });

  describe('PUT /api/contractors/[id]', () => {
    it('should update a contractor with valid data', async () => {
      const fullUpdateData = {
        name: 'Updated Contractor Name',
        company: 'New Company',
        phone: '123-456-7890',
        email: 'updated@contractor.com',
        specialty: 'Electrical',
        hourly_rate: 95.50,
        rating: 4.8,
        notes: 'Very reliable.',
        is_active: true,
      };
      const request = new Request(`http://localhost/api/contractors/${contractorId}`, {
        method: 'PUT',
        body: JSON.stringify(fullUpdateData),
        headers: { 'Content-Type': 'application/json' },
      });
      const context = mockContext(db, { id: contractorId.toString() }, request);
      
      const response = await PUT(context as any);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.name).toBe(fullUpdateData.name);
      expect(data.email).toBe(fullUpdateData.email);
    });

    it('should return 400 for invalid data', async () => {
        const invalidData = { name: 'Test', email: 'not-an-email' };
        const request = new Request(`http://localhost/api/contractors/${contractorId}`, {
            method: 'PUT',
            body: JSON.stringify(invalidData),
            headers: { 'Content-Type': 'application/json' },
        });
        const context = mockContext(db, { id: contractorId.toString() }, request);

        const response = await PUT(context as any);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.error).toBe('Validation error');
    });
  });

  describe('PATCH /api/contractors/[id]', () => {
    it('should partially update a contractor', async () => {
      const partialUpdateData = { company: 'Awesome Builders Inc.', rating: 5 };
      const request = new Request(`http://localhost/api/contractors/${contractorId}`, {
        method: 'PATCH',
        body: JSON.stringify(partialUpdateData),
        headers: { 'Content-Type': 'application/json' },
      });
      const context = mockContext(db, { id: contractorId.toString() }, request);

      const response = await PATCH(context as any);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.company).toBe('Awesome Builders Inc.');
      expect(data.rating).toBe(5);
      expect(data.name).toBe('Test Contractor'); // Should not change
    });
  });

  describe('DELETE /api/contractors/[id]', () => {
    it('should delete a contractor successfully', async () => {
      const context = mockContext(db, { id: contractorId.toString() });
      const response = await DELETE(context as any);

      expect(response.status).toBe(204);
      
      const result = await db.prepare('SELECT * FROM contractors WHERE id = ?').bind(contractorId).first();
      expect(result).toBeNull();
    });

    it('should return 404 for a non-existent contractor', async () => {
      const context = mockContext(db, { id: '999' });
      const response = await DELETE(context as any);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Contractor not found');
    });
  });
});
