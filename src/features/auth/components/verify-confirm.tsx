"use client";

import { useActionState } from "react";
import { confirmEmailAction } from "@/features/auth/actions";
import { SubmitButton } from "@/components/ui/submit-button";
import type { VerifyLabels } from "@/lib/i18n/auth";

export function VerifyConfirm({
  token,
  labels,
}: {
  token: string;
  labels: VerifyLabels;
}) {
  const [state, action] = useActionState(confirmEmailAction, null);

  return (
    <form action={action} className="space-y-4">
      {state?.error && (
        <p className="rounded-[10px] border border-danger/30 bg-danger/10 px-3.5 py-2.5 text-sm text-danger">
          {state.error}
        </p>
      )}

      <input type="hidden" name="token" value={token} />

      <SubmitButton className="w-full" pendingLabel={labels.confirming}>
        {labels.confirm}
      </SubmitButton>
    </form>
  );
}
