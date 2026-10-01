# StreamRoyalties: site plan

Independent product incubated by Monark (`monark-branded: false`). Own name, identity and voice; the only Monark presence is the "Built with Monark" footer credit.

Sources read: the Lovable app on `main` (`src/pages/Index.tsx`, `src/components/*`), https://streamroyalties.monark.io/ and the authoritative project page https://www.monark.io/en/project/real-time-royalty-distribution.

## 1. Product brief

**Target user.** Small creative teams whose income arrives as many small, continuous amounts: an independent band and its producer, a podcast with two hosts and an editor, a filmmaker and the crew of a concert film, a DAO that commissions a media collaboration. The person who sets it up is usually the lead creator or their manager; everyone else on the split sheet is a recipient who mainly wants to see their money arrive.

**Core job to be done.** "When our work earns money, get every collaborator their agreed share immediately and provably, without one of us collecting it, doing spreadsheets and sending transfers months later."

**Domain concepts.**

| Concept | Meaning in the product |
|-|-|
| Work | A song, episode, video, book or license bundle that earns money. One royalty contract per work. |
| Split sheet | The agreed shares (percent, two decimals) per collaborator, with role and wallet. The contract enforces it. |
| Revenue source | Where money comes from: streaming payouts, edition (NFT) sales, content unlocks, sync and software licenses. |
| Inflow | One payment into the contract (a streaming batch, a sale, a license fee). |
| Live stream | A continuous inflow at a flow rate (tUSDC per second), in the style of Superfluid streams. |
| Release cadence | *Continuous* (every inflow is split the second it lands) or *interval* (daily or weekly: inflows are held and released on schedule). |
| Bonus rule | A dynamic split condition, e.g. "producer gets +5 points once the work passes 1,000,000 plays", taken pro rata from the others. |
| Claimable balance | What a collaborator has earned but not yet withdrawn. It grows every second while a stream runs. |
| Amendment | A proposed change to a split sheet. Takes effect only when every current collaborator signs; past earnings never move. |
| Rounding dust | Sub-cent remainders from integer math. Tracked and credited to the work's treasury recipient so totals always reconcile. |

**What the Lovable version got wrong or left out.**

- It was one generic dashboard with a purple/blue gradient, random numbers drifting every 3 seconds, and nothing a visitor could actually do: "Add recipient", edit, delete, filter and export were dead buttons.
- It never showed the core idea: money arriving *and being split* in real time. Earnings were a single number; the split sheet was a static list of percentages.
- No notion of a work or a royalty contract, of release cadence (continuous vs interval), bonus conditions, or amendments, all of which the project page names.
- Its split editor could not enforce "must total 100%"; it only displayed a warning.
- No transaction states (pending, confirmed, failed), no claim/withdraw, no per-collaborator statement, no French, no light theme, no accessibility work, no disclaimers beyond a wrapper.

## 2. Value proposition

**For bands, podcasters and media collectives, StreamRoyalties turns your split sheet into a live contract that pays every collaborator their share the second revenue lands, instead of a quarterly statement that shows up six months late.**

Supporting benefits (outcomes):

1. **Nobody waits on anybody.** Every collaborator's balance rises as the work earns, and they can withdraw whenever they like.
2. **Nobody has to trust the spreadsheet.** Shares, bonus rules and every inflow are on the record, down to the rounding.
3. **Nobody's share changes behind their back.** A split can only change when everyone on it signs, and past earnings never move.

## 3. Hero

