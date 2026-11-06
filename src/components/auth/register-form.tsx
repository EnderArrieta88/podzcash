"use client";

import { useActionState } from "react";
import Link from "next/link";
import { registerAction } from "@/app/(site)/(auth)/actions";
import { Input, Label, FieldError, FieldHint } from "@/components/ui/field";
import { SubmitButton } from "@/components/ui/submit-button";
import type { RegisterLabels } from "@/lib/i18n/auth";

export function RegisterForm({
  firstUser,
  labels,
}: {
  firstUser: boolean;
  labels: RegisterLabels;
}) {
  const [state, action] = useActionState(registerAction, null);

  return (
    <form action={action} className="space-y-5">
      {state?.error && (
        <p className="rounded-[10px] border border-danger/30 bg-danger/10 px-3.5 py-2.5 text-sm text-danger">
          {state.error}
        </p>
      )}

      {firstUser && (
        <p className="rounded-[10px] border border-brand/30 bg-brand-soft/60 px-3.5 py-2.5 text-sm text-brand">
          {labels.firstUserNote}
        </p>
      )}

      <div>
        <Label htmlFor="name">{labels.name}</Label>
        <Input
          id="name"
          name="name"
          autoComplete="name"
          required
          placeholder={labels.namePlaceholder}
        />
        <FieldError>{state?.fields?.name}</FieldError>
      </div>

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

      <div>
        <Label htmlFor="password">{labels.password}</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          placeholder={labels.passwordPlaceholder}
        />
        <FieldError>{state?.fields?.password}</FieldError>
      </div>

      {!firstUser && (
        <div>
          <Label htmlFor="inviteCode">{labels.inviteCode}</Label>
          <Input
            id="inviteCode"
            name="inviteCode"
            required
            autoComplete="off"
            placeholder="XXXXX-XXXXX"
            className="font-mono tracking-wider uppercase"
          />
          <FieldError>{state?.fields?.inviteCode}</FieldError>
          <FieldHint>{labels.inviteHint}</FieldHint>
        </div>
      )}

      <SubmitButton className="w-full" pendingLabel={labels.pending}>
        {labels.submit}
      </SubmitButton>

      {/* Honeypot: invisible para personas, tentador para bots. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-[9999px] top-0 h-0 w-0 overflow-hidden"
      >
        <label htmlFor="website">Website</label>
        <input
          id="website"
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      <p className="text-center text-sm text-muted">
        {labels.loginPrompt}{" "}
        <Link href="/entrar" className="text-brand hover:underline">
          {labels.signIn}
        </Link>
      </p>
    </form>
  );
}

