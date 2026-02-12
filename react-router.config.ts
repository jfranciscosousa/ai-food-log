import { vercelPreset } from "@vercel/react-router/vite";
import type { Config } from "@react-router/dev/config";

export default {
  // Keep SSR true to allow API routes (like tRPC handler) to exist
  // We're using CSR patterns (tRPC) for data fetching, not React Router loaders
  ssr: true,
  future: {
    unstable_optimizeDeps: true,
  },
  presets: [vercelPreset()],
} satisfies Config;
