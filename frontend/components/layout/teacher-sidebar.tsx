"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import {
    LayoutDashboard,
    BookOpen,
    Users,
    FileText,
    Bell,
    LogOut,
    GraduationCap,
    Calendar,
} from "lucide-react"
import { authApi } from "@/lib/api/endpoints"
import { useAuthStore } from "@/lib/stores/auth-store"

const sidebarItems = [
    {
        title: "Dashboard",
        href: "/teacher/dashboard",
        icon: LayoutDashboard,
    },
    {
        title: "Attendance",
        href: "/teacher/attendance",
        icon: Calendar,
    },
    {
        title: "Homework",
        href: "/teacher/homework",
        icon: BookOpen,
    },
    {
        title: "Students",
        href: "/teacher/students",
        icon: Users,
    },
    {
        title: "Notices",
        href: "/teacher/notices",
        icon: FileText,
    },
    {
        title: "Notifications",
        href: "/teacher/notifications",
        icon: Bell,
    },
]

export function TeacherSidebar() {
    const pathname = usePathname()
    const router = useRouter()
    const logout = useAuthStore((state) => state.logout)

    const handleLogout = async () => {
        try {
            await authApi.logout()
            logout()
            router.push('/login')
        } catch (error) {
            // Even if API call fails, clear local state
            logout()
            router.push('/login')
        }
    }

    return (
        <div className="flex h-full w-64 flex-col border-r border-border/15 bg-card/30 backdrop-blur-sm">
            <div className="flex h-16 items-center px-4 border-b border-border/15">
                <Link href="/teacher/dashboard" className="hover:opacity-80 transition-opacity duration-200">
                    <div className="flex items-center gap-2 font-semibold">
                        <GraduationCap className="h-6 w-6 text-primary" />
                        <span>Teacher Portal</span>
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
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors duration-200"
                >
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                </button>
            </div>
        </div>
    )
}
