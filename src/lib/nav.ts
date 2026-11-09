export type NavItem = {
  href: string;
  exact?: boolean;
};

export function isNavItemActive(pathname: string, item: NavItem): boolean {
  if (item.exact) return pathname === item.href;

  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

/**
 * Devuelve la ruta activa más específica. Así `/estudio/admin` no marca también
 * `/estudio`: gana el prefijo más largo.
 */
export function activeHref(
  pathname: string,
  items: NavItem[],
): string | null {
  let best: string | null = null;

  for (const item of items) {
    if (!isNavItemActive(pathname, item)) continue;
    if (!best || item.href.length > best.length) best = item.href;
  }

  return best;
}
