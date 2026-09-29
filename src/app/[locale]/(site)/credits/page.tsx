import Image from "next/image"
import { notFound } from "next/navigation"

import { isLocale } from "@/i18n/config"
import { getDictionary, t } from "@/i18n"
import { pageMetadata } from "@/lib/metadata"
import { photos } from "@/lib/photos"

export async function generateMetadata({ params }: PageProps<"/[locale]/credits">) {
  const { locale } = await params
  if (!isLocale(locale)) return {}
  const d = getDictionary(locale).meta
  return pageMetadata(locale, "/credits", d.creditsTitle, d.creditsDescription)
}

export default async function CreditsPage({ params }: PageProps<"/[locale]/credits">) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const dict = getDictionary(locale)
  const c = dict.credits
  const usedOn = { home: dict.nav.home, "how-it-works": dict.nav.howItWorks } as const
  const alts = { songwriter: dict.home.photoAltSongwriter, band: dict.home.photoAltBand, producer: dict.how.photoAlt }

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6 lg:py-20">
      <p className="silk flex items-center gap-2 text-brass">
        <span className="h-px w-6 bg-current" aria-hidden />
        {c.eyebrow}
      </p>
      <h1 className="display mt-5 text-4xl sm:text-6xl">{c.title}</h1>
      <p className="mt-5 max-w-2xl text-lg text-muted-foreground">
        {c.body}{" "}
        <a href="https://unsplash.com/license" className="text-primary underline underline-offset-4" rel="noopener">
          {c.licence}
        </a>
      </p>
      <ul className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {(Object.keys(photos) as (keyof typeof photos)[]).map((key) => {
          const p = photos[key]
          return (
            <li key={key} className="module overflow-hidden">
              <div className="relative aspect-[4/3]">
                <Image src={p.src} alt={alts[key]} fill sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 100vw" className="object-cover grayscale" />
              </div>
              <div className="space-y-1 p-4 text-sm">
                <p className="font-semibold">
                  <a href={p.profile} rel="noopener" className="hover:text-primary hover:underline">
                    {t(c.by, { name: p.photographer })}
                  </a>
                </p>
                <p className="text-muted-foreground">
                  {c.usedOn}: {usedOn[p.usedOn]}
                </p>
                <p>
                  <a href={p.page} rel="noopener" className="text-primary underline underline-offset-4">
                    {c.onUnsplash}
                  </a>
                </p>
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
