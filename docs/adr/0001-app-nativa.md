# ADR 0001: app nativa, CarPlay y Android Auto

- **Fecha:** 9 de noviembre de 2026
- **Estado:** propuesta (pendiente de revisión del mantenedor)
- **Contexto:** épica #62, issue #67
- **Decisores:** mantenedor del proyecto

## 1. Contexto

PodZcash funciona como PWA instalable: reproduce audio, guarda descargas,
mantiene la cola y sincroniza la posición. Lo que no cubre bien:

- **CarPlay** y **Android Auto** no existen para una PWA.
- **Reproducción en segundo plano** depende del navegador y del sistema; en iOS
  se interrumpe en algunos escenarios y no hay controles de auto.
- **Notificaciones** y descargas en segundo plano no son confiables.
- La integración con el sistema (audio focus, interrupciones de llamadas,
  botones del coche) es limitada.

La decisión a tomar no es “¿app nativa sí o no?” sino **cuándo y con qué
tecnología**, porque una app nativa agrega cuentas de tienda, revisión,
mantenimiento de dos plataformas y un pipeline de builds distinto.

## 2. Requisitos

### Funcionales

- Catálogo, canal y episodio con el mismo contenido que la web.
- Inicio de sesión y cuenta.
- Reproducción en segundo plano con controles del sistema.
- Cola, siguiente/anterior y temporizador de sueño.
- Descargas offline y gestión de espacio.
- Continuar donde quedó (sincronización ya existe en la web).
- Donaciones en ZEC (fuera de la app o mediante enlace).

### No funcionales

- iOS 16+ y Android 10+ como mínimo razonable.
- Publicación en App Store y Google Play.
- Sin servidores nuevos obligatorios: la app consume la API y el RSS actuales.
- Privacidad: sin trackers de terceros; datos mínimos.
- Builds reproducibles desde CI.

## 3. Opciones evaluadas

### A. PWA actual (statu quo)

| Aspecto | Resultado |
|---|---|
| Reutilización | 100 % del código web |
| Reproducción en segundo plano | Buena en Android; limitada/inconsistente en iOS |
| CarPlay | No |
| Android Auto | No |
| Tiendas | No requiere |
| Coste | 0 |
| Mantenimiento | Uno solo |

Es la opción más barata y ya está en producción. Sigue siendo la base del
producto.

### B. Wrapper con Capacitor

Empaqueta la web actual en un WebView nativo.

| Aspecto | Resultado |
|---|---|
| Reutilización | Alta (la UI web se mantiene) |
| Reproducción en segundo plano | Requiere plugin nativo de audio; el WebView solo no alcanza en iOS |
| CarPlay | Módulo nativo Swift (CarPlay framework) |
| Android Auto | `MediaBrowserService` + `MediaSession` nativos |
| Tiendas | App Store + Google Play |
| Coste | Medio |
| Riesgo | El WebView puede sentirse “web”; hay que resolver auth, deep links y descargas |

### C. React Native

| Aspecto | Resultado |
|---|---|
| Reutilización | Baja: hay que reconstruir pantallas |
| Reproducción en segundo plano | `react-native-track-player` resuelve audio, cola y controles |
| CarPlay | Librerías comunitarias limitadas; probablemente módulo nativo |
| Android Auto | Módulo nativo o librería comunitaria |
| Tiendas | App Store + Google Play |
| Coste | Alto |
| Riesgo | Duplicar producto y mantener dos bases de código |

### D. Nativa pura (Swift + Kotlin)

| Aspecto | Resultado |
|---|---|
| Reutilización | Ninguna |
| Reproducción en segundo plano | La mejor |
| CarPlay | Soporte nativo completo (con entitlement de Apple) |
| Android Auto | Soporte nativo completo |
| Tiendas | App Store + Google Play |
| Coste | Muy alto (dos apps) |
| Riesgo | Equipo y presupuesto; dos ciclos de release |

### E. Híbrido: PWA + app nativa mínima

La web sigue siendo el producto; una app nativa pequeña cubre solo
reproducción, descargas y auto.

