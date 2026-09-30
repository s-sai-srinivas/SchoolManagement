import { useQuery } from '@tanstack/react-query'
import { reportApi } from '../api/endpoints'

export function useFeeCollectionReport(params?: { startDate?: string; endDate?: string; groupBy?: string }) {
    return useQuery({
        queryKey: ['reports', 'fees', 'collection', params],
        queryFn: () => reportApi.feeCollection(params),
    })
}

export function useOutstandingFeesReport(params?: { class?: string; section?: string }) {
    return useQuery({
        queryKey: ['reports', 'fees', 'outstanding', params],
        queryFn: () => reportApi.outstandingFees(params),
    })
}

export function useFeeDefaultersReport() {
    return useQuery({
        queryKey: ['reports', 'fees', 'defaulters'],
        queryFn: () => reportApi.feeDefaulters(),
    })
}

export function useDailyAttendanceReport(params?: { date?: string; class?: string; section?: string }) {
    return useQuery({
        queryKey: ['reports', 'attendance', 'daily', params],
        queryFn: () => reportApi.dailyAttendance(params),
    })
}