- **Headline (EN):** Get paid every second your work is heard.
- **Headline (FR):** Payé à chaque seconde où l'on vous écoute.
- **Subheadline (EN):** Your split sheet becomes a live contract: streams, sales and licenses reach every collaborator the moment they land.
- **Subheadline (FR):** Votre feuille de partage devient un contrat vivant : écoutes, ventes et licences arrivent à chaque collaborateur dès qu'elles tombent.
- No eyebrow above the headline (restraint rules: it added nothing).
- **Primary CTA:** "Open the studio" / « Ouvrir le studio » → `/{locale}/app`.
- **Secondary CTA:** "See how a split works" / « Voir comment un partage fonctionne » → `/{locale}/how-it-works`.
- **Hero visual:** the product itself, built in code: a *meter bridge* for the single "Night Bus Home". Revenue ticks arrive from named sources on the left, and five channel strips (one per collaborator) each show a segmented level meter and a per-second counter in mono digits that visibly climbs. Why: the whole point is *real-time* distribution, and a live instrument shows it in two seconds where a photo or illustration can't. Respects `prefers-reduced-motion` (counters update once a second, no meter animation).

## 4. Page map

All routes live under `/{locale}` (`en`, `fr`); `/` redirects to the visitor's preferred language (fallback English).

| Route | Purpose | Sections, in order |
|-|-|-|
| `/` | Convince in one scroll, send people to the studio | Hero (meter bridge) · then exactly 5 sections: "The six-month wait" (statement timeline) · Three steps · Three feature highlights · Who it's for (two photos + three personas) · Closing CTA |
| `/how-it-works` | The mechanics for the collaborator who wants to trust it and the developer or DAO evaluating it. Justified because the project page stresses transparency, precision math and fairness models, which need more than a landing section. | Intro + photo · Anatomy of a royalty contract (diagram) · Continuous vs interval release (diagrams) · Precision: integer math and rounding dust (worked example) · Bonus rules (before/after bars) · Amendments need every signature · What is on-chain vs off-chain · FAQ (5 questions, only here) · CTA to the studio |
| `/app` | Studio overview for the connected collaborator | Wallet gate (if not connected) · "Earning now" live claimable counter + Withdraw · Earnings by work (live rates) · 30-day earnings by source (bar chart) · Recent activity |
| `/app/new` | Write a split sheet and deploy a royalty contract | Work details · Collaborators with faders (must total 100%) · Release cadence · Bonus rule (optional) · Review and deploy |
| `/app/works/[id]` | One work's live contract | Header (work, contract address, cadence, status) · Channel strips (live meters per collaborator) · Revenue simulator (send inflows, open a live stream, release held funds) · Split sheet + amendments · Work ledger |
| `/app/ledger` | Statement of every event across works | Filters (work, type) · Ledger table/list · CSV export · Empty state |
| `/credits` | Photo credits (linked from the footer) | Photographer list |
| `/pricing` | **Internal strategy review only.** Never linked, noindex, not in sitemap | Model, tiers, reasoning |
| 404 | Not found | Message + links home and to the studio |

**Header (the only top bar on marketing pages):** wordmark (left); links "Studio", "How it works" (pill highlight when active); a small "Demo" chip, EN/FR switch, theme toggle, primary "Open the studio" (inside `/app` it becomes the connect-wallet / wallet chip). Mobile: wordmark + menu button opening a sheet with links, Demo chip, switches and action (in the app, a compact wallet avatar stays next to the menu button). Only the app adds a second compact strip: sub-nav (Overview, New split sheet, Ledger) + "Demo controls" (fail next transaction, a collaborator declines the next change, Reset demo).

**Footer:** one-line description; links Studio, How it works, Credits; "Demo · simulated data" notice; "Photos from Unsplash, see credits"; "Built with Monark" credit (muted, 13px, links to monark.io); repo link and project page link.

**Disclaimers:** "Demo · simulated data" in the footer + the header Demo chip. "Testnet demo · not financial advice · no real funds" appears once per transaction, in the simulated wallet's confirmation prompt only.

## 5. Feature highlights

