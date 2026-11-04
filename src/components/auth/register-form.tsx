"use client";

import { useActionState } from "react";
import Link from "next/link";
import { registerAction } from "@/app/(auth)/actions";
import { Input, Label, FieldError, FieldHint } from "@/components/ui/field";
import { SubmitButton } from "@/components/ui/submit-button";

export function RegisterForm({ firstUser }: { firstUser: boolean }) {
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
          Eres la primera cuenta: se creará como administrador y no necesitas
          invitación.
        </p>
      )}

      <div>
        <Label htmlFor="name">Nombre</Label>
        <Input
          id="name"
          name="name"
          autoComplete="name"
          required
          placeholder="Cómo te llamas"
        />
        <FieldError>{state?.fields?.name}</FieldError>
      </div>

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
          autoComplete="new-password"
          required
          minLength={8}
          placeholder="Mínimo 8 caracteres"
        />
        <FieldError>{state?.fields?.password}</FieldError>
      </div>

      {!firstUser && (
        <div>
          <Label htmlFor="inviteCode">Código de invitación</Label>
          <Input
            id="inviteCode"
            name="inviteCode"
            required
            autoComplete="off"
            placeholder="XXXXX-XXXXX"
            className="font-mono tracking-wider uppercase"
          />
          <FieldError>{state?.fields?.inviteCode}</FieldError>
          <FieldHint>
            Te lo entrega un administrador de PodZcash. Sin código no se puede
            crear cuenta.
          </FieldHint>
        </div>
      )}

      <SubmitButton className="w-full" pendingLabel="Creando cuenta…">
        Crear cuenta
      </SubmitButton>

      <p className="text-center text-sm text-muted">
        ¿Ya tienes cuenta?{" "}
        <Link href="/entrar" className="text-brand hover:underline">
          Entrar
        </Link>
      </p>
    </form>
  );
}
