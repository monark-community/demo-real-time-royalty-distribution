import { intlLocale, type Locale } from "@/i18n/config"
import { MICRO } from "@/lib/demo/math"

/** "1,234.56" (en) / "1 234,56" (fr) from micro-units. */
export function tokens(micro: number, locale: Locale, digits = 2): string {
  return new Intl.NumberFormat(intlLocale[locale], {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(Math.floor((micro / MICRO) * 10 ** digits) / 10 ** digits)
}

export function tokensWithUnit(micro: number, locale: Locale, digits = 2): string {
  return `${tokens(micro, locale, digits)} tUSDC`
}

/** Basis points as a percent: 3500 -> "35%" / "35 %", 3333 -> "33.33%". */
export function percent(bps: number, locale: Locale, digits?: number): string {
  const d = digits ?? (bps % 100 === 0 ? 0 : 2)
  return new Intl.NumberFormat(intlLocale[locale], {
    style: "percent",
    minimumFractionDigits: d,
    maximumFractionDigits: d,
  }).format(bps / 10_000)
}

export function integer(n: number, locale: Locale): string {
  return new Intl.NumberFormat(intlLocale[locale]).format(Math.floor(n))
}

export function dateTime(time: number, locale: Locale): string {
  return new Intl.DateTimeFormat(intlLocale[locale], {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(time)
}

export function dayLabel(time: number, locale: Locale): string {
  return new Intl.DateTimeFormat(intlLocale[locale], { month: "short", day: "numeric" }).format(time)
}

export function clock(time: number, locale: Locale): string {
  return new Intl.DateTimeFormat(intlLocale[locale], { hour: "2-digit", minute: "2-digit", second: "2-digit" }).format(time)
}

export function weekdayTime(time: number, locale: Locale): string {
  return new Intl.DateTimeFormat(intlLocale[locale], { weekday: "long", hour: "2-digit", minute: "2-digit" }).format(time)
}

export function relative(time: number, now: number, locale: Locale): string {
  const rtf = new Intl.RelativeTimeFormat(intlLocale[locale], { numeric: "auto" })
  const diff = Math.round((time - now) / 1000)
  const abs = Math.abs(diff)
  if (abs < 45) return rtf.format(diff, "second")
  if (abs < 2_700) return rtf.format(Math.round(diff / 60), "minute")
  if (abs < 79_200) return rtf.format(Math.round(diff / 3_600), "hour")
  return rtf.format(Math.round(diff / 86_400), "day")
}

export function shortAddress(address: string, start = 6, end = 4): string {
  if (address.length <= start + end + 1) return address
  return `${address.slice(0, start)}…${address.slice(-end)}`
}
