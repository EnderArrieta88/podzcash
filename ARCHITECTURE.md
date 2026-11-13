# Arquitectura de PodZcash

Esta página explica cómo está organizado el código y qué reglas seguir al añadir
o mover piezas. La estructura ideal es **por funcionalidades**, pero el proyecto
está en una migración incremental: hoy conviven capas técnicas con carpetas de
dominio.

## Stack

- Next.js 16 con App Router y Turbopack.
- React 19, TypeScript estricto y Tailwind 4.
- Prisma 7 sobre SQLite con `better-sqlite3`.
- Vitest para tests unitarios y Playwright para E2E.
- Resend para email y Web Push para avisos en el teléfono.

## Estructura actual

```text
src/
  app/                 rutas, layouts, páginas, route handlers y acciones
  components/          UI agrupada por dominio (auth, player, studio…)
    ui/                primitivas reutilizables (Button, Field, Copy…)
  features/            dominios migrados a feature-based (comments, auth, waitlist, episodes, channels, account, invites, admin)
  lib/                 lógica de dominio, consultas, utilidades y acceso a datos
    auth/              sesión, guardas, contraseñas y tokens
    i18n/              contenido ES/EN con tipos derivados del español
  proxy.ts             CSP y cabeceras de seguridad
  instrumentation.ts   migraciones puente al arrancar
docs/                  documentación funcional y operativa
prisma/                esquema y migraciones
e2e/                   pruebas de extremo a extremo
```

## Reglas de dependencia

Dirección deseada:

```text
app        → features, components, lib
features   → components, lib
components → lib y features
lib        → lib
```

Reglas concretas:

1. `app` solo compone rutas y páginas. No debe contener lógica de negocio
   reutilizable.
2. `components` no importa desde `app`. Si un componente necesita una acción,
   esa acción debe vivir en `lib` o, cuando exista, en `features`.
3. `lib` no importa desde `app` ni desde `components`.
4. Un dominio no debería depender de archivos internos de otro dominio.
5. Los módulos de servidor llevan `import "server-only"`. Así un componente
   cliente no puede arrastrarlos al bundle por error.

### Deuda conocida

- La migración de acciones y componentes está completa para los dominios
  principales (`comments`, `auth`, `waitlist`, `episodes`, `channels`,
  `account`, `invites`, `admin`, `moderation`, `playback`). Las páginas de administración,
  canal, episodio, estudio, reportes, exportación de cuenta y portada delegan en
  sus `queries.ts`.
- `lib/auth` se mantiene como infraestructura de sesión, tokens y contraseñas.
- Ningún archivo de `app` importa Prisma directamente: todo pasa por
  `features/*/queries.ts` o `lib/*`.
- Hay módulos grandes que conviene dividir: `player-context.tsx`.

Mientras se migra, la regla práctica es:

- **Código nuevo**: si pertenece a un dominio claro, crear
  `src/features/<dominio>/` con `components/`, `actions.ts`, `queries.ts`,
  `schemas.ts` y `types.ts`.
- **Código existente**: no moverlo sin un PR específico y sin ejecutar
  `npm run check && npm run build && npm run e2e`.

## Capas

### Presentación

- `src/app/**/page.tsx`, `layout.tsx` y `src/components/**`.
- Marcado, estilos y estado de interacción.
- No accede a Prisma ni a variables de servidor.
- `"use client"` solo en componentes con interactividad, preferiblemente hojas
  del árbol.

### Lógica de negocio

- `src/lib/**` y, a futuro, `src/features/<dominio>/**`.
- Reglas de dominio, validación, permisos y casos de uso.
- Los cálculos puros se separan de la persistencia para poder testearlos.

### Acceso a datos

- `src/lib/db.ts` es el único cliente Prisma.
- Las consultas deben vivir en módulos de consulta (`catalog.ts`,
  `comments.ts`, `features/analytics/`) o en `queries.ts` de cada feature.
- Las escrituras van en `actions.ts` con `"use server"`.
- Los route handlers solo orquestan; la lógica reutilizable va a `lib`.

## Validación

- Todo lo que entra por una Server Action o un route handler se valida en el
  borde.
- Zod es el estándar. Los tipos se derivan con `z.infer` cuando haga falta.
- Los mensajes de error se localizan con `src/lib/i18n`.
- `src/lib/env.ts` valida las variables de entorno del servidor.

## Servidor y cliente

- Server Components por defecto.
- `server-only` en `db`, auth, analytics, email, storage, búsqueda, rate limit,
  medios y migraciones.
- Nunca pasar secretos ni objetos de Prisma a un componente cliente.
- Las acciones que se importan desde un cliente deben estar en archivos con
  `"use server"`.

## Nombres e idioma

- Archivos en `kebab-case`.
- Componentes en `PascalCase`; funciones y variables en `camelCase`.
- Identificadores de código en inglés.
- Textos de producto en español e inglés a través de `src/lib/i18n`.
- Comentarios solo para explicar decisiones o excepciones, no para repetir el
  código.

## Base de datos y migraciones

- `prisma/schema.prisma` es la fuente de verdad del modelo.
- Las migraciones viven en `prisma/migrations`.
- Por el historial de producción existen migraciones puente en
  `src/instrumentation.ts` y creación perezosa de algunas tablas. Es una
  excepción temporal: cualquier tabla nueva debe documentarse y, si es posible,
  añadirse también como migración idempotente.

## Tests y validación

```bash
npm run check        # lint + tipos + tests unitarios
npm run build
npm run e2e          # requiere build y Chromium
```

- Tests unitarios junto al módulo (`*.test.ts`).
- E2E en `e2e/`.
- El CI ejecuta lint, tipos, unitarios, build y E2E.

## Formato

- Prettier es la referencia de formato.
- `npm run format` escribe; `npm run format:check` solo verifica.
- ESLint cubre reglas de Next, React y TypeScript.

## Dónde poner cada cosa

| Necesidad | Ubicación |
|---|---|
| Nueva ruta o página | `src/app/...` |
| Componente de un dominio | `src/features/<dominio>/components` o `src/components/<dominio>` mientras se migra |
| Acción de escritura | `actions.ts` del dominio, con `"use server"` |
| Consulta de lectura | `queries.ts` del dominio o `src/lib/<dominio>.ts` |
| Esquema de validación | `schemas.ts` o `src/lib/validation.ts` |
| Utilidad compartida | `src/lib/utils.ts` o `src/components/ui` |
| Texto de interfaz | `src/lib/i18n/<área>.ts` |
| Documentación operativa | `docs/` |

## Principio general

Si para entender una funcionalidad hay que abrir más de tres carpetas sin
relación evidente, esa funcionalidad es candidata a moverse a `src/features/`.
