"use client"

import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"

export function FeeStructureCard() {
    const [isEditing, setIsEditing] = useState(false)

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="space-y-1">
                    <CardTitle>Annual Fee Structure</CardTitle>
                    <CardDescription>
                        Configure the standard annual fee for all students.
                    </CardDescription>
                </div>
                <Button variant="outline" onClick={() => setIsEditing(!isEditing)}>
                    {isEditing ? "Cancel" : "Edit"}
                </Button>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
                <div className="grid gap-2">
                    <Label htmlFor="annualFee">Annual Fee Amount (₹)</Label>
                    <Input
                        id="annualFee"
                        type="number"
                        defaultValue="30000"
                        disabled={!isEditing}
                        className="text-lg font-semibold"
                    />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="installments">Number of Installments</Label>
                    <Input
                        id="installments"
                        type="number"
                        defaultValue="3"
                        disabled={!isEditing}
                    />
                </div>

                {isEditing && (
                    <Button className="w-full">Save Changes</Button>
                )}
            </CardContent>
        </Card>
    )
}
