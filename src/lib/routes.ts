/**
 * URLs públicas de canales y episodios.
 *
 * El nombre de usuario se guarda sin `@`; en la URL se muestra como
 * `/canal/@nombre-de-usuario`.
 */
const CHANNEL_ROOT = "/canal";

/** Quita el `@` decorativo de un parámetro de ruta. */
export function normalizeHandleParam(value: string): string {
  let decoded = value;

  try {
    decoded = decodeURIComponent(value);
  } catch {
    // Un `%` suelto no es un parámetro válido; se usa tal cual.
  }

  return decoded.replace(/^@/, "").toLowerCase();
}

export function channelPath(handle: string): string {
  return `${CHANNEL_ROOT}/@${handle}`;
}

export function episodePath(handle: string, slug: string): string {
  return `${channelPath(handle)}/${slug}`;
}

export function donatePath(handle: string): string {
  return `${channelPath(handle)}/donar`;
}

export function feedPath(handle: string): string {
  return `${channelPath(handle)}/feed.xml`;
}
