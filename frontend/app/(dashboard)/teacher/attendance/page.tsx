"use client"

import { useState, useEffect, useMemo } from "react"
import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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
import { CheckCircle2, XCircle, Clock, Home, Save, ChevronLeft, ChevronRight, Users } from "lucide-react"
import { useCurrentUser } from "@/lib/hooks/use-current-user"
import { useStudents } from "@/lib/hooks/use-students"
import { useClassAttendance, useBulkMarkAttendance } from "@/lib/hooks/use-attendance"
import { Skeleton } from "@/components/ui/skeleton"
import { EmptyState } from "@/components/common/empty-state"
import { PageHeader } from "@/components/layout/page-header"
import { Calendar } from "lucide-react"
import { format, addDays, subDays, isToday, isSameDay } from "date-fns"
import { toast } from "sonner"

type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE' | 'LEAVE'

export default function TeacherAttendancePage() {
    const { data: currentUser, isLoading: loadingUser } = useCurrentUser()
    const assignments = currentUser?.assignments || []
    const firstAssignment = assignments[0]

    const [selectedClass, setSelectedClass] = useState<string>(firstAssignment?.class || "")
    const [selectedSection, setSelectedSection] = useState<string>(firstAssignment?.section || "")
    const [selectedDate, setSelectedDate] = useState<string>(format(new Date(), "yyyy-MM-dd"))

    // Get students for selected class
    const { data: studentsData, isLoading: loadingStudents } = useStudents({
        class: selectedClass,
        section: selectedSection,
    })
    const students = studentsData?.data || []

    // Get existing attendance for the date
    const { data: attendanceData, isLoading: loadingAttendance } = useClassAttendance(
        selectedClass,
        selectedSection,
        selectedDate
    )
    // Ensure existingAttendance is always an array
    const existingAttendance = useMemo(() => {
        const data = attendanceData?.data
        if (!data) return []
        if (Array.isArray(data)) return data
        // If data is an object with an array property, extract it
        if (typeof data === 'object' && 'data' in data && Array.isArray(data.data)) {
            return data.data
        }
        // If data is an object with an array property named differently
        if (typeof data === 'object' && 'attendance' in data && Array.isArray(data.attendance)) {
            return data.attendance
        }
        // If it's a single object, wrap it in an array
        if (typeof data === 'object' && 'studentId' in data) {
            return [data]
        }
        return []
    }, [attendanceData])

    // Create a map of studentId -> attendance status
    const attendanceMap = useMemo(() => {
        const map = new Map<string, AttendanceStatus>()
        if (Array.isArray(existingAttendance)) {
            existingAttendance.forEach((att: any) => {
                if (att && att.studentId && att.status) {
                    map.set(att.studentId, att.status)
                }
            })
        }
        return map
    }, [existingAttendance])

    // State for marking attendance
    const [attendanceStatuses, setAttendanceStatuses] = useState<Map<string, AttendanceStatus>>(() => {
        const initialMap = new Map<string, AttendanceStatus>()
        if (Array.isArray(existingAttendance)) {
            existingAttendance.forEach((att: any) => {
                if (att && att.studentId && att.status) {
                    initialMap.set(att.studentId, att.status)
                }
            })
        }
        // Default all students to PRESENT if not marked
        students.forEach((student: any) => {
            if (!initialMap.has(student.id)) {
                initialMap.set(student.id, 'PRESENT')
            }
        })
        return initialMap
    })

    // Update when existing attendance changes
    React.useEffect(() => {
        const newMap = new Map<string, AttendanceStatus>()
        if (Array.isArray(existingAttendance)) {
            existingAttendance.forEach((att: any) => {
                if (att && att.studentId && att.status) {
                    newMap.set(att.studentId, att.status)
                }
            })
        }
        students.forEach((student: any) => {
            if (!newMap.has(student.id)) {
                // Preserve existing status if available, otherwise default to PRESENT
                const existingStatus = attendanceStatuses.get(student.id)
                newMap.set(student.id, existingStatus || 'PRESENT')
            }
        })
        // Only update if there are actual changes to prevent infinite loop
        const hasChanges = Array.from(newMap.entries()).some(([id, status]) =>
            attendanceStatuses.get(id) !== status
        ) || newMap.size !== attendanceStatuses.size

        if (hasChanges) {
            setAttendanceStatuses(newMap)
        }
    }, [existingAttendance, students, selectedClass, selectedSection, selectedDate])

    // Calculate attendance summary
    const attendanceSummary = useMemo(() => {
        const summary = {
            present: 0,
            absent: 0,
            late: 0,
            leave: 0,
            total: students.length,
        }

        attendanceStatuses.forEach((status) => {
            switch (status) {
                case 'PRESENT':
                    summary.present++
                    break
                case 'ABSENT':
                    summary.absent++
                    break
                case 'LATE':
                    summary.late++
                    break
                case 'LEAVE':
                    summary.leave++
                    break
            }
        })

        return summary
    }, [attendanceStatuses, students.length])

    const bulkMark = useBulkMarkAttendance()

    const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
        setAttendanceStatuses(prev => {
            const newMap = new Map(prev)
            newMap.set(studentId, status)
            return newMap
        })
    }

    const handleMarkAllPresent = () => {
        const newMap = new Map<string, AttendanceStatus>()
        students.forEach((student: any) => {
            newMap.set(student.id, 'PRESENT')
        })
        setAttendanceStatuses(newMap)
        toast.success("All students marked as present")
    }

    const handleSave = async () => {
        if (!selectedClass || !selectedSection || !selectedDate) {
            toast.error("Please select class, section, and date")
            return
        }

        const attendance = Array.from(attendanceStatuses.entries()).map(([studentId, status]) => ({
            studentId,
            status,
        }))

        if (attendance.length === 0) {
            toast.error("Please mark attendance for at least one student")
            return
        }

        try {
            await bulkMark.mutateAsync({
                class: selectedClass,
                section: selectedSection,
                date: selectedDate,
                attendance,
            })
            toast.success("Attendance marked successfully")
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to mark attendance")
        }
    }

    const handleDateChange = (days: number) => {
        const currentDate = new Date(selectedDate)
        const newDate = addDays(currentDate, days)
        const today = new Date()
        if (newDate <= today) {
            setSelectedDate(format(newDate, "yyyy-MM-dd"))
        }
    }

    const getStatusIcon = (status: AttendanceStatus) => {
        switch (status) {
            case 'PRESENT':
                return <CheckCircle2 className="h-5 w-5 text-success" />
            case 'ABSENT':
                return <XCircle className="h-5 w-5 text-destructive" />
            case 'LATE':
                return <Clock className="h-5 w-5 text-warning" />
            case 'LEAVE':
                return <Home className="h-5 w-5 text-info" />
        }
    }

    const getStatusBadge = (status: AttendanceStatus) => {
        const variants: Record<AttendanceStatus, "default" | "destructive" | "secondary" | "outline"> = {
            PRESENT: "default",
            ABSENT: "destructive",
            LATE: "secondary",
            LEAVE: "outline",
        }
        return <Badge variant={variants[status]}>{status}</Badge>
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

    if (assignments.length === 0) {
        return (
            <div className="flex flex-col gap-6">
                <PageHeader
                    title="Mark Attendance"
                    description="Mark attendance for your assigned classes."
                />
                <EmptyState
                    icon={Calendar}
                    title="No class assignments"
                    description="You haven't been assigned to any classes yet. Please contact your administrator to get assigned to classes."
                />
            </div>
        )
    }

    const dateObj = new Date(selectedDate)
    const isSelectedDateToday = isToday(dateObj)

    return (
        <div className="flex flex-col gap-6">
            <PageHeader
                title="Mark Attendance"
                description="Record and manage attendance for your assigned classes."
            />

            {/* Class and Date Selector */}
            <Card>
                <CardHeader>
                    <CardTitle>Select Class and Date</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-3">
                        <div>
                            <Label htmlFor="class-select">Class</Label>
                            <Select value={selectedClass} onValueChange={(value) => {
                                setSelectedClass(value)
                                const newSection = assignments.find((a: any) => a.class === value)?.section || ""
                                setSelectedSection(newSection)
                            }}>
                                <SelectTrigger id="class-select">
                                    <SelectValue placeholder="Select class" />
                                </SelectTrigger>
                                <SelectContent>
                                    {assignments.map((assignment: any, idx: number) => (
                                        <SelectItem key={idx} value={assignment.class}>
                                            Class {assignment.class}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label htmlFor="section-select">Section</Label>
                            <Select value={selectedSection} onValueChange={setSelectedSection}>
                                <SelectTrigger id="section-select">
                                    <SelectValue placeholder="Select section" />
                                </SelectTrigger>
                                <SelectContent>
                                    {assignments
                                        .filter((a: any) => a.class === selectedClass)
                                        .map((assignment: any, idx: number) => (
                                            <SelectItem key={idx} value={assignment.section}>
                                                Section {assignment.section}
                                            </SelectItem>
                                        ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label htmlFor="date-input">Date</Label>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => handleDateChange(-1)}
                                    disabled={isSelectedDateToday}
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <Input
                                    id="date-input"
                                    type="date"
                                    value={selectedDate}
                                    onChange={(e) => setSelectedDate(e.target.value)}
                                    max={format(new Date(), "yyyy-MM-dd")}
                                    className="flex-1"
                                />
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => handleDateChange(1)}
                                    disabled={isSelectedDateToday}
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {loadingStudents || loadingAttendance ? (
                <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                        <Skeleton key={i} className="h-16 w-full" />
                    ))}
                </div>
            ) : students.length === 0 ? (
                <EmptyState
                    icon={Calendar}
                    title="No students found"
                    description={`No students found in Class ${selectedClass}-${selectedSection}.`}
                />
            ) : (
                <>
                    {/* Attendance Summary */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                                <span>Attendance Summary - {format(dateObj, "MMM d, yyyy")}</span>
                                {isSelectedDateToday && (
                                    <Badge variant="secondary">Today</Badge>
                                )}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                                <div className="text-center p-4 rounded-lg bg-success/10 border border-success/20">
                                    <div className="text-2xl font-bold text-success">{attendanceSummary.present}</div>
                                    <div className="text-sm text-muted-foreground mt-1">Present</div>
                                </div>
                                <div className="text-center p-4 rounded-lg bg-destructive/10 border border-destructive/20">
                                    <div className="text-2xl font-bold text-destructive">{attendanceSummary.absent}</div>
                                    <div className="text-sm text-muted-foreground mt-1">Absent</div>
                                </div>
                                <div className="text-center p-4 rounded-lg bg-warning/10 border border-warning/20">
                                    <div className="text-2xl font-bold text-warning">{attendanceSummary.late}</div>
                                    <div className="text-sm text-muted-foreground mt-1">Late</div>
                                </div>
                                <div className="text-center p-4 rounded-lg bg-info/10 border border-info/20">
                                    <div className="text-2xl font-bold text-info">{attendanceSummary.leave}</div>
                                    <div className="text-sm text-muted-foreground mt-1">Leave</div>
                                </div>
                                <div className="text-center p-4 rounded-lg bg-muted border border-border/50">
                                    <div className="text-2xl font-bold text-foreground">{attendanceSummary.total}</div>
                                    <div className="text-sm text-muted-foreground mt-1">Total</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Attendance Table */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Students</CardTitle>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleMarkAllPresent}
                                >
                                    <Users className="mr-2 h-4 w-4" />
                                    Mark All Present
                                </Button>
                                <Button onClick={handleSave} disabled={bulkMark.isPending}>
                                    <Save className="mr-2 h-4 w-4" />
                                    {bulkMark.isPending ? "Saving..." : "Save Attendance"}
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Admission No</TableHead>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {students.map((student: any) => {
                                        const currentStatus = attendanceStatuses.get(student.id) || attendanceMap.get(student.id) || 'PRESENT'
                                        return (
                                            <TableRow key={student.id}>
                                                <TableCell className="font-medium">{student.admissionNo}</TableCell>
                                                <TableCell>{student.name}</TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        {getStatusIcon(currentStatus)}
                                                        {getStatusBadge(currentStatus)}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex gap-2 flex-wrap">
                                                        <Button
                                                            variant={currentStatus === 'PRESENT' ? 'default' : 'outline'}
                                                            size="sm"
                                                            onClick={() => handleStatusChange(student.id, 'PRESENT')}
                                                        >
                                                            Present
                                                        </Button>
                                                        <Button
                                                            variant={currentStatus === 'ABSENT' ? 'destructive' : 'outline'}
                                                            size="sm"
                                                            onClick={() => handleStatusChange(student.id, 'ABSENT')}
                                                        >
                                                            Absent
                                                        </Button>
                                                        <Button
                                                            variant={currentStatus === 'LATE' ? 'secondary' : 'outline'}
                                                            size="sm"
                                                            onClick={() => handleStatusChange(student.id, 'LATE')}
                                                        >
                                                            Late
                                                        </Button>
                                                        <Button
                                                            variant={currentStatus === 'LEAVE' ? 'outline' : 'outline'}
                                                            size="sm"
                                                            onClick={() => handleStatusChange(student.id, 'LEAVE')}
                                                        >
                                                            Leave
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        )
                                    })}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </>
            )}
        </div>
    )
}
