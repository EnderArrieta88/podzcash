import { Resend } from "resend";
import { emailContent } from "@/lib/i18n/email";
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

export async function sendPasswordResetEmail({
  to,
  url,
  locale,
}: {
  to: string;
  url: string;
  locale: Locale;
}): Promise<boolean> {
  const content = emailContent[locale];

  if (!isEmailConfigured()) {
    if (process.env.NODE_ENV !== "production") {
      console.info(`[email:dev] Enlace de recuperación: ${url}`);
    } else {
      console.warn("[email] RESEND_API_KEY no está configurado.");
    }
    return false;
  }

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

  return sendEmail({
    to,
    subject: content.subject,
    text,
    html,
  });
}
