import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { configDefaults } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom", // браузерное окружение
    globals: true, // describe/test/expect без импорта
    setupFiles: "./src/test/setup.js",
    exclude: [...configDefaults.exclude, "**/e2e/**"], // E2E запускает Playwright, а не Vitest
  },
});
