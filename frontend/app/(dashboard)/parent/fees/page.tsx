"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { CreditCard, Download, AlertCircle } from "lucide-react"
import { useCurrentUser } from "@/lib/hooks/use-current-user"
import { usePendingFees, useFeePayments } from "@/lib/hooks/use-fees"
import { useFeeStructure } from "@/lib/hooks/use-fees"
import { Skeleton } from "@/components/ui/skeleton"
import { EmptyState } from "@/components/common/empty-state"
import { format } from "date-fns"
import { toast } from "sonner"
import { feeApi } from "@/lib/api/endpoints"

export default function ParentFeesPage() {
    const { data: currentUser, isLoading: loadingUser } = useCurrentUser()
    const children = currentUser?.children || []
    const firstChildId = children[0]?.id || children[0]?.studentId || children[0]?.student?.id
    const [selectedChildId, setSelectedChildId] = useState<string>("")
    useEffect(() => {
        if (!selectedChildId && firstChildId) setSelectedChildId(firstChildId)
    }, [firstChildId, selectedChildId])
    
    const { data: pendingFeesData, isLoading: loadingPending } = usePendingFees(selectedChildId)
    const { data: paymentsData, isLoading: loadingPayments } = useFeePayments({ studentId: selectedChildId })
    const { data: feeStructureData } = useFeeStructure()

    const pendingFees = pendingFeesData?.data
    const payments = paymentsData?.data || []
    const feeStructure = feeStructureData?.data

    const annualFee = feeStructure?.annualAmountRupees ? feeStructure.annualAmountRupees * 100 : pendingFees?.annualFeePaise || 0
    const totalPaid = pendingFees?.totalPaidPaise || 0
    const outstanding = pendingFees?.pendingPaise || 0
    const installments = feeStructure?.installments || pendingFees?.installments || 0

    const handleDownloadReceipt = async (paymentId: string) => {
        try {
            const response = await feeApi.downloadReceipt(paymentId)
            const blob = new Blob([response.data], { type: 'application/pdf' })
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `receipt_${paymentId}.pdf`
            document.body.appendChild(a)
            a.click()
            window.URL.revokeObjectURL(url)
            document.body.removeChild(a)
            toast.success("Receipt downloaded successfully")
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to download receipt")
        }
    }

    if (loadingUser) {
        return (
            <div className="flex flex-col gap-6">
                <div>
                    <Skeleton className="h-9 w-64 mb-2" />
                    <Skeleton className="h-5 w-96" />
                </div>
                <div className="grid gap-6 md:grid-cols-3">
                    {[...Array(3)].map((_, i) => (
                        <Card key={i}>
                            <CardHeader>
                                <Skeleton className="h-6 w-32 mb-2" />
                            </CardHeader>
                            <CardContent>
                                <Skeleton className="h-8 w-24" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        )
    }

    if (children.length === 0) {
        return (
            <div className="flex flex-col gap-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Fees & Payments</h1>
                    <p className="text-muted-foreground">
                        Manage fee payments and view payment history.
                    </p>
                </div>
                <EmptyState
                    icon={CreditCard}
                    title="No children found"
                    description="No children are registered under your account."
                />
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Fees & Payments</h1>
                    <p className="text-muted-foreground">
                        Manage fee payments and view payment history.
                    </p>
                </div>
                {children.length > 1 && (
                    <Select value={selectedChildId} onValueChange={setSelectedChildId}>
                        <SelectTrigger className="w-[200px]">
                            <SelectValue placeholder="Select child" />
                        </SelectTrigger>
                        <SelectContent>
                            {children.map((child: any) => {
                                const student = child.student || child
                                return (
                                    <SelectItem key={child.studentId || child.id} value={child.studentId || child.id}>
                                        {student.name} (Class {student.class}-{student.section})
                                    </SelectItem>
                                )
                            })}
                        </SelectContent>
                    </Select>
                )}
            </div>

            {loadingPending ? (
                <div className="grid gap-6 md:grid-cols-3">
                    {[...Array(3)].map((_, i) => (
                        <Card key={i}>
                            <CardHeader>
                                <Skeleton className="h-6 w-32 mb-2" />
                            </CardHeader>
                            <CardContent>
                                <Skeleton className="h-8 w-24" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <>
                    <div className="grid gap-6 md:grid-cols-3">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Annual Fee</CardTitle>
                                <CreditCard className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">₹{(annualFee / 100).toLocaleString()}</div>
                                <p className="text-xs text-muted-foreground">{installments} installments</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Paid</CardTitle>
                                <CreditCard className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">₹{(totalPaid / 100).toLocaleString()}</div>
                                <p className="text-xs text-muted-foreground">
                                    {annualFee > 0 ? Math.floor((totalPaid / annualFee) * installments) : 0} installment(s)
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Outstanding</CardTitle>
                                <AlertCircle className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">₹{(outstanding / 100).toLocaleString()}</div>
                                <p className="text-xs text-muted-foreground">
                                    {annualFee > 0 ? Math.ceil((outstanding / annualFee) * installments) : 0} installment(s) pending
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Payment History */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Payment History</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {loadingPayments ? (
                                <div className="space-y-2">
                                    {[...Array(3)].map((_, i) => (
                                        <Skeleton key={i} className="h-12 w-full" />
                                    ))}
                                </div>
                            ) : payments.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    <p className="text-sm">No payment history available</p>
                                </div>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Receipt No</TableHead>
                                            <TableHead>Installment</TableHead>
                                            <TableHead>Amount</TableHead>
                                            <TableHead>Date</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Action</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {payments.map((payment: any) => (
                                            <TableRow key={payment.id}>
                                                <TableCell className="font-medium">
                                                    {payment.receiptNumber || payment.id.substring(0, 8)}
                                                </TableCell>
                                                <TableCell>Installment {payment.installmentNo || "N/A"}</TableCell>
                                                <TableCell>₹{(payment.amountRupees || payment.amountPaise / 100).toLocaleString()}</TableCell>
                                                <TableCell>
                                                    {payment.paidAt 
                                                        ? format(new Date(payment.paidAt), "MMM d, yyyy")
                                                        : payment.createdAt
                                                        ? format(new Date(payment.createdAt), "MMM d, yyyy")
                                                        : "N/A"}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant={payment.status === "COMPLETED" ? "default" : "destructive"}>
                                                        {payment.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    {payment.status === "COMPLETED" ? (
                                                        <Button 
                                                            variant="ghost" 
                                                            size="sm"
                                                            onClick={() => handleDownloadReceipt(payment.id)}
                                                        >
                                                            <Download className="mr-2 h-4 w-4" />
                                                            Receipt
                                                        </Button>
                                                    ) : (
                                                        <span className="text-sm text-muted-foreground">Pending</span>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>
                </>
            )}
        </div>
    )
}
