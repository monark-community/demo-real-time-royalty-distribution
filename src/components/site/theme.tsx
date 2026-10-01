"use client"

import { MoonIcon, SunIcon } from "lucide-react"
import { ThemeProvider as NextThemes, useTheme } from "next-themes"
import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

export function ThemeProvider({ children }: { children: ReactNode }) {
  return (
    <NextThemes attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange storageKey="theme">
      {children}
    </NextThemes>
  )
}

export function ThemeToggle({ toDark, toLight, className }: { toDark: string; toLight: string; className?: string }) {
  const { resolvedTheme, setTheme } = useTheme()
  const isDark = resolvedTheme === "dark"
  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={cn(
        "inline-flex size-10 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground",
        className
      )}
    >
      {/* Both icons render; CSS picks one so the server and client markup match. */}
      <SunIcon className="hidden size-[1.1rem] dark:block" aria-hidden />
      <MoonIcon className="size-[1.1rem] dark:hidden" aria-hidden />
      <span className="sr-only">
        <span className="dark:hidden">{toDark}</span>
        <span className="hidden dark:inline">{toLight}</span>
      </span>
    </button>
  )
}
