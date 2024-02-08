import { unstable_vitePlugin as remix } from "@remix-run/dev";
import { installGlobals } from "@remix-run/node";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
import { remixDevTools } from "remix-development-tools/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

installGlobals();

export default defineConfig({
  optimizeDeps: { exclude: ["@mapbox/node-pre-gyp"] },
  plugins: [
    remixDevTools(),
    remix({
      ignoredRouteFiles: ["**/.*"],
    }),
    tsconfigPaths(),
  ],
});
