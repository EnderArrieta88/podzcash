"use client";

import { useActionState, useEffect, useState } from "react";
import QRCode from "qrcode";
import { KeyRound, ShieldCheck, TriangleAlert } from "lucide-react";
import { Input, Label } from "@/components/ui/field";
import type { StudioSecurityContent } from "@/lib/i18n/studio-security";
import {
  confirmTotpAction,
  manageTotpAction,
  startTotpSetupAction,
} from "../totp-actions";

type Labels = Omit<StudioSecurityContent, "recoveryCount">;

export function TotpSettings({
  enabled,
  recoveryLabel,
  required,
  labels,
}: {
  enabled: boolean;
  recoveryLabel: string;
  required: boolean;
  labels: Labels;
}) {
  const [startState, startAction] = useActionState(startTotpSetupAction, null);
  const [confirmState, confirmAction] = useActionState(confirmTotpAction, null);
  const [manageState, manageAction] = useActionState(manageTotpAction, null);
  const [qr, setQr] = useState<string | null>(null);

  useEffect(() => {
    if (!startState?.uri) return;

    let cancelled = false;

    QRCode.toDataURL(startState.uri, {
      margin: 2,
      width: 320,
      color: { dark: "#0b0d11", light: "#f5f1e8" },
    })
      .then((data) => {
        if (!cancelled) setQr(data);
      })
      .catch(() => {
        if (!cancelled) setQr(null);
      });

    return () => {
      cancelled = true;
    };
  }, [startState?.uri]);

  const recoveryCodes =
    confirmState?.recoveryCodes ?? manageState?.recoveryCodes;

  return (
    <section className="mt-6 rounded-xl border border-border bg-surface p-6">
      <div className="flex items-start gap-3">
        <ShieldCheck size={18} className="mt-0.5 text-jade" />
        <div>
          <h2 className="font-heading text-sm font-semibold">{labels.title}</h2>
          <p className="mt-1 text-xs leading-relaxed text-muted">
            {labels.intro}
          </p>
        </div>
      </div>

      {required && !enabled && (
        <p className="mt-4 rounded-lg border border-brand/30 bg-brand-soft/30 px-3 py-2 text-xs text-brand">
          {labels.requiredNotice}
        </p>
      )}

      {!enabled && (
        <div className="mt-4 rounded-lg border border-border bg-surface-2/60 p-3">
          <p className="text-xs font-medium text-text">
            {labels.recommendedTitle}
          </p>
          <p className="mt-1 text-xs leading-relaxed text-muted">
            {labels.recommendedBody}
          </p>
          <ul className="mt-2 space-y-1 text-xs text-muted">
            <li>
              <a
                href="https://getaegis.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-brand underline decoration-brand/40 underline-offset-2 hover:decoration-brand"
              >
                {labels.aegis}
              </a>{" "}
              · Android
            </li>
            <li>
              <a
                href="https://proton.me/authenticator"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-brand underline decoration-brand/40 underline-offset-2 hover:decoration-brand"
              >
                {labels.proton}
              </a>{" "}
              · {labels.iosAndroid}
            </li>
          </ul>
        </div>
      )}

      {!enabled && (
        <div className="mt-3 flex gap-2 rounded-lg border border-brand/30 bg-brand-soft/20 px-3 py-2">
          <TriangleAlert size={14} className="mt-0.5 shrink-0 text-brand" />
          <div>
            <p className="text-xs font-medium text-brand">
              {labels.googleWarningTitle}
            </p>
            <p className="mt-0.5 text-xs leading-relaxed text-muted">
              {labels.googleWarningBody}
            </p>
          </div>
        </div>
      )}

      {enabled ? (
        <div className="mt-5 space-y-4">
          <p className="inline-flex items-center gap-2 text-sm text-jade-bright">
            <ShieldCheck size={15} />
            {labels.enabled}
          </p>
          <p className="text-xs text-muted">{labels.enabledHint}</p>

          <div className="rounded-lg border border-border bg-surface-2/60 p-3">
            <p className="text-xs font-medium text-text">
              {labels.recoveryTitle}
            </p>
            <p className="mt-1 text-xs text-muted">{recoveryLabel}</p>
            <p className="mt-1 text-xs text-subtle">{labels.recoveryHint}</p>
          </div>

          <form action={manageAction} className="space-y-3">
            <div>
              <Label htmlFor="totp-password">{labels.password}</Label>
              <Input
                id="totp-password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
              />
              <p className="mt-1 text-xs text-subtle">{labels.passwordHint}</p>
            </div>
            <div>
              <Label htmlFor="totp-code">{labels.code}</Label>
              <Input
                id="totp-code"
                name="code"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={20}
                placeholder="123456"
              />
              <p className="mt-1 text-xs text-subtle">{labels.codeHint}</p>
            </div>

            {manageState?.error && (
              <p className="text-xs text-danger">{manageState.error}</p>
            )}

            <div className="flex flex-wrap gap-2">
              <button
                type="submit"
                name="intent"
                value="regenerate"
                className="inline-flex h-9 items-center rounded-full border border-border bg-surface-2 px-4 text-xs text-text transition-colors hover:bg-surface-3"
              >
                {labels.regenerate}
              </button>
              <button
                type="submit"
                name="intent"
                value="disable"
                className="inline-flex h-9 items-center rounded-full border border-danger/30 bg-danger/10 px-4 text-xs text-danger transition-colors hover:bg-danger/20"
              >
                {labels.disable}
              </button>
            </div>
          </form>
        </div>
      ) : startState?.uri ? (
        <div className="mt-5 space-y-4">
          <p className="text-sm font-medium">{labels.setupTitle}</p>
          <p className="text-xs text-muted">{labels.setupHint}</p>

          {qr && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={qr}
              alt={labels.setupTitle}
              className="size-40 rounded-lg bg-[#f5f1e8] p-2"
            />
          )}

          <div>
            <p className="text-xs text-subtle">{labels.manualKey}</p>
            <code className="mt-1 block break-all rounded-lg border border-border bg-surface-2 p-2 font-mono text-[11px] text-text">
              {startState.secret}
            </code>
          </div>

          <form action={confirmAction} className="space-y-3">
            <div>
              <Label htmlFor="totp-confirm">{labels.code}</Label>
              <Input
                id="totp-confirm"
                name="code"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                required
                autoFocus
                placeholder="123456"
              />
              <p className="mt-1 text-xs text-subtle">{labels.codeHint}</p>
            </div>

            {confirmState?.error && (
              <p className="text-xs text-danger">{confirmState.error}</p>
            )}

            <button
              type="submit"
              className="inline-flex h-10 items-center rounded-full bg-brand px-5 text-sm font-semibold text-[#17130a] transition-colors hover:bg-brand-strong"
            >
              {labels.confirm}
            </button>
          </form>
        </div>
      ) : (
        <form action={startAction} className="mt-5 space-y-3">
          <div>
            <Label htmlFor="totp-start-password">{labels.password}</Label>
            <Input
              id="totp-start-password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
            />
            <p className="mt-1 text-xs text-subtle">{labels.passwordHint}</p>
          </div>

          {startState?.error && (
            <p className="text-xs text-danger">{startState.error}</p>
          )}

          <button
            type="submit"
            className="inline-flex h-10 items-center gap-2 rounded-full bg-brand px-5 text-sm font-semibold text-[#17130a] transition-colors hover:bg-brand-strong"
          >
            <KeyRound size={15} />
            {labels.enable}
          </button>
        </form>
      )}

      {recoveryCodes && recoveryCodes.length > 0 && (
        <div className="mt-5 rounded-lg border border-jade/30 bg-jade-soft/50 p-4">
          <p className="text-sm font-semibold text-jade-bright">
            {labels.recoveryTitle}
          </p>
          <p className="mt-1 text-xs text-jade-bright/80">
            {labels.recoveryHint}
          </p>
          <ul className="mt-3 grid grid-cols-2 gap-2 font-mono text-xs text-jade-bright">
            {recoveryCodes.map((code) => (
              <li key={code}>{code}</li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
