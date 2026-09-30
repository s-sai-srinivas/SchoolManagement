import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios'
import Cookies from 'js-cookie'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'

// Create axios instance
const apiClient: AxiosInstance = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true, // For cookies if needed
})

// Request interceptor - Add JWT token to requests
apiClient.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        // Get token from cookies (consistent with auth.ts)
        const token = Cookies.get('accessToken')

        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`
        }

        return config
    },
    (error: AxiosError) => {
        return Promise.reject(error)
    }
)

// Response interceptor - Handle 401 and token refresh
apiClient.interceptors.response.use(
    (response) => {
        return response
    },
    async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

        // Handle 401 Unauthorized
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true

            try {
                // Try to refresh the token
                const refreshToken = Cookies.get('refreshToken')

                if (!refreshToken) {
                    // No refresh token, redirect to login
                    Cookies.remove('accessToken')
                    Cookies.remove('refreshToken')
                    Cookies.remove('user')
                    if (typeof window !== 'undefined') {
                        window.location.href = '/login'
                    }
                    return Promise.reject(error)
                }

                // Call refresh endpoint
                const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
                    refreshToken,
                })

                const { accessToken, refreshToken: newRefreshToken } = response.data

                // Save new tokens in cookies
                Cookies.set('accessToken', accessToken, { expires: 1 / 96 }) // 15 minutes
                if (newRefreshToken) {
                    Cookies.set('refreshToken', newRefreshToken, { expires: 7 }) // 7 days
                }

                // Retry original request with new token
                if (originalRequest.headers) {
                    originalRequest.headers.Authorization = `Bearer ${accessToken}`
                }

                return apiClient(originalRequest)
            } catch (refreshError) {
                // Refresh failed, redirect to login
                Cookies.remove('accessToken')
                Cookies.remove('refreshToken')
                Cookies.remove('user')
                if (typeof window !== 'undefined') {
                    window.location.href = '/login'
                }
                return Promise.reject(refreshError)
            }
        }

        return Promise.reject(error)
    }
)

export default apiClient
