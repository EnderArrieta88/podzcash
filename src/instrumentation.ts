/**
 * Migraciones puente de SQLite.
 *
 * Se ejecutan al arrancar el proceso (el deploy no corre `prisma migrate
 * deploy`). Si una falla, se registra y la app sigue arrancando: es preferible
 * un error visible en la página a un proceso que no responde.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  try {
    const { ensureFeedSchema } = await import("./lib/feed-migration");
    ensureFeedSchema();
  } catch (error) {
    console.error("[instrumentation] No se pudo migrar el feed:", error);
  }

  try {
    const { ensureCommentsSchema } = await import("./lib/comments-migration");
    ensureCommentsSchema();
  } catch (error) {
    console.error("[instrumentation] No se pudo migrar los comentarios:", error);
  }

  try {
    const { ensurePlaybackProgressSchema } = await import(
      "./lib/progress-migration"
    );
    ensurePlaybackProgressSchema();
  } catch (error) {
    console.error(
      "[instrumentation] No se pudo migrar el progreso de reproducción:",
      error,
    );
  }
}
