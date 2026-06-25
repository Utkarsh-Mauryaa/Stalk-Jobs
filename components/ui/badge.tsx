import * as React from "react"
import { cn } from "@/lib/utils"

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "applied" | "ongoing" | "ghosted" | "rejected" | "default"
}

export function Badge({ className, variant = "default", children, ...props }: BadgeProps) {
  const variants = {
    default: "bg-canvas-soft text-body border-hairline",
    applied: "bg-link/[0.06] text-link border-link/20",
    ongoing: "bg-warning/[0.06] text-warning border-warning/20",
    ghosted: "bg-mute/[0.06] text-mute border-mute/20",
    rejected: "bg-error/[0.06] text-error border-error/20",
  }

  const dots = {
    default: "bg-body/50",
    applied: "bg-link",
    ongoing: "bg-warning",
    ghosted: "bg-mute",
    rejected: "bg-error",
  }

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors",
        variants[variant],
        className
      )}
      {...props}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", dots[variant])} />
      {children}
    </div>
  )
}
