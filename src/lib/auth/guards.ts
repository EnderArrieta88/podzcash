import "server-only";
import { redirect } from "next/navigation";
import { getCurrentUser, type CurrentUser } from "@/lib/auth/session";

export async function requireUser(): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/entrar");
  return user;
}

export async function requireAdmin(): Promise<CurrentUser> {
  const user = await requireUser();
  if (user.role !== "admin") redirect("/estudio");
  return user;
}
