"use server";

import { headers } from "next/headers";
import { requireAdmin } from "@/lib/auth/guards";
import {
  deletePushSubscription,
  savePushSubscription,
} from "@/lib/push";
import {
  isMobileUserAgent,
  pushSubscriptionSchema,
} from "@/lib/push-payload";

export type PushActionResult =
  | { ok: true }
  | { ok: false; error: "mobile" | "invalid" | "server" };

export async function subscribePushAction(
  input: unknown,
): Promise<PushActionResult> {
  const user = await requireAdmin();
  const userAgent = (await headers()).get("user-agent") ?? "";

  if (!isMobileUserAgent(userAgent)) {
    return { ok: false, error: "mobile" };
  }

  const parsed = pushSubscriptionSchema.safeParse(input);

  if (!parsed.success) {
    return { ok: false, error: "invalid" };
  }

  try {
    await savePushSubscription({
      userId: user.id,
      endpoint: parsed.data.endpoint,
      p256dh: parsed.data.keys.p256dh,
      auth: parsed.data.keys.auth,
      userAgent,
    });

    return { ok: true };
  } catch (error) {
    console.error("[push] No se pudo guardar la suscripción:", error);
    return { ok: false, error: "server" };
  }
}

export async function unsubscribePushAction(
  endpoint: string,
): Promise<PushActionResult> {
  const user = await requireAdmin();

  if (typeof endpoint !== "string" || endpoint.length > 2048) {
    return { ok: false, error: "invalid" };
  }

  try {
    await deletePushSubscription({ userId: user.id, endpoint });
    return { ok: true };
  } catch (error) {
    console.error("[push] No se pudo borrar la suscripción:", error);
    return { ok: false, error: "server" };
  }
}
