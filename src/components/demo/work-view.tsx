"use client"

import {
  ArrowLeftIcon,
  CheckCircle2Icon,
  ClockIcon,
  InfoIcon,
  Loader2Icon,
  RadioIcon,
  SendIcon,
  SlidersVerticalIcon,
  SparklesIcon,
  SquareIcon,
  XCircleIcon,
} from "lucide-react"
import Link from "next/link"
import { useMemo, useState } from "react"

import { Button } from "@/components/ui/button"
import { WalletCopyButton } from "@/components/ui/wallet"
import { href } from "@/i18n/config"
import { t } from "@/i18n/t"
import { clock, integer, percent, shortAddress, tokens, tokensWithUnit, weekdayTime } from "@/lib/format"
import { useDemo, useNow } from "@/lib/demo/hooks"
import {
  effectiveShares,
  FULL,
  liveEarned,
  liveHeld,
  livePlays,
  liveTotalIn,
  nextRelease,
  rateFor,
  sumBps,
} from "@/lib/demo/math"
import { INFLOW_PRESETS, proposeAmendment, releaseHeld, sendInflow, toggleStream, youIn } from "@/lib/demo/store"
import type { Bps, DemoState, Work } from "@/lib/demo/types"
import { cn } from "@/lib/utils"

import { useApp, type AppDict } from "./app-context"
import { FaderBank, MasterMeter } from "./faders"
import { LedgerRows } from "./ledger-rows"
import { KindIcon, Meter } from "./parts"
import { TxLine, useTx } from "./tx"

export const roleLabel = (role: string, d: AppDict) => (d.roles as Record<string, string>)[role] ?? role

export function WorkView({ id }: { id: string }) {
  const { d, locale } = useApp()
  const state = useDemo()
  const w = d.app.work
  if (!state) return null
  const work = state.works.find((x) => x.id === id)

  if (!work) {
    return (
      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center px-4 py-20 sm:px-6">
        <h1 className="display text-3xl sm:text-5xl">{w.notFoundTitle}</h1>
        <p className="mt-4 text-lg text-muted-foreground">{w.notFoundBody}</p>
        <Button asChild size="lg" className="mt-8 self-start">
          <Link href={href(locale, "/app")}>
            <ArrowLeftIcon aria-hidden />
            {w.backToStudio}
          </Link>
        </Button>
      </div>
    )
  }

  const entries = state.ledger.filter((e) => e.workId === work.id)

  return (
    <div className="mx-auto w-full max-w-7xl space-y-8 px-4 py-8 sm:px-6 sm:py-10">
      <WorkHeader work={work} />
      <BonusBanner work={work} />
      <Channels work={work} state={state} />
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <Simulator work={work} state={state} />
        <SplitSheet work={work} state={state} />
      </div>
      <section aria-labelledby="work-ledger">
        <div className="flex items-end justify-between gap-3">
          <h2 id="work-ledger" className="wide text-xl font-extrabold">
            {w.ledgerTitle}
          </h2>
          <Link href={`${href(locale, "/app/ledger")}?work=${work.id}`} className="text-sm font-semibold text-primary hover:underline">
            {w.viewAll}
          </Link>
        </div>
        <div className="mt-4">
          <LedgerRows entries={entries.slice(0, 8)} works={state.works} showWork={false} highlight={entries[0]?.id} />
        </div>
      </section>
    </div>
  )
}

