import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import {
  Users,
  Package,
  ArrowUpRight,
  TrendingUp,
  AlertCircle,
  ShoppingCart,
  Dumbbell,
  Dices,
} from "lucide-react"

interface StatCardProps {
  title: string
  value: string | number
  description?: string
  icon: React.ElementType
  trend?: string
  status?: "success" | "warning" | "danger" | "neutral"
  variant?: "default" | "compact" | "gradient"
  className?: string
  onClick?: () => void
}

const iconMap = {
  Users,
  Package,
  ArrowUpRight,
  TrendingUp,
  AlertCircle,
  ShoppingCart,
  Dumbbell,
  Dices,
}

const statusColors = {
  success: "text-emerald-600 bg-emerald-100",
  warning: "text-amber-600 bg-amber-100",
  danger: "text-rose-600 bg-rose-100",
  neutral: "text-slate-600 bg-slate-100",
}

const gradientColors = {
  default: "from-slate-800 to-slate-900",
  success: "from-emerald-500 to-emerald-600",
  warning: "from-amber-500 to-amber-600",
  danger: "from-rose-500 to-rose-600",
}

export function StatCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  status = "neutral",
  variant = "default",
  className = "",
  onClick,
}: StatCardProps) {
  const IconComponent = Icon in iconMap ? iconMap[Icon as keyof typeof iconMap] : Icon
  const statusColor = statusColors[status]
  const gradientColor = gradientColors[status]

  const baseClasses = "relative overflow-hidden group rounded-xl transition-all duration-300 ease-in-out hover:-translate-y-0.5 border border-white/10"
  const variantClasses = {
    default: "bg-card",
    compact: "bg-card p-4",
    gradient: `bg-gradient-to-br ${gradientColor} text-white`,
  }

  const statusIndicatorClasses = {
    success: "text-emerald-400",
    warning: "text-amber-400",
    danger: "text-rose-400",
    neutral: "text-slate-400",
  }

  return (
    <Card
      className={cn(baseClasses, variantClasses[variant], className)}
      onClick={onClick}
    >
      {/* Subtle background pattern for gradient variant */}
      {variant === "gradient" && (
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-8 -mt-8 pointer-events-none" />
      )}

      <CardContent className="flex items-center justify-between relative z-10 p-4">
        <div className="flex items-center gap-3">
          {/* Icon Container */}
          <div className={cn("p-2 rounded-lg", statusColor)}>
            <IconComponent className="h-5 w-5" />
          </div>

          <div>
            {/* Title */}
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
              {title}
            </p>

            {/* Value */}
            <h3 className="text-2xl font-bold font-heading">
              {value}
            </h3>

            {/* Description & Trend */}
            {(description || trend) && (
              <div className="flex items-center gap-2 mt-2">
                {trend && (
                  <div className="flex items-center gap-0.5 text-xs font-medium">
                    <ArrowUpRight className="h-4 w-4" />
                    <span>{trend}</span>
                  </div>
                )}
                {description && (
                  <span className="text-xs text-muted-foreground">
                    {description}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Visual Indicator for gradient variant */}
        {variant === "gradient" && (
          <div className={cn("opacity-20", statusIndicatorClasses[status])}>
            <IconComponent className="h-10 w-10" />
          </div>
        )}
      </CardContent>
    </Card>
  )
}