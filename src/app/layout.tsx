import type { Metadata } from "next";
import {
  Instrument_Serif,
  Inter,
  Plus_Jakarta_Sans,
  Space_Mono,
} from "next/font/google";
import { PlayerProvider } from "@/components/player/player-context";
import { PlayerBar } from "@/components/player/player-bar";
import "./globals.css";

const display = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-display-face",
  display: "swap",
});

const sans = Inter({
  subsets: ["latin"],
  variable: "--font-sans-face",
  display: "swap",
});

const heading = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-heading-face",
  display: "swap",
});

const mono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-mono-face",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "PodZcash — Podcasts y música del ecosistema Zcash",
    template: "%s · PodZcash",
  },
  description:
    "La plataforma donde podcasters y músicos del ecosistema Zcash publican su contenido, construyen su canal y reciben donaciones directas en ZEC.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es">
      <body
        className={`${display.variable} ${sans.variable} ${heading.variable} ${mono.variable} min-h-dvh antialiased`}
      >
        <PlayerProvider>
          <PlayerBar />
          {children}
        </PlayerProvider>
      </body>
    </html>
  );
}
