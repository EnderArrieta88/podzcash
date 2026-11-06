"use client";

import { useActionState } from "react";
import Link from "next/link";
import { requestPasswordResetAction } from "@/app/(site)/(auth)/actions";
import { FieldError, Input, Label } from "@/components/ui/field";
import { SubmitButton } from "@/components/ui/submit-button";
import type { ResetRequestLabels } from "@/lib/i18n/auth";

export function ResetRequestForm({
  labels,
}: {
  labels: ResetRequestLabels;
}) {
  const [state, action] = useActionState(requestPasswordResetAction, null);

  if (state?.ok) {
    return (
      <div>
        <p className="rounded-xl border border-jade/30 bg-jade-soft px-4 py-3 text-sm text-jade-bright">
          {labels.sentTitle}
        </p>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          {labels.sentBody}
        </p>
        <Link
          href="/entrar"
          className="mt-5 inline-block text-sm text-brand hover:underline"
        >
          {labels.backToLogin}
        </Link>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-5">
      {state?.error && (
        <p className="rounded-[10px] border border-danger/30 bg-danger/10 px-3.5 py-2.5 text-sm text-danger">
          {state.error}
        </p>
      )}

      <div>
        <Label htmlFor="email">{labels.email}</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder={labels.emailPlaceholder}
        />
        <FieldError>{state?.fields?.email}</FieldError>
      </div>

      <SubmitButton className="w-full" pendingLabel={labels.pending}>
        {labels.submit}
      </SubmitButton>

      <p className="text-center text-sm text-muted">
        <Link href="/entrar" className="text-brand hover:underline">
          {labels.backToLogin}
        </Link>
      </p>
    </form>
  );
}