function WorkHeader({ work }: { work: Work }) {
  const { d, locale } = useApp()
  const w = d.app.work
  const now = useNow(250)
  return (
    <header className="space-y-5">
      <Link href={href(locale, "/app")} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeftIcon className="size-4" aria-hidden />
        {w.backToStudio}
      </Link>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0">
          <p className="silk flex items-center gap-1.5 text-brass">
            <KindIcon kind={work.kind} className="size-3.5" />
            {d.kinds[work.kind]} · {work.credit}
          </p>
          <h1 className="display mt-2 text-4xl break-words sm:text-6xl">{work.title}</h1>
        </div>
        <div className="flex items-center gap-1 rounded-md border bg-card py-1 pr-1 pl-3 text-sm">
          <span className="text-muted-foreground">{w.contract}</span>
          <span className="nums ml-1" title={work.contract}>
            {shortAddress(work.contract)}
          </span>
          <WalletCopyButton address={work.contract} copyLabel={d.common.copy} copiedLabel={d.common.copied} />
        </div>
      </div>
      <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border bg-border sm:grid-cols-4">
        {[
          [w.cadence, d.cadences[work.cadence]],
          [w.plays, integer(livePlays(work, now), locale)],
          [w.totalIn, tokensWithUnit(liveTotalIn(work, now), locale)],
          [w.dust, `${tokens(work.dustTotal, locale, 6)}`],
        ].map(([k, v]) => (
          <div key={k} className="bg-card px-4 py-3">
            <dt className="silk text-muted-foreground">{k}</dt>
            <dd className="nums mt-1 truncate text-sm font-medium sm:text-base">{v}</dd>
          </div>
        ))}
      </dl>
    </header>
  )
}

function BonusBanner({ work }: { work: Work }) {
  const { d, locale } = useApp()
  const w = d.app.work
  const now = useNow(500)
  const bonus = work.bonus
  if (!bonus) return null
  const who = work.collaborators.find((c) => c.id === bonus.collaboratorId)
  const plays = livePlays(work, now)
  const progress = Math.min(1, plays / bonus.thresholdPlays)
  if (bonus.active) {
    return (
      <div role="status" className="flex items-start gap-3 rounded-xl border border-primary/50 bg-primary/5 px-4 py-3.5">
        <SparklesIcon className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden />
        <p className="font-medium">
          {t(w.bonusActive, { name: who?.name ?? "", share: percent(effectiveShares(work)[bonus.collaboratorId] ?? 0, locale) })}
        </p>
      </div>
    )
  }
  return (
    <div className="rounded-xl border bg-card px-4 py-3.5">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm">
          {t(w.bonusRule, {
            name: who?.name ?? "",
            extra: integer(bonus.extraBps / 100, locale),
            plays: integer(bonus.thresholdPlays, locale),
          })}
        </p>
        <p className="nums text-xs text-muted-foreground">
          {t(w.bonusProgress, { plays: integer(plays, locale), threshold: integer(bonus.thresholdPlays, locale) })}
        </p>
      </div>
      <div className="mt-2 h-1.5 rounded-full bg-meter-off">
        <div className="h-full rounded-full bg-brass transition-[width]" style={{ width: `${progress * 100}%` }} />
      </div>
    </div>
  )
}

