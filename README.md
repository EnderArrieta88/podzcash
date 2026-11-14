# PodZcash

[![Release](https://img.shields.io/github/v/release/EnderArrieta88/podzcash)](https://github.com/EnderArrieta88/podzcash/releases)
[![CI](https://github.com/EnderArrieta88/podzcash/actions/workflows/ci.yml/badge.svg)](https://github.com/EnderArrieta88/podzcash/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

Plataforma de podcasts y música para el ecosistema Zcash: cada creador tiene su
canal, publica audio y recibe donaciones directas en ZEC sin custodia.

- **Aplicación:** <https://podzcash.online>
- **Estado:** beta cerrada en producción, por invitación.
- **Idiomas:** español e inglés.
- **Licencia:** [MIT](LICENSE).
- **Repositorio:** <https://github.com/EnderArrieta88/podzcash>

> PodZcash es un proyecto independiente hecho en Venezuela. No está afiliado,
> patrocinado ni respaldado por Zcash Foundation ni por Electric Coin Company.
> Zcash es una marca de Zcash Foundation. Ver [TRADEMARK.md](TRADEMARK.md).

## Qué incluye

- Registro por invitación y sesiones con cookie httpOnly.
- Verificación de email por enlace firmado antes de activar la cuenta.
- Lista de espera para creadores que todavía no tienen invitación, con aviso por email y notificación push en el teléfono.
- Recuperación de contraseña por email con enlaces firmados y caducidad.
- Canales con nombre de usuario, bio, avatar, enlaces y dirección Zcash.
- Subida de audio en streaming, portadas, borradores y publicación.
- Reproductor persistente, búsqueda full-text y reproductor embebible.
- Conteo agregado de reproducciones por episodio, sin cookies.
- Donaciones ZEC con QR y enlace ZIP-321, sin custodia.
- Validación de direcciones transparentes, Sapling y unificadas.
- Feed RSS 2.0 + Podcasting 2.0 por canal, con enlace de apoyo ZEC.
- Panel de creador, invitaciones, moderación, reportes y administración.
- Analítica agregada de descargas, reproducciones y retención, sin cookies.
- Aplicación instalable (PWA) con descargas para escuchar sin conexión.
- Imágenes sociales y metadatos propios por canal y episodio.
- Interfaz bilingüe ES/EN con selector por cookie.

## Stack actual

- **Next.js 16** (App Router), React 19, TypeScript y Tailwind CSS 4.
- **Prisma 7** con SQLite mediante `better-sqlite3`.
- Audio y portadas en disco local (`MEDIA_ROOT`).
- Búsqueda FTS5 en `.data/search.db`.
- Analítica y rate limiting en bases SQLite independientes de la principal.
- Deploy en hosting compartido con Node/Passenger, automatizado por GitHub
  Actions y FTP.

La migración a Postgres, almacenamiento de objetos/CDN y el pipeline de audio
siguen en la hoja de ruta. **Todavía no están implementados.** Los backups y la
monitorización ya están operativos; ver la sección **Operación**.

## Arranque local

Requiere Node.js 22.

```bash
npm ci
cp .env.example .env          # PowerShell: Copy-Item .env.example .env
npx prisma generate
npx prisma migrate dev
npm run dev
```

Abre <http://localhost:3000>.

La **primera cuenta** queda como administradora y no necesita invitación. A
partir de ahí el registro es por invitación; los códigos se generan en
`/estudio/invitaciones`.

### Variables de entorno

| Variable | Uso |
|---|---|
| `DATABASE_URL` | Ruta de SQLite, por ejemplo `file:./prisma/dev.db` |
| `SITE_URL` | Origen público para RSS, embeds y enlaces de email |
| `FEED_OWNER_EMAIL` | Email de propietario en el feed RSS |
| `MEDIA_ROOT` | Carpeta de audio y portadas |
| `SEARCH_DB_PATH` | Ruta del índice FTS5 |
| `AUTH_SECRET` | Firma los enlaces de verificación y recuperación |
| `RESEND_API_KEY` | API key de Resend para emails transaccionales |
| `EMAIL_FROM` | Remitente verificado en Resend |
| `WAITLIST_NOTIFY_EMAIL` | Destino de los avisos de la lista de espera |
| `VAPID_PUBLIC_KEY` | Clave pública para Web Push de los avisos en el teléfono |
| `VAPID_PRIVATE_KEY` | Clave privada de Web Push; no se versiona |
| `VAPID_SUBJECT` | Contacto VAPID, por ejemplo `mailto:hola@podzcash.online` |
| `ANALYTICS_DB_PATH` | Ruta de la base de analítica |
| `ANALYTICS_SALT` | Sal para hashear IP y user agent en analítica |
| `ANALYTICS_TIMEZONE` | Zona horaria para agrupar los días (UTC por defecto) |
| `ANALYTICS_BOT_PATTERNS` | Patrones extra de bots, separados por coma |
| `RATE_LIMIT_DB_PATH` | Ruta de la base del rate limiting |
| `RATE_LIMIT_SALT` | Sal para hashear las claves de rate limiting |
| `CSP_MODE` | `enforce` o `report-only` para la política CSP |

## Comandos

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción |
| `npm run start` | Servidor de producción |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript sin emitir |
| `npm run test` | Tests unitarios con Vitest |
| `npm run format` | Aplica Prettier a todo el proyecto |
| `npm run format:check` | Verifica el formato sin escribir |
| `npm run e2e` | Tests E2E con Playwright (requiere build y Chromium) |
| `npm run e2e:setup` | Recrea la base y los medios aislados de E2E |
| `npm run e2e:server` | Levanta el servidor de E2E en el puerto 3100 |
| `npm run check` | Lint + formato + tipos + tests |
| `npx prisma studio` | Explorador de la base |
| `npx prisma migrate dev --name <nombre>` | Nueva migración |

Los tests E2E corren contra una base y medios aislados. Ver [docs/e2e.md](docs/e2e.md).

## Rutas principales

| Ruta | Qué es |
|---|---|
| `/` | Landing pública |
| `/explorar` | Catálogo y búsqueda (`?q=`, `?tipo=`, `?tag=`) |
| `/proyecto` | Estado, plan y financiamiento del proyecto |
| `/acerca` | Quién construye el proyecto y cómo colaborar |
| `/privacidad` | Política de privacidad |
| `/terminos` | Términos del servicio |
| `/registro` | Crear cuenta con invitación |
| `/entrar` | Iniciar sesión |
| `/estudio` | Panel del creador |
| `/estudio/episodios` | Episodios y borradores |
| `/estudio/episodios/nuevo` | Subir episodio |
| `/estudio/canal` | Crear o editar el canal |
| `/estudio/distribucion` | Feed RSS, instrucciones y embed |
| `/estudio/invitaciones` | Códigos de invitación (admin) |
| `/estudio/admin` | Moderación, cuentas y limpieza (admin) |
| `/canal/@[handle]` | Página pública del canal |
| `/canal/@[handle]/[slug]` | Episodio público |
| `/canal/@[handle]/donar` | Donación con QR y ZIP-321 |
| `/canal/@[handle]/feed.xml` | Feed RSS del canal |
| `/embed/[id]` | Reproductor embebible |
| `/reportar/[id]` | Formulario público de reporte |
| `/api/health` | Estado, versión publicada y commit del build |

Las URLs antiguas `/c/...` redirigen de forma permanente a `/canal/@...`.

## Donaciones

El creador pega su dirección en `/estudio/canal`. La plataforma **nunca toca los
fondos**: solo genera un QR y un enlace ZIP-321.

- Se valida el checksum real de la dirección: Base58Check en `t1`/`t3` y
  Bech32/Bech32m en `zs1`/`u1`.
- Se rechazan direcciones de testnet y Sprout.
- La URI es `zcash:<dirección>?amount=<zec>&memo=<base64url>&message=<texto>`.
- El QR se regenera en el navegador al cambiar monto o memo.
- La plataforma no verifica transacciones ni custodia claves. La verificación
  privacy-preserving de donaciones está en la hoja de ruta.

## Versiones

PodZcash usa [versionado semántico](https://semver.org/lang/es/). Cada release
se etiqueta como `vX.Y.Z`, se publica en
[GitHub Releases](https://github.com/EnderArrieta88/podzcash/releases) y queda
registrado en [CHANGELOG.md](CHANGELOG.md).

El flujo lo automatiza
[release-please](https://github.com/googleapis/release-please) a partir de los
títulos de PR en Conventional Commits. Los detalles están en
[CONTRIBUTING.md](CONTRIBUTING.md).

## Flujo de trabajo

`main` es la rama estable y está protegida. Cada cambio entra por Pull Request:

1. Crear una rama (`feat/`, `fix/`, `i18n/`, `deploy/`, `docs/`).
2. Abrir un PR con la plantilla y un título en Conventional Commits.
3. Pasar **Validar PR** (lint, formato, tipos, tests, build y E2E).
4. Fusionar con Squash.
5. release-please abre un PR de versión; al fusionarlo se crea el tag
   `vX.Y.Z` y la GitHub Release con el changelog.
6. Desplegar manualmente la versión ya etiquetada desde `main`.

El deploy no es automático: se ejecuta desde GitHub Actions → **Deploy a
producción**, escribe `deploy` y requiere aprobación del entorno `production`.
La versión desplegada y el commit se pueden comprobar en `/api/health`.

Los secretos FTP se configuran en GitHub (`FTP_SERVER`, `FTP_USERNAME`,
`FTP_PASSWORD`, `FTP_SERVER_DIR`). El deploy excluye `prisma/dev.db`, `.media`,
`.data`, `.env` y `.htaccess`; los datos de producción no se versionan.

### Deploy automático con vigía

El hosting no permite SSH desde fuera, así que el reinicio se hace con un
**cron vigía** instalado una sola vez:

```
* * * * * /bin/bash /home/hydeonemagazine/podzcash-app/scripts/deploy-watch.sh >/dev/null 2>&1
```

Flujo:

1. El deploy sube el build y verifica su integridad.
2. Deja `tmp/deploy-restart` con un token único.
3. El cron (cada minuto) ejecuta `scripts/deploy-watch.sh`:
   - mata las instancias de `next-server` de la app,
   - despierta a Passenger,
   - escribe `tmp/deploy-done` con el token.
4. El deploy espera ese token y verifica home.

Si el cron no está instalado, el deploy falla con un mensaje explícito. El
script se sube con cada deploy (`scripts/deploy-watch.sh`).

El plan limita la cuenta a **100 procesos/hilos** y cada `next-server` usa
unos 11. El vigía deja una sola instancia; además, `UV_THREADPOOL_SIZE=2` en
las variables de entorno reduce hilos por instancia.

### Reinicio manual (alternativa)

Sin cron, el orden es: cPanel → Setup Node.js App → **Stop App**, ejecutar el
deploy, **Start App** y correr el workflow **Verificar produccion**.

El reinicio automático con `tmp/restart.txt` se retiró a propósito: era lo que
dejaba instancias huérfanas.

Además, en las variables de entorno de la app conviene `UV_THREADPOOL_SIZE=2`
para reducir hilos por instancia. Si la cuenta vuelve a toparse, soporte del
hosting puede terminar las instancias huérfanas y decir cuántas había.

## Operación

- **Backups:** diarios, cifrados y con verificación de SQLite. Ver
  [docs/backups.md](docs/backups.md). Requiere configurar el secreto
  `BACKUP_PASSPHRASE`.
- **Monitorización:** healthcheck cada 15 minutos. Ver
  [docs/monitoring.md](docs/monitoring.md).
- **Email:** verificación de cuenta y recuperación de contraseña con Resend.
  Ver [docs/email.md](docs/email.md).
- **Feed:** campos de canal/episodio, defaults y migración puente. Ver
  [docs/feed.md](docs/feed.md).
- **Analítica:** descargas, agregados diarios, retención y privacidad. Ver
  [docs/analytics.md](docs/analytics.md).
- **Comentarios:** paginación, reportes, cola de moderación y avisos. Ver
  [docs/comentarios.md](docs/comentarios.md).
- **Rate limiting:** persistente en SQLite, claves hasheadas y métricas. Ver
  [docs/rate-limit.md](docs/rate-limit.md).
- **CSP y HSTS:** política global con nonce, reportes y HSTS endurecido. Ver
  [docs/csp.md](docs/csp.md).
- **Cuenta:** exportación de datos y eliminación con reautenticación. Ver
  [docs/cuenta.md](docs/cuenta.md).
- **PWA:** app instalable, service worker, pantalla offline y descargas de audio.
  Ver [docs/pwa.md](docs/pwa.md).
- **App nativa / CarPlay:** ADR con opciones, costes y recomendación. Ver
  [docs/adr/0001-app-nativa.md](docs/adr/0001-app-nativa.md).
- **Reproductor:** cola, siguiente/anterior, temporizador de sueño y
  sincronización de posición entre dispositivos. Ver
  [docs/reproductor.md](docs/reproductor.md).
- **Push:** notificaciones de lista de espera y suscripciones. Ver
  [docs/push.md](docs/push.md).
- **Rendimiento:** línea base, presupuesto y cómo medir. Ver
  [docs/performance.md](docs/performance.md).
- **SEO:** metadatos, imágenes OG, sitemap y JSON-LD. Ver
  [docs/seo.md](docs/seo.md).
- **Migraciones:** esquema, puentes e inventario. Ver
  [docs/migraciones.md](docs/migraciones.md).
- **Decisiones:** registro de ADRs. Ver [docs/adr/README.md](docs/adr/README.md).
- **Staging:** pendiente de un segundo hosting/base de datos.

## Seguridad

- Reportes privados: ver [SECURITY.md](SECURITY.md).
- `security.txt`: `/.well-known/security.txt`.
- Dependencias de producción sin vulnerabilidades conocidas en `npm audit`
  al momento de esta revisión; el tooling de desarrollo puede mostrar avisos.
- Tests unitarios para rutas, ZIP-321, RSS, validación y utilidades.
- Backups diarios cifrados con restauración verificada.
- Monitor de disponibilidad cada 15 minutos.
- Recuperación de contraseña con enlaces firmados y Resend.
- Verificación de email para activar cuentas nuevas.
- Pendientes: auditoría externa y staging (cuando el hosting lo permita).

## Estructura

```text
prisma/
  schema.prisma        Modelo de datos
  migrations/          Historial de migraciones
src/
  app/                 Rutas y páginas
  components/          UI y componentes de cliente
  features/            Dominios migrados: account, admin, analytics, auth, channels,
                       comments, episodes, invites, moderation, playback y waitlist
  lib/db.ts            Cliente Prisma
  lib/version.ts       Versión publicada y commit del build
  lib/health.ts        Conteos del chequeo de salud
  lib/i18n/            Contenido ES/EN
  lib/routes.ts        URLs de canales y episodios
  lib/storage.ts       Abstracción de almacenamiento
  lib/validation.ts    Esquemas Zod y errores localizados
  generated/prisma/    Cliente generado (no se versiona)
.media/                Audio y portadas locales (no se versiona)
.data/                 Índice de búsqueda local (no se versiona)
```

La tabla `WaitlistEntry` se crea sola en la primera solicitud. La migración
equivalente usa `CREATE TABLE IF NOT EXISTS`, así que también funciona en
instalaciones nuevas.

Las reglas de capas, dependencias y ubicación de archivos están en
[ARCHITECTURE.md](ARCHITECTURE.md).

## Contribuir

Lee [CONTRIBUTING.md](CONTRIBUTING.md) y [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md).
Para vulnerabilidades, usa [SECURITY.md](SECURITY.md).

## Hoja de ruta

El plan de producto, estado y financiamiento está en
<https://podzcash.online/proyecto>. La Fase 0 de preparación pública está
documentada en [docs/fase-0.md](docs/fase-0.md).

## Licencia y marca

El código se publica bajo [MIT](LICENSE). El uso del nombre y del dominio se
revisa conforme a la política de marcas de Zcash; ver [TRADEMARK.md](TRADEMARK.md).
