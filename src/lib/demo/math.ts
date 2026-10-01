import type { Bps, Cadence, Collaborator, Micro, Work } from "./types"

export const MICRO = 1_000_000
export const FULL: Bps = 10_000
/** A streaming payout is worth 0.0041 tUSDC per play in this simulation. */
export const MICRO_PER_PLAY = 4_100

export const toMicro = (tusdc: number): Micro => Math.round(tusdc * MICRO)
export const fromMicro = (micro: Micro): number => micro / MICRO

export function isAddress(value: string): boolean {
  return /^0x[0-9a-fA-F]{40}$/.test(value.trim())
}

export function sumBps(values: Iterable<Bps>): Bps {
  let total = 0
  for (const v of values) total += v
  return total
}

/**
 * Integer apportionment (largest remainder): scale `weights` so they add up to
 * exactly `total`, never producing fractions of a basis point.
 */
export function apportion(weights: Record<string, number>, total: number): Record<string, number> {
  const ids = Object.keys(weights)
  const weightSum = ids.reduce((s, id) => s + (weights[id] ?? 0), 0)
  if (weightSum <= 0) return Object.fromEntries(ids.map((id) => [id, 0]))
  const exact = ids.map((id) => ({ id, value: ((weights[id] ?? 0) * total) / weightSum }))
  const floors = exact.map((e) => ({ id: e.id, floor: Math.floor(e.value), rem: e.value - Math.floor(e.value) }))
  let left = total - floors.reduce((s, f) => s + f.floor, 0)
  const byRem = [...floors].sort((a, b) => b.rem - a.rem)
  const out: Record<string, number> = Object.fromEntries(floors.map((f) => [f.id, f.floor]))
  for (const f of byRem) {
    if (left <= 0) break
    out[f.id] = (out[f.id] ?? 0) + 1
    left -= 1
  }
  return out
}

/** Base shares with an active bonus applied: the bonus collaborator gains, everyone else gives up pro rata. */
export function effectiveShares(work: Pick<Work, "collaborators" | "bonus">): Record<string, Bps> {
  const base = Object.fromEntries(work.collaborators.map((c) => [c.id, c.bps]))
  const bonus = work.bonus
  if (!bonus?.active || !(bonus.collaboratorId in base)) return base
  const boosted = Math.min(FULL, (base[bonus.collaboratorId] ?? 0) + bonus.extraBps)
  const others = Object.fromEntries(Object.entries(base).filter(([id]) => id !== bonus.collaboratorId))
  return { ...apportion(others, FULL - boosted), [bonus.collaboratorId]: boosted }
}

export function treasuryOf(collaborators: Collaborator[]): Collaborator | undefined {
  return collaborators.find((c) => c.treasury) ?? collaborators[collaborators.length - 1]
}

/**
 * Split an amount the way the contract does: floor each share in integer µ,
 * then credit the rounding dust to the treasury recipient.
 */
export function distribute(
  amount: Micro,
  shares: Record<string, Bps>,
  collaborators: Collaborator[]
): { parts: Record<string, Micro>; dust: Micro } {
  const parts: Record<string, Micro> = {}
  let paid = 0
  for (const c of collaborators) {
    const part = Math.floor((amount * (shares[c.id] ?? 0)) / FULL)
    parts[c.id] = part
    paid += part
  }
  const dust = amount - paid
  const treasury = treasuryOf(collaborators)
  if (treasury && dust > 0) parts[treasury.id] = (parts[treasury.id] ?? 0) + dust
  return { parts, dust }
}

/** Revenue a live stream has delivered since the work's last checkpoint. */
export function streamAccrued(work: Work, now: number): Micro {
  if (!work.stream) return 0
  const from = Math.max(work.checkpoint, work.stream.since)
  return Math.max(0, Math.floor((work.stream.rate * (now - from)) / 1000))
}

/** A collaborator's earnings right now, including the unsettled part of a live stream. */
export function liveEarned(work: Work, collaboratorId: string, now: number): Micro {
  const settled = work.earned[collaboratorId] ?? 0
  if (work.cadence !== "continuous" || !work.stream) return settled
  const shares = effectiveShares(work)
  return settled + Math.floor((streamAccrued(work, now) * (shares[collaboratorId] ?? 0)) / FULL)
}

export function liveHeld(work: Work, now: number): Micro {
  if (work.cadence === "continuous") return 0
  return work.held + streamAccrued(work, now)
}

export function livePlays(work: Work, now: number): number {
  return work.plays + Math.floor(streamAccrued(work, now) / MICRO_PER_PLAY)
}

export function liveTotalIn(work: Work, now: number): Micro {
  return work.totalIn + streamAccrued(work, now)
}

/** Per-second rate for one collaborator on a continuous live stream. */
export function rateFor(work: Work, collaboratorId: string): Micro {
  if (!work.stream || work.cadence !== "continuous") return 0
  return Math.floor((work.stream.rate * (effectiveShares(work)[collaboratorId] ?? 0)) / FULL)
}

/** Next scheduled release for an interval cadence (daily 17:00, or Friday 17:00). */
export function nextRelease(cadence: Cadence, now: number): number | null {
  if (cadence === "continuous") return null
  const d = new Date(now)
  d.setHours(17, 0, 0, 0)
  if (cadence === "daily") {
    if (d.getTime() <= now) d.setDate(d.getDate() + 1)
    return d.getTime()
  }
  const toFriday = (5 - d.getDay() + 7) % 7
  d.setDate(d.getDate() + toFriday)
  if (d.getTime() <= now) d.setDate(d.getDate() + 7)
  return d.getTime()
}