function Channels({ work, state }: { work: Work; state: DemoState }) {
  const { d, locale } = useApp()
  const w = d.app.work
  const now = useNow(80)
  const shares = effectiveShares(work)
  const you = youIn(state, work)
  const lastHit = useMemo(() => {
    const e = state.ledger.find((x) => x.workId === work.id && x.kind === "inflow" && x.status === "confirmed" && !x.held)
    return e?.at ?? 0
  }, [state.ledger, work.id])
  const since = now - lastHit
  const punch = since < 1800 ? 1 - since / 1800 : 0
  const streaming = !!work.stream && work.cadence === "continuous"

  return (
    <section aria-labelledby="channels-title" className="overflow-hidden rounded-2xl border border-[#3a332c] bg-[#1a1714] dark:border-[#4a4138] dark:bg-[#211d19] text-[#eee7d9]">
      <div className="flex flex-wrap items-end justify-between gap-2 border-b border-[#3a332c] px-4 py-3 sm:px-5">
        <div>
          <h2 id="channels-title" className="silk text-[#d2a860]">
            {w.channelsTitle}
          </h2>
          <Link
            href={`${href(locale, "/how-it-works")}#precision`}
            className="mt-1 inline-flex items-center gap-1 text-xs text-[#a99f8f] underline-offset-4 hover:text-[#eee7d9] hover:underline"
          >
            <InfoIcon className="size-3.5" aria-hidden />
            {w.howCalculated}
          </Link>
        </div>
        {streaming && (
          <span className="silk inline-flex items-center gap-2 rounded-sm border border-[#e57a8e]/50 px-2 py-0.5 text-[#e57a8e]">
            <span className="size-1.5 animate-lamp rounded-full bg-[#e57a8e]" aria-hidden />
            {d.common.live}
          </span>
        )}
      </div>
      <ul className="flex divide-x divide-[#3a332c] overflow-x-auto">
        {work.collaborators.map((c, i) => {
          const share = shares[c.id] ?? 0
          const wobble = streaming ? 0.08 * Math.sin(now / 180 + i * 1.7) + 0.08 : 0
          const level = Math.min(1, 0.12 + (share / FULL) * 0.9 + (streaming ? 0.25 : 0) + wobble + punch * (0.4 + share / FULL))
          const isBonus = work.bonus?.active && work.bonus.collaboratorId === c.id
          const rate = rateFor(work, c.id)
          return (
            <li key={c.id} className="flex min-w-[4.1rem] flex-1 flex-col items-center px-1 pt-4 pb-3 sm:min-w-[8rem] sm:px-3">
              <div className="flex h-5 items-center gap-1">
                {isBonus && (
                  <span className="silk rounded-[2px] bg-[#e57a8e] px-1.5 text-[10px] text-[#1a0c10]">{w.bonusLamp}</span>
                )}
              </div>
              <Meter level={level} segments={16} desk className="mt-1 h-40 w-5 sm:h-48 sm:w-6" />
              <span className="nums mt-3 text-xs text-[#d2a860]">{percent(share, locale, share % 100 ? 2 : 0)}</span>
              <span className="mt-1 max-w-full truncate text-sm font-semibold" title={c.name}>
                <span className="sm:hidden">{c.name.split(" ")[0]}</span>
                <span className="hidden sm:inline">{c.name}</span>
              </span>
              <span className="max-w-full truncate text-[11px] text-[#a99f8f]">{roleLabel(c.role, d)}</span>
              <span className="nums mt-2 text-[10px] sm:hidden">{tokens(liveEarned(work, c.id, now), locale, streaming ? 4 : 2)}</span>
              <span className="nums mt-2 hidden text-sm sm:inline">{tokens(liveEarned(work, c.id, now), locale, streaming ? 6 : 2)}</span>
              {rate > 0 ? (
                <span className="nums hidden text-[10px] text-[#a99f8f] sm:inline">
                  +{tokens(rate, locale, 6)}
                  {d.common.perSecond}
                </span>
              ) : null}
              <span className="mt-1.5 flex h-4 gap-1">
                {you?.id === c.id && <span className="silk text-[10px] text-[#e57a8e]">{w.you}</span>}
                {c.treasury && <span className="silk text-[10px] text-[#a99f8f]">{w.treasury}</span>}
              </span>
            </li>
          )
        })}
      </ul>
    </section>
  )
}

