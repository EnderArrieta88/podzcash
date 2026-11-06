# Monitorización

El workflow **Monitor de producción** (`.github/workflows/healthcheck.yml`)
comprueba cada 15 minutos:

- `https://podzcash.online/api/health` responde y devuelve `ok: true`.
- La página de inicio responde correctamente.

Si falla, el workflow queda en rojo. GitHub notifica al propietario según su
configuración de notificaciones de Actions.

## Ejecutar manualmente

GitHub → Actions → **Monitor de producción** → Run workflow.

## Recomendaciones

- Activar notificaciones de Actions para fallos.
- Añadir un servicio externo de uptime (Better Stack, UptimeRobot o similar)
  con alertas por email/Telegram. GitHub Actions no está pensado para
  monitorización en tiempo real y los cron pueden retrasarse.
- Revisar el workflow si cambia el dominio o la ruta de health.

## Staging

Todavía no hay un entorno de staging. Para añadirlo hace falta:

- Un segundo hosting o directorio remoto.
- Una base SQLite independiente.
- Secretos `STAGING_*` separados.
- Un workflow que despliegue solo desde una rama o PR aprobado.

No se implementa todavía para no arriesgar datos de producción.
