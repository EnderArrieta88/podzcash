import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { requireUser } from "@/lib/auth/guards";
import { StudioNav } from "./nav";

export default async function StudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();

  return (
    <div className="mx-auto w-full max-w-5xl">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-subtle">
            Estudio
          </p>
          <h1 className="mt-1 font-display text-3xl leading-none tracking-tight">
            {user.channel?.displayName ?? user.name}
          </h1>
        </div>

        {user.channel && (
          <Link
            href={`/c/${user.channel.handle}`}
            target="_blank"
            className="inline-flex h-9 items-center gap-2 rounded-xl border border-border bg-surface-2 px-3.5 text-sm text-muted transition-colors hover:text-text"
          >
            <ExternalLink size={14} />
            Ver canal público
          </Link>
        )}
      </div>

      <StudioNav isAdmin={user.role === "admin"} />

      <div className="mt-6">{children}</div>
    </div>
  );
}
