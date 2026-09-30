"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Plus, CreditCard } from "lucide-react"
import { useCreateManualPayment } from "@/lib/hooks/use-fees"
import { useStudents } from "@/lib/hooks/use-students"
import { toast } from "sonner"

const manualPaymentSchema = z.object({
    studentId: z.string().min(1, "Student is required"),
    amountPaise: z.number().positive("Amount must be positive"), // This will store rupees, converted to paise on submit
    installmentNo: z.number().min(1, "Installment number is required"),
    paymentMode: z.enum(["CASH", "CHEQUE"]),
    receiptNumber: z.string().optional(),
})

type ManualPaymentFormData = z.infer<typeof manualPaymentSchema>

export function ManualFeeEntryDialog() {
    const [open, setOpen] = useState(false)
    const createManualPayment = useCreateManualPayment()
    const { data: studentsData } = useStudents()
    const students = studentsData?.data || []
    
    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
        watch,
        reset,
    } = useForm<ManualPaymentFormData>({
        resolver: zodResolver(manualPaymentSchema),
        defaultValues: {
            paymentMode: "CASH",
        },
    })
    
    const selectedStudentId = watch("studentId")
    const amountRupees = watch("amountPaise")
    
    const onSubmit = async (data: ManualPaymentFormData) => {
        try {
            // Convert rupees to paise
            const amountPaise = Math.round(data.amountPaise * 100)
            await createManualPayment.mutateAsync({
                studentId: data.studentId,
                amountPaise,
                installmentNo: data.installmentNo,
                paymentMode: data.paymentMode,
                receiptNumber: data.receiptNumber || undefined,
            })
            reset()
            setOpen(false)
            toast.success("Fee payment recorded successfully")
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to record payment")
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Record Manual Payment
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[525px]">
                <DialogHeader>
                    <DialogTitle>Record Manual Fee Payment</DialogTitle>
                    <DialogDescription>
                        Record a cash or cheque payment manually.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="student" className="text-right">
                                Student
                            </Label>
                            <div className="col-span-3">
                                <Select onValueChange={(value) => setValue("studentId", value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select student" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {students.map((student: any) => (
                                            <SelectItem key={student.id} value={student.id}>
                                                {student.name} - {student.admissionNo} (Class {student.class}-{student.section})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.studentId && (
                                    <p className="text-xs text-destructive mt-1">{errors.studentId.message}</p>
                                )}
                            </div>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="amount" className="text-right">
                                Amount (₹)
                            </Label>
                            <div className="col-span-3">
                                <Input 
                                    id="amount" 
                                    type="number"
                                    step="0.01"
                                    placeholder="1000.00" 
                                    {...register("amountPaise", {
                                        valueAsNumber: true,
                                    })}
                                />
                                {errors.amountPaise && (
                                    <p className="text-xs text-destructive mt-1">{errors.amountPaise.message}</p>
                                )}
                                {amountRupees && (
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Amount: ₹{amountRupees.toLocaleString()}
                                    </p>
                                )}
                            </div>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="installmentNo" className="text-right">
                                Installment
                            </Label>
                            <div className="col-span-3">
                                <Input 
                                    id="installmentNo" 
                                    type="number"
                                    min="1"
                                    placeholder="1" 
                                    {...register("installmentNo", { valueAsNumber: true })}
                                />
                                {errors.installmentNo && (
                                    <p className="text-xs text-destructive mt-1">{errors.installmentNo.message}</p>
                                )}
                            </div>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="paymentMode" className="text-right">
                                Payment Mode
                            </Label>
                            <div className="col-span-3">
                                <Select onValueChange={(value: "CASH" | "CHEQUE") => setValue("paymentMode", value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select payment mode" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="CASH">Cash</SelectItem>
                                        <SelectItem value="CHEQUE">Cheque</SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors.paymentMode && (
                                    <p className="text-xs text-destructive mt-1">{errors.paymentMode.message}</p>
                                )}
                            </div>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="receiptNumber" className="text-right">
                                Receipt No
                            </Label>
                            <div className="col-span-3">
                                <Input 
                                    id="receiptNumber" 
                                    placeholder="Optional - auto-generated if empty" 
                                    {...register("receiptNumber")}
                                />
                                <p className="text-xs text-muted-foreground mt-1">
                                    Leave empty to auto-generate receipt number
                                </p>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={createManualPayment.isPending}>
                            <CreditCard className="mr-2 h-4 w-4" />
                            {createManualPayment.isPending ? "Recording..." : "Record Payment"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}

