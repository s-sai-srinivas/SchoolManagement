import apiClient from './client'
import Cookies from 'js-cookie'

// Note: API base URL is configured in client.ts and uses port 3001

// Auth endpoints
export const authApi = {
    login: async (email: string, password: string, role: string) => {
        const response = await apiClient.post('/auth/login', { email, password, role })
        const { accessToken, refreshToken, user } = response.data

        // Store tokens in cookies (consistent with client.ts interceptor)
        Cookies.set('accessToken', accessToken, { expires: 1 / 96 }) // 15 minutes
        Cookies.set('refreshToken', refreshToken, { expires: 7 }) // 7 days
        Cookies.set('user', JSON.stringify(user), { expires: 7 })

        return response
    },

    register: (data: { schoolName: string; adminName: string; email: string; password: string }) =>
        apiClient.post('/auth/register', data),

    refresh: (refreshToken: string) =>
        apiClient.post('/auth/refresh', { refreshToken }),

    me: () =>
        apiClient.get('/auth/me'),

    logout: async () => {
        const refreshToken = Cookies.get('refreshToken')
        try {
            await apiClient.post('/auth/logout', { refreshToken })
        } finally {
            // Clear tokens regardless of API response
            Cookies.remove('accessToken')
            Cookies.remove('refreshToken')
            Cookies.remove('user')
        }
    },
}

// School endpoints
export const schoolApi = {
    getById: (id: string) =>
        apiClient.get(`/schools/${id}`),

    update: (id: string, data: any) =>
        apiClient.patch(`/schools/${id}`, data),

    uploadLogo: (id: string, file: File) => {
        const formData = new FormData()
        formData.append('file', file)
        return apiClient.post(`/schools/${id}/logo`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        })
    },
}

// User endpoints
export const userApi = {
    getAll: (params?: { role?: string; skip?: number; take?: number }) =>
        apiClient.get('/users', { params }),

    getById: (id: string) =>
        apiClient.get(`/users/${id}`),

    createTeacher: (data: { email: string; name: string; schoolId: string }) =>
        apiClient.post('/users/teacher', data),

    createParent: (data: { email: string; name: string; schoolId: string }) =>
        apiClient.post('/users/parent', data),

    update: (id: string, data: any) =>
        apiClient.patch(`/users/${id}`, data),

    delete: (id: string) =>
        apiClient.delete(`/users/${id}`),
}

// Student endpoints
export const studentApi = {
    getAll: (params?: { class?: string; section?: string; parentId?: string; skip?: number; take?: number }) =>
        apiClient.get('/students', { params }),

    getById: (id: string) =>
        apiClient.get(`/students/${id}`),

    create: (data: any) =>
        apiClient.post('/students', data),

    update: (id: string, data: any) =>
        apiClient.patch(`/students/${id}`, data),

    delete: (id: string) =>
        apiClient.delete(`/students/${id}`),

    assignParent: (studentId: string, parentId: string) =>
        apiClient.post(`/students/${studentId}/assign-parent`, { parentId }),

    count: () =>
        apiClient.get('/students/count'),
}

// Fee endpoints
export const feeApi = {
    // Fee Structure
    getStructure: (schoolId: string) =>
        apiClient.get(`/fees/structure/${schoolId}`),

    createStructure: (data: { schoolId: string; annualAmountPaise: number; installments: number; installmentDates: string[] }) =>
        apiClient.post('/fees/structure', data),

    updateStructure: (id: string, data: any) =>
        apiClient.patch(`/fees/structure/${id}`, data),

    // Fee Payments
    getPayments: (params?: { studentId?: string; skip?: number; take?: number }) =>
        apiClient.get('/fees/payments', { params }),

    getPendingByStudent: (studentId: string) =>
        apiClient.get(`/fees/student/${studentId}/pending`),

    createOrder: (data: { studentId: string; installmentNo: number }) =>
        apiClient.post('/fees/create-order', data),

    verifyPayment: (data: { razorpayOrderId: string; razorpayPaymentId: string; razorpaySignature: string }) =>
        apiClient.post('/fees/webhook', data),

    downloadReceipt: (id: string) =>
        apiClient.get(`/fees/payment/${id}/receipt`, { responseType: 'blob' }),

    createManualPayment: (data: { studentId: string; amountPaise: number; installmentNo: number; paymentMode: 'CASH' | 'CHEQUE'; receiptNumber?: string }) =>
        apiClient.post('/fees/manual-entry', data),
}

// Homework endpoints
export const homeworkApi = {
    getAll: (params?: { skip?: number; take?: number }) =>
        apiClient.get('/homework', { params }),

    getById: (id: string) =>
        apiClient.get(`/homework/${id}`),

    getByClass: (classNum: string, section: string) =>
        apiClient.get(`/homework/class/${classNum}/${section}`),

    getByStudent: (studentId: string) =>
        apiClient.get(`/homework/student/${studentId}`),

    create: (data: any) => {
        if (data.file) {
            const formData = new FormData()
            Object.keys(data).forEach(key => {
                formData.append(key, data[key])
            })
            return apiClient.post('/homework', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            })
        }
        return apiClient.post('/homework', data)
    },

    update: (id: string, data: any) =>
        apiClient.patch(`/homework/${id}`, data),

    delete: (id: string) =>
        apiClient.delete(`/homework/${id}`),
}

// Notice endpoints
export const noticeApi = {
    getAll: (params?: { skip?: number; take?: number }) =>
        apiClient.get('/notices', { params }),

    getById: (id: string) =>
        apiClient.get(`/notices/${id}`),

    create: (data: any) =>
        apiClient.post('/notices', data),

    delete: (id: string) =>
        apiClient.delete(`/notices/${id}`),
}

// Notification endpoints
export const notificationApi = {
    getAll: (params?: { skip?: number; take?: number }) =>
        apiClient.get('/notifications', { params }),

    markAsRead: (id: string) =>
        apiClient.patch(`/notifications/${id}/read`),

    markAllAsRead: () =>
        apiClient.patch('/notifications/read-all'),

    getUnreadCount: () =>
        apiClient.get('/notifications/unread-count'),
}

// Report endpoints
export const reportApi = {
    // Fee Reports
    feeCollection: (params?: { startDate?: string; endDate?: string; groupBy?: string }) =>
        apiClient.get('/reports/fees/collection', { params }),

    feeCollectionExport: (params?: { startDate?: string; endDate?: string; groupBy?: string }) =>
        apiClient.get('/reports/fees/collection/export', { params, responseType: 'blob' }),

    outstandingFees: (params?: { class?: string; section?: string }) =>
        apiClient.get('/reports/fees/outstanding', { params }),

    outstandingFeesExport: (params?: { class?: string; section?: string }) =>
        apiClient.get('/reports/fees/outstanding/export', { params, responseType: 'blob' }),

    feeDefaulters: () =>
        apiClient.get('/reports/fees/defaulters'),

    feeDefaultersExport: () =>
        apiClient.get('/reports/fees/defaulters/export', { responseType: 'blob' }),

    // Attendance Reports
    dailyAttendance: (params?: { date?: string; class?: string; section?: string }) =>
        apiClient.get('/reports/attendance/daily', { params }),

    monthlyAttendance: (params?: { month?: string; studentId?: string }) =>
        apiClient.get('/reports/attendance/monthly', { params }),

    monthlyAttendanceExport: (params?: { month?: string; studentId?: string }) =>
        apiClient.get('/reports/attendance/monthly/export', { params, responseType: 'blob' }),

    attendanceDefaulters: () =>
        apiClient.get('/reports/attendance/defaulters'),
}
