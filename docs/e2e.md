# Tests E2E

Smoke tests de Playwright para los flujos críticos de PodZcash. Corren contra una base SQLite y un `MEDIA_ROOT` aislados; nunca tocan la base ni los medios de desarrollo o producción.

## Qué cubren

- Login.
- Edición de canal y rechazo de direcciones Zcash transparentes.
- Creación de un episodio en borrador, publicación y apertura de la página pública.
- Comentario en un episodio.
- Reproductor y reproductor embebible.

## Requisitos

- Node 22.
- Dependencias instaladas (`npm ci` o `npm install`).
- Navegador de Playwright:

```powershell
npx playwright install chromium
```

## Ejecutar en local

```powershell
npm run build
npm run e2e
```

El `webServer` de Playwright se encarga de:

1. Borrar y recrear `prisma/e2e.db`, `.media-e2e` y `.data-e2e`.
2. Aplicar las migraciones de Prisma.
3. Crear el usuario, canal y episodio de prueba.
4. Arrancar `next start` en `http://127.0.0.1:3100`.

Para ver el reporte:

```powershell
npx playwright show-report
```

## Ejecutar en CI

El workflow `.github/workflows/ci.yml` instala Chromium y ejecuta `npm run e2e` después del build. Si falla, sube `playwright-report/` y `test-results/` como artefacto durante 7 días.

## Aislamiento

| Recurso | Ruta |
|---|---|
| Base de datos | `prisma/e2e.db` |
| Medios | `.media-e2e/` |
| Índice de búsqueda | `.data-e2e/search.db` |

Esas rutas están en `.gitignore` y se regeneran en cada ejecución.

## Credenciales de prueba

- Email: `e2e@podzcash.local`
- Contraseña: `e2e-password-123`

Solo existen en la base E2E.

## Agregar un test

1. Crear o editar un archivo `e2e/*.spec.ts`.
2. Usar `test` y `expect` de `@playwright/test`.
3. Reutilizar el helper `login` o crear datos propios.
4. Evitar depender de IDs aleatorios: el episodio base es `e2e_episode` y el canal `e2e-canal`.

Los tests corren en serie (`workers: 1`) porque comparten la misma base.
