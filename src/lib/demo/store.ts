/**
 * The simulated StreamRoyalties contracts, held in memory and persisted to
 * localStorage. UI code talks to this module only through `useDemo()` and the
 * exported actions, so it could later be swapped for wagmi/viem calls.
 */
import { blockAt, newId, randomAddress, sleep, confirmDelay, txHash } from "./chain"
import {
  distribute,
  effectiveShares,
  FULL,
  liveEarned,
  livePlays,
  MICRO_PER_PLAY,
  rateFor,
  streamAccrued,
} from "./math"
import { INFLOW_PRESETS, seedState, STATE_VERSION, STREAM_RATE } from "./seed"
import type {
  Amendment,
  Bps,
  Cadence,
  Collaborator,
  DemoState,
  LedgerEntry,
  Micro,
  SourceId,
  Work,
  WorkKind,
} from "./types"

const STORAGE_KEY = "streamroyalties-demo"

let state: DemoState | null = null
const listeners = new Set<() => void>()
const timers = new Set<ReturnType<typeof setTimeout>>()

function read(): DemoState | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as DemoState
    if (parsed?.version !== STATE_VERSION || !Array.isArray(parsed.works)) return null
    return { ...parsed, pendingInflows: [] }
  } catch {
    return null
  }
}

function write(s: DemoState) {
  try {
    const { pendingInflows: _transient, ...rest } = s
    void _transient
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...rest, pendingInflows: [] }))
  } catch {
    // Storage can be unavailable (private mode, blocked site data): the demo still works in memory.
  }
}

function emit() {
  for (const l of listeners) l()
}

function init(): DemoState {
  if (state) return state
  state = read() ?? seedState(Date.now())
  resumeAmendments(state)
  return state
}

export function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function getSnapshot(): DemoState {
  return init()
}

export function getServerSnapshot(): DemoState | null {
  return null
}

/** Apply a mutation to a copy of the state, persist it and notify subscribers. */
function update(mutate: (draft: DemoState) => void) {
  const draft = structuredClone(init())
  mutate(draft)
  state = draft
  write(draft)
  emit()
}

// ---------------------------------------------------------------- helpers

export const youIn = (s: DemoState, work: Work): Collaborator | undefined =>
  work.collaborators.find((c) => c.address.toLowerCase() === s.you.address.toLowerCase())

function ledgerPush(draft: DemoState, e: Omit<LedgerEntry, "id" | "tx" | "block">, id?: string): LedgerEntry {
  const full: LedgerEntry = { ...e, id: id ?? newId("l"), tx: txHash(), block: blockAt(e.at) }
  draft.ledger.unshift(full)
  return full
}

/** Bring a work's live stream into its settled balances (or held, for interval cadences). */
function settle(draft: DemoState, work: Work, now: number) {
  const accrued = streamAccrued(work, now)
  if (accrued > 0) {
    work.totalIn += accrued
    work.plays += Math.floor(accrued / MICRO_PER_PLAY)
    if (work.cadence === "continuous") {
      const { parts, dust } = distribute(accrued, effectiveShares(work), work.collaborators)
      for (const [id, part] of Object.entries(parts)) work.earned[id] = (work.earned[id] ?? 0) + part
      work.dustTotal += dust
    } else {
      work.held += accrued
    }
    if (work.stream) work.stream = { ...work.stream, delivered: (work.stream.delivered ?? 0) + accrued }
  }
  work.checkpoint = now
  void draft
}

function findWork(draft: DemoState, workId: string): Work {
  const w = draft.works.find((x) => x.id === workId)
  if (!w) throw new Error(`Unknown work ${workId}`)
  return w
}

