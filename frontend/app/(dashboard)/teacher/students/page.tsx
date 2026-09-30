"use client"

import { useState, useMemo } from "react"
import { DataTable } from "@/components/ui/data-table"
import { columns, Student } from "@/app/(dashboard)/admin/students/columns"
import { useCurrentUser } from "@/lib/hooks/use-current-user"
import { useStudents } from "@/lib/hooks/use-students"
import { Skeleton } from "@/components/ui/skeleton"
import { EmptyState } from "@/components/common/empty-state"
import { PageHeader } from "@/components/layout/page-header"
import { GraduationCap, Users, Filter } from "lucide-react"
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

export default function TeacherStudentsPage() {
    const { data: currentUser, isLoading: loadingUser } = useCurrentUser()
    const assignments = currentUser?.assignments || []
    const firstAssignment = assignments[0]

    const [selectedClass, setSelectedClass] = useState<string>(firstAssignment?.class || "all")
    const [selectedSection, setSelectedSection] = useState<string>(firstAssignment?.section || "all")

    // Get all students and filter by assigned classes
    const { data: studentsData, isLoading: loadingStudents } = useStudents({
        class: selectedClass || undefined,
        section: selectedSection || undefined,
    })

    // Filter students by teacher's assigned classes
    const assignedClassKeys = assignments.map((a: any) => `${a.class}-${a.section}`)
    const allFilteredStudents: Student[] = studentsData?.data
        ?.filter((student: any) =>
            assignedClassKeys.includes(`${student.class}-${student.section}`)
        )
        .map((student: any) => ({
            id: student.id,
            name: student.name,
            admissionNo: student.admissionNo,
            class: student.class,
            section: student.section,
            parentName: student.parents?.[0]?.parent?.name || "Not assigned",
            status: student.deletedAt ? "inactive" : "active",
        })) || []

    // Filter by selected class/section if filters are applied
    const filteredStudents = useMemo(() => {
        if (selectedClass === "all" && selectedSection === "all") {
            return allFilteredStudents
        }
        return allFilteredStudents.filter((student) => {
            const classMatch = selectedClass === "all" || student.class === selectedClass
            const sectionMatch = selectedSection === "all" || student.section === selectedSection
            return classMatch && sectionMatch
        })
    }, [allFilteredStudents, selectedClass, selectedSection])

    // Calculate stats per class
    const classStats = useMemo(() => {
        const stats: Record<string, { class: string; section: string; count: number }> = {}
        allFilteredStudents.forEach((student) => {
            const key = `${student.class}-${student.section}`
            if (!stats[key]) {
                stats[key] = { class: student.class, section: student.section, count: 0 }
            }
            stats[key].count++
        })
        return Object.values(stats)
    }, [allFilteredStudents])

    if (loadingUser || loadingStudents) {
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
                    title="My Students"
                    description="View and manage students in your assigned classes."
                />
                <EmptyState
                    icon={GraduationCap}
                    title="No class assignments"
                    description="You haven't been assigned to any classes yet. Please contact your administrator to get assigned to classes."
                />
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-6">
            <PageHeader
                title="My Students"
                description={`View students in your assigned classes. Total: ${allFilteredStudents.length} student${allFilteredStudents.length !== 1 ? 's' : ''} across ${assignments.length} class${assignments.length !== 1 ? 'es' : ''}.`}
            />

            {/* Class Stats */}
            {classStats.length > 0 && (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {classStats.map((stat) => (
                        <Card key={`${stat.class}-${stat.section}`}>
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Class {stat.class}-{stat.section}</p>
                                        <p className="text-2xl font-bold text-foreground mt-1">{stat.count}</p>
                                    </div>
                                    <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                                        <Users className="h-6 w-6 text-primary" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Filters */}
            {assignments.length > 1 && (
                <Card>
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

            {/* Students Table */}
            {filteredStudents.length === 0 ? (
                <EmptyState
                    icon={GraduationCap}
                    title="No students found"
                    description={
                        selectedClass !== "all" || selectedSection !== "all"
                            ? `No students found in ${selectedClass !== "all" ? `Class ${selectedClass}` : ''}${selectedClass !== "all" && selectedSection !== "all" ? '-' : ''}${selectedSection !== "all" ? `Section ${selectedSection}` : ''}.`
                            : "No students found in your assigned classes."
                    }
                />
            ) : (
                <>
                    {selectedClass !== "all" || selectedSection !== "all" ? (
                        <div className="flex items-center gap-2">
                            <Badge variant="secondary">
                                Showing {filteredStudents.length} student{filteredStudents.length !== 1 ? 's' : ''}
                                {selectedClass !== "all" && ` in Class ${selectedClass}`}
                                {selectedSection !== "all" && `-${selectedSection}`}
                            </Badge>
                        </div>
                    ) : null}
                    <DataTable columns={columns} data={filteredStudents} searchKey="name" />
                </>
            )}
        </div>
    )
}
