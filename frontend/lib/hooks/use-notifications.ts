import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { notificationApi } from '../api/endpoints'

export function useNotifications(params?: { skip?: number; take?: number }) {
    return useQuery({
        queryKey: ['notifications', params],
        queryFn: () => notificationApi.getAll(params),
    })
}

export function useUnreadCount() {
    return useQuery({
        queryKey: ['notifications', 'unread-count'],
        queryFn: () => notificationApi.getUnreadCount(),
        refetchInterval: 30000, // Refetch every 30 seconds
    })
}

export function useMarkAsRead() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: notificationApi.markAsRead,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] })
        },
    })
}

export function useMarkAllAsRead() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: notificationApi.markAllAsRead,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] })
        },
    })
}
