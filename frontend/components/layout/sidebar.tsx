"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import {
    LayoutDashboard,
    School,
    Users,
    GraduationCap,
    CreditCard,
    BookOpen,
    Bell,
    FileText,
    Settings,
    LogOut,
    Calendar,
    ChevronRight,
} from "lucide-react"
import { Logo } from "@/components/ui/logo"
import { Button } from "@/components/ui/button"
import { authApi } from "@/lib/api/auth"
import Cookies from "js-cookie"

const sidebarItems = [
    {
        title: "Dashboard",
        href: "/admin/dashboard",
        icon: LayoutDashboard,
    },
    {
        title: "School",
        href: "/admin/school",
        icon: School,
    },
    {
        title: "Users",
        href: "/admin/users",
        icon: Users,
    },
    {
        title: "Students",
        href: "/admin/students",
        icon: GraduationCap,
    },
    {
        title: "Attendance",
        href: "/admin/attendance",
        icon: Calendar,
    },
    {
        title: "Fees",
        href: "/admin/fees",
        icon: CreditCard,
    },
    {
        title: "Homework",
        href: "/admin/homework",
        icon: BookOpen,
    },
    {
        title: "Notices",
        href: "/admin/notices",
        icon: Bell,
    },
    {
        title: "Reports",
        href: "/admin/reports",
        icon: FileText,
    },
    {
        title: "Settings",
        href: "/admin/settings",
        icon: Settings,
    },
]

export function Sidebar() {
    const pathname = usePathname()
    const router = useRouter()

    const handleLogout = async () => {
        const refreshToken = Cookies.get('refreshToken')
        if (refreshToken) {
            await authApi.logout(refreshToken)
        }
        router.push('/login')
    }

    return (
        <div className="flex h-full w-64 flex-col border-r border-border/15 bg-card/30 backdrop-blur-sm">
            <div className="flex h-16 items-center px-4 border-b border-border/15">
                <Link href="/admin/dashboard" className="hover:opacity-80 transition-opacity duration-200">
                    <Logo />
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
                                {isActive && (
                                    <ChevronRight className="h-3.5 w-3.5 text-primary" />
                                )}
                            </Link>
                        )
                    })}
                </nav>
            </div>

            <div className="border-t border-border/15 p-3">
                <Button
                    variant="ghost"
                    onClick={handleLogout}
                    className="w-full justify-start gap-2.5 text-sm text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors duration-200"
                >
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                </Button>
            </div>
        </div>
    )
}
