import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createTestDB, cleanupTestDB } from '../utils/test-db';
import type { Miniflare } from 'miniflare';
import { GET, PUT, PATCH, DELETE } from '../../pages/api/tasks/[id]';

// Mock the Astro context
const mockContext = (db: any, params: { id: string }, request?: Request) => ({
  locals: {
    runtime: { env: { DB: db } },
  },
  params,
  request: request || new Request(`http://localhost/api/tasks/${params.id}`),
});

describe('Tasks API: /api/tasks/[id]', () => {
  let mf: Miniflare;
  let db: any;
  let projectId: number;
  let contractorId: number;
  let taskId: number;

  beforeEach(async () => {
    const testDB = await createTestDB();
    mf = testDB.mf;
    db = testDB.db;

    const projectResult = await db.prepare("INSERT INTO projects (name) VALUES ('Test Project')").run();
    projectId = projectResult.meta.last_row_id;

    const contractorResult = await db.prepare("INSERT INTO contractors (name) VALUES ('Test Contractor')").run();
    contractorId = contractorResult.meta.last_row_id;

    const taskResult = await db.prepare('INSERT INTO tasks (project_id, contractor_id, title) VALUES (?, ?, ?)')
      .bind(projectId, contractorId, 'Test Task').run();
    taskId = taskResult.meta.last_row_id;
  });

  afterEach(async () => {
    await cleanupTestDB(mf);
  });

  describe('GET /api/tasks/[id]', () => {
    it('should return a task by id', async () => {
      const context = mockContext(db, { id: taskId.toString() });
      const response = await GET(context as any);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.id).toBe(taskId);
      expect(data.title).toBe('Test Task');
      expect(data.project_name).toBe('Test Project');
    });

    it('should return 404 for a non-existent task', async () => {
      const context = mockContext(db, { id: '999' });
      const response = await GET(context as any);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Task not found');
    });
  });

  describe('PUT /api/tasks/[id]', () => {
    it('should update a task with valid data', async () => {
      const fullUpdateData = {
        project_id: projectId,
        contractor_id: contractorId,
        title: 'Updated Task Title',
        description: 'Updated description',
        status: 'in_progress',
        priority: 'high',
      };
      const request = new Request(`http://localhost/api/tasks/${taskId}`, {
        method: 'PUT',
        body: JSON.stringify(fullUpdateData),
        headers: { 'Content-Type': 'application/json' },
      });
      const context = mockContext(db, { id: taskId.toString() }, request);
      
      const response = await PUT(context as any);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.title).toBe(fullUpdateData.title);
      expect(data.status).toBe(fullUpdateData.status);
    });
  });

  describe('PATCH /api/tasks/[id]', () => {
    it('should partially update a task', async () => {
      const partialUpdateData = { status: 'completed', priority: 'low' };
      const request = new Request(`http://localhost/api/tasks/${taskId}`, {
        method: 'PATCH',
        body: JSON.stringify(partialUpdateData),
        headers: { 'Content-Type': 'application/json' },
      });
      const context = mockContext(db, { id: taskId.toString() }, request);

      const response = await PATCH(context as any);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.status).toBe('completed');
      expect(data.priority).toBe('low');
      expect(data.title).toBe('Test Task'); // Should not change
    });
  });

  describe('DELETE /api/tasks/[id]', () => {
    it('should delete a task successfully', async () => {
      const context = mockContext(db, { id: taskId.toString() });
      const response = await DELETE(context as any);

      expect(response.status).toBe(204);
      
      const result = await db.prepare('SELECT * FROM tasks WHERE id = ?').bind(taskId).first();
      expect(result).toBeNull();
    });

    it('should return 404 for a non-existent task', async () => {
      const context = mockContext(db, { id: '999' });
      const response = await DELETE(context as any);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Task not found');
    });
  });
});
