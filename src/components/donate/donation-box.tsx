"use client";

import { useEffect, useMemo, useState } from "react";
import QRCode from "qrcode";
import { Check, Copy, ExternalLink } from "lucide-react";
import { AMOUNT_PRESETS, buildPaymentUri } from "@/lib/zip321";
import { cn } from "@/lib/utils";

type DonationBoxProps = {
  address: string;
  channelName: string;
};

export function DonationBox({ address, channelName }: DonationBoxProps) {
  const [amount, setAmount] = useState("");
  const [memo, setMemo] = useState("");
  const [qr, setQr] = useState<string | null>(null);
  const [copied, setCopied] = useState<"address" | "uri" | null>(null);

  const parsedAmount = Number.parseFloat(amount.replace(",", "."));
  const amountValue =
    Number.isFinite(parsedAmount) && parsedAmount > 0 ? parsedAmount : undefined;

  const uri = useMemo(
    () => buildPaymentUri({ address, amount: amountValue, memo }),
    [address, amountValue, memo],
  );

  useEffect(() => {
    let cancelled = false;

    QRCode.toDataURL(uri, {
      margin: 2,
      width: 512,
      color: { dark: "#0b0a08", light: "#f5f1e8" },
      errorCorrectionLevel: "M",
    })
      .then((dataUrl) => {
        if (!cancelled) setQr(dataUrl);
      })
      .catch(() => {
        if (!cancelled) setQr(null);
      });

    return () => {
      cancelled = true;
    };
  }, [uri]);

  async function copy(value: string, kind: "address" | "uri") {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(kind);
      window.setTimeout(() => setCopied(null), 1600);
    } catch {
      // Sin permisos de portapapeles: el texto sigue visible.
    }
  }

  return (
    <div className="grid gap-6 rounded-2xl border border-border bg-surface p-6 sm:grid-cols-[auto_1fr]">
      <div className="mx-auto sm:mx-0">
        <div className="flex size-56 items-center justify-center overflow-hidden rounded-xl bg-[#f5f1e8] p-2">
          {qr ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={qr}
              alt={`Código QR para donar a ${channelName}`}
              className="size-full"
            />
          ) : (
            <span className="text-xs text-[#6b655f]">Generando QR…</span>
          )}
        </div>
        <p className="mt-2 text-center font-mono text-[11px] text-subtle">
          Escanea con Zashi, Zingo o Ywallet
        </p>
      </div>

      <div className="min-w-0 space-y-5">
        <div>
          <p className="text-[11px] uppercase tracking-[0.14em] text-subtle">
            Dirección Zcash
          </p>
          <div className="mt-2 flex items-start gap-2 rounded-[10px] border border-border bg-surface-2 p-3">
            <code className="min-w-0 flex-1 break-all font-mono text-xs leading-relaxed text-text">
              {address}
            </code>
            <button
              type="button"
              onClick={() => copy(address, "address")}
              className="inline-flex size-8 shrink-0 items-center justify-center rounded-md border border-border text-muted transition-colors hover:border-border-strong hover:text-text"
              aria-label="Copiar dirección"
            >
              {copied === "address" ? (
                <Check size={14} className="text-success" />
              ) : (
                <Copy size={14} />
              )}
            </button>
          </div>
        </div>

        <div>
          <p className="text-[11px] uppercase tracking-[0.14em] text-subtle">
            Monto <span className="normal-case tracking-normal">(opcional)</span>
          </p>

          <div className="mt-2 flex flex-wrap items-center gap-2">
            {AMOUNT_PRESETS.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() =>
                  setAmount((current) =>
                    current === String(preset) ? "" : String(preset),
                  )
                }
                className={cn(
                  "h-8 rounded-full border px-3 font-mono text-xs tabular transition-colors",
                  amount === String(preset)
                    ? "border-brand/40 bg-brand-soft/70 text-brand"
                    : "border-border text-muted hover:border-border-strong hover:text-text",
                )}
              >
                {preset} ZEC
              </button>
            ))}

            <div className="relative">
              <input
                inputMode="decimal"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                placeholder="Otro"
                aria-label="Monto en ZEC"
                className="h-8 w-24 rounded-full border border-border bg-surface-2 px-3 pr-9 font-mono text-xs tabular text-text placeholder:text-subtle outline-none focus:border-brand"
              />
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-subtle">
                ZEC
              </span>
            </div>
          </div>
        </div>

        <div>
          <label
            htmlFor="donation-memo"
            className="text-[11px] uppercase tracking-[0.14em] text-subtle"
          >
            Mensaje en el memo{" "}
            <span className="normal-case tracking-normal">(opcional)</span>
          </label>
          <input
            id="donation-memo"
            value={memo}
            onChange={(event) => setMemo(event.target.value)}
            maxLength={200}
            placeholder="Gracias por el episodio"
            className="mt-2 h-10 w-full rounded-[10px] border border-border bg-surface-2 px-3 text-sm text-text placeholder:text-subtle outline-none focus:border-brand focus:ring-4 focus:ring-brand/15"
          />
          <p className="mt-1.5 text-xs text-subtle">
            Solo funciona con transacciones protegidas y algunos wallets lo
            ignoran.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 border-t border-border pt-4">
          <a
            href={uri}
            className="inline-flex h-10 items-center gap-2 rounded-full bg-brand px-5 text-sm font-medium text-[#17130a] transition-colors hover:bg-brand-strong"
          >
            Abrir en wallet
            <ExternalLink size={14} />
          </a>

          <button
            type="button"
            onClick={() => copy(uri, "uri")}
            className="inline-flex h-10 items-center gap-2 rounded-full border border-border bg-surface-2 px-4 text-sm transition-colors hover:bg-border"
          >
            {copied === "uri" ? (
              <Check size={14} className="text-success" />
            ) : (
              <Copy size={14} />
            )}
            {copied === "uri" ? "Copiado" : "Copiar enlace zcash:"}
          </button>
        </div>
      </div>
    </div>
  );
}
