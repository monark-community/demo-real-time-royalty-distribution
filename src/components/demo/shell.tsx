"use client"

import { CheckIcon, Loader2Icon, RotateCcwIcon, Settings2Icon } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState, type ReactNode } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { ConnectWallet } from "@/components/ui/connect-wallet"
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"
import { href } from "@/i18n/config"
import { useDemo } from "@/lib/demo/hooks"
import { connect, disconnect, resetDemo, setDeclineNext, setFailNext } from "@/lib/demo/store"
import { cn } from "@/lib/utils"

import { useApp } from "./app-context"

/** Header wallet: connect button, or the connected address with a disconnect menu. */
export function WalletChip({ compact = false }: { compact?: boolean }) {
  const { d, request } = useApp()
  const state = useDemo()
  const [connecting, setConnecting] = useState(false)
  if (!state) return <span className="inline-block h-10 w-10" aria-hidden />
  const onConnect = async () => {
    setConnecting(true)
    const ok = await request({ kind: "connect" })
    setConnecting(false)
    if (ok) connect()
  }
  return (
    <ConnectWallet
      status={state.connected ? "connected" : connecting ? "connecting" : "disconnected"}
      address={state.you.address}
      name={compact ? undefined : state.you.name}
      onConnect={onConnect}
      onDisconnect={() => disconnect()}
      connectLabel={compact ? d.app.wallet.connect : d.app.gate.connect}
      connectingLabel={d.app.tx.signing}
      disconnectLabel={d.app.wallet.disconnect}
      className={cn(compact ? "h-10 gap-1.5 px-2.5 py-1 pr-2 [&_[data-slot=wallet-address]]:sr-only" : "h-11 py-1.5")}
    />
  )
}

export function DemoControls() {
  const { d } = useApp()
  const state = useDemo()
  const c = d.app.controls
  const [open, setOpen] = useState(false)
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="h-9">
          <Settings2Icon aria-hidden />
          <span>{c.button}</span>
        </Button>
      </DialogTrigger>
      <DialogContent closeLabel={d.common.close} className="max-w-md">
        <DialogTitle className="wide text-xl font-extrabold">{c.title}</DialogTitle>
        <DialogDescription>{c.body}</DialogDescription>
        <div className="divide-y rounded-lg border">
          <label className="flex cursor-pointer items-start justify-between gap-4 p-4">
            <span>
              <span className="block font-medium">{c.failNext}</span>
              <span className="mt-0.5 block text-sm text-muted-foreground">{c.failNextHint}</span>
            </span>
            <Switch checked={!!state?.failNext} onCheckedChange={(v) => setFailNext(v)} aria-label={c.failNext} />
          </label>
          <label className="flex cursor-pointer items-start justify-between gap-4 p-4">
            <span>
              <span className="block font-medium">{c.declineNext}</span>
              <span className="mt-0.5 block text-sm text-muted-foreground">{c.declineNextHint}</span>
            </span>
            <Switch checked={!!state?.declineNext} onCheckedChange={(v) => setDeclineNext(v)} aria-label={c.declineNext} />
          </label>
        </div>
        <div className="flex flex-col gap-3 rounded-lg border border-dashed p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">{c.resetHint}</p>
          <Button
            variant="outline"
            onClick={() => {
              resetDemo()
              setOpen(false)
              toast.success(c.resetDone)
            }}
          >
            <RotateCcwIcon aria-hidden />
            {c.reset}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export function AppSubnav() {
  const { d, locale } = useApp()
  const pathname = usePathname() ?? ""
  const items = [
    { href: href(locale, "/app"), label: d.app.nav.overview, exact: true },
    { href: href(locale, "/app/new"), label: d.app.nav.new },
    { href: href(locale, "/app/ledger"), label: d.app.nav.ledger },
  ]
  return (
    <div className="border-b bg-panel">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 sm:px-6">
        <nav aria-label={d.app.nav.studioNav} className="-mx-1 flex min-w-0 flex-1 overflow-x-auto">
          <ul className="flex items-center gap-1 py-2">
            {items.map((item) => {
              const active = item.exact
                ? pathname === item.href || pathname.startsWith(`${item.href}/works`)
                : pathname.startsWith(item.href)
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "inline-flex h-9 items-center rounded-md px-3 text-sm font-medium whitespace-nowrap transition-colors",
                      active ? "bg-card text-foreground shadow-[inset_0_0_0_1px_var(--border)]" : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {item.label}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>
        <div className="shrink-0">
          <DemoControls />
        </div>
      </div>
    </div>
  )
}

/** Loading, then the connect gate, then the page. */
export function Gate({ children }: { children: ReactNode }) {
  const { d, request } = useApp()
  const state = useDemo()
  const [rejected, setRejected] = useState(false)
  const [busy, setBusy] = useState(false)
  const g = d.app.gate

  if (!state) {
    return (
      <div className="flex flex-1 items-center justify-center py-32 text-muted-foreground" role="status">
        <Loader2Icon className="mr-2 size-5 animate-spin" aria-hidden />
        {d.common.loading}
      </div>
    )
  }
  if (state.connected) return <>{children}</>

  const onConnect = async () => {
    setBusy(true)
    setRejected(false)
    const ok = await request({ kind: "connect" })
    setBusy(false)
    if (ok) connect()
    else setRejected(true)
  }

  return (
    <div className="mx-auto grid w-full max-w-7xl flex-1 gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1.1fr_1fr] lg:items-center lg:py-24">
      <div>
        <p className="silk flex items-center gap-2 text-brass">
          <span className="h-px w-6 bg-current" aria-hidden />
          {g.eyebrow}
        </p>
        <h1 className="display mt-5 text-4xl text-balance sm:text-6xl">{g.title}</h1>
        <p className="mt-5 max-w-xl text-lg text-muted-foreground">{g.body}</p>
        <div className="mt-8 flex flex-col items-start gap-4">
          <Button size="lg" onClick={onConnect} disabled={busy}>
            {busy ? <Loader2Icon className="animate-spin" aria-hidden /> : null}
            {g.connect}
          </Button>
          <div role="status" aria-live="polite">
            {rejected && (
              <p role="alert" className="rounded-lg border border-destructive/50 bg-destructive/5 px-3.5 py-2.5 text-sm font-medium text-destructive">
                {g.rejected}
              </p>
            )}
          </div>
        </div>
      </div>
      <ul className="module divide-y">
        {g.points.map((p) => (
          <li key={p} className="flex items-center gap-3 px-5 py-4">
            <CheckIcon className="size-4 shrink-0 text-primary" aria-hidden />
            <span>{p}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
