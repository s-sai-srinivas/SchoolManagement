import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { schoolApi } from '../api/endpoints'
import { useAuthStore } from '../stores/auth-store'

export function useSchool() {
    const { user } = useAuthStore()
    return useQuery({
        queryKey: ['school', user?.schoolId],
        queryFn: () => schoolApi.getById(user!.schoolId),
        enabled: !!user?.schoolId,
    })
}

export function useUpdateSchool() {
    const queryClient = useQueryClient()
    const { user } = useAuthStore()
    return useMutation({
        mutationFn: (data: any) => schoolApi.update(user!.schoolId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['school'] })
        },
    })
}

export function useUploadLogo() {
    const queryClient = useQueryClient()
    const { user } = useAuthStore()
    return useMutation({
        mutationFn: (file: File) => schoolApi.uploadLogo(user!.schoolId, file),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['school'] })
        },
    })
}
