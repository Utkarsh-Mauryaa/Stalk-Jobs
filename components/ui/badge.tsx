import * as React from "react"
import { cn } from "@/lib/utils"

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "applied" | "ongoing" | "ghosted" | "rejected" | "default"
}

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  const variants = {
    default: "bg-canvas-soft text-body border-hairline",
    applied: "bg-link/10 text-link border-link/20",
    ongoing: "bg-warning/10 text-warning border-warning/20",
    ghosted: "bg-mute/10 text-mute border-mute/20",
    rejected: "bg-error/10 text-error border-error/20",
  }

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium transition-colors",
        variants[variant],
        className
      )}
      {...props}
    />
  )
}
