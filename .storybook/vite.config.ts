import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import Inspector from "vite-plugin-react-inspector";

export default defineConfig({
  plugins: [
    tailwindcss(),
    tsconfigPaths(),
    Inspector({
      exclude: [],
      toggleButtonVisibility: "always",
      toggleComboKey: "shift-alt",
    }),
  ],
});
