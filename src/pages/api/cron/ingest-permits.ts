
import type { APIRoute } from 'astro';
import { PermitIngestionService } from '@/lib/services/permit-ingestion';

export const GET: APIRoute = async ({ locals }) => {
    try {
        const db = locals.runtime?.env?.DB;
        if (!db) {
            throw new Error('Database not available');
        }

        const ingestionService = new PermitIngestionService(db);
        await ingestionService.processPermits();

        return new Response('Permit data ingestion completed successfully.', { status: 200 });

    } catch (error: any) {
        console.error('Permit Ingestion Error:', error);
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
};
