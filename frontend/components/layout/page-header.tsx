import React from "react"
import { cn } from "@/lib/utils"

interface PageHeaderProps {
    title: string
    description?: string
    action?: React.ReactNode
    className?: string
}

export function PageHeader({ title, description, action, className }: PageHeaderProps) {
    return (
        <div className={cn("flex items-start justify-between gap-6 relative flex-wrap", className)}>
            <div className="flex flex-col gap-4 relative z-10 flex-1 min-w-0">
                <div className="flex items-center gap-4 flex-wrap">
                    <div className="h-2 w-16 bg-gradient-to-r from-primary via-info to-success rounded-full shadow-lg shadow-primary/30 flex-shrink-0" />
                    <h1 className="text-4xl font-extrabold tracking-tight text-foreground">
                        {title}
                    </h1>
                </div>
                {description && (
                    <p className="text-base text-muted-foreground ml-20 max-w-2xl leading-relaxed font-medium">
                        {description}
                    </p>
                )}
            </div>
            {action && (
                <div className="flex-shrink-0 relative z-10">
                    {action}
                </div>
            )}
        </div>
    )
}

