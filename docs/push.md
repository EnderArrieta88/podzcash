# Avisos push en el teléfono

La lista de espera envía una notificación Web Push a los administradores que la
hayan activado desde el teléfono. El correo a `WAITLIST_NOTIFY_EMAIL` sigue
funcionando igual; el push es adicional.

## Alcance

- Solo se activa desde un teléfono. El escritorio muestra un aviso, pero no
  permite suscribirse.
- Solo se envían avisos de **nuevas solicitudes de la lista de espera**. No hay
  push de comentarios, episodios ni otras acciones.
- Solo los usuarios con rol `admin` y estado `active` reciben los avisos.
- Las suscripciones se guardan en SQLite. La tabla se crea en la primera
  suscripción, sin migración.
- Si la solicitud es un email ya anotado, no se envía nada.

## Variables de entorno

En el `.env` del servidor:

```env
VAPID_PUBLIC_KEY="..."
VAPID_PRIVATE_KEY="..."
VAPID_SUBJECT="mailto:hola@podzcash.online"
```

Generar el par una sola vez:

```bash
npx web-push generate-vapid-keys
```

- La clave **pública** puede estar en el cliente; la **privada** no se comparte
  ni se versiona.
- Si falta alguna de las dos, la interfaz muestra que las notificaciones no
  están configuradas y el servidor no intenta enviar.
- Después de editar `.env`, reiniciar la aplicación para que tome los valores.

## Activar en el teléfono

1. Instalar PodZcash como PWA (en iPhone/iPad: Compartir → Añadir a pantalla de
   inicio).
2. Abrir la app desde el icono, no desde una pestaña del navegador.
3. Entrar como administrador y abrir **Estudio → Administración**.
4. En la sección **Lista de espera**, pulsar **Activar notificaciones** y aceptar
   el permiso del sistema.
5. El botón cambia a **Desactivar en este teléfono** cuando la suscripción está
   activa.

En Android y escritorio Chromium, el permiso también funciona desde el
navegador. En iOS, Web Push solo está disponible para PWA instaladas (iOS 16.4 o
superior).

## Probar

1. Desde otro dispositivo o una ventana privada, enviar una solicitud nueva en
   `/lista-de-espera`.
2. Debe llegar la notificación al teléfono y el correo a
   `WAITLIST_NOTIFY_EMAIL`.
3. Al tocar la notificación se abre `/estudio/admin`.

Si no llega:

- Revisar que el teléfono tenga la suscripción activa en Administración.
- Confirmar que `VAPID_PUBLIC_KEY` y `VAPID_PRIVATE_KEY` están en el `.env` y
  que la app se reinició.
- Revisar los permisos de notificaciones del sistema y el modo de concentración.
- En iOS, confirmar que la app se abrió desde el icono de la pantalla de inicio.

## Seguridad y privacidad

- El aviso incluye el nombre y el tipo de contenido, no el email.
- El endpoint de la suscripción es un secreto del dispositivo: se guarda en la
  base y no se registra en logs.
- Si el servicio de push responde `404` o `410`, la suscripción se elimina.
- Al eliminar una cuenta, se borran sus suscripciones.
