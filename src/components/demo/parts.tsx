"use client"

import { BookOpenIcon, FilmIcon, MicIcon, Music2Icon } from "lucide-react"
import type { ReactNode } from "react"

import type { WorkKind } from "@/lib/demo/types"
import { cn } from "@/lib/utils"

export function PageHeading({
  eyebrow,
  title,
  body,
  actions,
}: {
  eyebrow: string
  title: string
  body?: ReactNode
  actions?: ReactNode
}) {
  return (
    <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
      <div className="min-w-0">
        <p className="silk flex items-center gap-2 text-brass">
          <span className="h-px w-6 bg-current" aria-hidden />
          {eyebrow}
        </p>
        <h1 className="display mt-3 text-3xl text-balance sm:text-5xl">{title}</h1>
        {body ? <div className="mt-3 max-w-2xl text-muted-foreground">{body}</div> : null}
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap gap-2">{actions}</div> : null}
    </div>
  )
}

export function KindIcon({ kind, className }: { kind: WorkKind; className?: string }) {
  const Icon = kind === "song" ? Music2Icon : kind === "podcast" ? MicIcon : kind === "video" ? FilmIcon : BookOpenIcon
  return <Icon className={cn("size-4", className)} aria-hidden />
}

/** Segmented level meter, vertical (channel strips) or horizontal (cards). */
export function Meter({
  level,
  segments = 16,
  vertical = true,
  desk = false,
  className,
}: {
  level: number
  segments?: number
  vertical?: boolean
  /** Always-dark console palette (the desk panels ignore the page theme). */
  desk?: boolean
  className?: string
}) {
  const colors = desk
    ? { hot: "bg-[#e57a8e]", on: "bg-[#d2a860]", off: "bg-[#312b25]" }
    : { hot: "bg-primary", on: "bg-brass", off: "bg-meter-off" }
  const lit = Math.round(Math.max(0, Math.min(1, level)) * segments)
  return (
    <div
      aria-hidden
      className={cn(vertical ? "flex flex-col-reverse gap-[3px]" : "flex gap-[3px]", className)}
    >
      {Array.from({ length: segments }, (_, s) => {
        const on = s < lit
        const hot = s >= segments - Math.max(2, Math.round(segments / 6))
        return (
          <span
            key={s}
            className={cn(
              "rounded-[2px] transition-colors duration-150",
              vertical ? "h-full w-full" : "h-full flex-1",
              on ? (hot ? colors.hot : colors.on) : colors.off
            )}
          />
        )
      })}
    </div>
  )
}

export function Silk({ children, className }: { children: ReactNode; className?: string }) {
  return <span className={cn("silk text-muted-foreground", className)}>{children}</span>
}

export function EmptyState({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-start gap-4 rounded-xl border border-dashed p-6 text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
      <p>{children}</p>
      {action}
    </div>
  )
}
