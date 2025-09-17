import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createTestDB, cleanupTestDB } from '../utils/test-db';
import type { Miniflare } from 'miniflare';
import { GET, POST } from '../../pages/api/contractors/index';

// Mock the Astro context
const mockContext = (db: any, request?: Request) => ({
  locals: {
    runtime: { env: { DB: db } },
  },
  request: request || new Request('http://localhost'),
});

describe('Contractors API: /api/contractors', () => {
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

  describe('GET /api/contractors', () => {
    it('should return empty array when no contractors exist', async () => {
      const context = mockContext(db);
      const response = await GET(context as any);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual([]);
    });

    it('should return all contractors', async () => {
      await db.prepare("INSERT INTO contractors (name) VALUES ('John Doe'), ('Jane Smith')").run();

      const context = mockContext(db);
      const response = await GET(context as any);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveLength(2);
      expect(data[0].name).toBe('Jane Smith');
      expect(data[1].name).toBe('John Doe');
    });
  });

  describe('POST /api/contractors', () => {
    it('should create a new contractor with valid data', async () => {
      const contractorData = {
        name: 'Bob Builder',
        specialty: 'Construction',
        email: 'bob@builder.com',
      };
      const request = new Request('http://localhost/api/contractors', {
        method: 'POST',
        body: JSON.stringify(contractorData),
        headers: { 'Content-Type': 'application/json' },
      });

      const context = mockContext(db, request);
      const response = await POST(context as any);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.name).toBe('Bob Builder');
      expect(data.email).toBe('bob@builder.com');
      expect(data.id).toBeDefined();
    });

    it('should return 400 for invalid data', async () => {
      const invalidData = { email: 'not-an-email' };
      const request = new Request('http://localhost/api/contractors', {
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
  });
});
