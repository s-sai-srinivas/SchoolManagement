"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Calendar, Download, TrendingDown, FileText } from "lucide-react"
import { useDailyAttendanceReport, useMonthlyAttendanceReport, useAttendanceDefaultersReport } from "@/lib/hooks/use-attendance"
import { Skeleton } from "@/components/ui/skeleton"
import { EmptyState } from "@/components/common/empty-state"
import { format } from "date-fns"
import { reportApi } from "@/lib/api/endpoints"
import { toast } from "sonner"

export default function AdminAttendancePage() {
    const [reportType, setReportType] = useState<"daily" | "monthly" | "defaulters">("daily")
    const [selectedDate, setSelectedDate] = useState<string>(format(new Date(), "yyyy-MM-dd"))
    const [selectedMonth, setSelectedMonth] = useState<string>(format(new Date(), "yyyy-MM"))
    const [selectedClass, setSelectedClass] = useState<string>("")
    const [selectedSection, setSelectedSection] = useState<string>("")
    
    const { data: dailyReport, isLoading: loadingDaily } = useDailyAttendanceReport({
        date: selectedDate,
        class: selectedClass || undefined,
        section: selectedSection || undefined,
    })
    
    const { data: monthlyReport, isLoading: loadingMonthly } = useMonthlyAttendanceReport({
        month: selectedMonth,
    })
    
    const { data: defaultersReport, isLoading: loadingDefaulters } = useAttendanceDefaultersReport({
        threshold: 75,
    })
    
    const handleExportDaily = async () => {
        try {
            const response = await reportApi.dailyAttendance({ date: selectedDate })
            // Handle export - similar to fee export
            toast.info("Export functionality will be implemented")
        } catch (error) {
            toast.error("Failed to export report")
        }
    }
    
    const handleExportMonthly = async () => {
        try {
            const response = await reportApi.monthlyAttendanceExport({ month: selectedMonth })
            const blob = new Blob([response.data], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" })
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement("a")
            a.href = url
            a.download = `attendance_monthly_${selectedMonth}.xlsx`
            document.body.appendChild(a)
            a.click()
            window.URL.revokeObjectURL(url)
            document.body.removeChild(a)
        } catch (error) {
            toast.error("Failed to export report")
        }
    }

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Attendance Reports</h1>
                    <p className="text-muted-foreground">
                        View and export attendance reports for all classes.
                    </p>
                </div>
            </div>

            {/* Report Type Selector */}
            <Card>
                <CardHeader>
                    <CardTitle>Report Type</CardTitle>
                </CardHeader>
                <CardContent>
                    <Select value={reportType} onValueChange={(value: any) => setReportType(value)}>
                        <SelectTrigger className="w-[200px]">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="daily">Daily Report</SelectItem>
                            <SelectItem value="monthly">Monthly Report</SelectItem>
                            <SelectItem value="defaulters">Defaulters Report</SelectItem>
                        </SelectContent>
                    </Select>
                </CardContent>
            </Card>

            {/* Daily Report */}
            {reportType === "daily" && (
                <>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Daily Attendance Report</CardTitle>
                            <Button variant="outline" size="sm" onClick={handleExportDaily}>
                                <Download className="mr-2 h-4 w-4" />
                                Export
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <div className="mb-4 flex gap-4">
                                <div>
                                    <Label htmlFor="daily-date">Date</Label>
                                    <Input
                                        id="daily-date"
                                        type="date"
                                        value={selectedDate}
                                        onChange={(e) => setSelectedDate(e.target.value)}
                                        className="mt-2"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="daily-class">Class (Optional)</Label>
                                    <Input
                                        id="daily-class"
                                        value={selectedClass}
                                        onChange={(e) => setSelectedClass(e.target.value)}
                                        placeholder="e.g., 10"
                                        className="mt-2"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="daily-section">Section (Optional)</Label>
                                    <Input
                                        id="daily-section"
                                        value={selectedSection}
                                        onChange={(e) => setSelectedSection(e.target.value)}
                                        placeholder="e.g., A"
                                        className="mt-2"
                                    />
                                </div>
                            </div>
                            {loadingDaily ? (
                                <div className="space-y-2">
                                    {[...Array(3)].map((_, i) => (
                                        <Skeleton key={i} className="h-12 w-full" />
                                    ))}
                                </div>
                            ) : dailyReport?.data ? (
                                <div className="space-y-4">
                                    {Object.entries(dailyReport.data).map(([classKey, classData]: [string, any]) => (
                                        <div key={classKey} className="rounded-lg border p-4">
                                            <h3 className="font-semibold mb-2">Class {classKey}</h3>
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead>Student</TableHead>
                                                        <TableHead>Status</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {classData.students?.map((student: any) => (
                                                        <TableRow key={student.id}>
                                                            <TableCell>{student.name}</TableCell>
                                                            <TableCell>
                                                                <span className={student.status === "PRESENT" ? "text-success" : "text-destructive"}>
                                                                    {student.status || "Not marked"}
                                                                </span>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <EmptyState
                                    icon={Calendar}
                                    title="No data found"
                                    description="No attendance data available for the selected date."
                                />
                            )}
                        </CardContent>
                    </Card>
                </>
            )}

            {/* Monthly Report */}
            {reportType === "monthly" && (
                <>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Monthly Attendance Report</CardTitle>
                            <Button variant="outline" size="sm" onClick={handleExportMonthly}>
                                <Download className="mr-2 h-4 w-4" />
                                Export Excel
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <div className="mb-4">
                                <Label htmlFor="monthly-date">Month</Label>
                                <Input
                                    id="monthly-date"
                                    type="month"
                                    value={selectedMonth}
                                    onChange={(e) => setSelectedMonth(e.target.value)}
                                    className="mt-2 max-w-xs"
                                />
                            </div>
                            {loadingMonthly ? (
                                <div className="space-y-2">
                                    {[...Array(5)].map((_, i) => (
                                        <Skeleton key={i} className="h-12 w-full" />
                                    ))}
                                </div>
                            ) : monthlyReport?.data ? (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Student</TableHead>
                                            <TableHead>Class</TableHead>
                                            <TableHead>Present</TableHead>
                                            <TableHead>Absent</TableHead>
                                            <TableHead>Total Days</TableHead>
                                            <TableHead>Percentage</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {monthlyReport.data.map((student: any) => (
                                            <TableRow key={student.studentId}>
                                                <TableCell className="font-medium">{student.studentName}</TableCell>
                                                <TableCell>{student.class}-{student.section}</TableCell>
                                                <TableCell>{student.presentDays || 0}</TableCell>
                                                <TableCell>{student.absentDays || 0}</TableCell>
                                                <TableCell>{student.totalDays || 0}</TableCell>
                                                <TableCell>
                                                    <span className={student.percentage >= 75 ? "text-success" : "text-destructive"}>
                                                        {student.percentage?.toFixed(1) || 0}%
                                                    </span>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            ) : (
                                <EmptyState
                                    icon={FileText}
                                    title="No data found"
                                    description="No attendance data available for the selected month."
                                />
                            )}
                        </CardContent>
                    </Card>
                </>
            )}

            {/* Defaulters Report */}
            {reportType === "defaulters" && (
                <>
                    <Card>
                        <CardHeader>
                            <CardTitle>Attendance Defaulters (&lt; 75%)</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {loadingDefaulters ? (
                                <div className="space-y-2">
                                    {[...Array(5)].map((_, i) => (
                                        <Skeleton key={i} className="h-12 w-full" />
                                    ))}
                                </div>
                            ) : defaultersReport?.data && defaultersReport.data.length > 0 ? (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Student</TableHead>
                                            <TableHead>Class</TableHead>
                                            <TableHead>Present Days</TableHead>
                                            <TableHead>Absent Days</TableHead>
                                            <TableHead>Total Days</TableHead>
                                            <TableHead>Percentage</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {defaultersReport.data.map((student: any) => (
                                            <TableRow key={student.studentId}>
                                                <TableCell className="font-medium">{student.studentName}</TableCell>
                                                <TableCell>{student.class}-{student.section}</TableCell>
                                                <TableCell>{student.presentDays || 0}</TableCell>
                                                <TableCell>{student.absentDays || 0}</TableCell>
                                                <TableCell>{student.totalDays || 0}</TableCell>
                                                <TableCell>
                                                    <span className="text-red-600 font-semibold">
                                                        {student.percentage?.toFixed(1) || 0}%
                                                    </span>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            ) : (
                                <EmptyState
                                    icon={TrendingDown}
                                    title="No defaulters found"
                                    description="All students have attendance above 75%."
                                />
                            )}
                        </CardContent>
                    </Card>
                </>
            )}
        </div>
    )
}

