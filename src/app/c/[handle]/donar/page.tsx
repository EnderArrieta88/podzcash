import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, EyeOff, ShieldCheck, UserX } from "lucide-react";
import { prisma } from "@/lib/db";
import { storage } from "@/lib/storage";
import { DonationBox } from "@/components/donate/donation-box";
import { ButtonLink } from "@/components/ui/button-link";

type PageProps = { params: Promise<{ handle: string }> };

async function loadChannel(handle: string) {
  return prisma.channel.findUnique({
    where: { handle: handle.toLowerCase() },
    select: {
      handle: true,
      displayName: true,
      avatarKey: true,
      zcashAddress: true,
    },
  });
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { handle } = await params;
  const channel = await loadChannel(handle);

  if (!channel) return { title: "Canal no encontrado" };

  return {
    title: `Apoyar a ${channel.displayName}`,
    description: `Dona ZEC directamente a ${channel.displayName} en PodZcash.`,
  };
}

const notes = [
  {
    icon: ShieldCheck,
    title: "Sin custodia",
    body: "El pago va directo a la wallet del creador. PodZcash nunca retiene el dinero.",
  },
  {
    icon: UserX,
    title: "Sin cuenta",
    body: "No hace falta registrarse ni iniciar sesión para donar.",
  },
  {
    icon: EyeOff,
    title: "Privacidad",
    body: "Con una dirección protegida, el monto y el memo quedan cifrados. Con una transparente, son públicos.",
  },
];

export default async function DonatePage({ params }: PageProps) {
  const { handle } = await params;
  const channel = await loadChannel(handle);

  if (!channel) notFound();

  if (!channel.zcashAddress) {
    return (
      <div className="mx-auto w-full max-w-lg px-5 py-20 text-center">
        <p className="font-display text-3xl tracking-tight">
          {channel.displayName} todavía no acepta donaciones
        </p>
        <p className="mt-3 text-sm text-muted">
          Cuando el creador agregue su dirección de Zcash, va a aparecer acá.
        </p>
        <ButtonLink href={`/c/${channel.handle}`} className="mt-7">
          Volver al canal
        </ButtonLink>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-5 py-10">
      <Link
        href={`/c/${channel.handle}`}
        className="inline-flex items-center gap-2 text-sm text-muted transition-colors hover:text-text"
      >
        <ArrowLeft size={15} />
        {channel.displayName}
      </Link>

      <div className="mt-6 flex items-center gap-4">
        {channel.avatarKey ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={storage.url(channel.avatarKey)}
            alt=""
            className="size-14 rounded-full border border-border object-cover"
          />
        ) : (
          <span className="flex size-14 items-center justify-center rounded-full bg-brand-soft font-display text-xl text-brand">
            {channel.displayName.slice(0, 1).toUpperCase()}
          </span>
        )}

        <div>
          <h1 className="font-display text-3xl tracking-tight">
            Apoyar a {channel.displayName}
          </h1>
          <p className="mt-1 text-sm text-muted">
            Donación directa en ZEC, de persona a persona.
          </p>
        </div>
      </div>

      <div className="mt-8">
        <DonationBox
          address={channel.zcashAddress}
          channelName={channel.displayName}
        />
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        {notes.map((note) => (
          <div
            key={note.title}
            className="rounded-xl border border-border bg-surface p-4"
          >
            <note.icon size={16} className="text-brand" />
            <p className="mt-2 text-sm font-medium">{note.title}</p>
            <p className="mt-1 text-xs leading-relaxed text-muted">
              {note.body}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
