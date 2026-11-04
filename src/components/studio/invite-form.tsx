"use client";

import { useActionState } from "react";
import { createInviteAction } from "@/app/estudio/actions";
import { Input } from "@/components/ui/field";
import { SubmitButton } from "@/components/ui/submit-button";

export function InviteForm() {
  const [state, action] = useActionState(createInviteAction, null);

  return (
    <form action={action} className="space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row">
        <Input
          name="note"
          maxLength={80}
          placeholder="Nota (opcional): para quién es"
          aria-label="Nota de la invitación"
        />
        <SubmitButton pendingLabel="Generando…">Generar código</SubmitButton>
      </div>

      {state?.error && <p className="text-xs text-danger">{state.error}</p>}
      {state?.ok && (
        <p className="text-xs text-success">Código generado y listo abajo.</p>
      )}
    </form>
  );
}
