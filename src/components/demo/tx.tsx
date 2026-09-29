"use client"

import { AlertTriangleIcon, CheckCircle2Icon, Loader2Icon, WalletIcon, XCircleIcon } from "lucide-react"
import { useCallback, useState } from "react"

import { TxStatus } from "@/components/ui/tx-status"
import { t } from "@/i18n/t"
import { integer } from "@/lib/format"
import type { TxResult } from "@/lib/demo/store"
import { cn } from "@/lib/utils"

import { useApp, type PromptRequest } from "./app-context"

export type TxPhase =
  | { status: "idle" }
  | { status: "signing" }
  | { status: "pending" }
  | { status: "confirmed"; tx: string; block: number }
  | { status: "failed"; tx: string; block: number }
  | { status: "rejected" }

/** Drives one transaction: wallet prompt → pending → confirmed / failed (or rejected). */
export function useTx() {
  const { request } = useApp()
  const [phase, setPhase] = useState<TxPhase>({ status: "idle" })

  const run = useCallback(
    async <R extends TxResult>(req: PromptRequest, exec: () => Promise<R>): Promise<R | null> => {
      setPhase({ status: "signing" })
      const ok = await request(req)
      if (!ok) {
        setPhase({ status: "rejected" })
        return null
      }
      setPhase({ status: "pending" })
      const result = await exec()
      setPhase(result.ok ? { status: "confirmed", tx: result.tx, block: result.block } : { status: "failed", tx: result.tx, block: result.block })
      return result
    },
    [request]
  )

  const reset = useCallback(() => setPhase({ status: "idle" }), [])
  const busy = phase.status === "signing" || phase.status === "pending"
  return { phase, run, reset, busy }
}

/** Inline, live-announced status for a transaction, placed right next to the action it reports on. */
export function TxLine({
  phase,
  pending,
  confirmed,
  failed,
  className,
}: {
  phase: TxPhase
  pending: string
  confirmed?: string
  failed: string
  className?: string
}) {
  const { d, locale } = useApp()
  const tx = d.app.tx
  if (phase.status === "idle") return <div role="status" aria-live="polite" className="sr-only" />

  const box = "flex flex-col gap-2 rounded-lg border px-3.5 py-3 text-sm sm:flex-row sm:items-center sm:justify-between"
  return (
    <div role="status" aria-live="polite" className={className}>
      {phase.status === "signing" && (
        <p className={cn(box, "border-dashed text-muted-foreground")}>
          <span className="inline-flex items-center gap-2">
            <WalletIcon className="size-4" aria-hidden />
            {tx.signing}
          </span>
        </p>
      )}
      {phase.status === "pending" && (
        <p className={cn(box, "border-warning/50 bg-warning/5")}>
          <span className="inline-flex items-center gap-2 font-medium text-warning">
            <Loader2Icon className="size-4 animate-spin" aria-hidden />
            {pending}
          </span>
          <span className="text-xs text-muted-foreground">{tx.pending}</span>
        </p>
      )}
      {phase.status === "rejected" && (
        <p className={cn(box, "text-muted-foreground")}>
          <span className="inline-flex items-center gap-2">
            <AlertTriangleIcon className="size-4" aria-hidden />
            {tx.rejected}
          </span>
        </p>
      )}
      {phase.status === "confirmed" && (
        <div className={cn(box, "border-success/40 bg-success/5")}>
          <span className="inline-flex items-center gap-2 font-medium text-success">
            <CheckCircle2Icon className="size-4 shrink-0" aria-hidden />
            <span className="text-foreground">{confirmed ?? t(tx.confirmed, { block: integer(phase.block, locale) })}</span>
          </span>
          <TxStatus
            status="confirmed"
            hash={phase.tx}
            label={t(tx.confirmed, { block: integer(phase.block, locale) })}
            className="border-0 bg-transparent p-0 shadow-none"
          />
        </div>
      )}
      {phase.status === "failed" && (
        <div role="alert" className={cn(box, "border-destructive/50 bg-destructive/5")}>
          <span className="inline-flex items-center gap-2 font-medium text-destructive">
            <XCircleIcon className="size-4 shrink-0" aria-hidden />
            {failed}
          </span>
          <TxStatus status="failed" hash={phase.tx} label={tx.failed} className="border-0 bg-transparent p-0 shadow-none" />
        </div>
      )}
    </div>
  )
}