| Aspecto | Resultado |
|---|---|
| Reutilización | Media: se comparte API y RSS, no la UI |
| CarPlay / Android Auto | Nativos y completos |
| Tiendas | Sí |
| Coste | Medio-alto |
| Riesgo | Dos experiencias que mantener |

## 4. Requisitos de tienda

### Apple App Store

- **Cuenta:** Apple Developer Program, **99 USD/año**.
- **Hardware/CI:** los builds requieren macOS/Xcode. Se puede usar un Mac
  propio o CI macOS (GitHub Actions macOS, EAS Build, Codemagic).
- **Privacidad:** política de privacidad, App Privacy details y borrado de
  cuenta desde la app si hay creación de cuentas.
- **Audio en segundo plano:** declarar `UIBackgroundModes: audio` y configurar
  `AVAudioSession` en categoría playback.
- **CarPlay:** solicitar el **CarPlay entitlement** a Apple. Las apps de audio
  califican, pero la aprobación no es automática (semanas). Sin entitlement no
  se puede publicar CarPlay.
- **Login:** si se ofrecen logins de terceros, Apple puede exigir Sign in with
  Apple.
- **Donaciones:** revisar la política 3.1.1. Enlazar a una página externa de
  donaciones puede interpretarse como pago por contenido digital; conviene
  abrir la página de apoyo en el navegador y no vender nada dentro de la app.
- **Revisión:** tiempos típicos de 1–3 días, con rechazos posibles por
  metadatos, privacidad o compras.

### Google Play

- **Cuenta:** **25 USD pago único**.
- **Data safety** y política de privacidad.
- **Android Auto:** una app de medios implementa `MediaBrowserService` y
  `MediaSession`; Google revisa y aprueba la categoría de auto. No usa la Car
  App Library (esa es para navegación/POI).
- **Segundo plano:** Android 14+ exige el tipo de servicio
  `mediaPlayback` y el permiso `FOREGROUND_SERVICE_MEDIA_PLAYBACK`; Android 13+
  requiere permiso de notificaciones para el control de reproducción.
- **Target API:** mantener el nivel exigido por Google cada año.
- **Revisión:** 1–7 días; las apps de auto suelen tardar más.

### Costes recurrentes

- Apple 99 USD/año + Google 25 USD una vez.
- CI macOS (si no hay Mac): decenas de USD/mes según minutos.
- Posible asesoría legal para donaciones y privacidad.

## 5. Prototipo de reproducción en segundo plano

Se incluye un prototipo mínimo y autocontenido en
[`docs/spike-native/background-audio.html`](spike-native/background-audio.html).
Genera un WAV en el navegador (sin archivos externos), registra Media Session y
permite probar play/pausa, siguiente/anterior y bloqueo de pantalla.

Instrucciones de prueba en [`docs/spike-native/README.md`](spike-native/README.md).

Resultados:

- **Chromium de escritorio (verificado):** el prototipo genera un WAV de 120 s,
  reproduce y el tiempo avanza; `navigator.mediaSession.metadata` queda con
  título y artista, `playbackState` pasa a `playing`, “siguiente” cambia de
  pista sin detener el audio y no hay errores de consola.
- **Cambio de pestaña en escritorio:** no se automatizó. Chrome mantiene el
  audio de un `<audio>` al pasar a otra pestaña; la comprobación manual queda
  para el mantenedor.
- **Android (Chrome/PWA):** el comportamiento esperado es reproducción en
  segundo plano con controles en la notificación; pendiente de prueba manual en
  un dispositivo real.
- **iOS (Safari/PWA):** el audio de un `<audio>` puede continuar con la pantalla
  bloqueada en muchos casos, pero no hay garantía ni CarPlay; la prueba manual
  queda pendiente.

Conclusión del prototipo: las APIs web cubren el caso “escuchar con la pantalla
apagada” de forma aceptable en Android, pero **no habilitan CarPlay/Android
Auto** ni dan la fiabilidad de un servicio de audio nativo. Eso confirma que la
decisión nativa es por integración con el sistema, no por reproducción básica.

