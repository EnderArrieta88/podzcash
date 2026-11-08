# Campos del feed

Los canales y episodios guardan los datos que luego usa el RSS. Se editan en **Mi estudio → Mi canal** y **Mi estudio → Episodios → Editar**.

## Canal

| Campo | Valores | Uso |
|---|---|---|
| `feedLanguage` | Código BCP-47, por defecto `es` | `<language>` del RSS. |
| `feedCategory` | Categoría de Apple Podcasts, por defecto `Technology` | `<itunes:category>`. |
| `feedExplicit` | Booleano, por defecto `false` | `<itunes:explicit>` del canal. |
| `ownerEmail` | Email opcional | `itunes:owner` y `podcast:locked owner`. Si está vacío se usa el email del proyecto. No se publica el email de la cuenta. |
| `block` | Booleano, por defecto `false` | Emite `<itunes:block>` cuando es verdadero. |
| `newFeedUrl` | URL opcional | Emite `<itunes:new-feed-url>` para migraciones. |

El `podcast:guid` es un UUID v5 estable derivado del ID interno del canal. No se guarda en la base: se calcula siempre igual.

## Episodio

| Campo | Valores | Uso |
|---|---|---|
| `season` | Entero opcional | `<itunes:season>`. |
| `episodeNumber` | Entero positivo opcional | `<itunes:episode>`; si falta se usa el orden del feed. |
| `episodeType` | `full`, `trailer`, `bonus` | `<itunes:episodeType>`. |
| `explicit` | `true`, `false` o vacío | `<itunes:explicit>` del episodio; vacío hereda el canal. |

Si un episodio no tiene `episodeNumber`, se le asigna el siguiente número libre al guardarlo. La migración puente también numera los episodios existentes una sola vez.

## Autodiscovery y artwork

La página del canal y la del episodio declaran el feed con `<link rel="alternate" type="application/rss+xml">`.

La portada de un episodio se valida al subirla: JPG o PNG, cuadrada, RGB y entre 1400 y 3000 px. Un archivo inválido se rechaza con un error localizado y no se usa en el feed.

## Validación en CI

`src/lib/feed-xml.test.ts` genera dos feeds de prueba, los compara con snapshots y valida XML, iTunes y los tags obligatorios (GUID, enclosure, pubDate, language, category, artwork). `e2e/feed.spec.ts` valida el feed real de la base E2E y el autodiscovery de la página. Ambos corren en CI.

## Migración

La migración de Prisma está en `prisma/migrations/2026110800001_campos_feed/`.

Como el deploy actual no ejecuta `prisma migrate deploy` contra la base de producción, `src/instrumentation.ts` ejecuta una migración puente idempotente al arrancar el servidor (`src/lib/feed-migration.ts`). Agrega solo las columnas que faltan en SQLite, antes de que la app atienda peticiones. La migración de Prisma mantiene al día las instalaciones nuevas.

> Nota: si más adelante se corre `prisma migrate deploy` contra una base que ya fue migrada por instrumentación, hay que reconciliar el historial (marcar la migración como aplicada) para evitar el error de columna duplicada. Esto se resolverá al migrar a Postgres en #44.