function applyInflow(draft: DemoState, work: Work, amount: Micro, plays: number, source: SourceId, at: number, id?: string) {
  settle(draft, work, at)
  work.plays += plays
  work.totalIn += amount
  if (work.cadence !== "continuous") {
    work.held += amount
    ledgerPush(draft, { at, kind: "inflow", status: "confirmed", workId: work.id, source, amount, held: true }, id)
  } else {
    const { parts, dust } = distribute(amount, effectiveShares(work), work.collaborators)
    for (const [id, part] of Object.entries(parts)) work.earned[id] = (work.earned[id] ?? 0) + part
    work.dustTotal += dust
    const you = youIn(draft, work)
    ledgerPush(draft, {
      at,
      kind: "inflow",
      status: "confirmed",
      workId: work.id,
      source,
      amount,
      yourShare: you ? (parts[you.id] ?? 0) : 0,
      dust,
    }, id)
  }
  checkBonus(draft, work, at)
}

function checkBonus(draft: DemoState, work: Work, now: number) {
  const bonus = work.bonus
  if (!bonus || bonus.active) return
  if (livePlays(work, now) < bonus.thresholdPlays) return
  settle(draft, work, now)
  bonus.active = true
  bonus.activatedAt = now
  ledgerPush(draft, { at: now, kind: "bonus", status: "confirmed", workId: work.id })
}

// ---------------------------------------------------------------- selectors

export function claimable(s: DemoState, now: number): Micro {
  let total = 0
  for (const w of s.works) {
    const you = youIn(s, w)
    if (you) total += liveEarned(w, you.id, now)
  }
  return Math.max(0, total - s.withdrawn)
}

export function yourRate(s: DemoState): Micro {
  let total = 0
  for (const w of s.works) {
    const you = youIn(s, w)
    if (you) total += rateFor(w, you.id)
  }
  return total
}

export function hasAnyStream(s: DemoState): boolean {
  return s.works.some((w) => !!w.stream)
}

// ---------------------------------------------------------------- actions

export function connect() {
  update((d) => {
    d.connected = true
  })
}

export function disconnect() {
  update((d) => {
    d.connected = false
  })
}

export function setFailNext(value: boolean) {
  update((d) => {
    d.failNext = value
  })
}

export function setDeclineNext(value: boolean) {
  update((d) => {
    d.declineNext = value
  })
}

/** Reads and clears the "fail the next transaction" switch. */
export function consumeFailNext(): boolean {
  const fail = init().failNext
  if (fail) setFailNext(false)
  return fail
}

export function resetDemo() {
  for (const t of timers) clearTimeout(t)
  timers.clear()
  const connected = init().connected
  state = { ...seedState(Date.now()), connected }
  write(state)
  emit()
}

/** Called once a second: fires bonus rules that a live stream pushes over the line. */
export function tick(now = Date.now()) {
  const s = init()
  const due = s.works.some(
    (w) => w.stream && w.bonus && !w.bonus.active && livePlays(w, now) >= w.bonus.thresholdPlays
  )
  if (!due) return
  update((d) => {
    for (const w of d.works) checkBonus(d, w, now)
  })
}

/** Revenue arrives from an outside payer: pending first, then confirmed or reverted. */
export function sendInflow(workId: string, presetId: string): string {
  const preset = INFLOW_PRESETS.find((p) => p.id === presetId)
  if (!preset) throw new Error(`Unknown preset ${presetId}`)
  const id = newId("in")
  const fail = consumeFailNext()
  update((d) => {
    d.pendingInflows.push({
      id,
      workId,
      source: preset.source,
      amount: preset.amount,
      plays: preset.plays,
      at: Date.now(),
    })
  })
  const t = setTimeout(() => {
    timers.delete(t)
    update((d) => {
      const pending = d.pendingInflows.find((p) => p.id === id)
      d.pendingInflows = d.pendingInflows.filter((p) => p.id !== id)
      if (!pending) return
      const work = d.works.find((w) => w.id === pending.workId)
      if (!work) return
      const now = Date.now()
      if (fail) {
        ledgerPush(d, {
          at: now,
          kind: "inflow",
          status: "failed",
          workId: work.id,
          source: pending.source,
          amount: pending.amount,
        }, id)
        return
      }
      applyInflow(d, work, pending.amount, pending.plays, pending.source, now, id)
    })
  }, confirmDelay())
  timers.add(t)
  return id
}

export function inflowOutcome(id: string): LedgerEntry | undefined {
  return init().ledger.find((l) => l.id === id)
}

