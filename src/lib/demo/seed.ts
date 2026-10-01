import { blockAt, prng, randomAddress, txHash } from "./chain"
import { distribute, effectiveShares, MICRO_PER_PLAY, toMicro } from "./math"
import type { Collaborator, DemoState, InflowPreset, LedgerEntry, SourceId, Work } from "./types"

export const STATE_VERSION = 3

export const YOU = {
  name: "Noor Haddad",
  address: "0x7a3F9e21B04c5D8a6E1f2093cB47d5E8A10fc91E",
}

const DAY = 86_400_000

/** Revenue the simulator can send into a work. Labels live in the dictionaries. */
export const INFLOW_PRESETS: InflowPreset[] = [
  { id: "streams", source: "streams", amount: toMicro(4.1), plays: 1_000 },
  { id: "editions", source: "editions", amount: toMicro(25), plays: 0 },
  { id: "unlocks", source: "unlocks", amount: toMicro(12), plays: 0 },
  { id: "ads", source: "ads", amount: toMicro(180), plays: 0 },
  { id: "sync", source: "sync", amount: toMicro(400), plays: 0 },
]

/** Default live-stream rate the simulator opens: 0.05 tUSDC per second. */
export const STREAM_RATE = toMicro(0.05)

/** Preset role keys; anything else is shown as typed. */
export const ROLE_KEYS = [
  "vocals",
  "writer",
  "producer",
  "musician",
  "engineer",
  "host",
  "editor",
  "director",
  "venue",
  "treasury",
] as const

