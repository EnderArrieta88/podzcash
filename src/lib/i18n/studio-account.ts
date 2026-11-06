import type { Locale } from "./config";

const es = {
  metaTitle: "Cuenta",
  title: "Cuenta",
  signedInAs: "Sesión iniciada como",
  changeTitle: "Cambiar contraseña",
  changeHint: "Al cambiarla se cierran las demás sesiones abiertas.",
  done: "Contraseña actualizada.",
  errors: {
    invalid:
      "Revisa los datos: la contraseña nueva necesita al menos 8 caracteres y ambas deben coincidir.",
    current: "La contraseña actual no es correcta.",
    same: "La nueva contraseña debe ser distinta de la actual.",
    generic: "No se pudo cambiar la contraseña.",
  },
  currentPassword: "Contraseña actual",
  newPassword: "Nueva contraseña",
  confirmPassword: "Repetir la nueva contraseña",
  submit: "Cambiar contraseña",
};

type StudioAccountContent = typeof es;

const en: StudioAccountContent = {
  metaTitle: "Account",
  title: "Account",
  signedInAs: "Signed in as",
  changeTitle: "Change password",
  changeHint: "Changing it closes your other open sessions.",
  done: "Password updated.",
  errors: {
    invalid:
      "Check the data: the new password needs at least 8 characters and both must match.",
    current: "The current password is incorrect.",
    same: "The new password must be different from the current one.",
    generic: "Could not change the password.",
  },
  currentPassword: "Current password",
  newPassword: "New password",
  confirmPassword: "Repeat the new password",
  submit: "Change password",
};

export const studioAccountContent: Record<Locale, StudioAccountContent> = {
  es,
  en,
};
