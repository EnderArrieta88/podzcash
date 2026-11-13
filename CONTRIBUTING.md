# Cómo trabajar en PodZcash

Este documento describe el flujo para que cada cambio quede registrado como un
Pull Request con su contexto, su diff y sus comprobaciones.

## Regla principal

`main` es la rama estable. **No se hace push directo a `main`**: cada cambio
entra por una rama y un Pull Request.

```
main  ──●────────────●────────────●──→
         \          / \          /
          ●─rama A─●   ●─rama B─●
             PR #1        PR #2
```

## Repositorio público: quién puede hacer qué

El repositorio es público y de código abierto. Eso no significa que cualquiera
pueda fusionar o desplegar.

| Persona | Puede | No puede |
| --- | --- | --- |
| Colaborador externo (fork) | Abrir PR, comentar, proponer cambios | Push en el repo, fusionar, desplegar |
| Colaborador invitado | Abrir PR, comentar, etiquetas (rol Read o Triage) | Push en `main`, fusionar, desplegar |
| Mantenedor (`@EnderArrieta88`) | Revisar, fusionar, desplegar, administrar | — |

Reglas prácticas:

- A los colaboradores **no se les da rol Write, Maintain ni Admin**.
  En GitHub, poder hacer push al repositorio también habilita el botón de merge.
- Si se invita a alguien, usar **Read** o **Triage**. Para escribir código,
  esa persona hace un fork y abre el PR desde ahí.
- Solo el mantenedor tiene permisos de escritura y administración.
- El archivo `.github/CODEOWNERS` marca al mantenedor como revisor obligatorio
  de todo el repositorio.

## Estándares del proyecto

- **Licencia:** MIT. Todo el código nuevo debe ser compatible con esa licencia.
- **Conducta:** se aplica [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md).
- **Seguridad:** no publiques vulnerabilidades en issues. Usa
  [SECURITY.md](SECURITY.md).
- **Marca:** revisa [TRADEMARK.md](TRADEMARK.md) antes de usar el nombre o el
  logo en materiales públicos.
- **Estilo:** commits atómicos, PRs pequeños, mensajes claros y documentación
  actualizada. Seguimos los principios de revisión de `librustzcash` adaptados a
  TypeScript: revisión antes de fusionar, CI obligatorio, historial legible y
  ningún secreto en el repositorio. El formato se aplica con `npm run format` y
  se verifica con `npm run format:check`.
- **Arquitectura:** las reglas de capas y dependencias están en
  [ARCHITECTURE.md](ARCHITECTURE.md).
- **Pruebas:** los tests unitarios viven en `*.test.ts` y deben pasar en CI.
  `npm run check` ejecuta lint, formato, tipos y tests; `npm run build` valida
  el build.
- **Datos:** no subas bases de datos, audios, portadas, `.env` ni datos de
  producción.

## 1. Preparar la rama

Partir siempre de `main` actualizado:

```powershell
git switch main
git pull
git switch -c feat/nombre-corto
```

Nombres recomendados:

| Prefijo | Uso |
| --- | --- |
| `feat/` | Funcionalidad nueva |
| `fix/` | Corrección de errores |
| `i18n/` | Traducciones y textos |
| `design/` | Interfaz y estilos |
| `deploy/` | Infraestructura, CI o despliegue |
| `docs/` | Documentación |

## 2. Commits

