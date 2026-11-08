# Spike: FFmpeg en el hosting actual (#31)

- **Fecha:** 8 de noviembre de 2026
- **Objetivo:** comprobar si el pipeline de audio de #31 puede ejecutarse en el hosting compartido actual.
- **Método:** ruta temporal tokenizada en producción, con FFmpeg del sistema, FFmpeg estático empaquetado, `worker_threads` y un proceso separado.

## Entorno

- Linux x64 (kernel 5.14, Rocky/Alma 9), Node **22.23.4**.
- `cwd`: `/home/hydeonemagazine/podzcash-app`.
- **No hay FFmpeg del sistema** (`ffmpeg: command not found`).
- `ffmpeg-static` **7.0.2** empaquetado funciona; tras `chmod 755` ejecuta y transcodifica.
- `ulimit`: CPU y memoria sin límite por proceso, 1400 procesos, 512k archivos abiertos.
- `worker_threads` funciona.
- Un proceso separado (`detached`, sin HTTP) sobrevivió **45 s** y escribió su archivo. Passenger no lo mató al terminar la petición.

## Rendimiento medido

| Trabajo | Tiempo | Salida |
|---|---:|---:|
| 120 s → MP3 192 kbps | 1,1 s | 2,88 MB |
| 120 s → AAC 160 kbps | 9,0 s | 2,01 MB |
| 120 s → MP3 + loudnorm | 4,4 s | 2,88 MB |
| 600 s → MP3 192 kbps | 5,1 s | 14,4 MB |
| 600 s → AAC 160 kbps | 44,6 s | 10,0 MB |

El coste escala de forma aproximadamente lineal con la duración.

## Conclusión

**Sí es viable en el hosting actual**, con matices:

1. Usar **`ffmpeg-static`** (no hay binario del sistema). Añade ~80 MB al deploy.
2. Resolver el binario con `path.join(process.cwd(), "node_modules", "ffmpeg-static", "ffmpeg")`; el export del paquete devuelve `\ROOT` dentro de Next standalone y no sirve.
3. Aplicar `chmod 755` al binario tras el deploy FTP.
4. Para episodios cortos/medios (hasta ~10 min) el procesamiento **en la petición** es razonable.
5. Para episodios largos (1 h) AAC tarda varios minutos: hace falta un **worker separado** y una cola persistente con reintentos. El proceso separado funciona, pero el hosting no ofrece un scheduler; habría que lanzarlo desde la app y asumir que un reinicio de Passenger puede interrumpirlo.
6. Sigue siendo recomendable un VPS con worker/servicio supervisado (#43/#48) para fiabilidad y escala. Para la beta actual, `ffmpeg-static` + cola en archivo/SQLite + worker detached es suficiente para empezar #31.

## Artefactos

- `ffmpeg-static` se retiró del deploy tras el spike para no cargar ~80 MB innecesarios. Se reincorporará cuando se implemente #31 con VPS o worker supervisado.
- La ruta temporal de diagnóstico se eliminó después del spike.
