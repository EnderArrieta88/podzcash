import type { Metadata } from "next";
import {
  Instrument_Serif,
  Inter,
  Plus_Jakarta_Sans,
  Space_Mono,
} from "next/font/google";
import { PlayerProvider } from "@/components/player/player-context";
import { PlayerBar } from "@/components/player/player-bar";
import { getLocale } from "@/lib/i18n/locale";
import { commonContent } from "@/lib/i18n/common";
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

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();

  return {
    title: {
      default: commonContent[locale].siteTitle,
      template: "%s · PodZcash",
    },
    description: commonContent[locale].siteDescription,
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();

  return (
    <html lang={locale}>
      <body
        className={`${display.variable} ${sans.variable} ${heading.variable} ${mono.variable} min-h-dvh antialiased`}
      >
        <PlayerProvider>
          <PlayerBar locale={locale} />
          {children}
        </PlayerProvider>
      </body>
    </html>
  );
}
