import "server-only";
import { z } from "zod";

/**
 * Única puerta de entrada a las variables de entorno del servidor.
 *
 * Las variables vacías se tratan como ausentes para que los valores por
 * defecto de desarrollo funcionen sin obligar a llenar todo el `.env`.
 * `DATABASE_URL` sí es obligatoria: sin base de datos la app no puede arrancar.
 */
const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  DATABASE_URL: z.string().min(1, "DATABASE_URL es obligatoria"),
  SITE_URL: z.string().url().optional(),
  AUTH_SECRET: z.string().optional(),

  EMAIL_FROM: z.string().default("PodZcash <hola@podzcash.online>"),
  RESEND_API_KEY: z.string().optional(),
  WAITLIST_NOTIFY_EMAIL: z
    .string()
    .min(1)
    .default("invitaciones@podzcash.online"),
  FEED_OWNER_EMAIL: z.string().min(1).default("hola@podzcash.online"),

  VAPID_PUBLIC_KEY: z.string().optional(),
  VAPID_PRIVATE_KEY: z.string().optional(),
  VAPID_SUBJECT: z.string().default("mailto:hola@podzcash.online"),

  MEDIA_ROOT: z.string().default("./.media"),
  SEARCH_DB_PATH: z.string().default("./.data/search.db"),
  ANALYTICS_DB_PATH: z.string().default("./.data/analytics.db"),
  ANALYTICS_SALT: z.string().optional(),
  ANALYTICS_TIMEZONE: z.string().default("UTC"),
  ANALYTICS_BOT_PATTERNS: z.string().optional(),
  RATE_LIMIT_DB_PATH: z.string().default("./.data/rate-limit.db"),
  RATE_LIMIT_SALT: z.string().optional(),

  CSP_MODE: z.enum(["enforce", "report-only"]).default("enforce"),
});

const raw = Object.fromEntries(
  Object.entries(process.env).map(([key, value]) => {
    const trimmed = value?.trim();

    return [key, trimmed === "" ? undefined : trimmed];
  }),
);

const parsed = envSchema.safeParse(raw);

if (!parsed.success) {
  const details = parsed.error.issues
    .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
    .join("; ");

  throw new Error(`[env] Configuración inválida: ${details}`);
}

export const env = parsed.data;