| Feature | User benefit | Where | Proven by |
|-|-|-|-|
| Live meter bridge | See your share arriving, per collaborator, per second | Home hero, work page, overview | Flow 3 |
| Split sheet as a contract (faders, 100% rule, deploy) | Agree once, never chase anyone again | Home steps, `/app/new` | Flow 2 |
| Continuous or interval release | Pay by the second, or batch weekly for lower fees | Home features, how-it-works, work page | Flow 3 (release held funds) |
| Bonus rules (dynamic splits) | Reward the producer or the promoter when the work takes off | Home features, how-it-works, `/app/new` | Flow 2, Flow 3 (threshold crossing) |
| Withdraw anytime | Your money, your timing | Overview | Flow 4 |
| Amendments with every signature | Nobody's share changes behind their back | Home features, how-it-works (+ FAQ), work page | Flow 5 |
| Ledger to the cent | Statements you can hand to an accountant | `/app/ledger` (filters, CSV export), overview activity | All flows write to it |

## 6. Key flows

All wallet actions open a simulated wallet prompt (Confirm / Reject). Latency: prompt, then 1.2–2.4 s pending, then confirmed with a block number and tx hash, or failed. A "Fail the next transaction" switch in Demo controls forces a revert so every failure state can be seen.

1. **Connect.** `/app` shows the gate → "Connect demo wallet" → prompt. *Rejected:* inline alert "You declined the connection. Nothing was shared." with retry. *Confirmed:* overview loads as Noor Haddad (`0x7a3F…c91E`).
2. **Write a split sheet and deploy.** `/app/new` → title, type, main source → add collaborators (name, role, wallet) → set shares with faders or typed percentages (live "Master" meter shows the total; "Fill an example" fills a realistic sheet; on submit, deploy is refused with inline field errors unless the total is exactly 100.00%, every share > 0 and addresses are valid and unique) → choose cadence → optional bonus rule → Review → "Deploy contract" → prompt → *pending* "Deploying royalty contract…" → *confirmed* "Contract live at 0x…" and redirect to the work page / *failed* "Deployment reverted: no contract was created and no fee was taken." with retry, form kept.
3. **Run revenue through a work.** Work page → simulator buttons for that work's sources: "1,000 streams on Tidewave" (+4.10 tUSDC), "Edition sale on Crate" (+25), "10 unlocks on Loop" (+12), "Host-read ad" (+180), "Sync license" (+400), or "Open / Close a live stream" (0.05 tUSDC/s; Night Bus Home starts with one open at 0.02/s). Inflows come from outside payers, so they need no signature. Each inflow: *pending* line right under the buttons ("Incoming… waiting for confirmation") → *confirmed*: meters jump, each counter rises by exactly its share, dust shown → *failed*: "Inflow reverted. Nothing was split." For interval works, confirmed inflows go to "Held until Friday 17:00" and "Release now" distributes them (pending/confirmed/failed). Crossing the bonus threshold shows "Bonus rule triggered: producer now 30%".
4. **Withdraw.** Overview → "Withdraw" → amount (all or custom, validated against claimable) → prompt → *pending* "Sending to your wallet…" → *confirmed* wallet balance up, ledger line / *failed* "Withdrawal failed. Your balance is untouched."
5. **Amend a split.** Work page → "Propose a change" → faders (100% rule) → "Send for signatures" → prompt → proposal *pending signatures* with each collaborator's status (signed / waiting); simulated co-signers sign over a few seconds → *confirmed* "New split active from 14:32:07; earnings before that stay as they were" / *failed*: with "A collaborator declines the next change" on, the last co-signer declines → "Declined by Sala Rossa. The current split stays." (a failed proposal transaction is also possible via "Fail the next transaction").

Context on demand: the channel strips link "How is this calculated?" to `/how-it-works#precision`; there are no explanatory paragraphs above forms.

## 7. Content (EN / FR)

Tone: plain, warm, a little musical, never hype. Short sentences. Money words are exact. French written natively (Québec-neutral register, "vous"), keeping "wallet"/"portefeuille", "on-chain", "tUSDC".

### Home

