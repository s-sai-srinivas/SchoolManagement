'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/stores/auth-store'
import { authApi } from '@/lib/api/endpoints'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { School, Loader2, AlertCircle } from 'lucide-react'

export default function LoginPage() {
    const router = useRouter()
    const { setAuth } = useAuthStore()
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')

    const [formData, setFormData] = useState({
        email: '',
        password: '',
        role: 'ADMIN' as 'ADMIN' | 'TEACHER' | 'PARENT' | 'STUDENT',
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setIsLoading(true)

        try {
            const response = await authApi.login(formData.email, formData.password, formData.role)
            const { user, accessToken, refreshToken } = response.data

            setAuth(user, accessToken, refreshToken)

            const roleRoutes = {
                ADMIN: '/admin/dashboard',
                TEACHER: '/teacher/dashboard',
                PARENT: '/parent/dashboard',
                STUDENT: '/student/dashboard',
            }

            router.push(roleRoutes[user.role as keyof typeof roleRoutes] || '/dashboard')
        } catch (err: any) {
            console.error('Login error:', err)
            if (err.response?.data?.message) {
                setError(err.response.data.message)
            } else if (err.errors) {
                setError(err.errors[0]?.message || 'Validation failed')
            } else {
                setError('Login failed. Please check your credentials.')
            }
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-100">
            {/* Animated gradient background */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-blue-50/50 to-primary/5" />
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.02]" />
            
            {/* Glassmorphism login card */}
            <Card className="glass-card w-full max-w-md relative z-10 animate-scale-in border-0 shadow-2xl">
                <CardHeader className="space-y-3 text-center pb-6">
                    <div className="flex justify-center mb-2">
                        <div className="rounded-full bg-primary/10 p-3">
                            <School className="h-8 w-8 text-primary" />
                        </div>
                    </div>
                    <CardTitle className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                        School Management System
                    </CardTitle>
                    <CardDescription className="text-base">
                        Sign in to your account to continue
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <form className="space-y-5" onSubmit={handleSubmit}>
                        {error && (
                            <Alert variant="destructive" className="animate-fade-in">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-sm font-semibold">
                                    Email Address
                                </Label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="glass-input h-11 text-base"
                                    placeholder="Enter your email"
                                    disabled={isLoading}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password" className="text-sm font-semibold">
                                    Password
                                </Label>
                                <Input
                                    id="password"
                                    name="password"
                                    type="password"
                                    required
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className="glass-input h-11 text-base"
                                    placeholder="Enter your password"
                                    disabled={isLoading}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="role" className="text-sm font-semibold">
                                    Login As
                                </Label>
                                <Select
                                    value={formData.role}
                                    onValueChange={(value) => setFormData({ ...formData, role: value as any })}
                                    disabled={isLoading}
                                >
                                    <SelectTrigger className="glass-input h-11 text-base">
                                        <SelectValue placeholder="Select role" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="ADMIN">Admin</SelectItem>
                                        <SelectItem value="TEACHER">Teacher</SelectItem>
                                        <SelectItem value="PARENT">Parent</SelectItem>
                                        <SelectItem value="STUDENT">Student</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="w-full h-11 text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-200 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Signing in...
                                </>
                            ) : (
                                'Sign in'
                            )}
                        </Button>

                        <div className="pt-4 border-t border-border/50">
                            <p className="text-xs font-medium text-muted-foreground mb-3 text-center">Test Credentials</p>
                            <div className="space-y-2 text-xs text-muted-foreground">
                                <div className="flex items-center justify-between p-2 rounded-md bg-muted/30">
                                    <span className="font-semibold">Admin:</span>
                                    <span>admin@demo.com / admin123</span>
                                </div>
                                <div className="flex items-center justify-between p-2 rounded-md bg-muted/30">
                                    <span className="font-semibold">Teacher:</span>
                                    <span>teacher@demo.com / teacher123</span>
                                </div>
                                <div className="flex items-center justify-between p-2 rounded-md bg-muted/30">
                                    <span className="font-semibold">Parent:</span>
                                    <span>parent@demo.com / parent123</span>
                                </div>
                            </div>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
