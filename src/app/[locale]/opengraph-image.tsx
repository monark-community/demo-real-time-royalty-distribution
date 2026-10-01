import { ImageResponse } from "next/og"

import { isLocale, locales } from "@/i18n/config"
import { getDictionary } from "@/i18n"

export const alt = "StreamRoyalties"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

const PANEL = "#efede8"
const INK = "#1a1714"
const OXBLOOD = "#7c1d34"
const ROSE = "#e57a8e"
const BRASS = "#d2a860"
const OFF = "#312b25"

const CHANNELS = [
  { name: "Noor", pct: "35%", lit: 11 },
  { name: "Théo", pct: "25%", lit: 9 },
  { name: "Ama", pct: "20%", lit: 8 },
  { name: "Rui", pct: "10%", lit: 6 },
  { name: "Band", pct: "10%", lit: 6 },
]

export default async function OpenGraphImage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params
  const locale = isLocale(raw) ? raw : "en"
  const d = getDictionary(locale)

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: PANEL, color: INK, padding: 60 }}>
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", width: 600 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <svg width="48" height="48" viewBox="0 0 32 32">
              <rect width="32" height="32" rx="7" fill={INK} />
              <rect x="6" y="18" width="3.6" height="8" rx="1" fill={PANEL} />
              <rect x="11.6" y="14" width="3.6" height="12" rx="1" fill={PANEL} />
              <rect x="17.2" y="10" width="3.6" height="16" rx="1" fill={PANEL} />
              <rect x="22.8" y="5" width="3.6" height="21" rx="1" fill={ROSE} />
            </svg>
            <span style={{ fontSize: 40, fontWeight: 800, display: "flex" }}>
              Stream<span style={{ color: OXBLOOD }}>Royalties</span>
            </span>
          </div>
          <div style={{ fontSize: 64, lineHeight: 1.04, fontWeight: 800, letterSpacing: -2 }}>{d.home.title}</div>
          <div style={{ fontSize: 22, color: "#57514a" }}>{d.common.demoBadge}</div>
        </div>
        <div
          style={{
            marginLeft: 44,
            flex: 1,
            display: "flex",
            flexDirection: "column",
            background: INK,
            borderRadius: 18,
            color: "#eee7d9",
            padding: 24,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 18, color: BRASS, letterSpacing: 2 }}>
            <span>NIGHT BUS HOME</span>
            <span style={{ color: ROSE }}>● LIVE</span>
          </div>
          <div style={{ display: "flex", flex: 1, justifyContent: "space-between", marginTop: 22 }}>
            {CHANNELS.map((c) => (
              <div key={c.name} style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 70 }}>
                <div style={{ display: "flex", flexDirection: "column-reverse", gap: 4, height: 300 }}>
                  {Array.from({ length: 14 }, (_, s) => (
                    <div
                      key={s}
                      style={{
                        width: 26,
                        height: 17,
                        borderRadius: 3,
                        background: s < c.lit ? (s >= 11 ? ROSE : BRASS) : OFF,
                      }}
                    />
                  ))}
                </div>
                <span style={{ marginTop: 12, fontSize: 16, color: BRASS }}>{c.pct}</span>
                <span style={{ fontSize: 20, fontWeight: 700 }}>{c.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
    size
  )
}
