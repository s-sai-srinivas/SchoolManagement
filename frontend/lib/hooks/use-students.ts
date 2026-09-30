import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { studentApi } from '../api/endpoints'

export function useStudents(params?: { class?: string; section?: string; parentId?: string; skip?: number; take?: number }) {
    return useQuery({
        queryKey: ['students', params],
        queryFn: () => studentApi.getAll(params),
    })
}

export function useStudent(id: string) {
    return useQuery({
        queryKey: ['students', id],
        queryFn: () => studentApi.getById(id),
        enabled: !!id,
    })
}

export function useCreateStudent() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: studentApi.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['students'] })
        },
    })
}

export function useUpdateStudent() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: any }) => studentApi.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['students'] })
        },
    })
}

export function useDeleteStudent() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: studentApi.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['students'] })
        },
    })
}

export function useStudentCount() {
    return useQuery({
        queryKey: ['students', 'count'],
        queryFn: () => studentApi.count(),
    })
}
