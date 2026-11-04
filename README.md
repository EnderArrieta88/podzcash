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
| `/estudio/canal` | Crear / editar el canal |
| `/estudio/invitaciones` | Generar códigos (solo admin) |
| `/c/[handle]` | Página pública del canal |
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

## Fases

- [x] **Fase 0** — Fundaciones: proyecto, base de datos, diseño base
- [x] **Fase 1** — Cuentas, invitaciones y canales
- [ ] **Fase 2** — Subida de audio y estudio del creador
- [ ] **Fase 3** — Reproductor y páginas de episodio
- [ ] **Fase 4** — Descubrimiento y búsqueda
- [ ] **Fase 5** — Donaciones ZEC (QR + ZIP-321)
- [ ] **Fase 6** — RSS y embeds
- [ ] **Fase 7** — Administración y moderación
- [ ] **Fase 8** — Despliegue
