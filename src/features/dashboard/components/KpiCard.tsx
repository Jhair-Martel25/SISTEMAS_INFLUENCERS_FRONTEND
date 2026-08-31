import type { LucideIcon } from "lucide-react"

import { cn } from "@/lib/utils"

interface KpiCardProps {
  icon: LucideIcon
  label: string
  value: number
  accent?: "primary" | "mint"
}

export function KpiCard({
  icon: Icon,
  label,
  value,
  accent = "primary",
}: KpiCardProps) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-4">
      <div
        className={cn(
          "flex size-10 shrink-0 items-center justify-center rounded-lg",
          accent === "mint"
            ? "bg-mint/15 text-mint"
            : "bg-primary/10 text-primary",
        )}
      >
        <Icon size={20} />
      </div>
      <div className="min-w-0">
        <p className="truncate text-xs text-muted-foreground">{label}</p>
        <p className="font-heading text-2xl font-semibold text-foreground">
          {value}
        </p>
      </div>
    </div>
  )
}