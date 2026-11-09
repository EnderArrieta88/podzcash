#!/bin/bash
#
# Vigía de despliegues.
#
# El workflow de deploy deja `tmp/deploy-restart` cuando el build terminó de
# subir. Este script (que corre por cron cada minuto) mata las instancias de
# next-server de la app y deja que Passenger levante una limpia.
#
# Instalación (una vez):
#   * * * * * /bin/bash /home/USUARIO/podzcash-app/scripts/deploy-watch.sh >/dev/null 2>&1
#
set -u

APP="$(cd "$(dirname "$0")/.." && pwd)"
TRIGGER="$APP/tmp/deploy-restart"
LOCK="$APP/tmp/deploy-watch.lock"
URL="https://podzcash.online/api/health"

[ -f "$TRIGGER" ] || exit 0

# Evita dos ejecuciones simultáneas.
mkdir "$LOCK" 2>/dev/null || exit 0
trap 'rmdir "$LOCK" 2>/dev/null' EXIT

TOKEN="$(tr -d '\r\n' < "$TRIGGER" 2>/dev/null || true)"
rm -f "$TRIGGER"

for pid in $(pgrep -f '[n]ext-server'); do
  cwd=$(readlink "/proc/$pid/cwd" 2>/dev/null)
  [ "$cwd" = "$APP" ] && kill -TERM "$pid" 2>/dev/null
done

sleep 2

for pid in $(pgrep -f '[n]ext-server'); do
  cwd=$(readlink "/proc/$pid/cwd" 2>/dev/null)
  [ "$cwd" = "$APP" ] && kill -KILL "$pid" 2>/dev/null
done

# Despierta a Passenger para que arranque una instancia nueva.
curl -s -o /dev/null --max-time 20 "$URL" || true

# Señal de "listo" para el deploy: el token tiene que coincidir.
printf '%s\n' "$TOKEN" > "$APP/tmp/deploy-done"
