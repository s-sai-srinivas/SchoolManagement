"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Baby, BookOpen, CreditCard, FileText, AlertCircle } from "lucide-react"
import { PageHeader } from "@/components/layout/page-header"
import { StatsCard } from "@/components/common/stats-card"
import { useCurrentUser } from "@/lib/hooks/use-current-user"
import { useStudents } from "@/lib/hooks/use-students"
import { feeApi } from "@/lib/api/endpoints"
import { useQueries } from "@tanstack/react-query"
import { useNotices } from "@/lib/hooks/use-notices"
import { Skeleton } from "@/components/ui/skeleton"
import { EmptyState } from "@/components/common/empty-state"
import { format } from "date-fns"
import Link from "next/link"

export default function ParentDashboardPage() {
    const { data: currentUser, isLoading: loadingUser } = useCurrentUser()
    const children = currentUser?.children || []
    const childrenIds = children.map((c: any) => c.studentId).filter(Boolean)
    
    // Get all students for this parent (filtered by parentId)
    const { data: studentsData } = useStudents({ parentId: currentUser?.id })
    const students = studentsData?.data || []
    
    // Get notices
    const { data: noticesData } = useNotices({ take: 5 })
    const recentNotices = Array.isArray(noticesData?.data?.data)
        ? noticesData.data.data
        : Array.isArray(noticesData?.data) ? noticesData.data : []

    // Calculate pending fees for all children (useQueries keeps hook count stable)
    const feeQueries = useQueries({
        queries: children.map((child: any) => {
            const studentId = child.studentId || child.id
            return {
                queryKey: ['fees', 'pending', studentId],
                queryFn: () => feeApi.getPendingByStudent(studentId),
                enabled: !!studentId,
            }
        }),
    })

    const allPendingFees = feeQueries.flatMap((query: any) => query?.data?.data || [])
    const totalPendingFees = allPendingFees.reduce((sum: number, fee: any) => sum + (fee.amountPaise || 0), 0)

    if (loadingUser) {
        return (
            <div className="flex flex-col gap-6">
                <div>
                    <Skeleton className="h-9 w-64 mb-2" />
                    <Skeleton className="h-5 w-96" />
                </div>
                <div className="grid gap-6 md:grid-cols-4">
                    {[...Array(4)].map((_, i) => (
                        <Card key={i} className="glass-card">
                            <CardHeader>
                                <Skeleton className="h-8 w-32 mb-2" />
                            </CardHeader>
                            <CardContent>
                                <Skeleton className="h-8 w-20" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-6 animate-fade-in">
            <PageHeader
                title="Parent Dashboard"
                description={`Welcome back, ${currentUser?.name || 'Parent'}! Here's an overview of your children's activities.`}
            />

            {/* Stats Cards */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <StatsCard
                    title="My Children"
                    value={children.length.toString()}
                    icon={Baby}
                    loading={loadingUser}
                    variant="info"
                />
                <StatsCard
                    title="Pending Homework"
                    value="0"
                    icon={BookOpen}
                    loading={false}
                    variant="default"
                />
                <StatsCard
                    title="Pending Fees"
                    value={`₹${(totalPendingFees / 100).toLocaleString()}`}
                    icon={CreditCard}
                    trend={allPendingFees.length > 0 ? `${allPendingFees.length} due` : undefined}
                    loading={false}
                    variant="warning"
                />
                <StatsCard
                    title="Recent Notices"
                    value={recentNotices.length.toString()}
                    icon={FileText}
                    loading={false}
                    variant="success"
                />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Children Overview */}
                <Card variant="elevated">
                    <CardHeader className="pb-4">
                        <CardTitle className="text-xl font-semibold">My Children</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {children.length === 0 && students.length === 0 ? (
                            <EmptyState
                                icon={Baby}
                                title="No children registered"
                                description="Your account is not linked to any students yet."
                            />
                        ) : (
                            <div className="space-y-4">
                                {(children.length > 0 ? children : students).map((child: any, idx: number) => {
                                    const student = child.student || child
                                    return (
                                        <div key={child.studentId || child.id || idx} className="flex items-center justify-between rounded-lg border border-border/50 p-4 hover:bg-muted/50 hover:border-primary/30 transition-all duration-200 group">
                                            <div>
                                                <p className="font-semibold">{student.name || "Unknown"}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    Class {student.class}-{student.section} • {student.admissionNo}
                                                </p>
                                            </div>
                                            <Link href={`/parent/children`}>
                                                <Button variant="outline" size="sm" className="group-hover:border-primary/50 transition-colors duration-200">View</Button>
                                            </Link>
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Upcoming Homework */}
                <Card variant="elevated">
                    <CardHeader className="pb-4">
                        <CardTitle className="text-xl font-semibold">Upcoming Homework</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <EmptyState
                            icon={BookOpen}
                            title="View homework"
                            description="Check the Homework section for assignments."
                            action={
                                <Link href="/parent/homework">
                                    <Button variant="outline" size="sm">Go to Homework</Button>
                                </Link>
                            }
                        />
                    </CardContent>
                </Card>

                {/* Fee Status */}
                <Card variant="elevated">
                    <CardHeader className="pb-4">
                        <CardTitle className="text-xl font-semibold">Fee Payment Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {allPendingFees.length === 0 ? (
                            <EmptyState
                                icon={CreditCard}
                                title="All fees paid"
                                description="No pending fees at the moment."
                            />
                        ) : (
                            <div className="space-y-4">
                                {allPendingFees.slice(0, 3).map((fee: any) => (
                                    <div key={fee.id} className="flex items-center justify-between rounded-lg border border-border/50 p-4 hover:bg-muted/50 transition-all duration-200">
                                        <div>
                                            <p className="font-semibold">Installment {fee.installmentNumber}</p>
                                            <p className="text-sm text-muted-foreground">₹{(fee.amountPaise / 100).toLocaleString()}</p>
                                        </div>
                                        <Badge variant="destructive">Pending</Badge>
                                    </div>
                                ))}
                                {allPendingFees.length > 3 && (
                                    <Link href="/parent/fees">
                                        <Button variant="outline" size="sm" className="w-full transition-colors duration-200">View All Fees</Button>
                                    </Link>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Recent Notices */}
                <Card variant="elevated">
                    <CardHeader className="pb-4">
                        <CardTitle className="text-xl font-semibold">Recent Notices</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {recentNotices.length === 0 ? (
                            <EmptyState
                                icon={FileText}
                                title="No notices available"
                                description="There are no notices at the moment."
                            />
                        ) : (
                            <div className="space-y-4">
                                {recentNotices.map((notice: any) => (
                                    <div key={notice.id} className="flex items-center justify-between rounded-lg border border-border/50 p-4 hover:bg-muted/50 transition-all duration-200 group">
                                        <div className="flex items-center gap-4">
                                            <div className="p-2 rounded-lg bg-primary/10">
                                                <FileText className="h-4 w-4 text-primary" />
                                            </div>
                                            <div>
                                                <p className="font-semibold">{notice.title}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {notice.createdAt ? format(new Date(notice.createdAt), "MMM d, yyyy") : "N/A"}
                                                </p>
                                            </div>
                                        </div>
                                        <Link href="/parent/notices">
                                            <Button variant="ghost" size="sm" className="group-hover:text-primary transition-colors duration-200">Read</Button>
                                        </Link>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
