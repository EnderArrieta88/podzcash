import type { Locale } from "./config";

const es = {
  usernameMin: "El nombre de usuario necesita al menos 3 caracteres.",
  usernameMax: "El nombre de usuario no puede pasar de 30 caracteres.",
  usernameChars:
    "Solo minúsculas, números y guiones. No puede empezar ni terminar con guion.",
  usernameReserved: "Ese nombre de usuario está reservado. Elige otro.",
  nameMin: "Escribe tu nombre.",
  nameMax: "El nombre es demasiado largo.",
  emailInvalid: "Escribe un email válido.",
  passwordMin: "La contraseña necesita al menos 8 caracteres.",
  passwordMax: "La contraseña es demasiado larga.",
  channelNameMin: "El nombre del canal necesita al menos 2 caracteres.",
  channelNameMax: "El nombre del canal es demasiado largo.",
  bioMax: "La bio no puede pasar de 500 caracteres.",
  titleMin: "El título necesita al menos 2 caracteres.",
  titleMax: "El título no puede pasar de 140 caracteres.",
  descriptionMax: "La descripción no puede pasar de 5000 caracteres.",
  kindRequired: "Elige podcast o música.",
  currentPasswordRequired: "Escribe tu contraseña actual.",
  newPasswordMin: "La nueva contraseña necesita al menos 8 caracteres.",
  newPasswordMax: "La nueva contraseña es demasiado larga.",
  passwordsMismatch: "Las contraseñas no coinciden.",
  loginPasswordRequired: "Escribe tu contraseña.",
  inviteCodeMax: "El código de invitación es demasiado largo.",
  zcashAddressMax: "La dirección de Zcash es demasiado larga.",
  tagsMax: "Las etiquetas son demasiado largas.",
  noteMax: "La nota no puede pasar de 400 caracteres.",
  feedLanguageInvalid:
    "Usa un código de idioma válido, por ejemplo es, en o es-AR.",
  feedCategoryRequired: "Elige una categoría para el feed.",
  feedCategoryMax: "La categoría es demasiado larga.",
  ownerEmailInvalid: "Escribe un email de propietario válido.",
  newFeedUrlInvalid: "Escribe una URL válida para el nuevo feed.",
  seasonInvalid: "La temporada tiene que ser un número entero positivo.",
  episodeNumberInvalid:
    "El número de episodio tiene que ser un entero positivo.",
  episodeTypeInvalid: "Elige un tipo de episodio válido.",
};

export type ValidationMessages = typeof es;

const en: ValidationMessages = {
  usernameMin: "Your username needs at least 3 characters.",
  usernameMax: "Your username cannot exceed 30 characters.",
  usernameChars:
    "Only lowercase letters, numbers and hyphens. It cannot start or end with a hyphen.",
  usernameReserved: "That username is reserved. Choose another one.",
  nameMin: "Enter your name.",
  nameMax: "The name is too long.",
  emailInvalid: "Enter a valid email.",
  passwordMin: "The password needs at least 8 characters.",
  passwordMax: "The password is too long.",
  channelNameMin: "The channel name needs at least 2 characters.",
  channelNameMax: "The channel name is too long.",
  bioMax: "The bio cannot exceed 500 characters.",
  titleMin: "The title needs at least 2 characters.",
  titleMax: "The title cannot exceed 140 characters.",
  descriptionMax: "The description cannot exceed 5000 characters.",
  kindRequired: "Choose podcast or music.",
  currentPasswordRequired: "Enter your current password.",
  newPasswordMin: "The new password needs at least 8 characters.",
  newPasswordMax: "The new password is too long.",
  passwordsMismatch: "Passwords do not match.",
  loginPasswordRequired: "Enter your password.",
  inviteCodeMax: "The invite code is too long.",
  zcashAddressMax: "The Zcash address is too long.",
  tagsMax: "The tags are too long.",
  noteMax: "The note cannot exceed 400 characters.",
  feedLanguageInvalid:
    "Use a valid language code, for example es, en or en-US.",
  feedCategoryRequired: "Choose a category for the feed.",
  feedCategoryMax: "The category is too long.",
  ownerEmailInvalid: "Enter a valid owner email.",
  newFeedUrlInvalid: "Enter a valid URL for the new feed.",
  seasonInvalid: "The season must be a positive integer.",
  episodeNumberInvalid: "The episode number must be a positive integer.",
  episodeTypeInvalid: "Choose a valid episode type.",
};

export const validationMessages: Record<Locale, ValidationMessages> = {
  es,
  en,
};
