// Visual check of every page and key flow with Playwright.
// Usage: pnpm build && pnpm start        (serves on port 3151)
//        pnpm screenshots                (BASE_URL defaults to http://localhost:3151)
// Output: docs/screenshots/<locale>-<width>-<theme>-<name>.png
import { mkdir } from "node:fs/promises"
import { fileURLToPath } from "node:url"
import { chromium } from "playwright"

const BASE = process.env.BASE_URL ?? "http://localhost:3151"
const OUT = fileURLToPath(new URL("../docs/screenshots/", import.meta.url))
const ONLY = process.env.ONLY ?? process.argv[2] // optional filter on the variant tag, e.g. "en-390-light"

const sizes = { 390: { width: 390, height: 844 }, 1440: { width: 1440, height: 900 } }
const variants = []
for (const w of [390, 1440]) for (const theme of ["light", "dark"]) variants.push({ locale: "en", w, theme })
// French: home page and one key flow, both widths, light.
for (const w of [390, 1440]) variants.push({ locale: "fr", w, theme: "light" })

const L = {
  en: {
    connect: "Connect demo wallet",
    connectBtn: "Connect",
    confirm: "Confirm",
    reject: "Reject",
    overview: "Earning now",
    send: /1,000 streams on Tidewave/,
    split: /split between 5 collaborators/,
    withdraw: "Withdraw",
    withdrawn: /is in your wallet/,
  },
  fr: {
    connect: "Connecter le portefeuille de démo",
    connectBtn: "Connecter",
    confirm: "Confirmer",
    reject: "Refuser",
    overview: "En ce moment",
    send: /1 000 écoutes sur Tidewave/,
    split: /partagés entre 5 collaborateurs/,
    withdraw: "Retirer",
    withdrawn: /est dans votre portefeuille/,
  },
}

async function newPage(browser, { locale, w, theme }) {
  const context = await browser.newContext({
    viewport: sizes[w],
    colorScheme: theme,
    locale: locale === "fr" ? "fr-CA" : "en-CA",
    reducedMotion: "no-preference",
    acceptDownloads: true,
  })
  await context.addInitScript((t) => {
    try {
      window.localStorage.setItem("theme", t)
    } catch {}
  }, theme)
  const page = await context.newPage()
  page.on("pageerror", (e) => console.log("  ! page error:", e.message))
  return { context, page }
}

const shot = async (page, v, name, fullPage = false) => {
  const path = `${OUT}${v.locale}-${v.w}-${v.theme}-${name}.png`
  const sw = await page.evaluate(() => document.documentElement.scrollWidth)
  if (sw > sizes[v.w].width) console.log(`  ! horizontal scroll on ${name}: ${sw}px`)
  if (fullPage) {
    await page.evaluate(() => window.scrollTo(0, 0))
    const height = await page.evaluate(() => document.documentElement.scrollHeight)
    await page.setViewportSize({ width: sizes[v.w].width, height: Math.max(height, sizes[v.w].height) })
    await page.waitForTimeout(500)
    await page.screenshot({ path })
    await page.setViewportSize(sizes[v.w])
  } else {
    await page.waitForTimeout(300)
    await page.screenshot({ path })
  }
  console.log("  ✓", `${v.locale}-${v.w}-${v.theme}-${name}`)
}

const main = (page) => page.getByRole("main")
const dialog = (page) => page.getByRole("dialog").last()
const go = (page, v, path) => page.goto(`${BASE}/${v.locale}${path}`, { waitUntil: "networkidle" })
const confirm = async (page, v) => {
  await dialog(page).waitFor()
  await dialog(page).getByRole("button", { name: L[v.locale].confirm, exact: true }).click()
}
const control = async (page, name) => {
  await page.getByRole("button", { name: "Demo controls" }).click()
  await dialog(page).getByRole("switch", { name }).click()
  await page.keyboard.press("Escape")
  await page.waitForTimeout(300)
}
const failNext = (page) => control(page, "Fail the next transaction")
const center = (locator) => locator.evaluate((el) => el.scrollIntoView({ block: "center" }))

async function connect(page, v, capture) {
  await go(page, v, "/app")
  const btn = main(page).getByRole("button", { name: L[v.locale].connect })
  await btn.waitFor()
  if (capture) await shot(page, v, "flow1-01-gate", true)
  await btn.click()
  await dialog(page).waitFor()
  if (capture) {
    await shot(page, v, "flow1-02-connect-prompt")
    await dialog(page).getByRole("button", { name: L[v.locale].reject, exact: true }).click()
    await page.getByRole("alert").first().waitFor()
    await shot(page, v, "flow1-03-connect-rejected")
    await btn.click()
  }
  await dialog(page).getByRole("button", { name: L[v.locale].connectBtn, exact: true }).click()
  await page.getByRole("heading", { level: 1, name: L[v.locale].overview }).waitFor({ timeout: 10000 })
  await page.waitForTimeout(800)
}

