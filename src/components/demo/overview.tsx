"use client"

import { ArrowRightIcon, ArrowUpRightIcon, PlusIcon } from "lucide-react"
import Link from "next/link"
import { useMemo, useState } from "react"

import { Button } from "@/components/ui/button"
import { href } from "@/i18n/config"
import { t } from "@/i18n/t"
import { dayLabel, percent, tokens, tokensWithUnit } from "@/lib/format"
import { useDemo, useNow } from "@/lib/demo/hooks"
import { effectiveShares, liveEarned, liveHeld } from "@/lib/demo/math"
import { claimable, youIn, yourRate } from "@/lib/demo/store"
import type { DemoState, Work } from "@/lib/demo/types"
import { cn } from "@/lib/utils"

import { useApp } from "./app-context"
import { LedgerRows } from "./ledger-rows"
import { EmptyState, KindIcon, PageHeading } from "./parts"
import { WithdrawDialog } from "./withdraw-dialog"

export function Overview() {
  const { d, locale } = useApp()
  const state = useDemo()
  const o = d.app.overview
  if (!state) return null

  return (
    <div className="mx-auto w-full max-w-7xl space-y-10 px-4 py-8 sm:px-6 sm:py-12">
      <PageHeading
        eyebrow={o.eyebrow}
        title={o.title}
        body={t(o.greeting, { name: state.you.name })}
        actions={
          <Button asChild variant="outline">
            <Link href={href(locale, "/app/new")}>
              <PlusIcon aria-hidden />
              {o.newWork}
            </Link>
          </Button>
        }
      />
      <ClaimablePanel state={state} />

      <section aria-labelledby="works-title">
        <h2 id="works-title" className="wide text-xl font-extrabold">
          {o.worksTitle}
        </h2>
        {state.works.length === 0 ? (
          <div className="mt-4">
            <EmptyState
              action={
                <Button asChild>
                  <Link href={href(locale, "/app/new")}>{o.newWork}</Link>
                </Button>
              }
            >
              {o.emptyWorks}
            </EmptyState>
          </div>
        ) : (
          <ul className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {state.works.map((w) => (
              <li key={w.id}>
                <WorkCard work={w} state={state} />
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="grid gap-10 xl:grid-cols-[1.25fr_1fr]">
        <EarningsChart state={state} />
        <section aria-labelledby="activity-title" className="min-w-0">
          <div className="flex items-end justify-between gap-3">
            <h2 id="activity-title" className="wide text-xl font-extrabold">
              {o.activityTitle}
            </h2>
            <Link href={href(locale, "/app/ledger")} className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline">
              {o.viewLedger}
              <ArrowRightIcon className="size-3.5" aria-hidden />
            </Link>
          </div>
          <div className="mt-4">
            <LedgerRows entries={state.ledger.slice(0, 6)} works={state.works} />
          </div>
        </section>
      </div>
    </div>
  )
}

function ClaimablePanel({ state }: { state: DemoState }) {
  const { d, locale } = useApp()
  const o = d.app.overview
  const now = useNow(80)
  const [open, setOpen] = useState(false)
  const value = claimable(state, now)
  const rate = yourRate(state)
  const six = tokens(value, locale, 6)

  return (
    <section
      aria-label={o.claimable}
      className="overflow-hidden rounded-2xl border border-[#3a332c] bg-[#1a1714] text-[#eee7d9] dark:border-[#4a4138] dark:bg-[#211d19] shadow-[inset_0_1px_0_rgb(255_255_255/0.06)]"
    >
      <div className="grid gap-6 p-5 sm:p-7 lg:grid-cols-[1fr_auto] lg:items-end">
        <div className="min-w-0">
          <p className="silk flex items-center gap-2 text-[#d2a860]">
            {o.claimable}
            {rate > 0 && (
              <span className="inline-flex items-center gap-1.5 rounded-sm border border-[#e57a8e]/50 px-1.5 py-px text-[#e57a8e]">
                <span className="size-1.5 animate-lamp rounded-full bg-[#e57a8e]" aria-hidden />
                {d.common.live}
              </span>
            )}
          </p>
          <p className="nums mt-3 text-[2rem] leading-none font-medium tracking-tight break-all sm:text-6xl" aria-live="off">
            {six}
            <span className="ml-2 text-base text-[#a99f8f] sm:text-xl">tUSDC</span>
          </p>
          <p className="mt-3 text-sm text-[#b9ad9b]">
            {rate > 0 ? t(o.rate, { rate: tokensWithUnit(rate, locale, 6) }) : o.noRate}
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center lg:flex-col lg:items-end">
          <Button
            size="lg"
            onClick={() => setOpen(true)}
            disabled={value <= 0}
            className="bg-[#e57a8e] text-[#1a0c10] hover:bg-[#ec95a5]"
          >
            <ArrowUpRightIcon aria-hidden />
            {o.withdraw}
          </Button>
        </div>
      </div>
      <dl className="grid grid-cols-2 border-t border-[#3a332c] text-sm">
        <div className="border-r border-[#3a332c] px-5 py-3 sm:px-7">
          <dt className="silk text-[#a99f8f]">{o.wallet}</dt>
          <dd className="nums mt-1">{tokensWithUnit(state.walletBalance, locale)}</dd>
        </div>
        <div className="px-5 py-3 sm:px-7">
          <dt className="silk text-[#a99f8f]">{o.withdrawn}</dt>
          <dd className="nums mt-1">{tokensWithUnit(state.withdrawn, locale)}</dd>
        </div>
      </dl>
      <WithdrawDialog open={open} onOpenChange={setOpen} claimable={value} address={state.you.address} />
    </section>
  )
}

function WorkCard({ work, state }: { work: Work; state: DemoState }) {
  const { d, locale } = useApp()
  const o = d.app.overview
  const now = useNow(250)
  const you = youIn(state, work)
  const share = you ? (effectiveShares(work)[you.id] ?? 0) : 0
  const earned = you ? liveEarned(work, you.id, now) : 0
  const held = liveHeld(work, now)
  const pending = state.pendingInflows.some((p) => p.workId === work.id)

  return (
    <Link
      href={href(locale, `/app/works/${work.id}`)}
      className="module group flex h-full flex-col p-5 transition-colors hover:border-foreground/40"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="silk flex items-center gap-1.5 text-muted-foreground">
            <KindIcon kind={work.kind} className="size-3.5" />
            {d.kinds[work.kind]} · {d.cadences[work.cadence]}
          </p>
          <h3 className="wide mt-2 truncate text-lg font-extrabold">{work.title}</h3>
          <p className="truncate text-sm text-muted-foreground">{work.credit}</p>
        </div>
        {work.stream ? (
          <span className="silk inline-flex shrink-0 items-center gap-1.5 rounded-sm border border-primary/40 px-1.5 py-0.5 text-primary">
            <span className="size-1.5 animate-lamp rounded-full bg-primary" aria-hidden />
            {o.live}
          </span>
        ) : pending ? (
          <span className="silk shrink-0 text-warning">…</span>
        ) : null}
      </div>
      <dl className="mt-5 grid grid-cols-2 gap-3 border-t pt-4 text-sm">
        <div>
          <dt className="text-xs text-muted-foreground">{o.yourShare}</dt>
          <dd className="nums mt-0.5 font-medium">{percent(share, locale)}</dd>
        </div>
        <div className="text-right">
          <dt className="text-xs text-muted-foreground">{work.cadence === "continuous" ? o.earned : o.held}</dt>
          <dd className="nums mt-0.5 font-medium">{tokens(work.cadence === "continuous" ? earned : held, locale, work.stream ? 4 : 2)}</dd>
        </div>
      </dl>
      <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary">
        {o.open}
        <ArrowRightIcon className="size-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden />
      </span>
    </Link>
  )
}

const WORK_COLORS = ["bg-chart-1", "bg-chart-2", "bg-chart-3", "bg-chart-4", "bg-chart-5"]
const WORK_FILLS = ["fill-chart-1", "fill-chart-2", "fill-chart-3", "fill-chart-4", "fill-chart-5"]

function EarningsChart({ state }: { state: DemoState }) {
  const { d, locale } = useApp()
  const o = d.app.overview
  const data = useMemo(() => {
    const DAY = 86_400_000
    const end = new Date()
    end.setHours(0, 0, 0, 0)
    const start = end.getTime() - 29 * DAY
    const days = Array.from({ length: 30 }, (_, i) => ({ at: start + i * DAY, byWork: {} as Record<string, number>, total: 0 }))
    for (const e of state.ledger) {
      if (e.status !== "confirmed" || !e.yourShare || !e.workId) continue
      const idx = Math.floor((e.at - start) / DAY)
      const day = days[idx]
      if (!day) continue
      day.byWork[e.workId] = (day.byWork[e.workId] ?? 0) + e.yourShare
      day.total += e.yourShare
    }
    const max = Math.max(1, ...days.map((x) => x.total))
    const totals: Record<string, number> = {}
    for (const day of days) for (const [k, v] of Object.entries(day.byWork)) totals[k] = (totals[k] ?? 0) + v
    return { days, max, totals, sum: days.reduce((s, x) => s + x.total, 0) }
  }, [state.ledger])

  const works = state.works
  const colorOf = (id: string) => Math.max(0, works.findIndex((w) => w.id === id)) % WORK_COLORS.length

  return (
    <section aria-labelledby="chart-title" className="min-w-0">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h2 id="chart-title" className="wide text-xl font-extrabold">
            {o.chartTitle}
          </h2>
        </div>
        <p className="text-right">
          <span className="block text-xs text-muted-foreground">{o.chartTotal}</span>
          <span className="nums font-medium">{tokensWithUnit(data.sum, locale)}</span>
        </p>
      </div>
      <div className="module mt-4 p-4 sm:p-5">
        {data.sum === 0 ? (
          <p className="py-10 text-center text-muted-foreground">{o.chartEmpty}</p>
        ) : (
          <>
            <svg viewBox="0 0 300 120" className="h-44 w-full sm:h-56" preserveAspectRatio="none" role="img" aria-label={`${o.chartTitle}: ${tokensWithUnit(data.sum, locale)}`}>
              {[0.25, 0.5, 0.75].map((g) => (
                <line key={g} x1="0" x2="300" y1={120 - g * 116} y2={120 - g * 116} className="stroke-border" strokeWidth="0.5" strokeDasharray="2 3" vectorEffect="non-scaling-stroke" />
              ))}
              {data.days.map((day, i) => {
                let y = 120
                return (
                  <g key={day.at}>
                    <title>{`${dayLabel(day.at, locale)}: ${tokensWithUnit(day.total, locale)}`}</title>
                    {works.map((w) => {
                      const v = day.byWork[w.id] ?? 0
                      if (!v) return null
                      const h = (v / data.max) * 116
                      y -= h
                      return <rect key={w.id} x={i * 10 + 1.5} y={y} width="7" height={Math.max(0.5, h - 0.6)} className={WORK_FILLS[colorOf(w.id)]} />
                    })}
                  </g>
                )
              })}
            </svg>
            <div className="mt-2 flex justify-between text-[11px] text-muted-foreground">
              <span>{dayLabel(data.days[0]?.at ?? 0, locale)}</span>
              <span>{dayLabel(data.days[data.days.length - 1]?.at ?? 0, locale)}</span>
            </div>
            <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2 border-t pt-3 text-sm">
              {works
                .filter((w) => data.totals[w.id])
                .map((w) => (
                  <li key={w.id} className="flex items-center gap-2">
                    <span className={cn("size-2.5 rounded-[2px]", WORK_COLORS[colorOf(w.id)])} aria-hidden />
                    <span>{w.title}</span>
                    <span className="nums text-muted-foreground">{tokens(data.totals[w.id] ?? 0, locale)}</span>
                  </li>
                ))}
            </ul>
          </>
        )}
      </div>
    </section>
  )
}
