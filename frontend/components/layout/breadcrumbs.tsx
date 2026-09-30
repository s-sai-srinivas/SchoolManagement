"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronRight, Home } from "lucide-react"

export function Breadcrumbs() {
    const pathname = usePathname()
    const segments = pathname.split("/").filter((segment) => segment !== "")

    return (
        <nav className="flex items-center text-sm text-muted-foreground mb-4">
            <Link
                href="/admin/dashboard"
                className="flex items-center hover:text-foreground transition-colors"
            >
                <Home className="h-4 w-4" />
            </Link>
            {segments.map((segment, index) => {
                const href = `/${segments.slice(0, index + 1).join("/")}`
                const isLast = index === segments.length - 1
                const title = segment.charAt(0).toUpperCase() + segment.slice(1)

                return (
                    <div key={href} className="flex items-center">
                        <ChevronRight className="h-4 w-4 mx-1" />
                        {isLast ? (
                            <span className="font-medium text-foreground">{title}</span>
                        ) : (
                            <Link
                                href={href}
                                className="hover:text-foreground transition-colors"
                            >
                                {title}
                            </Link>
                        )}
                    </div>
                )
            })}
        </nav>
    )
}