async function marketing(page, v) {
  for (const [name, path] of [
    ["home", ""],
    ["how-it-works", "/how-it-works"],
    ["credits", "/credits"],
    ["pricing", "/pricing"],
    ["404", "/this-page-does-not-exist"],
  ]) {
    await go(page, v, path)
    await page.waitForTimeout(name === "home" ? 3500 : 600)
    await shot(page, v, `page-${name}`, true)
  }
  if (v.w < 768) {
    await go(page, v, "")
    await page.getByRole("button", { name: "Open menu" }).click()
    await dialog(page).waitFor()
    await shot(page, v, "page-mobile-menu")
  }
}

async function appFlows(page, v) {
  // Flow 1: connect (gate, prompt, rejected) and the overview
  await connect(page, v, true)
  await shot(page, v, "flow1-04-overview", true)

  // Flow 3: revenue through Night Bus Home (pending, confirmed, bonus, failed)
  await go(page, v, "/app/works/night-bus-home")
  await page.waitForTimeout(1200)
  await shot(page, v, "flow3-01-work", true)
  const send = page.getByRole("button", { name: /1,000 streams on Tidewave/ })
  await send.click()
  await page.getByText("Incoming… waiting for confirmation").first().waitFor()
  await center(page.getByText("Incoming… waiting for confirmation").first())
  await shot(page, v, "flow3-02-inflow-pending")
  await page.getByText(/split between 5 collaborators/).first().waitFor({ timeout: 10000 })
  await center(page.getByRole("region", { name: "Channels" }))
  await page.waitForTimeout(200)
  await shot(page, v, "flow3-03-inflow-split")
  await send.click()
  await send.click()
  await page.getByText(/Bonus rule triggered/).waitFor({ timeout: 12000 })
  await page.waitForTimeout(600)
  await page.evaluate(() => window.scrollTo(0, 0))
  await shot(page, v, "flow3-04-bonus-triggered")
  await failNext(page)
  await send.click()
  await page.getByText("Inflow reverted. Nothing was split.").waitFor({ timeout: 10000 })
  await center(page.getByText("Inflow reverted. Nothing was split."))
  await shot(page, v, "flow3-05-inflow-failed")

  // Flow 3b: interval release on the weekly podcast
  await go(page, v, "/app/works/fieldnotes-s2")
  await page.getByRole("button", { name: /Host-read ad/ }).click()
  await page.getByText(/is held until the next release/).waitFor({ timeout: 10000 })
  await page.getByRole("button", { name: "Release now" }).click()
  await dialog(page).waitFor()
  await shot(page, v, "flow3-06-release-prompt")
  await confirm(page, v)
  await page.getByText("Releasing held revenue…").waitFor()
  await center(page.getByText("Releasing held revenue…"))
  await shot(page, v, "flow3-07-release-pending")
  await page.getByText(/released and split/).waitFor({ timeout: 10000 })
  await center(page.getByText(/released and split/))
  await shot(page, v, "flow3-08-released")

  // Flow 4: withdraw (validation, prompt, failed, confirmed)
  await go(page, v, "/app")
  await failNext(page)
  await page.getByRole("button", { name: "Withdraw", exact: true }).click()
  await dialog(page).waitFor()
  await dialog(page).getByLabel("Amount").fill("999999")
  await dialog(page).getByRole("button", { name: "Withdraw", exact: true }).click()
  await shot(page, v, "flow4-01-withdraw-error")
  await dialog(page).getByLabel("Amount").fill("250")
  await dialog(page).getByRole("button", { name: "Withdraw", exact: true }).click()
  await page.waitForTimeout(400)
  await shot(page, v, "flow4-02-withdraw-prompt")
  await confirm(page, v)
  await page.getByText("Sending to your wallet…").waitFor()
  await shot(page, v, "flow4-03-withdraw-pending")
  await page.getByText("Withdrawal failed. Your balance is untouched.").waitFor({ timeout: 10000 })
  await shot(page, v, "flow4-04-withdraw-failed")
  await dialog(page).getByRole("button", { name: "Withdraw", exact: true }).click()
  await confirm(page, v)
  await page.getByText(/is in your wallet/).waitFor({ timeout: 10000 })
  await shot(page, v, "flow4-05-withdrawn")
  await page.keyboard.press("Escape")

  // Flow 2: write a split sheet and deploy (errors, filled, failed, confirmed)
  await go(page, v, "/app/new")
  await page.getByRole("button", { name: "Deploy contract" }).click()
  await page.waitForTimeout(300)
  await shot(page, v, "flow2-01-builder-errors", true)
  await page.getByRole("button", { name: "Fill an example" }).click()
  await page.waitForTimeout(300)
  await shot(page, v, "flow2-02-builder-filled", true)
  await center(page.getByText("Master").first())
  await shot(page, v, "flow2-03-faders")
  await failNext(page)
  await page.getByRole("button", { name: "Deploy contract" }).click()
  await dialog(page).waitFor()
  await shot(page, v, "flow2-04-deploy-prompt")
  await confirm(page, v)
  await page.getByText("Deploying royalty contract…").waitFor()
  await center(page.getByText("Deploying royalty contract…"))
  await shot(page, v, "flow2-05-deploy-pending")
  await page.getByText(/Deployment reverted/).waitFor({ timeout: 10000 })
  await center(page.getByText(/Deployment reverted/))
  await shot(page, v, "flow2-06-deploy-failed")
  await page.getByRole("button", { name: "Deploy contract" }).click()
  await confirm(page, v)
  await page.getByText(/Contract live at/).waitFor({ timeout: 10000 })
  await center(page.getByText(/Contract live at/))
  await shot(page, v, "flow2-07-deployed")
  await page.waitForURL(/\/app\/works\/paper-lanterns/, { timeout: 15000 })
  await page.waitForTimeout(800)
  await shot(page, v, "flow2-08-new-work", true)

  // Flow 5: amend a split (applied, then declined)
  await go(page, v, "/app/works/live-at-sala-rossa")
  await page.getByRole("button", { name: "Propose a change" }).click()
  const slider = page.getByRole("slider", { name: "Share for Camille" })
  await slider.focus()
  for (let i = 0; i < 4; i += 1) await page.keyboard.press("ArrowDown")
  await center(page.getByText("Master").first())
  await shot(page, v, "flow5-01-amend-unbalanced")
  await page.getByRole("button", { name: "Balance the rest" }).click()
  await page.getByRole("button", { name: "Send for signatures" }).click()
  await confirm(page, v)
  await page.getByText("Waiting for signatures").waitFor({ timeout: 10000 })
  await center(page.getByText("Waiting for signatures"))
  await page.waitForTimeout(1500)
  await shot(page, v, "flow5-02-collecting")
  await page.getByText(/New split active from/).waitFor({ timeout: 20000 })
  await center(page.getByText(/New split active from/))
  await shot(page, v, "flow5-03-applied")
  await control(page, "A collaborator declines the next change")
  await page.getByRole("button", { name: "Propose a change" }).click()
  await page.getByRole("slider", { name: "Share for Noor" }).focus()
  await page.keyboard.press("ArrowUp")
  await page.getByRole("slider", { name: "Share for Sala" }).focus()
  await page.keyboard.press("ArrowDown")
  await page.getByRole("button", { name: "Send for signatures" }).click()
  await confirm(page, v)
  await page.getByText(/Declined by/).first().waitFor({ timeout: 20000 })
  await center(page.getByText(/Declined by/).first())
  await shot(page, v, "flow5-04-declined")

  // Ledger, filters, empty state, demo controls
  await go(page, v, "/app/ledger")
  await shot(page, v, "app-ledger", true)
  await page.getByLabel("Work").selectOption("paper-lanterns")
  await page.getByLabel("Type").selectOption("withdraw")
  await shot(page, v, "app-ledger-empty")
  await page.getByRole("button", { name: "Demo controls" }).click()
  await dialog(page).waitFor()
  await shot(page, v, "app-demo-controls")
}

