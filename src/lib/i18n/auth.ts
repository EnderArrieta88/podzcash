import type { Locale } from "./config";

const es = {
  login: {
    metaTitle: "Entrar",
    title: "Entra a tu estudio",
    intro: "Publica tu contenido y gestiona tu canal.",
    email: "Email",
    emailPlaceholder: "tu@email.com",
    password: "Contraseña",
    submit: "Entrar",
    pending: "Entrando…",
    forgotPassword: "¿Olvidaste tu contraseña?",
    invitePrompt: "¿Tienes un código de invitación?",
    createAccount: "Crear cuenta",
    resendVerification: "Reenviar el correo de verificación",
    errors: {
      tooMany: "Demasiados intentos. Espera unos minutos.",
      invalid: "Email o contraseña incorrectos.",
      suspended: "Esta cuenta está suspendida.",
      unverified:
        "Tu cuenta todavía no está verificada. Revisa tu correo para activarla.",
    },
  },
  register: {
    metaTitle: "Crear cuenta",
    firstTitle: "Crea el primer canal",
    title: "Crea tu cuenta",
    firstIntro:
      "PodZcash está vacío. Tu cuenta será la administradora del proyecto.",
    intro: "PodZcash es por invitación. Necesitas un código para entrar.",
    firstUserNote:
      "Eres la primera cuenta: se creará como administrador y no necesitas invitación.",
    name: "Nombre",
    namePlaceholder: "Cómo te llamas",
    email: "Email",
    emailPlaceholder: "tu@email.com",
    password: "Contraseña",
    passwordPlaceholder: "Mínimo 8 caracteres",
    inviteCode: "Código de invitación",
    inviteHint:
      "Te lo entrega un administrador de PodZcash. Sin código no se puede crear cuenta.",
    waitlistPrompt: "¿Todavía no tienes código?",
    waitlistLink: "Entra a la lista de espera",
    submit: "Crear cuenta",
    pending: "Creando cuenta…",
    loginPrompt: "¿Ya tienes cuenta?",
    signIn: "Entrar",
    termsPrefix: "Acepto los",
    termsLabel: "Términos",
    termsJoin: "y la",
    privacyLabel: "Política de privacidad",
    errors: {
      generic: "No se pudo crear la cuenta.",
      inviteRequired: "Necesitas un código de invitación.",
      inviteInvalid: "El código no es válido o ya fue usado.",
      emailExists: "Ese email ya tiene una cuenta.",
      inviteTaken: "Alguien acaba de usar ese código. Pide otro.",
      retry: "No se pudo crear la cuenta. Inténtalo otra vez.",
      termsRequired:
        "Debes aceptar los términos y la política de privacidad.",
    },
  },
  resetRequest: {
    metaTitle: "Recuperar contraseña",
    title: "Recupera tu cuenta",
    intro:
      "Escribe el email de tu cuenta y te enviaremos un enlace para crear una contraseña nueva.",
    email: "Email",
    emailPlaceholder: "tu@email.com",
    submit: "Enviar enlace",
    pending: "Enviando…",
    sentTitle: "Revisa tu correo",
    sentBody:
      "Si existe una cuenta con ese email, enviamos un enlace. Caduca en una hora.",
    unavailableTitle: "Recuperación no disponible",
    unavailableBody:
      "La recuperación por email todavía no está configurada en este entorno. Inténtalo más tarde o ponte en contacto con el administrador.",
    backToLogin: "Volver a entrar",
    errors: {
      emailInvalid: "Escribe un email válido.",
    },
  },
  reset: {
    metaTitle: "Nueva contraseña",
    title: "Crea una contraseña nueva",
    intro: "Elige una contraseña de al menos 8 caracteres.",
    newPassword: "Nueva contraseña",
    confirmPassword: "Repetir la nueva contraseña",
    submit: "Guardar contraseña",
    pending: "Guardando…",
    invalidTitle: "El enlace no es válido",
    invalidBody:
      "Puede que haya caducado o ya se haya usado. Solicita uno nuevo.",
    requestNew: "Solicitar otro enlace",
    errors: {
      invalidToken: "El enlace no es válido o caducó. Solicita uno nuevo.",
      generic: "No se pudo cambiar la contraseña. Inténtalo otra vez.",
    },
  },
  verify: {
    metaTitle: "Verificar cuenta",
    title: "Verifica tu cuenta",
    intro: "Te enviamos un enlace para confirmar tu email.",
    confirmTitle: "Confirma tu cuenta",
    confirmBody: "Haz clic en el botón para activar tu cuenta y empezar a publicar.",
    confirm: "Confirmar cuenta",
    confirming: "Confirmando…",
    successTitle: "Cuenta verificada",
    successBody: "Ya puedes entrar con tu email y contraseña.",
    invalidTitle: "El enlace no es válido",
    invalidBody:
      "Puede que haya caducado o ya se haya usado. Solicita uno nuevo abajo.",
    resendTitle: "Reenviar el enlace",
    resendIntro:
      "Escribe el email de tu cuenta y te enviamos un enlace nuevo.",
    email: "Email",
    emailPlaceholder: "tu@email.com",
    submit: "Reenviar enlace",
    pending: "Enviando…",
    sentTitle: "Revisa tu correo",
    sentBody:
      "Si hay una cuenta pendiente con ese email, enviamos un enlace. Caduca en 48 horas.",
    backToLogin: "Entrar",
  },
};

