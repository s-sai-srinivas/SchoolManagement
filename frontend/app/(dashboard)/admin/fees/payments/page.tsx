"use client"

import { DataTable } from "@/components/ui/data-table"
import { columns, Payment } from "./columns"
import { useFeePayments } from "@/lib/hooks/use-fees"
import { Skeleton } from "@/components/ui/skeleton"
import { EmptyState } from "@/components/common/empty-state"
import { CreditCard } from "lucide-react"
import { format } from "date-fns"
import { ManualFeeEntryDialog } from "@/components/admin/fees/manual-fee-entry-dialog"

export default function PaymentsPage() {
    const { data, isLoading, error } = useFeePayments()

    // Transform API response to match Payment type
    const payments: Payment[] = data?.data?.map((payment: any) => ({
        id: payment.receiptNumber || payment.id,
        studentName: payment.studentName || payment.student?.name || "Unknown",
        amount: payment.amountRupees ? payment.amountRupees * 100 : payment.amountPaise || 0,
        date: payment.paidAt 
            ? format(new Date(payment.paidAt), "yyyy-MM-dd")
            : payment.createdAt 
            ? format(new Date(payment.createdAt), "yyyy-MM-dd")
            : "N/A",
        status: payment.status?.toLowerCase() || "pending",
        method: payment.paymentMode || (payment.razorpayPaymentId ? "Online" : "Manual"),
    })) || []

    if (isLoading) {
        return (
            <div className="flex flex-col gap-6">
                <div>
                    <Skeleton className="h-9 w-64 mb-2" />
                    <Skeleton className="h-5 w-96" />
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
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Payment History</h1>
                    <p className="text-muted-foreground">
                        View and manage all fee transactions.
                    </p>
                </div>
                <div className="flex items-center justify-center h-96">
                    <div className="text-center">
                        <p className="text-destructive mb-2">Failed to load payments</p>
                        <p className="text-sm text-muted-foreground">
                            {error instanceof Error ? error.message : "An error occurred"}
                        </p>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Payment History</h1>
                    <p className="text-muted-foreground">
                        View and manage all fee transactions.
                    </p>
                </div>
                <ManualFeeEntryDialog />
            </div>

            {payments.length === 0 ? (
                <EmptyState
                    icon={CreditCard}
                    title="No payments found"
                    description="No fee payments have been recorded yet."
                    action={<ManualFeeEntryDialog />}
                />
            ) : (
                <DataTable columns={columns} data={payments} searchKey="studentName" />
            )}
        </div>
    )
}