export function seedState(now: number): DemoState {
  const rand = prng(20260929)
  const addr = () => randomAddress(rand)
  const people = {
    theo: addr(),
    ama: addr(),
    rui: addr(),
    band: addr(),
    jonah: addr(),
    priya: addr(),
    camille: addr(),
    venue: addr(),
  }

  const c = (id: string, name: string, role: string, address: string, bps: number, treasury = false): Collaborator => ({
    id,
    name,
    role,
    address,
    bps,
    ...(treasury ? { treasury } : {}),
  })

  const blank = (collaborators: Collaborator[]) => Object.fromEntries(collaborators.map((x) => [x.id, 0]))

  const nightBusCollabs = [
    c("noor", YOU.name, "vocals", YOU.address, 3_500),
    c("theo", "Théo Marchand", "producer", people.theo, 2_500),
    c("ama", "Ama Mensah", "writer", people.ama, 2_000),
    c("rui", "Rui Tanaka", "musician", people.rui, 1_000),
    c("band", "Lowlight Hours", "treasury", people.band, 1_000, true),
  ]
  const fieldnotesCollabs = [
    c("noor", YOU.name, "host", YOU.address, 4_250),
    c("jonah", "Jonah Price", "host", people.jonah, 4_250),
    c("priya", "Priya Nair", "editor", people.priya, 1_500, true),
  ]
  const salaCollabs = [
    c("camille", "Camille Roy", "director", people.camille, 3_000),
    c("noor", YOU.name, "vocals", YOU.address, 2_000),
    c("ama", "Ama Mensah", "musician", people.ama, 1_500),
    c("rui", "Rui Tanaka", "musician", people.rui, 1_500),
    c("theo", "Théo Marchand", "engineer", people.theo, 1_000),
    c("venue", "Sala Rossa", "venue", people.venue, 1_000, true),
  ]

  const works: Work[] = [
    {
      id: "night-bus-home",
      title: "Night Bus Home",
      kind: "song",
      credit: "Lowlight Hours",
      createdAt: now - 74 * DAY,
      contract: addr(),
      cadence: "continuous",
      sources: ["streams", "editions", "sync"],
      collaborators: nightBusCollabs,
      bonus: { collaboratorId: "theo", extraBps: 500, thresholdPlays: 1_000_000, active: false },
      plays: 0,
      earned: blank(nightBusCollabs),
      held: 0,
      totalIn: 0,
      dustTotal: 0,
      checkpoint: now,
      stream: null,
      amendments: [],
    },
    {
      id: "fieldnotes-s2",
      title: "Fieldnotes S2",
      kind: "podcast",
      credit: "Noor Haddad & Jonah Price",
      createdAt: now - 58 * DAY,
      contract: addr(),
      cadence: "weekly",
      sources: ["ads", "unlocks"],
      collaborators: fieldnotesCollabs,
      plays: 0,
      earned: blank(fieldnotesCollabs),
      held: 0,
      totalIn: 0,
      dustTotal: 0,
      checkpoint: now,
      stream: null,
      amendments: [],
    },
    {
      id: "live-at-sala-rossa",
      title: "Live at Sala Rossa",
      kind: "video",
      credit: "Lowlight Hours · dir. Camille Roy",
      createdAt: now - 41 * DAY,
      contract: addr(),
      cadence: "continuous",
      sources: ["unlocks", "editions"],
      collaborators: salaCollabs,
      plays: 0,
      earned: blank(salaCollabs),
      held: 0,
      totalIn: 0,
      dustTotal: 0,
      checkpoint: now,
      stream: null,
      amendments: [],
    },
  ]

  const ledger: LedgerEntry[] = []
  const entry = (e: Omit<LedgerEntry, "id" | "tx" | "block" | "status"> & { status?: LedgerEntry["status"] }) => {
    ledger.push({ status: "confirmed", ...e, id: `seed-${ledger.length}`, tx: txHash(rand), block: blockAt(e.at) })
  }

  for (const w of works) entry({ at: w.createdAt, kind: "deploy", workId: w.id })

  // Earlier history (before the 30-day window) is summarised as starting totals.
  const preload: Record<string, number> = {
    "night-bus-home": toMicro(2_860.4),
    "fieldnotes-s2": toMicro(1_148.25),
    "live-at-sala-rossa": toMicro(612.8),
  }
  const pay = (w: Work, amount: number, at: number, source: SourceId, plays = 0, toHeld = false, record = true) => {
    w.totalIn += amount
    w.plays += plays
    if (toHeld) {
      w.held += amount
      if (record) entry({ at, kind: "inflow", workId: w.id, source, amount, held: true })
      return
    }
    const { parts, dust } = distribute(amount, effectiveShares(w), w.collaborators)
    for (const [id, part] of Object.entries(parts)) w.earned[id] = (w.earned[id] ?? 0) + part
    w.dustTotal += dust
    const you = w.collaborators.find((x) => x.address === YOU.address)
    if (record) entry({ at, kind: "inflow", workId: w.id, source, amount, yourShare: you ? parts[you.id] : 0, dust })
  }
  const [nightBus, fieldnotes, sala] = works as [Work, Work, Work]
  pay(nightBus, preload["night-bus-home"] ?? 0, now - 31 * DAY, "streams", 697_650, false, false)
  pay(fieldnotes, preload["fieldnotes-s2"] ?? 0, now - 31 * DAY, "ads", 0, false, false)
  pay(sala, preload["live-at-sala-rossa"] ?? 0, now - 31 * DAY, "unlocks", 0, false, false)

  for (let d = 30; d >= 1; d -= 1) {
    const day = now - d * DAY
    const at = (h: number, m = 0) => {
      const t = new Date(day)
      t.setHours(h, m, 0, 0)
      return t.getTime()
    }
    // Night Bus Home: a daily streaming payout batch, a few edition sales, one sync license.
    const plays = 7_200 + Math.floor(rand() * 4_800) + (30 - d) * 120
    pay(nightBus, plays * MICRO_PER_PLAY, at(6, 5), "streams", plays)
    if (d === 26 || d === 17 || d === 9 || d === 3) pay(nightBus, toMicro(25), at(20, 40), "editions")
    if (d === 12) pay(nightBus, toMicro(400), at(14, 12), "sync")

    // Live at Sala Rossa: rentals and unlocks every day, two edition drops.
    pay(sala, toMicro(6 + Math.round(rand() * 900) / 100), at(22, 15), "unlocks")
    if (d === 21 || d === 5) pay(sala, toMicro(40), at(19, 30), "editions")

    // Fieldnotes S2: ad reads and unlocks are held, then released every Friday at 17:00.
    const date = new Date(day)
    if (date.getDay() === 2) pay(fieldnotes, toMicro(180), at(10, 0), "ads", 0, true)
    if (date.getDay() === 4) pay(fieldnotes, toMicro(24 + Math.round(rand() * 1_600) / 100), at(12, 30), "unlocks", 0, true)
    if (date.getDay() === 5 && fieldnotes.held > 0) {
      const amount = fieldnotes.held
      fieldnotes.held = 0
      const { parts, dust } = distribute(amount, effectiveShares(fieldnotes), fieldnotes.collaborators)
      for (const [id, part] of Object.entries(parts)) fieldnotes.earned[id] = (fieldnotes.earned[id] ?? 0) + part
      fieldnotes.dustTotal += dust
      entry({ at: at(17, 0), kind: "release", workId: fieldnotes.id, amount, yourShare: parts.noor, dust })
    }
  }
  // Since the last release: this week's ad read is already held.
  pay(fieldnotes, toMicro(180), now - 3 * 3_600_000, "ads", 0, true)

  // Two past withdrawals.
  const withdrawals = [
    { at: now - 19 * DAY + 5_400_000, amount: toMicro(900) },
    { at: now - 6 * DAY + 2_700_000, amount: toMicro(420) },
  ]
  for (const w of withdrawals) entry({ at: w.at, kind: "withdraw", amount: w.amount })
  const withdrawn = withdrawals.reduce((s, w) => s + w.amount, 0)

  // Night Bus Home sits just under its bonus threshold, with a live stream open.
  nightBus.plays = 998_240
  nightBus.stream = { rate: toMicro(0.02), since: now, source: "streams" }
  nightBus.checkpoint = now

  ledger.sort((a, b) => b.at - a.at)

  return {
    version: STATE_VERSION,
    seededAt: now,
    connected: false,
    you: YOU,
    walletBalance: toMicro(86.5),
    withdrawn,
    works,
    ledger,
    failNext: false,
    declineNext: false,
    pendingInflows: [],
  }
}
