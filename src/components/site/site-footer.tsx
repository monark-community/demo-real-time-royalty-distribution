import Link from "next/link"

import { href, MONARK_URL, PROJECT_DOC_URL, REPO_URL, type Locale } from "@/i18n/config"
import type { Dictionary } from "@/i18n"

import { Wordmark } from "./brand"

export function SiteFooter({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const year = 2026
  return (
    <footer className="mt-auto border-t bg-panel">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr]">
        <div className="max-w-sm">
          <Wordmark />
          <p className="mt-4 text-sm text-muted-foreground">{dict.nav.footerTagline}</p>
          <p className="mt-5 inline-flex items-center gap-2 rounded-md border bg-card px-2.5 py-1.5 text-xs font-medium">
            <span className="size-1.5 rounded-full bg-primary" aria-hidden />
            {dict.common.demoBadge}
          </p>
          <p className="mt-3 text-xs text-muted-foreground">{dict.common.testnet}</p>
        </div>
        <nav aria-label={dict.nav.footerSite}>
          <h2 className="silk text-muted-foreground">{dict.nav.footerSite}</h2>
          <ul className="mt-3 space-y-1 text-sm">
            <li>
              <Link className="inline-flex min-h-9 items-center hover:text-primary" href={href(locale, "/app")}>
                {dict.nav.studio}
              </Link>
            </li>
            <li>
              <Link className="inline-flex min-h-9 items-center hover:text-primary" href={href(locale, "/how-it-works")}>
                {dict.nav.howItWorks}
              </Link>
            </li>
            <li>
              <Link className="inline-flex min-h-9 items-center hover:text-primary" href={href(locale, "/credits")}>
                {dict.nav.credits}
              </Link>
            </li>
          </ul>
        </nav>
        <nav aria-label={dict.nav.footerAbout}>
          <h2 className="silk text-muted-foreground">{dict.nav.footerAbout}</h2>
          <ul className="mt-3 space-y-1 text-sm">
            <li>
              <a className="inline-flex min-h-9 items-center hover:text-primary" href={PROJECT_DOC_URL} rel="noopener">
                {dict.nav.projectPage}
              </a>
            </li>
            <li>
              <a className="inline-flex min-h-9 items-center hover:text-primary" href={REPO_URL} rel="noopener">
                {dict.nav.repo}
              </a>
            </li>
          </ul>
        </nav>
      </div>
      <div className="border-t">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-5 text-[13px] text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>
            © {year} StreamRoyalties ·{" "}
            <Link href={href(locale, "/credits")} className="underline-offset-4 hover:underline">
              {dict.nav.photos}
            </Link>
          </p>
          <a href={MONARK_URL} className="underline-offset-4 hover:text-foreground hover:underline" rel="noopener">
            {dict.common.builtWith}
          </a>
        </div>
      </div>
    </footer>
  )
}
