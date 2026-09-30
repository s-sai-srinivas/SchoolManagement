"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, FileText } from "lucide-react"
import { FeeStatistics } from "@/components/admin/fees/fee-statistics"
import { useFeeCollectionReport, useOutstandingFeesReport, useFeeDefaultersReport } from "@/lib/hooks/use-reports"
import { Skeleton } from "@/components/ui/skeleton"
import { reportApi } from "@/lib/api/endpoints"
import { toast } from "sonner"

export default function ReportsPage() {
    const { data: feeCollection, isLoading: loadingCollection, error: collectionError } = useFeeCollectionReport()
    const { data: outstandingFees, isLoading: loadingOutstanding, error: outstandingError } = useOutstandingFeesReport()
    const { data: defaulters, isLoading: loadingDefaulters, error: defaultersError } = useFeeDefaultersReport()

    // Handle different response structures
    const feeCollectionData = feeCollection?.data || feeCollection || {}
    const totalCollection = feeCollectionData?.totalCollection || feeCollectionData?.totalCollectedInRupees || 0
    
    const outstandingData = outstandingFees?.data || outstandingFees || []
    const totalOutstanding = Array.isArray(outstandingData)
        ? outstandingData.reduce((sum: number, item: any) => sum + (item.outstandingAmount || 0), 0)
        : 0
    
    const defaultersData = defaulters?.data || defaulters || []

    const handleExportFeeCollection = async () => {
        try {
            const response = await reportApi.feeCollectionExport({ groupBy: "monthly" })
            const blob = new Blob([response.data], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" })
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement("a")
            a.href = url
            a.download = `fee_collection_${new Date().toISOString().split("T")[0]}.xlsx`
            document.body.appendChild(a)
            a.click()
            window.URL.revokeObjectURL(url)
            document.body.removeChild(a)
        } catch (error) {
            toast.error("Failed to export report")
        }
    }

    return (
        <div className="flex flex-col gap-6 animate-fade-in">
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                        Reports & Analytics
                    </h1>
                    <p className="text-muted-foreground">
                        Generate and export detailed reports for fees and attendance.
                    </p>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                        <CardTitle className="text-base font-semibold">Fee Collection Report</CardTitle>
                        <Button variant="outline" size="sm" onClick={handleExportFeeCollection} className="shadow-sm">
                            <Download className="mr-2 h-4 w-4" />
                            Export
                        </Button>
                    </CardHeader>
                    <CardContent>
                        {loadingCollection ? (
                            <Skeleton className="h-10 w-32 mb-2" />
                        ) : collectionError ? (
                            <div className="text-center py-4">
                                <p className="text-sm text-destructive">Failed to load collection data</p>
                            </div>
                        ) : (
                            <>
                                <div className="text-3xl font-bold mb-1 text-success">
                                    ₹{typeof totalCollection === 'number' ? (totalCollection / 100).toLocaleString() : '0'}
                                </div>
                                <p className="text-xs font-medium text-muted-foreground">Collected this month</p>
                            </>
                        )}
                        <div className="mt-4 h-[200px]">
                            <FeeStatistics />
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                        <CardTitle className="text-base font-semibold">Outstanding Fees</CardTitle>
                        <Button variant="outline" size="sm" disabled className="shadow-sm">
                            <Download className="mr-2 h-4 w-4" />
                            Export
                        </Button>
                    </CardHeader>
                    <CardContent>
                        {loadingOutstanding ? (
                            <Skeleton className="h-10 w-32 mb-2" />
                        ) : outstandingError ? (
                            <div className="text-center py-4">
                                <p className="text-sm text-destructive">Failed to load outstanding fees</p>
                            </div>
                        ) : (
                            <>
                                <div className="text-3xl font-bold mb-1 text-warning">
                                    ₹{typeof totalOutstanding === 'number' ? (totalOutstanding / 100).toLocaleString() : '0'}
                                </div>
                                <p className="text-xs font-medium text-muted-foreground">Total outstanding</p>
                            </>
                        )}
                        <div className="mt-4 h-[200px] flex items-center justify-center rounded-lg border border-dashed border-border/50 bg-muted/30">
                            <div className="text-center">
                                <FileText className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                                <p className="text-sm font-medium text-muted-foreground">Outstanding Fees</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="col-span-2 border-0 shadow-lg">
                    <CardHeader className="pb-4">
                        <CardTitle className="text-xl font-semibold">Fee Defaulters</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loadingDefaulters ? (
                            <div className="space-y-2">
                                {[...Array(3)].map((_, i) => (
                                    <Skeleton key={i} className="h-14 w-full rounded-lg" />
                                ))}
                            </div>
                        ) : defaultersError ? (
                            <div className="rounded-lg border border-border/50 bg-muted/20">
                                <div className="p-8 text-center">
                                    <FileText className="h-12 w-12 mx-auto mb-3 text-destructive opacity-50" />
                                    <p className="text-sm font-medium text-destructive">
                                        Failed to load defaulters data
                                    </p>
                                </div>
                            </div>
                        ) : Array.isArray(defaultersData) && defaultersData.length > 0 ? (
                            <div className="rounded-lg border border-border/50 overflow-hidden">
                                <div className="divide-y divide-border/50">
                                    {defaultersData.map((defaulter: any, idx: number) => (
                                        <div key={idx} className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors">
                                            <div>
                                                <p className="font-semibold">{defaulter.studentName || defaulter.name}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    Class {defaulter.class}-{defaulter.section} • Outstanding: ₹{(defaulter.outstandingAmount / 100).toLocaleString()}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="rounded-lg border border-border/50 bg-muted/20">
                                <div className="p-8 text-center">
                                    <FileText className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
                                    <p className="text-sm font-medium text-muted-foreground">
                                        No defaulters found for the current period.
                                    </p>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
