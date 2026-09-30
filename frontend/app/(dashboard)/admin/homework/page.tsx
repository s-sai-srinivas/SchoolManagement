"use client"

import { useState } from "react"
import { DataTable } from "@/components/ui/data-table"
import { columns, Homework } from "./columns"
import { CreateHomeworkDialog } from "@/components/admin/homework/create-homework-dialog"
import { useHomeworkByClass } from "@/lib/hooks/use-homework"
import { Skeleton } from "@/components/ui/skeleton"
import { EmptyState } from "@/components/common/empty-state"
import { BookOpen } from "lucide-react"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { format } from "date-fns"
import { PageHeader } from "@/components/layout/page-header"

export default function HomeworkPage() {
    const [selectedClass, setSelectedClass] = useState<string>("10")
    const [selectedSection, setSelectedSection] = useState<string>("A")

    const { data, isLoading, error } = useHomeworkByClass(selectedClass, selectedSection)

    // Transform API response to match Homework type
    const homework: Homework[] = data?.data?.map((hw: any) => ({
        id: hw.id,
        subject: hw.subject,
        title: hw.title || hw.description?.substring(0, 50) || "Untitled",
        class: hw.class,
        section: hw.section,
        dueDate: hw.dueDate ? format(new Date(hw.dueDate), "yyyy-MM-dd") : "No due date",
        status: hw.dueDate && new Date(hw.dueDate) < new Date() ? "expired" : "active",
        submissions: 0, // Not available from API currently
    })) || []

    if (isLoading) {
        return (
            <div className="flex flex-col gap-6">
                <div className="flex items-center justify-between">
                    <div>
                        <Skeleton className="h-9 w-64 mb-2" />
                        <Skeleton className="h-5 w-96" />
                    </div>
                    <Skeleton className="h-10 w-32" />
                </div>
                <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                        <Skeleton key={i} className="h-16 w-full" />
                    ))}
                </div>
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-6 animate-fade-in">
            <PageHeader
                title="Homework Management"
                description="Create and manage homework assignments for classes."
                action={<CreateHomeworkDialog />}
            />

            <div className="flex gap-4 items-end">
                <div className="flex-1 max-w-xs">
                    <Label htmlFor="class-select">Class</Label>
                    <Select value={selectedClass} onValueChange={setSelectedClass}>
                        <SelectTrigger id="class-select">
                            <SelectValue placeholder="Select class" />
                        </SelectTrigger>
                        <SelectContent>
                            {Array.from({ length: 10 }, (_, i) => i + 1).map((num) => (
                                <SelectItem key={num} value={num.toString()}>
                                    Class {num}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="flex-1 max-w-xs">
                    <Label htmlFor="section-select">Section</Label>
                    <Select value={selectedSection} onValueChange={setSelectedSection}>
                        <SelectTrigger id="section-select">
                            <SelectValue placeholder="Select section" />
                        </SelectTrigger>
                        <SelectContent>
                            {["A", "B", "C", "D"].map((section) => (
                                <SelectItem key={section} value={section}>
                                    Section {section}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {error ? (
                <div className="flex items-center justify-center h-96">
                    <div className="text-center">
                        <p className="text-destructive mb-2">Failed to load homework</p>
                        <p className="text-sm text-muted-foreground">
                            {error instanceof Error ? error.message : "An error occurred"}
                        </p>
                    </div>
                </div>
            ) : homework.length === 0 ? (
                <EmptyState
                    icon={BookOpen}
                    title="No homework found"
                    description={`No homework assignments found for Class ${selectedClass}-${selectedSection}.`}
                    action={<CreateHomeworkDialog />}
                />
            ) : (
                <DataTable columns={columns} data={homework} searchKey="title" />
            )}
        </div>
    )
}
