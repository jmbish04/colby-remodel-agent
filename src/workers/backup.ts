
interface Env {
    DB: D1Database;
    UPLOADS: R2Bucket;
}

export default {
    async scheduled(controller: ScheduledController, env: Env, ctx: ExecutionContext): Promise<void> {
        console.log("Starting scheduled database backup...");

        try {
            const dump = await env.DB.dump();
            const date = new Date().toISOString().split('T')[0];
            const filename = `backup-${date}.sql`;

            await env.UPLOADS.put(filename, dump);

            console.log(`Database backup successful: ${filename}`);
        } catch (error) {
            console.error("Database backup failed:", error);
            // In a real application, you would want to send an alert here
        }
    },
};
