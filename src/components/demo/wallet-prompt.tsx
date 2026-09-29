"use client"

import { ShieldCheckIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog"
import { NetworkBadge } from "@/components/ui/network-badge"
import { WalletAvatar } from "@/components/ui/wallet"
import { NETWORK_FEE } from "@/lib/demo/chain"
import { useDemo } from "@/lib/demo/hooks"
import { YOU } from "@/lib/demo/seed"
import { shortAddress, tokensWithUnit } from "@/lib/format"
import { intlLocale } from "@/i18n/config"

import { useApp, type PromptRequest } from "./app-context"

/** The simulated wallet extension: every connection and signature goes through here. */
export function WalletPrompt({ request, onAnswer }: { request: PromptRequest | null; onAnswer: (ok: boolean) => void }) {
  const { d, locale } = useApp()
  const state = useDemo()
  const w = d.app.wallet
  const you = state?.you ?? YOU
  const isConnect = request?.kind === "connect"
  const fee = new Intl.NumberFormat(intlLocale[locale], { maximumFractionDigits: 4 }).format(NETWORK_FEE)

  return (
    <Dialog open={!!request} onOpenChange={(open) => !open && onAnswer(false)}>
      <DialogContent hideClose className="max-w-sm gap-0 overflow-hidden p-0 sm:p-0">
        <div className="flex items-center justify-between gap-3 border-b bg-panel px-5 py-3">
          <span className="silk text-muted-foreground">{w.title}</span>
          <NetworkBadge name={d.common.network} variant="outline" icon={<span className="block size-full rounded-full bg-success" />} />
        </div>
        <div className="px-5 pt-5">
          <DialogTitle className="wide text-xl font-extrabold">{isConnect ? w.connectTitle : w.signTitle}</DialogTitle>
          <DialogDescription className="mt-2">
            {isConnect ? w.connectBody : request?.kind === "sign" ? request.action : ""}
          </DialogDescription>
        </div>
        <dl className="mx-5 mt-5 divide-y rounded-lg border text-sm">
          <div className="flex items-center justify-between gap-3 px-3 py-2.5">
            <dt className="text-muted-foreground">{w.account}</dt>
            <dd className="flex items-center gap-2">
              <WalletAvatar address={you.address} size={18} />
              <span className="nums">{shortAddress(you.address)}</span>
            </dd>
          </div>
          {request?.kind === "sign" && (
            <>
              {request.contract && (
                <div className="flex items-center justify-between gap-3 px-3 py-2.5">
                  <dt className="text-muted-foreground">{w.contract}</dt>
                  <dd className="nums">{shortAddress(request.contract)}</dd>
                </div>
              )}
              {typeof request.amount === "number" && (
                <div className="flex items-center justify-between gap-3 px-3 py-2.5">
                  <dt className="text-muted-foreground">{w.amount}</dt>
                  <dd className="nums font-semibold">{tokensWithUnit(request.amount, locale)}</dd>
                </div>
              )}
              <div className="flex items-center justify-between gap-3 px-3 py-2.5">
                <dt className="text-muted-foreground">{w.fee}</dt>
                <dd className="nums">{fee} tETH</dd>
              </div>
            </>
          )}
          {isConnect && state && (
            <div className="flex items-center justify-between gap-3 px-3 py-2.5">
              <dt className="text-muted-foreground">{w.balance}</dt>
              <dd className="nums">{tokensWithUnit(state.walletBalance, locale)}</dd>
            </div>
          )}
        </dl>
        <p className="mx-5 mt-4 flex items-start gap-2 text-xs text-muted-foreground">
          <ShieldCheckIcon className="mt-px size-3.5 shrink-0" aria-hidden />
          {d.common.testnet}
        </p>
        <div className="mt-5 grid grid-cols-2 gap-2 border-t bg-panel px-5 py-4">
          <Button variant="outline" onClick={() => onAnswer(false)}>
            {w.reject}
          </Button>
          <Button onClick={() => onAnswer(true)} autoFocus>
            {isConnect ? w.connect : w.confirm}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
