# PodZcash — Sistema de diseño

Documento de referencia para construir la interfaz. Se lee junto a
`design/references/`, que contiene los sistemas originales de los que se
sintetizó.

## Referencias y qué tomamos de cada una

| Referencia | Aporta | Se descarta |
|---|---|---|
| **Airwave** (`design/references/airwave.md`) | Base completa: superficies cálidas oscuras, ámbar como color corazón, waveform como elemento protagonista, serif editorial para títulos, mono para tiempos, barra de reproducción persistente | El ámbar ajeno; usamos el dorado de Zcash |
| **PodWave** (`design/references/podwave.md`) | Patrones de reproducción: controles tipo píldora, glow del "now playing", mini-player fijo abajo, jerarquía de radios/inputs | La paleta violeta/turquesa y los bordes muy redondeados en todo |
| **Red Broadcast** (`design/references/red-broadcast.md`) | Disciplina de grillas: la portada manda, sin bordes ni sombras en las tarjetas del catálogo, títulos a 2 líneas, metadata compacta "canal · fecha · duración" | El rojo, el modo claro y la densidad de 12px |

**Descartada:** RetroWave (synthwave neón). Es música, sí, pero su lenguaje
maximalista choca con la identidad sobria de Zcash.

## Principios

1. **El audio es el héroe.** La waveform y la portada cargan la identidad; el
   cromo desaparece.
2. **Cálido, no técnico.** Los neutros tiran a marrón, no a gris azulado. Es la
   diferencia entre un estudio de radio de noche y un panel de administración.
3. **El dorado es un escalpelo.** Se usa en reproducción, foco, enlaces y
   acciones primarias. Nunca como relleno de superficies grandes.
4. **La elevación se hace con luz, no con sombra.** Cada nivel sube un paso en
   la escala de superficies. La única sombra permitida es el halo del episodio
   que suena.
5. **Todo lo que es tiempo va en mono.** Duraciones, fechas, capítulos y
   direcciones Zcash: columnas que alinean.

## Color

| Token | Hex | Uso |
|---|---|---|
| `bg` | `#0B0A08` | Fondo de la app |
| `surface` | `#131110` | Tarjetas y paneles |
| `surface-2` | `#1B1815` | Hover, ítems activos, inputs |
| `surface-3` | `#241F1B` | Barra de reproducción, header con scroll |
| `border` | `#2C2723` | Bordes y divisores |
| `border-strong` | `#443C35` | Inputs enfocados, separadores fuertes |
| `text` | `#F5F1E8` | Títulos y cuerpo |
| `muted` | `#A8A099` | Descripciones, metadata |
| `subtle` | `#6B655F` | Fechas, duraciones, contadores |
| `brand` | `#F4B728` | Dorado Zcash: play, scrubber, CTA, foco |
| `brand-strong` | `#FFCC4D` | Hover del dorado |
| `brand-soft` | `#3A2E1C` | Fondo teñido para ítems activos |
| `success` | `#22C55E` | Guardado, publicado |
| `danger` | `#EF4444` | Live, borrar, errores |

Reglas de contraste: `text` sobre `bg` supera 15:1; `muted` sobre `surface`
queda por encima de 6:1. Nunca usar `subtle` para texto que haya que leer.

## Tipografía

- **Display — Instrument Serif (400).** Títulos de canal, de episodio y de
  sección. Es lo que separa a PodZcash de una app técnica.
- **Sans — Inter (400/500/600).** Toda la interfaz, cuerpo y navegación.
- **Mono — JetBrains Mono (400/500).** Tiempos, duraciones, números de
  episodio, direcciones de Zcash y enlaces `zcash:`.

Escala:

| Rol | Tamaño / línea | Notas |
|---|---|---|
| Display | 56/60 | Serif, `-0.02em`, solo hero |
| H1 | 40/48 | Serif |
| H2 | 28/36 | Serif |
| H3 | 20/28 | Sans 600 |
| Body large | 17/28 | Sans |
| Body | 16/26 | Sans |
| Small | 14/22 | Sans |
| Caption | 12/16 | Sans, mayúsculas, tracking `0.1em` |
| Timestamp | 13/16 | Mono, tabular |

## Radios

`2px` barras de waveform · `6px` chips y etiquetas · `10px` botones e inputs ·
`12px` tarjetas · `16px` modales · `999px` botón de play y avatares.

En Tailwind: `rounded-sm` (2px), `rounded-md` (6px), `rounded-[10px]`,
`rounded-xl` (12px), `rounded-2xl` (16px), `rounded-full`.

## Espaciado y grilla

Base 4px. Escala: 4, 8, 12, 16, 24, 32, 48, 64, 96, 128.

- Contenedor máximo: `1280px` (`max-w-6xl` + padding de 20px).
- Grilla de catálogo: columnas mínimas de 260px, `gap` 16px horizontal y 32px
  vertical.
- Fila de episodio: 88px de alto en desktop, 72px en móvil.
- Barra de reproducción: 96px desktop, 72px móvil.

## Componentes clave

### Botón de play
Círculo dorado de 72px (48px en listas, 32px inline) con triángulo oscuro.
Hover: halo `0 0 40px rgba(244,183,40,0.35)`. Activo: pausa + waveform animada.

### Waveform
Barras de 2px con 1px de separación. Antes del cabezal: `brand`. Después:
`border`. Clic para buscar; tooltip mono con el tiempo. Alturas: 120px en la
página del episodio, 80px en la barra, 48px en tarjetas.

### Tarjeta de episodio
Portada 64px (`rounded-md`), número de episodio en mono caption, título en
serif 20px, canal en sans small, duración y fecha en mono `subtle`, play de
48px a la derecha. Si suena, halo dorado.

### Barra de reproducción persistente
Fija abajo, `surface-3`, borde superior `border-strong`. Portada 48px, título +
canal, play 48px, waveform con scrubber, tiempos en mono. La navegación nunca
la interrumpe.

### Cabecera de canal
Portada 240px, título en serif 56px, bio, número de episodios y donación.
Fondo: degradado difuminado desde la portada, teñido de dorado.

### Chip de donación
Píldora `brand-soft` con borde `brand/40`, texto `brand`, una "Z" en círculo
dorado y el monto opcional. En mono cuando lleva cifras.

## Movimiento

- Duración estándar `240ms`, easing `cubic-bezier(0.4, 0, 0.2, 1)`.
- Botón de play: `180ms`.
- Halo del episodio activo: pulso sinusoidal de `2.4s`, amplitud baja.
- Entrada de barras de waveform: escalonado de `16ms`, total `360ms`.
- `prefers-reduced-motion`: reemplazar todo pulso por un borde estático.

## No hacer

- No usar azul ni cian como acento: la paleta es cálida.
- No rellenar superficies grandes con dorado.
- No poner bordes ni sombras a las tarjetas del catálogo.
- No bajar la portada de 48px: la identidad del canal debe reconocerse.
- No usar el serif en etiquetas de UI ni en botones.
- No romper la sensación de que el contenido está "en vivo" cuando suena:
  ningún cambio de ruta debe cortar la reproducción.
