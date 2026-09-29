import type { Metadata } from "next"
import { Suspense } from "react"

import { LedgerView } from "@/components/demo/ledger-view"
import { isLocale } from "@/i18n/config"
import { getDictionary } from "@/i18n"
import { pageMetadata } from "@/lib/metadata"

export async function generateMetadata({ params }: PageProps<"/[locale]/app/ledger">): Promise<Metadata> {
  const { locale } = await params
  if (!isLocale(locale)) return {}
  const d = getDictionary(locale).meta
  return pageMetadata(locale, "/app/ledger", d.ledgerTitle, d.studioDescription)
}

export default function LedgerPage() {
  return (
    <Suspense>
      <LedgerView />
    </Suspense>
  )
}
