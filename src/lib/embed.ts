import { escapeXml } from "@/lib/rss";

/**
 * Código de inserción de un episodio. Se usa en la página pública del episodio
 * y en el estudio, para que el creador lo copie en su web.
 */
export function episodeEmbedCode({
  origin,
  id,
  title,
}: {
  origin: string;
  id: string;
  title: string;
}): string {
  return `<iframe src="${origin}/embed/${id}" width="100%" height="190" style="border:0;border-radius:12px" loading="lazy" title="${escapeXml(title)}"></iframe>`;
}
