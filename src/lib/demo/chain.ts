/**
 * The simulated chain: hashes, addresses, block heights and latency.
 * Uses Math.random (not crypto.randomUUID) so it works on plain-http LAN previews.
 */

export const NETWORK_NAME = "StreamNet testnet"
export const TOKEN = "tUSDC"
export const TOKEN_DECIMALS = 6
/** Flat simulated network fee shown in wallet prompts. */
export const NETWORK_FEE = 0.0021

const GENESIS = Date.UTC(2026, 0, 1)
const BLOCK_MS = 2_000

export function blockAt(time: number): number {
  return 3_800_000 + Math.floor((time - GENESIS) / BLOCK_MS)
}

const HEX = "0123456789abcdef"

export function randomHex(length: number, rand: () => number = Math.random): string {
  let out = ""
  for (let i = 0; i < length; i += 1) out += HEX[Math.floor(rand() * 16)]
  return out
}

/** Mixed-case hex, like a checksummed address (not a real EIP-55 checksum). */
export function randomAddress(rand: () => number = Math.random): string {
  let out = "0x"
  for (let i = 0; i < 40; i += 1) {
    const ch = HEX[Math.floor(rand() * 16)] ?? "0"
    out += /[a-f]/.test(ch) && rand() > 0.5 ? ch.toUpperCase() : ch
  }
  return out
}

export const txHash = (rand: () => number = Math.random) => `0x${randomHex(64, rand)}`

export const newId = (prefix: string) => `${prefix}-${Date.now().toString(36)}${randomHex(6)}`

/** Wallet-side confirmation latency after the user signs. */
export const confirmDelay = () => 1_200 + Math.floor(Math.random() * 1_200)

/** Deterministic PRNG for the seed (mulberry32). */
export function prng(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms))
