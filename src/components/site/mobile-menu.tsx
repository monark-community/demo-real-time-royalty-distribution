"use client"

import { MenuIcon } from "lucide-react"
import { usePathname } from "next/navigation"
import { useState, type ReactNode } from "react"

import { Sheet, SheetContent, SheetDescription, SheetTitle, SheetTrigger } from "@/components/ui/sheet"

import { NavLinks, type NavItem } from "./nav-links"

export function MobileMenu({
  items,
  openLabel,
  closeLabel,
  title,
  children,
}: {
  items: NavItem[]
  openLabel: string
  closeLabel: string
  title: string
  children?: ReactNode
}) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const [lastPath, setLastPath] = useState(pathname)
  // Close the sheet when navigation happens.
  if (pathname !== lastPath) {
    setLastPath(pathname)
    if (open) setOpen(false)
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          type="button"
          className="inline-flex size-10 items-center justify-center rounded-md text-foreground hover:bg-accent md:hidden"
        >
          <MenuIcon className="size-5" aria-hidden />
          <span className="sr-only">{openLabel}</span>
        </button>
      </SheetTrigger>
      <SheetContent side="right" closeLabel={closeLabel} className="flex w-full max-w-none flex-col gap-6 p-5 pt-16 sm:max-w-sm">
        <SheetTitle className="sr-only">{title}</SheetTitle>
        <SheetDescription className="sr-only">{title}</SheetDescription>
        <nav aria-label={title}>
          <NavLinks items={items} vertical />
        </nav>
        <div className="mt-auto flex flex-col gap-4 border-t pt-5">{children}</div>
      </SheetContent>
    </Sheet>
  )
}
