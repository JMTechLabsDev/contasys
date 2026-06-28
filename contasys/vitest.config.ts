import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname),
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    include: ["**/*.test.{ts,tsx}"],
    setupFiles: ["./lib/__tests__/setup.ts"],
  },
  define: {
    "process.env.APP_ENCRYPTION_KEY": JSON.stringify("abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890"),
  },
});
