#!/bin/bash
#
# Vigía de despliegues y limpieza de instancias.
#
# - Si existe `tmp/deploy-restart` (lo deja el deploy), mata las instancias de
#   next-server de la app, despierta a Passenger y escribe `tmp/deploy-done`
#   con el token para que el deploy confirme.
# - Sin trigger, cada 5 minutos limpia instancias viejas: conserva la más
#   reciente y termina las demás solo si tienen más de 30 minutos.
#
# Instalación (una vez):
#   * * * * * /bin/bash /home/USUARIO/podzcash-app/scripts/deploy-watch.sh >/dev/null 2>&1
#
set -u

APP="$(cd "$(dirname "$0")/.." && pwd)"
TRIGGER="$APP/tmp/deploy-restart"
DONE="$APP/tmp/deploy-done"
LOCK="$APP/tmp/deploy-watch.lock"
CLEANUP_STATE="$APP/tmp/deploy-watch-cleanup"
URL="https://podzcash.online/api/health"

# Edad mínima (segundos) para considerar huérfana a una instancia vieja.
ORPHAN_MIN_AGE="${ORPHAN_MIN_AGE:-1800}"
# Cada cuánto corre la limpieza (segundos).
CLEANUP_EVERY="${CLEANUP_EVERY:-300}"

app_instances() {
  for pid in $(pgrep -f '[n]ext-server' 2>/dev/null); do
    cwd=$(readlink "/proc/$pid/cwd" 2>/dev/null)
    [ "$cwd" = "$APP" ] || continue
    age=$(ps -o etimes= -p "$pid" 2>/dev/null | tr -d ' ')
    [ -n "$age" ] && printf '%s %s\n' "$pid" "$age"
  done
}

restart_app() {
  local token="$1"

  for pid in $(app_instances | awk '{print $1}'); do
    kill -TERM "$pid" 2>/dev/null
  done

  sleep 2

  for pid in $(app_instances | awk '{print $1}'); do
    kill -KILL "$pid" 2>/dev/null
  done

  curl -s -o /dev/null --max-time 20 "$URL" || true
  printf '%s\n' "$token" > "$DONE"
}

cleanup_orphans() {
  local list count newest pid age

  list="$(app_instances)"
  count="$(printf '%s' "$list" | grep -c . || true)"

  # Nunca dejar la app sin instancia.
  [ "$count" -le 1 ] && return 0

  # La más nueva se conserva; las viejas solo si superan la edad mínima.
  newest="$(printf '%s\n' "$list" | sort -k2 -n | head -n 1 | awk '{print $1}')"

  printf '%s\n' "$list" | while read -r pid age; do
    [ -z "$pid" ] && continue
    [ "$pid" = "$newest" ] && continue
    [ "$age" -lt "$ORPHAN_MIN_AGE" ] && continue
    kill -TERM "$pid" 2>/dev/null
  done
}

if [ -f "$TRIGGER" ]; then
  mkdir "$LOCK" 2>/dev/null || exit 0
  trap 'rmdir "$LOCK" 2>/dev/null' EXIT

  TOKEN="$(tr -d '\r\n' < "$TRIGGER" 2>/dev/null || true)"
  rm -f "$TRIGGER"

  restart_app "$TOKEN"
  exit 0
fi

now="$(date +%s)"
last="$(cat "$CLEANUP_STATE" 2>/dev/null || echo 0)"

if [ $((now - last)) -ge "$CLEANUP_EVERY" ]; then
  printf '%s' "$now" > "$CLEANUP_STATE"
  cleanup_orphans
fi
