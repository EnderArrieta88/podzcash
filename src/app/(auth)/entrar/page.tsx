import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = { title: "Entrar" };

export default async function LoginPage() {
  const user = await getCurrentUser();
  if (user) redirect("/estudio");

  return (
    <div>
      <h1 className="font-display text-4xl tracking-tight">Entra a tu estudio</h1>
      <p className="mt-2 text-sm text-muted">
        Publica tu contenido y gestiona tu canal.
      </p>

      <div className="mt-8 rounded-2xl border border-border bg-surface p-6">
        <LoginForm />
      </div>
    </div>
  );
}
