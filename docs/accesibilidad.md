# Accesibilidad

PodZcash revisa su interfaz contra **WCAG 2.2 nivel AA**. Esta página documenta
el alcance, las herramientas y las limitaciones de la revisión actual. La
declaración pública está en `/accesibilidad`.

## Cómo se ejecuta

```powershell
npx playwright test e2e/a11y.spec.ts
```

La suite también forma parte de `npm run e2e`, que se ejecuta en CI después del
build.

- Motor: `@axe-core/playwright` con las etiquetas `wcag2a`, `wcag2aa`,
  `wcag21a`, `wcag21aa` y `wcag22aa`.
- Solo hacen fallar la suite las violaciones de impacto `critical` o `serious`.
- Se revisan las rutas públicas, el estudio, la cuenta, la administración, el
  embed y el reproductor abierto.
- Se prueba el inicio en móvil (Pixel 5), el enlace para saltar al contenido,
  el formulario de acceso y el reproductor con teclado.

## Cobertura

| Grupo | Rutas |
|---|---|
| Públicas | Inicio, explorar, canal, episodio, donar, entrar, registro, recuperar, lista de espera, descargas, offline, proyecto, acerca, privacidad, términos, accesibilidad, cuenta eliminada y embed |
| Estudio | Panel, cuenta, canal, episodios, nuevo episodio, editar episodio, analítica, comentarios y distribución |
| Administración | Panel de administración e invitaciones |
| Reproductor | Episodio con la barra de reproducción abierta |
| Teclado | Salto al contenido, formulario de acceso y reproductor |
| Móvil | Inicio con viewport Pixel 5 |

## Correcciones de esta fase

- Enlace **Saltar al contenido** como primer elemento enfocable, con
  `main#contenido` y `tabIndex={-1}` en el sitio y en el estudio.
- Landmark `main` en el reproductor embebible.
- Etiquetas accesibles en los campos de archivo de audio y portada.
- Contraste de los textos sutiles de `/proyecto` corregido a `#7d8798`.
- El botón de velocidad incluye su valor visible (`1×`) en el nombre accesible.
- Declaración pública en `/accesibilidad` con enlace en el footer.

## Resultado de la última revisión

- Fecha: **15 de noviembre de 2026**.
- **33 pruebas de accesibilidad en verde**.
- Sin violaciones `critical` o `serious` en las rutas cubiertas.
- Entorno: build de producción con datos de prueba.

## Limitaciones conocidas

- No hay auditoría manual con lectores de pantalla como NVDA, JAWS o VoiceOver.
- Las transcripciones, capítulos y descripciones de audio siguen pendientes.
- Algunos contenidos incrustados o enlaces externos dependen de terceros.
- La revisión debe repetirse al añadir páginas o componentes interactivos.

## Mantenimiento

1. Añadir cada ruta nueva a `e2e/a11y.spec.ts`.
2. Ejecutar `npm run e2e` antes de cada release.
3. Si axe marca una violación, corregirla o documentar la excepción con una
   justificación en este archivo.
4. Actualizar `/accesibilidad` cuando cambie el alcance o el estado de
   conformidad.
