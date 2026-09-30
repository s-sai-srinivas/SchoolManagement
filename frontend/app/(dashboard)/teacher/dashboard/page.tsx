"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { BookOpen, Users, FileText, Plus, Calendar, ArrowRight, Sparkles, GraduationCap } from "lucide-react"
import { useCurrentUser } from "@/lib/hooks/use-current-user"
import { useStudents } from "@/lib/hooks/use-students"
import { useQueries } from "@tanstack/react-query"
import { homeworkApi } from "@/lib/api/endpoints"
import { useNotices } from "@/lib/hooks/use-notices"
import { Skeleton } from "@/components/ui/skeleton"
import { EmptyState } from "@/components/common/empty-state"
import { format } from "date-fns"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { PageHeader } from "@/components/layout/page-header"
import { StatsCard } from "@/components/common/stats-card"
import { cn } from "@/lib/utils"

export default function TeacherDashboardPage() {
    const router = useRouter()
    const { data: currentUser, isLoading: loadingUser } = useCurrentUser()
    const assignments = currentUser?.assignments || []
    
    // Get students count for assigned classes
    const { data: studentsData, isLoading: loadingStudents } = useStudents()
    const assignedClasses = assignments.map((a: any) => `${a.class}-${a.section}`)
    const studentsInClasses = studentsData?.data?.filter((s: any) => 
        assignedClasses.includes(`${s.class}-${s.section}`)
    ) || []
    
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
    
    const recentHomework = allHomework.slice(0, 5)
    const isLoadingHomework = homeworkQueries.some(query => query.isLoading)
    
    // Calculate homework posted this week
    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
    const homeworkThisWeek = allHomework.filter((hw: any) => 
        new Date(hw.createdAt) >= oneWeekAgo
    ).length
    
    // Get recent notices
    const { data: noticesData } = useNotices({ take: 5 })
    const recentNotices = Array.isArray(noticesData?.data) ? noticesData.data : []

    if (loadingUser) {
        return (
            <div className="flex flex-col gap-6">
                <div>
                    <Skeleton className="h-9 w-64 mb-2" />
                    <Skeleton className="h-5 w-96" />
                </div>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    {[...Array(4)].map((_, i) => (
                        <Card key={i}>
                            <CardHeader>
                                <Skeleton className="h-6 w-32 mb-2" />
                            </CardHeader>
                            <CardContent>
                                <Skeleton className="h-8 w-24" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        )
    }

    return (
        <div className="relative flex flex-col gap-10 pb-10 animate-fade-in">
            {/* Premium background decorative elements */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-primary/8 via-info/6 to-success/8 rounded-full blur-[120px] -z-10 animate-pulse" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-warning/8 via-primary/6 to-info/8 rounded-full blur-[100px] -z-10 animate-pulse" style={{ animationDelay: '1s' }} />
            
            <div className="relative z-10">
                <PageHeader
                    title="Teacher Dashboard"
                    description={`Welcome back, ${currentUser?.name || 'Teacher'}! You're teaching ${assignments.length} class${assignments.length !== 1 ? 'es' : ''} with ${studentsInClasses.length} students.`}
                />
            </div>

            {/* Stats Cards */}
            <div className="grid gap-7 md:grid-cols-2 lg:grid-cols-4 relative z-10">
                <StatsCard
                    title="My Classes"
                    value={assignments.length.toString()}
                    icon={Users}
                    loading={loadingUser}
                    variant="info"
                />
                <StatsCard
                    title="Total Students"
                    value={studentsInClasses.length.toString()}
                    icon={GraduationCap}
                    loading={loadingStudents}
                    variant="success"
                />
                <StatsCard
                    title="Homework Posted"
                    value={allHomework.length.toString()}
                    trend={homeworkThisWeek > 0 ? `${homeworkThisWeek} this week` : undefined}
                    icon={BookOpen}
                    loading={isLoadingHomework}
                    variant="default"
                />
                <StatsCard
                    title="Recent Notices"
                    value={recentNotices.length.toString()}
                    icon={FileText}
                    loading={false}
                    variant="info"
                />
            </div>

            {/* Quick Actions */}
            {assignments.length > 0 && (
                <div className="flex flex-col gap-8 relative z-10">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <div className="flex items-center gap-4">
                            <div className="h-1.5 w-16 bg-gradient-to-r from-primary via-info to-success rounded-full shadow-lg shadow-primary/30 flex-shrink-0" />
                            <h2 className="text-3xl font-extrabold text-foreground tracking-tight">
                                Quick Actions
                            </h2>
                        </div>
                        <p className="text-sm text-muted-foreground font-medium hidden md:block">
                            Frequently used actions
                        </p>
                    </div>
                    
                    <div className="grid gap-6 md:grid-cols-3 auto-rows-fr">
                        <QuickAction
                            icon={Calendar}
                            title="Mark Attendance"
                            description="Record attendance for your classes"
                            badge="Daily"
                            variant="info"
                            onClick={() => router.push('/teacher/attendance')}
                        />
                        <QuickAction
                            icon={BookOpen}
                            title="Create Homework"
                            description="Assign homework to your students"
                            badge="New"
                            variant="success"
                            onClick={() => router.push('/teacher/homework')}
                        />
                        <QuickAction
                            icon={Users}
                            title="View Students"
                            description="See all students in your classes"
                            variant="default"
                            onClick={() => router.push('/teacher/students')}
                        />
                    </div>
                </div>
            )}

            <div className="grid gap-6 md:grid-cols-2 relative z-10">
                {/* My Classes */}
                <Card variant="elevated">
                    <CardHeader className="flex flex-row items-center justify-between pb-4">
                        <CardTitle className="text-xl font-semibold">My Classes</CardTitle>
                        {assignments.length > 0 && (
                            <Badge variant="secondary">{assignments.length} assigned</Badge>
                        )}
                    </CardHeader>
                    <CardContent>
                        {assignments.length === 0 ? (
                            <EmptyState
                                icon={Users}
                                title="No class assignments"
                                description="You haven't been assigned to any classes yet. Please contact your administrator to get assigned to classes."
                            />
                        ) : (
                            <div className="space-y-4">
                                {assignments.map((assignment: any, idx: number) => {
                                    const classStudents = studentsInClasses.filter((s: any) => 
                                        s.class === assignment.class && s.section === assignment.section
                                    )
                                    const classHomework = allHomework.filter((hw: any) =>
                                        hw.class === assignment.class && hw.section === assignment.section
                                    )
                                    
                                    return (
                                        <div 
                                            key={idx} 
                                            className="flex items-center justify-between rounded-xl border border-border/50 p-4 hover:bg-muted/50 hover:border-primary/30 transition-all duration-200 group"
                                        >
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <p className="font-semibold text-lg">Class {assignment.class}-{assignment.section}</p>
                                                    {assignment.subject && (
                                                        <Badge variant="outline" className="text-xs">
                                                            {assignment.subject}
                                                        </Badge>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                                    <span className="flex items-center gap-1">
                                                        <Users className="h-3.5 w-3.5" />
                                                        {classStudents.length} students
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <BookOpen className="h-3.5 w-3.5" />
                                                        {classHomework.length} assignments
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Link href={`/teacher/students?class=${assignment.class}&section=${assignment.section}`}>
                                                    <Button variant="outline" size="sm" className="group-hover:border-primary/50 transition-colors duration-200">
                                                        Students
                                                    </Button>
                                                </Link>
                                                <Link href={`/teacher/attendance?class=${assignment.class}&section=${assignment.section}`}>
                                                    <Button variant="outline" size="sm" className="group-hover:border-primary/50 transition-colors duration-200">
                                                        Attendance
                                                    </Button>
                                                </Link>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Recent Homework */}
                <Card variant="elevated">
                    <CardHeader className="flex flex-row items-center justify-between pb-4">
                        <CardTitle className="text-xl font-semibold">Recent Homework</CardTitle>
                        <Link href="/teacher/homework">
                            <Button size="sm">
                                <Plus className="mr-2 h-4 w-4" />
                                Create
                            </Button>
                        </Link>
                    </CardHeader>
                    <CardContent>
                        {isLoadingHomework ? (
                            <div className="space-y-4">
                                {[...Array(3)].map((_, i) => (
                                    <Skeleton key={i} className="h-16 w-full rounded-lg" />
                                ))}
                            </div>
                        ) : recentHomework.length === 0 ? (
                            <EmptyState
                                icon={BookOpen}
                                title="No homework posted"
                                description="Start by creating your first homework assignment for your classes."
                                action={
                                    <Link href="/teacher/homework">
                                        <Button size="sm">
                                            <Plus className="mr-2 h-4 w-4" />
                                            Create Homework
                                        </Button>
                                    </Link>
                                }
                            />
                        ) : (
                            <div className="space-y-4">
                                {recentHomework.map((hw: any) => (
                                    <Link 
                                        key={hw.id} 
                                        href="/teacher/homework"
                                        className="block"
                                    >
                                        <div className="flex items-center justify-between rounded-lg border border-border/50 p-4 hover:bg-muted/50 transition-all duration-200 group">
                                            <div className="flex-1">
                                                <p className="font-semibold">{hw.title || hw.subject || "Untitled"}</p>
                                                <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                                                    <span className="font-medium">{hw.class}-{hw.section}</span>
                                                    {hw.dueDate && (
                                                        <>
                                                            <span>•</span>
                                                            <span>{format(new Date(hw.dueDate), "MMM d, yyyy")}</span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                            <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                                        </div>
                                    </Link>
                                ))}
                                {allHomework.length > 5 && (
                                    <Link href="/teacher/homework">
                                        <Button variant="outline" size="sm" className="w-full">
                                            View All Homework ({allHomework.length})
                                        </Button>
                                    </Link>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Recent Notices */}
                <Card variant="elevated" className="md:col-span-2">
                    <CardHeader className="flex flex-row items-center justify-between pb-4">
                        <CardTitle className="text-xl font-semibold">Recent Notices</CardTitle>
                        <Link href="/teacher/notices">
                            <Button variant="outline" size="sm">
                                View All
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </Link>
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
                                    <Link 
                                        key={notice.id} 
                                        href="/teacher/notices"
                                        className="block"
                                    >
                                        <div className="flex items-center justify-between rounded-lg border border-border/50 p-4 hover:bg-muted/50 transition-all duration-200 group">
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
                                            <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

function QuickAction({ 
    icon: Icon, 
    title, 
    description, 
    badge,
    variant = "default", 
    onClick 
}: { 
    icon: any, 
    title: string, 
    description: string,
    badge?: string,
    variant?: "default" | "info" | "success" | "warning" | "error", 
    onClick: () => void 
}) {
    const variantStyles = {
        default: {
            iconStyle: { backgroundColor: "hsl(var(--primary))" },
            hoverGlow: "group-hover:shadow-[0_0_40px_hsl(var(--primary)/0.3)]",
            gradient: "from-primary/15 via-primary/8 to-transparent",
            badgeBg: "bg-primary/20 text-primary border-primary/30",
            accentBar: "from-primary via-primary/70 to-primary/40",
        },
        info: {
            iconStyle: { backgroundColor: "hsl(217 91% 60%)" },
            hoverGlow: "group-hover:shadow-[0_0_40px_rgba(59,130,246,0.3)]",
            gradient: "from-blue-500/15 via-blue-500/8 to-transparent",
            badgeBg: "bg-blue-500/20 text-blue-600 border-blue-500/30",
            accentBar: "from-blue-500 via-blue-500/70 to-blue-500/40",
        },
        success: {
            iconStyle: { backgroundColor: "hsl(142 71% 45%)" },
            hoverGlow: "group-hover:shadow-[0_0_40px_rgba(34,197,94,0.3)]",
            gradient: "from-green-500/15 via-green-500/8 to-transparent",
            badgeBg: "bg-green-500/20 text-green-600 border-green-500/30",
            accentBar: "from-green-500 via-green-500/70 to-green-500/40",
        },
        warning: {
            iconStyle: { backgroundColor: "hsl(38 92% 50%)" },
            hoverGlow: "group-hover:shadow-[0_0_40px_rgba(249,115,22,0.3)]",
            gradient: "from-orange-500/15 via-orange-500/8 to-transparent",
            badgeBg: "bg-orange-500/20 text-orange-600 border-orange-500/30",
            accentBar: "from-orange-500 via-orange-500/70 to-orange-500/40",
        },
        error: {
            iconStyle: { backgroundColor: "hsl(0 72% 51%)" },
            hoverGlow: "group-hover:shadow-[0_0_40px_rgba(239,68,68,0.3)]",
            gradient: "from-red-500/15 via-red-500/8 to-transparent",
            badgeBg: "bg-red-500/20 text-red-600 border-red-500/30",
            accentBar: "from-red-500 via-red-500/70 to-red-500/40",
        },
    }

    const styles = variantStyles[variant]
    const gradientClass = `bg-gradient-to-br ${styles.gradient}`

    return (
        <button
            onClick={onClick}
            className={cn(
                "group relative overflow-hidden rounded-2xl",
                "bg-card border-2 border-border/40",
                "shadow-[0_4px_12px_-2px_rgba(0,0,0,0.06),0_8px_24px_-4px_rgba(0,0,0,0.06)]",
                "hover:shadow-[0_8px_24px_-4px_rgba(0,0,0,0.1),0_16px_48px_-8px_rgba(0,0,0,0.1)]",
                "transition-all duration-400 hover:-translate-y-2 hover:scale-[1.02]",
                "hover:border-primary/50",
                styles.hoverGlow,
                "text-left w-full focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2"
            )}
        >
            {/* Gradient overlay on hover */}
            <div className={cn(
                "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-400 -z-0",
                gradientClass
            )} />
            
            {/* Top accent bar */}
            <div className={cn(
                "absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity duration-400 rounded-t-2xl",
                `bg-gradient-to-r ${styles.accentBar}`
            )} />

            <div className="p-6 relative z-10 bg-card">
                {/* Header with badge */}
                <div className="flex items-start justify-between mb-5 gap-3">
                    <div 
                        className={cn(
                            "h-14 w-14 rounded-2xl flex items-center justify-center flex-shrink-0",
                            "transition-all duration-400 group-hover:scale-110 group-hover:rotate-6",
                            "shadow-lg group-hover:shadow-xl",
                            "text-white relative overflow-hidden"
                        )}
                        style={styles.iconStyle}
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-50" />
                        <Icon className="h-7 w-7 text-white relative z-10 stroke-[2.5]" />
                    </div>
                    {badge && (
                        <span className={cn(
                            "px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border flex-shrink-0",
                            styles.badgeBg
                        )}>
                            {badge}
                        </span>
                    )}
                </div>

                {/* Content */}
                <div className="space-y-2.5 mb-6">
                    <h3 className="text-xl font-extrabold text-foreground group-hover:text-primary transition-colors tracking-tight">
                        {title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed font-medium">
                        {description}
                    </p>
                </div>

                {/* Action Button */}
                <div className="flex items-center justify-between gap-3">
                    <span className="text-xs font-semibold text-foreground/70 uppercase tracking-wider group-hover:text-primary transition-colors">
                        Click to start
                    </span>
                    <div 
                        className={cn(
                            "h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0",
                            "transition-all duration-400 group-hover:scale-110",
                            "shadow-md group-hover:shadow-lg text-white"
                        )}
                        style={styles.iconStyle}
                    >
                        <ArrowRight className="h-5 w-5 text-white" />
                    </div>
                </div>
            </div>
        </button>
    )
}
