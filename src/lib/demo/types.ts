/**
 * Domain types for the simulated StreamRoyalties chain.
 *
 * Money is always an integer number of micro-units (1 tUSDC = 1_000_000 µ),
 * the way a contract would hold it; shares are basis points (10_000 = 100%).
 * Nothing here knows about React, so the layer can be swapped for wagmi/viem.
 */

export type Micro = number
export type Bps = number

export type WorkKind = "song" | "podcast" | "video" | "book"
export type Cadence = "continuous" | "daily" | "weekly"
export type SourceId = "streams" | "editions" | "unlocks" | "sync" | "ads"

export interface Collaborator {
  id: string
  name: string
  role: string
  address: string
  bps: Bps
  /** Receives rounding dust so totals always reconcile. Exactly one per work. */
  treasury?: boolean
}

export interface BonusRule {
  collaboratorId: string
  extraBps: Bps
  thresholdPlays: number
  active: boolean
  activatedAt?: number
}

export type Signature = "signed" | "waiting" | "declined"

export interface Amendment {
  id: string
  proposedAt: number
  /** Proposed base shares (before any bonus), by collaborator id. */
  shares: Record<string, Bps>
  signatures: Record<string, Signature>
  status: "collecting" | "applied" | "declined"
  decidedAt?: number
  /** Scripted outcome for the simulation: who declines, if anyone. */
  declineBy?: string
}

export interface LiveStream {
  /** µ per second. */
  rate: Micro
  since: number
  source: SourceId
  /** Total delivered since the stream opened. */
  delivered?: Micro
}

export interface Work {
  id: string
  title: string
  kind: WorkKind
  credit: string
  createdAt: number
  contract: string
  cadence: Cadence
  sources: SourceId[]
  collaborators: Collaborator[]
  bonus?: BonusRule
  plays: number
  /** Settled earnings per collaborator, up to `checkpoint`. */
  earned: Record<string, Micro>
  /** Interval cadences: confirmed revenue waiting for the next release. */
  held: Micro
  totalIn: Micro
  dustTotal: Micro
  checkpoint: number
  stream: LiveStream | null
  amendments: Amendment[]
}

export type LedgerKind = "deploy" | "inflow" | "stream" | "release" | "withdraw" | "amend" | "bonus"

export interface LedgerEntry {
  id: string
  at: number
  kind: LedgerKind
  status: "confirmed" | "failed"
  workId?: string
  source?: SourceId
  amount?: Micro
  /** The connected collaborator's part of this entry, when it paid them. */
  yourShare?: Micro
  dust?: Micro
  /** Inflow landed in the held balance of an interval work. */
  held?: boolean
  note?: string
  tx: string
  block: number
}

export interface PendingInflow {
  id: string
  workId: string
  source: SourceId
  amount: Micro
  plays: number
  at: number
}

export interface DemoState {
  version: number
  seededAt: number
  connected: boolean
  you: { name: string; address: string }
  walletBalance: Micro
  withdrawn: Micro
  works: Work[]
  ledger: LedgerEntry[]
  failNext: boolean
  declineNext: boolean
  /** Transient: not persisted. */
  pendingInflows: PendingInflow[]
}

export interface InflowPreset {
  id: string
  source: SourceId
  amount: Micro
  plays: number
}
