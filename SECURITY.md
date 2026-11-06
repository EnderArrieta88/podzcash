# Política de seguridad

PodZcash es una plataforma de audio con cuentas, subidas de archivos, enlaces
de donación ZEC y un panel de administración. La seguridad y la privacidad son
parte del proyecto.

## Versiones soportadas

Solo la rama `main` recibe correcciones de seguridad. La beta pública corre en
<https://podzcash.online>.

## Cómo reportar una vulnerabilidad

**No abras un issue público para una vulnerabilidad.**

Usa uno de estos canales privados:

1. GitHub Security Advisories:
   <https://github.com/EnderArrieta88/podzcash/security/advisories/new>
2. Email: **hola@podzcash.online**, con el asunto `Security`.

Incluye, si puedes:

- Descripción del problema y su impacto.
- Pasos para reproducirlo.
- Versión o commit afectado.
- Prueba de concepto, sin datos de terceros.
- Si quieres, tu nombre o alias para recibir crédito.

## Qué entra en el alcance

- Autenticación, sesiones y control de acceso.
- Permisos de creador, administrador y API.
- Subida y servido de archivos.
- Generación de ZIP-321, QR y enlaces de donación.
- XSS, CSRF, SSRF, inyección y exposición de datos.
- Rate limiting, spam y abuso.
- Dependencias y configuración de producción.

## Fuera de alcance

- Ingeniería social y ataques físicos.
- Ataques a la infraestructura del hosting o de terceros.
- Spam sin impacto de seguridad.
- Reportes teóricos sin una ruta de explotación razonable.

## Compromiso de respuesta

- Acuse de recibo: hasta 3 días hábiles.
- Evaluación inicial: hasta 7 días hábiles.
- Corrección: prioridad según gravedad; los críticos se atienden primero.
- Coordinación de divulgación: acordaremos un plazo razonable antes de publicar.

No hay un programa de recompensas económicas en este momento. Si el reporte es
válido, se reconocerá el crédito si la persona lo solicita.

## Investigación responsable

- No accedas a datos de otras personas, no los modifiques y no los publiques.
- No interrumpas el servicio ni ejecutes pruebas de denegación de servicio.
- Usa cuentas y datos de prueba.
- Da tiempo razonable para corregir antes de divulgar.

Gracias por ayudar a que la plataforma sea más segura.
