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
    const { runSchemaMigrations } = await import("./lib/schema-migrations");
    await runSchemaMigrations();
  } catch (error) {
    console.error(
      "[instrumentation] No se pudieron ejecutar las migraciones:",
      error,
    );
  }
}
