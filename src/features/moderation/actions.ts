"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { take } from "@/lib/rate-limit";
import { getCurrentUser } from "@/lib/auth/session";
import { commentReportContent } from "@/lib/i18n/comment-report";

const COMMENT_REASONS = new Set(
  commentReportContent.es.reasons.map((reason) => reason.value),
);

export async function submitReportAction(formData: FormData): Promise<void> {
  const targetType = String(formData.get("targetType") ?? "episode");
  const targetId = String(formData.get("targetId") ?? "");
  const reason = String(formData.get("reason") ?? "")
    .trim()
    .slice(0, 40);
  const details = String(formData.get("details") ?? "")
    .trim()
    .slice(0, 1000);
  const email = String(formData.get("email") ?? "")
    .trim()
    .slice(0, 200);

  if (!targetId || !reason) {
    redirect(`/reportar/${targetId}?error=invalid`);
  }

  const requestHeaders = await headers();
  const ip =
    requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";

  if (!take(`report:${ip}`, 5, 60 * 60 * 1000)) {
    redirect(`/reportar/${targetId}?error=limit`);
  }

  const target =
    targetType === "channel"
      ? await prisma.channel.findUnique({
          where: { id: targetId },
          select: { id: true },
        })
      : await prisma.episode.findUnique({
          where: { id: targetId },
          select: { id: true },
        });

  if (!target) redirect("/explorar");

  await prisma.report.create({
    data: {
      targetType,
      targetId,
      reason,
      details: details || null,
      reporterEmail: email || null,
    },
  });

  redirect(`/reportar/${targetId}?ok=1`);
}

export async function submitCommentReportAction(
  formData: FormData,
): Promise<void> {
  const user = await getCurrentUser();
  const id = String(formData.get("commentId") ?? "").trim();

  if (!id) redirect("/explorar");

  const target = `/reportar/comentario/${id}`;

  if (!user) redirect("/entrar");

  const reason = String(formData.get("reason") ?? "").trim();
  const details = String(formData.get("details") ?? "")
    .trim()
    .slice(0, 1000);

  if (!COMMENT_REASONS.has(reason)) {
    redirect(`${target}?error=invalid`);
  }

  const comment = await prisma.episodeComment.findUnique({
    where: { id },
    select: { id: true, userId: true },
  });

  if (!comment) redirect("/explorar");

  if (comment.userId === user.id) {
    redirect(`${target}?error=own`);
  }

  if (!take(`comment-report:${user.id}`, 10, 60 * 60 * 1000)) {
    redirect(`${target}?error=limit`);
  }

  const duplicate = await prisma.report.findFirst({
    where: {
      targetType: "comment",
      targetId: id,
      reporterId: user.id,
      status: "open",
    },
    select: { id: true },
  });

  if (duplicate) {
    redirect(`${target}?error=duplicate`);
  }

  await prisma.report.create({
    data: {
      targetType: "comment",
      targetId: id,
      reason,
      details: details || null,
      reporterId: user.id,
      reporterEmail: user.email,
    },
  });

  redirect(`${target}?ok=1`);
}
