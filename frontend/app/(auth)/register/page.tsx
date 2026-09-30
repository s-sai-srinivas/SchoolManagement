'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { authApi } from '@/lib/api/endpoints'

export default function RegisterPage() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)

    const [formData, setFormData] = useState({
        schoolName: '',
        adminName: '',
        email: '',
        password: '',
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setSuccess(false)
        setIsLoading(true)

        try {
            // Call register API - creates school + admin user
            await authApi.register(formData)
            setSuccess(true)

            // Reset form
            setFormData({
                schoolName: '',
                adminName: '',
                email: '',
                password: '',
            })

            // Redirect to login after 2 seconds
            setTimeout(() => {
                router.push('/login')
            }, 2000)
        } catch (err: any) {
            console.error('Registration error:', err)
            if (err.response?.data?.message) {
                setError(err.response.data.message)
            } else {
                setError('Registration failed. Please try again.')
            }
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4 py-12">
            <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-xl">
                <div>
                    <h2 className="text-center text-3xl font-bold text-gray-900">
                        Register Your School
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        Create a new school account
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
                            <p className="font-semibold mb-2">School registered successfully!</p>
                            <p className="text-xs">Redirecting to login...</p>
                        </div>
                    )}

                    <div className="space-y-4">
                        <div>
                            <label htmlFor="schoolName" className="block text-sm font-medium text-gray-700 mb-1">
                                School Name
                            </label>
                            <input
                                id="schoolName"
                                name="schoolName"
                                type="text"
                                required
                                value={formData.schoolName}
                                onChange={(e) => setFormData({ ...formData, schoolName: e.target.value })}
                                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                placeholder="Enter school name"
                            />
                        </div>

                        <div>
                            <label htmlFor="adminName" className="block text-sm font-medium text-gray-700 mb-1">
                                Admin Name
                            </label>
                            <input
                                id="adminName"
                                name="adminName"
                                type="text"
                                required
                                value={formData.adminName}
                                onChange={(e) => setFormData({ ...formData, adminName: e.target.value })}
                                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                placeholder="Enter admin name"
                            />
                        </div>

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                Admin Email
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                required
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                placeholder="Enter admin email"
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                                Password
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                minLength={6}
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                placeholder="Enter password (min 6 characters)"
                            />
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {isLoading ? 'Creating school...' : 'Register School'}
                        </button>
                    </div>

                    <div className="text-center text-sm">
                        <Link href="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
                            ← Back to login
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    )
}
