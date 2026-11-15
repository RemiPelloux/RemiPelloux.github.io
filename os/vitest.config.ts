// Tests run in jsdom (the OS uses localStorage and the DOM). Only the network is faked: tests/setup.ts
// serves the real public catalog from disk to fetch().
import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

export default defineConfig({
  resolve: { alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) } },
  test: { environment: "jsdom", setupFiles: ["tests/setup.ts"], include: ["tests/**/*.test.ts"] },
});
