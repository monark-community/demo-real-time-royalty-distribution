"use client"

import { PlusIcon, RocketIcon, Trash2Icon, WandSparklesIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { useId, useState } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { href } from "@/i18n/config"
import { t } from "@/i18n/t"
import { integer, percent, shortAddress } from "@/lib/format"
import { randomAddress } from "@/lib/demo/chain"
import { useDemo } from "@/lib/demo/hooks"
import { FULL, isAddress, sumBps } from "@/lib/demo/math"
import { ROLE_KEYS } from "@/lib/demo/seed"
import { deployWork } from "@/lib/demo/store"
import type { Bps, Cadence, SourceId, WorkKind } from "@/lib/demo/types"
import { cn } from "@/lib/utils"

import { useApp } from "./app-context"
import { FaderBank, MasterMeter } from "./faders"
import { PageHeading } from "./parts"
import { TxLine, useTx } from "./tx"

interface Row {
  key: string
  name: string
  role: string
  customRole: string
  address: string
  bps: Bps
  treasury: boolean
}

const KINDS: WorkKind[] = ["song", "podcast", "video", "book"]
const SOURCES: SourceId[] = ["streams", "editions", "unlocks", "sync", "ads"]
const CADENCES: Cadence[] = ["continuous", "daily", "weekly"]

let rowSeq = 0
const rowKey = () => `r${(rowSeq += 1)}`

const selectClass =
  "h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-2 focus-visible:outline-ring aria-[invalid=true]:border-destructive"

function FieldError({ id, msg }: { id: string; msg?: string | null }) {
  if (!msg) return null
  return (
    <p id={id} className="mt-1 text-xs font-medium text-destructive">
      {msg}
    </p>
  )
}

export function Builder() {
  const { d, locale } = useApp()
  const state = useDemo()
  const router = useRouter()
  const b = d.app.builder
  const uid = useId()
  const you = state?.you

  const [title, setTitle] = useState("")
  const [kind, setKind] = useState<WorkKind>("song")
  const [credit, setCredit] = useState("")
  const [sources, setSources] = useState<SourceId[]>(["streams"])
  const [cadence, setCadence] = useState<Cadence>("continuous")
  const [rows, setRows] = useState<Row[]>(() => [
    { key: "you", name: you?.name ?? "Noor Haddad", role: "vocals", customRole: "", address: you?.address ?? "", bps: 5000, treasury: false },
    { key: rowKey(), name: "", role: "producer", customRole: "", address: "", bps: 5000, treasury: true },
  ])
  const [bonusOn, setBonusOn] = useState(false)
  const [bonusWho, setBonusWho] = useState(1)
  const [bonusExtra, setBonusExtra] = useState("5")
  const [bonusPlays, setBonusPlays] = useState("1000000")
  const [showErrors, setShowErrors] = useState(false)
  const { phase, run, busy } = useTx()
  const [deployedAt, setDeployedAt] = useState<string | null>(null)

  if (!state || !you) return null

  const total = sumBps(rows.map((r) => r.bps))
  const seen = new Map<string, number>()
  rows.forEach((r) => {
    const a = r.address.trim().toLowerCase()
    if (a) seen.set(a, (seen.get(a) ?? 0) + 1)
  })
  const rowErrors = rows.map((r) => ({
    name: r.name.trim() ? null : b.errName,
    role: r.role === "other" && !r.customRole.trim() ? b.errRole : null,
    address: !isAddress(r.address) ? b.errAddress : (seen.get(r.address.trim().toLowerCase()) ?? 0) > 1 ? b.errDuplicate : null,
    share: r.bps <= 0 ? b.errZeroShare : null,
  }))
  const extraN = Number(bonusExtra)
  const playsN = Number(bonusPlays.replace(/[\s,.  ]/g, ""))
  const errors = {
    title: title.trim() ? null : b.errTitle,
    sources: sources.length ? null : b.errSources,
    min: rows.length >= 2 ? null : b.errMin,
    total: total === FULL ? null : b.errTotal,
    bonus:
      bonusOn && !(rows[bonusWho] && Number.isInteger(extraN) && extraN >= 1 && extraN <= 20 && Number.isFinite(playsN) && playsN > 0)
        ? b.errBonus
        : null,
  }
  const valid =
    !Object.values(errors).some(Boolean) && rowErrors.every((e) => !e.name && !e.role && !e.address && !e.share)
  const err = (msg: string | null | undefined) => (showErrors ? msg : null)

  const updateRow = (key: string, patch: Partial<Row>) => setRows((rs) => rs.map((r) => (r.key === key ? { ...r, ...patch } : r)))
  const setTreasury = (key: string) => setRows((rs) => rs.map((r) => ({ ...r, treasury: r.key === key })))
  const removeRow = (key: string) =>
    setRows((rs) => {
      const next = rs.filter((r) => r.key !== key)
      if (!next.some((r) => r.treasury) && next.length) next[next.length - 1] = { ...next[next.length - 1]!, treasury: true }
      return next
    })
  const addRow = () => setRows((rs) => [...rs, { key: rowKey(), name: "", role: "musician", customRole: "", address: "", bps: 0, treasury: false }])
  const balance = () => {
    const target = rows.find((r) => r.treasury) ?? rows[rows.length - 1]
    if (!target) return
    const others = sumBps(rows.filter((r) => r.key !== target.key).map((r) => r.bps))
    updateRow(target.key, { bps: Math.max(0, FULL - others) })
  }

  const fillExample = () => {
    const ex = b.example
    setTitle(ex.title)
    setCredit(ex.credit)
    setKind("song")
    setSources(["streams", "editions", "sync"])
    setCadence("continuous")
    const people = ex.people.map((p, i) => ({
      key: rowKey(),
      name: p.name,
      role: p.role,
      customRole: "",
      address: randomAddress(),
      bps: [2500, 2500, 1000][i] ?? 0,
      treasury: p.role === "treasury",
    }))
    setRows([{ key: "you", name: you.name, role: "writer", customRole: "", address: you.address, bps: 4000, treasury: false }, ...people])
    setBonusOn(true)
    setBonusWho(1)
    setBonusExtra("5")
    setBonusPlays("500000")
    setShowErrors(false)
  }

  const deploy = async () => {
    setShowErrors(true)
    if (!valid) return
    const result = await run({ kind: "sign", action: b.deployAction }, () =>
      deployWork({
        title,
        kind,
        credit: credit.trim() || you.name,
        cadence,
        sources,
        collaborators: rows.map((r) => ({
          name: r.name,
          role: r.role === "other" ? r.customRole : r.role,
          address: r.address,
          bps: r.bps,
          treasury: r.treasury,
        })),
        ...(bonusOn ? { bonus: { collaboratorIndex: bonusWho, extraBps: extraN * 100, thresholdPlays: playsN } } : {}),
      })
    )
    if (result?.ok && result.workId) {
      setDeployedAt(result.contract ?? null)
      const id = result.workId
      window.setTimeout(() => router.push(href(locale, `/app/works/${id}`)), 1400)
    }
  }

  const locked = busy || phase.status === "confirmed"

  return (
    <div className="mx-auto w-full max-w-5xl space-y-8 px-4 py-8 sm:px-6 sm:py-12">
      <PageHeading
        eyebrow={b.eyebrow}
        title={b.title}
        actions={
          <Button variant="outline" onClick={fillExample} disabled={locked}>
            <WandSparklesIcon aria-hidden />
            {b.fillExample}
          </Button>
        }
      />

      <form
        noValidate
        onSubmit={(e) => {
          e.preventDefault()
          void deploy()
        }}
        className="space-y-8"
      >
        {/* The work */}
        <fieldset className="module min-w-0 space-y-5 p-5 sm:p-6" disabled={locked}>
          <legend className="sr-only">{b.detailsTitle}</legend>
          <h2 className="wide text-xl font-extrabold" aria-hidden>
            {b.detailsTitle}
          </h2>
          <div className="grid gap-4 sm:grid-cols-[2fr_1fr]">
            <div>
              <Label htmlFor={`${uid}-title`}>{b.titleLabel}</Label>
              <Input
                id={`${uid}-title`}
                className="mt-1.5 h-10"
                value={title}
                placeholder={b.titlePlaceholder}
                onChange={(e) => setTitle(e.target.value)}
                aria-invalid={!!err(errors.title)}
                aria-describedby={err(errors.title) ? `${uid}-title-err` : undefined}
              />
              <FieldError id={`${uid}-title-err`} msg={err(errors.title)} />
            </div>
            <div>
              <Label htmlFor={`${uid}-kind`}>{b.kindLabel}</Label>
              <select id={`${uid}-kind`} className={cn(selectClass, "mt-1.5")} value={kind} onChange={(e) => setKind(e.target.value as WorkKind)}>
                {KINDS.map((k) => (
                  <option key={k} value={k}>
                    {d.kinds[k]}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <Label htmlFor={`${uid}-credit`}>{b.creditLabel}</Label>
            <Input id={`${uid}-credit`} className="mt-1.5 h-10" value={credit} placeholder={b.creditPlaceholder} onChange={(e) => setCredit(e.target.value)} />
          </div>
          <fieldset aria-describedby={err(errors.sources) ? `${uid}-src-err` : undefined}>
            <legend className="text-sm font-medium">{b.sourcesLabel}</legend>
            <div className="mt-2 flex flex-wrap gap-2">
              {SOURCES.map((s) => {
                const on = sources.includes(s)
                return (
                  <label
                    key={s}
                    className={cn(
                      "inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-md border px-3 text-sm transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-ring",
                      on ? "border-foreground bg-foreground text-background" : "bg-background hover:bg-accent"
                    )}
                  >
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={on}
                      onChange={() => setSources((cur) => (on ? cur.filter((x) => x !== s) : [...cur, s]))}
                    />
                    {d.sources[s]}
                  </label>
                )
              })}
            </div>
            <FieldError id={`${uid}-src-err`} msg={err(errors.sources)} />
          </fieldset>
        </fieldset>

        {/* Collaborators and faders */}
        <fieldset className="module min-w-0 space-y-5 p-5 sm:p-6" disabled={locked}>
          <legend className="sr-only">{b.collabTitle}</legend>
          <div>
            <h2 className="wide text-xl font-extrabold" aria-hidden>
              {b.collabTitle}
            </h2>
          </div>
          <ol className="space-y-3">
            {rows.map((r, i) => {
              const e = rowErrors[i]!
              const isYou = r.key === "you"
              const base = `${uid}-${r.key}`
              return (
                <li key={r.key} className="rounded-lg border bg-background p-4">
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <span className="silk text-muted-foreground">
                      {String(i + 1).padStart(2, "0")}
                      {isYou ? <span className="ml-2 text-primary">{b.you}</span> : null}
                    </span>
                    {!isYou && (
                      <Button type="button" variant="ghost" size="icon" onClick={() => removeRow(r.key)} aria-label={t(b.remove, { name: r.name || String(i + 1) })}>
                        <Trash2Icon aria-hidden />
                      </Button>
                    )}
                  </div>
                  <div className="grid gap-3 md:grid-cols-[1.2fr_1fr_1.5fr]">
                    <div>
                      <Label htmlFor={`${base}-name`}>{b.name}</Label>
                      <Input
                        id={`${base}-name`}
                        className="mt-1.5 h-10"
                        value={r.name}
                        readOnly={isYou}
                        placeholder={b.namePlaceholder}
                        onChange={(ev) => updateRow(r.key, { name: ev.target.value })}
                        aria-invalid={!!err(e.name)}
                        aria-describedby={err(e.name) ? `${base}-name-err` : undefined}
                      />
                      <FieldError id={`${base}-name-err`} msg={err(e.name)} />
                    </div>
                    <div>
                      <Label htmlFor={`${base}-role`}>{b.role}</Label>
                      <select
                        id={`${base}-role`}
                        className={cn(selectClass, "mt-1.5")}
                        value={r.role}
                        onChange={(ev) => updateRow(r.key, { role: ev.target.value })}
                      >
                        {ROLE_KEYS.map((k) => (
                          <option key={k} value={k}>
                            {d.roles[k]}
                          </option>
                        ))}
                        <option value="other">{d.roles.other}</option>
                      </select>
                      {r.role === "other" && (
                        <>
                          <Input
                            aria-label={b.customRole}
                            placeholder={b.customRole}
                            className="mt-2 h-10"
                            value={r.customRole}
                            onChange={(ev) => updateRow(r.key, { customRole: ev.target.value })}
                            aria-invalid={!!err(e.role)}
                          />
                          <FieldError id={`${base}-role-err`} msg={err(e.role)} />
                        </>
                      )}
                    </div>
                    <div>
                      <Label htmlFor={`${base}-addr`}>{b.address}</Label>
                      <Input
                        id={`${base}-addr`}
                        className="nums mt-1.5 h-10 text-xs sm:text-sm"
                        value={r.address}
                        readOnly={isYou}
                        spellCheck={false}
                        autoComplete="off"
                        placeholder={b.addressPlaceholder}
                        onChange={(ev) => updateRow(r.key, { address: ev.target.value })}
                        aria-invalid={!!err(e.address)}
                        aria-describedby={err(e.address) ? `${base}-addr-err` : undefined}
                      />
                      <FieldError id={`${base}-addr-err`} msg={err(e.address)} />
                    </div>
                  </div>
                  <label className="mt-3 inline-flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
                    <input type="radio" name={`${uid}-treasury`} checked={r.treasury} onChange={() => setTreasury(r.key)} className="size-4 accent-[var(--primary)]" />
                    {b.treasury}
                  </label>
                  {err(e.share) ? <p className="mt-1 text-xs font-medium text-destructive">{err(e.share)}</p> : null}
                </li>
              )
            })}
          </ol>
          {err(errors.min) ? <p className="text-sm font-medium text-destructive">{err(errors.min)}</p> : null}
          <Button type="button" variant="outline" onClick={addRow} disabled={rows.length >= 8}>
            <PlusIcon aria-hidden />
            {b.add}
          </Button>

          <div className="space-y-3 border-t pt-5">
            <FaderBank
              items={rows.map((r, i) => ({
                id: r.key,
                label: r.name.split(" ")[0] || String(i + 1).padStart(2, "0"),
                sub: r.role === "other" ? r.customRole : d.roles[r.role as keyof typeof d.roles],
                tag: r.treasury ? d.app.work.treasury : undefined,
              }))}
              values={Object.fromEntries(rows.map((r) => [r.key, r.bps]))}
              onChange={(key, bps) => updateRow(key, { bps })}
              disabled={locked}
            />
            <MasterMeter total={total} onBalance={balance} canBalance={rows.length > 0 && !locked} />
          </div>
        </fieldset>

        {/* Release cadence */}
        <fieldset className="module min-w-0 space-y-4 p-5 sm:p-6" disabled={locked}>
          <legend className="sr-only">{b.cadenceTitle}</legend>
          <h2 className="wide text-xl font-extrabold" aria-hidden>
            {b.cadenceTitle}
          </h2>
          <div className="grid gap-3 sm:grid-cols-3">
            {CADENCES.map((c) => (
              <label
                key={c}
                className={cn(
                  "flex cursor-pointer flex-col gap-1 rounded-lg border p-4 transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-ring",
                  cadence === c ? "border-primary bg-primary/5" : "bg-background hover:bg-accent"
                )}
              >
                <span className="flex items-center gap-2 font-semibold">
                  <input type="radio" name={`${uid}-cadence`} value={c} checked={cadence === c} onChange={() => setCadence(c)} className="size-4 accent-[var(--primary)]" />
                  {d.cadences[c]}
                </span>
                <span className="text-sm text-muted-foreground">{d.cadences[`${c}Hint` as const]}</span>
              </label>
            ))}
          </div>
        </fieldset>

        {/* Bonus rule */}
        <fieldset className="module min-w-0 space-y-4 p-5 sm:p-6" disabled={locked}>
          <legend className="sr-only">{b.bonusTitle}</legend>
          <div className="flex items-center justify-between gap-4">
            <h2 className="wide text-xl font-extrabold" aria-hidden>
              {b.bonusTitle}
            </h2>
            <label className="inline-flex items-center gap-3 text-sm">
              {b.bonusToggle}
              <Switch checked={bonusOn} onCheckedChange={setBonusOn} aria-label={b.bonusToggle} />
            </label>
          </div>
          {bonusOn && (
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <Label htmlFor={`${uid}-bwho`}>{b.bonusWho}</Label>
                <select id={`${uid}-bwho`} className={cn(selectClass, "mt-1.5")} value={bonusWho} onChange={(e) => setBonusWho(Number(e.target.value))}>
                  {rows.map((r, i) => (
                    <option key={r.key} value={i}>
                      {r.name || String(i + 1).padStart(2, "0")}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor={`${uid}-bextra`}>{b.bonusExtra}</Label>
                <Input id={`${uid}-bextra`} inputMode="numeric" className="nums mt-1.5 h-10" value={bonusExtra} onChange={(e) => setBonusExtra(e.target.value)} />
              </div>
              <div>
                <Label htmlFor={`${uid}-bplays`}>{b.bonusThreshold}</Label>
                <Input id={`${uid}-bplays`} inputMode="numeric" className="nums mt-1.5 h-10" value={bonusPlays} onChange={(e) => setBonusPlays(e.target.value)} />
              </div>
              {err(errors.bonus) ? <p className="text-sm font-medium text-destructive sm:col-span-3">{err(errors.bonus)}</p> : null}
            </div>
          )}
        </fieldset>

        {/* Review and deploy */}
        <section aria-labelledby={`${uid}-review`} className="rounded-2xl border-2 border-foreground/80 bg-card p-5 sm:p-6">
          <h2 id={`${uid}-review`} className="wide text-xl font-extrabold">
            {b.reviewTitle}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {title.trim() || b.titlePlaceholder} · {d.kinds[kind]} · {d.cadences[cadence]} ·{" "}
            {t(b.reviewShares, { count: rows.length, total: percent(total, locale, 2) })}
          </p>
          <div className="mt-4 flex h-3 overflow-hidden rounded-sm bg-meter-off" aria-hidden>
            {rows.map((r, i) => (
              <span
                key={r.key}
                style={{ width: `${(Math.min(r.bps, FULL) / Math.max(FULL, total)) * 100}%` }}
                className={cn(["bg-chart-1", "bg-chart-2", "bg-chart-3", "bg-chart-4", "bg-chart-5"][i % 5], "border-r-2 border-card last:border-r-0")}
              />
            ))}
          </div>
          <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
            {rows.map((r, i) => (
              <li key={r.key}>
                <span className="font-medium text-foreground">{r.name || String(i + 1).padStart(2, "0")}</span> {percent(r.bps, locale)}
                {r.address && isAddress(r.address) ? <span className="nums"> · {shortAddress(r.address)}</span> : null}
              </li>
            ))}
            {bonusOn && rows[bonusWho] ? (
              <li className="text-primary">
                +{bonusExtra} · {rows[bonusWho]?.name} · {Number.isFinite(playsN) ? integer(playsN, locale) : bonusPlays}
              </li>
            ) : null}
          </ul>
          {showErrors && !valid ? (
            <p role="alert" className="mt-4 text-sm font-medium text-destructive">
              {b.fixErrors}
            </p>
          ) : null}
          <TxLine
            className="mt-4"
            phase={phase}
            pending={b.deployPending}
            confirmed={deployedAt ? t(b.deployConfirmed, { address: shortAddress(deployedAt) }) : undefined}
            failed={b.deployFailed}
          />
          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
            <Button type="submit" size="lg" disabled={locked}>
              <RocketIcon aria-hidden />
              {b.deploy}
            </Button>
          </div>
        </section>
      </form>
    </div>
  )
}
