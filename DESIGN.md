# PodZcash — Sistema de diseño

Documento de referencia para construir la interfaz. La fuente principal son las
referencias guardadas en `C:\podzcash referencias` (mockups de "Z-STREAM" y el
DESIGN.md de "Obsidian Cipher Audio").

## De dónde viene

| Referencia | Qué aportó |
|---|---|
| `obsidian_cipher_audio/DESIGN.md` | Tokens, tipografía, elevación por luminancia, glows, estructura de tres paneles |
| `z_stream_media_player_tipping_lounge` | Pantalla de reproducción + panel de propinas ZEC |
| `z_stream_creator_channel_profile` | Cabecera de canal, stats y muro de apoyo |
| `z_stream_discovery_soundboard_feed` | Feed, chips de filtro y banner de donación |
| `z_stream_creator_studio_upload` | Estudio de subida y metadata |

Se tomó el **lenguaje visual**, no las funcionalidades inventadas de los mockups
(nodos sincronizados, Orchard pool, stems FLAC, IPFS, chat en vivo, royalties
on-chain). PodZcash no tiene nada de eso y la UI no debe insinuarlo.

## Principios

1. **Profundidad con luz, no con sombra.** La jerarquía se hace subiendo un paso
   la luminancia de la superficie.
2. **Ámbar para acción y reproducción.** Es el único color que grita.
3. **Jade solo para privacidad y verificación.** Nunca decorativo.
4. **Vidrio para lo persistente.** Barra de reproducción y headers fijos.
5. **La portada manda.** El cromo desaparece alrededor del contenido.
6. **Todo dato numérico va en mono.** Tiempos, montos, direcciones.

## Color

| Token | Hex | Uso |
|---|---|---|
| `bg` | `#0B0D11` | Lienzo |
| `surface` | `#111317` | Plancha base |
| `surface-2` | `#1A1C20` | Hover, inputs |
| `surface-3` | `#1E2024` | Deck elevado |
| `surface-4` | `#282A2E` | Ítem activo |
| `border` | `#282E3A` | Hairline |
| `border-strong` | `#3A4150` | Separadores fuertes |
| `text` | `#E6E7EC` | Títulos |
| `muted` | `#94A3B8` | Metadata |
| `subtle` | `#64748B` | Terciario |
| `brand` | `#F4B728` | Play, scrubber, CTA, foco |
| `brand-strong` | `#FFC738` | Hover |
| `brand-soft` | `#2A2210` | Fondo teñido ámbar |
| `jade` | `#10B981` | Protegido, verificado, pago confirmado |
| `jade-bright` | `#4EDEA3` | Texto jade sobre oscuro |
| `jade-soft` | `#072B21` | Fondo teñido jade |
| `danger` | `#EF4444` | Error, borrar |

Reglas: nunca jade como decoración; nunca ámbar como relleno de superficies
grandes. Contraste mínimo AA en texto.

## Tipografía

| Rol | Familia | Uso |
|---|---|---|
| UI y títulos | **Plus Jakarta Sans** (600–800, tracking negativo) | Navegación, botones, encabezados de sección |
| Cuerpo | **Inter** (400–500) | Párrafos, descripciones, labels |
| Editorial | **Instrument Serif** (400) | Solo nombres de canal y títulos de episodio |
| Datos | **Space Mono** (400/700, `tabular-nums`) | Tiempos, montos, direcciones `zcash:` |

Escala: display 56/60 · h1 40/48 · h2 28/36 · h3 20/28 · body 16/26 · small
14/22 · caption 12/16 (mayúsculas, tracking 0.1em) · dato 13/16.

La serif no se usa en botones ni etiquetas: es un acento editorial, no la voz
de la interfaz.

## Estructura

Dos mundos separados por layouts:

- **Marketing** (`(site)`): header superior + footer, contenedor centrado. Es la
  landing, el registro y el login.
- **Producto** (`(app)`): shell de tres zonas.

### Shell de producto

```
┌────────────┬──────────────────────────────────┐
│ rail 256px │ top bar 64px (glass, sticky)     │
│            ├──────────────────────────────────┤
│  navegación│ contenido (máx 1400px)           │
│  donaciones│                                  │
│  usuario   │                                  │
└────────────┴──────────────────────────────────┘
        barra de reproducción fija (88px)
```

- Rail: Inicio, Explorar, Mi estudio, Mi canal + tarjeta de donaciones + usuario.
- Top bar: búsqueda global, estado "ZEC sin custodia", botón Subir, avatar.
- En móvil el rail desaparece y la navegación pasa a una fila bajo el top bar.
- La barra del reproductor vive en el layout raíz y nunca se desmonta.

## Componentes

- **Botón primario**: relleno ámbar, texto obsidiana, `rounded-xl`, hover
  `brand-strong` + glow suave.
- **Acción protegida**: borde `jade/30`, fondo `jade-soft`, texto `jade-bright`.
- **Chips**: píldora, `surface-2` + borde. Activo: `brand-soft` + borde ámbar.
- **Badge de estado**: mono, punto pulsante jade.
- **Tarjeta de episodio**: portada cuadrada `rounded-xl` sin sombra, título en
  Jakarta a 2 líneas, canal en `muted`, metadata mono. Play aparece al hover.
- **Fila de audio**: 56px de alto, número mono que se convierte en play, portada
  44px, título + canal, duración mono, chip ZEC.
- **Cabecera de canal**: banner degradado, avatar 96px, nombre en serif 56px,
  chips jade/neutros, CTA "Apoyar" ámbar.
- **Módulo de donación**: QR sobre tarjeta clara, dirección mono, presets,
  memo, "Abrir en wallet" ámbar y confirmación jade.
- **Barra del reproductor**: `glass`, borde superior, portada 44px, play 44px
  con glow ámbar, progreso segmentado, tiempos mono.
- **Estados vacíos**: tono de locución ("Silencio en el estudio"), nunca de
  dashboard.

## Movimiento

- Estándar `240ms` con `cubic-bezier(0.4, 0, 0.2, 1)`.
- Play `180ms`; halo del episodio activo con pulso de `2.4s`.
- Hover de portada: `scale(1.03)` en `500ms`.
- `prefers-reduced-motion` desactiva pulsos y escalas.

## No hacer

- No usar jade para decorar.
- No rellenar superficies grandes con ámbar.
- No poner sombras difusas: solo glows puntuales.
- No usar la serif en botones, chips ni labels.
- No inventar telemetría (nodos, pools, bitrates) que el producto no tiene.
- No romper la reproducción al navegar.
