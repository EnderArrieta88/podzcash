# PodZcash

Plataforma para que podcasters y músicos del ecosistema Zcash publiquen su
contenido, construyan su canal y reciban donaciones directas en ZEC.

> Estado: **Fase 0 — Fundaciones**. Proyecto en desarrollo local.

## Stack

- **Next.js 16** (App Router) + TypeScript + Tailwind CSS 4
- **Prisma 7** + SQLite (local) → Postgres en producción
- **better-sqlite3** vía driver adapter
- Archivos de audio en disco local (`MEDIA_ROOT`) → Cloudflare R2 en producción

## Arrancar

```bash
npm install
cp .env.example .env      # en PowerShell: Copy-Item .env.example .env
npx prisma migrate dev
npm run dev
```

Abre <http://localhost:3000>. La sección "Estado del proyecto" de la home
muestra si la base de datos responde.

La **primera cuenta** que se registre queda como administradora y no necesita
código. A partir de ahí el registro es por invitación: los códigos se generan
en **/estudio/invitaciones**.

## Rutas

| Ruta | Qué es |
|---|---|
| `/` | Landing pública |
| `/registro` | Crear cuenta (primera vez o con invitación) |
| `/entrar` | Iniciar sesión |
| `/estudio` | Panel del creador |
| `/estudio/episodios` | Lista de episodios |
| `/estudio/episodios/nuevo` | Subir episodio |
| `/estudio/canal` | Crear / editar el canal |
| `/estudio/invitaciones` | Generar códigos (solo admin) |
| `/explorar` | Búsqueda y filtros (`?q=`, `?tipo=`, `?tag=`) |
| `/design` | Laboratorio local del sistema de diseño |
| `/c/[handle]` | Página pública del canal |
| `/c/[handle]/donar` | Donación con QR y ZIP-321 |
| `/c/[handle]/[slug]` | Episodio público |
| `/api/upload?kind=audio\|image` | Subida en streaming (sin cargar en memoria) |
| `/media/[...path]` | Archivos locales con soporte de `Range` |

## Comandos útiles

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción |
| `npm run lint` | ESLint |
| `npx prisma studio` | Explorador visual de la base |
| `npx prisma migrate dev --name <nombre>` | Nueva migración |

## Estructura

```
prisma/
  schema.prisma        Modelo de datos
  migrations/          Historial de migraciones (sí se versiona)
src/
  app/                 Rutas y páginas
  components/          UI
  lib/db.ts            Cliente Prisma (singleton)
  generated/prisma/    Cliente generado (no se versiona)
.media/                Audios y portadas locales (no se versiona)
```

## Principio de arquitectura

Todo lo que en producción será un servicio externo vive detrás de una
interfaz, para migrar sin reescribir:

| Hoy (local) | Mañana (producción) |
|---|---|
| SQLite | Postgres |
| Disco local (`MEDIA_ROOT`) | Cloudflare R2 |
| Sesión con cookie propia | Magic link / OAuth |
| QR + enlace ZIP-321 | Watcher de UFVK |

## Reproductor

El reproductor vive en el layout raíz, así que **la reproducción no se corta
al navegar** entre páginas.

| Acción | Cómo |
|---|---|
| Play / pausa | Botón dorado o `Espacio` |
| ±15 s | Flechas `←` / `→` (o los botones de la barra) |
| Velocidad | Botón `1×` (cicla 1 → 1.25 → 1.5 → 2 → 0.8) |
| Posición | Clic o arrastre sobre la barra de progreso |
| Continuar | Se guarda en `localStorage` cada 2 s y al cerrar la pestaña |

La barra de progreso son 64 segmentos sobre la línea de tiempo, no una
waveform de amplitud: dibujar la onda real requiere extraer picos del audio en
el servidor (transcodificación) o decodificar el archivo completo en el
navegador, y ninguna de las dos es viable todavía.

## Búsqueda

El índice full-text (FTS5) vive en `.data/search.db`, **fuera de la base que
gestiona Prisma**: las tablas virtuales de FTS aparecen como deriva en
`prisma migrate dev` y bloquean las migraciones.

- Se actualiza al publicar, editar o borrar un episodio, y al renombrar un canal.
- Si el archivo se borra o está vacío, se reconstruye solo en la primera
  búsqueda.
- Para forzar un reindexado: borra `.data/search.db` y busca de nuevo.

## Donaciones

El creador pega su dirección en `/estudio/canal`. La plataforma **nunca toca
los fondos**: solo genera un QR y un enlace ZIP-321.

- Se valida el checksum real de la dirección: **Base58Check** en `t1`/`t3` y
  **Bech32/Bech32m** en `zs1`/`u1`. Se rechazan direcciones de testnet y Sprout.
- La URI es
  `zcash:<dirección>?amount=<zec>&memo=<base64url>&message=<texto>`.
- El memo va en base64url sin padding, como define ZIP-321.
- El QR se regenera en el navegador al cambiar monto o memo.

## Despliegue en hosting compartido (cPanel + Node.js Selector)

El proyecto compila como bundle autónomo (`output: "standalone"`) para correr en
un hosting con Node, sin VPS.

1. **Build para Linux** (el servidor es Linux, así que el bundle se genera en
   WSL para que `better-sqlite3` traiga el binario correcto):
   ```bash
   rsync -a --exclude node_modules --exclude .next --exclude .git \
     --exclude .media --exclude .data /mnt/c/PodZcash/ ~/podzcash-build/
   cd ~/podzcash-build && npm ci && npx prisma generate && npm run build
   ```
2. **Armar el bundle**: copiar `.next/standalone`, `.next/static`, `public`,
   `prisma/dev.db`, `.media` y `.env` a una carpeta y comprimirla desde dentro
   (`zip -qr ../app.zip .`) para que `server.js` quede en la raíz.
3. **cPanel → Node.js → Create Application**:
   - Versión: Node 22
   - Modo: Production
   - Application root: `podzcash` (fuera de `public_html`)
   - Application URL: el dominio o subdominio
   - Application startup file: `server.js`
4. Subir el ZIP a esa carpeta, extraerlo y reiniciar la app.
5. Variables (opcionales si va el `.env`):
   `DATABASE_URL=file:./prisma/dev.db`, `MEDIA_ROOT=./.media`,
   `SEARCH_DB_PATH=./.data/search.db`.
6. Activar AutoSSL para HTTPS.

La app necesita permisos de escritura en `prisma/`, `.media/` y `.data/`.

## Fases

- [x] **Fase 0** — Fundaciones: proyecto, base de datos, diseño base
- [x] **Fase 1** — Cuentas, invitaciones y canales
- [x] **Fase 2** — Subida de audio y estudio del creador
- [x] **Fase 3** — Reproductor persistente y páginas de episodio
- [x] **Fase 4** — Descubrimiento y búsqueda
- [x] **Fase 5** — Donaciones ZEC (QR + ZIP-321)
- [ ] **Fase 6** — RSS y embeds
- [ ] **Fase 7** — Administración y moderación
- [ ] **Fase 8** — Despliegue
