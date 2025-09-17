
import type { APIRoute } from 'astro';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { S3Client, PutObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';

export const GET: APIRoute = async ({ locals }) => {
  try {
    const runtime = locals.runtime;
    if (!runtime?.env?.UPLOADS) {
      return new Response(JSON.stringify({ error: 'R2 bucket not available' }), { status: 500 });
    }

    const { env } = runtime;

    const s3 = new S3Client({
      region: 'auto',
      endpoint: `https://${env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: env.R2_ACCESS_KEY_ID,
        secretAccessKey: env.R2_SECRET_ACCESS_KEY,
      },
    });

    const command = new ListObjectsV2Command({
      Bucket: 'colby-remodel-agent-uploads',
    });

    const { Contents } = await s3.send(command);
    const files = Contents?.map(file => ({
        key: file.Key,
        size: file.Size,
        lastModified: file.LastModified,
        eTag: file.ETag,
    })) || [];

    return new Response(JSON.stringify(files), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error listing files:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }
}

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const runtime = locals.runtime;
    if (!runtime?.env?.UPLOADS) {
      return new Response(JSON.stringify({ error: 'R2 bucket not available' }), { status: 500 });
    }

    const body = await request.json();
    const { filename, contentType } = body;

    if (!filename || !contentType) {
      return new Response(JSON.stringify({ error: 'Filename and contentType are required' }), { status: 400 });
    }

    const { env } = runtime;
    const r2 = env.UPLOADS;

    const s3 = new S3Client({
      region: 'auto',
      endpoint: `https://${env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: env.R2_ACCESS_KEY_ID,
        secretAccessKey: env.R2_SECRET_ACCESS_KEY,
      },
    });

    const key = `${uuidv4()}-${filename}`;

    const command = new PutObjectCommand({
      Bucket: 'colby-remodel-agent-uploads',
      Key: key,
      ContentType: contentType,
    });

    const signedUrl = await getSignedUrl(s3, command, { expiresIn: 3600 });

    return new Response(JSON.stringify({ signedUrl, key }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error generating signed URL:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }
};
