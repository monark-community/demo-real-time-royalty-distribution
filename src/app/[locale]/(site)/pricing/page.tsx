import { CheckIcon } from "lucide-react"
import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { isLocale } from "@/i18n/config"
import { getDictionary } from "@/i18n"
import { cn } from "@/lib/utils"

/** Internal strategy review only: never linked, not in the sitemap, not indexed. */
export async function generateMetadata({ params }: PageProps<"/[locale]/pricing">): Promise<Metadata> {
  const { locale } = await params
  if (!isLocale(locale)) return {}
  return {
    title: getDictionary(locale).meta.pricingTitle,
    robots: { index: false, follow: false },
  }
}

export default async function PricingPage({ params }: PageProps<"/[locale]/pricing">) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const p = getDictionary(locale).pricing

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:py-20">
      <p className="silk inline-flex items-center gap-2 rounded-sm border border-dashed px-2 py-1 text-brass">{p.eyebrow}</p>
      <h1 className="display mt-5 text-4xl sm:text-6xl">{p.title}</h1>
      <p className="mt-5 max-w-3xl text-lg text-muted-foreground">{p.intro}</p>

      <ul className="mt-12 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {p.tiers.map((tier, i) => (
          <li key={tier.name} className={cn("module flex flex-col p-6", i === 1 && "border-primary/60")}>
            <h2 className="silk text-muted-foreground">{tier.name}</h2>
            <p className="mt-4 flex items-baseline gap-1">
              <span className="display text-4xl">{tier.price}</span>
              {i === 2 && <span className="text-sm text-muted-foreground">tUSDC{p.perMonth}</span>}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">{tier.note}</p>
            <ul className="mt-6 space-y-2 border-t pt-5">
              {tier.points.map((pt) => (
                <li key={pt} className="flex gap-2 text-sm">
                  <CheckIcon className="mt-0.5 size-4 shrink-0 text-success" aria-hidden />
                  {pt}
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>

      <section className="mt-14 max-w-3xl">
        <h2 className="wide text-2xl font-extrabold">{p.reasoningTitle}</h2>
        <ol className="mt-5 space-y-4">
          {p.reasoning.map((r, i) => (
            <li key={r} className="flex gap-4">
              <span className="nums pt-0.5 text-sm text-brass">0{i + 1}</span>
              <p className="text-muted-foreground">{r}</p>
            </li>
          ))}
        </ol>
      </section>
    </div>
  )
}
