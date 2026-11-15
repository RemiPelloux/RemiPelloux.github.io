// RIVIERA.OS builds into /riviera/, the folder GitHub Pages serves. The built files are committed:
// the site has no deploy step, and the pre-commit hook rebuilds when os/ changes.
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";

export default defineConfig({
  plugins: [react()],
  resolve: { alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) } },
  base: "/riviera/",
  build: {
    outDir: "../riviera",
    emptyOutDir: true,
    target: "es2022",
    chunkSizeWarningLimit: 1200,
    rollupOptions: {
      output: {
        // three.js and the 3D scene load only in 3D mode; the OS itself stays small.
        manualChunks: (id) => (id.includes("node_modules/three") || id.includes("@react-three") ? "three" : undefined),
      },
    },
  },
});
