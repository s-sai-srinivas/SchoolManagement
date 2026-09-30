"use client"

import { NotificationList } from "@/components/admin/notifications/notification-list"
import { Button } from "@/components/ui/button"
import { CheckCheck } from "lucide-react"
import { useMarkAllAsRead } from "@/lib/hooks/use-notifications"

export default function TeacherNotificationsPage() {
    const markAllAsRead = useMarkAllAsRead()
    
    const handleMarkAllAsRead = async () => {
        try {
            await markAllAsRead.mutateAsync()
            alert("All notifications marked as read")
        } catch (error) {
            alert("Failed to mark all as read")
        }
    }
    
    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
                    <p className="text-muted-foreground">
                        View system alerts and updates.
                    </p>
                </div>
                <Button 
                    variant="outline" 
                    onClick={handleMarkAllAsRead}
                    disabled={markAllAsRead.isPending}
                >
                    <CheckCheck className="mr-2 h-4 w-4" />
                    {markAllAsRead.isPending ? "Marking..." : "Mark all as read"}
                </Button>
            </div>

            <div className="max-w-3xl">
                <NotificationList />
            </div>
        </div>
    )
}
