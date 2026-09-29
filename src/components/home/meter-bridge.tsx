"use client"

import { useEffect, useState } from "react"

import { intlLocale, type Locale } from "@/i18n/config"
import { cn } from "@/lib/utils"

/**
 * The home-page hero: a self-contained replay of revenue landing in the
 * "Night Bus Home" contract and splitting across five channel strips.
 * Deterministic on the server; animates only after mount.
 */

type Channel = { name: string; role: string; bps: number; base: number }

const CHANNELS: Channel[] = [
  { name: "Noor", role: "vocals", bps: 3500, base: 1_512.408_231 },
  { name: "Théo", role: "producer", bps: 2500, base: 1_080.291_594 },
  { name: "Ama", role: "writer", bps: 2000, base: 864.233_275 },
  { name: "Rui", role: "musician", bps: 1000, base: 432.116_637 },
  { name: "Band", role: "treasury", bps: 1000, base: 432.116_642 },
]

type Inflow = { key: string; amount: number; plays?: number }

const FEED: Inflow[] = [
  { key: "streams", amount: 4.1, plays: 1000 },
  { key: "streams", amount: 4.1, plays: 1000 },
  { key: "editions", amount: 25 },
  { key: "streams", amount: 4.1, plays: 1000 },
  { key: "unlocks", amount: 12 },
  { key: "streams", amount: 4.1, plays: 1000 },
  { key: "sync", amount: 400 },
]

const SEGMENTS = 14
/** Continuous stream rate in tUSDC per second. */
const TRICKLE = 0.02

export interface MeterBridgeLabels {
  label: string
  caption: string
  live: string
  incoming: string
  total: string
  note: string
  roles: Record<string, string>
  payers: Record<string, string>
  presets: Record<string, string>
  perSecond: string
}