| Section | EN | FR |
|-|-|-|
| Hero | *see §3* | *voir §3* |
| Hero meter caption | Night Bus Home · 5 collaborators · paying continuously | Night Bus Home · 5 collaborateurs · versement continu |
| Wait title | The six-month wait, removed | Six mois d'attente en moins |
| Wait body | A stream in March still reaches most teams on a September statement. | Une écoute de mars arrive encore, pour la plupart des équipes, sur un relevé de septembre. |
| Timeline old | Stream → distributor → statement (90–180 days) → one account → spreadsheet → transfers | Écoute → distributeur → relevé (90 à 180 jours) → un seul compte → tableur → virements |
| Timeline new | Stream → royalty contract → every collaborator, in seconds | Écoute → contrat de redevances → chaque collaborateur, en quelques secondes |
| Steps title | Three moves, then it runs on its own | Trois gestes, puis ça roule tout seul |
| Step 1 | **Write the split sheet.** Who worked on it and their share. Faders keep it at exactly 100%. | **Rédigez la feuille de partage.** Qui a participé et pour quelle part. Les curseurs gardent le total à 100 %. |
| Step 2 | **Point your revenue at it.** Streams, sales and licenses pay the work's contract, not one person's account. | **Branchez-y vos revenus.** Écoutes, ventes et licences paient le contrat de l'œuvre, pas le compte d'une seule personne. |
| Step 3 | **Watch every meter rise.** Balances grow in real time. Everyone withdraws whenever they like. | **Regardez chaque vumètre monter.** Les soldes grandissent en temps réel. Chacun retire quand il veut. |
| Features title | Built for how creative money actually moves | Pensé pour la façon dont l'argent créatif circule vraiment |
| F: Continuous or weekly | Split every inflow the second it lands, or batch releases to save fees. | Partagez chaque entrée à la seconde, ou regroupez les versements pour économiser les frais. |
| F: Bonus rules | The producer gets five more points after a million plays. The contract does the math. | Cinq points de plus au réalisateur après un million d'écoutes. Le contrat fait le calcul. |
| F: Consent to change | A split changes only when everyone signs. Past earnings never move. | Un partage ne change que si tout le monde signe. Les gains passés ne bougent pas. |
| Who title | For teams paid in small amounts, all the time | Pour les équipes payées par petites sommes, tout le temps |
| Who: bands | Bands and their producers splitting streaming income | Groupes et réalisateurs qui partagent les revenus de streaming |
| Who: podcasts | Podcasts with co-hosts, editors and ad revenue | Balados avec coanimateurs, monteurs et revenus publicitaires |
| Who: collectives | Collectives and DAOs commissioning films, books and editions | Collectifs et DAO qui commandent films, livres et éditions |
| Closing | Your next royalty statement could be a live meter. · Open the studio | Votre prochain relevé de redevances pourrait être un vumètre en direct. · Ouvrir le studio |

**FAQ** (on `/how-it-works` only, 5 questions)

1. *Is this real money?* / *Est-ce de l'argent réel ?* — No. This is a testnet demo with simulated tUSDC and a simulated wallet. Nothing you do here moves real funds. / Non. C'est une démo sur réseau de test, avec des tUSDC et un portefeuille simulés. Rien ici ne déplace de vrais fonds.
2. *Do my collaborators need to do anything?* / *Mes collaborateurs doivent-ils faire quelque chose ?* — Only share a wallet address. They can watch their balance and withdraw whenever they want; they only sign again if someone proposes a change. / Seulement fournir une adresse de portefeuille. Ils suivent leur solde et retirent quand ils veulent ; ils ne signent de nouveau que si quelqu'un propose un changement.
3. *What happens to fractions of a cent?* / *Et les fractions de cent ?* — Shares are computed in integer micro-units. Any remainder is credited to the work's treasury recipient and shown in the ledger, so totals always reconcile. / Les parts sont calculées en micro-unités entières. Le reste est versé au destinataire « trésorerie » de l'œuvre et apparaît au registre : les totaux concordent toujours.
4. *Can a split change after release?* / *Peut-on modifier un partage après la sortie ?* — Yes, if every current collaborator signs the amendment. It applies from that second onward; past earnings never move. / Oui, si tous les collaborateurs actuels signent la modification. Elle s'applique à partir de ce moment ; les gains passés ne bougent pas.
5. *Continuous or weekly: which should I pick?* / *Continu ou hebdomadaire : que choisir ?* — Continuous if you want everyone to see money land live. Weekly if inflows are tiny and you'd rather batch network fees. / Continu si vous voulez que tout le monde voie l'argent arriver en direct. Hebdomadaire si les montants sont minuscules et que vous préférez regrouper les frais de réseau.

