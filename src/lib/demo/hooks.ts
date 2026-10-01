"use client"

import { useEffect, useState, useSyncExternalStore } from "react"

import { getServerSnapshot, getSnapshot, subscribe } from "./store"
import type { DemoState } from "./types"

/** The demo state, or null during prerender and hydration. */
export function useDemo(): DemoState | null {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}

/** A clock for live counters. Slows to once a second when the visitor prefers reduced motion. */
export function useNow(intervalMs = 100): number {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
    const id = window.setInterval(() => setNow(Date.now()), reduced ? Math.max(1000, intervalMs) : intervalMs)
    return () => window.clearInterval(id)
  }, [intervalMs])
  return now
}

export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia?.("(prefers-reduced-motion: reduce)")
    if (!mq) return
    const onChange = () => setReduced(mq.matches)
    onChange()
    mq.addEventListener("change", onChange)
    return () => mq.removeEventListener("change", onChange)
  }, [])
  return reduced
}
