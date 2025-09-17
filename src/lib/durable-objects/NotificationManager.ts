
export class NotificationManager {
    state: DurableObjectState;
    sessions: WebSocket[] = [];
    
    constructor(state: DurableObjectState) {
        this.state = state;
    }

    async fetch(request: Request) {
        const url = new URL(request.url);
        const path = url.pathname;

        if (path.endsWith('/websocket')) {
            const { 0: client, 1: server } = new WebSocketPair();
            await this.handleSession(server);
            return new Response(null, { status: 101, webSocket: client });
        }
        
        if (path.endsWith('/notify') && request.method === 'POST') {
            const message = await request.text();
            this.broadcast(message);
            return new Response('Notification sent', { status: 200 });
        }

        return new Response('Not found', { status: 404 });
    }

    async handleSession(ws: WebSocket) {
        this.sessions.push(ws);
        ws.accept();

        ws.addEventListener('message', async (msg) => {
            // For now, we just broadcast any message received
            this.broadcast(msg.data);
        });

        ws.addEventListener('close', () => {
            this.sessions = this.sessions.filter(session => session !== ws);
        });

        ws.addEventListener('error', (err) => {
            console.error('WebSocket error:', err);
            this.sessions = this.sessions.filter(session => session !== ws);
        });
    }

    broadcast(message: string | ArrayBuffer) {
        this.sessions.forEach(session => {
            try {
                session.send(message);
            } catch (error) {
                console.error('Failed to send message to a WebSocket:', error);
                // Remove broken session
                this.sessions = this.sessions.filter(s => s !== session);
            }
        });
    }
}
