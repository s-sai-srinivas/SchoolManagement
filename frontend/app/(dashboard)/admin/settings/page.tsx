"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { useCurrentUser } from "@/lib/hooks/use-current-user"
import { useUpdateUser } from "@/lib/hooks/use-users"
import { toast } from "sonner"
import { User, Lock, Bell, Shield, Mail } from "lucide-react"
import { PageHeader } from "@/components/layout/page-header"

export default function SettingsPage() {
    const { data: currentUser } = useCurrentUser()
    const updateUser = useUpdateUser()
    const [isLoading, setIsLoading] = useState(false)

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        defaultValues: {
            name: currentUser?.name || "",
            email: currentUser?.email || "",
        },
    })

    const onProfileSubmit = async (data: any) => {
        setIsLoading(true)
        try {
            await updateUser.mutateAsync({ id: currentUser?.id, ...data })
            toast.success("Profile updated successfully")
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to update profile")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="flex flex-col gap-6 animate-fade-in">
            <PageHeader
                title="Settings"
                description="Manage your account settings and preferences."
            />

            <Tabs defaultValue="profile" className="space-y-6">
                <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
                    <TabsTrigger value="profile">Profile</TabsTrigger>
                    <TabsTrigger value="security">Security</TabsTrigger>
                    <TabsTrigger value="notifications">Notifications</TabsTrigger>
                </TabsList>

                <TabsContent value="profile">
                    <Card>
                        <CardHeader>
                            <CardTitle>Profile Information</CardTitle>
                            <CardDescription>
                                Update your personal information and email address.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <form onSubmit={handleSubmit(onProfileSubmit)} className="space-y-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="name">Full Name</Label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="name"
                                            className="pl-9"
                                            {...register("name", { required: "Name is required" })}
                                        />
                                    </div>
                                    {errors.name && (
                                        <p className="text-xs text-destructive">{errors.name.message as string}</p>
                                    )}
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="email">Email Address</Label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="email"
                                            type="email"
                                            className="pl-9"
                                            {...register("email", { required: "Email is required" })}
                                            disabled // Email change usually requires verification
                                        />
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        Contact administrator to change your email address.
                                    </p>
                                </div>

                                <Button type="submit" disabled={isLoading}>
                                    {isLoading ? "Saving..." : "Save Changes"}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="security">
                    <Card>
                        <CardHeader>
                            <CardTitle>Security Settings</CardTitle>
                            <CardDescription>
                                Manage your password and security preferences.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="current-password">Current Password</Label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input id="current-password" type="password" className="pl-9" />
                                    </div>
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="new-password">New Password</Label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input id="new-password" type="password" className="pl-9" />
                                    </div>
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="confirm-password">Confirm New Password</Label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input id="confirm-password" type="password" className="pl-9" />
                                    </div>
                                </div>
                                <Button variant="outline" disabled>Update Password (Coming Soon)</Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="notifications">
                    <Card>
                        <CardHeader>
                            <CardTitle>Notification Preferences</CardTitle>
                            <CardDescription>
                                Choose how you want to receive notifications.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center justify-between space-x-2">
                                <div className="flex flex-col space-y-1">
                                    <Label htmlFor="email-notifs">Email Notifications</Label>
                                    <span className="text-xs text-muted-foreground">Receive daily summaries via email.</span>
                                </div>
                                <Switch id="email-notifs" defaultChecked />
                            </div>
                            <div className="flex items-center justify-between space-x-2">
                                <div className="flex flex-col space-y-1">
                                    <Label htmlFor="push-notifs">Push Notifications</Label>
                                    <span className="text-xs text-muted-foreground">Receive real-time alerts in the browser.</span>
                                </div>
                                <Switch id="push-notifs" defaultChecked />
                            </div>
                            <div className="flex items-center justify-between space-x-2">
                                <div className="flex flex-col space-y-1">
                                    <Label htmlFor="marketing-emails">Marketing Emails</Label>
                                    <span className="text-xs text-muted-foreground">Receive news and updates about new features.</span>
                                </div>
                                <Switch id="marketing-emails" />
                            </div>
                            <Button onClick={() => toast.success("Preferences saved")}>Save Preferences</Button>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
