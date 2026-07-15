// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

// Preset selection:
// - Inside the Lovable sandbox: the wrapper forces `cloudflare-module` (ignored here).
// - Outside the sandbox (Render, local prod builds): use `node-server` so the build
//   emits `.output/server/index.mjs` runnable via `node .output/server/index.mjs`.
// The NITRO_PRESET env var overrides this if set.
const nodeServerPreset = process.env.NITRO_PRESET || "node-server";

export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    server: { entry: "server" },
  },
  nitro: {
    preset: nodeServerPreset,
  },
});
