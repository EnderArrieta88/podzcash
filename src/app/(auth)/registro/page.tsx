import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/session";
import { RegisterForm } from "@/components/auth/register-form";

export const metadata: Metadata = { title: "Crear cuenta" };

export default async function RegisterPage() {
  const user = await getCurrentUser();
  if (user) redirect("/estudio");

  const firstUser = (await prisma.user.count()) === 0;

  return (
    <div>
      <h1 className="font-display text-4xl tracking-tight">
        {firstUser ? "Crea el primer canal" : "Crea tu cuenta"}
      </h1>
      <p className="mt-2 text-sm text-muted">
        {firstUser
          ? "PodZcash está vacío. Tu cuenta será la administradora del proyecto."
          : "PodZcash es por invitación. Necesitas un código para entrar."}
      </p>

      <div className="mt-8 rounded-2xl border border-border bg-surface p-6">
        <RegisterForm firstUser={firstUser} />
      </div>
    </div>
  );
}
