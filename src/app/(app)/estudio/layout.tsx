import Link from "next/link";
import { ExternalLink, LogOut } from "lucide-react";
import { requireUser } from "@/lib/auth/guards";
import { storage } from "@/lib/storage";
import { StudioNav } from "./nav";
import { logoutAction } from "./actions";

export default async function StudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();

  return (
    <div className="mx-auto w-full max-w-6xl">
      <div className="flex flex-col gap-8 lg:flex-row">
        <aside className="lg:w-56 lg:shrink-0">
          <div className="rounded-2xl border border-border bg-surface p-4">
            <p className="text-[11px] uppercase tracking-[0.14em] text-subtle">
              Estudio
            </p>

            <div className="mt-3 flex items-center gap-2.5">
              {user.channel?.avatarKey ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={storage.url(user.channel.avatarKey)}
                  alt=""
                  className="size-9 rounded-full border border-border object-cover"
                />
              ) : (
                <span className="flex size-9 items-center justify-center rounded-full bg-brand-soft text-sm font-medium text-brand">
                  {(user.channel?.displayName ?? user.name).slice(0, 1).toUpperCase()}
                </span>
              )}
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">
                  {user.channel?.displayName ?? user.name}
                </p>
                <p className="truncate text-xs text-subtle">
                  {user.channel ? `@${user.channel.handle}` : "Sin canal"}
                </p>
              </div>
            </div>

            <StudioNav isAdmin={user.role === "admin"} />

            <div className="mt-5 space-y-1 border-t border-border pt-4">
              {user.channel && (
                <Link
                  href={`/c/${user.channel.handle}`}
                  target="_blank"
                  className="flex items-center gap-2.5 rounded-[10px] px-3 py-2 text-sm text-muted transition-colors hover:bg-surface-2 hover:text-text"
                >
                  <ExternalLink size={16} strokeWidth={1.75} />
                  Ver canal público
                </Link>
              )}

              <form action={logoutAction}>
                <button
                  type="submit"
                  className="flex w-full items-center gap-2.5 rounded-[10px] px-3 py-2 text-sm text-muted transition-colors hover:bg-surface-2 hover:text-text"
                >
                  <LogOut size={16} strokeWidth={1.75} />
                  Cerrar sesión
                </button>
              </form>
            </div>
          </div>
        </aside>

        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
}

