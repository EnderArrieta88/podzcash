"use client";

import { useEffect, useMemo, useState } from "react";
import QRCode from "qrcode";
import { Check, Copy, ExternalLink, ShieldCheck } from "lucide-react";
import {
  AMOUNT_PRESETS,
  buildPaymentUri,
  MAX_MEMO_BYTES,
  memoByteLength,
} from "@/lib/zip321";
import { cn } from "@/lib/utils";
import type { DonationBoxLabels } from "@/lib/i18n/donate";

type DonationBoxProps = {
  address: string;
  channelName: string;
  labels: DonationBoxLabels;
};

export function DonationBox({
  address,
  channelName,
  labels,
}: DonationBoxProps) {
  const [amount, setAmount] = useState("");
  const [memo, setMemo] = useState("");
  const [qr, setQr] = useState<string | null>(null);
  const [copied, setCopied] = useState<"address" | "uri" | null>(null);

  const parsedAmount = Number.parseFloat(amount.replace(",", "."));
  const amountInvalid =
    amount.trim() !== "" &&
    (!Number.isFinite(parsedAmount) ||
      parsedAmount <= 0 ||
      parsedAmount > 1_000_000);
  const amountValue =
    !amountInvalid && Number.isFinite(parsedAmount) && parsedAmount > 0
      ? parsedAmount
      : undefined;
  const memoBytes = memoByteLength(memo);
  const memoInvalid = memoBytes > MAX_MEMO_BYTES;

  const uri = useMemo(
    () =>
      memoInvalid
        ? null
        : buildPaymentUri({ address, amount: amountValue, memo }),
    [address, amountValue, memo, memoInvalid],
  );

  useEffect(() => {
    if (!uri) return;

    let cancelled = false;

    QRCode.toDataURL(uri, {
      margin: 2,
      width: 512,
      color: { dark: "#0b0d11", light: "#f5f1e8" },
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
    <div className="grid gap-6 rounded-2xl border border-border bg-surface p-5 sm:grid-cols-[auto_1fr] sm:p-6">
      <span aria-live="polite" className="sr-only">
        {copied ? labels.copied : ""}
      </span>
      <div className="mx-auto sm:mx-0">
        <div className="flex size-56 items-center justify-center overflow-hidden rounded-xl bg-[#f5f1e8] p-2">
          {uri && qr ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={qr}
              alt={`${labels.qrAlt} ${channelName}`}
              className="size-full"
            />
          ) : (
            <span className="text-xs text-[#6b655f]">
              {uri ? labels.generating : labels.qrInvalid}
            </span>
          )}
        </div>
        <p className="mt-2 text-center font-mono text-[11px] text-subtle">
          {labels.scanHint}
        </p>
      </div>

      <div className="min-w-0 space-y-5">
        <div>
          <div className="flex items-center justify-between gap-2">
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-subtle">
              {labels.addressLabel}
            </p>
            <span className="inline-flex items-center gap-1 font-mono text-[10px] text-jade-bright">
              <ShieldCheck size={11} />
              {labels.verified}
            </span>
          </div>

          <div className="mt-2 flex items-start gap-2 rounded-xl border border-border bg-surface-2 p-3">
            <code className="min-w-0 flex-1 break-all font-mono text-xs leading-relaxed text-text">
              {address}
            </code>
            <button
              type="button"
              onClick={() => copy(address, "address")}
              className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg border border-border text-muted transition-colors hover:border-border-strong hover:text-text"
              aria-label={labels.copyAria}
            >
              {copied === "address" ? (
                <Check size={14} className="text-jade" />
              ) : (
                <Copy size={14} />
              )}
            </button>
          </div>
        </div>

        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-subtle">
            {labels.amount}{" "}
            <span className="normal-case tracking-normal">
              {labels.optional}
            </span>
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
                  "h-9 rounded-lg border px-3 font-mono text-xs tabular transition-colors",
                  amount === String(preset)
                    ? "border-brand/50 bg-brand-soft font-bold text-brand"
                    : "border-border bg-surface-2 text-muted hover:border-border-strong hover:text-text",
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
                placeholder={labels.other}
                aria-label={labels.amountAria}
                aria-invalid={amountInvalid || undefined}
                aria-describedby={
                  amountInvalid ? "donation-amount-error" : undefined
                }
                className={cn(
                  "h-9 w-24 rounded-lg border border-border bg-surface-2 px-3 pr-9 font-mono text-xs tabular text-text placeholder:text-subtle outline-none focus:border-brand",
                  amountInvalid && "border-danger focus:border-danger",
                )}
              />
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-subtle">
                ZEC
              </span>
            </div>
          </div>

          {amountInvalid && (
            <p
              id="donation-amount-error"
              className="mt-1.5 text-xs text-danger"
            >
              {labels.amountInvalid}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="donation-memo"
            className="font-mono text-[10px] uppercase tracking-[0.16em] text-subtle"
          >
            {labels.memoLabel}{" "}
            <span className="normal-case tracking-normal">
              {labels.optional}
            </span>
          </label>
          <input
            id="donation-memo"
            value={memo}
            onChange={(event) => setMemo(event.target.value)}
            maxLength={2000}
            placeholder={labels.memoPlaceholder}
            aria-invalid={memoInvalid || undefined}
            aria-describedby={memoInvalid ? "donation-memo-error" : undefined}
            className={cn(
              "mt-2 h-10 w-full rounded-xl border border-border bg-surface-2 px-3 text-sm text-text placeholder:text-subtle outline-none focus:border-brand focus:ring-4 focus:ring-brand/15",
              memoInvalid && "border-danger focus:border-danger",
            )}
          />
          <div className="mt-1.5 flex items-start justify-between gap-3">
            <p className="text-xs text-subtle">{labels.memoHint}</p>
            <span
              className={cn(
                "shrink-0 font-mono text-[10px] tabular",
                memoInvalid ? "text-danger" : "text-subtle",
              )}
            >
              {memoBytes}
              {labels.memoCounterSuffix}
            </span>
          </div>
          {memoInvalid && (
            <p id="donation-memo-error" className="mt-1 text-xs text-danger">
              {labels.memoTooLong}
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2 border-t border-border pt-4">
          {uri ? (
            <a
              href={uri}
              className="inline-flex h-10 items-center gap-2 rounded-xl bg-brand px-5 text-sm font-semibold text-[#17130a] transition-colors hover:bg-brand-strong"
            >
              {labels.openWallet}
              <ExternalLink size={14} />
            </a>
          ) : (
            <span
              aria-disabled="true"
              className="inline-flex h-10 cursor-not-allowed items-center gap-2 rounded-xl bg-brand/40 px-5 text-sm font-semibold text-[#17130a]/60"
            >
              {labels.openWallet}
              <ExternalLink size={14} />
            </span>
          )}

          <button
            type="button"
            disabled={!uri}
            onClick={() => uri && copy(uri, "uri")}
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-border bg-surface-2 px-4 text-sm transition-colors hover:bg-surface-3 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {copied === "uri" ? (
              <Check size={14} className="text-jade" />
            ) : (
              <Copy size={14} />
            )}
            {copied === "uri" ? labels.copied : labels.copyUri}
          </button>
        </div>
      </div>
    </div>
  );
}
