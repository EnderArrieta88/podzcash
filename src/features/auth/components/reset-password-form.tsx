"use client";

import { useActionState } from "react";
import { resetPasswordAction } from "@/features/auth/actions";
import { FieldError, Input, Label } from "@/components/ui/field";
import { SubmitButton } from "@/components/ui/submit-button";
import type { ResetLabels } from "@/lib/i18n/auth";

export function ResetPasswordForm({
  token,
  labels,
}: {
  token: string;
  labels: ResetLabels;
}) {
  const [state, action] = useActionState(resetPasswordAction, null);

  return (
    <form action={action} className="space-y-5">
      <input type="hidden" name="token" value={token} />

      {state?.error && (
        <p className="rounded-[10px] border border-danger/30 bg-danger/10 px-3.5 py-2.5 text-sm text-danger">
          {state.error}
        </p>
      )}

      <div>
        <Label htmlFor="newPassword">{labels.newPassword}</Label>
        <Input
          id="newPassword"
          name="newPassword"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
        />
        <FieldError>{state?.fields?.newPassword}</FieldError>
      </div>

      <div>
        <Label htmlFor="confirmPassword">{labels.confirmPassword}</Label>
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
        />
        <FieldError>{state?.fields?.confirmPassword}</FieldError>
      </div>

      <SubmitButton className="w-full" pendingLabel={labels.pending}>
        {labels.submit}
      </SubmitButton>
    </form>
  );
}
