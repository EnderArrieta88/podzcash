import { z } from "zod";

const MOBILE_USER_AGENT =
  /Android|iPhone|iPad|iPod|Mobile|Windows Phone|IEMobile|Opera Mini/i;

export function isMobileUserAgent(value?: string | null): boolean {
  return Boolean(value && MOBILE_USER_AGENT.test(value));
}

export const pushSubscriptionSchema = z.object({
  endpoint: z.string().url().startsWith("https://").max(2048),
  keys: z.object({
    p256dh: z.string().min(16).max(200),
    auth: z.string().min(8).max(100),
  }),
});

export type PushSubscriptionInput = z.infer<typeof pushSubscriptionSchema>;

export type WaitlistPushEntry = {
  name: string;
  email: string;
  role: string;
  note: string | null;
};

const roleLabels: Record<string, string> = {
  podcast: "podcast",
  music: "música",
  other: "otra cosa",
};

export function waitlistPushPayload(entry: WaitlistPushEntry) {
  return {
    title: "Nueva solicitud en la lista de espera",
    body: `${entry.name} quiere entrar como ${roleLabels[entry.role] ?? entry.role}.`,
    url: "/estudio/admin",
    tag: "waitlist",
  };
}
