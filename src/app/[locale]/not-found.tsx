import Link from "next/link"
import { locale as rootLocale } from "next/root-params"

import { SiteFooter } from "@/components/site/site-footer"
import { SiteHeader } from "@/components/site/site-header"
import { Button } from "@/components/ui/button"
import { href, isLocale, type Locale } from "@/i18n/config"
import { getDictionary } from "@/i18n"

async function currentLocale(): Promise<Locale> {
  const value = await rootLocale()
  return value && isLocale(value) ? value : "en"
}

export default async function NotFound() {
  const locale = await currentLocale()
  const dict = getDictionary(locale)
  return (
    <>
      <SiteHeader locale={locale} dict={dict} />
      <main id="main" tabIndex={-1} className="flex flex-1 flex-col outline-none">
        <section className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center px-4 py-20 sm:px-6">
          <div aria-hidden className="flex h-24 items-end gap-1.5">
            {[18, 30, 12, 44, 8, 26, 4, 0, 0, 0, 0, 0].map((h, i) => (
              <span
                key={i}
                className={i === 3 ? "w-3 rounded-sm bg-primary" : "w-3 rounded-sm bg-meter-off"}
                style={{ height: `${Math.max(4, h * 2)}px` }}
              />
            ))}
          </div>
          <p className="silk mt-8 text-brass">404</p>
          <h1 className="display mt-3 text-4xl text-balance sm:text-6xl">{dict.notFound.title}</h1>
          <p className="mt-5 max-w-lg text-lg text-muted-foreground">{dict.notFound.body}</p>
          <div className="mt-9 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <Button asChild size="lg">
              <Link href={href(locale)}>{dict.notFound.home}</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href={href(locale, "/app")}>{dict.common.openStudio}</Link>
            </Button>
          </div>
        </section>
      </main>
      <SiteFooter locale={locale} dict={dict} />
    </>
  )
}
