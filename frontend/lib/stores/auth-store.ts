import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import Cookies from 'js-cookie'

interface User {
    id: string
    email: string
    name: string
    role: 'ADMIN' | 'TEACHER' | 'PARENT' | 'STUDENT'
    schoolId: string
}

interface AuthState {
    user: User | null
    accessToken: string | null
    refreshToken: string | null
    isAuthenticated: boolean

    // Actions
    setAuth: (user: User, accessToken: string, refreshToken: string) => void
    logout: () => void
    updateUser: (user: Partial<User>) => void
    loadFromCookies: () => void // Load auth state from cookies
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => {
            // Load auth state from cookies
            const loadFromCookies = () => {
                if (typeof window === 'undefined') return
                
                const accessToken = Cookies.get('accessToken')
                const userStr = Cookies.get('user')
                
                if (accessToken && userStr) {
                    try {
                        const user = JSON.parse(userStr)
                        set({
                            user,
                            accessToken,
                            refreshToken: Cookies.get('refreshToken') || null,
                            isAuthenticated: true,
                        })
                    } catch (e) {
                        console.error('Failed to parse user from cookies:', e)
                    }
                }
            }

            return {
                user: null,
                accessToken: null,
                refreshToken: null,
                isAuthenticated: false,

                setAuth: (user, accessToken, refreshToken) => {
                    // Tokens are stored in cookies by authApi.login, but we also store in state
                    set({
                        user,
                        accessToken,
                        refreshToken,
                        isAuthenticated: true,
                    })
                },

                logout: () => {
                    // Clear cookies (tokens are stored in cookies)
                    Cookies.remove('accessToken')
                    Cookies.remove('refreshToken')
                    Cookies.remove('user')

                    set({
                        user: null,
                        accessToken: null,
                        refreshToken: null,
                        isAuthenticated: false,
                    })
                },

                updateUser: (updatedUser) =>
                    set((state) => ({
                        user: state.user ? { ...state.user, ...updatedUser } : null,
                    })),

                loadFromCookies,
            }
        },
        {
            name: 'auth-storage',
        }
    )
)
