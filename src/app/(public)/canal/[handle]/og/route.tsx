import { ImageResponse } from "next/og";
import { getChannelOgData } from "@/features/channels/og-queries";

export const runtime = "nodejs";
export const size = { width: 1200, height: 630 };

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ handle: string }> },
) {
  const { handle } = await params;
  const channel = await getChannelOgData(handle);

  if (!channel) {
    return new Response("Canal no encontrado", { status: 404 });
  }

  const subtitle = (channel.bio ?? "Podcasts y música del ecosistema Zcash")
    .replace(/\s+/g, " ")
    .slice(0, 120);

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
        PODZCAST · CANAL
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        <div style={{ fontSize: 76, lineHeight: 1.05 }}>
          {channel.displayName}
        </div>
        <div style={{ fontSize: 32, color: "#94A3B8" }}>{subtitle}</div>
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
