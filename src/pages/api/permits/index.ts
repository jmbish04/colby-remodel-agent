
import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ locals }) => {
    try {
        const db = locals.runtime?.env?.DB;
        if (!db) {
            throw new Error('Database not available');
        }

        // Fetch all permits
        const { results: permits } = await db.prepare("SELECT * FROM permits ORDER BY issue_date DESC").all();

        if (!permits) {
            return new Response(JSON.stringify([]), {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
            });
        }
        
        // Fetch history for all permits in parallel
        const historyStatements = permits.map(permit => 
            db.prepare("SELECT * FROM permit_history WHERE permit_number = ? ORDER BY change_date DESC")
              .bind(permit.permit_number)
        );
        const historyResults = await db.batch(historyStatements);

        // Combine permits with their history
        const permitsWithHistory = permits.map((permit, index) => ({
            ...permit,
            history: historyResults[index].results,
        }));

        return new Response(JSON.stringify(permitsWithHistory), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (error: any) {
        console.error('Permit API Error:', error);
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
};
