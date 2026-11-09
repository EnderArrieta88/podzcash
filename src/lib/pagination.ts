/**
 * Convierte un parámetro de la URL (`?pagina=2`) en un número de página
 * válido. Cualquier valor raro cae en la primera página.
 */
export function pageParam(value: string | string[] | undefined): number {
  const raw = Array.isArray(value) ? value[0] : value;
  const page = Number.parseInt(raw ?? "1", 10);

  return Number.isFinite(page) && page > 0 ? page : 1;
}
