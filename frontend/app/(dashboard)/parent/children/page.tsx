"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Baby, BookOpen, CreditCard } from "lucide-react"
import { useCurrentUser } from "@/lib/hooks/use-current-user"
import { useStudents } from "@/lib/hooks/use-students"
import { Skeleton } from "@/components/ui/skeleton"
import { EmptyState } from "@/components/common/empty-state"
import Link from "next/link"

export default function MyChildrenPage() {
    const { data: currentUser, isLoading: loadingUser } = useCurrentUser()
    const { data: studentsData, isLoading: loadingStudents } = useStudents({ parentId: currentUser?.id })
    
    const children = currentUser?.children || []
    const students = studentsData?.data || []
    
    // Use children from currentUser if available, otherwise use students list
    const displayChildren = children.length > 0 
        ? children.map((c: any) => c.student || c)
        : students

    if (loadingUser || loadingStudents) {
        return (
            <div className="flex flex-col gap-6">
                <div>
                    <Skeleton className="h-9 w-64 mb-2" />
                    <Skeleton className="h-5 w-96" />
                </div>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {[...Array(3)].map((_, i) => (
                        <Card key={i}>
                            <CardHeader>
                                <Skeleton className="h-6 w-32 mb-2" />
                                <Skeleton className="h-4 w-48" />
                            </CardHeader>
                            <CardContent>
                                <Skeleton className="h-20 w-full" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">My Children</h1>
                    <p className="text-muted-foreground">
                        View and manage your children's profiles and activities.
                    </p>
                </div>
            </div>

            {displayChildren.length === 0 ? (
                <EmptyState
                    icon={Baby}
                    title="No children found"
                    description="No children are registered under your account."
                />
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {displayChildren.map((child: any) => (
                        <Card key={child.id || child.studentId}>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-lg">{child.name}</CardTitle>
                                    <Baby className="h-5 w-5 text-muted-foreground" />
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    Class {child.class}-{child.section} • {child.admissionNo}
                                </p>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground">Class</span>
                                        <Badge variant="default">{child.class}-{child.section}</Badge>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground">Admission No</span>
                                        <span className="font-medium">{child.admissionNo}</span>
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <Link href="/parent/homework" className="flex-1">
                                        <Button variant="outline" size="sm" className="w-full">
                                            <BookOpen className="mr-2 h-4 w-4" />
                                            Homework
                                        </Button>
                                    </Link>
                                    <Link href="/parent/fees" className="flex-1">
                                        <Button size="sm" className="w-full">
                                            <CreditCard className="mr-2 h-4 w-4" />
                                            Fees
                                        </Button>
                                    </Link>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
