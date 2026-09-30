import { create } from 'zustand';
import { authApi, User } from '@/lib/api/auth';
import Cookies from 'js-cookie';

interface AuthState {
    user: User | null;
    isLoading: boolean;
    error: string | null;
    login: (email: string, password: string, role: 'ADMIN' | 'TEACHER' | 'PARENT') => Promise<void>;
    register: (email: string, name: string, role: 'ADMIN' | 'TEACHER' | 'PARENT', schoolId: string) => Promise<any>;
    logout: () => Promise<void>;
    loadUser: () => void;
    clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
    user: null,
    isLoading: false,
    error: null,

    login: async (email, password, role) => {
        set({ isLoading: true, error: null });
        try {
            const data = await authApi.login({ email, password, role });
            set({ user: data.user, isLoading: false });
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Login failed';
            set({ error: errorMessage, isLoading: false });
            throw error;
        }
    },

    register: async (email, name, role, schoolId) => {
        set({ isLoading: true, error: null });
        try {
            const data = await authApi.register({ email, name, role, schoolId });
            set({ isLoading: false });
            return data;
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Registration failed';
            set({ error: errorMessage, isLoading: false });
            throw error;
        }
    },

    logout: async () => {
        const refreshToken = Cookies.get('refreshToken');
        if (refreshToken) {
            await authApi.logout(refreshToken);
        }
        set({ user: null });
    },

    loadUser: () => {
        const storedUser = authApi.getStoredUser();
        if (storedUser) {
            set({ user: storedUser });
        }
    },

    clearError: () => set({ error: null }),
}));
