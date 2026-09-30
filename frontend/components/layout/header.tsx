"use client"

import { Bell, Search, LogOut, User, Settings as SettingsIcon } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useCurrentUser } from "@/lib/hooks/use-current-user"
import { useUnreadCount } from "@/lib/hooks/use-notifications"
import { useRouter } from "next/navigation"
import { authApi } from "@/lib/api/auth"
import Cookies from "js-cookie"
import Link from "next/link"

export function Header() {
    const router = useRouter()
    const { data: currentUser } = useCurrentUser()
    const { data: unreadData } = useUnreadCount()
    const unreadCount = unreadData?.data?.count || 0

    const handleLogout = async () => {
        const refreshToken = Cookies.get('refreshToken')
        if (refreshToken) {
            await authApi.logout(refreshToken)
        }
        router.push('/login')
    }

    const userInitials = currentUser?.name
        ?.split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .substring(0, 2) || 'U'

    return (
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border/15 bg-background/95 px-6 backdrop-blur-sm transition-all">
            <div className="flex flex-1 items-center gap-4">
                <form className="w-full max-w-md">
                    <div className="relative group">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors duration-200" />
                        <Input
                            type="search"
                            placeholder="Search anything..."
                            className="w-full pl-10 h-9 bg-muted/30 border-border/40 focus:bg-background focus:border-ring/50 transition-all duration-200"
                        />
                    </div>
                </form>
            </div>
            <div className="flex items-center gap-2">
                <Link href={currentUser?.role === 'ADMIN' ? '/admin/notifications' : currentUser?.role === 'TEACHER' ? '/teacher/notifications' : '/parent/notifications'}>
                    <Button variant="ghost" size="icon" className="relative h-9 w-9 rounded-full hover:bg-muted transition-colors duration-200">
                        <Bell className="h-4 w-4" />
                        {unreadCount > 0 && (
                            <span className="absolute right-1.5 top-1.5 flex h-2 w-2">
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                            </span>
                        )}
                        <span className="sr-only">Notifications</span>
                    </Button>
                </Link>

                <div className="h-6 w-px bg-border/30 mx-1" />

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="relative h-9 w-9 rounded-full hover:bg-muted p-0 transition-colors duration-200">
                            <Avatar className="h-9 w-9 border border-border/30 shadow-sm hover:ring-2 hover:ring-ring/20 transition-all duration-200">
                                <AvatarImage src={currentUser?.school?.logoUrl} alt={currentUser?.name} />
                                <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xs">
                                    {userInitials}
                                </AvatarFallback>
                            </Avatar>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 p-1 rounded-lg border-border/15 shadow-lg bg-card/95 backdrop-blur-sm">
                        <DropdownMenuLabel className="font-normal px-3 py-2">
                            <div className="flex flex-col space-y-1">
                                <p className="text-sm font-semibold leading-none">{currentUser?.name}</p>
                                <p className="text-xs leading-none text-muted-foreground">{currentUser?.email}</p>
                                <div className="mt-2 inline-flex items-center rounded-md border border-border/30 px-2 py-0.5 text-xs font-medium bg-muted/50 text-foreground w-fit capitalize">
                                    {currentUser?.role?.toLowerCase()}
                                </div>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator className="bg-border/15" />
                        <DropdownMenuItem onClick={() => router.push('/dashboard')} className="rounded-md cursor-pointer">
                            <User className="mr-2 h-4 w-4" />
                            Profile
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => router.push('/settings')} className="rounded-md cursor-pointer">
                            <SettingsIcon className="mr-2 h-4 w-4" />
                            Settings
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-border/15" />
                        <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive focus:bg-destructive/10 rounded-md cursor-pointer">
                            <LogOut className="mr-2 h-4 w-4" />
                            Logout
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    )
}
