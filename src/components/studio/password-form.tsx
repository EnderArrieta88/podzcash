"use client";

import { useActionState, useState } from "react";
import { changePasswordAction } from "@/app/(app)/estudio/actions";
import { FieldError, Input, Label } from "@/components/ui/field";
import { SubmitButton } from "@/components/ui/submit-button";

export function PasswordForm() {
  const [state, action] = useActionState(changePasswordAction, null);
  const [values, setValues] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  return (
    <form action={action} className="space-y-5">
      {state?.ok && (
        <p className="rounded-xl border border-jade/30 bg-jade-soft px-4 py-2.5 text-sm text-jade-bright">
          Contraseña actualizada. Cerramos las demás sesiones por seguridad.
        </p>
      )}

      {state?.error && (
        <p className="rounded-xl border border-danger/30 bg-danger/10 px-4 py-2.5 text-sm text-danger">
          {state.error}
        </p>
      )}

      <div>
        <Label htmlFor="currentPassword">Contraseña actual</Label>
        <Input
          id="currentPassword"
          name="currentPassword"
          type="password"
          autoComplete="current-password"
          value={values.currentPassword}
          onChange={(event) =>
            setValues((current) => ({
              ...current,
              currentPassword: event.target.value,
            }))
          }
          required
        />
        <FieldError>{state?.fields?.currentPassword}</FieldError>
      </div>

      <div>
        <Label htmlFor="newPassword">Nueva contraseña</Label>
        <Input
          id="newPassword"
          name="newPassword"
          type="password"
          autoComplete="new-password"
          minLength={8}
          value={values.newPassword}
          onChange={(event) =>
            setValues((current) => ({
              ...current,
              newPassword: event.target.value,
            }))
          }
          required
        />
        <FieldError>{state?.fields?.newPassword}</FieldError>
      </div>

      <div>
        <Label htmlFor="confirmPassword">Repetir la nueva contraseña</Label>
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          minLength={8}
          value={values.confirmPassword}
          onChange={(event) =>
            setValues((current) => ({
              ...current,
              confirmPassword: event.target.value,
            }))
          }
          required
        />
        <FieldError>{state?.fields?.confirmPassword}</FieldError>
      </div>

      <div className="border-t border-border pt-5">
        <SubmitButton pendingLabel="Guardando…">Cambiar contraseña</SubmitButton>
      </div>
    </form>
  );
}
