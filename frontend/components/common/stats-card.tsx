import React from "react"
import { LucideIcon } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"

interface StatsCardProps {
    title: string
    value: string | number
    icon: LucideIcon
    description?: string
    trend?: string
    loading?: boolean
    variant?: "default" | "success" | "warning" | "info" | "error"
    className?: string
}

const variantStyles = {
    default: {
        iconBg: "bg-gradient-to-br from-primary/25 via-primary/20 to-primary/15 shadow-lg shadow-primary/20",
        iconColor: "text-primary",
        gradient: "from-primary/8 via-primary/4 to-transparent",
        borderGlow: "border-primary/30",
        glow: "shadow-[0_0_30px_hsl(var(--primary)/0.2)]",
    },
    success: {
        iconBg: "bg-gradient-to-br from-success/25 via-success/20 to-success/15 shadow-lg shadow-success/20",
        iconColor: "text-success",
        gradient: "from-success/8 via-success/4 to-transparent",
        borderGlow: "border-success/30",
        glow: "shadow-[0_0_30px_hsl(var(--success)/0.2)]",
    },
    warning: {
        iconBg: "bg-gradient-to-br from-warning/25 via-warning/20 to-warning/15 shadow-lg shadow-warning/20",
        iconColor: "text-warning",
        gradient: "from-warning/8 via-warning/4 to-transparent",
        borderGlow: "border-warning/30",
        glow: "shadow-[0_0_30px_hsl(var(--warning)/0.2)]",
    },
    info: {
        iconBg: "bg-gradient-to-br from-info/25 via-info/20 to-info/15 shadow-lg shadow-info/20",
        iconColor: "text-info",
        gradient: "from-info/8 via-info/4 to-transparent",
        borderGlow: "border-info/30",
        glow: "shadow-[0_0_30px_hsl(var(--info)/0.2)]",
    },
    error: {
        iconBg: "bg-gradient-to-br from-error/25 via-error/20 to-error/15 shadow-lg shadow-error/20",
        iconColor: "text-error",
        gradient: "from-error/8 via-error/4 to-transparent",
        borderGlow: "border-error/30",
        glow: "shadow-[0_0_30px_hsl(var(--error)/0.2)]",
    },
}

export function StatsCard({
    title,
    value,
    icon: Icon,
    description,
    trend,
    loading = false,
    variant = "default",
    className,
}: StatsCardProps) {
    const styles = variantStyles[variant]

    const gradientClass = `bg-gradient-to-br ${styles.gradient}`
    
    return (
        <Card 
            variant="elevated"
            className={cn(
                "group relative overflow-hidden",
                "hover:border-primary/20",
                className
            )}
        >
            <div className={cn(
                "absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-400 -z-0",
                gradientClass
            )} />
            <div className={cn(
                "absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity duration-400 rounded-t-2xl",
                gradientClass
            )} />
            <CardContent className="p-6 relative z-10 bg-card">
                <div className="flex items-center justify-between mb-5">
                    <p className="text-sm font-semibold text-muted-foreground">
                        {title}
                    </p>
                    <div
                        className={cn(
                            "h-12 w-12 rounded-xl flex items-center justify-center flex-shrink-0",
                            "transition-all duration-300 group-hover:scale-110",
                            styles.iconBg,
                            styles.iconColor
                        )}
                    >
                        <Icon className="h-5 w-5" />
                    </div>
                </div>
                <div>
                    {loading ? (
                        <Skeleton className="h-10 w-24 mb-2 rounded-lg" />
                    ) : (
                        <div className="flex flex-col gap-2">
                            <h3 className="text-3xl font-bold tracking-tight text-foreground">
                                {value}
                            </h3>
                            {trend && (
                                <span
                                    className={cn(
                                        "text-xs font-semibold px-2.5 py-1 rounded-lg inline-block w-fit",
                                        variant === "error" || variant === "warning"
                                            ? "text-warning bg-warning/15"
                                            : "text-success bg-success/15"
                                    )}
                                >
                                    {trend}
                                </span>
                            )}
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}

