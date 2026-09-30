"use client"

import { FeeStructureCard } from "@/components/admin/fees/fee-structure-card"

export default function FeeStructurePage() {
    return (
        <div className="flex flex-col gap-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Fee Structure</h1>
                <p className="text-muted-foreground">
                    Configure the annual fee and installment details.
                </p>
            </div>

            <div className="max-w-2xl">
                <FeeStructureCard />
            </div>
        </div>
    )
}
