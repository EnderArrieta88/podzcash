"use client";

import { useActionState } from "react";
import Link from "next/link";
import { loginAction } from "@/app/(site)/(auth)/actions";
import { Input, Label, FieldError } from "@/components/ui/field";
import { SubmitButton } from "@/components/ui/submit-button";
import type { LoginLabels } from "@/lib/i18n/auth";

export function LoginForm({ labels }: { labels: LoginLabels }) {
  const [state, action] = useActionState(loginAction, null);

  return (
    <form action={action} className="space-y-5">
      {state?.error && (
        <div className="rounded-[10px] border border-danger/30 bg-danger/10 px-3.5 py-2.5 text-sm text-danger">
          <p>{state.error}</p>
          {state.code === "unverified" && (
            <Link
              href="/verificar"
              className="mt-1 inline-block font-medium text-brand hover:underline"
            >
              {labels.resendVerification}
            </Link>
          )}
        </div>
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

      <div>
        <Label htmlFor="password">{labels.password}</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          placeholder="••••••••"
        />
        <FieldError>{state?.fields?.password}</FieldError>
      </div>

      <div className="text-right">
        <Link
          href="/recuperar"
          className="text-xs text-muted hover:text-text"
        >
          {labels.forgotPassword}
        </Link>
      </div>

      <SubmitButton className="w-full" pendingLabel={labels.pending}>
        {labels.submit}
      </SubmitButton>

      <p className="text-center text-sm text-muted">
        {labels.invitePrompt}{" "}
        <Link href="/registro" className="text-brand hover:underline">
          {labels.createAccount}
        </Link>
      </p>
    </form>
  );
}

