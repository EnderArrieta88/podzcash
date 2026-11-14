# Decisiones de arquitectura (ADR)

Registro de decisiones técnicas relevantes y sus consecuencias.

| ADR | Decisión | Estado |
|---|---|---|
| [0001](0001-app-nativa.md) | App nativa, CarPlay y Android Auto | Propuesta |
| [0002](0002-analitica-privacidad.md) | Analítica propia, agregada y sin cookies | Aceptada |
| [0003](0003-versionado-y-releases.md) | Versionado semántico y releases automáticos | Aceptada |
| [0004](0004-almacenamiento-medios.md) | Almacenamiento de medios en disco local | Aceptada |
| [0005](0005-migraciones-puente.md) | Migraciones puente en producción | Aceptada con deuda |

## Cómo agregar una ADR

1. Crear `docs/adr/000N-titulo-corto.md` con fecha, estado, contexto y decisión.
2. Añadir la fila a esta tabla.
3. Si la decisión cambia, no se borra: se marca como reemplazada y se enlaza la
   nueva.
