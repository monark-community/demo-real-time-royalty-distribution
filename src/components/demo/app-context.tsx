"use client"

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react"

import type { Locale } from "@/i18n/config"
import type { Dictionary } from "@/i18n"
import { tick } from "@/lib/demo/store"
import type { Micro } from "@/lib/demo/types"

import { WalletPrompt } from "./wallet-prompt"

export type AppDict = Pick<Dictionary, "common" | "app" | "kinds" | "cadences" | "sources" | "payers" | "presets" | "roles">

export type PromptRequest =
  | { kind: "connect" }
  | { kind: "sign"; action: string; contract?: string; amount?: Micro }

interface AppContextValue {
  locale: Locale
  d: AppDict
  request: (req: PromptRequest) => Promise<boolean>
}

const AppContext = createContext<AppContextValue | null>(null)

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error("useApp must be used inside <AppProvider>")
  return ctx
}

export function AppProvider({ locale, d, children }: { locale: Locale; d: AppDict; children: ReactNode }) {
  const [pending, setPending] = useState<PromptRequest | null>(null)
  const resolver = useRef<((ok: boolean) => void) | null>(null)

  const request = useCallback((req: PromptRequest) => {
    resolver.current?.(false)
    setPending(req)
    return new Promise<boolean>((resolve) => {
      resolver.current = resolve
    })
  }, [])

  const answer = useCallback((ok: boolean) => {
    resolver.current?.(ok)
    resolver.current = null
    setPending(null)
  }, [])

  // The chain clock: lets live streams trigger bonus rules even while nobody clicks.
  useEffect(() => {
    const id = window.setInterval(() => tick(), 1000)
    return () => window.clearInterval(id)
  }, [])

  const value = useMemo(() => ({ locale, d, request }), [locale, d, request])

  return (
    <AppContext.Provider value={value}>
      {children}
      <WalletPrompt request={pending} onAnswer={answer} />
    </AppContext.Provider>
  )
}
