"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/stores/auth-store'
import { LoadingSpinner } from '@/components/common/loading-spinner'

interface RoleGuardProps {
    children: React.ReactNode
    allowedRoles: Array<'ADMIN' | 'TEACHER' | 'PARENT' | 'STUDENT'>
}

export function RoleGuard({ children, allowedRoles }: RoleGuardProps) {
    const router = useRouter()
    const { user, isAuthenticated } = useAuthStore()

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login')
            return
        }

        if (user && !allowedRoles.includes(user.role)) {
            // Redirect to appropriate dashboard based on role
            const roleRoutes = {
                ADMIN: '/admin/dashboard',
                TEACHER: '/teacher/dashboard',
                PARENT: '/parent/dashboard',
                STUDENT: '/student/dashboard',
            }
            router.push(roleRoutes[user.role])
        }
    }, [isAuthenticated, user, allowedRoles, router])

    if (!isAuthenticated || !user || !allowedRoles.includes(user.role)) {
        return (
            <div className="flex h-screen items-center justify-center">
                <LoadingSpinner size="lg" />
            </div>
        )
    }

    return <>{children}</>
}
