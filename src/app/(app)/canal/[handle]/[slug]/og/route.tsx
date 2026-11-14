import { ImageResponse } from "next/og";
import { getEpisodeOgData } from "@/features/episodes/og-queries";

export const runtime = "nodejs";
export const size = { width: 1200, height: 630 };

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ handle: string; slug: string }> },
) {
  const { handle, slug } = await params;
  const data = await getEpisodeOgData(handle, slug);

  if (!data) {
    return new Response("Episodio no encontrado", { status: 404 });
  }

  const { channel, episode } = data;
  const title = episode.title.replace(/\s+/g, " ").slice(0, 110);

  return new ImageResponse(
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        width: "100%",
        height: "100%",
        padding: 64,
        background: "#0B0D11",
        color: "#E6E7EC",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          color: "#F4B728",
          fontSize: 30,
          letterSpacing: "0.08em",
        }}
      >
        PODZCAST · EPISODIO
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        <div style={{ fontSize: 68, lineHeight: 1.08 }}>{title}</div>
        <div style={{ fontSize: 32, color: "#94A3B8" }}>
          {channel.displayName}
        </div>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: 24,
          color: "#7F8B9C",
        }}
      >
        <span>@{channel.handle}</span>
        <span>podzcash.online</span>
      </div>
    </div>,
    size,
  );
}