export function toggleStream(workId: string) {
  update((d) => {
    const work = findWork(d, workId)
    const now = Date.now()
    if (work.stream) {
      settle(d, work, now)
      const delivered = work.stream.delivered ?? 0
      const you = youIn(d, work)
      const share = work.cadence === "continuous" && you ? Math.floor((delivered * (effectiveShares(work)[you.id] ?? 0)) / FULL) : 0
      ledgerPush(d, {
        at: now,
        kind: "stream",
        status: "confirmed",
        workId: work.id,
        source: work.stream.source,
        amount: delivered,
        ...(work.cadence === "continuous" ? { yourShare: share } : { held: true }),
      })
      work.stream = null
    } else {
      settle(d, work, now)
      work.stream = { rate: STREAM_RATE, since: now, source: work.sources[0] ?? "streams", delivered: 0 }
    }
  })
}

export interface TxResult {
  ok: boolean
  tx: string
  block: number
}

/** Simulate a signed transaction: latency, then the effect or a revert. */
export async function sendTx(effect: (d: DemoState, now: number, tx: string) => void, onFail?: (d: DemoState, now: number) => void): Promise<TxResult> {
  const fail = consumeFailNext()
  await sleep(confirmDelay())
  const now = Date.now()
  const tx = txHash()
  if (fail) {
    if (onFail) update((d) => onFail(d, now))
    return { ok: false, tx, block: blockAt(now) }
  }
  update((d) => effect(d, now, tx))
  return { ok: true, tx, block: blockAt(now) }
}

export interface WorkDraft {
  title: string
  kind: WorkKind
  credit: string
  cadence: Cadence
  sources: SourceId[]
  collaborators: { name: string; role: string; address: string; bps: Bps; treasury?: boolean }[]
  bonus?: { collaboratorIndex: number; extraBps: Bps; thresholdPlays: number }
}

export function slugify(title: string): string {
  const base = title
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40)
  return base || "work"
}

/** Deploy a royalty contract for a new work. Resolves with the new work id when confirmed. */
export async function deployWork(draft: WorkDraft): Promise<TxResult & { workId?: string; contract?: string }> {
  const taken = new Set(init().works.map((w) => w.id))
  let id = slugify(draft.title)
  for (let n = 2; taken.has(id); n += 1) id = `${slugify(draft.title)}-${n}`
  const contract = randomAddress()
  const result = await sendTx(
    (d, now) => {
      const collaborators: Collaborator[] = draft.collaborators.map((c, i) => ({
        id: `c${i + 1}`,
        name: c.name.trim(),
        role: c.role.trim(),
        address: c.address.trim(),
        bps: c.bps,
        ...(c.treasury ? { treasury: true } : {}),
      }))
      if (!collaborators.some((c) => c.treasury) && collaborators.length > 0) {
        const last = collaborators[collaborators.length - 1]
        if (last) last.treasury = true
      }
      const bonusTarget = draft.bonus ? collaborators[draft.bonus.collaboratorIndex] : undefined
      const work: Work = {
        id,
        title: draft.title.trim(),
        kind: draft.kind,
        credit: draft.credit.trim(),
        createdAt: now,
        contract,
        cadence: draft.cadence,
        sources: draft.sources,
        collaborators,
        ...(draft.bonus && bonusTarget
          ? {
              bonus: {
                collaboratorId: bonusTarget.id,
                extraBps: draft.bonus.extraBps,
                thresholdPlays: draft.bonus.thresholdPlays,
                active: false,
              },
            }
          : {}),
        plays: 0,
        earned: Object.fromEntries(collaborators.map((c) => [c.id, 0])),
        held: 0,
        totalIn: 0,
        dustTotal: 0,
        checkpoint: now,
        stream: null,
        amendments: [],
      }
      d.works.unshift(work)
      ledgerPush(d, { at: now, kind: "deploy", status: "confirmed", workId: id })
    },
    (d, now) => {
      ledgerPush(d, { at: now, kind: "deploy", status: "failed", note: draft.title.trim() })
    }
  )
  return result.ok ? { ...result, workId: id, contract } : result
}

