"use client"

import { CheckCircle2Icon, AlertTriangleIcon } from "lucide-react"
import { Slider as SliderPrimitive } from "radix-ui"
import { useState } from "react"

import { intlLocale } from "@/i18n/config"
import { t } from "@/i18n/t"
import { percent } from "@/lib/format"
import { FULL } from "@/lib/demo/math"
import type { Bps } from "@/lib/demo/types"
import { cn } from "@/lib/utils"

import { useApp } from "./app-context"

export interface FaderItem {
  id: string
  label: string
  sub?: string
  tag?: string
}

/** Two-decimal percent text field that commits on blur or Enter. */
function PercentField({
  value,
  onCommit,
  label,
  disabled,
  max = FULL,
}: {
  value: Bps
  onCommit: (bps: Bps) => void
  label: string
  disabled?: boolean
  max?: Bps
}) {
  const { locale } = useApp()
  const fmt = (bps: Bps) =>
    new Intl.NumberFormat(intlLocale[locale], { minimumFractionDigits: 0, maximumFractionDigits: 2, useGrouping: false }).format(bps / 100)
  const [draft, setDraft] = useState<string | null>(null)
  const commit = () => {
    if (draft === null) return
    const n = Number(draft.replace(",", ".").replace(/[^\d.]/g, ""))
    if (Number.isFinite(n)) onCommit(Math.max(0, Math.min(max, Math.round(n * 100))))
    setDraft(null)
  }
  return (
    <div className="relative w-full">
      <input
        type="text"
        inputMode="decimal"
        aria-label={label}
        disabled={disabled}
        value={draft ?? fmt(value)}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault()
            commit()
          }
        }}
        className="nums h-9 w-full rounded-md border border-input bg-background pr-5 pl-1.5 text-center text-sm focus-visible:outline-2 focus-visible:outline-ring disabled:opacity-60"
      />
      <span className="pointer-events-none absolute top-1/2 right-1.5 -translate-y-1/2 text-xs text-muted-foreground">%</span>
    </div>
  )
}

/**
 * One vertical channel fader with its percent field. `cap` is the most this share can reach given
 * everyone else's (100% minus the others): the fader stops there, and the track shows that room.
 */
export function Fader({
  value,
  onChange,
  label,
  cap = FULL,
  disabled,
  className,
}: {
  value: Bps
  onChange: (bps: Bps) => void
  label: string
  cap?: Bps
  disabled?: boolean
  /** Sizes the slider; it fills the remaining height when the parent is a flex column. */
  className?: string
}) {
  // A share already above its cap (only possible in legacy state) may still move down.
  const limit = Math.max(cap, 0)
  const clamp = (bps: Bps) => Math.min(bps, Math.max(limit, value))
  return (
    <>
      <SliderPrimitive.Root
        orientation="vertical"
        min={0}
        max={FULL}
        step={50}
        value={[value]}
        disabled={disabled}
        onValueChange={(next) => onChange(clamp(next[0] ?? 0))}
        className={cn("relative flex w-10 touch-none flex-col items-center select-none data-[disabled]:opacity-60", className)}
      >
        <SliderPrimitive.Track className="relative h-full w-1.5 grow overflow-hidden rounded-full bg-meter-off">
          {/* Room this share can still take */}
          <span aria-hidden className="absolute inset-x-0 bottom-0 bg-brass/45 transition-[height]" style={{ height: `${(Math.min(limit, FULL) / FULL) * 100}%` }} />
          <SliderPrimitive.Range className="absolute w-full rounded-full bg-brass" />
        </SliderPrimitive.Track>
        {/* Cap marker: the highest this share can go right now */}
        {limit < FULL ? (
          <span
            aria-hidden
            className="pointer-events-none absolute right-0 h-0.5 w-2.5 translate-y-1/2 rounded-full bg-brass transition-[bottom]"
            style={{ bottom: `${(limit / FULL) * 100}%` }}
          />
        ) : null}
        {/* Scale ticks */}
        <span aria-hidden className="pointer-events-none absolute inset-y-0 left-0 flex flex-col justify-between py-0.5">
          {Array.from({ length: 11 }, (_, i) => (
            <span key={i} className={cn("h-px bg-muted-foreground/50", i % 5 === 0 ? "w-2" : "w-1")} />
          ))}
        </span>
        <SliderPrimitive.Thumb
          aria-label={label}
          className="relative block h-5 w-9 rounded-[3px] border border-foreground/30 bg-card shadow-[0_2px_0_rgb(0_0_0/0.12)] after:absolute after:inset-x-1.5 after:top-1/2 after:h-0.5 after:-translate-y-1/2 after:bg-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        />
      </SliderPrimitive.Root>
      <PercentField value={value} onCommit={(bps) => onChange(clamp(bps))} label={label} disabled={disabled} max={Math.max(limit, value)} />
    </>
  )
}

