import "server-only";
import pkg from "../../package.json";

/**
 * Versión publicada de la app. release-please actualiza `package.json` y el
 * CHANGELOG al crear cada release.
 */
export const APP_VERSION = pkg.version;

/**
 * Commit con el que se compiló el build. next.config lo inyecta al compilar.
 */
export const APP_COMMIT = process.env.APP_COMMIT || "dev";
