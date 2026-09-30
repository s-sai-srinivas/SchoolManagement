import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const cardVariants = cva(
    "rounded-2xl border bg-card text-card-foreground transition-all duration-400 relative overflow-hidden backdrop-blur-xl",
    {
        variants: {
            variant: {
                default:
                    "border-border/25 shadow-[0_1px_2px_0_rgba(0,0,0,0.03),0_4px_8px_-2px_rgba(0,0,0,0.04),0_8px_16px_-4px_rgba(0,0,0,0.04),0_16px_32px_-8px_rgba(0,0,0,0.05)] hover:shadow-[0_4px_6px_-1px_rgba(0,0,0,0.08),0_10px_15px_-3px_rgba(0,0,0,0.08),0_20px_25px_-5px_rgba(0,0,0,0.08),0_25px_50px_-12px_rgba(0,0,0,0.12),0_0_0_1px_hsl(var(--primary)/0.1)] hover:-translate-y-2 hover:scale-[1.01] hover:border-primary/40",
                elevated:
                    "border-border/30 shadow-[0_8px_16px_-4px_rgba(0,0,0,0.06),0_16px_32px_-8px_rgba(0,0,0,0.06),0_0_0_1px_rgba(0,0,0,0.04),inset_0_1px_0_0_rgba(255,255,255,0.8)] hover:shadow-[0_12px_24px_-4px_rgba(0,0,0,0.1),0_24px_48px_-8px_rgba(0,0,0,0.1),0_0_0_1px_rgba(0,0,0,0.06),inset_0_1px_0_0_rgba(255,255,255,0.9)] hover:-translate-y-3 hover:scale-[1.02] hover:border-primary/50",
                glass:
                    "border-border/40 backdrop-blur-2xl bg-gradient-to-br from-card/90 via-card/85 to-card/90 shadow-[0_8px_32px_0_rgba(31,38,135,0.12)] hover:bg-gradient-to-br hover:from-card/95 hover:via-card/90 hover:to-card/95 hover:border-primary/50 hover:shadow-[0_12px_40px_0_rgba(31,38,135,0.18),0_0_40px_hsl(var(--primary)/0.15)] hover:-translate-y-2",
            },
        },
        defaultVariants: {
            variant: "default",
        },
    }
)

export interface CardProps
    extends React.HTMLAttributes<HTMLDivElement>,
        VariantProps<typeof cardVariants> {}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
    ({ className, variant, ...props }, ref) => (
        <div
            ref={ref}
            className={cn(cardVariants({ variant }), className)}
            {...props}
        />
    )
)
Card.displayName = "Card"

const CardHeader = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn("flex flex-col space-y-1.5 p-6 pb-4", className)}
        {...props}
    />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
    HTMLParagraphElement,
    React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
    <h3
        ref={ref}
        className={cn(
            "text-lg font-semibold leading-tight tracking-tight",
            className
        )}
        {...props}
    />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
    HTMLParagraphElement,
    React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
    <p
        ref={ref}
        className={cn("text-sm text-muted-foreground", className)}
        {...props}
    />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn("flex items-center p-6 pt-0", className)}
        {...props}
    />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
