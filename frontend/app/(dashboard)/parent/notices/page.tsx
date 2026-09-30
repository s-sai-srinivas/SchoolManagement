"use client"

import { NoticeList } from "@/components/admin/notices/notice-list"

export default function ParentNoticesPage() {
    return (
        <div className="flex flex-col gap-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Notice Board</h1>
                <p className="text-muted-foreground">
                    View school announcements and important updates.
                </p>
            </div>

            <NoticeList />
        </div>
    )
}
