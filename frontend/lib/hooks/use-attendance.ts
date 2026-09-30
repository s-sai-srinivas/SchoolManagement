import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { attendanceApi } from '../api/attendance'

// Mark single attendance
export function useMarkAttendance() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: attendanceApi.mark,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['attendance'] })
        },
    })
}

// Bulk mark attendance
export function useBulkMarkAttendance() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: attendanceApi.bulkMark,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['attendance'] })
        },
    })
}

// Get student attendance
export function useStudentAttendance(studentId: string, params?: { month?: string; startDate?: string; endDate?: string }) {
    return useQuery({
        queryKey: ['attendance', 'student', studentId, params],
        queryFn: () => attendanceApi.getByStudent(studentId, params),
        enabled: !!studentId,
    })
}

// Get class attendance for a date
export function useClassAttendance(classNum: string, section: string, date: string) {
    return useQuery({
        queryKey: ['attendance', 'class', classNum, section, date],
        queryFn: () => attendanceApi.getByClass(classNum, section, date),
        enabled: !!classNum && !!section && !!date,
    })
}

// Update attendance
export function useUpdateAttendance() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: { status: 'PRESENT' | 'ABSENT' | 'LATE' | 'LEAVE' } }) =>
            attendanceApi.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['attendance'] })
        },
    })
}

// Daily report (admin only)
export function useDailyAttendanceReport(params?: { date?: string; class?: string; section?: string }) {
    return useQuery({
        queryKey: ['attendance', 'report', 'daily', params],
        queryFn: () => attendanceApi.getDailyReport(params),
    })
}

// Monthly report (admin only)
export function useMonthlyAttendanceReport(params?: { month?: string; studentId?: string }) {
    return useQuery({
        queryKey: ['attendance', 'report', 'monthly', params],
        queryFn: () => attendanceApi.getMonthlyReport(params),
    })
}

// Defaulters report (admin only)
export function useAttendanceDefaultersReport(params?: { threshold?: number }) {
    return useQuery({
        queryKey: ['attendance', 'report', 'defaulters', params],
        queryFn: () => attendanceApi.getDefaultersReport(params),
    })
}



