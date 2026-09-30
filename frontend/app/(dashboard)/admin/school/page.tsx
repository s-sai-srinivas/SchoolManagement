"use client"

import { useState } from "react"
import * as React from "react"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { School, Upload, Save, Users, CreditCard } from "lucide-react"
import { useSchool, useUpdateSchool, useUploadLogo } from "@/lib/hooks/use-school"
import { useCurrentUser } from "@/lib/hooks/use-current-user"
import { useStudents } from "@/lib/hooks/use-students"
import { useUsers } from "@/lib/hooks/use-users"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"

export default function SchoolPage() {
    const [isEditing, setIsEditing] = useState(false)
    const { data: currentUser } = useCurrentUser()
    const { data: schoolData, isLoading: loadingSchool } = useSchool()
    const { data: studentsData } = useStudents()
    const { data: usersData } = useUsers()
    const updateSchool = useUpdateSchool()
    const uploadLogo = useUploadLogo()
    
    const school = schoolData?.data
    const studentsCount = studentsData?.data?.length || 0
    const usersCount = usersData?.data?.length || 0
    
    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm({
        defaultValues: {
            name: school?.name || "",
        },
    })
    
    React.useEffect(() => {
        if (school) {
            reset({
                name: school.name || "",
            })
        }
    }, [school, reset])
    
    const onSubmit = async (data: any) => {
        try {
            await updateSchool.mutateAsync(data)
            setIsEditing(false)
            toast.success("School details updated successfully")
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to update school details")
        }
    }
    
    const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return
        
        try {
            await uploadLogo.mutateAsync(file)
            toast.success("Logo uploaded successfully")
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to upload logo")
        }
    }

    if (loadingSchool) {
        return (
            <div className="flex flex-col gap-6">
                <div>
                    <Skeleton className="h-9 w-64 mb-2" />
                </div>
                <div className="grid gap-6 md:grid-cols-2">
                    {[...Array(2)].map((_, i) => (
                        <Card key={i}>
                            <CardHeader>
                                <Skeleton className="h-6 w-32 mb-2" />
                            </CardHeader>
                            <CardContent>
                                <Skeleton className="h-32 w-full" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h1 className="text-2xl font-semibold tracking-tight">School Management</h1>
                    <p className="text-sm text-muted-foreground">
                        Manage your school's profile and settings.
                    </p>
                </div>
                <Button onClick={() => setIsEditing(!isEditing)} variant={isEditing ? "outline" : "default"}>
                    {isEditing ? "Cancel" : "Edit Details"}
                </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>School Profile</CardTitle>
                        <CardDescription>Manage your school's public information</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <form onSubmit={handleSubmit(onSubmit)}>
                            <div className="flex items-center gap-6">
                                <Avatar className="h-24 w-24">
                                    <AvatarImage src={school?.logoUrl} alt="School Logo" />
                                    <AvatarFallback>
                                        <School className="h-12 w-12" />
                                    </AvatarFallback>
                                </Avatar>
                                <div className="space-y-2">
                                    <Label htmlFor="logo-upload" className="cursor-pointer">
                                        <Button variant="outline" size="sm" type="button">
                                            <Upload className="mr-2 h-4 w-4" />
                                            Upload Logo
                                        </Button>
                                    </Label>
                                    <Input
                                        id="logo-upload"
                                        type="file"
                                        accept="image/*"
                                        onChange={handleLogoUpload}
                                        className="hidden"
                                        disabled={uploadLogo.isPending}
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Recommended size: 512x512px
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="name">School Name</Label>
                                    <Input
                                        id="name"
                                        {...register("name", { required: "School name is required" })}
                                        disabled={!isEditing}
                                    />
                                    {errors.name && (
                                        <p className="text-xs text-destructive">{errors.name.message as string}</p>
                                    )}
                                </div>
                            </div>

                            {isEditing && (
                                <Button type="submit" className="w-full" disabled={updateSchool.isPending}>
                                    <Save className="mr-2 h-4 w-4" />
                                    {updateSchool.isPending ? "Saving..." : "Save Changes"}
                                </Button>
                            )}
                        </form>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Statistics</CardTitle>
                        <CardDescription>School usage statistics</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid gap-4">
                            <div className="flex items-center justify-between border-b pb-2">
                                <div className="flex items-center gap-2">
                                    <Users className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm font-medium">Total Students</span>
                                </div>
                                <span className="font-bold">{studentsCount}</span>
                            </div>
                            <div className="flex items-center justify-between border-b pb-2">
                                <div className="flex items-center gap-2">
                                    <Users className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm font-medium">Total Users</span>
                                </div>
                                <span className="font-bold">{usersCount}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
