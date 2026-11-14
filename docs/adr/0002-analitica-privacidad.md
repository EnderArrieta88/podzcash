# ADR 0002: analítica propia, agregada y sin cookies

- **Fecha:** 13 de noviembre de 2026
- **Estado:** aceptada
- **Contexto:** docs/analytics.md, `src/features/analytics/`

## Contexto

El creador necesita saber cuántas descargas y reproducciones tiene, sin instalar
un proveedor externo ni rastrear oyentes de forma individual. La plataforma ya
usa SQLite y no tiene presupuesto para un servicio de analítica.

## Decisión

Usar una base SQLite independiente (`.data/analytics.db`) con eventos crudos y
agregados diarios:

- IP y user agent se hashean con una sal diaria; no se guardan en claro.
- Bots, prefetch y rangos no válidos se filtran antes de agregar.
- Los eventos crudos se conservan 90 días y luego se purgan.
- El panel y la exportación leen los agregados, no los eventos individuales.
- La base de analítica no se mezcla con la base principal de Prisma.

## Consecuencias

- No hay cookies de analítica ni seguimiento entre sitios.
- Los números son buenos para tendencias y decisiones de contenido, no para
  atribución publicitaria.
- El backup debe incluir `.data/analytics.db` además de la base principal.
- Si se migra a Postgres, la analítica puede seguir siendo un almacén separado.
