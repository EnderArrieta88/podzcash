# Spike: audio en segundo plano (#67)

Prototipo autocontenido para validar reproducción en segundo plano y controles
del sistema con APIs web. No usa archivos externos ni red: genera un WAV de
120 segundos en el navegador.

## Cómo probarlo en escritorio

Desde la raíz del repo:

```bash
python -m http.server 4173 --directory docs/spike-native
```

Y abrir <http://localhost:4173/background-audio.html>.

1. Pulsar **Reproducir**.
2. Cambiar a otra pestaña y esperar unos segundos.
3. Volver: el tiempo tiene que haber avanzado.
4. Revisar el log: `mediaSession` disponible, handlers registrados.

## Cómo probarlo en el móvil

Media Session necesita un contexto seguro (HTTPS) o `localhost`. Opciones:

- Servir el archivo desde el sitio desplegado (por ejemplo, copiarlo a
  `public/spike/` de forma temporal) y abrirlo en el teléfono.
- Usar un túnel HTTPS (`cloudflared tunnel`, `ngrok`) apuntando al servidor
  local.

Pasos:

1. Reproducir.
2. Bloquear la pantalla o cambiar de app.
3. Comprobar que el audio sigue y que aparecen los controles (título, play,
   pausa, siguiente/anterior si el sistema los muestra).
4. En iOS, repetir con el modo de bajo consumo activado.

## Qué demuestra y qué no

- **Sí:** que un solo `<audio>` con Media Session puede reproducir en segundo
  plano y exponer controles del sistema.
- **No:** que eso sea suficiente para CarPlay o Android Auto. Esas integraciones
  requieren app nativa, entitlement de Apple y `MediaBrowserService` de Android.
- **No:** que el comportamiento sea idéntico en todos los navegadores; iOS es el
  caso más variable y hay que probarlo en dispositivo real.

Los resultados de la prueba se registran en
[`docs/adr/0001-app-nativa.md`](../adr/0001-app-nativa.md).
