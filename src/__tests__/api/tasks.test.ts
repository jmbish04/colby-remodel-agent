import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createTestDB, cleanupTestDB } from '../utils/test-db';
import type { Miniflare } from 'miniflare';
import { GET, POST } from '../../pages/api/tasks/index';

// Mock the Astro context
const mockContext = (db: any, request: Request) => ({
  locals: {
    runtime: { env: { DB: db } },
  },
  request,
});

describe('Tasks API: /api/tasks', () => {
  let mf: Miniflare;
  let db: any;
  let projectId: number;
  let contractorId: number;

  beforeEach(async () => {
    const testDB = await createTestDB();
    mf = testDB.mf;
    db = testDB.db;

    const projectResult = await db.prepare("INSERT INTO projects (name) VALUES ('Test Project')").run();
    projectId = projectResult.meta.last_row_id;

    const contractorResult = await db.prepare("INSERT INTO contractors (name) VALUES ('Test Contractor')").run();
    contractorId = contractorResult.meta.last_row_id;
  });

  afterEach(async () => {
    await cleanupTestDB(mf);
  });

  describe('GET /api/tasks', () => {
    it('should return empty array when no tasks exist', async () => {
      const request = new Request('http://localhost/api/tasks');
      const context = mockContext(db, request);
      const response = await GET(context as any);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual([]);
    });

    it('should return all tasks', async () => {
      await db.prepare('INSERT INTO tasks (project_id, title) VALUES (?, ?), (?, ?)')
        .bind(projectId, 'Task 1', projectId, 'Task 2').run();

      const request = new Request('http://localhost/api/tasks');
      const context = mockContext(db, request);
      const response = await GET(context as any);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveLength(2);
    });

    it('should filter tasks by project_id', async () => {
        const project2Result = await db.prepare("INSERT INTO projects (name) VALUES ('Project 2')").run();
        const project2Id = project2Result.meta.last_row_id;
        await db.prepare('INSERT INTO tasks (project_id, title) VALUES (?, ?), (?, ?)')
          .bind(projectId, 'Task P1', project2Id, 'Task P2').run();
  
        const request = new Request(`http://localhost/api/tasks?project_id=${projectId}`);
        const context = mockContext(db, request);
        const response = await GET(context as any);
        const data = await response.json();
  
        expect(response.status).toBe(200);
        expect(data).toHaveLength(1);
        expect(data[0].title).toBe('Task P1');
      });
  });

  describe('POST /api/tasks', () => {
    it('should create a new task with valid data', async () => {
      const taskData = {
        project_id: projectId,
        contractor_id: contractorId,
        title: 'New Task',
      };
      const request = new Request('http://localhost/api/tasks', {
        method: 'POST',
        body: JSON.stringify(taskData),
        headers: { 'Content-Type': 'application/json' },
      });

      const context = mockContext(db, request);
      const response = await POST(context as any);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.title).toBe('New Task');
      expect(data.project_id).toBe(projectId);
      expect(data.id).toBeDefined();
    });

    it('should return 400 for invalid data', async () => {
      const invalidData = { project_id: projectId }; // Title is required
      const request = new Request('http://localhost/api/tasks', {
        method: 'POST',
        body: JSON.stringify(invalidData),
        headers: { 'Content-Type': 'application/json' },
      });

      const context = mockContext(db, request);
      const response = await POST(context as any);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Validation error');
    });

    it('should return 400 for non-existent project_id', async () => {
        const taskData = { project_id: 999, title: 'Task for non-existent project' };
        const request = new Request('http://localhost/api/tasks', {
            method: 'POST',
            body: JSON.stringify(taskData),
            headers: { 'Content-Type': 'application/json' },
        });

        const context = mockContext(db, request);
        const response = await POST(context as any);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.error).toBe('Project not found');
    });
  });
});
