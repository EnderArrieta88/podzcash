# Fase 0 — Confianza, marca y demo

Checklist operativo para dejar PodZcash presentable antes de una solicitud a
Zcash Community Grants.

## 1. Marca y nombre

- [ ] Revisar `TRADEMARK.md`.
- [ ] Pedir permiso de uso de marca a Zcash Foundation o decidir un renombre.
- [ ] No presentar el proyecto como afiliado a ZF o ECC.
- [ ] Si hay renombre, actualizar dominio, GitHub, RSS, embeds y materiales.

## 2. Limpiar la demo de producción

La demo actual tiene un canal `@adam-curry` con el nombre y la imagen de una
persona real. Si no existe autorización escrita, hay que retirarlo antes de
mostrar la app a revisores o creadores.

Opciones, de la menos invasiva a la más directa:

1. **Si tienes acceso a la cuenta del canal**: inicia sesión, entra a
   `/estudio/canal`, cambia nombre visible, nombre de usuario, bio y avatar; en
   `/estudio/episodios` despublica o reemplaza el episodio de prueba.
2. **Si no tienes acceso a la cuenta**: crea un canal nuevo con una cuenta de
   demo y, desde administración, oculta los episodios del canal anterior. El
   canal anterior puede seguir visible, así que esta opción sola no basta.
3. **Acceso directo a la base de producción** (solo con backup previo):
   descarga `prisma/dev.db` y el directorio `.media`, haz una copia de
   seguridad, y cambia el canal y sus episodios. Ejemplo orientativo; verifica
   los IDs antes de ejecutar:

   ```sql
   -- Backup primero. Ajusta el handle y el id reales.
   UPDATE Channel
      SET handle = 'nora-vela',
          displayName = 'Nora Vela',
          bio = 'Demo de PodZcash. Contenido de ejemplo.',
          avatarKey = NULL,
          bannerKey = NULL
    WHERE handle = 'adam-curry';

   UPDATE Episode
      SET status = 'draft'
    WHERE channelId = (SELECT id FROM Channel WHERE handle = 'nora-vela');
   ```

   Después sube el archivo actualizado y reinicia la aplicación. No borres
   `.media` sin backup.

- [ ] El canal de demo usa un nombre ficticio o un creador con permiso.
- [ ] No queda ninguna foto, nombre o audio de una persona real sin permiso.
- [ ] La captura de portada coincide con el contenido real de producción.

## 3. Sembrar contenido

Para que un revisor vea una plataforma y no un formulario vacío:

- [ ] 3–5 canales de demo o partners con permiso.
- [ ] 10–20 episodios publicados.
- [ ] Contenido propio, CC0 o autorizado; nada copiado de terceros.
- [ ] Etiquetar claramente lo que sea demo.
- [ ] Un feed real aceptado en Apple Podcasts y Spotify.
- [ ] Un video de 3 minutos: escucha, canal, episodio, donación, RSS/embed.

No inventes usuarios, reproducciones ni donaciones. ZCG valora la honestidad.

## 4. Página de confianza

Ya implementado en el código:

- `/acerca` con quién construye el proyecto, principios, estado y contacto.
- `/privacidad` con datos tratados, cookies, donaciones y derechos.
- `/terminos` con cuentas, contenido, moderación, donaciones y responsabilidad.
- Aviso de independencia en el pie.
- `SECURITY.md`, `CODE_OF_CONDUCT.md` y `TRADEMARK.md`.
- `security.txt` en `/.well-known/security.txt`.

## 5. Documentación

- [x] README actualizado con el estado real, stack, rutas y deploy.
- [x] README enlaza licencia MIT, seguridad, conducta y marca.
- [x] `CONTRIBUTING.md` con estándares y enlaces.
- [ ] Repositorio con descripción y topics en GitHub.

## 6. Criterio de aceptación de la Fase 0

- [ ] Un revisor entiende qué es PodZcash, quién lo hace y cuánto cuesta en 5
      minutos.
- [ ] No hay identidad de terceros sin permiso ni afirmaciones de afiliación.
- [ ] Hay contenido suficiente para explorar y un feed real aceptado.
- [ ] Existe un video demo y una cuenta de creador de prueba.
- [ ] La marca está resuelta o hay una decisión documentada.
