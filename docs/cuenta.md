# Cuenta: exportación y eliminación

## Exportar datos

`GET /estudio/cuenta/exportar` (solo con sesión) descarga un JSON con:

- cuenta: id, email, nombre, rol, estado y fechas (nunca el hash de contraseña),
- canal: datos públicos, feed y enlaces, con sus episodios (metadatos, sin audio),
- comentarios propios,
- progreso de reproducción por episodio,
- invitaciones creadas y la invitación usada,
- sesiones (id y fechas, sin tokens),
- reportes enviados y solicitudes de lista de espera con ese email.

No incluye datos de otras personas ni contenido de otros usuarios. La respuesta
lleva `Cache-Control: no-store` y `Content-Disposition: attachment`. Hay un
límite de 5 exportaciones por hora.

## Eliminar la cuenta

Desde **Estudio → Cuenta → Eliminar cuenta**:

1. Se exige la **contraseña actual** (reatenticación).
2. Se exige escribir el **email exacto** de la cuenta.
3. Se exige marcar que la acción es permanente.
4. Las cuentas con rol `admin` no pueden eliminarse desde aquí (evita dejar la
   plataforma sin administración).

### Qué se borra

- Usuario, sesiones e invitaciones usadas/creadas (la relación se anula).
- Canal, episodios, etiquetas, comentarios del usuario y comentarios de otros en
  sus episodios (cascade).
- Progreso de reproducción.
- Archivos de audio, portadas, avatar y banner.
- Eventos y agregados de analítica de sus episodios.
- Entradas del índice de búsqueda.
- Solicitudes de lista de espera con ese email.

### Qué se conserva

- **Reportes de moderación** enviados por el usuario: se mantienen para el
  historial, pero se anonimizan (`reporterId` y `reporterEmail` a null).
- **Invitaciones**: las usadas por la cuenta y las no usadas creadas por ella se
  eliminan (para que el código usado no quede reutilizable); las usadas por
  terceros se conservan con el creador anulado.
- **Copias de seguridad cifradas**: se sobrescriben en el ciclo habitual; no se
  editan selectivamente. Ver [docs/backups.md](backups.md).
- **Donaciones en ZEC**: son transacciones on-chain; no se pueden borrar.
- **Analítica agregada sin PII** de otras cuentas.

El borrado de la base es transaccional; si falla, no se elimina nada y se
muestra un error. Los efectos secundarios (archivos, índice, analítica) son
best-effort: si fallan, la cuenta ya está borrada y el admin puede limpiar
huérfanos.

## Tests

- `e2e/account.spec.ts`: exportación completa, errores de contraseña y
  confirmación, borrado, canal 404, usuario eliminado, reporte anonimizado y
  archivo de audio eliminado.
- El E2E usa un usuario/canal/episodio dedicados para no afectar al resto.