function Simulator({ work, state }: { work: Work; state: DemoState }) {
  const { d, locale } = useApp()
  const w = d.app.work
  const [sent, setSent] = useState<string[]>([])
  const presets = INFLOW_PRESETS.filter((p) => work.sources.includes(p.source))
  const pendingHere = state.pendingInflows.filter((p) => p.workId === work.id)
  const release = useTx()
  const [released, setReleased] = useState<number | null>(null)
  const now = useNow(500)
  const held = liveHeld(work, now)
  const next = nextRelease(work.cadence, now)

  const recent = sent
    .slice(-3)
    .reverse()
    .map((id) => ({ id, pending: pendingHere.find((p) => p.id === id), entry: state.ledger.find((e) => e.id === id) }))
    .filter((r) => r.pending || r.entry)

  return (
    <section aria-labelledby="sim-title" className="module flex min-w-0 flex-col p-5 sm:p-6">
      <h2 id="sim-title" className="wide text-xl font-extrabold">
        {w.simTitle}
      </h2>
      <ul className="mt-5 grid grid-cols-[minmax(0,1fr)] gap-2">
        {presets.map((p) => (
          <li key={p.id}>
            <button
              type="button"
              onClick={() => setSent((s) => [...s, sendInflow(work.id, p.id)])}
              className="flex min-h-12 w-full items-center justify-between gap-3 rounded-lg border bg-background px-3.5 py-2 text-left transition-colors hover:border-foreground/40 hover:bg-accent"
            >
              <span className="min-w-0">
                <span className="block truncate text-sm font-medium">{d.presets[p.id as keyof typeof d.presets]}</span>
                <span className="block text-xs text-muted-foreground">{d.sources[p.source]}</span>
              </span>
              <span className="flex shrink-0 items-center gap-2">
                <span className="nums text-sm font-semibold">+{tokens(p.amount, locale)}</span>
                <SendIcon className="size-4 text-primary" aria-hidden />
                <span className="sr-only">{w.simSend}</span>
              </span>
            </button>
          </li>
        ))}
      </ul>

      {/* Outcomes of the inflows sent from here, next to the buttons that sent them. */}
      <ul className="mt-3 space-y-2" role="status" aria-live="polite">
        {recent.map(({ id, pending, entry }) => {
          if (pending)
            return (
              <li key={id} className="flex items-center gap-2 rounded-md border border-warning/50 bg-warning/5 px-3 py-2 text-sm text-warning">
                <Loader2Icon className="size-4 animate-spin" aria-hidden />
                <span className="font-medium">{w.incoming}</span>
                <span className="nums ml-auto">+{tokens(pending.amount, locale)}</span>
              </li>
            )
          if (!entry) return null
          const payer = entry.source ? d.payers[entry.source] : ""
          const amount = tokensWithUnit(entry.amount ?? 0, locale)
          if (entry.status === "failed")
            return (
              <li key={id} role="alert" className="flex items-center gap-2 rounded-md border border-destructive/50 bg-destructive/5 px-3 py-2 text-sm font-medium text-destructive">
                <XCircleIcon className="size-4 shrink-0" aria-hidden />
                {w.inflowFailed}
              </li>
            )
          return (
            <li key={id} className="flex items-start gap-2 rounded-md border border-success/40 bg-success/5 px-3 py-2 text-sm">
              {entry.held ? (
                <ClockIcon className="mt-0.5 size-4 shrink-0 text-warning" aria-hidden />
              ) : (
                <CheckCircle2Icon className="mt-0.5 size-4 shrink-0 text-success" aria-hidden />
              )}
              <span>
                {entry.held
                  ? t(w.inflowHeld, { amount, payer })
                  : t(w.inflowConfirmed, { amount, payer, count: work.collaborators.length })}
              </span>
            </li>
          )
        })}
      </ul>

      <div className="mt-5 flex flex-col gap-3 border-t pt-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="inline-flex items-center gap-2 text-sm">
          <RadioIcon className={cn("size-4", work.stream ? "text-primary" : "text-muted-foreground")} aria-hidden />
          {work.stream
            ? t(w.streamOn, { rate: tokensWithUnit(work.stream.rate, locale, 2), payer: d.payers[work.stream.source] })
            : w.streamOff}
        </p>
        <Button variant={work.stream ? "outline" : "default"} onClick={() => toggleStream(work.id)} className="shrink-0">
          {work.stream ? <SquareIcon aria-hidden /> : <RadioIcon aria-hidden />}
          {work.stream ? w.streamClose : w.streamOpen}
        </Button>
      </div>

      {work.cadence !== "continuous" && (
        <div className="mt-5 rounded-lg border border-warning/40 bg-warning/5 p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h3 className="font-semibold">{w.heldTitle}</h3>
            </div>
            <p className="nums text-lg font-semibold">{tokensWithUnit(held, locale, work.stream ? 4 : 2)}</p>
          </div>
          {next && <p className="mt-2 text-sm text-muted-foreground">{t(w.heldUntil, { when: weekdayTime(next, locale) })}</p>}
          <div className="mt-3 flex flex-col gap-3">
            <Button
              variant="outline"
              className="self-start"
              disabled={release.busy || held <= 0}
              onClick={async () => {
                setReleased(null)
                const r = await release.run({ kind: "sign", action: w.releaseAction, contract: work.contract, amount: held }, () => releaseHeld(work.id))
                if (r?.ok && typeof r.amount === "number") setReleased(r.amount)
              }}
            >
              <ClockIcon aria-hidden />
              {w.releaseNow}
            </Button>
            {held <= 0 && release.phase.status === "idle" ? <p className="text-xs text-muted-foreground">{w.releaseEmpty}</p> : null}
            <TxLine
              phase={release.phase}
              pending={w.releasePending}
              confirmed={released !== null ? t(w.releaseConfirmed, { amount: tokensWithUnit(released, locale) }) : undefined}
              failed={w.releaseFailed}
            />
          </div>
        </div>
      )}
    </section>
  )
}

