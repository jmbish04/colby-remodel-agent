type Runtime = import("@astrojs/cloudflare").Runtime<Env>;

declare namespace App {
  interface Locals extends Runtime {
    PROJECT_WORKFLOW: Workflow;
    DB: D1Database;
    PROJECT_KV: KVNamespace;
  }
}
