# ADR 0003: versionado semántico y releases automáticos

- **Fecha:** 13 de noviembre de 2026
- **Estado:** aceptada
- **Contexto:** `release-please-config.json`, `.github/workflows/release.yml`

## Contexto

La plataforma ya tiene despliegues frecuentes y no tenía tags, changelog ni una
forma consistente de saber qué versión estaba en producción.

## Decisión

- Usar **SemVer** con `MAJOR.MINOR.PATCH`.
- Escribir títulos de PR en **Conventional Commits**.
- Usar **release-please** para agrupar cambios, actualizar `package.json` y
  `CHANGELOG.md`, crear el tag `vX.Y.Z` y la GitHub Release.
- Mantener el despliegue **manual** después de fusionar el PR de release.
- Exponer versión y commit del build en `/api/health`.

## Consecuencias

- `feat` sube MINOR; `fix`, `perf` y `refactor` suben PATCH.
- `docs`, `style`, `test`, `ci`, `build` y `chore` no generan release.
- El changelog se escribe en español y no se edita a mano.
- El PR de release lo crea `GITHUB_TOKEN`, por lo que no dispara CI; se puede
  usar `RELEASE_PLEASE_TOKEN` si se quiere validar antes de fusionarlo.
- Un despliegue siempre debe corresponder a un tag publicado.
