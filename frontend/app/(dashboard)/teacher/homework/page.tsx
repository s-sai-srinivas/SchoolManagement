"use client"

import { useState, useMemo } from "react"
import { DataTable } from "@/components/ui/data-table"
import { columns, Homework } from "@/app/(dashboard)/admin/homework/columns"
import { CreateHomeworkDialog } from "@/components/admin/homework/create-homework-dialog"
import { useCurrentUser } from "@/lib/hooks/use-current-user"
import { useQueries } from "@tanstack/react-query"
import { homeworkApi } from "@/lib/api/endpoints"
import { Skeleton } from "@/components/ui/skeleton"
import { EmptyState } from "@/components/common/empty-state"
import { PageHeader } from "@/components/layout/page-header"
import { BookOpen, Filter, Plus } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { format } from "date-fns"

export default function TeacherHomeworkPage() {
    const { data: currentUser, isLoading: loadingUser } = useCurrentUser()
    const assignments = currentUser?.assignments || []
    const firstAssignment = assignments[0]
    
    const [selectedClass, setSelectedClass] = useState<string>("all")
    const [selectedSection, setSelectedSection] = useState<string>("all")
    
    // Fetch homework from ALL assigned classes using useQueries
    const homeworkQueries = useQueries({
        queries: assignments.map((assignment: any) => ({
            queryKey: ['homework', 'class', assignment.class, assignment.section],
            queryFn: () => homeworkApi.getByClass(assignment.class, assignment.section),
            enabled: !!assignment.class && !!assignment.section,
        })),
    })
    
    // Aggregate homework from all classes
    const allHomework = homeworkQueries
        .flatMap(query => query.data?.data || [])
        .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    
    const isLoading = homeworkQueries.some(query => query.isLoading)
    const hasError = homeworkQueries.some(query => query.isError)
    
    // Filter homework by selected class/section
    const filteredHomework = useMemo(() => {
        let filtered = allHomework
        
        if (selectedClass !== "all") {
            filtered = filtered.filter((hw: any) => hw.class === selectedClass)
        }
        if (selectedSection !== "all") {
            filtered = filtered.filter((hw: any) => hw.section === selectedSection)
        }
        
        return filtered
    }, [allHomework, selectedClass, selectedSection])
    
    // Transform API response to match Homework type
    const homework: Homework[] = filteredHomework.map((hw: any) => ({
        id: hw.id,
        subject: hw.subject,
        title: hw.title || hw.description?.substring(0, 50) || "Untitled",
        class: hw.class,
        section: hw.section,
        dueDate: hw.dueDate ? format(new Date(hw.dueDate), "yyyy-MM-dd") : "No due date",
        status: hw.dueDate && new Date(hw.dueDate) < new Date() ? "expired" : "active",
        submissions: 0, // Not available from API currently
    }))
    
    // Calculate stats per class
    const classStats = useMemo(() => {
        const stats: Record<string, { class: string; section: string; count: number }> = {}
        allHomework.forEach((hw: any) => {
            const key = `${hw.class}-${hw.section}`
            if (!stats[key]) {
                stats[key] = { class: hw.class, section: hw.section, count: 0 }
            }
            stats[key].count++
        })
        return Object.values(stats)
    }, [allHomework])

    if (loadingUser) {
        return (
            <div className="flex flex-col gap-6">
                <div>
                    <Skeleton className="h-9 w-64 mb-2" />
                    <Skeleton className="h-5 w-96" />
                </div>
                <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                        <Skeleton key={i} className="h-16 w-full" />
                    ))}
                </div>
            </div>
        )
    }

    if (assignments.length === 0) {
        return (
            <div className="flex flex-col gap-6">
                <PageHeader
                    title="My Homework"
                    description="Manage homework assignments for your classes."
                    action={<CreateHomeworkDialog />}
                />
                <EmptyState
                    icon={BookOpen}
                    title="No class assignments"
                    description="You haven't been assigned to any classes yet. Please contact your administrator to get assigned to classes."
                />
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-6">
            <PageHeader
                title="My Homework"
                description={`Manage homework assignments for your classes. Total: ${allHomework.length} assignment${allHomework.length !== 1 ? 's' : ''} across ${assignments.length} class${assignments.length !== 1 ? 'es' : ''}.`}
                action={<CreateHomeworkDialog />}
            />

            {/* Class Stats */}
            {classStats.length > 0 && (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {classStats.map((stat) => (
                        <Card key={`${stat.class}-${stat.section}`} variant="elevated">
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Class {stat.class}-{stat.section}</p>
                                        <p className="text-2xl font-bold text-foreground mt-1">{stat.count}</p>
                                    </div>
                                    <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                                        <BookOpen className="h-6 w-6 text-primary" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Filters */}
            {assignments.length > 1 && (
                <Card variant="elevated">
                    <CardContent className="p-4">
                        <div className="flex items-end gap-4 flex-wrap">
                            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                                <Filter className="h-4 w-4" />
                                Filter by:
                            </div>
                            <div className="flex-1 max-w-xs">
                                <Label htmlFor="class-select" className="text-xs">Class</Label>
                                <Select value={selectedClass} onValueChange={(value) => {
                                    setSelectedClass(value)
                                    // Reset section when class changes
                                    const newSection = value === "all" ? "all" : (assignments.find((a: any) => a.class === value)?.section || "all")
                                    setSelectedSection(newSection)
                                }}>
                                    <SelectTrigger id="class-select">
                                        <SelectValue placeholder="All classes" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All classes</SelectItem>
                                        {assignments.map((assignment: any, idx: number) => (
                                            <SelectItem key={idx} value={assignment.class}>
                                                Class {assignment.class}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex-1 max-w-xs">
                                <Label htmlFor="section-select" className="text-xs">Section</Label>
                                <Select 
                                    value={selectedSection} 
                                    onValueChange={setSelectedSection}
                                    disabled={selectedClass === "all"}
                                >
                                    <SelectTrigger id="section-select">
                                        <SelectValue placeholder="All sections" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All sections</SelectItem>
                                        {assignments
                                            .filter((a: any) => selectedClass === "all" || a.class === selectedClass)
                                            .map((assignment: any, idx: number) => (
                                                <SelectItem key={idx} value={assignment.section}>
                                                    Section {assignment.section}
                                                </SelectItem>
                                            ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            {(selectedClass !== "all" || selectedSection !== "all") && (
                                <button
                                    onClick={() => {
                                        setSelectedClass("all")
                                        setSelectedSection("all")
                                    }}
                                    className="text-sm text-muted-foreground hover:text-foreground underline"
                                >
                                    Clear filters
                                </button>
                            )}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Homework Table */}
            {isLoading ? (
                <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                        <Skeleton key={i} className="h-16 w-full" />
                    ))}
                </div>
            ) : hasError ? (
                <div className="flex items-center justify-center h-96">
                    <div className="text-center">
                        <p className="text-destructive mb-2">Failed to load homework</p>
                        <p className="text-sm text-muted-foreground">
                            Please try refreshing the page.
                        </p>
                    </div>
                </div>
            ) : homework.length === 0 ? (
                <EmptyState
                    icon={BookOpen}
                    title="No homework found"
                    description={
                        selectedClass !== "all" || selectedSection !== "all"
                            ? `No homework assignments found${selectedClass !== "all" ? ` in Class ${selectedClass}` : ''}${selectedClass !== "all" && selectedSection !== "all" ? '-' : ''}${selectedSection !== "all" ? `Section ${selectedSection}` : ''}.`
                            : "No homework assignments found. Start by creating your first homework assignment."
                    }
                    action={<CreateHomeworkDialog />}
                />
            ) : (
                <>
                    {(selectedClass !== "all" || selectedSection !== "all") && (
                        <div className="flex items-center gap-2">
                            <Badge variant="secondary">
                                Showing {homework.length} assignment{homework.length !== 1 ? 's' : ''}
                                {selectedClass !== "all" && ` in Class ${selectedClass}`}
                                {selectedSection !== "all" && `-${selectedSection}`}
                            </Badge>
                        </div>
                    )}
                    <DataTable columns={columns} data={homework} searchKey="title" />
                </>
            )}
        </div>
    )
}
