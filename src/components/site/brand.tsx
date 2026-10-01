import { cn } from "@/lib/utils"

/** The StreamRoyalties mark: four meter bars rising, the tallest one live (oxblood). */
export function Mark({ className, title }: { className?: string; title?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={cn("size-7 shrink-0", className)}
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
    >
      <rect width="32" height="32" rx="7" className="fill-foreground" />
      <rect x="6" y="18" width="3.6" height="8" rx="1" className="fill-background" />
      <rect x="11.6" y="14" width="3.6" height="12" rx="1" className="fill-background" />
      <rect x="17.2" y="10" width="3.6" height="16" rx="1" className="fill-background" />
      <rect x="22.8" y="5" width="3.6" height="21" rx="1" fill="#e57a8e" />
    </svg>
  )
}

export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <Mark />
      <span className="wide text-[1.05rem] leading-none font-extrabold tracking-tight">
        Stream<span className="text-primary">Royalties</span>
      </span>
    </span>
  )
}
