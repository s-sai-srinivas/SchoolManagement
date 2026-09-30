"use client"

import { DataTable } from "@/components/ui/data-table"
import { columns, Student } from "./columns"
import { CreateStudentDialog } from "@/components/admin/students/create-student-dialog"
import { useStudents } from "@/lib/hooks/use-students"
import { Skeleton } from "@/components/ui/skeleton"
import { EmptyState } from "@/components/common/empty-state"
import { GraduationCap } from "lucide-react"
import { PageHeader } from "@/components/layout/page-header"

export default function StudentsPage() {
    const { data, isLoading, error } = useStudents()

    // Transform API response to match Student type
    const students: Student[] = data?.data?.map((student: any) => ({
        id: student.id,
        name: student.name,
        admissionNo: student.admissionNo,
        class: student.class,
        section: student.section,
        parentName: student.parents?.[0]?.parent?.name || "Not assigned",
        status: student.deletedAt ? "inactive" : "active",
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

    if (error) {
        return (
            <div className="flex flex-col gap-6">
                <PageHeader
                    title="Student Management"
                    description="Manage student records, classes, and parent assignments."
                    action={<CreateStudentDialog />}
                />
                <div className="flex items-center justify-center h-96">
                    <div className="text-center">
                        <p className="text-destructive mb-2">Failed to load students</p>
                        <p className="text-sm text-muted-foreground">
                            {error instanceof Error ? error.message : "An error occurred"}
                        </p>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-6 animate-fade-in">
            <PageHeader
                title="Student Management"
                description="Manage student records, classes, and parent assignments."
                action={<CreateStudentDialog />}
            />

            {students.length === 0 ? (
                <EmptyState
                    icon={GraduationCap}
                    title="No students found"
                    description="Get started by adding your first student."
                    action={<CreateStudentDialog />}
                />
            ) : (
                <DataTable columns={columns} data={students} searchKey="name" />
            )}
        </div>
    )
}
