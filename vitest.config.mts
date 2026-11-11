import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
    env: {
      DATABASE_URL: "file:./prisma/test.db",
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(process.cwd(), "src"),
      // En Vitest no existe la condición `react-server`; el marcador de Next
      // lanza al importarse. Se resuelve al módulo vacío para poder probar
      // módulos de servidor sin arrancar un Server Component.
      "server-only": path.resolve(
        process.cwd(),
        "node_modules/next/dist/compiled/server-only/empty.js",
      ),
    },
  },
});
