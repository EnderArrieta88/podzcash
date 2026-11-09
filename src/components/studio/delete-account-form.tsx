"use client";

import { useActionState } from "react";
import { deleteAccountAction } from "@/app/(app)/estudio/actions";
import { Input, Label } from "@/components/ui/field";
import type { StudioAccountContent } from "@/lib/i18n/studio-account";

export function DeleteAccountForm({
  email,
  labels,
}: {
  email: string;
  labels: StudioAccountContent["delete"];
}) {
  const [state, action, pending] = useActionState(
    deleteAccountAction,
    null,
  );

  return (
    <form action={action} className="mt-4 space-y-4">
      {state?.error && (
        <p className="rounded-xl border border-danger/30 bg-danger/10 px-4 py-2.5 text-sm text-danger">
          {state.error}
        </p>
      )}

      <div>
        <Label htmlFor="delete-password">{labels.password}</Label>
        <Input
          id="delete-password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
        />
      </div>

      <div>
        <Label htmlFor="delete-confirmation">{labels.confirmation}</Label>
        <p className="mb-1.5 text-xs text-subtle">
          {labels.confirmationHint} <code className="text-text">{email}</code>
        </p>
        <Input
          id="delete-confirmation"
          name="confirmation"
          type="email"
          autoComplete="off"
          required
        />
      </div>

      <label className="flex items-start gap-2 text-xs leading-relaxed text-muted">
        <input
          type="checkbox"
          name="acknowledge"
          required
          className="mt-0.5 size-4 accent-danger"
        />
        {labels.acknowledge}
      </label>

      <button
        type="submit"
        disabled={pending}
        className="inline-flex h-10 items-center justify-center rounded-full border border-danger/40 bg-danger/10 px-5 text-sm text-danger transition-colors hover:bg-danger/20 disabled:opacity-60"
      >
        {pending ? labels.pending : labels.submit}
      </button>
    </form>
  );
}
