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
import { Textarea } from "@/components/ui/textarea"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Plus, Upload } from "lucide-react"
import { useCreateHomework } from "@/lib/hooks/use-homework"
import { useCurrentUser } from "@/lib/hooks/use-current-user"
import { toast } from "sonner"

const homeworkSchema = z.object({
    subject: z.string().min(1, "Subject is required"),
    title: z.string().min(1, "Title is required"),
    description: z.string().min(1, "Description is required"),
    class: z.string().min(1, "Class is required"),
    section: z.string().min(1, "Section is required"),
    dueDate: z.string().optional(),
    file: z.instanceof(File).optional(),
})

type HomeworkFormData = z.infer<typeof homeworkSchema>

export function CreateHomeworkDialog() {
    const [open, setOpen] = useState(false)
    const [file, setFile] = useState<File | null>(null)
    const { data: currentUser } = useCurrentUser()
    const createHomework = useCreateHomework()
    
    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
        watch,
        reset,
    } = useForm<HomeworkFormData>({
        resolver: zodResolver(homeworkSchema),
    })
    
    const selectedClass = watch("class")
    
    const onSubmit = async (data: HomeworkFormData) => {
        try {
            const formData: any = {
                subject: data.subject,
                title: data.title,
                description: data.description,
                class: data.class,
                section: data.section,
                dueDate: data.dueDate || undefined,
            }
            
            if (file) {
                formData.image = file
            }
            
            await createHomework.mutateAsync(formData)
            reset()
            setFile(null)
            setOpen(false)
            toast.success("Homework posted successfully")
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to post homework")
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Post Homework
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[525px]">
                <DialogHeader>
                    <DialogTitle>Create Homework Assignment</DialogTitle>
                    <DialogDescription>
                        Post new homework for a specific class and section.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="subject" className="text-right">
                                Subject
                            </Label>
                            <div className="col-span-3">
                                <Input 
                                    id="subject" 
                                    placeholder="Mathematics" 
                                    {...register("subject")}
                                />
                                {errors.subject && (
                                    <p className="text-xs text-destructive mt-1">{errors.subject.message}</p>
                                )}
                            </div>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="title" className="text-right">
                                Title
                            </Label>
                            <div className="col-span-3">
                                <Input 
                                    id="title" 
                                    placeholder="Chapter 5 Exercises" 
                                    {...register("title")}
                                />
                                {errors.title && (
                                    <p className="text-xs text-destructive mt-1">{errors.title.message}</p>
                                )}
                            </div>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="description" className="text-right">
                                Description
                            </Label>
                            <div className="col-span-3">
                                <Textarea 
                                    id="description" 
                                    placeholder="Complete exercises 1-10..." 
                                    {...register("description")}
                                    className="min-h-[100px]"
                                />
                                {errors.description && (
                                    <p className="text-xs text-destructive mt-1">{errors.description.message}</p>
                                )}
                            </div>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="class" className="text-right">
                                Class
                            </Label>
                            <div className="col-span-3">
                                <Select onValueChange={(value) => setValue("class", value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select class" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Array.from({ length: 10 }, (_, i) => i + 1).map((num) => (
                                            <SelectItem key={num} value={num.toString()}>
                                                Class {num}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.class && (
                                    <p className="text-xs text-destructive mt-1">{errors.class.message}</p>
                                )}
                            </div>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="section" className="text-right">
                                Section
                            </Label>
                            <div className="col-span-3">
                                <Select onValueChange={(value) => setValue("section", value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select section" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {["A", "B", "C", "D"].map((section) => (
                                            <SelectItem key={section} value={section}>
                                                Section {section}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.section && (
                                    <p className="text-xs text-destructive mt-1">{errors.section.message}</p>
                                )}
                            </div>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="dueDate" className="text-right">
                                Due Date
                            </Label>
                            <Input 
                                id="dueDate" 
                                type="date" 
                                className="col-span-3"
                                {...register("dueDate")}
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right">Attachment</Label>
                            <div className="col-span-3">
                                <Input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => {
                                        const selectedFile = e.target.files?.[0]
                                        if (selectedFile) {
                                            setFile(selectedFile)
                                            setValue("file", selectedFile)
                                        }
                                    }}
                                    className="cursor-pointer"
                                />
                                {file && (
                                    <p className="text-xs text-muted-foreground mt-1">{file.name}</p>
                                )}
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={createHomework.isPending}>
                            {createHomework.isPending ? "Posting..." : "Post Homework"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
