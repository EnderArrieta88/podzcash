import type { Metadata } from "next";
import { requireUser } from "@/lib/auth/guards";
import { Input, Label } from "@/components/ui/field";
import { changePasswordAction } from "../actions";

export const metadata: Metadata = { title: "Cuenta" };

const errors: Record<string, string> = {
  invalid:
    "Revisá los datos: la contraseña nueva necesita al menos 8 caracteres y ambas deben coincidir.",
  current: "La contraseña actual no es correcta.",
  same: "La nueva contraseña debe ser distinta de la actual.",
};

export default async function AccountPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; error?: string }>;
}) {
  const user = await requireUser();
  const params = await searchParams;

  const error = params.error
    ? (errors[params.error] ?? "No se pudo cambiar la contraseña.")
    : null;
  const done = params.ok === "1";

  return (
    <div className="max-w-lg">
      <h1 className="font-heading text-2xl font-bold tracking-tight">Cuenta</h1>
      <p className="mt-2 text-sm text-muted">
        Sesión iniciada como <span className="text-text">{user.email}</span>.
      </p>

      <div className="mt-6 rounded-xl border border-border bg-surface p-6">
        <h2 className="font-heading text-sm font-semibold">
          Cambiar contraseña
        </h2>
        <p className="mt-1 text-xs text-muted">
          Al cambiarla se cierran las demás sesiones abiertas.
        </p>

        {done && (
          <p className="mt-4 rounded-xl border border-jade/30 bg-jade-soft px-4 py-2.5 text-sm text-jade-bright">
            Contraseña actualizada.
          </p>
        )}

        {error && (
          <p className="mt-4 rounded-xl border border-danger/30 bg-danger/10 px-4 py-2.5 text-sm text-danger">
            {error}
          </p>
        )}

        <form action={changePasswordAction} className="mt-5 space-y-5">
          <div>
            <Label htmlFor="currentPassword">Contraseña actual</Label>
            <Input
              id="currentPassword"
              name="currentPassword"
              type="password"
              autoComplete="current-password"
              required
            />
          </div>

          <div>
            <Label htmlFor="newPassword">Nueva contraseña</Label>
            <Input
              id="newPassword"
              name="newPassword"
              type="password"
              autoComplete="new-password"
              minLength={8}
              required
            />
          </div>

          <div>
            <Label htmlFor="confirmPassword">Repetir la nueva contraseña</Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              minLength={8}
              required
            />
          </div>

          <div className="border-t border-border pt-5">
            <button
              type="submit"
              className="inline-flex h-11 items-center justify-center rounded-full bg-brand px-6 text-sm font-medium text-[#17130a] transition-colors hover:bg-brand-strong disabled:opacity-60"
            >
              Cambiar contraseña
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
