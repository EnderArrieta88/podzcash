import { sendNotification, setVapidDetails } from "web-push";
import { prisma } from "@/lib/db";
import {
  isMobileUserAgent,
  waitlistPushPayload,
  type WaitlistPushEntry,
} from "@/lib/push-payload";

/**
 * Web Push para administradores. Solo se guardan suscripciones de teléfonos:
 * el aviso de la lista de espera es únicamente móvil.
 *
 * La tabla se crea en la primera suscripción para no depender del historial de
 * migraciones de producción, igual que WaitlistEntry.
 */
let ready: Promise<void> | null = null;

async function createTable(): Promise<void> {
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "PushSubscription" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "userId" TEXT NOT NULL,
      "endpoint" TEXT NOT NULL,
      "p256dh" TEXT NOT NULL,
      "auth" TEXT NOT NULL,
      "userAgent" TEXT NOT NULL,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await prisma.$executeRawUnsafe(
    `CREATE UNIQUE INDEX IF NOT EXISTS "PushSubscription_endpoint_key" ON "PushSubscription"("endpoint");`,
  );

  await prisma.$executeRawUnsafe(
    `CREATE INDEX IF NOT EXISTS "PushSubscription_userId_idx" ON "PushSubscription"("userId");`,
  );
}

export function ensurePushTable(): Promise<void> {
  if (!ready) {
    ready = createTable().catch((error) => {
      ready = null;
      throw error;
    });
  }

  return ready;
}

export async function savePushSubscription({
  userId,
  endpoint,
  p256dh,
  auth,
  userAgent,
}: {
  userId: string;
  endpoint: string;
  p256dh: string;
  auth: string;
  userAgent: string;
}): Promise<void> {
  await ensurePushTable();

  await prisma.pushSubscription.upsert({
    where: { endpoint },
    create: { userId, endpoint, p256dh, auth, userAgent },
    update: { userId, p256dh, auth, userAgent },
  });
}

export async function deletePushSubscription({
  userId,
  endpoint,
}: {
  userId: string;
  endpoint: string;
}): Promise<void> {
  await ensurePushTable();

  await prisma.pushSubscription.deleteMany({ where: { userId, endpoint } });
}

export async function deleteUserPushSubscriptions(
  userId: string,
): Promise<void> {
  await ensurePushTable();

  await prisma.pushSubscription.deleteMany({ where: { userId } });
}

const PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY?.trim();
const PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY?.trim();
const SUBJECT =
  process.env.VAPID_SUBJECT?.trim() || "mailto:hola@podzcash.online";

export function isPushConfigured(): boolean {
  return Boolean(PUBLIC_KEY && PRIVATE_KEY);
}

let vapidReady = false;

function configureVapid(): void {
  if (vapidReady || !PUBLIC_KEY || !PRIVATE_KEY) return;

  setVapidDetails(SUBJECT, PUBLIC_KEY, PRIVATE_KEY);
  vapidReady = true;
}

export type StoredPushSubscription = {
  id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
  userAgent: string;
};

export async function listAdminMobileSubscriptions(): Promise<
  StoredPushSubscription[]
> {
  await ensurePushTable();

  const admins = await prisma.user.findMany({
    where: { role: "admin", status: "active" },
    select: { id: true },
  });

  if (admins.length === 0) return [];

  const subscriptions = await prisma.pushSubscription.findMany({
    where: { userId: { in: admins.map((admin) => admin.id) } },
    select: {
      id: true,
      endpoint: true,
      p256dh: true,
      auth: true,
      userAgent: true,
    },
  });

  return subscriptions.filter((subscription) =>
    isMobileUserAgent(subscription.userAgent),
  );
}

export async function sendWaitlistPush(
  entry: WaitlistPushEntry,
): Promise<void> {
  if (!isPushConfigured()) return;

  try {
    const subscriptions = await listAdminMobileSubscriptions();

    if (subscriptions.length === 0) return;

    configureVapid();

    const payload = JSON.stringify(waitlistPushPayload(entry));

    await Promise.all(
      subscriptions.map(async (subscription) => {
        try {
          await sendNotification(
            {
              endpoint: subscription.endpoint,
              keys: {
                p256dh: subscription.p256dh,
                auth: subscription.auth,
              },
            },
            payload,
          );
        } catch (error) {
          const status = (error as { statusCode?: number }).statusCode;

          // La suscripción dejó de existir: se elimina para no reintentar.
          if (status === 404 || status === 410) {
            await prisma.pushSubscription
              .deleteMany({ where: { id: subscription.id } })
              .catch(() => {});
            return;
          }

          console.error(
            "[push] No se pudo enviar la notificación:",
            status ?? error,
          );
        }
      }),
    );
  } catch (error) {
    console.error("[push] Error al enviar los avisos:", error);
  }
}
