# Rendimiento

Línea base y presupuesto de carga de las rutas principales.

## Cómo medir

```powershell
npm run build
npm run e2e:server      # en otra terminal, puerto 3100
npm run perf
```

El script mide transferencia de JS, CSS, imágenes y total, además de LCP y CLS
en Chromium. Se puede apuntar a otro origen con `PERF_BASE_URL` y elegir rutas
con `PERF_PATHS`.

## Línea base (13/11/2026, local)

| Ruta | JS | Total | LCP | CLS |
|---|---:|---:|---:|---:|
| `/` | 164 KB | 586 KB | 1,4 s | 0 |
| `/explorar` | 177 KB | 2,1 MB | 0,2 s | 0 |
| `/canal/@e2e-canal` | 177 KB | 314 KB | 0,2 s | 0 |
| Episodio | 181 KB | 318 KB | 0,2 s | 0 |

La home incluye la imagen principal con `fetchPriority="high"`. En explorar el
total lo dominan las portadas; se añadió `loading="lazy"` y `decoding="async"`
a las tarjetas, aunque con pocos episodios todas caben en el viewport y se
descargan igual.

## Presupuesto

- **JS por ruta:** ≤ 200 KB de transferencia.
- **LCP:** ≤ 2,5 s en una conexión 4G razonable.
- **CLS:** ≤ 0,1.
- **Imágenes:** cargar solo las visibles o cercanas al viewport.

Los números locales sirven para comparar tendencias, no como promesa de red
real. Antes de publicar un cambio grande conviene repetir la medición.

## Decisiones aplicadas

- Fuentes con `display: "swap"` para evitar texto invisible.
- Imagen principal de la home prioritaria; el resto diferido.
- Portadas de tarjetas, filas y estudio con carga diferida.
- Audio servido con soporte de rangos y caché inmutable.
