"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/stores/auth-store'
import { LoadingSpinner } from '@/components/common/loading-spinner'
import Cookies from 'js-cookie'

interface AuthGuardProps {
    children: React.ReactNode
}

export function AuthGuard({ children }: AuthGuardProps) {
    const router = useRouter()
    const { isAuthenticated, user, loadFromCookies } = useAuthStore()
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        // Load from cookies on mount
        loadFromCookies()
        
        // Check authentication after loading
        const checkAuth = () => {
            const hasToken = Cookies.get('accessToken')
            if (!hasToken) {
                router.push('/login')
                return
            }
            setIsLoading(false)
        }
        
        // Small delay to allow store to update
        const timer = setTimeout(checkAuth, 100)
        return () => clearTimeout(timer)
    }, [loadFromCookies, router])

    useEffect(() => {
        // Also check when isAuthenticated changes
        const hasToken = Cookies.get('accessToken')
        if (!isAuthenticated && !hasToken) {
            router.push('/login')
        } else if (isAuthenticated || hasToken) {
            setIsLoading(false)
        }
    }, [isAuthenticated, router])

    // Check cookies as fallback
    const hasToken = Cookies.get('accessToken')
    if (isLoading || (!isAuthenticated && !hasToken)) {
        return (
            <div className="flex h-screen items-center justify-center">
                <LoadingSpinner size="lg" />
            </div>
        )
    }

    return <>{children}</>
}
