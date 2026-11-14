# ADR 0004: almacenamiento de medios en disco local

- **Fecha:** 13 de noviembre de 2026
- **Estado:** aceptada
- **Contexto:** `src/lib/storage.ts`, `MEDIA_ROOT`

## Contexto

El hosting actual es compartido y no ofrece almacenamiento de objetos. La
plataforma necesita subir audio y portadas sin agregar servicios de pago.

## Decisión

Guardar los medios en el sistema de archivos (`MEDIA_ROOT`) detrás de una
interfaz `StorageAdapter` con `put`, `putStream`, `remove` y `url`.

- La base de datos guarda claves relativas, no URLs absolutas.
- La ruta `/media/[...path]` sirve los archivos con soporte de rangos.
- La exportación de cuenta y los backups incluyen los archivos.

## Consecuencias

- El hosting debe tener espacio suficiente y backups propios.
- No hay CDN ni URLs firmadas; el audio se sirve desde el mismo origen.
- Migrar a S3/R2 implica implementar otro adaptador y cambiar solo `storage`.
- El rendimiento de descargas depende del hosting compartido.
