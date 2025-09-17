import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createTestDB, cleanupTestDB } from '../utils/test-db';
import type { Miniflare } from 'miniflare';
import { GET, POST } from '../../pages/api/projects/index';

// Mock the Astro context
const mockContext = (db: any, request?: Request) => ({
  locals: {
    runtime: { env: { DB: db } },
  },
  request: request || new Request('http://localhost'),
});

describe('Projects API: /api/projects', () => {
  let mf: Miniflare;
  let db: any;

  beforeEach(async () => {
    const testDB = await createTestDB();
    mf = testDB.mf;
    db = testDB.db;
  });

  afterEach(async () => {
    await cleanupTestDB(mf);
  });

  describe('GET /api/projects', () => {
    it('should return empty array when no projects exist', async () => {
      const context = mockContext(db);
      const response = await GET(context as any);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual([]);
    });

    it('should return all projects', async () => {
      await db.prepare("INSERT INTO projects (name) VALUES ('Test Project 1'), ('Test Project 2')").run();

      const context = mockContext(db);
      const response = await GET(context as any);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveLength(2);
      expect(data[0].name).toBe('Test Project 2'); // Ordered by created_at DESC
      expect(data[1].name).toBe('Test Project 1');
    });
  });

  describe('POST /api/projects', () => {
    it('should create a new project with valid data', async () => {
      const projectData = {
        name: 'New Project',
        description: 'Project description',
        status: 'planning',
        budget_amount: 15000,
      };
      const request = new Request('http://localhost/api/projects', {
        method: 'POST',
        body: JSON.stringify(projectData),
        headers: { 'Content-Type': 'application/json' },
      });

      const context = mockContext(db, request);
      const response = await POST(context as any);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.name).toBe('New Project');
      expect(data.description).toBe('Project description');
      expect(data.id).toBeDefined();
    });

    it('should return 400 for invalid data', async () => {
      const invalidData = { name: '' }; // Name is required
      const request = new Request('http://localhost/api/projects', {
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

    it('should return 500 when database is not available', async () => {
        const projectData = { name: 'Test Project' };
        const request = new Request('http://localhost/api/projects', {
            method: 'POST',
            body: JSON.stringify(projectData),
            headers: { 'Content-Type': 'application/json' },
        });
        const context = {
            request,
            locals: { runtime: { env: {} } } // No DB
        };

        const response = await POST(context as any);
        const data = await response.json();

        expect(response.status).toBe(500);
        expect(data.error).toBe('Database not available');
    });
  });
});
