# Backups de producción

El workflow **Backup de producción** (`.github/workflows/backup.yml`) copia la
base SQLite y el directorio `.media`, verifica la base y guarda un archivo
cifrado como artefacto de GitHub Actions.

## Configuración obligatoria

Crear el secreto `BACKUP_PASSPHRASE` en GitHub:

```powershell
gh secret set BACKUP_PASSPHRASE
```

Guarda la frase en un gestor de contraseñas. **No se puede recuperar desde
GitHub** y sin ella el backup no se puede descifrar. No la subas al repositorio.

Si el secreto no existe, el workflow termina con un aviso y no genera backup.

## Qué hace

1. Descarga `prisma/dev.db` por FTP.
2. Copia `.media` (audio y portadas).
3. Ejecuta `PRAGMA integrity_check` sobre la base.
4. Empaqueta todo y lo cifra con AES-256 usando `BACKUP_PASSPHRASE`.
5. Descifra el artefacto y **lo restaura en un directorio temporal**.
6. Ejecuta `PRAGMA integrity_check` sobre la base restaurada y comprueba que
   existen usuarios, episodios y el directorio de medios.
7. Guarda el archivo `.tar.gz.gpg` como artefacto durante **7 días**.

Si cualquier paso falla, el workflow falla y GitHub envía la notificación
habitual al mantenedor.

## Restaurar en producción

Tiempo estimado: 20–40 minutos, según el tamaño de `.media`.

1. Descargar el artefacto desde **Actions → Backup de producción**.
2. Descifrar:
   ```bash
   gpg --output backup.tar.gz --decrypt podzcash-backup-AAAAMMDD-HHMM.tar.gz.gpg
   ```
3. Extraer:
   ```bash
   tar -xzf backup.tar.gz
   ```
4. Verificar antes de tocar producción:
   ```bash
   sqlite3 backup/prisma/dev.db "PRAGMA integrity_check;"
   sqlite3 backup/prisma/dev.db 'SELECT count(*) FROM "User";'
   ```
5. Hacer un backup del estado actual del servidor antes de sobrescribir.
6. Poner la app en mantenimiento desde cPanel si es posible.
7. Subir `prisma/dev.db` y `.media` al servidor por FTP.
8. Reiniciar Passenger tocando `tmp/restart.txt` o desde cPanel.
9. Verificar `/api/health`, una página pública y un inicio de sesión.
10. Documentar la restauración en el issue o en el historial de incidentes.

## Escalado

- Si `integrity_check` falla, probar el backup anterior.
- Si faltan medios, restaurar solo `.media` y conservar la base actual.
- Si el sitio no arranca, revisar `stderr.log` y el límite de procesos del
  hosting antes de repetir el deploy.

## Limitaciones

- La copia de SQLite se hace por FTP mientras la app puede estar escribiendo.
  Ejecutar el backup en horario de baja actividad y revisar
  `PRAGMA integrity_check`.
- Si aparecen `dev.db-wal` o `dev.db-shm`, deben incluirse en la copia.
- Un backup en GitHub Actions no sustituye una copia fuera de línea. Descargar
  periódicamente el artefacto y guardarlo en un almacenamiento cifrado.
- Probar una restauración completa antes de considerar el backup verificado.
  El workflow ya descifra, extrae y valida la base restaurada en cada ejecución.
