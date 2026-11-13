import "server-only";
import pkg from "../../package.json";

/**
 * Versión publicada de la app. release-please actualiza `package.json` y el
 * CHANGELOG al crear cada release.
 */
export const APP_VERSION = pkg.version;

/**
 * Commit con el que se compiló el build. Se inyecta en el despliegue.
 */
export const APP_COMMIT = process.env.GIT_SHA?.slice(0, 7) ?? "dev";
