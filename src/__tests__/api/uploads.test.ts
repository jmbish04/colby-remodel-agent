
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST, GET } from '../../pages/api/uploads/index';
import { S3Client } from '@aws-sdk/client-s3';

// Mock the AWS SDK
vi.mock('@aws-sdk/s3-request-presigner', () => ({
  getSignedUrl: vi.fn().mockResolvedValue('https://mocked-signed-url.com'),
}));

vi.mock('@aws-sdk/client-s3');

// Mock Astro context
const mockContext = (env: any, request?: Request) => ({
  locals: {
    runtime: { env },
  },
  request: request || new Request('http://localhost'),
});

describe('Uploads API', () => {
  let mockEnv: any;

  beforeEach(() => {
    mockEnv = {
      UPLOADS: {
        // Mock R2 bucket binding
      },
      CLOUDFLARE_ACCOUNT_ID: 'test-account-id',
      R2_ACCESS_KEY_ID: 'test-access-key-id',
      R2_SECRET_ACCESS_KEY: 'test-secret-access-key',
    };
    vi.clearAllMocks();
  });

  describe('POST /api/uploads', () => {
    it('should return a signed URL for valid requests', async () => {
      const request = new Request('http://localhost/api/uploads', {
        method: 'POST',
        body: JSON.stringify({ filename: 'test.jpg', contentType: 'image/jpeg' }),
        headers: { 'Content-Type': 'application/json' },
      });
      const context = mockContext(mockEnv, request);

      const response = await POST(context as any);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.signedUrl).toBe('https://mocked-signed-url.com');
      expect(data.key).toBeDefined();
    });

    it('should return 400 if filename is missing', async () => {
      const request = new Request('http://localhost/api/uploads', {
        method: 'POST',
        body: JSON.stringify({ contentType: 'image/jpeg' }),
        headers: { 'Content-Type': 'application/json' },
      });
      const context = mockContext(mockEnv, request);

      const response = await POST(context as any);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Filename and contentType are required');
    });
  });

  describe('GET /api/uploads', () => {
    it('should return a list of files', async () => {
        const mockS3Send = vi.fn().mockResolvedValue({
            Contents: [
                { Key: 'file1.jpg', Size: 1024, LastModified: new Date(), ETag: 'etag1' },
                { Key: 'file2.png', Size: 2048, LastModified: new Date(), ETag: 'etag2' },
            ],
        });
        S3Client.prototype.send = mockS3Send;

        const context = mockContext(mockEnv);
        const response = await GET(context as any);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data).toHaveLength(2);
        expect(data[0].key).toBe('file1.jpg');
    });

    it('should return an empty array if no files exist', async () => {
        const mockS3Send = vi.fn().mockResolvedValue({ Contents: [] });
        S3Client.prototype.send = mockS3Send;

        const context = mockContext(mockEnv);
        const response = await GET(context as any);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data).toEqual([]);
    });
  });
});