async function frenchFlow(page, v) {
  await go(page, v, "")
  await page.waitForTimeout(3500)
  await shot(page, v, "page-home", true)
  await connect(page, v, false)
  await shot(page, v, "flow1-04-overview", true)
  await go(page, v, "/app/works/night-bus-home")
  await page.getByRole("button", { name: L.fr.send }).click()
  await page.getByText(L.fr.split).first().waitFor({ timeout: 10000 })
  await page.waitForTimeout(300)
  await shot(page, v, "flow3-03-inflow-split", true)
  await go(page, v, "/app/new")
  await page.getByRole("button", { name: "Remplir un exemple" }).click()
  await shot(page, v, "flow2-02-builder-filled", true)
}

const browser = await chromium.launch()
await mkdir(OUT, { recursive: true })
for (const v of variants) {
  const tag = `${v.locale}-${v.w}-${v.theme}`
  if (ONLY && !tag.includes(ONLY)) continue
  console.log(tag)
  const { context, page } = await newPage(browser, v)
  try {
    if (v.locale === "fr") await frenchFlow(page, v)
    else {
      await marketing(page, v)
      await appFlows(page, v)
    }
  } catch (e) {
    console.error("  ✗", tag, e.message)
    await page.screenshot({ path: `${OUT}_error-${tag}.png` }).catch(() => {})
    process.exitCode = 1
  }
  await context.close()
}
await browser.close()
