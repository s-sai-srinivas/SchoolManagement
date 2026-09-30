import React from "react"
import { FileQuestion, LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface EmptyStateProps {
    title: string
    description?: string
    icon?: LucideIcon | React.ReactNode
    action?: React.ReactNode
    className?: string
}

export function EmptyState({ title, description, icon: Icon, action, className }: EmptyStateProps) {
    // Safely render icon - check if it's a React component (function) or React element
    const renderIcon = () => {
        if (!Icon) {
            return <FileQuestion className="h-8 w-8 text-primary" />
        }
        
        // Check if Icon is a React component (function)
        if (typeof Icon === 'function') {
            const IconComponent = Icon as React.ComponentType<{ className?: string }>
            return <IconComponent className="h-8 w-8 text-primary" />
        }
        
        // If Icon is already a React element, render it directly
        if (React.isValidElement(Icon)) {
            return Icon
        }
        
        // Fallback
        return <FileQuestion className="h-8 w-8 text-primary" />
    }
    
    return (
        <div className={cn(
            "flex flex-col items-center justify-center rounded-lg border border-dashed border-border/50 bg-muted/20 p-12 text-center",
            className
        )}>
            <div className="mb-4 rounded-lg bg-primary/10 p-4">
                {renderIcon()}
            </div>
            <h3 className="mb-2 text-lg font-semibold">{title}</h3>
            {description && (
                <p className="mb-4 max-w-sm text-sm text-muted-foreground leading-relaxed">{description}</p>
            )}
            {action && <div className="mt-2">{action}</div>}
        </div>
    )
}