Los mensajes siguen [Conventional Commits](https://www.conventionalcommits.org/es/v1.0.0/).
Como el merge es squash, **el título del PR se convierte en el commit de
`main`**, así que también debe llevar el prefijo correcto.

```text
feat: agregar selector de idioma
fix: corregir host del feed RSS
docs: actualizar guía de despliegue
refactor: dividir el contexto del reproductor
perf: reducir consultas del panel
ci: reintentar si Passenger devuelve 503
```

| Prefijo | Uso | Versión |
| --- | --- | --- |
| `feat` | Funcionalidad nueva | MINOR |
| `fix` | Corrección de errores | PATCH |
| `perf` | Mejora de rendimiento | PATCH |
| `refactor` | Cambio interno sin alterar comportamiento | PATCH |
| `docs` | Documentación | PATCH |
| `style`, `test`, `ci`, `build`, `chore` | Mantenimiento | Sin release |
| `feat!`, `fix!` o `BREAKING CHANGE:` | Cambio incompatible | MAJOR |

Un commit debe poder explicarse solo. Si el cambio mezcla cosas distintas,
conviene separarlo en commits o en PRs.

### Versiones y changelog

El proyecto usa [versionado semántico](https://semver.org/lang/es/) y
[release-please](https://github.com/googleapis/release-please) para mantener el
historial.

1. Al fusionar PRs en `main`, el workflow `.github/workflows/release.yml`
   agrupa los cambios y abre un **PR de release**.
2. Ese PR actualiza `package.json` y `CHANGELOG.md` con la versión propuesta.
3. Al fusionarlo se crea el tag `vX.Y.Z` y la **GitHub Release** con las notas.
4. El despliegue se hace después, como siempre, desde Actions.

No se edita `CHANGELOG.md` a mano: release-please lo reescribe en cada release.
La versión publicada y el commit del build se pueden consultar en
`/api/health`.

## 3. Abrir el Pull Request

```powershell
git push -u origin feat/nombre-corto
gh pr create --base main --fill
```

El PR usa la plantilla de `.github/pull_request_template.md`. Completar:

- Qué cambia y por qué.
- Cómo probarlo.
- Si requiere migración o un paso manual en producción.
- Capturas, si es visual.

GitHub guarda para siempre el PR, aunque después se borre la rama.

## 4. Validación automática

Cada PR a `main` ejecuta `.github/workflows/ci.yml`:

1. `npm ci`
2. `npx prisma generate`
3. `npm run lint`
4. `npm run typecheck`
5. `npm test`
6. `npm run build`

Si algo falla, el PR no debe fusionarse. En local se puede reproducir con:

```powershell
npm run check
npm run build
```

## 5. Fusionar

- Revisar el diff completo antes de fusionar, aunque el cambio sea propio.
- Estrategia recomendada: **Squash and merge**.
  - Deja un commit limpio por PR en `main`.
  - El detalle de cada commit de la rama queda guardado en el PR.
- Borrar la rama después del merge.

```powershell
gh pr merge --squash --delete-branch
```

## 6. Desplegar

El deploy es **manual** y no se dispara al fusionar un PR:

1. GitHub → Actions → **Deploy a producción** → Run workflow.
2. Elegir la rama `main` y escribir `deploy` para confirmar.
3. Aprobar el entorno **production** (solo el mantenedor puede hacerlo).
4. Esperar a que termine correctamente.

El workflow de deploy:

- Solo se ejecuta desde `main`.
- Usa el entorno `production`, con revisores obligatorios y rama permitida
  `main`.
- Tiene permisos de solo lectura sobre el repositorio.
- No recibe secretos en PRs de forks.

Después del deploy conviene crear una etiqueta de versión:

```powershell
git switch main
git pull
git tag -a v2026.11.05 -m "Deploy: i18n y URLs /canal/@"
git push origin v2026.11.05
```

Las Releases de GitHub permiten generar notas automáticas con los PRs y commits
incluidos.

## 7. Correcciones urgentes

También van por PR. Si la urgencia impide esperar, se puede abrir un PR pequeño
con el prefijo `fix/`, validarlo y fusionarlo rápido. Evitar el push directo
salvo que sea una emergencia real y documentarlo después.

## Configuración de GitHub (solo mantenedor)

### Protección de `main`

Settings → Rules → Rulesets → New branch ruleset:

- Target: `main`.
- **Require a pull request before merging**.
- **Required approvals: 1**.
- **Require review from Code Owners** (usa `.github/CODEOWNERS`).
- **Require status checks to pass**: seleccionar **Validar PR**.
- **Block force pushes**.
- **Restrict deletions**.
- Bypass list: solo **Repository admin** (el mantenedor), para poder fusionar
  sus propios PRs.

Con esto, un colaborador externo puede abrir PRs, pero no fusionarlos. Aunque
tuviera el botón visible, no tiene permiso de escritura.

### Deploy protegido

Settings → Environments → `production`:

- **Required reviewers**: `@EnderArrieta88`.
- **Deployment branches and tags**: solo `main`.
- Guardar los secretos de deploy como **environment secrets** (no como
  repository secrets), para que solo estén disponibles tras la aprobación.

Además, en Settings → Actions → General:

- **Fork pull request workflows**: exigir aprobación para todos los
  colaboradores externos.
- **Workflow permissions**: solo lectura por defecto.

### Resultado

- Un colaborador puede proponer cambios por PR.
- No puede fusionar: no tiene rol Write.
- No puede desplegar: no puede ejecutar el workflow ni aprobar `production`.
- Solo el mantenedor revisa, fusiona y despliega.
