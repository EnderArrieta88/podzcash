import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import "./globals.css";

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
      <body className="min-h-dvh antialiased">
        <SiteHeader />
        <main>{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
