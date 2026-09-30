import apiClient from './client'

// Attendance API endpoints
export const attendanceApi = {
    // Mark single attendance
    mark: (data: { studentId: string; date: string; status: 'PRESENT' | 'ABSENT' | 'LATE' | 'LEAVE' }) =>
        apiClient.post('/attendance/mark', data),

    // Bulk mark attendance
    bulkMark: (data: { class: string; section: string; date: string; attendance: Array<{ studentId: string; status: 'PRESENT' | 'ABSENT' | 'LATE' | 'LEAVE' }> }) =>
        apiClient.post('/attendance/bulk', data),

    // Get student attendance history
    getByStudent: (studentId: string, params?: { month?: string; startDate?: string; endDate?: string }) =>
        apiClient.get(`/attendance/student/${studentId}`, { params }),

    // Get class attendance for a date
    getByClass: (classNum: string, section: string, date: string) =>
        apiClient.get(`/attendance/class/${classNum}/${section}`, { params: { date } }),

    // Update attendance
    update: (id: string, data: { status: 'PRESENT' | 'ABSENT' | 'LATE' | 'LEAVE' }) =>
        apiClient.patch(`/attendance/${id}`, data),

    // Daily report (admin only)
    getDailyReport: (params?: { date?: string; class?: string; section?: string }) =>
        apiClient.get('/attendance/report/daily', { params }),

    // Monthly report (admin only)
    getMonthlyReport: (params?: { month?: string; studentId?: string }) =>
        apiClient.get('/attendance/report/monthly', { params }),

    // Defaulters report (admin only)
    getDefaultersReport: (params?: { threshold?: number }) =>
        apiClient.get('/attendance/report/defaulters', { params }),
}



