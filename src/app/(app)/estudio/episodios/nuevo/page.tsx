import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth/guards";
import { EpisodeForm } from "@/components/studio/episode-form";

export const metadata: Metadata = { title: "Subir episodio" };

export default async function NewEpisodePage() {
  const user = await requireUser();

  if (!user.channel) redirect("/estudio/canal");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl tracking-tight">
          Subir episodio
        </h1>
        <p className="mt-2 max-w-xl text-sm text-muted">
          El audio se sube mientras completas los datos. Puedes guardarlo como
          borrador y publicarlo después.
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-surface p-6">
        <EpisodeForm episode={null} />
      </div>
    </div>
  );
}
