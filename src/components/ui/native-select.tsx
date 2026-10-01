import { ChevronDownIcon } from "lucide-react"
import type { ComponentProps } from "react"

import { cn } from "@/lib/utils"

/** Native <select> with its own chevron, inset from the edge like the other inputs' padding. */
export function NativeSelect({ className, wrapperClassName, ...props }: ComponentProps<"select"> & { wrapperClassName?: string }) {
  return (
    <div className={cn("relative", wrapperClassName)}>
      <select
        className={cn(
          "h-10 w-full appearance-none rounded-md border border-input bg-background pr-10 pl-3 text-sm focus-visible:outline-2 focus-visible:outline-ring disabled:opacity-60 aria-[invalid=true]:border-destructive",
          className
        )}
        {...props}
      />
      <ChevronDownIcon aria-hidden className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground" />
    </div>
  )
}