/** The most each share can reach: 100% minus everyone else's. */
export function capsFor(values: Record<string, Bps>): Record<string, Bps> {
  const total = Object.values(values).reduce((a, b) => a + b, 0)
  return Object.fromEntries(Object.entries(values).map(([id, v]) => [id, FULL - (total - v)]))
}

/** A bank of vertical faders, one per collaborator, like channel faders on a desk. Shares are capped so the total never passes 100%. */
export function FaderBank({
  items,
  values,
  onChange,
  disabled,
  highlight,
}: {
  items: FaderItem[]
  values: Record<string, Bps>
  onChange: (id: string, bps: Bps) => void
  disabled?: boolean
  highlight?: string
}) {
  const { d } = useApp()
  const caps = capsFor(values)
  return (
    <div className="-mx-1 overflow-x-auto px-1 pb-1">
      <div className="flex min-w-max gap-2">
        {items.map((item) => {
          const v = values[item.id] ?? 0
          const label = t(d.app.faders.shareOf, { name: item.label || "…" })
          return (
            <div
              key={item.id}
              className={cn(
                "flex w-[4.75rem] flex-col items-center gap-2 rounded-lg border bg-background px-2 pt-3 pb-2 sm:w-24",
                highlight === item.id && "border-primary/60"
              )}
            >
              <Fader value={v} cap={caps[item.id] ?? FULL} onChange={(bps) => onChange(item.id, bps)} label={label} disabled={disabled} className="h-40" />
              <span className="w-full truncate text-center text-xs font-semibold" title={item.label}>
                {item.label || "…"}
              </span>
              {item.sub ? <span className="-mt-1.5 w-full truncate text-center text-[11px] text-muted-foreground">{item.sub}</span> : null}
              {item.tag ? <span className="silk -mt-1 text-[10px] text-primary">{item.tag}</span> : null}
            </div>
          )
        })}
      </div>
    </div>
  )
}

/** The master bus: shows the total and whether it sits exactly at unity (100%). */
export function MasterMeter({ total, onBalance, canBalance }: { total: Bps; onBalance?: () => void; canBalance?: boolean }) {
  const { d, locale } = useApp()
  const f = d.app.faders
  const ok = total === FULL
  const over = total > FULL
  const width = Math.min(100, (total / FULL) * 100)
  return (
    <div className="rounded-lg border bg-panel p-3.5">
      <div className="flex items-center justify-between gap-3">
        <span className="silk text-muted-foreground">{f.master}</span>
        <span className={cn("nums text-sm font-semibold", ok ? "text-success" : over ? "text-destructive" : "text-warning")}>
          {t(f.total, { total: percent(total, locale, 2) })}
        </span>
      </div>
      <div className="relative mt-2 h-2.5 rounded-sm bg-meter-off">
        <span
          className={cn("absolute inset-y-0 left-0 rounded-sm transition-[width]", ok ? "bg-success" : over ? "bg-destructive" : "bg-warning")}
          style={{ width: `${width}%` }}
        />
      </div>
      <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2" role="status" aria-live="polite">
        <p className={cn("inline-flex items-center gap-1.5 text-sm", ok ? "text-success" : "text-foreground")}>
          {ok ? <CheckCircle2Icon className="size-4" aria-hidden /> : <AlertTriangleIcon className={cn("size-4", over ? "text-destructive" : "text-warning")} aria-hidden />}
          {ok ? f.ok : t(f.rule, { total: percent(total, locale, 2) })}
        </p>
        {!ok && onBalance ? (
          <button
            type="button"
            onClick={onBalance}
            disabled={!canBalance}
            className="text-sm font-semibold text-primary underline-offset-4 hover:underline disabled:opacity-50"
          >
            {f.balance}
          </button>
        ) : null}
      </div>
    </div>
  )
}
