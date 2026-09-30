"use client"

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Trash2, Users, FileText } from "lucide-react"
import { useNotices, useDeleteNotice } from "@/lib/hooks/use-notices"
import { useCurrentUser } from "@/lib/hooks/use-current-user"
import { Skeleton } from "@/components/ui/skeleton"
import { EmptyState } from "@/components/common/empty-state"
import { format } from "date-fns"
import { toast } from "sonner"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useState } from "react"

type Notice = {
    id: string
    title: string
    content: string
    date: string
    audience: string
    priority: "normal" | "high"
    author: string
}

export function NoticeList() {
    const { data: currentUser } = useCurrentUser()
    const { data, isLoading, error } = useNotices()
    const deleteNotice = useDeleteNotice()
    const [deleteId, setDeleteId] = useState<string | null>(null)

    // Transform API response - handle different response structures
    // Backend returns: { data: [...], total, skip, take, hasMore }
    // Axios wraps it, so we need data.data.data for the actual array
    const responseData = data?.data || data
    const noticesData = responseData?.data || responseData
    const notices: Notice[] = Array.isArray(noticesData)
        ? noticesData.map((notice: any) => {
            // Ensure all values are primitives, not objects
            const adminName = notice.admin?.name
            const authorName = notice.author?.name

            return {
                id: String(notice.id || Math.random()),
                title: String(notice.title || "Untitled Notice"),
                content: String(notice.description || notice.content || ""),
                date: notice.createdAt ? format(new Date(notice.createdAt), "yyyy-MM-dd") : "N/A",
                audience: "All Users", // Default - API doesn't have audience field
                priority: "normal" as const, // Default - API doesn't have priority field
                author: String(adminName || authorName || "Admin"),
            }
        })
        : []

    const handleDelete = async (id: string) => {
        try {
            await deleteNotice.mutateAsync(id)
            toast.success("Notice deleted successfully")
            setDeleteId(null)
        } catch (error) {
            toast.error("Failed to delete notice. Please try again.")
        }
    }

    if (isLoading) {
        return (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {[...Array(6)].map((_, i) => (
                    <Card key={i} className="flex flex-col">
                        <CardHeader>
                            <Skeleton className="h-5 w-3/4 mb-2" />
                            <Skeleton className="h-4 w-1/2" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-16 w-full" />
                        </CardContent>
                        <CardFooter>
                            <Skeleton className="h-8 w-full" />
                        </CardFooter>
                    </Card>
                ))}
            </div>
        )
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center">
                    <p className="text-destructive mb-2">Failed to load notices</p>
                    <p className="text-sm text-muted-foreground">
                        {error instanceof Error ? error.message : "An error occurred"}
                    </p>
                </div>
            </div>
        )
    }

    if (notices.length === 0) {
        return (
            <EmptyState
                icon={FileText}
                title="No notices found"
                description="Get started by posting your first notice."
            />
        )
    }

    return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {notices.map((notice) => (
                <Card key={notice.id} className="flex flex-col">
                    <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                        <div className="space-y-1">
                            <CardTitle className="text-base font-semibold leading-none">
                                {notice.title}
                            </CardTitle>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Calendar className="h-3 w-3" />
                                <span>{notice.date}</span>
                            </div>
                        </div>
                        {notice.priority === "high" && (
                            <Badge variant="destructive">Urgent</Badge>
                        )}
                    </CardHeader>
                    <CardContent className="flex-1 pt-4">
                        <p className="text-sm text-muted-foreground line-clamp-3">
                            {notice.content}
                        </p>
                    </CardContent>
                    <CardFooter className="border-t bg-muted/50 px-6 py-3">
                        <div className="flex w-full items-center justify-between">
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Users className="h-3 w-3" />
                                <span>{notice.audience}</span>
                            </div>
                            {currentUser?.role === "ADMIN" && (
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                            disabled={deleteNotice.isPending}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                            <span className="sr-only">Delete</span>
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                This action cannot be undone. This will permanently delete the notice "{notice.title}".
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel className="rounded-md">Cancel</AlertDialogCancel>
                                            <AlertDialogAction
                                                onClick={() => handleDelete(notice.id)}
                                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-md"
                                            >
                                                Delete
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            )}
                        </div>
                    </CardFooter>
                </Card>
            ))}
        </div>
    )
}
