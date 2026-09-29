import Link from "next/link"
import type { ReactNode } from "react"

import { href, type Locale } from "@/i18n/config"
import type { Dictionary } from "@/i18n"

import { Wordmark } from "./brand"
import { LocaleSwitch } from "./locale-switch"
import { MobileMenu } from "./mobile-menu"
import { NavLinks, type NavItem } from "./nav-links"
import { ThemeToggle } from "./theme"

export function siteNav(locale: Locale, dict: Dictionary): NavItem[] {
  return [
    { href: href(locale, "/app"), label: dict.nav.studio, prefix: true },
    { href: href(locale, "/how-it-works"), label: dict.nav.howItWorks },
  ]
}

/**
 * Sticky header. `action` replaces the default "Open the studio" pill (the app
 * puts the wallet there); `badge` sits next to the wordmark.
 */
export function SiteHeader({
  locale,
  dict,
  action,
  mobileAction,
  badge,
}: {
  locale: Locale
  dict: Dictionary
  action?: ReactNode
  mobileAction?: ReactNode
  badge?: ReactNode
}) {
  const items = siteNav(locale, dict)
  const chip = badge ?? (
    <span
      title={dict.common.demoBadge}
      className="silk inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/8 px-2.5 py-1 text-primary"
    >
      <span className="size-1.5 rounded-full bg-primary" aria-hidden />
      {dict.common.demoChip}
    </span>
  )
  const cta = (
    <Link
      href={href(locale, "/app")}
      className="inline-flex h-10 items-center rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-[inset_0_1px_0_rgb(255_255_255/0.14)] transition-colors hover:bg-primary/90"
    >
      {dict.common.openStudio}
    </Link>
  )
  const switches = (
    <>
      <LocaleSwitch locale={locale} label={dict.common.language} names={dict.common.languageNames} />
      <ThemeToggle toDark={dict.common.toDark} toLight={dict.common.toLight} />
    </>
  )

  return (
    <header className="sticky top-0 z-40 border-b bg-background/92 backdrop-blur-sm supports-[backdrop-filter]:bg-background/85">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:px-6">
        <Link href={href(locale)} className="-ml-1 rounded-md p-1" aria-label={`StreamRoyalties, ${dict.nav.home}`}>
          <Wordmark />
        </Link>
        <nav aria-label={dict.nav.primary} className="ml-4 hidden md:block">
          <NavLinks items={items} />
        </nav>
        <div className="ml-auto hidden items-center gap-2 md:flex">
          <span className="hidden lg:inline-flex">{chip}</span>
          {switches}
          <div className="ml-1">{action ?? cta}</div>
        </div>
        <div className="ml-auto flex items-center gap-1 md:hidden">
          {mobileAction}
          <MobileMenu items={items} openLabel={dict.common.openMenu} closeLabel={dict.common.closeMenu} title={dict.common.menu}>
            <div className="flex">{chip}</div>
            <div className="flex items-center justify-between gap-3">{switches}</div>
            {action ? null : cta}
          </MobileMenu>
        </div>
      </div>
    </header>
  )
}
