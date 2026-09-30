"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Bell, Check, Clock } from "lucide-react"
import { useNotifications } from "@/lib/hooks/use-notifications"
import { useMarkAsRead } from "@/lib/hooks/use-notifications"
import { Skeleton } from "@/components/ui/skeleton"
import { EmptyState } from "@/components/common/empty-state"
import { formatDistanceToNow } from "date-fns"

export function NotificationList() {
    const { data, isLoading } = useNotifications({ take: 50 })
    const markAsRead = useMarkAsRead()
    
    const notifications = data?.data || []
    
    const handleMarkAsRead = async (id: string) => {
        try {
            await markAsRead.mutateAsync(id)
        } catch (error) {
            // Silent fail - notification will update on refetch
        }
    }
    
    const getNotificationType = (type: string): "alert" | "info" | "success" => {
        if (type?.toLowerCase().includes("alert") || type?.toLowerCase().includes("absent")) {
            return "alert"
        }
        if (type?.toLowerCase().includes("success") || type?.toLowerCase().includes("payment")) {
            return "success"
        }
        return "info"
    }

    if (isLoading) {
        return (
            <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                    <Card key={i} className="p-4">
                        <Skeleton className="h-16 w-full" />
                    </Card>
                ))}
            </div>
        )
    }

    if (notifications.length === 0) {
        return (
            <EmptyState
                icon={Bell}
                title="No notifications"
                description="You're all caught up! No new notifications."
            />
        )
    }

    return (
        <div className="space-y-3">
            {notifications.map((notification: any) => {
                const notificationType = getNotificationType(notification.type || notification.title)
                const timeAgo = notification.createdAt 
                    ? formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })
                    : "Recently"
                
                return (
                    <Card
                        key={notification.id}
                        className={`flex items-start gap-4 p-4 transition-all duration-200 glass-card border-0 shadow-sm hover:shadow-md ${
                            !notification.isRead ? "bg-primary/5 border-l-4 border-l-primary" : "border-l-4 border-l-transparent"
                        }`}
                    >
                        <div className={`mt-1 rounded-lg p-2.5 shadow-sm ${
                            notificationType === "alert" ? "bg-error text-error" :
                            notificationType === "success" ? "bg-success text-success" :
                            "bg-info text-info"
                        }`}>
                            <Bell className="h-4 w-4" />
                        </div>
                        <div className="flex-1 space-y-2">
                            <div className="flex items-center justify-between">
                                <p className={`text-sm ${
                                    !notification.isRead ? "text-foreground font-semibold" : "text-muted-foreground font-medium"
                                }`}>
                                    {notification.title}
                                </p>
                                <div className="flex items-center gap-2">
                                    <span className="flex items-center text-xs text-muted-foreground font-medium">
                                        <Clock className="mr-1 h-3 w-3" />
                                        {timeAgo}
                                    </span>
                                    {!notification.isRead && (
                                        <Button 
                                            variant="ghost" 
                                            size="icon" 
                                            className="h-7 w-7 hover:bg-primary/10 hover:text-primary" 
                                            title="Mark as read"
                                            onClick={() => handleMarkAsRead(notification.id)}
                                            disabled={markAsRead.isPending}
                                        >
                                            <Check className="h-3.5 w-3.5" />
                                        </Button>
                                    )}
                                </div>
                            </div>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                {notification.message || notification.description || notification.title}
                            </p>
                        </div>
                    </Card>
                )
            })}
        </div>
    )
}
