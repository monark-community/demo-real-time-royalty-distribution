import { ArrowRightIcon, AudioLinesIcon, ArrowDownToLineIcon, PlusIcon, SlidersVerticalIcon } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"

import { MeterBridge } from "@/components/home/meter-bridge"
import { Button } from "@/components/ui/button"
import { href, isLocale } from "@/i18n/config"
import { getDictionary } from "@/i18n"
import { pageMetadata } from "@/lib/metadata"
import { photos } from "@/lib/photos"

export async function generateMetadata({ params }: PageProps<"/[locale]">) {
  const { locale } = await params
  if (!isLocale(locale)) return {}
  const d = getDictionary(locale).meta
  return pageMetadata(locale, "/", null, d.description)
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="silk flex items-center gap-2 text-brass">
      <span className="h-px w-6 bg-current" aria-hidden />
      {children}
    </p>
  )
}

export default async function HomePage({ params }: PageProps<"/[locale]">) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const dict = getDictionary(locale)
  const h = dict.home
  const stepIcons = [SlidersVerticalIcon, ArrowDownToLineIcon, AudioLinesIcon]

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden border-b">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 pt-12 pb-16 sm:px-6 lg:grid-cols-[1.02fr_1fr] lg:items-center lg:gap-14 lg:pt-20 lg:pb-24">
          <div>
            <Eyebrow>{h.eyebrow}</Eyebrow>
            <h1 className="display mt-5 text-[2.6rem] text-balance sm:text-6xl lg:text-[4.1rem]">{h.title}</h1>
            <p className="mt-6 max-w-xl text-lg text-muted-foreground sm:text-xl">{h.sub}</p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link href={href(locale, "/app")}>
                  {h.ctaPrimary}
                  <ArrowRightIcon aria-hidden />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href={href(locale, "/how-it-works")}>{h.ctaSecondary}</Link>
              </Button>
            </div>
            <p className="mt-6 inline-flex items-center gap-2 text-xs text-muted-foreground">
              <span className="size-1.5 rounded-full bg-primary" aria-hidden />
              {dict.common.demoBadge}
            </p>
          </div>
          <MeterBridge
            locale={locale}
            labels={{
              label: h.meterLabel,
              caption: h.meterCaption,
              live: dict.common.live,
              incoming: h.meterIncoming,
              total: h.meterTotal,
              note: h.meterNote,
              roles: dict.roles,
              payers: dict.payers,
              presets: dict.presets,
              perSecond: dict.common.perSecond,
            }}
          />
        </div>
      </section>

      {/* The six-month wait */}
      <section className="border-b bg-panel">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:py-24">
          <div className="grid gap-10 lg:grid-cols-[1fr_1.5fr] lg:gap-16">
            <div>
              <Eyebrow>{h.waitEyebrow}</Eyebrow>
              <h2 className="display mt-4 text-3xl text-balance sm:text-5xl">{h.waitTitle}</h2>
              <p className="mt-5 max-w-md text-lg text-muted-foreground">{h.waitBody}</p>
            </div>
            <div className="space-y-5">
              <Timeline label={h.oldLabel} steps={h.oldSteps} tone="old" />
              <Timeline label={h.newLabel} steps={h.newSteps} tone="new" />
            </div>
          </div>
        </div>
      </section>

      {/* Three steps */}
      <section className="border-b">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:py-24">
          <Eyebrow>{h.stepsEyebrow}</Eyebrow>
          <h2 className="display mt-4 max-w-2xl text-3xl text-balance sm:text-5xl">{h.stepsTitle}</h2>
          <ol className="mt-12 grid gap-px overflow-hidden rounded-xl border bg-border md:grid-cols-3">
            {h.steps.map((s, i) => {
              const Icon = stepIcons[i] ?? AudioLinesIcon
              return (
                <li key={s.title} className="flex flex-col bg-card p-6 sm:p-8">
                  <div className="flex items-center justify-between">
                    <span className="nums text-sm text-brass">0{i + 1}</span>
                    <Icon className="size-5 text-primary" aria-hidden />
                  </div>
                  <h3 className="wide mt-8 text-xl font-bold">{s.title}</h3>
                  <p className="mt-3 text-muted-foreground">{s.body}</p>
                </li>
              )
            })}
          </ol>
        </div>
      </section>

      {/* Features */}
      <section className="border-b bg-panel">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:py-24">
          <Eyebrow>{h.featuresEyebrow}</Eyebrow>
          <h2 className="display mt-4 max-w-3xl text-3xl text-balance sm:text-5xl">{h.featuresTitle}</h2>
          <div className="mt-12 grid gap-4 sm:grid-cols-2">
            {h.features.map((f, i) => (
              <article key={f.title} className="module flex gap-5 p-6 sm:p-7">
                <FeatureGlyph index={i} />
                <div>
                  <h3 className="wide text-lg font-bold">{f.title}</h3>
                  <p className="mt-2 text-muted-foreground">{f.body}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Who it's for */}
      <section className="border-b">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:gap-14 lg:py-24">
          <div className="grid grid-cols-5 gap-3 self-start">
            <div className="relative col-span-3 aspect-[3/4] overflow-hidden rounded-xl border">
              <Image
                src={photos.songwriter.src}
                alt={h.photoAltSongwriter}
                fill
                sizes="(min-width: 1024px) 30vw, 60vw"
                className="object-cover object-[30%_50%] grayscale contrast-[1.05]"
              />
            </div>
            <div className="relative col-span-2 mt-16 aspect-[3/4] overflow-hidden rounded-xl border">
              <Image
                src={photos.band.src}
                alt={h.photoAltBand}
                fill
                sizes="(min-width: 1024px) 20vw, 40vw"
                className="object-cover object-[35%_50%] grayscale contrast-[1.05]"
              />
            </div>
          </div>
          <div>
            <Eyebrow>{h.whoEyebrow}</Eyebrow>
            <h2 className="display mt-4 text-3xl text-balance sm:text-5xl">{h.whoTitle}</h2>
            <ul className="mt-10 divide-y border-y">
              {h.who.map((w, i) => (
                <li key={w.title} className="flex gap-5 py-5">
                  <span className="nums pt-1 text-sm text-brass">0{i + 1}</span>
                  <div>
                    <h3 className="wide text-lg font-bold">{w.title}</h3>
                    <p className="mt-1 text-muted-foreground">{w.body}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-b bg-panel">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1fr_1.6fr] lg:py-24">
          <div>
            <Eyebrow>{h.faqEyebrow}</Eyebrow>
            <h2 className="display mt-4 text-3xl sm:text-5xl">{h.faqTitle}</h2>
          </div>
          <div className="divide-y rounded-xl border bg-card">
            {h.faq.map((f) => (
              <details key={f.q} className="group px-5 sm:px-6">
                <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 py-4 font-semibold [&::-webkit-details-marker]:hidden">
                  {f.q}
                  <PlusIcon className="size-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-45" aria-hidden />
                </summary>
                <p className="pb-5 text-muted-foreground">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Closing */}
      <section className="bg-[#1a1714] text-[#eee7d9]">
        <div className="mx-auto flex max-w-7xl flex-col items-start gap-8 px-4 py-16 sm:px-6 lg:flex-row lg:items-end lg:justify-between lg:py-20">
          <div className="max-w-2xl">
            <p className="silk inline-flex items-center gap-2 text-[#e57a8e]">
              <span className="size-2 animate-lamp rounded-full bg-[#e57a8e]" aria-hidden />
              {dict.common.live}
            </p>
            <h2 className="display mt-4 text-3xl text-balance sm:text-5xl">{h.closingTitle}</h2>
            <p className="mt-4 text-lg text-[#b9ad9b]">{h.closingBody}</p>
          </div>
          <Link
            href={href(locale, "/app")}
            className="inline-flex h-12 items-center gap-2 rounded-md bg-[#e57a8e] px-5 font-semibold text-[#1a0c10] transition-colors hover:bg-[#ec95a5]"
          >
            {h.ctaPrimary}
            <ArrowRightIcon className="size-4" aria-hidden />
          </Link>
        </div>
      </section>
    </>
  )
}

function Timeline({ label, steps, tone }: { label: string; steps: string[]; tone: "old" | "new" }) {
  const isNew = tone === "new"
  return (
    <div className={isNew ? "module border-primary/40 p-5 sm:p-6" : "module p-5 sm:p-6"}>
      <p className={isNew ? "silk text-primary" : "silk text-muted-foreground"}>{label}</p>
      <ol className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-3">
        {steps.map((s, i) => (
          <li key={s} className="flex items-center gap-2">
            <span
              className={
                isNew
                  ? "rounded-md bg-primary px-3 py-1.5 text-sm font-semibold text-primary-foreground"
                  : "rounded-md border bg-background px-3 py-1.5 text-sm text-muted-foreground"
              }
            >
              {s}
            </span>
            {i < steps.length - 1 && (
              <ArrowRightIcon className={isNew ? "size-4 text-primary" : "size-4 text-muted-foreground/70"} aria-hidden />
            )}
          </li>
        ))}
      </ol>
    </div>
  )
}

/** Small console-style glyphs for the feature modules. */
function FeatureGlyph({ index }: { index: number }) {
  const common = "size-12 shrink-0 rounded-md border bg-background p-2.5 text-primary"
  if (index === 0)
    return (
      <svg viewBox="0 0 28 28" className={common} aria-hidden>
        {[4, 9, 14, 19, 24].map((x, i) => (
          <rect key={x} x={x - 1.5} y={24 - (i + 1) * 3.6} width="3" height={(i + 1) * 3.6} rx="0.8" className="fill-current" />
        ))}
      </svg>
    )
  if (index === 1)
    return (
      <svg viewBox="0 0 28 28" className={common} aria-hidden>
        <path d="M3 22 L12 16 L18 18 L25 6" fill="none" className="stroke-current" strokeWidth="2" />
        <circle cx="25" cy="6" r="2.4" className="fill-current" />
        <path d="M3 25h22" className="stroke-brass" strokeWidth="1.5" strokeDasharray="2 2" />
      </svg>
    )
  if (index === 2)
    return (
      <svg viewBox="0 0 28 28" className={common} aria-hidden>
        {[6, 14, 22].map((x) => (
          <g key={x}>
            <path d={`M${x} 3v22`} className="stroke-muted-foreground" strokeWidth="1.5" />
            <rect x={x - 3} y={x === 14 ? 8 : 14} width="6" height="4" rx="1" className="fill-current" />
          </g>
        ))}
      </svg>
    )
  return (
    <svg viewBox="0 0 28 28" className={common} aria-hidden>
      {[6, 11, 16, 21].map((y, i) => (
        <g key={y}>
          <path d={`M3 ${y}h14`} className="stroke-muted-foreground" strokeWidth="1.5" />
          <path d={`M20 ${y}h5`} className={i === 3 ? "stroke-current" : "stroke-brass"} strokeWidth="1.5" />
        </g>
      ))}
    </svg>
  )
}