export type LoginLabels = typeof es.login;
export type RegisterLabels = typeof es.register;
export type ResetRequestLabels = typeof es.resetRequest;
export type ResetLabels = typeof es.reset;
export type VerifyLabels = typeof es.verify;

type AuthContent = typeof es;

const en: AuthContent = {
  login: {
    metaTitle: "Sign in",
    title: "Sign in to your studio",
    intro: "Publish your content and manage your channel.",
    email: "Email",
    emailPlaceholder: "you@email.com",
    password: "Password",
    submit: "Sign in",
    pending: "Signing in…",
    forgotPassword: "Forgot your password?",
    invitePrompt: "Have an invite code?",
    createAccount: "Create account",
    resendVerification: "Resend the verification email",
    errors: {
      tooMany: "Too many attempts. Wait a few minutes.",
      invalid: "Email or password is incorrect.",
      suspended: "This account is suspended.",
      unverified:
        "Your account is not verified yet. Check your email to activate it.",
    },
  },
  register: {
    metaTitle: "Create account",
    firstTitle: "Create the first channel",
    title: "Create your account",
    firstIntro:
      "PodZcash is empty. Your account will be the project administrator.",
    intro: "PodZcash is invite-only. You need a code to join.",
    firstUserNote:
      "You are the first account: it will be created as administrator and no invite is needed.",
    name: "Name",
    namePlaceholder: "What should we call you",
    email: "Email",
    emailPlaceholder: "you@email.com",
    password: "Password",
    passwordPlaceholder: "At least 8 characters",
    inviteCode: "Invite code",
    inviteHint:
      "An administrator gives it to you. Without a code you cannot create an account.",
    waitlistPrompt: "No code yet?",
    waitlistLink: "Join the waitlist",
    submit: "Create account",
    pending: "Creating account…",
    loginPrompt: "Already have an account?",
    signIn: "Sign in",
    termsPrefix: "I accept the",
    termsLabel: "Terms",
    termsJoin: "and the",
    privacyLabel: "Privacy policy",
    errors: {
      generic: "Could not create the account.",
      inviteRequired: "You need an invite code.",
      inviteInvalid: "The code is invalid or already used.",
      emailExists: "That email already has an account.",
      inviteTaken: "Someone just used that code. Ask for another one.",
      retry: "Could not create the account. Try again.",
      termsRequired: "You must accept the terms and the privacy policy.",
    },
  },
  resetRequest: {
    metaTitle: "Reset password",
    title: "Recover your account",
    intro:
      "Enter your account email and we will send you a link to create a new password.",
    email: "Email",
    emailPlaceholder: "you@email.com",
    submit: "Send link",
    pending: "Sending…",
    sentTitle: "Check your email",
    sentBody:
      "If an account exists with that email, we sent a link. It expires in one hour.",
    unavailableTitle: "Recovery unavailable",
    unavailableBody:
      "Email recovery is not configured in this environment yet. Try again later or contact the administrator.",
    backToLogin: "Back to sign in",
    errors: {
      emailInvalid: "Enter a valid email.",
    },
  },
  reset: {
    metaTitle: "New password",
    title: "Create a new password",
    intro: "Choose a password with at least 8 characters.",
    newPassword: "New password",
    confirmPassword: "Repeat the new password",
    submit: "Save password",
    pending: "Saving…",
    invalidTitle: "This link is not valid",
    invalidBody:
      "It may have expired or already been used. Request a new one.",
    requestNew: "Request another link",
    errors: {
      invalidToken: "The link is invalid or expired. Request a new one.",
      generic: "Could not change the password. Try again.",
    },
  },
  verify: {
    metaTitle: "Verify account",
    title: "Verify your account",
    intro: "We sent you a link to confirm your email.",
    confirmTitle: "Confirm your account",
    confirmBody: "Press the button to activate your account and start publishing.",
    confirm: "Confirm account",
    confirming: "Confirming…",
    successTitle: "Account verified",
    successBody: "You can now sign in with your email and password.",
    invalidTitle: "This link is not valid",
    invalidBody:
      "It may have expired or already been used. Request a new one below.",
    resendTitle: "Resend the link",
    resendIntro: "Enter your account email and we will send a new link.",
    email: "Email",
    emailPlaceholder: "you@email.com",
    submit: "Resend link",
    pending: "Sending…",
    sentTitle: "Check your email",
    sentBody:
      "If there is a pending account with that email, we sent a link. It expires in 48 hours.",
    backToLogin: "Sign in",
  },
};

export const authContent: Record<Locale, AuthContent> = { es, en };
