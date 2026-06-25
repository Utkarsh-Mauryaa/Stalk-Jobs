import * as React from "react"
import { cn } from "@/lib/utils"

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "outline" | "destructive"
  size?: "sm" | "md" | "lg" | "icon"
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    const variants = {
      primary: "bg-ink text-canvas hover:bg-ink/90",
      secondary: "bg-canvas text-ink border border-hairline hover:bg-canvas-soft",
      ghost: "hover:bg-canvas-soft text-body hover:text-ink",
      outline: "bg-transparent border border-hairline hover:border-hairline-strong text-ink",
      destructive: "bg-error text-canvas hover:bg-error/90 focus-visible:ring-error/20",
    }

    const sizes = {
      sm: "h-7 px-3 text-xs rounded-sm",
      md: "h-10 px-4 text-sm rounded-pill",
      lg: "h-12 px-6 text-base rounded-pill",
      icon: "h-8 w-8 rounded-sm p-0",
    }

    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 cursor-pointer",
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"
