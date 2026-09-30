import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { homeworkApi } from '../api/endpoints'

export function useHomework(params?: { skip?: number; take?: number }) {
    return useQuery({
        queryKey: ['homework', params],
        queryFn: () => homeworkApi.getAll(params),
    })
}

export function useHomeworkByClass(classNum: string, section: string) {
    return useQuery({
        queryKey: ['homework', 'class', classNum, section],
        queryFn: () => homeworkApi.getByClass(classNum, section),
        enabled: !!classNum && !!section,
    })
}

export function useHomeworkByStudent(studentId: string) {
    return useQuery({
        queryKey: ['homework', 'student', studentId],
        queryFn: () => homeworkApi.getByStudent(studentId),
        enabled: !!studentId,
    })
}

export function useCreateHomework() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: homeworkApi.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['homework'] })
        },
    })
}

export function useDeleteHomework() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: homeworkApi.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['homework'] })
        },
    })
}
