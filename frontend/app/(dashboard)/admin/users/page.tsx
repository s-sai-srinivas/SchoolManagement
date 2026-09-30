"use client"

import { DataTable } from "@/components/ui/data-table"
import { columns, User } from "./columns"
import { CreateUserDialog } from "@/components/admin/users/create-user-dialog"
import { useUsers } from "@/lib/hooks/use-users"
import { Skeleton } from "@/components/ui/skeleton"
import { EmptyState } from "@/components/common/empty-state"
import { Users } from "lucide-react"
import { format } from "date-fns"
import { PageHeader } from "@/components/layout/page-header"

export default function UsersPage() {
    const { data, isLoading, error } = useUsers()

    // Transform API response to match User type
    const users: User[] = data?.data?.map((user: any) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.deletedAt ? "inactive" : "active",
        lastActive: user.updatedAt 
            ? format(new Date(user.updatedAt), "MMM d, yyyy")
            : "Never",
    })) || []

    if (isLoading) {
        return (
            <div className="flex flex-col gap-6">
                <div className="flex items-center justify-between">
                    <div>
                        <Skeleton className="h-9 w-64 mb-2" />
                        <Skeleton className="h-5 w-96" />
                    </div>
                    <Skeleton className="h-10 w-32" />
                </div>
                <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                        <Skeleton key={i} className="h-16 w-full" />
                    ))}
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="flex flex-col gap-6">
                <PageHeader
                    title="User Management"
                    description="Manage user access and roles for the school system."
                    action={<CreateUserDialog />}
                />
                <div className="flex items-center justify-center h-96">
                    <div className="text-center">
                        <p className="text-destructive mb-2">Failed to load users</p>
                        <p className="text-sm text-muted-foreground">
                            {error instanceof Error ? error.message : "An error occurred"}
                        </p>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-6 animate-fade-in">
            <PageHeader
                title="User Management"
                description="Manage user access and roles for the school system."
                action={<CreateUserDialog />}
            />

            {users.length === 0 ? (
                <EmptyState
                    icon={Users}
                    title="No users found"
                    description="Get started by adding your first user."
                    action={<CreateUserDialog />}
                />
            ) : (
                <DataTable columns={columns} data={users} searchKey="name" />
            )}
        </div>
    )
}
