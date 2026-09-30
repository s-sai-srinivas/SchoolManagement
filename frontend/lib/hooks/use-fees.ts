import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { feeApi } from '../api/endpoints'
import { useAuthStore } from '../stores/auth-store'

export function useFeeStructure() {
    const { user } = useAuthStore()
    return useQuery({
        queryKey: ['fees', 'structure', user?.schoolId],
        queryFn: () => feeApi.getStructure(user!.schoolId),
        enabled: !!user?.schoolId,
    })
}

export function useCreateFeeStructure() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: feeApi.createStructure,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['fees', 'structure'] })
        },
    })
}

export function useUpdateFeeStructure() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: any }) => feeApi.updateStructure(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['fees', 'structure'] })
        },
    })
}

export function usePendingFees(studentId: string) {
    return useQuery({
        queryKey: ['fees', 'pending', studentId],
        queryFn: () => feeApi.getPendingByStudent(studentId),
        enabled: !!studentId,
    })
}

export function useFeePayments(params?: { studentId?: string; skip?: number; take?: number }) {
    return useQuery({
        queryKey: ['fees', 'payments', params],
        queryFn: () => feeApi.getPayments(params),
        enabled: !params?.studentId || !!params.studentId,
    })
}

export function useCreateFeeOrder() {
    return useMutation({
        mutationFn: feeApi.createOrder,
    })
}

export function useVerifyPayment() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: feeApi.verifyPayment,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['fees'] })
        },
    })
}

export function useCreateManualPayment() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: feeApi.createManualPayment,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['fees'] })
        },
    })
}
