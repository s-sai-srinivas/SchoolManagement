"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
    LayoutDashboard,
    Users,
    BookOpen,
    CreditCard,
    FileText,
    Bell,
    LogOut,
    Baby,
    Calendar,
} from "lucide-react"

const sidebarItems = [
    {
        title: "Dashboard",
        href: "/parent/dashboard",
        icon: LayoutDashboard,
    },
    {
        title: "My Children",
        href: "/parent/children",
        icon: Baby,
    },
    {
        title: "Attendance",
        href: "/parent/attendance",
        icon: Calendar,
    },
    {
        title: "Homework",
        href: "/parent/homework",
        icon: BookOpen,
    },
    {
        title: "Fees & Payments",
        href: "/parent/fees",
        icon: CreditCard,
    },
    {
        title: "Notices",
        href: "/parent/notices",
        icon: FileText,
    },
    {
        title: "Notifications",
        href: "/parent/notifications",
        icon: Bell,
    },
]

export function ParentSidebar() {
    const pathname = usePathname()

    return (
        <div className="flex h-full w-64 flex-col border-r border-border/15 bg-card/30 backdrop-blur-sm">
            <div className="flex h-16 items-center px-4 border-b border-border/15">
                <Link href="/parent/dashboard" className="hover:opacity-80 transition-opacity duration-200">
                    <div className="flex items-center gap-2 font-semibold">
                        <Users className="h-6 w-6 text-primary" />
                        <span>Parent Portal</span>
                    </div>
                </Link>
            </div>
            <div className="flex-1 overflow-y-auto py-4 px-3">
                <div className="mb-3 px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Main Menu
                </div>
                <nav className="space-y-1">
                    {sidebarItems.map((item) => {
                        const isActive = pathname === item.href
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "group flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200",
                                    isActive
                                        ? "bg-primary/10 text-primary"
                                        : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                                )}
                            >
                                <div className="flex items-center gap-2.5">
                                    <item.icon className={cn(
                                        "h-4 w-4 transition-colors duration-200",
                                        isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                                    )} />
                                    <span>{item.title}</span>
                                </div>
                            </Link>
                        )
                    })}
                </nav>
            </div>
            <div className="border-t border-border/15 p-3">
                <button className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors duration-200">
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                </button>
            </div>
        </div>
    )
}
