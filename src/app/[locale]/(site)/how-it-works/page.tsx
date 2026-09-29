import { ArrowRightIcon, CheckIcon, MinusIcon } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"

import { Button } from "@/components/ui/button"
import { href, isLocale } from "@/i18n/config"
import { getDictionary } from "@/i18n"
import { integer, percent } from "@/lib/format"
import { pageMetadata } from "@/lib/metadata"
import { photos } from "@/lib/photos"

export async function generateMetadata({ params }: PageProps<"/[locale]/how-it-works">) {
  const { locale } = await params
  if (!isLocale(locale)) return {}
  const d = getDictionary(locale).meta
  return pageMetadata(locale, "/how-it-works", d.howTitle, d.howDescription)
}

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section aria-labelledby={id} className="grid gap-6 border-t py-12 lg:grid-cols-[18rem_1fr] lg:gap-12 lg:py-16">
      <h2 id={id} className="wide text-2xl font-extrabold text-balance sm:text-3xl">
        {title}
      </h2>
      <div className="min-w-0">{children}</div>
    </section>
  )
}

export default async function HowItWorksPage({ params }: PageProps<"/[locale]/how-it-works">) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const dict = getDictionary(locale)
  const h = dict.how
  const a = h.anatomyLabels

  const before = { noor: 3500, theo: 2500, ama: 2000, rui: 1000, band: 1000 }
  const after = { noor: 3267, theo: 3000, ama: 1867, rui: 933, band: 933 }
  const names = { noor: "Noor", theo: "Théo", ama: "Ama", rui: "Rui", band: dict.roles.treasury }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 sm:px-6">
      {/* Intro */}
      <header className="grid gap-10 py-12 lg:grid-cols-[1.2fr_1fr] lg:items-end lg:py-20">
        <div>
          <p className="silk flex items-center gap-2 text-brass">
            <span className="h-px w-6 bg-current" aria-hidden />
            {h.eyebrow}
          </p>
          <h1 className="display mt-5 text-4xl text-balance sm:text-6xl">{h.title}</h1>
          <p className="mt-6 max-w-2xl text-lg text-muted-foreground">{h.intro}</p>
        </div>
        <div className="relative aspect-[4/3] overflow-hidden rounded-xl border">
          <Image
            src={photos.producer.src}
            alt={h.photoAlt}
            fill
            priority
            sizes="(min-width: 1024px) 40vw, 100vw"
            className="object-cover grayscale contrast-[1.05]"
          />
        </div>
      </header>

      <Section id="anatomy" title={h.anatomyTitle}>
        <p className="max-w-2xl text-lg text-muted-foreground">{h.anatomyBody}</p>
        {/* Diagram: sources → contract (sheet + bonus) → balances → withdraw */}
        <div className="mt-8 grid items-stretch gap-3 md:grid-cols-[1fr_auto_1.3fr_auto_1fr]">
          <div className="module p-4">
            <p className="silk text-muted-foreground">{a.sources}</p>
            <ul className="mt-3 space-y-2 text-sm">
              {(["streams", "editions", "unlocks", "sync"] as const).map((s) => (
                <li key={s} className="flex items-center justify-between gap-2 rounded-md border bg-background px-3 py-2">
                  <span>{dict.sources[s]}</span>
                  <span className="text-xs text-muted-foreground">{dict.payers[s]}</span>
                </li>
              ))}
            </ul>
          </div>
          <Arrow />
          <div className="rounded-xl border-2 border-primary/60 bg-card p-4">
            <p className="silk text-primary">{a.contract}</p>
            <div className="mt-3 rounded-md border bg-background p-3">
              <p className="silk text-muted-foreground">{a.sheet}</p>
              <div className="mt-2 flex h-3 overflow-hidden rounded-sm">
                {Object.entries(before).map(([k, v], i) => (
                  <span key={k} style={{ width: `${v / 100}%` }} className={["bg-chart-1", "bg-chart-2", "bg-chart-3", "bg-chart-4", "bg-chart-5"][i]} />
                ))}
              </div>
            </div>
            <div className="mt-2 rounded-md border border-dashed bg-background p-3">
              <p className="silk text-muted-foreground">{a.bonus}</p>
              <p className="nums mt-1 text-sm">+5 · Théo · {integer(1_000_000, locale)}</p>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">{a.dust}</p>
          </div>
          <Arrow />
          <div className="module p-4">
            <p className="silk text-muted-foreground">{a.balances}</p>
            <ul className="mt-3 space-y-2">
              {Object.entries(before).map(([k, v]) => (
                <li key={k} className="flex items-center gap-2 text-sm">
                  <span className="w-12 shrink-0 truncate">{names[k as keyof typeof names]}</span>
                  <span className="h-2 flex-1 rounded-sm bg-meter-off">
                    <span className="block h-full rounded-sm bg-brass" style={{ width: `${(v / 3500) * 100}%` }} />
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-primary">
              {a.withdraw}
              <ArrowRightIcon className="size-3" aria-hidden />
            </p>
          </div>
        </div>
      </Section>

      <Section id="cadence" title={h.cadenceTitle}>
        <p className="max-w-2xl text-lg text-muted-foreground">{h.cadenceBody}</p>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <div className="module p-5">
            <p className="silk text-primary">{h.continuousLabel}</p>
            <svg viewBox="0 0 300 60" className="mt-4 h-16 w-full" aria-hidden>
              <path d="M0 50 H300" className="stroke-border" strokeWidth="1" />
              {Array.from({ length: 30 }, (_, i) => (
                <rect key={i} x={i * 10 + 2} y={50 - (8 + ((i * 7) % 11))} width="5" height={8 + ((i * 7) % 11)} className="fill-primary" rx="1" />
              ))}
            </svg>
            <ul className="mt-4 space-y-2">
              {h.continuousPoints.map((p) => (
                <li key={p} className="flex gap-2 text-sm">
                  <CheckIcon className="mt-0.5 size-4 shrink-0 text-success" aria-hidden />
                  {p}
                </li>
              ))}
            </ul>
          </div>
          <div className="module p-5">
            <p className="silk text-brass">{h.intervalLabel}</p>
            <svg viewBox="0 0 300 60" className="mt-4 h-16 w-full" aria-hidden>
              <path d="M0 50 H300" className="stroke-border" strokeWidth="1" />
              {[0, 1, 2].map((w) => (
                <g key={w}>
                  {Array.from({ length: 9 }, (_, i) => (
                    <rect key={i} x={w * 100 + i * 10 + 2} y={46} width="5" height="4" className="fill-meter-off" rx="1" />
                  ))}
                  <rect x={w * 100 + 90} y={8} width="7" height="42" className="fill-brass" rx="1" />
                </g>
              ))}
            </svg>
            <ul className="mt-4 space-y-2">
              {h.intervalPoints.map((p) => (
                <li key={p} className="flex gap-2 text-sm">
                  <CheckIcon className="mt-0.5 size-4 shrink-0 text-success" aria-hidden />
                  {p}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      <Section id="precision" title={h.precisionTitle}>
        <p className="max-w-2xl text-lg text-muted-foreground">{h.precisionBody}</p>
        <div className="module mt-8 max-w-xl overflow-hidden">
          <p className="border-b px-5 py-3 text-sm font-semibold">{h.precisionExample}</p>
          <table className="w-full text-sm">
            <tbody>
              {h.precisionRows.map(([k, v], i) => (
                <tr key={k} className={i === h.precisionRows.length - 1 ? "bg-accent/60" : undefined}>
                  <th scope="row" className="border-b px-5 py-2.5 text-left font-normal">
                    {k}
                  </th>
                  <td className="nums border-b px-5 py-2.5 text-right">{v}</td>
                </tr>
              ))}
              <tr>
                <th scope="row" className="px-5 py-3 text-left font-semibold">
                  {h.precisionTotal[0]}
                </th>
                <td className="nums px-5 py-3 text-right font-semibold">{h.precisionTotal[1]}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Section>

      <Section id="bonus" title={h.bonusTitle}>
        <p className="max-w-2xl text-lg text-muted-foreground">{h.bonusBody}</p>
        <div className="mt-8 grid max-w-3xl gap-4 sm:grid-cols-2">
          {[
            { label: h.bonusBefore, shares: before },
            { label: h.bonusAfter, shares: after },
          ].map((col, ci) => (
            <div key={col.label} className="module p-5">
              <p className={ci === 1 ? "silk text-primary" : "silk text-muted-foreground"}>{col.label}</p>
              <ul className="mt-4 space-y-2.5">
                {Object.entries(col.shares).map(([k, v]) => (
                  <li key={k} className="flex items-center gap-3 text-sm">
                    <span className="w-20 shrink-0 truncate">{names[k as keyof typeof names]}</span>
                    <span className="h-2 flex-1 rounded-sm bg-meter-off">
                      <span
                        className={ci === 1 && k === "theo" ? "block h-full rounded-sm bg-primary" : "block h-full rounded-sm bg-brass"}
                        style={{ width: `${(v / 3500) * 100}%` }}
                      />
                    </span>
                    <span className="nums w-16 text-right">{percent(v, locale, 2)}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Section>

      <Section id="amend" title={h.amendTitle}>
        <p className="max-w-2xl text-lg text-muted-foreground">{h.amendBody}</p>
      </Section>

      <Section id="chain" title={h.chainTitle}>
        <div className="grid max-w-3xl gap-4 sm:grid-cols-2">
          <div className="module p-5">
            <p className="silk text-primary">{h.onChainLabel}</p>
            <ul className="mt-3 space-y-2">
              {h.onChain.map((x) => (
                <li key={x} className="flex gap-2 text-sm">
                  <CheckIcon className="mt-0.5 size-4 shrink-0 text-success" aria-hidden />
                  {x}
                </li>
              ))}
            </ul>
          </div>
          <div className="module p-5">
            <p className="silk text-muted-foreground">{h.offChainLabel}</p>
            <ul className="mt-3 space-y-2">
              {h.offChain.map((x) => (
                <li key={x} className="flex gap-2 text-sm text-muted-foreground">
                  <MinusIcon className="mt-0.5 size-4 shrink-0" aria-hidden />
                  {x}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      <section className="mb-16 flex flex-col items-start gap-6 rounded-2xl bg-[#1a1714] p-8 text-[#eee7d9] sm:flex-row sm:items-center sm:justify-between sm:p-10">
        <div>
          <h2 className="display text-3xl">{h.ctaTitle}</h2>
          <p className="mt-2 text-[#b9ad9b]">{h.ctaBody}</p>
        </div>
        <Button asChild size="lg" className="bg-[#e57a8e] text-[#1a0c10] hover:bg-[#ec95a5]">
          <Link href={href(locale, "/app")}>
            {dict.common.openStudio}
            <ArrowRightIcon aria-hidden />
          </Link>
        </Button>
      </section>
    </div>
  )
}

function Arrow() {
  return (
    <div className="flex items-center justify-center text-muted-foreground" aria-hidden>
      <ArrowRightIcon className="size-5 rotate-90 md:rotate-0" />
    </div>
  )
}
