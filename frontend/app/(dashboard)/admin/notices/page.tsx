"use client"

import { CreateNoticeDialog } from "@/components/admin/notices/create-notice-dialog"
import { NoticeList } from "@/components/admin/notices/notice-list"

export default function NoticesPage() {
    return (
        <div className="flex flex-col gap-6 animate-fade-in">
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h1 className="text-2xl font-semibold tracking-tight">
                        Notice Board
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Post and manage school-wide announcements.
                    </p>
                </div>
                <CreateNoticeDialog />
            </div>

            <NoticeList />
        </div>
    )
}
