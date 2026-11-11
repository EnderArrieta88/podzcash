"use client";

import { useActionState } from "react";
import { resendVerificationAction } from "@/features/auth/actions";
import { FieldError, Input, Label } from "@/components/ui/field";
import { SubmitButton } from "@/components/ui/submit-button";
import type { VerifyLabels } from "@/lib/i18n/auth";

export function ResendVerificationForm({
  labels,
  defaultEmail = "",
}: {
  labels: VerifyLabels;
  defaultEmail?: string;
}) {
  const [state, action] = useActionState(resendVerificationAction, null);

  if (state?.ok) {
    return (
      <div>
        <p className="rounded-xl border border-jade/30 bg-jade-soft px-4 py-3 text-sm text-jade-bright">
          {labels.sentTitle}
        </p>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          {labels.sentBody}
        </p>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-4">
      <div>
        <Label htmlFor="verify-email">{labels.email}</Label>
        <Input
          id="verify-email"
          name="email"
          type="email"
          autoComplete="email"
          required
          defaultValue={defaultEmail}
          placeholder={labels.emailPlaceholder}
        />
        <FieldError>{state?.fields?.email}</FieldError>
      </div>

      <SubmitButton className="w-full" pendingLabel={labels.pending}>
        {labels.submit}
      </SubmitButton>
    </form>
  );
}
