"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { CheckCircle2, XCircle, Clock, Home, Calendar, TrendingUp } from "lucide-react"
import { useCurrentUser } from "@/lib/hooks/use-current-user"
import { useStudentAttendance } from "@/lib/hooks/use-attendance"
import { Skeleton } from "@/components/ui/skeleton"
import { EmptyState } from "@/components/common/empty-state"
import { format, startOfMonth, endOfMonth } from "date-fns"

export default function ParentAttendancePage() {
    const { data: currentUser, isLoading: loadingUser } = useCurrentUser()
    const children = currentUser?.children || []
    const firstChildId = children[0]?.id || children[0]?.studentId || children[0]?.student?.id
    const [selectedChildId, setSelectedChildId] = useState<string>("")
    useEffect(() => {
        if (!selectedChildId && firstChildId) setSelectedChildId(firstChildId)
    }, [firstChildId, selectedChildId])
    const [selectedMonth, setSelectedMonth] = useState<string>(format(new Date(), "yyyy-MM"))
    
    const { data: attendanceData, isLoading: loadingAttendance } = useStudentAttendance(
        selectedChildId,
        { month: selectedMonth }
    )
    
    const attendance = attendanceData?.data?.attendance || []
    const summary = attendanceData?.data?.summary || { totalDays: 0, presentDays: 0, absentDays: 0, percentage: 0 }
    
    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'PRESENT':
                return <CheckCircle2 className="h-4 w-4 text-success" />
            case 'ABSENT':
                return <XCircle className="h-4 w-4 text-destructive" />
            case 'LATE':
                return <Clock className="h-4 w-4 text-warning" />
            case 'LEAVE':
                return <Home className="h-4 w-4 text-info" />
            default:
                return null
        }
    }
    
    const getStatusBadge = (status: string) => {
        const variants: Record<string, "default" | "destructive" | "secondary" | "outline"> = {
            PRESENT: "default",
            ABSENT: "destructive",
            LATE: "secondary",
            LEAVE: "outline",
        }
        return <Badge variant={variants[status] || "outline"}>{status}</Badge>
    }

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

    if (children.length === 0) {
        return (
            <div className="flex flex-col gap-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Attendance</h1>
                    <p className="text-muted-foreground">
                        View your child's attendance history.
                    </p>
                </div>
                <EmptyState
                    icon={Calendar}
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
                    <h1 className="text-3xl font-bold tracking-tight">Attendance</h1>
                    <p className="text-muted-foreground">
                        View your child's attendance history and statistics.
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

            {/* Summary Cards */}
            <div className="grid gap-6 md:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Attendance %</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        {loadingAttendance ? (
                            <Skeleton className="h-8 w-20" />
                        ) : (
                            <>
                                <div className="text-2xl font-bold">{summary.percentage?.toFixed(1) || 0}%</div>
                                <p className="text-xs text-muted-foreground">This month</p>
                            </>
                        )}
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Present Days</CardTitle>
                        <CheckCircle2 className="h-4 w-4 text-success" />
                    </CardHeader>
                    <CardContent>
                        {loadingAttendance ? (
                            <Skeleton className="h-8 w-20" />
                        ) : (
                            <>
                                <div className="text-2xl font-bold">{summary.presentDays || 0}</div>
                                <p className="text-xs text-muted-foreground">Days present</p>
                            </>
                        )}
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Absent Days</CardTitle>
                        <XCircle className="h-4 w-4 text-red-600" />
                    </CardHeader>
                    <CardContent>
                        {loadingAttendance ? (
                            <Skeleton className="h-8 w-20" />
                        ) : (
                            <>
                                <div className="text-2xl font-bold">{summary.absentDays || 0}</div>
                                <p className="text-xs text-muted-foreground">Days absent</p>
                            </>
                        )}
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Days</CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        {loadingAttendance ? (
                            <Skeleton className="h-8 w-20" />
                        ) : (
                            <>
                                <div className="text-2xl font-bold">{summary.totalDays || 0}</div>
                                <p className="text-xs text-muted-foreground">School days</p>
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Month Selector */}
            <Card>
                <CardHeader>
                    <CardTitle>Select Month</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="max-w-xs">
                        <Label htmlFor="month-select">Month</Label>
                        <input
                            id="month-select"
                            type="month"
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(e.target.value)}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mt-2"
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Attendance History */}
            <Card>
                <CardHeader>
                    <CardTitle>Attendance History</CardTitle>
                </CardHeader>
                <CardContent>
                    {loadingAttendance ? (
                        <div className="space-y-2">
                            {[...Array(5)].map((_, i) => (
                                <Skeleton key={i} className="h-12 w-full" />
                            ))}
                        </div>
                    ) : attendance.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            <Calendar className="h-12 w-12 mx-auto mb-2 opacity-50" />
                            <p className="text-sm">No attendance records found for this month.</p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Remarks</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {attendance.map((record: any) => (
                                    <TableRow key={record.id}>
                                        <TableCell className="font-medium">
                                            {record.date ? format(new Date(record.date), "MMM d, yyyy") : "N/A"}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                {getStatusIcon(record.status)}
                                                {getStatusBadge(record.status)}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-muted-foreground">
                                            {record.remarks || "-"}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}


