# SEO y metadatos sociales

PodZcash genera metadatos propios para canales y episodios, con imagen Open
Graph dinámica.

## Qué se genera

- **Canonical** y `og:url` con el dominio configurado en `SITE_URL`.
- **Open Graph y Twitter Card** desde `src/lib/seo.ts`.
- **Imagen OG 1200×630** por canal y episodio:
  - `/canal/@handle/og`
  - `/canal/@handle/slug/og`
- **JSON-LD** para canal y episodio.
- **Sitemap** con páginas estáticas, canales y episodios publicados.
- **RSS** con GUID, `podcast:locked`, block y `new-feed-url`.

Las imágenes OG usan texto y marca, no la portada, para que sean legibles y
consistentes. Se generan con `next/og` y devuelven `image/png`.

## Dónde vive

| Pieza | Archivo |
|---|---|
| Helpers de metadatos | `src/lib/seo.ts` |
| OG de canal | `src/app/(app)/canal/[handle]/og/route.tsx` |
| OG de episodio | `src/app/(app)/canal/[handle]/[slug]/og/route.tsx` |
| Consultas mínimas para OG | `src/features/*/og-queries.ts` |
| Sitemap | `src/app/sitemap.ts` |
| Pruebas E2E | `e2e/seo.spec.ts` |

Las consultas de OG no cargan `storage` para que Turbopack no trace todo el
proyecto al compilar.

## Reglas

- Un canal o episodio inexistente devuelve **404** en su ruta OG.
- Un episodio en borrador no genera imagen OG.
- Los metadatos de una página siempre apuntan a su ruta `/og`.
- El sitemap solo incluye episodios publicados.
- Cualquier página nueva con contenido público debe añadir canonical,
  descripción y JSON-LD si aplica.

## Verificación

`e2e/seo.spec.ts` comprueba:

- `og:image`, `og:title`, `og:type` y canonical.
- Respuesta `image/png` y firma PNG de las imágenes.
- 404 para OG inexistente.
- Sitemap con canal y episodio.
- JSON-LD válido.
