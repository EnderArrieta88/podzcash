import { Resend } from "resend";
import {
  inviteEmailContent,
  resetEmailContent,
  verificationEmailContent,
  type EmailCopy,
} from "@/lib/i18n/email";
import type { Locale } from "@/lib/i18n/config";

const FROM = process.env.EMAIL_FROM ?? "PodZcash <hola@podzcash.online>";
const API_KEY = process.env.RESEND_API_KEY?.trim();

export function isEmailConfigured(): boolean {
  return Boolean(API_KEY);
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

type SendEmailInput = {
  to: string;
  subject: string;
  text: string;
  html: string;
};

async function sendEmail(input: SendEmailInput): Promise<boolean> {
  if (!API_KEY) return false;

  try {
    const resend = new Resend(API_KEY);
    const { error } = await resend.emails.send({
      from: FROM,
      to: input.to,
      subject: input.subject,
      text: input.text,
      html: input.html,
    });

    if (error) {
      console.error("[email] Resend respondió con error:", error.message);
      return false;
    }

    return true;
  } catch (error) {
    console.error("[email] No se pudo enviar:", error);
    return false;
  }
}

function renderLinkEmail({
  content,
  url,
  locale,
}: {
  content: EmailCopy;
  url: string;
  locale: Locale;
}): { text: string; html: string } {
  const text = `${content.intro}\n\n${url}\n\n${content.ignore}\n\n${content.footer}`;
  const html = `<!doctype html>
<html lang="${locale}">
  <body style="margin:0;padding:24px;background:#0b0d11;color:#e6e7ec;font-family:Arial,sans-serif">
    <div style="max-width:560px;margin:0 auto;background:#14171d;border:1px solid #2a2f39;border-radius:16px;padding:28px">
      <p style="margin:0 0 16px;font-size:14px;line-height:1.6;color:#c7ccd6">${escapeHtml(content.intro)}</p>
      <p style="margin:0 0 24px">
        <a href="${escapeHtml(url)}" style="display:inline-block;background:#f4b728;color:#17130a;text-decoration:none;font-weight:700;padding:12px 18px;border-radius:10px">${escapeHtml(content.button)}</a>
      </p>
      <p style="margin:0;font-size:12px;line-height:1.6;color:#9aa3b2">${escapeHtml(content.ignore)}</p>
      <p style="margin:24px 0 0;font-size:11px;color:#6b7484">${escapeHtml(content.footer)}</p>
    </div>
  </body>
</html>`;

  return { text, html };
}

async function sendLinkEmail({
  to,
  url,
  locale,
  content,
  devLabel,
}: {
  to: string;
  url: string;
  locale: Locale;
  content: EmailCopy;
  devLabel: string;
}): Promise<boolean> {
  if (!isEmailConfigured()) {
    if (process.env.NODE_ENV !== "production") {
      console.info(`[email:dev] ${devLabel}: ${url}`);
    } else {
      console.warn("[email] RESEND_API_KEY no está configurado.");
    }
    return false;
  }

  const { text, html } = renderLinkEmail({ content, url, locale });

  return sendEmail({
    to,
    subject: content.subject,
    text,
    html,
  });
}

export async function sendPasswordResetEmail({
  to,
  url,
  locale,
}: {
  to: string;
  url: string;
  locale: Locale;
}): Promise<boolean> {
  return sendLinkEmail({
    to,
    url,
    locale,
    content: resetEmailContent[locale],
    devLabel: "Enlace de recuperación",
  });
}

export async function sendVerificationEmail({
  to,
  url,
  locale,
}: {
  to: string;
  url: string;
  locale: Locale;
}): Promise<boolean> {
  return sendLinkEmail({
    to,
    url,
    locale,
    content: verificationEmailContent[locale],
    devLabel: "Enlace de verificación",
  });
}

export async function sendInviteEmail({
  to,
  url,
  code,
  locale,
}: {
  to: string;
  url: string;
  code: string;
  locale: Locale;
}): Promise<boolean> {
  const content = inviteEmailContent[locale];

  if (!isEmailConfigured()) {
    console.warn("[email] RESEND_API_KEY no está configurado; no se envió la invitación.");
    return false;
  }

  const text = `${content.intro}\n\n${code}\n\n${url}\n\n${content.ignore}\n\n${content.footer}`;
  const html = `<!doctype html>
<html lang="${locale}">
  <body style="margin:0;padding:24px;background:#0b0d11;color:#e6e7ec;font-family:Arial,sans-serif">
    <div style="max-width:560px;margin:0 auto;background:#14171d;border:1px solid #2a2f39;border-radius:16px;padding:28px">
      <p style="margin:0 0 16px;font-size:14px;line-height:1.6;color:#c7ccd6">${escapeHtml(content.intro)}</p>
      <p style="margin:0 0 8px;font-size:13px;line-height:1.6;color:#9aa3b2">Código de invitación</p>
      <p style="margin:0 0 24px;font-family:monospace;font-size:22px;letter-spacing:2px;color:#f4b728">${escapeHtml(code)}</p>
      <p style="margin:0 0 24px">
        <a href="${escapeHtml(url)}" style="display:inline-block;background:#f4b728;color:#17130a;text-decoration:none;font-weight:700;padding:12px 18px;border-radius:10px">${escapeHtml(content.button)}</a>
      </p>
      <p style="margin:0;font-size:12px;line-height:1.6;color:#9aa3b2">${escapeHtml(content.ignore)}</p>
      <p style="margin:24px 0 0;font-size:11px;color:#6b7484">${escapeHtml(content.footer)}</p>
    </div>
  </body>
</html>`;

  return sendEmail({
    to,
    subject: content.subject,
    text,
    html,
  });
}

export type WaitlistNotification = {
  name: string;
  email: string;
  role: string;
  note: string | null;
};

const roleLabels: Record<string, string> = {
  podcast: "Podcast",
  music: "Música",
  other: "Otra cosa",
};

export async function sendWaitlistNotificationEmail({
  to,
  entry,
}: {
  to: string;
  entry: WaitlistNotification;
}): Promise<boolean> {
  if (!isEmailConfigured()) return false;

  const lines = [
    `Nombre: ${entry.name}`,
    `Email: ${entry.email}`,
    `Tipo: ${roleLabels[entry.role] ?? entry.role}`,
    entry.note ? `Nota: ${entry.note}` : null,
  ].filter((line): line is string => line !== null);

  const text = `Nueva solicitud en la lista de espera de PodZcash.\n\n${lines.join("\n")}\n\nhttps://podzcash.online/estudio/admin`;
  const html = `<!doctype html>
<html lang="es">
  <body style="margin:0;padding:24px;background:#0b0d11;color:#e6e7ec;font-family:Arial,sans-serif">
    <div style="max-width:560px;margin:0 auto;background:#14171d;border:1px solid #2a2f39;border-radius:16px;padding:28px">
      <p style="margin:0 0 16px;font-size:14px;line-height:1.6;color:#c7ccd6">Nueva solicitud en la lista de espera.</p>
      <table style="width:100%;font-size:14px;color:#e6e7ec;border-collapse:collapse">
        <tr><td style="padding:6px 0;color:#9aa3b2">Nombre</td><td style="padding:6px 0">${escapeHtml(entry.name)}</td></tr>
        <tr><td style="padding:6px 0;color:#9aa3b2">Email</td><td style="padding:6px 0">${escapeHtml(entry.email)}</td></tr>
        <tr><td style="padding:6px 0;color:#9aa3b2">Tipo</td><td style="padding:6px 0">${escapeHtml(roleLabels[entry.role] ?? entry.role)}</td></tr>
        ${entry.note ? `<tr><td style="padding:6px 0;color:#9aa3b2">Nota</td><td style="padding:6px 0">${escapeHtml(entry.note)}</td></tr>` : ""}
      </table>
      <p style="margin:24px 0 0">
        <a href="https://podzcash.online/estudio/admin" style="display:inline-block;background:#f4b728;color:#17130a;text-decoration:none;font-weight:700;padding:12px 18px;border-radius:10px">Abrir administración</a>
      </p>
    </div>
  </body>
</html>`;

  return sendEmail({
    to,
    subject: "Nueva solicitud en la lista de espera",
    text,
    html,
  });
}
