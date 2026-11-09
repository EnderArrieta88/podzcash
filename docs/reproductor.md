# Reproductor: cola y temporizador

El reproductor vive en la barra inferior y se comparte entre todas las páginas
(`PlayerProvider` en el layout raíz).

## Cola de reproducción

- Se añaden episodios desde su página con **Añadir a la cola** (el mismo botón
  los quita si ya están).
- La cola se ordena a mano con subir/bajar y se puede vaciar desde el panel.
- **Siguiente** y **anterior** funcionan desde la barra y desde los controles
  del sistema (`nexttrack` / `previoustrack` de Media Session).
- Al terminar un episodio se reproduce el siguiente de la cola; si no hay, el
  reproductor se detiene.
- Si la pista actual no está en la cola, "siguiente" empieza por la primera.
- "Anterior" reinicia el episodio actual si ya pasaron más de 3 segundos; si no,
  salta a la pista anterior.
- La cola se guarda en `localStorage` (`podzcash:queue`) y sobrevive a recargas.
  Se validan las pistas restauradas antes de usarlas.

## Temporizador de sueño

- Opciones: **10, 20, 30, 45 y 60 minutos**.
- Mientras está activo, la barra muestra la cuenta atrás (`m:ss`).
- Al llegar a cero, pausa la reproducción y se limpia solo.
- Se puede cancelar desde el mismo panel.
- Se guarda como marca de tiempo (`podzcash:sleep` → `{ "endsAt": ... }`), así
  que sigue corriendo aunque se recargue la página o el navegador ralentice los
  intervals en segundo plano. Un temporizador vencido no se restaura.
- Cerrar el reproductor cancela el temporizador.

## Sincronización entre dispositivos

- Con sesión iniciada, la posición se guarda en el servidor (tabla
  `PlaybackProgress`: usuario + episodio) cada **10 segundos**, al pausar, al
  cerrar el reproductor y al cambiar de episodio. Es best-effort: si falla la
  red, la reproducción sigue.
- Al cargar una pista, el reproductor consulta
  `GET /api/progress?episodeId=...` y aplica la posición **más reciente**. En
  empate gana el servidor.
- No se reanuda si hay menos de 3 segundos escuchados o si está a menos de 5
  segundos del final (se considera terminado).
- Sin sesión, la posición sigue solo en `localStorage` y no se llama a la API.
- Privacidad: se guardan posición y duración, nada más. El historial se borra
  desde **Cuenta → Historial de reproducción** (o `DELETE /api/progress` para
  la sesión actual).
- Límite: 120 guardados cada 10 minutos por usuario.
- La tabla se crea con la migración de Prisma y con la migración puente que
  corre al arrancar (`src/lib/progress-migration.ts`).

## Persistencia

| Clave | Contenido |
|---|---|
| `podzcash:player` | Pista actual, posición, velocidad y `savedAt` (se guarda cada 2 s y al cerrar). |
| `podzcash:queue` | Lista ordenada de pistas de la cola. |
| `podzcash:sleep` | Marca de tiempo del temporizador activo. |

## Atajos

- `Espacio`: reproducir o pausar.
- `←` / `→`: retroceder o avanzar 15 segundos.
- Los atajos se ignoran al escribir en un campo.

## Tests

- `src/lib/player-queue.test.ts`: agregar, quitar, reordenar, siguiente/anterior
  y validación de la cola restaurada.
- `src/lib/sleep-timer.test.ts`: opciones, final, restante, vencimiento y formato.
- `e2e/queue.spec.ts`: agregar, reordenar, persistir tras recarga, navegar con
  siguiente/anterior y temporizador con persistencia y cancelación.
- `e2e/progress-sync.spec.ts`: dos contextos (dos “dispositivos”), borrado del
  historial y uso anónimo con localStorage.