export function MeterBridge({ locale, labels }: { locale: Locale; labels: MeterBridgeLabels }) {
  const [earned, setEarned] = useState(() => CHANNELS.map((c) => c.base))
  const [levels, setLevels] = useState(() => CHANNELS.map((c) => 0.25 + c.bps / 20_000))
  const [last, setLast] = useState<{ inflow: Inflow; n: number } | null>(null)

  useEffect(() => {
    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
    let step = 0
    let lastTick = performance.now()
    const tickMs = reduced ? 1000 : 60

    const tick = window.setInterval(() => {
      const now = performance.now()
      const dt = (now - lastTick) / 1000
      lastTick = now
      setEarned((prev) => prev.map((v, i) => v + (TRICKLE * dt * (CHANNELS[i]?.bps ?? 0)) / 10_000))
      if (!reduced) {
        setLevels((prev) =>
          prev.map((v, i) => {
            const floor = 0.22 + (CHANNELS[i]?.bps ?? 0) / 20_000 + Math.random() * 0.06
            return Math.max(floor, v - dt * 0.9)
          })
        )
      }
    }, tickMs)

    const land = () => {
      const inflow = FEED[step % FEED.length] as Inflow
      step += 1
      setLast({ inflow, n: step })
      setEarned((prev) => prev.map((v, i) => v + (inflow.amount * (CHANNELS[i]?.bps ?? 0)) / 10_000))
      const punch = Math.min(1, 0.55 + Math.log10(inflow.amount + 1) / 3)
      setLevels(CHANNELS.map((c) => Math.min(1, punch * (0.7 + c.bps / 10_000))))
    }
    const first = window.setTimeout(land, 900)
    const feed = window.setInterval(land, reduced ? 4000 : 2400)
    return () => {
      window.clearInterval(tick)
      window.clearInterval(feed)
      window.clearTimeout(first)
    }
  }, [])

  const nf = (digits: number) =>
    new Intl.NumberFormat(intlLocale[locale], { minimumFractionDigits: digits, maximumFractionDigits: digits })
  const six = nf(6)
  const two = nf(2)
  const pct = new Intl.NumberFormat(intlLocale[locale], { style: "percent" })
  const total = earned.reduce((s, v) => s + v, 0)

  return (
    <figure
      aria-label={labels.label}
      className="relative overflow-hidden rounded-2xl border border-[#3a332c] bg-[#1a1714] dark:border-[#4a4138] dark:bg-[#211d19] text-[#eee7d9] shadow-[0_30px_80px_-40px_rgb(26_23_20/0.8),inset_0_1px_0_rgb(255_255_255/0.06)]"
    >
      {/* Header strip */}
      <div className="flex items-center justify-between gap-3 border-b border-[#3a332c] px-4 py-3 sm:px-5">
        <span className="silk truncate text-[#d2a860]">Night Bus Home</span>
        <span className="silk inline-flex shrink-0 items-center gap-2 rounded-sm border border-[#e57a8e]/50 px-2 py-0.5 text-[#e57a8e]">
          <span className="size-1.5 animate-lamp rounded-full bg-[#e57a8e]" aria-hidden />
          {labels.live}
        </span>
      </div>

      {/* Incoming feed */}
      <div className="flex min-h-12 items-center gap-3 border-b border-[#3a332c] bg-[#141210] px-4 py-2 sm:px-5" aria-live="off">
        <span className="silk shrink-0 text-[#a99f8f]">{labels.incoming}</span>
        {last ? (
          <span key={last.n} className="flex min-w-0 animate-roll-in items-baseline gap-2 text-sm">
            <span className="nums font-medium text-[#eee7d9]">+{two.format(last.inflow.amount)}</span>
            <span className="truncate text-[#a99f8f]">{labels.presets[last.inflow.key]}</span>
          </span>
        ) : (
          <span className="nums text-sm text-[#a99f8f]">
            +{two.format(TRICKLE)}
            {labels.perSecond}
          </span>
        )}
      </div>

      {/* Channel strips */}
      <div className="grid grid-cols-5 divide-x divide-[#3a332c]">
        {CHANNELS.map((c, i) => {
          const lit = Math.round((levels[i] ?? 0) * SEGMENTS)
          return (
            <div key={c.name} className="flex min-w-0 flex-col items-center px-1.5 pt-4 pb-3 sm:px-3">
              <div className="flex h-36 w-4 flex-col-reverse gap-[3px] sm:h-44 sm:w-5" aria-hidden>
                {Array.from({ length: SEGMENTS }, (_, s) => {
                  const on = s < lit
                  const hot = s >= SEGMENTS - 3
                  return (
                    <span
                      key={s}
                      className={cn(
                        "h-full w-full rounded-[2px] transition-colors duration-150",
                        on ? (hot ? "bg-[#e57a8e]" : "bg-[#d2a860]") : "bg-[#312b25]"
                      )}
                    />
                  )
                })}
              </div>
              <span className="nums mt-3 text-[11px] text-[#d2a860] sm:text-xs">{pct.format(c.bps / 10_000)}</span>
              <span className="mt-1 max-w-full truncate text-xs font-semibold sm:text-sm">{c.name}</span>
              <span className="hidden max-w-full truncate text-[11px] text-[#a99f8f] sm:block">{labels.roles[c.role]}</span>
              <span className="nums mt-2 max-w-full truncate text-[10px] text-[#eee7d9] tabular-nums sm:text-xs">
                {six.format(earned[i] ?? 0)}
              </span>
            </div>
          )
        })}
      </div>

      {/* Master */}
      <div className="flex flex-wrap items-end justify-between gap-2 border-t border-[#3a332c] px-4 py-3 sm:px-5">
        <div>
          <p className="silk text-[#a99f8f]">{labels.total}</p>
          <p className="nums text-xl font-medium sm:text-2xl">
            {six.format(total)} <span className="text-sm text-[#a99f8f]">tUSDC</span>
          </p>
        </div>
        <figcaption className="text-right text-[11px] text-[#a99f8f] sm:text-xs">
          {labels.caption}
          <br />
          {labels.note}
        </figcaption>
      </div>
    </figure>
  )
}
