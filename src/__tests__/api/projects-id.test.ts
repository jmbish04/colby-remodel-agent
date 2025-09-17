import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createTestDB, cleanupTestDB } from '../utils/test-db';
import type { Miniflare } from 'miniflare';
import { GET, PUT, PATCH, DELETE } from '../../pages/api/projects/[id]';

// Mock the Astro context
const mockContext = (db: any, params: { id: string }, request?: Request) => ({
  locals: {
    runtime: { env: { DB: db } },
  },
  params,
  request: request || new Request(`http://localhost/api/projects/${params.id}`),
});

describe('Projects API: /api/projects/[id]', () => {
  let mf: Miniflare;
  let db: any;
  let projectId: number;

  beforeEach(async () => {
    const testDB = await createTestDB();
    mf = testDB.mf;
    db = testDB.db;

    const result = await db.prepare("INSERT INTO projects (name, description) VALUES ('Test Project', 'A test project')").run();
    projectId = result.meta.last_row_id;
  });

  afterEach(async () => {
    await cleanupTestDB(mf);
  });

  describe('GET /api/projects/[id]', () => {
    it('should return a project by id', async () => {
      const context = mockContext(db, { id: projectId.toString() });
      const response = await GET(context as any);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.id).toBe(projectId);
      expect(data.name).toBe('Test Project');
    });

    it('should return 404 for a non-existent project', async () => {
      const context = mockContext(db, { id: '999' });
      const response = await GET(context as any);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Project not found');
    });
  });

  describe('PUT /api/projects/[id]', () => {
    it('should update a project with valid data', async () => {
      const fullUpdateData = {
        name: 'Updated Project Name',
        description: 'Updated description',
        address: '123 Main St',
        status: 'in_progress',
        start_date: '2025-01-01',
        end_date: '2025-12-31',
        budget_amount: 50000,
        actual_cost: 10000,
        progress_percentage: 20,
      };
      const request = new Request(`http://localhost/api/projects/${projectId}`, {
        method: 'PUT',
        body: JSON.stringify(fullUpdateData),
        headers: { 'Content-Type': 'application/json' },
      });
      const context = mockContext(db, { id: projectId.toString() }, request);
      
      const response = await PUT(context as any);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.name).toBe(fullUpdateData.name);
      expect(data.status).toBe(fullUpdateData.status);
    });

    it('should return 400 for invalid data', async () => {
        const invalidData = { name: '' }; // name is required
        const request = new Request(`http://localhost/api/projects/${projectId}`, {
            method: 'PUT',
            body: JSON.stringify(invalidData),
            headers: { 'Content-Type': 'application/json' },
        });
        const context = mockContext(db, { id: projectId.toString() }, request);

        const response = await PUT(context as any);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.error).toBe('Validation error');
    });
  });

  describe('PATCH /api/projects/[id]', () => {
    it('should partially update a project', async () => {
      const partialUpdateData = { status: 'completed', progress_percentage: 100 };
      const request = new Request(`http://localhost/api/projects/${projectId}`, {
        method: 'PATCH',
        body: JSON.stringify(partialUpdateData),
        headers: { 'Content-Type': 'application/json' },
      });
      const context = mockContext(db, { id: projectId.toString() }, request);

      const response = await PATCH(context as any);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.status).toBe('completed');
      expect(data.progress_percentage).toBe(100);
      expect(data.name).toBe('Test Project'); // Should not change
    });

    it('should return 400 for no fields to update', async () => {
        const emptyData = {};
        const request = new Request(`http://localhost/api/projects/${projectId}`, {
            method: 'PATCH',
            body: JSON.stringify(emptyData),
            headers: { 'Content-Type': 'application/json' },
        });
        const context = mockContext(db, { id: projectId.toString() }, request);

        const response = await PATCH(context as any);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.error).toBe('No fields to update');
    });
  });

  describe('DELETE /api/projects/[id]', () => {
    it('should delete a project successfully', async () => {
      const context = mockContext(db, { id: projectId.toString() });
      const response = await DELETE(context as any);

      expect(response.status).toBe(204);
      expect(await response.text()).toBe('');

      const result = await db.prepare('SELECT * FROM projects WHERE id = ?').bind(projectId).first();
      expect(result).toBeNull();
    });

    it('should return 404 for a non-existent project', async () => {
      const context = mockContext(db, { id: '999' });
      const response = await DELETE(context as any);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Project not found');
    });
  });
});
