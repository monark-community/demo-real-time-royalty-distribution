import type { Metadata } from "next"

import { Builder } from "@/components/demo/builder"
import { isLocale } from "@/i18n/config"
import { getDictionary } from "@/i18n"
import { pageMetadata } from "@/lib/metadata"

export async function generateMetadata({ params }: PageProps<"/[locale]/app/new">): Promise<Metadata> {
  const { locale } = await params
  if (!isLocale(locale)) return {}
  const d = getDictionary(locale).meta
  return pageMetadata(locale, "/app/new", d.newTitle, d.studioDescription)
}

export default function NewSplitSheetPage() {
  return <Builder />
}
