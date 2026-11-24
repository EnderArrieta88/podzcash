import { LoadingState } from "@/components/ui/route-states";
import { commonContent } from "@/lib/i18n/common";
import { getLocale } from "@/lib/i18n/locale";

export default async function Loading() {
  const locale = await getLocale();

  return <LoadingState label={commonContent[locale].loading} />;
}
