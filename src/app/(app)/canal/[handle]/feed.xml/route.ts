import { prisma } from "@/lib/db";
import { env } from "@/lib/env";
import { buildChannelFeed } from "@/lib/feed-xml";
import { siteOrigin } from "@/lib/rss";
import { normalizeHandleParam } from "@/lib/routes";

export const dynamic = "force-dynamic";

const OWNER_EMAIL = env.FEED_OWNER_EMAIL;

type RouteContext = { params: Promise<{ handle: string }> };

export async function GET(request: Request, context: RouteContext) {
  const { handle } = await context.params;

  const channel = await prisma.channel.findUnique({
    where: { handle: normalizeHandleParam(handle) },
    include: {
      episodes: {
        where: { status: "published" },
        orderBy: { publishedAt: "asc" },
        include: { tags: { include: { tag: true } } },
      },
    },
  });

  if (!channel) {
    return new Response("Canal no encontrado", { status: 404 });
  }

  const xml = buildChannelFeed({
    channel,
    episodes: channel.episodes,
    origin: siteOrigin(request),
    ownerFallback: OWNER_EMAIL,
  });

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=300, s-maxage=300",
    },
  });
}
