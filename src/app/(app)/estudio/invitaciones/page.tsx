import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/guards";
import { formatInviteCode } from "@/lib/links";
import { CopyButton } from "@/components/ui/copy-button";
import { InviteForm } from "@/components/studio/invite-form";
import { revokeInviteAction } from "../actions";

export const metadata: Metadata = { title: "Invitaciones" };

const dateFormat = new Intl.DateTimeFormat("es", { dateStyle: "medium" });

export default async function InvitesPage() {
  const admin = await requireAdmin();

  const invites = await prisma.invite.findMany({
    where: { createdById: admin.id },
    orderBy: { createdAt: "desc" },
    include: { usedBy: { select: { name: true, email: true } } },
  });

  // Server component: se ejecuta una vez por petición, no en cada re-render.
  // eslint-disable-next-line react-hooks/purity
  const now = Date.now();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl tracking-tight">Invitaciones</h1>
        <p className="mt-2 max-w-xl text-sm text-muted">
          PodZcash es por invitación. Cada código sirve para una sola cuenta.
          Compártelo solo con la persona que quieres sumar.
        </p>
      </div>

      <div className="rounded-xl border border-border bg-surface p-6">
        <InviteForm />
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-surface">
        {invites.length === 0 ? (
          <p className="p-6 text-sm text-muted">
            Todavía no generaste códigos.
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {invites.map((invite) => {
              const expired =
                invite.expiresAt !== null &&
                invite.expiresAt.getTime() < now;
              const used = invite.usedById !== null;

              const status = used
                ? { label: `Usado por ${invite.usedBy?.name ?? "—"}`, tone: "text-subtle" }
                : expired
                  ? { label: "Expirado", tone: "text-danger" }
                  : { label: "Disponible", tone: "text-success" };

              return (
                <li
                  key={invite.id}
                  className="flex flex-wrap items-center gap-x-4 gap-y-2 px-5 py-4"
                >
                  <code className="font-mono text-sm tracking-wider">
                    {formatInviteCode(invite.code)}
                  </code>

                  <span className={`text-xs ${status.tone}`}>{status.label}</span>

                  {invite.note && (
                    <span className="truncate text-xs text-muted">
                      · {invite.note}
                    </span>
                  )}

                  <span className="ml-auto flex items-center gap-3 text-xs text-subtle">
                    {dateFormat.format(invite.createdAt)}

                    {!used && (
                      <>
                        <CopyButton value={formatInviteCode(invite.code)} />
                        <form action={revokeInviteAction}>
                          <input type="hidden" name="id" value={invite.id} />
                          <button
                            type="submit"
                            className="text-xs text-subtle underline-offset-2 hover:text-danger hover:underline"
                          >
                            Revocar
                          </button>
                        </form>
                      </>
                    )}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

