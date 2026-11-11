"use client";

import { useEffect, useRef } from "react";
import { markCommentsSeenAction } from "@/features/comments/actions";

/**
 * Marca los comentarios como vistos al abrir la bandeja. Va en un efecto
 * para no escribir en la base durante el render del servidor.
 */
export function MarkCommentsSeen() {
  const done = useRef(false);

  useEffect(() => {
    if (done.current) return;
    done.current = true;

    void markCommentsSeenAction().catch(() => {
      // El aviso de no leídos es best-effort.
    });
  }, []);

  return null;
}
