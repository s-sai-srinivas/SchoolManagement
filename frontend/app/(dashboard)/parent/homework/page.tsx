"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Calendar, FileText, BookOpen } from "lucide-react"
import { useCurrentUser } from "@/lib/hooks/use-current-user"
import { useHomeworkByStudent } from "@/lib/hooks/use-homework"
import { Skeleton } from "@/components/ui/skeleton"
import { EmptyState } from "@/components/common/empty-state"
import { format } from "date-fns"

export default function ParentHomeworkPage() {
    const { data: currentUser, isLoading: loadingUser } = useCurrentUser()
    const children = currentUser?.children || []
    const firstChildId = children[0]?.studentId || children[0]?.student?.id
    const [selectedChildId, setSelectedChildId] = useState<string>(firstChildId || "")
    
    const { data: homeworkData, isLoading: loadingHomework } = useHomeworkByStudent(selectedChildId)
    const homework = homeworkData?.data || []

    if (loadingUser) {
        return (
            <div className="flex flex-col gap-6">
                <div>
                    <Skeleton className="h-9 w-64 mb-2" />
                    <Skeleton className="h-5 w-96" />
                </div>
                <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                        <Skeleton key={i} className="h-32 w-full" />
                    ))}
                </div>
            </div>
        )
    }

    if (children.length === 0) {
        return (
            <div className="flex flex-col gap-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Homework</h1>
                    <p className="text-muted-foreground">
                        View homework assignments for your children.
                    </p>
                </div>
                <EmptyState
                    icon={BookOpen}
                    title="No children found"
                    description="No children are registered under your account."
                />
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Homework</h1>
                    <p className="text-muted-foreground">
                        View homework assignments for your children.
                    </p>
                </div>
                {children.length > 1 && (
                    <Select value={selectedChildId} onValueChange={setSelectedChildId}>
                        <SelectTrigger className="w-[200px]">
                            <SelectValue placeholder="Select child" />
                        </SelectTrigger>
                        <SelectContent>
                            {children.map((child: any) => {
                                const student = child.student || child
                                return (
                                    <SelectItem key={child.studentId || child.id} value={child.studentId || child.id}>
                                        {student.name} (Class {student.class}-{student.section})
                                    </SelectItem>
                                )
                            })}
                        </SelectContent>
                    </Select>
                )}
            </div>

            {loadingHomework ? (
                <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                        <Skeleton key={i} className="h-32 w-full" />
                    ))}
                </div>
            ) : homework.length === 0 ? (
                <EmptyState
                    icon={BookOpen}
                    title="No homework found"
                    description="No homework assignments for the selected child."
                />
            ) : (
                <div className="grid gap-6">
                    {homework.map((hw: any) => {
                        const isExpired = hw.dueDate && new Date(hw.dueDate) < new Date()
                        return (
                            <Card key={hw.id}>
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <CardTitle className="text-lg">{hw.title || hw.subject}</CardTitle>
                                            <p className="text-sm text-muted-foreground">{hw.subject}</p>
                                        </div>
                                        <Badge variant={isExpired ? "secondary" : "default"}>
                                            {isExpired ? "Expired" : "Active"}
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <p className="text-sm">{hw.description}</p>
                                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                        {hw.dueDate && (
                                            <div className="flex items-center gap-2">
                                                <Calendar className="h-4 w-4" />
                                                <span>Due: {format(new Date(hw.dueDate), "MMM d, yyyy")}</span>
                                            </div>
                                        )}
                                        {hw.teacher && (
                                            <div className="flex items-center gap-2">
                                                <FileText className="h-4 w-4" />
                                                <span>Posted by: {hw.teacher.name}</span>
                                            </div>
                                        )}
                                    </div>
                                    {hw.imageUrl && (
                                        <div className="mt-4">
                                            <img src={hw.imageUrl} alt="Homework" className="max-w-md rounded-md" />
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
