"use client"

import { FeeStatistics } from "@/components/admin/fees/fee-statistics"
import { FeeStructureCard } from "@/components/admin/fees/fee-structure-card"
import { CreditCard, TrendingUp, AlertCircle } from "lucide-react"
import { PageHeader } from "@/components/layout/page-header"
import { StatsCard } from "@/components/common/stats-card"

export default function FeesPage() {
    return (
        <div className="flex flex-col gap-6">
            <PageHeader
                title="Fee Management"
                description="Manage fee collection, outstanding payments, and fee structures."
            />

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <StatsCard
                    title="Total Collected"
                    value="₹45,231"
                    icon={CreditCard}
                    description="Total collected"
                    trend="+20.1% from last month"
                    variant="success"
                />
                <StatsCard
                    title="Outstanding"
                    value="₹12,000"
                    icon={AlertCircle}
                    description="Overdue payments"
                    variant="warning"
                />
                <StatsCard
                    title="Projected"
                    value="₹85,000"
                    icon={TrendingUp}
                    description="Expected by month end"
                    variant="info"
                />
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <div className="lg:col-span-2">
                    <FeeStatistics />
                </div>
                <div>
                    <FeeStructureCard />
                </div>
            </div>
        </div>
    )
}
