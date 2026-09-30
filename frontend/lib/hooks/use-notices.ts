import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { noticeApi } from '../api/endpoints'

export function useNotices(params?: { skip?: number; take?: number }) {
    return useQuery({
        queryKey: ['notices', params],
        queryFn: () => noticeApi.getAll(params),
    })
}

export function useNotice(id: string) {
    return useQuery({
        queryKey: ['notices', id],
        queryFn: () => noticeApi.getById(id),
        enabled: !!id,
    })
}

export function useCreateNotice() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: noticeApi.create,
        onSuccess: async () => {
            // Invalidate and refetch all notices queries (with any params)
            await queryClient.invalidateQueries({ 
                queryKey: ['notices'],
                exact: false, // Match all queries starting with ['notices']
            })
            // Force refetch to ensure data is updated
            await queryClient.refetchQueries({ 
                queryKey: ['notices'],
                exact: false,
            })
        },
    })
}

export function useDeleteNotice() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: noticeApi.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notices'] })
        },
    })
}
