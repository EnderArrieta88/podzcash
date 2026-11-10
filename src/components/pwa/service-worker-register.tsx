"use client";

import { useEffect } from "react";

/**
 * Registra el service worker solo en producción. En desarrollo cachearía los
 * assets de `next dev` y haría más difícil ver los cambios.
 */
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;

    const register = () => {
      void navigator.serviceWorker.register("/sw.js", {
        scope: "/",
        updateViaCache: "none",
      }).catch((error) => {
        console.error("[pwa] No se pudo registrar el service worker:", error);
      });
    };

    if (document.readyState === "complete") {
      register();
      return;
    }

    window.addEventListener("load", register, { once: true });

    return () => window.removeEventListener("load", register);
  }, []);

  return null;
}
