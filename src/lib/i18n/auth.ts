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
    invitePrompt: "¿Tienes un código de invitación?",
    createAccount: "Crear cuenta",
    errors: {
      tooMany: "Demasiados intentos. Espera unos minutos.",
      invalid: "Email o contraseña incorrectos.",
      suspended: "Esta cuenta está suspendida.",
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
    submit: "Crear cuenta",
    pending: "Creando cuenta…",
    loginPrompt: "¿Ya tienes cuenta?",
    signIn: "Entrar",
    errors: {
      generic: "No se pudo crear la cuenta.",
      inviteRequired: "Necesitas un código de invitación.",
      inviteInvalid: "El código no es válido o ya fue usado.",
      emailExists: "Ese email ya tiene una cuenta.",
      inviteTaken: "Alguien acaba de usar ese código. Pide otro.",
      retry: "No se pudo crear la cuenta. Inténtalo otra vez.",
    },
  },
};

export type LoginLabels = typeof es.login;
export type RegisterLabels = typeof es.register;

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
    invitePrompt: "Have an invite code?",
    createAccount: "Create account",
    errors: {
      tooMany: "Too many attempts. Wait a few minutes.",
      invalid: "Email or password is incorrect.",
      suspended: "This account is suspended.",
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
    submit: "Create account",
    pending: "Creating account…",
    loginPrompt: "Already have an account?",
    signIn: "Sign in",
    errors: {
      generic: "Could not create the account.",
      inviteRequired: "You need an invite code.",
      inviteInvalid: "The code is invalid or already used.",
      emailExists: "That email already has an account.",
      inviteTaken: "Someone just used that code. Ask for another one.",
      retry: "Could not create the account. Try again.",
    },
  },
};

export const authContent: Record<Locale, AuthContent> = { es, en };
