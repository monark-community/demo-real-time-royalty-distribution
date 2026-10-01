"use client"

import { ArrowUpRightIcon } from "lucide-react"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { t } from "@/i18n/t"
import { shortAddress, tokensWithUnit } from "@/lib/format"
import { MICRO } from "@/lib/demo/math"
import { withdraw } from "@/lib/demo/store"

import { useApp } from "./app-context"
import { TxLine, useTx } from "./tx"

function parseAmount(raw: string): number | null {
  const cleaned = raw.replace(/\s| | /g, "").replace(",", ".")
  if (!/^\d+(\.\d{0,6})?$/.test(cleaned)) return null
  return Math.round(Number(cleaned) * MICRO)
}

export function WithdrawDialog({
  open,
  onOpenChange,
  claimable,
  address,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  claimable: number
  address: string
}) {
  const { d, locale } = useApp()
  const w = d.app.withdraw
  const [raw, setRaw] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [sent, setSent] = useState<number | null>(null)
  const { phase, run, reset, busy } = useTx()

  const close = (next: boolean) => {
    if (busy) return
    onOpenChange(next)
    if (!next) {
      setRaw("")
      setError(null)
      setSent(null)
      reset()
    }
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!raw.trim()) return setError(w.errEmpty)
    const amount = parseAmount(raw)
    if (amount === null) return setError(w.errInvalid)
    if (amount <= 0) return setError(w.errZero)
    if (amount > claimable) return setError(w.errTooMuch)
    setError(null)
    setSent(amount)
    await run({ kind: "sign", action: w.action, amount }, () => withdraw(amount))
  }

  const done = phase.status === "confirmed"

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent closeLabel={d.common.close} className="max-w-md">
        <DialogTitle className="wide text-xl font-extrabold">{w.title}</DialogTitle>
        <DialogDescription>{t(w.body, { address: shortAddress(address) })}</DialogDescription>
        <form onSubmit={submit} noValidate className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-end justify-between gap-3">
              <Label htmlFor="withdraw-amount">{w.amount}</Label>
              <span className="text-xs text-muted-foreground">{t(w.available, { amount: tokensWithUnit(claimable, locale) })}</span>
            </div>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  id="withdraw-amount"
                  inputMode="decimal"
                  autoComplete="off"
                  value={raw}
                  onChange={(e) => {
                    setRaw(e.target.value)
                    setError(null)
                  }}
                  aria-invalid={!!error}
                  aria-describedby={error ? "withdraw-error" : undefined}
                  disabled={busy || done}
                  className="nums h-11 pr-16 text-base"
                  placeholder="0.00"
                />
                <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-sm text-muted-foreground">tUSDC</span>
              </div>
              <Button
                type="button"
                variant="outline"
                className="h-11"
                disabled={busy || done}
                onClick={() => {
                  const plain = `${Math.floor(claimable / MICRO)}.${String(claimable % MICRO).padStart(6, "0")}`
                  setRaw(locale === "fr" ? plain.replace(".", ",") : plain)
                  setError(null)
                }}
              >
                {w.max}
              </Button>
            </div>
            {error && (
              <p id="withdraw-error" className="text-sm font-medium text-destructive">
                {error}
              </p>
            )}
          </div>
          <TxLine
            phase={phase}
            pending={w.pending}
            confirmed={sent !== null ? t(w.confirmed, { amount: tokensWithUnit(sent, locale) }) : undefined}
            failed={w.failed}
          />
          <div className="flex justify-end gap-2">
            {done ? (
              <Button type="button" onClick={() => close(false)}>
                {d.common.close}
              </Button>
            ) : (
              <Button type="submit" disabled={busy}>
                <ArrowUpRightIcon aria-hidden />
                {w.submit}
              </Button>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
