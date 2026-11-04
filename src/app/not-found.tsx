import Link from "next/link";
import { ButtonLink } from "@/components/ui/button-link";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[calc(100dvh-8rem)] w-full max-w-lg flex-col items-center justify-center px-5 py-20 text-center">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-subtle">
        404
      </p>
      <h1 className="mt-3 font-display text-4xl tracking-tight">
        Esta página no existe
      </h1>
      <p className="mt-3 text-sm text-muted">
        Puede que el canal haya cambiado de handle o que el enlace esté roto.
      </p>
      <div className="mt-7 flex items-center gap-3">
        <ButtonLink href="/">Volver al inicio</ButtonLink>
        <Link href="/entrar" className="text-sm text-muted hover:text-text">
          Entrar
        </Link>
      </div>
    </div>
  );
}