/** Interval cadences: distribute everything held right now. */
export async function releaseHeld(workId: string): Promise<TxResult & { amount?: Micro }> {
  let amount = 0
  const result = await sendTx(
    (d, now) => {
      const work = findWork(d, workId)
      settle(d, work, now)
      amount = work.held
      if (amount <= 0) return
      work.held = 0
      const { parts, dust } = distribute(amount, effectiveShares(work), work.collaborators)
      for (const [id, part] of Object.entries(parts)) work.earned[id] = (work.earned[id] ?? 0) + part
      work.dustTotal += dust
      const you = youIn(d, work)
      ledgerPush(d, {
        at: now,
        kind: "release",
        status: "confirmed",
        workId,
        amount,
        yourShare: you ? (parts[you.id] ?? 0) : 0,
        dust,
      })
    },
    (d, now) => {
      ledgerPush(d, { at: now, kind: "release", status: "failed", workId })
    }
  )
  return { ...result, amount }
}

export async function withdraw(amount: Micro): Promise<TxResult> {
  return sendTx(
    (d, now) => {
      d.withdrawn += amount
      d.walletBalance += amount
      ledgerPush(d, { at: now, kind: "withdraw", status: "confirmed", amount })
    },
    (d, now) => {
      ledgerPush(d, { at: now, kind: "withdraw", status: "failed", amount })
    }
  )
}

// ---------------------------------------------------------------- amendments

function scheduleSignatures(workId: string, amendmentId: string, signers: string[], declineBy?: string) {
  let delay = 900
  for (const signer of signers) {
    delay += 900 + Math.floor(Math.random() * 1_100)
    const t = setTimeout(() => {
      timers.delete(t)
      update((d) => {
        const work = d.works.find((w) => w.id === workId)
        const am = work?.amendments.find((a) => a.id === amendmentId)
        if (!work || !am || am.status !== "collecting") return
        const now = Date.now()
        if (signer === declineBy) {
          am.signatures[signer] = "declined"
          am.status = "declined"
          am.decidedAt = now
          ledgerPush(d, { at: now, kind: "amend", status: "failed", workId, note: signer })
          return
        }
        am.signatures[signer] = "signed"
        if (Object.values(am.signatures).every((s) => s === "signed")) {
          settle(d, work, now)
          for (const c of work.collaborators) c.bps = am.shares[c.id] ?? c.bps
          am.status = "applied"
          am.decidedAt = now
          ledgerPush(d, { at: now, kind: "amend", status: "confirmed", workId })
        }
      })
    }, delay)
    timers.add(t)
    if (signer === declineBy) break
  }
}

function resumeAmendments(s: DemoState) {
  if (typeof window === "undefined") return
  for (const w of s.works) {
    for (const a of w.amendments) {
      if (a.status !== "collecting") continue
      const waiting = Object.entries(a.signatures)
        .filter(([, v]) => v === "waiting")
        .map(([k]) => k)
      scheduleSignatures(w.id, a.id, waiting, a.declineBy)
    }
  }
}

export async function proposeAmendment(workId: string, shares: Record<string, Bps>): Promise<TxResult & { amendmentId?: string }> {
  const s = init()
  const work = s.works.find((w) => w.id === workId)
  if (!work) return { ok: false, tx: txHash(), block: blockAt(Date.now()) }
  const you = youIn(s, work)
  const others = work.collaborators.filter((c) => c.id !== you?.id).map((c) => c.id)
  const declineBy = s.declineNext ? others[others.length - 1] : undefined
  const amendmentId = newId("am")
  const result = await sendTx((d, now) => {
    const w = findWork(d, workId)
    const am: Amendment = {
      id: amendmentId,
      proposedAt: now,
      shares,
      signatures: Object.fromEntries(w.collaborators.map((c) => [c.id, c.id === you?.id ? "signed" : "waiting"])),
      status: "collecting",
      ...(declineBy ? { declineBy } : {}),
    }
    w.amendments.unshift(am)
    d.declineNext = false
  })
  if (result.ok) scheduleSignatures(workId, amendmentId, others, declineBy)
  return result.ok ? { ...result, amendmentId } : result
}

export { INFLOW_PRESETS }
