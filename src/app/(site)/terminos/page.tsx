import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/legal-page";
import { getLocale } from "@/lib/i18n/locale";
import { siteLegalContent } from "@/lib/i18n/legal";
import { socialMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const content = siteLegalContent[locale].terms;

  return {
    title: content.metaTitle,
    description: content.metaDescription,
    robots: { index: true, follow: true },
    ...socialMetadata({
      title: content.metaTitle,
      description: content.metaDescription,
      path: "/terminos",
      locale,
      imageAlt: "PodZcash",
    }),
  };
}

export default async function TermsPage() {
  const locale = await getLocale();

  return <LegalPage content={siteLegalContent[locale].terms} />;
}
