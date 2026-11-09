# Comentarios, reportes y avisos

Los comentarios de episodio son públicos, requieren sesión y se moderan con
reportes. Esta página describe el modelo y las reglas operativas.

## Reglas de publicación

- Solo usuarios autenticados. El texto va de 2 a 600 caracteres.
- Rate limit: 5 comentarios cada 10 minutos por usuario.
- Un comentario solo se puede crear en un episodio publicado.
- Autor, dueño del canal y admin pueden borrarlo. Al borrar se cierran sus
  reportes abiertos.
- Al publicar, el autor vuelve a la primera página de comentarios para ver su
  comentario, que aparece arriba.

## Paginación

- La lista se ordena del más reciente al más antiguo.
- 20 comentarios por página, con enlaces `?comentarios=<n>`.
- El total se muestra en el encabezado; no se pierden comentarios al pasar de
  100.

## Reportes de comentarios

- Cualquier usuario autenticado puede reportar un comentario ajeno desde el
  episodio (`/reportar/comentario/<id>`), con motivo y detalles opcionales.
- No se puede reportar el propio comentario ni duplicar un reporte abierto del
  mismo usuario.
- Rate limit: 10 reportes por hora por usuario.
- El reporte usa la tabla `Report` con `targetType = "comment"` y guarda
  `reporterId` (usuario) sin exponerlo en la página pública.
- En `/estudio/admin` el admin ve el comentario, el motivo, el reporte y quién
  lo reportó. Puede **eliminar el comentario** (resuelve todos sus reportes
  abiertos) o **descartar** el reporte.

## Avisos al creador

- `/estudio/comentarios` es la bandeja interna: todos los comentarios de los
  episodios del canal, paginados, con enlace al episodio y borrado directo.
- El menú del estudio muestra un contador de comentarios nuevos (de otros
  usuarios) desde la última visita. La visita marca `Channel.commentsSeenAt`.
- Preferencia por canal en `Channel.commentNotify`:
  - `inbox` (por defecto): solo bandeja interna.
  - `email`: además envía un email por comentario al correo del canal
    (`Channel.ownerEmail` o el email de la cuenta). Requiere `RESEND_API_KEY`.
  - `off`: sin avisos (la bandeja sigue disponible).
- Los emails son best-effort: si fallan, el comentario queda publicado y el
  aviso sigue en la bandeja.

## Migración en producción

El deploy no ejecuta `prisma migrate deploy`. `src/lib/comments-migration.ts`
agrega al arrancar, de forma idempotente:

- `Channel.commentNotify` y `Channel.commentsSeenAt`.
- `Report.reporterId`.
- La tabla `EpisodeComment` y sus índices si no existen.

La migración de Prisma equivalente mantiene al día las instalaciones nuevas y
los entornos de test.
