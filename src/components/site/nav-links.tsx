"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { cn } from "@/lib/utils"

export interface NavItem {
  href: string
  label: string
  /** Match nested routes too (e.g. /app/*). */
  prefix?: boolean
}

export function isActive(pathname: string, item: NavItem) {
  return item.prefix ? pathname === item.href || pathname.startsWith(`${item.href}/`) : pathname === item.href
}

export function NavLinks({ items, className, vertical = false }: { items: NavItem[]; className?: string; vertical?: boolean }) {
  const pathname = usePathname() ?? ""
  return (
    <ul className={cn("flex", vertical ? "flex-col gap-1" : "items-center gap-1", className)}>
      {items.map((item) => {
        const active = isActive(pathname, item)
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "inline-flex items-center rounded-md font-medium transition-colors",
                vertical ? "h-12 w-full px-3 text-lg" : "h-9 px-3 text-sm",
                active ? "bg-foreground text-background" : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              {item.label}
            </Link>
          </li>
        )
      })}
    </ul>
  )
}
