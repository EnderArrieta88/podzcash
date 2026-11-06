"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

export function CopyButton({
  value,
  copyLabel,
  copiedLabel,
}: {
  value: string;
  copyLabel: string;
  copiedLabel: string;
}) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      // Sin permisos de portapapeles: el código sigue visible para copiar a mano.
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      className="inline-flex size-8 items-center justify-center rounded-md border border-border text-muted transition-colors hover:border-border-strong hover:text-text"
      aria-label={copied ? copiedLabel : copyLabel}
    >
      {copied ? (
        <Check size={14} className="text-success" />
      ) : (
        <Copy size={14} />
      )}
    </button>
  );
}
