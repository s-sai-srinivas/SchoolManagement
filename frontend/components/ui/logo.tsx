import { School } from "lucide-react"
import { cn } from "@/lib/utils"

interface LogoProps {
    className?: string
    collapsed?: boolean
    variant?: "default" | "white"
}

export function Logo({ className, collapsed = false, variant = "default" }: LogoProps) {
    return (
        <div className={cn("flex items-center gap-3 transition-all duration-300", className)}>
            <div className={cn(
                "relative flex items-center justify-center rounded-xl transition-all duration-300",
                collapsed ? "h-10 w-10" : "h-9 w-9",
                variant === "default"
                    ? "bg-gradient-to-br from-blue-600 to-indigo-600 shadow-lg shadow-blue-500/20"
                    : "bg-white/10 backdrop-blur-sm"
            )}>
                <School className={cn(
                    "transition-all duration-300",
                    collapsed ? "h-6 w-6" : "h-5 w-5",
                    variant === "default" ? "text-white" : "text-white"
                )} />
                <div className="absolute inset-0 rounded-xl ring-1 ring-inset ring-black/5" />
            </div>

            {!collapsed && (
                <div className="flex flex-col animate-fade-in">
                    <span className={cn(
                        "font-bold text-lg leading-none tracking-tight",
                        variant === "default" ? "text-foreground" : "text-white"
                    )}>
                        School<span className="text-primary">Admin</span>
                    </span>
                    <span className={cn(
                        "text-[10px] font-medium uppercase tracking-wider opacity-60",
                        variant === "default" ? "text-muted-foreground" : "text-blue-100"
                    )}>
                        Management System
                    </span>
                </div>
            )}
        </div>
    )
}