### App (key strings)

| Key | EN | FR |
|-|-|-|
| Gate title | Step into the studio | Entrez dans le studio |
| Gate body | Connect the demo wallet to see Noor Haddad's works and live balances. | Connectez le portefeuille de démo pour voir les œuvres de Noor Haddad et ses soldes en direct. |
| Connect | Connect demo wallet | Connecter le portefeuille de démo |
| Rejected | You declined the connection. Nothing was shared. | Vous avez refusé la connexion. Rien n'a été partagé. |
| Overview title | Earning now | En ce moment |
| Claimable | Claimable | Disponible |
| Withdraw | Withdraw | Retirer |
| Empty works | No works yet. Write your first split sheet and your meters will start here. | Aucune œuvre pour l'instant. Rédigez votre première feuille de partage et vos vumètres démarreront ici. |
| New title | New split sheet | Nouvelle feuille de partage |
| 100% rule | Shares must add up to exactly 100%. Now at {total}%. | Les parts doivent totaliser exactement 100 %. Total actuel : {total} %. |
| Deploy | Deploy contract | Déployer le contrat |
| Deploy pending | Deploying royalty contract… | Déploiement du contrat de redevances… |
| Deploy failed | Deployment reverted: no contract was created and no fee was taken. | Déploiement annulé : aucun contrat n'a été créé et aucuns frais n'ont été prélevés. |
| Inflow pending | Incoming… waiting for confirmation | Entrée en cours… en attente de confirmation |
| Inflow failed | Inflow reverted. Nothing was split. | Entrée annulée. Rien n'a été partagé. |
| Held | Held until {when} | Retenu jusqu'à {when} |
| Release | Release now | Verser maintenant |
| Withdraw pending | Sending to your wallet… | Envoi vers votre portefeuille… |
| Withdraw failed | Withdrawal failed. Your balance is untouched. | Le retrait a échoué. Votre solde est intact. |
| Amend declined | Declined by {name}. The current split stays. | Refusé par {name}. Le partage actuel reste en place. |
| Ledger empty | Nothing matches these filters. | Rien ne correspond à ces filtres. |
| Work not found | We couldn't find that work. It may have been removed when the demo was reset. | Œuvre introuvable. Elle a peut-être été supprimée à la réinitialisation de la démo. |
| Reset | Reset demo | Réinitialiser la démo |
| 404 | This track isn't on the record. · Back home · Open the studio | Cette piste n'est pas au registre. · Accueil · Ouvrir le studio |

The full copy lives in `src/i18n/dictionaries/{en,fr}.ts`, which is the source of truth for every visible string.

## 8. Aesthetics

**Concept: "Analog desk, live ledger."** Warm, precise, live, unpretentious. Creators already think in split sheets, channels, faders and meters; a recording desk is the one place where "many inputs, mixed in exact proportions, in real time" is second nature. Giving money the look of a mixing console (bone-paper panels, silkscreen labels, segmented meters, mono counters) makes real-time distribution feel familiar and trustworthy instead of "crypto". It also sets the product clearly apart from payment-splitting tools: this is about *streams*, not single transactions.

**Palette.** Brushed-aluminium panels and ink by day, a dark studio by night, with one colour doing the talking: **oxblood**, the red of a REC light and a velvet studio curtain. Brass (knob caps, meter ticks) is the secondary. The "desk" modules (hero meter bridge, claimable counter, channel strips, closing band) stay dark ink in both themes, like hardware sitting on the page. Status colours are always paired with a text label and an icon.

