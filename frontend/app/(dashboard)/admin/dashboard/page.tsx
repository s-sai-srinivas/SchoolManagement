'use client'

import { Card, CardContent } from "@/components/ui/card"
import { Users, GraduationCap, CreditCard, TrendingUp, ArrowRight, Plus, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useStudentCount } from "@/lib/hooks/use-students"
import { useUsers } from "@/lib/hooks/use-users"
import { useFeeCollectionReport, useOutstandingFeesReport } from "@/lib/hooks/use-reports"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { CreateStudentDialog } from "@/components/admin/students/create-student-dialog"
import { CreateUserDialog } from "@/components/admin/users/create-user-dialog"
import { PageHeader } from "@/components/layout/page-header"
import { StatsCard } from "@/components/common/stats-card"
import { cn } from "@/lib/utils"

export default function DashboardPage() {
    const router = useRouter()
    const [showStudentDialog, setShowStudentDialog] = useState(false)
    const [showUserDialog, setShowUserDialog] = useState(false)
    const { data: studentCount, isLoading: loadingStudents } = useStudentCount()
    const { data: usersData, isLoading: loadingUsers } = useUsers()
    const { data: feeCollection, isLoading: loadingFeeCollection } = useFeeCollectionReport()
    const { data: outstandingFees, isLoading: loadingOutstanding } = useOutstandingFeesReport()

    const totalUsers = Array.isArray(usersData?.data) ? usersData.data.length : 0
    const totalStudents = studentCount?.data?.count || 0
    const totalCollection = feeCollection?.data?.totalCollection || 0
    const totalOutstanding = Array.isArray(outstandingFees?.data)
        ? outstandingFees.data.reduce((sum: number, item: any) => sum + (item.outstandingAmount || 0), 0)
        : 0

    return (
        <div className="relative flex flex-col gap-10 pb-10 animate-fade-in">
            {/* Premium background decorative elements */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-primary/8 via-info/6 to-success/8 rounded-full blur-[120px] -z-10 animate-pulse" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-warning/8 via-primary/6 to-info/8 rounded-full blur-[100px] -z-10 animate-pulse" style={{ animationDelay: '1s' }} />
            
            <div className="relative z-10">
                <PageHeader
                    title="Dashboard"
                    description={`Welcome back! You have ${totalStudents} active students and ₹${(totalCollection / 100).toLocaleString()} in fees collected.`}
                />
            </div>

            {/* Stats Grid */}
            <div className="grid gap-7 md:grid-cols-2 lg:grid-cols-4 relative z-10">
                <StatsCard
                    title="Total Students"
                    value={totalStudents.toLocaleString()}
                    icon={GraduationCap}
                    trend="+12% from last month"
                    loading={loadingStudents}
                    variant="info"
                />
                <StatsCard
                    title="Total Users"
                    value={totalUsers.toString()}
                    icon={Users}
                    trend="+5 new this week"
                    loading={loadingUsers}
                    variant="default"
                />
                <StatsCard
                    title="Fee Collection"
                    value={`₹${(totalCollection / 100).toLocaleString()}`}
                    icon={CreditCard}
                    trend="+8% vs last year"
                    loading={loadingFeeCollection}
                    variant="success"
                />
                <StatsCard
                    title="Outstanding Fees"
                    value={`₹${(totalOutstanding / 100).toLocaleString()}`}
                    icon={TrendingUp}
                    trend="Due in 7 days"
                    loading={loadingOutstanding}
                    variant="warning"
                />
            </div>

            {/* Quick Actions - Redesigned */}
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
                
                {/* Redesigned Action Cards */}
                <div className="grid gap-6 md:grid-cols-3 auto-rows-fr">
                    <QuickAction
                        icon={GraduationCap}
                        title="Add Student"
                        description="Register a new student to the system"
                        badge="New"
                        variant="info"
                        onClick={() => setShowStudentDialog(true)}
                    />
                    <QuickAction
                        icon={Users}
                        title="Add Teacher/Parent"
                        description="Create a new teacher or parent account"
                        badge="New"
                        variant="default"
                        onClick={() => setShowUserDialog(true)}
                    />
                    <QuickAction
                        icon={CreditCard}
                        title="Collect Fees"
                        description="Record a new fee payment"
                        badge="Payment"
                        variant="success"
                        onClick={() => router.push('/admin/fees/payments')}
                    />
                </div>
            </div>

            {/* Dialogs */}
            <CreateStudentDialog open={showStudentDialog} onOpenChange={setShowStudentDialog} />
            <CreateUserDialog open={showUserDialog} onOpenChange={setShowUserDialog} />
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
            iconBg: "bg-primary",
            iconStyle: { backgroundColor: "hsl(var(--primary))" },
            buttonBg: "bg-primary hover:bg-primary/90",
            hoverGlow: "group-hover:shadow-[0_0_40px_hsl(var(--primary)/0.3)]",
            gradient: "from-primary/15 via-primary/8 to-transparent",
            badgeBg: "bg-primary/20 text-primary border-primary/30",
            accentBar: "from-primary via-primary/70 to-primary/40",
        },
        info: {
            iconBg: "bg-blue-500",
            iconStyle: { backgroundColor: "hsl(217 91% 60%)" },
            buttonBg: "bg-blue-500 hover:bg-blue-600",
            hoverGlow: "group-hover:shadow-[0_0_40px_rgba(59,130,246,0.3)]",
            gradient: "from-blue-500/15 via-blue-500/8 to-transparent",
            badgeBg: "bg-blue-500/20 text-blue-600 border-blue-500/30",
            accentBar: "from-blue-500 via-blue-500/70 to-blue-500/40",
        },
        success: {
            iconBg: "bg-green-500",
            iconStyle: { backgroundColor: "hsl(142 71% 45%)" },
            buttonBg: "bg-green-500 hover:bg-green-600",
            hoverGlow: "group-hover:shadow-[0_0_40px_rgba(34,197,94,0.3)]",
            gradient: "from-green-500/15 via-green-500/8 to-transparent",
            badgeBg: "bg-green-500/20 text-green-600 border-green-500/30",
            accentBar: "from-green-500 via-green-500/70 to-green-500/40",
        },
        warning: {
            iconBg: "bg-orange-500",
            iconStyle: { backgroundColor: "hsl(38 92% 50%)" },
            buttonBg: "bg-orange-500 hover:bg-orange-600",
            hoverGlow: "group-hover:shadow-[0_0_40px_rgba(249,115,22,0.3)]",
            gradient: "from-orange-500/15 via-orange-500/8 to-transparent",
            badgeBg: "bg-orange-500/20 text-orange-600 border-orange-500/30",
            accentBar: "from-orange-500 via-orange-500/70 to-orange-500/40",
        },
        error: {
            iconBg: "bg-red-500",
            iconStyle: { backgroundColor: "hsl(0 72% 51%)" },
            buttonBg: "bg-red-500 hover:bg-red-600",
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
                        <Plus className="h-5 w-5 text-white" />
                    </div>
                </div>
            </div>
        </button>
    )
}

