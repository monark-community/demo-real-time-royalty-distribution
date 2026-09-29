import type { Metadata } from "next"

import { WorkView } from "@/components/demo/work-view"
import { isLocale, locales } from "@/i18n/config"
import { getDictionary } from "@/i18n"
import { pageMetadata } from "@/lib/metadata"

const SEEDED = ["night-bus-home", "fieldnotes-s2", "live-at-sala-rossa"]

/** Seeded works are prerendered; works created in the demo render on demand (the data lives in the browser). */
export function generateStaticParams() {
  return locales.flatMap((locale) => SEEDED.map((id) => ({ locale, id })))
}

export async function generateMetadata({ params }: PageProps<"/[locale]/app/works/[id]">): Promise<Metadata> {
  const { locale, id } = await params
  if (!isLocale(locale)) return {}
  const d = getDictionary(locale).meta
  return pageMetadata(locale, `/app/works/${id}`, d.workTitle, d.studioDescription)
}

export default async function WorkPage({ params }: PageProps<"/[locale]/app/works/[id]">) {
  const { id } = await params
  return <WorkView id={id} />
}
