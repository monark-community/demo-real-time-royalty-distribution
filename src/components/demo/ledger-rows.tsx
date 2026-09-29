"use client"

import {
  ArrowDownLeftIcon,
  ArrowUpRightIcon,
  CheckCircle2Icon,
  ClockIcon,
  FileSignatureIcon,
  RadioIcon,
  RocketIcon,
  SparklesIcon,
  XCircleIcon,
  type LucideIcon,
} from "lucide-react"

import { t } from "@/i18n/t"
import { dateTime, shortAddress, tokens } from "@/lib/format"
import type { LedgerEntry, LedgerKind, Work } from "@/lib/demo/types"
import { cn } from "@/lib/utils"

import { useApp, type AppDict } from "./app-context"

const ICONS: Record<LedgerKind, LucideIcon> = {
  deploy: RocketIcon,
  inflow: ArrowDownLeftIcon,
  stream: RadioIcon,
  release: ClockIcon,
  withdraw: ArrowUpRightIcon,
  amend: FileSignatureIcon,
  bonus: SparklesIcon,
}

export function describeEntry(e: LedgerEntry, works: Work[], d: AppDict): string {
  const l = d.app.ledger.details
  const work = works.find((w) => w.id === e.workId)
  switch (e.kind) {
    case "deploy":
      return e.status === "failed" ? t(l.deployFailed, { work: e.note ?? "" }) : t(l.deploy, { work: work?.title ?? "" })
    case "inflow":
      return t(l.inflow, { source: e.source ? d.sources[e.source] : "", payer: e.source ? d.payers[e.source] : "" })
    case "stream":
      return t(l.stream, { source: e.source ? d.sources[e.source] : "" })
    case "release":
      return l.release
    case "withdraw":
      return l.withdraw
    case "amend": {
      if (e.status === "confirmed") return l.amendApplied
      const name = work?.collaborators.find((c) => c.id === e.note)?.name ?? ""
      return t(l.amendDeclined, { name })
    }
    case "bonus": {
      const name = work?.collaborators.find((c) => c.id === work.bonus?.collaboratorId)?.name ?? ""
      return t(l.bonus, { name })
    }
  }
}

export function StatusChip({ entry }: { entry: LedgerEntry }) {
  const { d } = useApp()
  const s = d.app.ledger.statuses
  if (entry.status === "failed")
    return (
      <span className="inline-flex items-center gap-1 text-xs font-semibold text-destructive">
        <XCircleIcon className="size-3.5" aria-hidden />
        {s.failed}
      </span>
    )
  if (entry.held)
    return (
      <span className="inline-flex items-center gap-1 text-xs font-semibold text-warning">
        <ClockIcon className="size-3.5" aria-hidden />
        {s.held}
      </span>
    )
  return (
    <span className="inline-flex items-center gap-1 text-xs font-semibold text-success">
      <CheckCircle2Icon className="size-3.5" aria-hidden />
      {s.confirmed}
    </span>
  )
}

export function LedgerRows({
  entries,
  works,
  showWork = true,
  highlight,
}: {
  entries: LedgerEntry[]
  works: Work[]
  showWork?: boolean
  highlight?: string
}) {
  const { d, locale } = useApp()
  const cols = d.app.ledger.columns
  return (
    <div className="@container overflow-hidden rounded-xl border bg-card">
      <div
        className="hidden grid-cols-[11rem_1fr_8rem_8rem_7rem] gap-4 border-b bg-panel px-4 py-2.5 @4xl:grid"
        aria-hidden
      >
        <span className="silk text-muted-foreground">{cols.when}</span>
        <span className="silk text-muted-foreground">{cols.what}</span>
        <span className="silk text-right text-muted-foreground">{cols.amount}</span>
        <span className="silk text-right text-muted-foreground">{cols.yours}</span>
        <span className="silk text-muted-foreground">{cols.status}</span>
      </div>
      <ul className="divide-y">
        {entries.map((e) => {
          const Icon = ICONS[e.kind]
          const work = works.find((w) => w.id === e.workId)
          const sign = e.kind === "withdraw" ? "−" : "+"
          return (
            <li
              key={e.id}
              className={cn(
                "grid grid-cols-[1fr_auto] gap-x-4 gap-y-1 px-4 py-3 @4xl:grid-cols-[11rem_1fr_8rem_8rem_7rem] @4xl:items-center",
                highlight === e.id && "animate-row-in"
              )}
            >
              <span className="nums order-3 col-span-1 text-xs text-muted-foreground @4xl:order-none @4xl:text-sm">
                {dateTime(e.at, locale)}
              </span>
              <div className="order-1 flex min-w-0 items-start gap-3 @4xl:order-none">
                <span
                  className={cn(
                    "mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md border",
                    e.status === "failed" ? "text-destructive" : "text-foreground"
                  )}
                >
                  <Icon className="size-3.5" aria-hidden />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">
                    {d.app.ledger.kinds[e.kind]}
                    {showWork && work ? <span className="text-muted-foreground"> · {work.title}</span> : null}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {describeEntry(e, works, d)}
                    {e.dust ? ` · ${t(d.app.ledger.details.dust, { amount: tokens(e.dust, locale, 6) })}` : ""}
                    <span className="nums hidden sm:inline"> · {shortAddress(e.tx, 8, 4)}</span>
                  </p>
                </div>
              </div>
              <span className="nums order-2 text-right text-sm font-medium @4xl:order-none">
                {typeof e.amount === "number" ? `${sign}${tokens(e.amount, locale)}` : "—"}
              </span>
              <span className="nums order-4 text-right text-sm text-primary @4xl:order-none">
                {typeof e.yourShare === "number" && e.yourShare > 0 ? (
                  <>
                    <span className="sr-only">{cols.yours}: </span>+{tokens(e.yourShare, locale)}
                  </>
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </span>
              <span className="order-5 col-span-2 @4xl:order-none @4xl:col-span-1">
                <StatusChip entry={e} />
              </span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
