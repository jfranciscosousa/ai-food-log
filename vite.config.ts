// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import tailwindcss from "@tailwindcss/vite";
import { reactRouter } from "@react-router/dev/vite";
import { defineConfig } from "vite";
import Inspector from "vite-plugin-react-inspector";

export default defineConfig({
  resolve: { tsconfigPaths: true },
  plugins: [
    tailwindcss(),
    reactRouter(),
    Inspector({
      // Only enable in development
      exclude: [],
      // Hold `Shift` + `Alt/Option` and click any component to jump to the source
      toggleButtonVisibility: "always",
      toggleComboKey: "shift-alt",
    }),
  ],
});
