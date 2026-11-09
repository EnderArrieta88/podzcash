import type { Metadata, Viewport } from "next";
import {
  Instrument_Serif,
  Inter,
  Plus_Jakarta_Sans,
  Space_Mono,
} from "next/font/google";
import { PlayerProvider } from "@/components/player/player-context";
import { PlayerBar } from "@/components/player/player-bar";
import { ServiceWorkerRegister } from "@/components/pwa/service-worker-register";
import { hasSessionCookie } from "@/lib/auth/session";
import { getLocale } from "@/lib/i18n/locale";
import { commonContent } from "@/lib/i18n/common";
import { PWA_THEME_COLOR } from "@/lib/pwa";
import { SITE_URL } from "@/lib/seo";
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

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  colorScheme: "dark",
  themeColor: PWA_THEME_COLOR,
};

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: commonContent[locale].siteTitle,
      template: "%s · PodZcash",
    },
    description: commonContent[locale].siteDescription,
    applicationName: "PodZcash",
    icons: {
      icon: [
        { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
        { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      ],
      apple: [
        {
          url: "/icons/apple-touch-icon.png",
          sizes: "180x180",
          type: "image/png",
        },
      ],
    },
    appleWebApp: {
      capable: true,
      title: "PodZcash",
      statusBarStyle: "black-translucent",
    },
    formatDetection: { telephone: false, email: false, address: false },
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [locale, signedIn] = await Promise.all([
    getLocale(),
    hasSessionCookie(),
  ]);

  return (
    <html lang={locale}>
      <body
        className={`${display.variable} ${sans.variable} ${heading.variable} ${mono.variable} min-h-dvh antialiased`}
      >
        <PlayerProvider signedIn={signedIn}>
          <PlayerBar locale={locale} />
          {children}
        </PlayerProvider>
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
