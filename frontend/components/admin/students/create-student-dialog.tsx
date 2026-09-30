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
import { Plus } from "lucide-react"
import { useCreateStudent } from "@/lib/hooks/use-students"
import { useCurrentUser } from "@/lib/hooks/use-current-user"
import { toast } from "sonner"

const studentSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    admissionNo: z.string().min(1, "Admission number is required"),
    class: z.string().min(1, "Class is required"),
    section: z.string().min(1, "Section is required"),
    dob: z.string().optional(),
})

type StudentFormData = z.infer<typeof studentSchema>

interface CreateStudentDialogProps {
    open?: boolean
    onOpenChange?: (open: boolean) => void
}

export function CreateStudentDialog({ open: controlledOpen, onOpenChange }: CreateStudentDialogProps = {} as CreateStudentDialogProps) {
    const [internalOpen, setInternalOpen] = useState(false)
    const open = controlledOpen !== undefined ? controlledOpen : internalOpen
    const setOpen = onOpenChange || setInternalOpen
    const { data: currentUser } = useCurrentUser()
    const createStudent = useCreateStudent()
    
    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
        watch,
        reset,
    } = useForm<StudentFormData>({
        resolver: zodResolver(studentSchema),
    })
    
    const selectedClass = watch("class")
    const selectedSection = watch("section")
    
    const onSubmit = async (data: StudentFormData) => {
        try {
            await createStudent.mutateAsync({
                name: data.name,
                admissionNo: data.admissionNo,
                class: data.class,
                section: data.section,
                schoolId: currentUser?.schoolId || "",
                dob: data.dob || undefined,
            })
            reset()
            setOpen(false)
            toast.success("Student created successfully")
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to create student")
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            {controlledOpen === undefined && (
                <DialogTrigger asChild>
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Student
                    </Button>
                </DialogTrigger>
            )}
            <DialogContent className="sm:max-w-[600px]">
                <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-b border-border/50 px-6 pt-6 pb-4 rounded-t-2xl bg-white dark:bg-gray-900">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-extrabold text-foreground">Add New Student</DialogTitle>
                        <DialogDescription className="text-sm text-muted-foreground mt-2">
                            Enter the student's details. You can assign a parent later.
                        </DialogDescription>
                    </DialogHeader>
                </div>
                <form onSubmit={handleSubmit(onSubmit)} className="px-6 bg-white dark:bg-gray-900">
                    <div className="space-y-6 py-6">
                        <div className="space-y-2.5">
                            <Label htmlFor="name" className="text-sm font-semibold text-foreground">
                                Full Name <span className="text-destructive">*</span>
                            </Label>
                            <Input 
                                id="name" 
                                placeholder="Rahul Kumar" 
                                className="w-full h-11 bg-white dark:bg-gray-800 border-border/50 focus:border-primary/50"
                                {...register("name")}
                            />
                            {errors.name && (
                                <p className="text-xs text-destructive mt-1.5 font-medium">{errors.name.message}</p>
                            )}
                        </div>
                        
                        <div className="space-y-2.5">
                            <Label htmlFor="admissionNo" className="text-sm font-semibold text-foreground">
                                Admission Number <span className="text-destructive">*</span>
                            </Label>
                            <Input 
                                id="admissionNo" 
                                placeholder="ADM-2024-001" 
                                className="w-full h-11 bg-white dark:bg-gray-800 border-border/50 focus:border-primary/50"
                                {...register("admissionNo")}
                            />
                            {errors.admissionNo && (
                                <p className="text-xs text-destructive mt-1.5 font-medium">{errors.admissionNo.message}</p>
                            )}
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2.5">
                                <Label htmlFor="class" className="text-sm font-semibold text-foreground">
                                    Class <span className="text-destructive">*</span>
                                </Label>
                                <Select 
                                    value={selectedClass}
                                    onValueChange={(value) => setValue("class", value)}
                                >
                                    <SelectTrigger className="w-full h-11 bg-white dark:bg-gray-800 border-border/50 focus:border-primary/50">
                                        <SelectValue placeholder="Select class" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white dark:bg-gray-800 border-border/50">
                                        {Array.from({ length: 10 }, (_, i) => i + 1).map((num) => (
                                            <SelectItem key={num} value={num.toString()}>
                                                Class {num}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.class && (
                                    <p className="text-xs text-destructive mt-1.5 font-medium">{errors.class.message}</p>
                                )}
                            </div>
                            
                            <div className="space-y-2.5">
                                <Label htmlFor="section" className="text-sm font-semibold text-foreground">
                                    Section <span className="text-destructive">*</span>
                                </Label>
                                <Select 
                                    value={selectedSection}
                                    onValueChange={(value) => setValue("section", value)}
                                >
                                    <SelectTrigger className="w-full h-11 bg-white dark:bg-gray-800 border-border/50 focus:border-primary/50">
                                        <SelectValue placeholder="Select section" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white dark:bg-gray-800 border-border/50">
                                        {["A", "B", "C", "D"].map((section) => (
                                            <SelectItem key={section} value={section}>
                                                Section {section}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.section && (
                                    <p className="text-xs text-destructive mt-1.5 font-medium">{errors.section.message}</p>
                                )}
                            </div>
                        </div>
                        
                        <div className="space-y-2.5">
                            <Label htmlFor="dob" className="text-sm font-semibold text-foreground">
                                Date of Birth <span className="text-muted-foreground text-xs font-normal">(Optional)</span>
                            </Label>
                            <Input 
                                id="dob" 
                                type="date" 
                                className="w-full h-11 bg-white dark:bg-gray-800 border-border/50 focus:border-primary/50"
                                {...register("dob")}
                            />
                        </div>
                    </div>
                    <DialogFooter className="gap-3 px-6 pb-6 pt-4 border-t border-border/50 bg-gray-50 dark:bg-gray-800/50 rounded-b-2xl">
                        <Button 
                            type="button" 
                            variant="outline" 
                            onClick={() => {
                                reset()
                                setOpen(false)
                            }}
                            className="h-11 px-6 font-semibold"
                        >
                            Cancel
                        </Button>
                        <Button 
                            type="submit" 
                            disabled={createStudent.isPending}
                            className="min-w-[140px] h-11 px-6 font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                        >
                            {createStudent.isPending ? (
                                <>
                                    <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                                    Creating...
                                </>
                            ) : (
                                <>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Create Student
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
