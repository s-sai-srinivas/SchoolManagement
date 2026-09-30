import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { Breadcrumbs } from "@/components/layout/breadcrumbs"
import { AuthGuard } from "@/components/guards/auth-guard"
import { RoleGuard } from "@/components/guards/role-guard"
import { ErrorBoundary } from "@/components/common/error-boundary"

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <AuthGuard>
            <RoleGuard allowedRoles={['ADMIN']}>
                <div className="flex h-screen w-full bg-gradient-to-br from-background via-background/98 to-muted/10">
                    <Sidebar />
                    <div className="flex flex-col flex-1 overflow-hidden">
                        <Header />
                        <main className="flex-1 overflow-y-auto p-6 relative">
                            <Breadcrumbs />
                            <ErrorBoundary>
                                {children}
                            </ErrorBoundary>
                        </main>
                    </div>
                </div>
            </RoleGuard>
        </AuthGuard>
    )
}
