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
import { Plus } from "lucide-react"
import { useCreateNotice } from "@/lib/hooks/use-notices"
import { toast } from "sonner"

const noticeSchema = z.object({
    title: z.string().min(1, "Title is required"),
    description: z.string().min(1, "Description is required"),
})

type NoticeFormData = z.infer<typeof noticeSchema>

export function CreateNoticeDialog() {
    const [open, setOpen] = useState(false)
    const createNotice = useCreateNotice()
    
    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm<NoticeFormData>({
        resolver: zodResolver(noticeSchema),
    })
    
    const onSubmit = async (data: NoticeFormData) => {
        try {
            await createNotice.mutateAsync({
                title: data.title,
                description: data.description,
            })
            reset()
            setOpen(false)
            toast.success("Notice posted successfully")
            await new Promise(resolve => setTimeout(resolve, 100))
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to post notice")
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Post Notice
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>Create New Notice</DialogTitle>
                    <DialogDescription>
                        Post an announcement for the school notice board. All users will be able to see this notice.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="title" className="text-right">
                                Title
                            </Label>
                            <div className="col-span-3">
                                <Input 
                                    id="title" 
                                    placeholder="School Holiday Announcement" 
                                    {...register("title")}
                                />
                                {errors.title && (
                                    <p className="text-xs text-destructive mt-1">{errors.title.message}</p>
                                )}
                            </div>
                        </div>
                        <div className="grid grid-cols-4 items-start gap-4">
                            <Label htmlFor="description" className="text-right pt-2">
                                Content
                            </Label>
                            <div className="col-span-3">
                                <Textarea 
                                    id="description" 
                                    placeholder="Enter the full details of the notice..." 
                                    className="min-h-[120px]"
                                    {...register("description")}
                                />
                                {errors.description && (
                                    <p className="text-xs text-destructive mt-1">{errors.description.message}</p>
                                )}
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button 
                            type="button" 
                            variant="outline" 
                            onClick={() => {
                                reset()
                                setOpen(false)
                            }}
                        >
                            Cancel
                        </Button>
                        <Button 
                            type="submit" 
                            disabled={createNotice.isPending}
                        >
                            {createNotice.isPending ? "Posting..." : "Post Notice"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
