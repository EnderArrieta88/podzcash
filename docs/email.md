# Email y recuperación de contraseña

PodZcash usa [Resend](https://resend.com) para enviar el enlace de
recuperación de contraseña.

## Variables de entorno

En el `.env` del servidor de producción:

```env
SITE_URL="https://podzcash.online"
AUTH_SECRET="una-cadena-larga-y-aleatoria"
RESEND_API_KEY="re_..."
EMAIL_FROM="PodZcash <hola@podzcash.online>"
```

- `AUTH_SECRET` firma los enlaces de recuperación. Genera al menos 32 bytes
  aleatorios y guárdalo en un gestor de contraseñas.
- `RESEND_API_KEY` se crea en el panel de Resend.
- `EMAIL_FROM` debe usar un dominio verificado en Resend.
- El deploy **no sube `.env`**: hay que editar el archivo en el hosting y
  reiniciar la aplicación.

## Configurar Resend

1. Crear una cuenta en Resend.
2. Añadir el dominio `podzcash.online`.
3. Configurar los registros DNS que indique Resend (SPF/DKIM).
4. Esperar la verificación del dominio.
5. Crear una API key con permiso de envío.
6. Copiar la key al `.env` del servidor como `RESEND_API_KEY`.

## Probar

1. Abrir `/recuperar`.
2. Escribir el email de una cuenta existente.
3. Revisar la bandeja de entrada y la carpeta de spam.
4. Abrir el enlace y definir una contraseña nueva.
5. Verificar que la sesión anterior se cierra y que se puede entrar con la
   contraseña nueva.

En desarrollo, si `RESEND_API_KEY` no está configurada, el enlace se imprime en
la consola del servidor y no se envía ningún correo.

## Seguridad

- El enlace caduca en **1 hora**.
- Está firmado con HMAC-SHA256; no se guarda en la base.
- Queda inválido cuando cambia la contraseña.
- La respuesta de `/recuperar` es genérica para no revelar si un email existe.
- Hay límite de solicitudes por email.
- No se registran tokens en producción.

## Pendiente

La verificación de email requiere guardar un estado por cuenta. No se añadió
todavía para no introducir una migración de base de datos en producción sin un
plan de migración seguro.
