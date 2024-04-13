import { vitePlugin as remix } from "@remix-run/dev";
import { installGlobals } from "@remix-run/node";
import { remixDevTools } from "remix-development-tools";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

installGlobals();

export default defineConfig({
  optimizeDeps: { exclude: ["@mapbox/node-pre-gyp"] },
  plugins: [
    remixDevTools(),
    remix({
      ignoredRouteFiles: ["**/.*", "*.disabled"],
    }),
    tsconfigPaths(),
  ],
});
