import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/legal-page";
import { getLocale } from "@/lib/i18n/locale";
import { siteLegalContent } from "@/lib/i18n/legal";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const content = siteLegalContent[locale].terms;

  return {
    title: content.metaTitle,
    description: content.metaDescription,
    robots: { index: true, follow: true },
  };
}

export default async function TermsPage() {
  const locale = await getLocale();

  return <LegalPage content={siteLegalContent[locale].terms} />;
}
