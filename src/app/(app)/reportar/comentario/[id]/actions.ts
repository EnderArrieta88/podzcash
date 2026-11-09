"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/session";
import { take } from "@/lib/rate-limit";
import { commentReportContent } from "@/lib/i18n/comment-report";

const REASONS = new Set(
  commentReportContent.es.reasons.map((reason) => reason.value),
);

export async function submitCommentReportAction(
  formData: FormData,
): Promise<void> {
  const user = await getCurrentUser();
  const id = String(formData.get("commentId") ?? "").trim();

  if (!id) redirect("/explorar");

  const target = `/reportar/comentario/${id}`;

  if (!user) redirect("/entrar");

  const reason = String(formData.get("reason") ?? "").trim();
  const details = String(formData.get("details") ?? "").trim().slice(0, 1000);

  if (!REASONS.has(reason)) {
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
