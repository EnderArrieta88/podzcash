import type { Metadata } from "next";
import { requireUser } from "@/lib/auth/guards";
import { PasswordForm } from "@/components/studio/password-form";

export const metadata: Metadata = { title: "Cuenta" };

export default async function AccountPage() {
  const user = await requireUser();

  return (
    <div className="max-w-lg">
      <h1 className="font-heading text-2xl font-bold tracking-tight">Cuenta</h1>
      <p className="mt-2 text-sm text-muted">
        Sesión iniciada como <span className="text-text">{user.email}</span>.
      </p>

      <div className="mt-6 rounded-xl border border-border bg-surface p-6">
        <h2 className="font-heading text-sm font-semibold">Cambiar contraseña</h2>
        <p className="mt-1 text-xs text-muted">
          Al cambiarla se cierran las demás sesiones abiertas.
        </p>

        <div className="mt-5">
          <PasswordForm />
        </div>
      </div>
    </div>
  );
}
