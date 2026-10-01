"use client"

import { DownloadIcon } from "lucide-react"
import { useSearchParams } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { NativeSelect } from "@/components/ui/native-select"
import { t } from "@/i18n/t"
import { useDemo } from "@/lib/demo/hooks"
import { MICRO } from "@/lib/demo/math"
import type { LedgerKind } from "@/lib/demo/types"

import { useApp } from "./app-context"
import { describeEntry, LedgerRows } from "./ledger-rows"
import { EmptyState, PageHeading } from "./parts"

const KINDS: LedgerKind[] = ["inflow", "stream", "release", "withdraw", "deploy", "amend", "bonus"]
const PAGE = 40

export function LedgerView() {
  const { d } = useApp()
  const state = useDemo()
  const params = useSearchParams()
  const l = d.app.ledger
  const [work, setWork] = useState(params.get("work") ?? "all")
  const [kind, setKind] = useState<string>("all")
  const [limit, setLimit] = useState(PAGE)
  if (!state) return null

  const filtered = state.ledger.filter((e) => (work === "all" || e.workId === work) && (kind === "all" || e.kind === kind))

  const exportCsv = () => {
    const header = ["time", "type", "status", "work", "detail", "amount_tusdc", "your_share_tusdc", "dust_tusdc", "tx", "block"]
    const esc = (v: string) => (/[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v)
    const lines = filtered.map((e) =>
      [
        new Date(e.at).toISOString(),
        e.kind,
        e.held ? "held" : e.status,
        state.works.find((w) => w.id === e.workId)?.title ?? "",
        describeEntry(e, state.works, d),
        e.amount !== undefined ? (e.amount / MICRO).toFixed(6) : "",
        e.yourShare !== undefined ? (e.yourShare / MICRO).toFixed(6) : "",
        e.dust !== undefined ? (e.dust / MICRO).toFixed(6) : "",
        e.tx,
        String(e.block),
      ]
        .map(esc)
        .join(",")
    )
    const blob = new Blob([[header.join(","), ...lines].join("\n")], { type: "text/csv;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "streamroyalties-ledger.csv"
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
    toast.success(l.exported)
  }

  return (
    <div className="mx-auto w-full max-w-7xl space-y-8 px-4 py-8 sm:px-6 sm:py-12">
      <PageHeading
        eyebrow={l.eyebrow}
        title={l.title}
        actions={
          <Button variant="outline" onClick={exportCsv} disabled={filtered.length === 0}>
            <DownloadIcon aria-hidden />
            {l.export}
          </Button>
        }
      />
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="sm:w-64">
          <Label htmlFor="ledger-work">{l.work}</Label>
          <NativeSelect
            id="ledger-work"
            wrapperClassName="mt-1.5"
            value={work}
            onChange={(e) => {
              setWork(e.target.value)
              setLimit(PAGE)
            }}
          >
            <option value="all">{l.allWorks}</option>
            {state.works.map((w) => (
              <option key={w.id} value={w.id}>
                {w.title}
              </option>
            ))}
          </NativeSelect>
        </div>
        <div className="sm:w-56">
          <Label htmlFor="ledger-kind">{l.type}</Label>
          <NativeSelect
            id="ledger-kind"
            wrapperClassName="mt-1.5"
            value={kind}
            onChange={(e) => {
              setKind(e.target.value)
              setLimit(PAGE)
            }}
          >
            <option value="all">{l.allTypes}</option>
            {KINDS.map((k) => (
              <option key={k} value={k}>
                {l.kinds[k]}
              </option>
            ))}
          </NativeSelect>
        </div>
        <p className="text-sm text-muted-foreground sm:ml-auto" role="status" aria-live="polite">
          {t(l.showing, { count: filtered.length })}
        </p>
      </div>
      {filtered.length === 0 ? (
        <EmptyState
          action={
            <Button
              variant="outline"
              onClick={() => {
                setWork("all")
                setKind("all")
              }}
            >
              {l.clear}
            </Button>
          }
        >
          {l.empty}
        </EmptyState>
      ) : (
        <>
          <LedgerRows entries={filtered.slice(0, limit)} works={state.works} showWork={work === "all"} />
          {filtered.length > limit && (
            <Button variant="outline" onClick={() => setLimit((n) => n + PAGE)}>
              {l.more}
            </Button>
          )}
        </>
      )}
    </div>
  )
}
