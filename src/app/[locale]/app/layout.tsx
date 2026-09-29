import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { AppProvider } from "@/components/demo/app-context"
import { AppSubnav, Gate, WalletChip } from "@/components/demo/shell"
import { SiteFooter } from "@/components/site/site-footer"
import { SiteHeader } from "@/components/site/site-header"
import { Toaster } from "@/components/ui/sonner"
import { isLocale } from "@/i18n/config"
import { getDictionary } from "@/i18n"
import { pageMetadata } from "@/lib/metadata"

export async function generateMetadata({ params }: LayoutProps<"/[locale]/app">): Promise<Metadata> {
  const { locale } = await params
  if (!isLocale(locale)) return {}
  const d = getDictionary(locale).meta
  return pageMetadata(locale, "/app", d.studioTitle, d.studioDescription)
}

export default async function AppLayout({ children, params }: LayoutProps<"/[locale]/app">) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const dict = getDictionary(locale)
  const d = {
    common: dict.common,
    app: dict.app,
    kinds: dict.kinds,
    cadences: dict.cadences,
    sources: dict.sources,
    payers: dict.payers,
    presets: dict.presets,
    roles: dict.roles,
  }

  return (
    <AppProvider locale={locale} d={d}>
      <SiteHeader locale={locale} dict={dict} action={<WalletChip />} mobileAction={<WalletChip compact />} />
      <AppSubnav />
      <main id="main" tabIndex={-1} className="flex flex-1 flex-col outline-none">
        <Gate>{children}</Gate>
      </main>
      <SiteFooter locale={locale} dict={dict} />
      <Toaster position="top-right" offset={{ top: 120, right: 24 }} mobileOffset={{ top: 124, left: 12, right: 12 }} />
    </AppProvider>
  )
}
