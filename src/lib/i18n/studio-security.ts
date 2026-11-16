import type { Locale } from "./config";

const es = {
  title: "Seguridad",
  intro:
    "Protege tu cuenta con un segundo factor. Además de la contraseña, pediremos un código de tu app de autenticación.",
  requiredNotice:
    "El panel de administración requiere 2FA. Actívalo para seguir usando las herramientas de administración.",
  enable: "Activar 2FA",
  setupTitle: "Escanea el código",
  setupHint:
    "Usa ZODL, Google Authenticator, Aegis o cualquier app compatible con TOTP.",
  manualKey: "Clave manual",
  code: "Código de 6 dígitos",
  codeHint: "Introduce el código actual de tu app.",
  confirm: "Confirmar y activar",
  cancel: "Cancelar",
  enabled: "2FA activo",
  enabledHint: "Tu cuenta pide un código además de la contraseña.",
  recoveryCount: (count: number) =>
    count === 1
      ? "Queda 1 código de recuperación."
      : `Quedan ${count} códigos de recuperación.`,
  recoveryTitle: "Códigos de recuperación",
  recoveryHint:
    "Guárdalos en un lugar seguro. Cada uno sirve una sola vez si pierdes el teléfono.",
  regenerate: "Regenerar códigos",
  disable: "Desactivar 2FA",
  password: "Contraseña actual",
  passwordHint: "La pedimos para confirmar cambios de seguridad.",
  errors: {
    already: "2FA ya está activo.",
    missing: "Primero genera el código QR.",
    invalid: "El código no es válido o ya caducó.",
    password: "La contraseña no es correcta.",
    noSecret: "No se pudo leer el secreto. Vuelve a empezar.",
    crypto: "El servidor no tiene AUTH_SECRET configurado.",
    tooMany: "Demasiados intentos. Espera unos minutos.",
    generic: "No se pudo completar la operación.",
  },
};

export type StudioSecurityContent = typeof es;

const en: StudioSecurityContent = {
  title: "Security",
  intro:
    "Protect your account with a second factor. Besides your password, we will ask for a code from your authenticator app.",
  requiredNotice:
    "The admin panel requires 2FA. Enable it to keep using the administration tools.",
  enable: "Enable 2FA",
  setupTitle: "Scan the code",
  setupHint:
    "Use ZODL, Google Authenticator, Aegis or any TOTP-compatible app.",
  manualKey: "Manual key",
  code: "6-digit code",
  codeHint: "Enter the current code from your app.",
  confirm: "Confirm and enable",
  cancel: "Cancel",
  enabled: "2FA is active",
  enabledHint: "Your account asks for a code in addition to the password.",
  recoveryCount: (count: number) =>
    count === 1
      ? "1 recovery code remaining."
      : `${count} recovery codes remaining.`,
  recoveryTitle: "Recovery codes",
  recoveryHint:
    "Store them somewhere safe. Each one works only once if you lose your phone.",
  regenerate: "Regenerate codes",
  disable: "Disable 2FA",
  password: "Current password",
  passwordHint: "We ask for it to confirm security changes.",
  errors: {
    already: "2FA is already active.",
    missing: "Generate the QR code first.",
    invalid: "The code is invalid or expired.",
    password: "The password is not correct.",
    noSecret: "Could not read the secret. Start again.",
    crypto: "The server does not have AUTH_SECRET configured.",
    tooMany: "Too many attempts. Wait a few minutes.",
    generic: "Could not complete the operation.",
  },
};

export const studioSecurityContent: Record<Locale, StudioSecurityContent> = {
  es,
  en,
};
