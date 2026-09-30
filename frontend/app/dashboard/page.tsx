'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/auth';
import { authApi } from '@/lib/api/auth';

export default function DashboardPage() {
    const router = useRouter();
    const { user, logout, loadUser } = useAuthStore();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Check authentication
        if (!authApi.isAuthenticated()) {
            router.push('/login');
            return;
        }

        // Load user from cookies
        loadUser();
        setIsLoading(false);
    }, [router, loadUser]);

    const handleLogout = async () => {
        await logout();
        router.push('/login');
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            {user.school.name}
                        </h1>
                        <p className="text-sm text-gray-600">School Management System</p>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                        Logout
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* User Info Card */}
                <div className="bg-white rounded-lg shadow p-6 mb-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Welcome, {user.name}!</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm text-gray-600">Email</p>
                            <p className="font-medium">{user.email}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Role</p>
                            <p className="font-medium">
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${user.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' :
                                        user.role === 'TEACHER' ? 'bg-blue-100 text-blue-800' :
                                            'bg-green-100 text-green-800'
                                    }`}>
                                    {user.role}
                                </span>
                            </p>
                        </div>
                    </div>
                </div>

                {/* Role-specific content */}
                {user.role === 'PARENT' && user.children && user.children.length > 0 && (
                    <div className="bg-white rounded-lg shadow p-6 mb-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">My Children</h3>
                        <div className="space-y-3">
                            {user.children.map((child: any) => (
                                <div key={child.id} className="border border-gray-200 rounded-lg p-4">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-medium text-gray-900">{child.name}</p>
                                            <p className="text-sm text-gray-600">
                                                Class {child.class} - Section {child.section}
                                            </p>
                                            <p className="text-xs text-gray-500 mt-1">
                                                Admission No: {child.admissionNo}
                                            </p>
                                        </div>
                                        <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                                            {child.relationType}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {user.role === 'TEACHER' && user.assignments && user.assignments.length > 0 && (
                    <div className="bg-white rounded-lg shadow p-6 mb-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">My Assignments</h3>
                        <div className="space-y-3">
                            {user.assignments.map((assignment: any) => (
                                <div key={assignment.id} className="border border-gray-200 rounded-lg p-4">
                                    <p className="font-medium text-gray-900">
                                        Class {assignment.class} - Section {assignment.section}
                                    </p>
                                    {assignment.subject && (
                                        <p className="text-sm text-gray-600">Subject: {assignment.subject}</p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Features Coming Soon */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Features Coming Soon</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="border border-gray-200 rounded-lg p-4 text-center">
                            <div className="text-3xl mb-2">📊</div>
                            <p className="font-medium text-gray-900">Attendance</p>
                            <p className="text-xs text-gray-500 mt-1">Mark & view attendance</p>
                        </div>
                        <div className="border border-gray-200 rounded-lg p-4 text-center">
                            <div className="text-3xl mb-2">💰</div>
                            <p className="font-medium text-gray-900">Fees</p>
                            <p className="text-xs text-gray-500 mt-1">Pay & track fees</p>
                        </div>
                        <div className="border border-gray-200 rounded-lg p-4 text-center">
                            <div className="text-3xl mb-2">📝</div>
                            <p className="font-medium text-gray-900">Homework</p>
                            <p className="text-xs text-gray-500 mt-1">Post & view homework</p>
                        </div>
                        <div className="border border-gray-200 rounded-lg p-4 text-center">
                            <div className="text-3xl mb-2">📢</div>
                            <p className="font-medium text-gray-900">Notices</p>
                            <p className="text-xs text-gray-500 mt-1">School announcements</p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
