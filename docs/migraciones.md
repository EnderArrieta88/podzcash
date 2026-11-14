# Migraciones y esquema

El deploy no ejecuta `prisma migrate deploy`. La base de producción se
actualiza al arrancar el proceso con migraciones puente idempotentes.

## Fuente de verdad

- `prisma/schema.prisma` define el modelo.
- `prisma/migrations` mantiene el historial para instalaciones nuevas.
- `src/instrumentation.ts` ejecuta `runSchemaMigrations()` al arrancar.
- `src/lib/schema-migrations.ts` agrupa los pasos en orden.

## Migraciones puente

| Paso | Archivo | Qué agrega |
|---|---|---|
| feed | `src/lib/feed-migration.ts` | Columnas de feed, GUID y numeración de episodios |
| comments | `src/lib/comments-migration.ts` | Avisos de comentarios, autor de reportes y tabla `EpisodeComment` |
| playback-progress | `src/lib/progress-migration.ts` | Tabla `PlaybackProgress` e índice por usuario |

Cada paso abre la base, agrega solo lo que falta y cierra. Se pueden ejecutar
varias veces sin duplicar datos.

## Pruebas

- `comments-migration.test.ts`, `feed-migration.test.ts` y
  `progress-migration.test.ts` verifican columnas y idempotencia.
- `schema-migrations.test.ts` ejecuta todos los pasos juntos dos veces.

## Pendiente

- Eliminar el SQL crudo y unificar todo en migraciones de Prisma es parte de
  #45 y depende de la migración a Postgres.
- Cualquier tabla nueva debe añadirse a `prisma/migrations` y, si necesita
  compatibilidad con producción, documentarse aquí.
