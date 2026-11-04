"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import type { ChannelLink } from "@/lib/links";
import { Input } from "@/components/ui/field";

const EMPTY: ChannelLink = { label: "", url: "" };

export function LinksEditor({ initial }: { initial: ChannelLink[] }) {
  const [links, setLinks] = useState<ChannelLink[]>(initial);

  function update(index: number, patch: Partial<ChannelLink>) {
    setLinks((current) =>
      current.map((link, position) =>
        position === index ? { ...link, ...patch } : link,
      ),
    );
  }

  function remove(index: number) {
    setLinks((current) => current.filter((_, position) => position !== index));
  }

  return (
    <div className="space-y-3">
      <span className="block text-sm font-medium text-text">
        Enlaces <span className="font-normal text-subtle">(opcional)</span>
      </span>

      <input type="hidden" name="links" value={JSON.stringify(links)} />

      {links.map((link, index) => (
        <div key={index} className="flex items-start gap-2">
          <Input
            aria-label={`Etiqueta del enlace ${index + 1}`}
            placeholder="Etiqueta"
            value={link.label}
            onChange={(event) => update(index, { label: event.target.value })}
            className="w-32 shrink-0"
          />
          <Input
            aria-label={`URL del enlace ${index + 1}`}
            placeholder="https://…"
            value={link.url}
            onChange={(event) => update(index, { url: event.target.value })}
          />
          <button
            type="button"
            onClick={() => remove(index)}
            className="mt-1 inline-flex size-9 shrink-0 items-center justify-center rounded-md border border-border text-muted transition-colors hover:border-danger/40 hover:text-danger"
            aria-label="Quitar enlace"
          >
            <X size={14} />
          </button>
        </div>
      ))}

      {links.length < 5 && (
        <button
          type="button"
          onClick={() => setLinks((current) => [...current, { ...EMPTY }])}
          className="inline-flex items-center gap-1.5 text-sm text-brand hover:underline"
        >
          <Plus size={14} /> Agregar enlace
        </button>
      )}
    </div>
  );
}
