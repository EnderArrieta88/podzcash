<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Flujo de trabajo de PodZcash (obligatorio)

1. **Desarrollo y verificación en local.** Todo cambio se hace acá y se valida
   con `npx tsc --noEmit`, `npm run lint` y `npm run build` antes de seguir.
2. **Commit y push a `main`** cuando el cambio está terminado.
3. **Deploy manual y al final.** Solo se despliega cuando no habrá más cambios
   en esa tanda, desde GitHub → Actions → "Deploy a producción" → Run workflow
   → `deploy`. Nunca automático, nunca por cada cambio.

El workflow excluye `prisma/dev.db`, `.media`, `.data`, `.env` y `.htaccess`:
el deploy reemplaza código, no datos.
