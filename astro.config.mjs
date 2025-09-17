// @ts-check
import { defineConfig } from "astro/config";
import cloudflare from "@astrojs/cloudflare";
import react from "@astrojs/react";
import tailwind from "@astrojs/tailwind";
import sentry from "@sentry/astro";

// https://astro.build/config
export default defineConfig({
  adapter: cloudflare({
    platformProxy: {
      enabled: true,
      configPath: "wrangler.toml",
      persist: {
        path: "./.cache/wrangler/v3",
      },
    },
  }),
  integrations: [react(), tailwind({ applyBaseStyles: true }), sentry()],
  output: "server",
  vite: {
    resolve: {
      // Use react-dom/server.edge instead of react-dom/server.browser for React 19.
      // Without this, MessageChannel from node:worker_threads needs to be polyfilled.
      alias: import.meta.env.PROD && {
        "react-dom/server": "react-dom/server.edge",
      },
    },
  },
});