## 6. Estimaciones

Días ideales, no compromisos. Confianza baja por la aprobación de tiendas.

| Trabajo | Días |
|---|---:|
| Capacitor: shell, navegación, auth, deep links, builds | 10–15 |
| Plugin nativo de audio (segundo plano, interrupciones, cola) | 4–6 |
| CarPlay (Swift, entitlement, plantillas, pruebas) | 10–15 |
| Android Auto (MediaBrowserService, MediaSession, revisión) | 8–12 |
| Publicación, metadatos, privacidad, revisión | 4–6 |
| **Total wrapper + auto** | **36–54** |
| React Native: pantallas y paridad | 20–30 |
| React Native: audio, CarPlay y Android Auto | 20–30 |
| **Total React Native** | **40–60** |
| Nativa Swift + Kotlin | 50–70 |

A esto se suman las esperas de aprobación (CarPlay: semanas; revisión de auto:
días/semanas).

## 7. Riesgos

- **Entitlement de CarPlay denegado o demorado.** Sin él, la app no puede
  ofrecer CarPlay.
- **Revisión de Android Auto.** Una implementación de medios incompleta se
  rechaza.
- **WebView con audio en segundo plano.** En iOS el WebView no garantiza audio
  al bloquear; hace falta plugin nativo.
- **Duplicar mantenimiento.** Dos tiendas, dos ciclos de release, dos QA.
- **Donaciones y políticas de tienda.** Apple puede cuestionar enlaces de
  donación; conviene tratarlo como enlace externo y revisarlo antes.
- **Coste de CI macOS** y de las cuentas.
- **Autenticación.** Cookies de sesión en WebView requieren configuración
  (same-site, secure) o un flujo por token.
- **Privacidad.** La app debe declarar datos y permitir borrar la cuenta.

## 8. Decisión propuesta

1. **Ahora:** mantener la PWA. No hay justificación de coste/beneficio para una
   app nativa con la base actual y sin validación de demanda.
2. **Si se aprueba la app nativa:** empezar por un **wrapper con Capacitor**,
   porque reutiliza la UI y el producto web, y agregar:
   - plugin nativo de audio en segundo plano,
   - módulo CarPlay en Swift,
   - módulo Android Auto con `MediaBrowserService`.
3. **No** reescribir en React Native ni construir dos apps nativas salvo que
   aparezcan necesidades de UI nativa que el wrapper no cubra.
4. **Puertas de decisión antes de implementar:**
   - Demanda validada: instalaciones de la PWA, retención y pedidos explícitos
     de CarPlay/Auto.
   - Presupuesto para cuentas de tienda, CI macOS y tiempo de revisión.
   - Confirmación de que Apple aprueba el entitlement de CarPlay para la cuenta.
   - Revisión legal de donaciones en ZEC y privacidad.

## 9. Plan por fases (si se aprueba)

1. **Fase 0 (spike, 3–5 días):** cuenta de desarrollador, proyecto Capacitor,
   audio en segundo plano en dispositivos reales. Puerta: ¿la experiencia es
   aceptable?
2. **Fase 1 (2–3 semanas):** paridad mínima (catálogo, episodio, login,
   descargas, cola) y beta interna.
3. **Fase 2 (2–3 semanas):** CarPlay + Android Auto + revisión de tiendas.
4. **Fase 3:** publicación y soporte.

## 10. Preguntas abiertas

- ¿La demanda de CarPlay/Android Auto justifica el coste ahora?
- ¿Hay acceso a un Mac o presupuesto para CI macOS?
- ¿Las donaciones en ZEC se mantienen como enlace externo?
- ¿Se acepta mantener dos releases (web y app) o se congela la web?
- ¿Qué métricas de la PWA se usarán como puerta de decisión?

## 11. Referencias

- Apple: App Store Review Guidelines, CarPlay entitlement, `UIBackgroundModes`.
- Google: Android Auto media apps, `MediaBrowserService`, requisitos de
  servicio en primer plano para reproducción.
- Capacitor: documentación de plugins nativos y de WebView.
- React Native Track Player.
