import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import Inspector from "vite-plugin-react-inspector";

export default defineConfig({
  resolve: { tsconfigPaths: true },
  plugins: [
    tailwindcss(),
    Inspector({
      exclude: [],
      toggleButtonVisibility: "always",
      toggleComboKey: "shift-alt",
    }),
  ],
});
