# StreamRoyalties

**Get paid every second your work is heard.** StreamRoyalties turns a split sheet into a live royalty contract: revenue from streams, sales and licenses reaches every collaborator the moment it lands, with a ledger down to the rounding dust.

This repository is a **demo**: an independent product incubated by [Monark](https://www.monark.io). Everything runs in the browser against a simulated testnet (tUSDC, a simulated wallet, simulated revenue). No real funds, no backend, no environment variables.

Project page: https://www.monark.io/en/project/real-time-royalty-distribution

## What you can do in the demo

1. **Connect** the demo wallet (confirm or reject the prompt) and land in the studio as Noor Haddad, with three works and a live claimable balance.
2. **Write a split sheet** (`/app/new`): collaborators, roles, wallets, shares on vertical faders that must reach exactly 100%, a continuous or interval release, an optional bonus rule; then deploy the royalty contract.
3. **Run revenue through a work** (`/app/works/night-bus-home`): send streaming batches, sales and licenses, open or close a live stream, watch every channel meter and counter move; trigger the producer's bonus; release held revenue on the weekly podcast.
4. **Withdraw** your claimable royalties to the wallet.
5. **Amend a split**: propose new shares and watch co-signers sign (or decline).

Every transaction has pending, confirmed and failed states. The **Demo controls** menu in the studio can fail the next transaction, make a collaborator decline the next amendment, and **Reset demo**.

## Run it locally

Requirements: Node 22 and pnpm 10.

```bash
pnpm install
pnpm dev          # http://localhost:3151
```

Production build and checks:

```bash
pnpm lint
pnpm typecheck
pnpm build
pnpm start        # http://localhost:3151
```

Screenshots (Playwright, against a running production server): `pnpm screenshots` writes to `docs/screenshots/`.

## How the simulation works

- `src/lib/demo/` is the only place that knows about "the chain". UI components call its actions (`sendInflow`, `toggleStream`, `deployWork`, `releaseHeld`, `withdraw`, `proposeAmendment`) and read state through `useDemo()`, so the layer could be swapped for wagmi/viem without touching the UI.
- Money is integer micro-units (1 tUSDC = 1,000,000), shares are basis points. `math.ts` splits each amount by flooring every share and crediting the remainder (dust) to the work's treasury recipient, exactly like a contract would. Bonus rules re-apportion shares with a largest-remainder method.
- Live streams accrue per millisecond from a rate and a checkpoint; balances are settled into the ledger whenever something changes.
- Signed actions go through a simulated wallet prompt, then 1.2 to 2.4 s of pending, then confirm with a block number and hash, or revert. Inflows from outside payers need no signature.
- State persists in `localStorage` (every access wrapped in try/catch); pages prerender and show a loading state until the browser state is read.

## Project structure

```
src/
  app/
    [locale]/            en and fr routes (proxy.ts redirects / to the preferred language)
      (site)/            home, how-it-works, credits, pricing (unlinked, noindex), 404 catch-all
      app/               the studio: overview, new split sheet, works/[id], ledger
      opengraph-image.tsx
    sitemap.ts, robots.ts, icon.svg, globals.css (design tokens)
  components/
    home/                meter bridge (hero)
    demo/                studio UI: wallet prompt, tx states, faders, channel strips, ledger
    site/                header, footer, brand, locale and theme switches
    ui/                  components from the Monark UI registry, re-themed
  i18n/                  typed EN/FR dictionaries
  lib/demo/              simulated chain, seed data, contract math, store
docs/
  site-plan.md           product brief, identity, flows, copy (matches what shipped)
  assets.md              photo sources and credits
  screenshots/           Playwright screenshots of every page and flow
```

## Deploy to Vercel

Import the repository in Vercel and deploy with the framework defaults (Next.js, pnpm). No `vercel.json` and no environment variables are needed. Optionally set `NEXT_PUBLIC_SITE_URL` to the production URL for canonical links, sitemap and Open Graph (defaults to `https://streamroyalties.monark.io`).

## Credits

Photos from Unsplash (see `docs/assets.md` and `/credits`). Built with Monark.
