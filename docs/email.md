# Email, verificación y recuperación de contraseña

PodZcash usa [Resend](https://resend.com) para enviar dos correos:

- **Verificación de cuenta** al registrarse.
- **Recuperación de contraseña** cuando se solicita.

## Variables de entorno

En el `.env` del servidor de producción:

```env
SITE_URL="https://podzcash.online"
AUTH_SECRET="una-cadena-larga-y-aleatoria"
RESEND_API_KEY="re_..."
EMAIL_FROM="PodZcash <hola@podzcash.online>"
WAITLIST_NOTIFY_EMAIL="invitaciones@podzcash.online"
```

- `AUTH_SECRET` firma los enlaces de verificación y recuperación. Genera al
  menos 32 bytes aleatorios y guárdalo en un gestor de contraseñas.
  **Un secreto corto permite falsificar enlaces**: usa 64 caracteres.
- `RESEND_API_KEY` se crea en el panel de Resend.
- `EMAIL_FROM` debe usar un dominio verificado en Resend.
- `WAITLIST_NOTIFY_EMAIL` recibe un aviso por cada solicitud de la lista de
  espera. Por defecto: `invitaciones@podzcash.online`.
- El deploy **no sube `.env`**: hay que editar el archivo en el hosting y
  reiniciar la aplicación.

## Configurar Resend

1. Crear una cuenta en Resend.
2. Añadir el dominio `podzcash.online`.
3. Configurar los registros DNS que indique Resend (SPF/DKIM).
4. Esperar la verificación del dominio.
5. Crear una API key con permiso de envío.
6. Copiar la key al `.env` del servidor como `RESEND_API_KEY`.

## Verificación de email

Al crear una cuenta, el usuario queda con estado `unverified` y recibe un
enlace. Hasta que no lo confirma:

- No puede iniciar sesión (el mensaje ofrece reenviar el correo).
- No tiene sesión activa.

El enlace abre `/verificar`, que muestra un botón de confirmación. Al
confirmarlo, la cuenta pasa a `active`.

- El enlace caduca en **48 horas**.
- Se puede pedir uno nuevo desde `/verificar`.
- La respuesta del reenvío es genérica: no revela si el email existe.
- La **primera cuenta** (administrador) se activa directamente para no dejar
  una instalación nueva sin acceso.
- Si el entorno no tiene `RESEND_API_KEY`, las cuentas nuevas se activan
  directamente (útil en desarrollo y demos).

No requiere migración: se reutiliza el campo `User.status`, que ya admitía
`active` y `suspended`.

## Lista de espera

Cuando alguien se anota en `/lista-de-espera`:

- Se guarda la solicitud en la base, visible en `/estudio/admin`.
- Se envía un aviso a `WAITLIST_NOTIFY_EMAIL` (por defecto
  `invitaciones@podzcash.online`).
- El aviso no se envía si el email ya estaba anotado.

Desde la sección **Lista de espera** de `/estudio/admin` se puede:

- **Invitar por email**: crea una invitación (o reutiliza una pendiente para
  ese email) y la envía con Resend. El correo incluye el código y un enlace a
  `/registro?invite=...`.
- **Borrar**: elimina la solicitud.

## Recuperación de contraseña

1. Abrir `/recuperar`.
2. Escribir el email de una cuenta existente.
3. Revisar la bandeja de entrada y la carpeta de spam.
4. Abrir el enlace y definir una contraseña nueva.
5. Verificar que la sesión anterior se cierra y que se puede entrar con la
   contraseña nueva.

En desarrollo, si `RESEND_API_KEY` no está configurada, el enlace se imprime en
la consola del servidor y no se envía ningún correo.

## Seguridad

- Recuperación: caduca en **1 hora**; verificación: **48 horas**.
- Ambos enlaces están firmados con HMAC-SHA256 y no se guardan en la base.
- El enlace de recuperación queda inválido cuando cambia la contraseña.
- Las respuestas de `/recuperar` y `/verificar` son genéricas para no revelar
  si un email existe.
- Hay límite de solicitudes por email.
- No se registran tokens en producción.
