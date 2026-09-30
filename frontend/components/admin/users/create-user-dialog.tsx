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
import { useCreateTeacher, useCreateParent } from "@/lib/hooks/use-users"
import { useCurrentUser } from "@/lib/hooks/use-current-user"
import { toast } from "sonner"

const userSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    role: z.enum(["TEACHER", "PARENT"]),
})

type UserFormData = z.infer<typeof userSchema>

interface CreateUserDialogProps {
    open?: boolean
    onOpenChange?: (open: boolean) => void
}

export function CreateUserDialog({ open: controlledOpen, onOpenChange }: CreateUserDialogProps = {} as CreateUserDialogProps) {
    const [internalOpen, setInternalOpen] = useState(false)
    const open = controlledOpen !== undefined ? controlledOpen : internalOpen
    const setOpen = onOpenChange || setInternalOpen
    const { data: currentUser } = useCurrentUser()
    const createTeacher = useCreateTeacher()
    const createParent = useCreateParent()
    
    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
        watch,
        reset,
    } = useForm<UserFormData>({
        resolver: zodResolver(userSchema),
        defaultValues: {
            role: "TEACHER",
        },
    })
    
    const selectedRole = watch("role")
    
    const onSubmit = async (data: UserFormData) => {
        if (!currentUser?.schoolId) {
            toast.error("School ID not found")
            return
        }
        
        try {
            if (data.role === "TEACHER") {
                await createTeacher.mutateAsync({
                    name: data.name,
                    email: data.email,
                    schoolId: currentUser.schoolId,
                })
            } else {
                await createParent.mutateAsync({
                    name: data.name,
                    email: data.email,
                    schoolId: currentUser.schoolId,
                })
            }
            reset()
            setOpen(false)
            toast.success("User created successfully. Temporary password has been generated.")
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to create user")
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            {controlledOpen === undefined && (
                <DialogTrigger asChild>
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Add User
                    </Button>
                </DialogTrigger>
            )}
            <DialogContent className="sm:max-w-[600px]">
                <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-b border-border/50 px-6 pt-6 pb-4 rounded-t-2xl bg-white dark:bg-gray-900">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-extrabold text-foreground">Add New User</DialogTitle>
                        <DialogDescription className="text-sm text-muted-foreground mt-2">
                            Create a new user account. They will receive a temporary password via email.
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
                                placeholder="John Doe" 
                                className="w-full h-11 bg-white dark:bg-gray-800 border-border/50 focus:border-primary/50"
                                {...register("name")}
                            />
                            {errors.name && (
                                <p className="text-xs text-destructive mt-1.5 font-medium">{errors.name.message}</p>
                            )}
                        </div>
                        
                        <div className="space-y-2.5">
                            <Label htmlFor="email" className="text-sm font-semibold text-foreground">
                                Email Address <span className="text-destructive">*</span>
                            </Label>
                            <Input 
                                id="email" 
                                type="email"
                                placeholder="john@example.com" 
                                className="w-full h-11 bg-white dark:bg-gray-800 border-border/50 focus:border-primary/50"
                                {...register("email")}
                            />
                            {errors.email && (
                                <p className="text-xs text-destructive mt-1.5 font-medium">{errors.email.message}</p>
                            )}
                        </div>
                        
                        <div className="space-y-2.5">
                            <Label htmlFor="role" className="text-sm font-semibold text-foreground">
                                Role <span className="text-destructive">*</span>
                            </Label>
                            <Select 
                                value={selectedRole} 
                                onValueChange={(value: "TEACHER" | "PARENT") => setValue("role", value)}
                            >
                                <SelectTrigger className="w-full h-11 bg-white dark:bg-gray-800 border-border/50 focus:border-primary/50">
                                    <SelectValue placeholder="Select role" />
                                </SelectTrigger>
                                <SelectContent className="bg-white dark:bg-gray-800 border-border/50">
                                    <SelectItem value="TEACHER">Teacher</SelectItem>
                                    <SelectItem value="PARENT">Parent</SelectItem>
                                </SelectContent>
                            </Select>
                            {errors.role && (
                                <p className="text-xs text-destructive mt-1.5 font-medium">{errors.role.message}</p>
                            )}
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
                            disabled={createTeacher.isPending || createParent.isPending}
                            className="min-w-[140px] h-11 px-6 font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                        >
                            {(createTeacher.isPending || createParent.isPending) ? (
                                <>
                                    <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                                    Creating...
                                </>
                            ) : (
                                <>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Create User
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
