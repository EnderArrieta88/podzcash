"use client";

import { useActionState } from "react";
import { createInviteAction } from "@/app/(app)/estudio/actions";
import { Input } from "@/components/ui/field";
import { SubmitButton } from "@/components/ui/submit-button";
import type { StudioInvitesContent } from "@/lib/i18n/studio-invites";

export function InviteForm({
  labels,
}: {
  labels: StudioInvitesContent["form"];
}) {
  const [state, action] = useActionState(createInviteAction, null);

  return (
    <form action={action} className="space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row">
        <Input
          name="note"
          maxLength={80}
          placeholder={labels.notePlaceholder}
          aria-label={labels.noteAria}
        />
        <SubmitButton pendingLabel={labels.pending}>{labels.submit}</SubmitButton>
      </div>

      {state?.error && <p className="text-xs text-danger">{state.error}</p>}
      {state?.ok && (
        <p className="text-xs text-success">{labels.generated}</p>
      )}
    </form>
  );
}