function SplitSheet({ work, state }: { work: Work; state: DemoState }) {
  const { d, locale } = useApp()
  const w = d.app.work
  const shares = effectiveShares(work)
  const bonusOn = !!work.bonus?.active
  const collecting = work.amendments.find((a) => a.status === "collecting")
  const [editing, setEditing] = useState(false)
  const you = youIn(state, work)

  return (
    <section aria-labelledby="split-title" className="module flex min-w-0 flex-col p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 id="split-title" className="wide text-xl font-extrabold">
            {w.splitTitle}
          </h2>
        </div>
        {!editing && !collecting && (
          <Button variant="outline" onClick={() => setEditing(true)}>
            <SlidersVerticalIcon aria-hidden />
            {w.propose}
          </Button>
        )}
      </div>

      <table className="mt-5 w-full text-sm">
        <thead>
          <tr className="border-b text-left">
            <th scope="col" className="silk pb-2 font-semibold text-muted-foreground">
              &nbsp;
            </th>
            <th scope="col" className="silk pb-2 text-right font-semibold text-muted-foreground">
              {w.base}
            </th>
            {bonusOn && (
              <th scope="col" className="silk pb-2 text-right font-semibold text-primary">
                {w.effective}
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {work.collaborators.map((c) => (
            <tr key={c.id} className="border-b last:border-0">
              <th scope="row" className="py-2.5 pr-3 text-left font-normal">
                <span className="font-medium">{c.name}</span>
                {you?.id === c.id ? <span className="silk ml-2 text-[10px] text-primary">{w.you}</span> : null}
                <span className="block text-xs text-muted-foreground">
                  {roleLabel(c.role, d)} · <span className="nums">{shortAddress(c.address)}</span>
                </span>
              </th>
              <td className="nums py-2.5 text-right">{percent(c.bps, locale)}</td>
              {bonusOn && <td className="nums py-2.5 text-right font-semibold">{percent(shares[c.id] ?? 0, locale)}</td>}
            </tr>
          ))}
        </tbody>
      </table>

      {editing && !collecting && <AmendPanel work={work} onDone={() => setEditing(false)} />}

      {work.amendments.length > 0 && (
        <div className="mt-6 border-t pt-5">
          <h3 className="silk text-muted-foreground">{w.amendHistory}</h3>
          <ul className="mt-3 space-y-3">
            {work.amendments.slice(0, 3).map((a) => (
              <li key={a.id} className="rounded-lg border p-3.5">
                <p
                  role={a.status === "declined" ? "alert" : "status"}
                  className={cn(
                    "flex items-start gap-2 text-sm font-medium",
                    a.status === "applied" && "text-success",
                    a.status === "declined" && "text-destructive",
                    a.status === "collecting" && "text-warning"
                  )}
                >
                  {a.status === "applied" ? (
                    <CheckCircle2Icon className="mt-0.5 size-4 shrink-0" aria-hidden />
                  ) : a.status === "declined" ? (
                    <XCircleIcon className="mt-0.5 size-4 shrink-0" aria-hidden />
                  ) : (
                    <Loader2Icon className="mt-0.5 size-4 shrink-0 animate-spin" aria-hidden />
                  )}
                  <span className="text-foreground">
                    {a.status === "applied"
                      ? t(w.amendApplied, { time: clock(a.decidedAt ?? a.proposedAt, locale) })
                      : a.status === "declined"
                        ? t(w.amendDeclined, { name: work.collaborators.find((c) => c.id === a.declineBy)?.name ?? "" })
                        : w.amendCollecting}
                  </span>
                </p>
                <ul className="mt-3 flex flex-wrap gap-1.5">
                  {work.collaborators.map((c) => {
                    const s = a.signatures[c.id] ?? "waiting"
                    return (
                      <li
                        key={c.id}
                        className={cn(
                          "inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-xs",
                          s === "signed" && "border-success/40 text-success",
                          s === "declined" && "border-destructive/50 text-destructive",
                          s === "waiting" && "text-muted-foreground"
                        )}
                      >
                        <span className="font-medium text-foreground">{c.name.split(" ")[0]}</span>
                        <span className={cn("nums", a.status !== "applied" && (a.shares[c.id] ?? c.bps) !== c.bps && "font-bold text-primary")}>
                          {percent(a.shares[c.id] ?? c.bps, locale)}
                        </span>
                        <span>· {s === "signed" ? w.signed : s === "declined" ? w.declined : w.waiting}</span>
                      </li>
                    )
                  })}
                </ul>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  )
}

function AmendPanel({ work, onDone }: { work: Work; onDone: () => void }) {
  const { d } = useApp()
  const w = d.app.work
  const [values, setValues] = useState<Record<string, Bps>>(() => Object.fromEntries(work.collaborators.map((c) => [c.id, c.bps])))
  const { phase, run, busy } = useTx()
  const total = sumBps(Object.values(values))
  const changed = work.collaborators.some((c) => values[c.id] !== c.bps)
  const zero = work.collaborators.some((c) => (values[c.id] ?? 0) <= 0)
  const treasury = work.collaborators.find((c) => c.treasury) ?? work.collaborators[work.collaborators.length - 1]
  const canSubmit = total === FULL && changed && !zero && !busy

  return (
    <div className="mt-5 space-y-4 rounded-xl border border-primary/40 bg-background p-4">
      <div>
        <h3 className="font-semibold">{w.amendTitle}</h3>
        <p className="text-sm text-muted-foreground">{w.amendBody}</p>
      </div>
      <FaderBank
        items={work.collaborators.map((c) => ({ id: c.id, label: c.name.split(" ")[0] ?? c.name, sub: roleLabel(c.role, d) }))}
        values={values}
        onChange={(id, bps) => setValues((v) => ({ ...v, [id]: bps }))}
        disabled={busy || phase.status === "confirmed"}
      />
      <MasterMeter
        total={total}
        canBalance={!!treasury}
        onBalance={() => {
          if (!treasury) return
          const others = sumBps(Object.entries(values).filter(([k]) => k !== treasury.id).map(([, v]) => v))
          setValues((v) => ({ ...v, [treasury.id]: Math.max(0, FULL - others) }))
        }}
      />
      {!changed && <p className="text-sm text-muted-foreground">{w.unchanged}</p>}
      <TxLine phase={phase} pending={w.amendPending} failed={w.amendFailed} />
      <div className="flex flex-wrap justify-end gap-2">
        <Button variant="ghost" onClick={onDone} disabled={busy}>
          {d.common.cancel}
        </Button>
        <Button
          disabled={!canSubmit}
          onClick={async () => {
            const r = await run({ kind: "sign", action: w.amendAction, contract: work.contract }, () => proposeAmendment(work.id, values))
            if (r?.ok) onDone()
          }}
        >
          {w.amendSubmit}
        </Button>
      </div>
    </div>
  )
}
