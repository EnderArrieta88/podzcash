# ADR 0005: migraciones puente en producción

- **Fecha:** 13 de noviembre de 2026
- **Estado:** aceptada con deuda pendiente
- **Contexto:** `src/instrumentation.ts`, `prisma/migrations`, issue #45

## Contexto

La base de producción evolucionó antes de tener un historial de migraciones
completo. Algunas tablas se crearon con SQL idempotente al arrancar para no
romper instalaciones existentes.

## Decisión

- `prisma/schema.prisma` es la fuente de verdad del modelo.
- Las migraciones nuevas viven en `prisma/migrations`.
- Las tablas históricas se crean de forma perezosa e idempotente al arrancar.
- Cualquier tabla nueva debe tener migración y documentarse; no se agregan
  puentes nuevos salvo necesidad de compatibilidad.

## Consecuencias

- Un entorno nuevo funciona sin pasos manuales.
- El historial de migraciones no refleja al 100% la base de producción.
- Unificar SQL crudo y migraciones es deuda de #45, bloqueada por la migración
  a Postgres.
- Antes de migrar a Postgres hay que inventariar tablas y datos reales.
