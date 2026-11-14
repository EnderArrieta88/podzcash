import "server-only";

type MigrationStep = {
  name: string;
  run: () => Promise<void>;
};

/**
 * Ejecuta todas las migraciones puente de SQLite en orden. Cada paso es
 * idempotente y un fallo no impide que la app arranque.
 */
export async function runSchemaMigrations(): Promise<void> {
  const steps: MigrationStep[] = [
    {
      name: "feed",
      run: async () => {
        const { ensureFeedSchema } = await import("./feed-migration");
        ensureFeedSchema();
      },
    },
    {
      name: "comments",
      run: async () => {
        const { ensureCommentsSchema } = await import("./comments-migration");
        ensureCommentsSchema();
      },
    },
    {
      name: "playback-progress",
      run: async () => {
        const { ensurePlaybackProgressSchema } =
          await import("./progress-migration");
        ensurePlaybackProgressSchema();
      },
    },
  ];

  for (const step of steps) {
    try {
      await step.run();
    } catch (error) {
      console.error(`[instrumentation] No se pudo migrar ${step.name}:`, error);
    }
  }
}
