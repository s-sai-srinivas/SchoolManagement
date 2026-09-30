import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { userApi } from '../api/endpoints'

export function useUsers(params?: { role?: string; skip?: number; take?: number }) {
    return useQuery({
        queryKey: ['users', params],
        queryFn: () => userApi.getAll(params),
    })
}

export function useUser(id: string) {
    return useQuery({
        queryKey: ['users', id],
        queryFn: () => userApi.getById(id),
        enabled: !!id,
    })
}

export function useCreateTeacher() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: userApi.createTeacher,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] })
        },
    })
}

export function useCreateParent() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: userApi.createParent,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] })
        },
    })
}

export function useUpdateUser() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: any }) => userApi.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] })
        },
    })
}

export function useDeleteUser() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: userApi.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] })
        },
    })
}
