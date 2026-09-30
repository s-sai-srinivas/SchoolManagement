import { ParentSidebar } from "@/components/layout/parent-sidebar"
import { Header } from "@/components/layout/header"
import { Breadcrumbs } from "@/components/layout/breadcrumbs"
import { ErrorBoundary } from "@/components/common/error-boundary"

export default function ParentLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="flex h-screen overflow-hidden">
            <ParentSidebar />
            <div className="flex flex-1 flex-col overflow-hidden">
                <Header />
                <main className="flex-1 overflow-y-auto p-6">
                    <Breadcrumbs />
                    <ErrorBoundary>
                        {children}
                    </ErrorBoundary>
                </main>
            </div>
        </div>
    )
}
