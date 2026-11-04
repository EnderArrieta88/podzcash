"use client";

import { useActionState } from "react";
import Link from "next/link";
import { loginAction } from "@/app/(auth)/actions";
import { Input, Label, FieldError } from "@/components/ui/field";
import { SubmitButton } from "@/components/ui/submit-button";

export function LoginForm() {
  const [state, action] = useActionState(loginAction, null);

  return (
    <form action={action} className="space-y-5">
      {state?.error && (
        <p className="rounded-[10px] border border-danger/30 bg-danger/10 px-3.5 py-2.5 text-sm text-danger">
          {state.error}
        </p>
      )}

      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="tu@email.com"
        />
        <FieldError>{state?.fields?.email}</FieldError>
      </div>

      <div>
        <Label htmlFor="password">Contraseña</Label>
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

      <SubmitButton className="w-full" pendingLabel="Entrando…">
        Entrar
      </SubmitButton>

      <p className="text-center text-sm text-muted">
        ¿Tienes un código de invitación?{" "}
        <Link href="/registro" className="text-brand hover:underline">
          Crear cuenta
        </Link>
      </p>
    </form>
  );
}