| Role | Light | Dark |
|-|-|-|
| background | `#EFEDE8` | `#141210` |
| foreground | `#1A1714` | `#EEE7D9` |
| card / popover | `#F9F8F5` | `#1C1916` |
| primary | `#7C1D34` | `#E57A8E` |
| primary-foreground | `#FBF3EA` | `#1A0C10` |
| secondary / muted | `#E3E0D8` | `#27231F` |
| muted-foreground | `#57514A` | `#A99F8F` |
| accent | `#E6E1D5` | `#2E2924` |
| border | `#CFCAC0` | `#3A332C` |
| input (field borders, 3:1) | `#8F887C` | `#7A6F62` |
| ring | `#7C1D34` | `#E57A8E` |
| destructive (+fg) | `#B42318` / `#FFFFFF` | `#F08070` / `#1A0C0A` |
| success (confirmed) | `#2D6A3A` | `#7CC48A` |
| warning (pending/held) | `#8A5500` | `#E2B45C` |
| brass (text) | `#7A5C24` | `#D2A860` |
| chart-1 … chart-5 | `#A8324F` `#B07D1C` `#0B7FA0` `#5F6B2A` `#4B4038` | `#D9607A` `#B8862A` `#00A3AD` `#A9B96A` `#B9A99A` |

WCAG contrast (computed): light: foreground/background 15.26, foreground/card 16.81, muted-fg/background 6.69, muted-fg/muted 5.94, muted-fg/card 7.38, primary-fg/primary 9.18, primary/background 8.62, destructive-fg/destructive 6.57, destructive/background 5.62, success/background 5.55, warning/background 5.31, brass/background 5.30, foreground/accent 13.68. Dark: foreground/background 15.19, foreground/card 14.22, muted-fg/background 7.16, muted-fg/muted 5.97, primary-fg/primary 6.80, primary/background 6.68, destructive-fg/destructive 7.29, success/background 9.01, warning/background 9.71, brass/background 8.46, foreground/accent 11.70. Focus ring (primary) vs background: 8.62 / 6.68. Desk modules (`#1A1714`, dark theme `#211D19`): text `#EEE7D9` 14.51 / 13.61, muted `#A99F8F` 6.84 / 6.41, brass `#D2A860` 8.08 / 7.58, rose `#E57A8E` 6.38 / 5.98.

The chart order (chart-1…3, the three works) was checked with the dataviz palette validator in both modes: lightness band, chroma floor, colour-blind separation (worst adjacent ΔE 14.8 light / 8.4 dark), normal-vision floor (≥15) and ≥3:1 against the card surface all pass. Bars carry a legend with totals, so identity is never colour alone.

**Type.** Two families via `next/font`:
- **Archivo** (variable, with the width axis): UI and display. Headlines use a slightly expanded width (`font-stretch: 112%`) and weight 700–800, like console silkscreen and tape-box labels; body at 400/500 normal width. Small uppercase "silkscreen" labels at 11–12px, 600, letter-spacing .08em.
- **IBM Plex Mono** (400/500/600): every amount, rate, counter, address and hash, with tabular figures, so live counters never jitter.
- Scale: 12 / 14 / 16 / 18 / 22 / 28 / 36 / 48 / 60 (hero, desktop), line-height 1.05 for display, 1.55 for body.

**Logo.** A mark of four vertical meter bars of rising height inside a rounded square, the tallest one in oxblood (a live level) and the others ink; the wordmark "StreamRoyalties" in Archivo expanded 800 with "Royalties" in oxblood. Favicon: the mark alone (`src/app/icon.svg`).

**Shape.** Radius 6px (controls) and 10px (panels): machined, not bubbly. 1px borders everywhere, panels read as console modules separated by hairlines; depth only from a single inset line and a 1px "bevel" at the top of panels, no drop-shadow blur. Motion: meters move with a 120ms attack and 600ms release like a real VU meter; counters roll digit by digit; faders glide; everything obeys `prefers-reduced-motion`.

