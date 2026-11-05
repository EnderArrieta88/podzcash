"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

type CopyAddressProps = {
  address: string;
};

export function CopyAddress({ address }: CopyAddressProps) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      // Sin permisos de portapapeles no hay nada más que hacer.
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      className="mt-2 inline-flex h-8 w-full items-center justify-center gap-1.5 rounded-lg border border-border bg-surface-2 text-[11px] font-medium text-text transition-colors hover:border-border-strong"
    >
      {copied ? (
        <>
          <Check size={12} className="text-jade" />
          Dirección copiada
        </>
      ) : (
        <>
          <Copy size={12} />
          Copiar dirección
        </>
      )}
    </button>
  );
}
