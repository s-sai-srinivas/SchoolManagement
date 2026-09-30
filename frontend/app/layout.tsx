import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ReactQueryProvider } from '@/lib/providers/react-query-provider'
import { Toaster } from '@/components/ui/sonner'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'School Management System',
  description: 'Comprehensive school management solution',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <ReactQueryProvider>
          {children}
          <Toaster />
        </ReactQueryProvider>
      </body>
    </html>
  )
}
