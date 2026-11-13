import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { analyticsDay, getDashboardData } from "@/lib/analytics";
import { getStudioEpisodeSummary } from "@/features/episodes/queries";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ id: string }>;
};

function dayParam(value: string | null): string | null {
  return value && /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : null;
}

function escapeCsv(value: string | number): string {
  const text = String(value);
  return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

export async function GET(request: Request, context: RouteContext) {
  const user = await getCurrentUser();

  if (!user?.channel) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const episode = await getStudioEpisodeSummary(user.channel.id, id);

  if (!episode) {
    return NextResponse.json({ error: "notFound" }, { status: 404 });
  }

  const url = new URL(request.url);
  const today = analyticsDay();
  const defaultFrom = analyticsDay(new Date(Date.now() - 29 * 86_400_000));
  let from = dayParam(url.searchParams.get("from")) ?? defaultFrom;
  let to = dayParam(url.searchParams.get("to")) ?? today;

  if (from > to) {
    [from, to] = [to, from];
  }

  const data = getDashboardData({
    episodeId: episode.id,
    from,
    to,
    country: url.searchParams.get("country") || undefined,
    device: url.searchParams.get("device") || undefined,
    app: url.searchParams.get("app") || undefined,
  });

  const lines = [
    [
      "day",
      "rawDownloads",
      "validDownloads",
      "starts",
      "verifiedListens",
      "uniqueClients",
      "bytes",
    ].join(","),
    ...data.daily.map((point) =>
      [
        point.day,
        point.rawDownloads,
        point.validDownloads,
        point.starts,
        point.verifiedListens,
        point.uniqueClients,
        point.bytes,
      ]
        .map(escapeCsv)
        .join(","),
    ),
    [
      "total",
      data.summary.rawDownloads,
      data.summary.validDownloads,
      data.summary.starts,
      data.summary.verifiedListens,
      data.summary.uniqueClients,
      data.summary.bytes,
    ]
      .map(escapeCsv)
      .join(","),
  ];

  return new NextResponse(`${lines.join("\n")}\n`, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="analitica-${episode.slug}-${from}-${to}.csv"`,
      "Cache-Control": "private, no-store",
    },
  });
}
