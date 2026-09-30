import api from './client';
import Cookies from 'js-cookie';

export interface LoginCredentials {
    email: string;
    password: string;
    role: 'ADMIN' | 'TEACHER' | 'PARENT';
}

export interface RegisterData {
    email: string;
    name: string;
    role: 'ADMIN' | 'TEACHER' | 'PARENT';
    schoolId: string;
}

export interface User {
    id: string;
    email: string;
    name: string;
    role: 'ADMIN' | 'TEACHER' | 'PARENT';
    schoolId: string;
    school: {
        id: string;
        name: string;
        logoUrl?: string;
    };
    children?: any[];
    assignments?: any[];
}

export interface AuthResponse {
    accessToken: string;
    refreshToken: string;
    user: User;
}

export const authApi = {
    async login(credentials: LoginCredentials): Promise<AuthResponse> {
        const { data } = await api.post('/auth/login', credentials);

        // Store tokens in cookies
        Cookies.set('accessToken', data.accessToken, { expires: 1 / 96 }); // 15 minutes
        Cookies.set('refreshToken', data.refreshToken, { expires: 7 }); // 7 days
        Cookies.set('user', JSON.stringify(data.user), { expires: 7 });

        return data;
    },

    async register(registerData: RegisterData) {
        const { data } = await api.post('/auth/register', registerData);
        return data;
    },

    async logout(refreshToken: string): Promise<void> {
        try {
            await api.post('/auth/logout', { refreshToken });
        } finally {
            // Clear tokens regardless of API response
            Cookies.remove('accessToken');
            Cookies.remove('refreshToken');
            Cookies.remove('user');
        }
    },

    async getCurrentUser(): Promise<User> {
        const { data } = await api.get('/auth/me');
        Cookies.set('user', JSON.stringify(data), { expires: 7 });
        return data;
    },

    getStoredUser(): User | null {
        const userStr = Cookies.get('user');
        if (!userStr) return null;
        try {
            return JSON.parse(userStr);
        } catch {
            return null;
        }
    },

    isAuthenticated(): boolean {
        return !!Cookies.get('accessToken');
    },
};
