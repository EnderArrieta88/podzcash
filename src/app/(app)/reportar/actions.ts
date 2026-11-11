"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { take } from "@/lib/rate-limit";

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
