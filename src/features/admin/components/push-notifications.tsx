"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { Bell, BellOff, Loader2 } from "lucide-react";
import {
  subscribePushAction,
  unsubscribePushAction,
} from "@/features/admin/push-actions";
import type { PushContent } from "@/lib/i18n/push";

function urlBase64ToUint8Array(value: string): Uint8Array<ArrayBuffer> {
  const padding = "=".repeat((4 - (value.length % 4)) % 4);
  const base64 = (value + padding).replaceAll("-", "+").replaceAll("_", "/");
  const raw = atob(base64);
  const bytes = new Uint8Array(new ArrayBuffer(raw.length));

  for (let index = 0; index < raw.length; index += 1) {
    bytes[index] = raw.charCodeAt(index);
  }

  return bytes;
}

function isMobileDevice(): boolean {
  if (typeof navigator === "undefined") return false;

  const userAgent = navigator.userAgent;

  return /Android|iPhone|iPad|iPod|Mobile|Windows Phone|IEMobile|Opera Mini/i.test(
    userAgent,
  );
}

function subscribeToDevice() {
  return () => {};
}

function isIosDevice(): boolean {
  const userAgent = navigator.userAgent;

  if (/iPhone|iPad|iPod/i.test(userAgent)) return true;

  // iPadOS se presenta como macOS; el táctil lo delata.
  return /Macintosh/i.test(userAgent) && navigator.maxTouchPoints > 1;
}

function isStandalone(): boolean {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

export function PushNotifications({
  publicKey,
  labels,
}: {
  publicKey: string | null;
  labels: PushContent;
}) {
  const mobile = useSyncExternalStore(
    subscribeToDevice,
    isMobileDevice,
    () => false,
  );
  const [supported, setSupported] = useState(false);
  const [standalone, setStandalone] = useState(true);
  const [ios, setIos] = useState(false);
  const [permission, setPermission] =
    useState<NotificationPermission>("default");
  const [subscribed, setSubscribed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!mobile) return;

    let cancelled = false;
    const iosDevice = isIosDevice();
    const standaloneMode = isStandalone();
    const supportedBrowser =
      "serviceWorker" in navigator && "PushManager" in window;
    const currentPermission =
      "Notification" in window ? Notification.permission : "denied";

    // El efecto sincroniza con APIs del navegador; la actualización se difiere
    // para no encadenar renders dentro del cuerpo.
    queueMicrotask(() => {
      if (cancelled) return;

      setIos(iosDevice);
      setStandalone(standaloneMode);
      setSupported(supportedBrowser);
      setPermission(currentPermission);
    });

    navigator.serviceWorker?.ready
      .then((registration) => registration.pushManager.getSubscription())
      .then((subscription) => {
        if (!cancelled) setSubscribed(Boolean(subscription));
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [mobile]);

  if (!mobile) {
    return (
      <p className="border-b border-border px-5 py-3 text-xs text-subtle">
        {labels.desktopHint}
      </p>
    );
  }

  async function enable() {
    if (!publicKey) return;

    setBusy(true);
    setError(null);

    try {
      const result = await Notification.requestPermission();
      setPermission(result);

      if (result !== "granted") return;

      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      });
      const json = subscription.toJSON();

      if (!json.endpoint || !json.keys?.p256dh || !json.keys.auth) {
        throw new Error("suscripción incompleta");
      }

      const saved = await subscribePushAction({
        endpoint: json.endpoint,
        keys: { p256dh: json.keys.p256dh, auth: json.keys.auth },
      });

      if (!saved.ok) {
        await subscription.unsubscribe();
        setError(labels.error);
        return;
      }

      setSubscribed(true);
    } catch {
      setError(labels.error);
    } finally {
      setBusy(false);
    }
  }

  async function disable() {
    setBusy(true);
    setError(null);

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        await unsubscribePushAction(subscription.endpoint);
        await subscription.unsubscribe();
      }

      setSubscribed(false);
    } catch {
      setError(labels.error);
    } finally {
      setBusy(false);
    }
  }

  const blocked = permission === "denied";
  const needsInstall = ios && !standalone;
  const canEnable =
    supported && Boolean(publicKey) && !blocked && !needsInstall && !subscribed;

  return (
    <div className="border-b border-border bg-surface-2/40 px-5 py-4">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-brand-soft text-brand">
          {subscribed ? <Bell size={15} /> : <BellOff size={15} />}
        </span>

        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium">{labels.title}</p>

          {needsInstall ? (
            <>
              <p className="mt-1 text-xs font-medium text-text">
                {labels.installTitle}
              </p>
              <p className="mt-0.5 text-xs leading-relaxed text-muted">
                {labels.installBody}
              </p>
            </>
          ) : (
            <p className="mt-0.5 text-xs leading-relaxed text-muted">
              {labels.description}
            </p>
          )}

          {!publicKey && (
            <p className="mt-1 text-xs text-subtle">{labels.notConfigured}</p>
          )}

          {publicKey && !supported && !needsInstall && (
            <p className="mt-1 text-xs text-subtle">{labels.unsupported}</p>
          )}

          {blocked && (
            <p className="mt-1 text-xs text-danger">{labels.denied}</p>
          )}

          {subscribed && (
            <p className="mt-1 text-xs text-jade-bright">{labels.enabled}</p>
          )}

          {error && <p className="mt-1 text-xs text-danger">{error}</p>}

          {(canEnable || subscribed) && (
            <button
              type="button"
              onClick={subscribed ? disable : enable}
              disabled={busy}
              className="mt-3 inline-flex h-9 items-center gap-2 rounded-lg border border-border bg-surface px-3 text-xs font-medium text-text transition-colors hover:border-border-strong hover:bg-surface-3 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {busy && <Loader2 size={14} className="animate-spin" />}
              {busy
                ? labels.pending
                : subscribed
                  ? labels.disable
                  : labels.enable}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
