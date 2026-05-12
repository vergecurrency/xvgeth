import path from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

function normalizeBasePath(basePath?: string) {
  if (!basePath || basePath === "/") {
    return "/";
  }

  const trimmed = basePath.trim().replace(/^\/+|\/+$/g, "");
  return trimmed ? `/${trimmed}/` : "/";
}

export default defineConfig({
  base: normalizeBasePath(process.env.VITE_BASE_PATH),
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