**Imagery.** Photography: candid people making work in real rooms (songwriting on a floor, a band mid-rehearsal, a desk at a live show), always rendered in black and white (CSS `grayscale`) so three photographers' colour grades read as one set of liner-notes photos next to the oxblood accents. Used only in "Who it's for", the how-it-works intro and credits. Illustration: none; diagrams are drawn in code as console-style line drawings (hairlines, silkscreen labels).

**Signature moments.**
1. **The meter bridge.** Inflows land and every channel meter jumps at once, each by exactly its share, while mono counters roll up by the micro-unit. Home hero and every work page.
2. **Faders that must reach unity.** Split editing (new split sheet and amendments) uses vertical channel faders with a "Master" bus meter that turns green only at exactly 100.00%; deploy and "Send for signatures" refuse anything else, and "Balance the rest" snaps the treasury fader to unity.
3. **The bonus kick.** When a live stream or an inflow pushes a work past its bonus threshold, a silkscreen "BONUS" lamp lights on the producer's strip, every share re-balances pro rata and the banner turns to "Bonus rule triggered".

**What we deliberately avoid.** Purple/blue gradients (the Lovable version's look, and generic "AI" styling); frosted glass; neon, cyber and glowing-coin imagery; 3D blobs; the default shadcn zinc look with big rounded cards; Monark orange. The warm paper + oxblood + brass palette and console vocabulary are specific to studio culture and should not be mistaken for a fintech dashboard.

## 9. Assets

| File | Purpose | Placement |
|-|-|-|
| `public/images/songwriter-notes.jpg` | A songwriter with headphones, writing on paper next to a laptop: the person a split sheet protects | Home "Who it's for" |
| `public/images/producer-console.jpg` | Engineer at a desk during a live show: the "desk" metaphor in real life | How it works intro |
| `public/images/band-room.jpg` | A band playing together in a small room: many collaborators, one work | Home "Who it's for" |

All three are shown in black and white (see Imagery) and also on `/credits`.

Details, sources and photographers: `docs/assets.md`, credited on `/credits`.

Icons: `lucide-react` (Music2, Mic, Film, BookOpen, Radio, Wallet, ArrowDownToLine, SlidersVertical, Check, X, Loader2, etc.).
Built in code: logo/favicon SVG; meter bridge; channel strip; vertical fader; statement timeline diagram; contract anatomy diagram; continuous vs interval diagram; 30-day bar chart (SVG, no chart library); Open Graph image (`opengraph-image.tsx`).

## 10. Pricing strategy

Independent product, so a real model:

- **Solo / Band: free.** Up to 3 active works and 8 collaborators per work. No platform fee on the first 10,000 tUSDC-equivalent distributed per year. Rationale: the target user is an independent team; distributors already take 10–20% or an annual fee, so being free at the bottom is the wedge.
- **Protocol fee: 0.5% of distributed revenue** above that, capped at 25 per inflow. Charged by the contract, visible on every ledger line. Aligns our revenue with creators' revenue, is far below admin-publishing commissions, and keeps small streams economical.
- **Label / Collective: 39/month** (or 390/year): unlimited works, interval release schedules, bulk split import, accountant exports, statements API, team roles. Fee drops to 0.3%.
- **Platforms (DSPs, marketplaces): custom.** Direct integration so revenue pays contracts at the source; volume pricing.

A designed `/pricing` page exists at `/en/pricing` and `/fr/pricing` for internal review only: never linked, `robots: { index: false, follow: false }`, excluded from `sitemap.xml`. No prices are mentioned anywhere else.

## 11. Out of scope

- Real chain, real wallet signing, real tokens, a backend or accounts. Everything is simulated in the browser (`src/lib/demo/`), persisted in `localStorage`.
- Real DSP or marketplace integrations, fiat on/off-ramp, tax forms, identity verification (KYC).
- Copyright registration, PRO/collecting-society integration, catalog metadata (ISRC/ISWC) validation.
- Legal enforceability of split sheets, dispute resolution.
- Multi-currency: all amounts are simulated tUSDC.
