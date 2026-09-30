"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle } from "lucide-react"

interface ErrorBoundaryState {
    hasError: boolean
    error: Error | null
}

interface ErrorBoundaryProps {
    children: React.ReactNode
    fallback?: React.ReactNode
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props)
        this.state = { hasError: false, error: null }
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return { hasError: true, error }
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error("ErrorBoundary caught an error:", error, errorInfo)
    }

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback
            }

            return (
                <Card className="m-8">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <AlertCircle className="h-5 w-5 text-destructive" />
                            <CardTitle>Something went wrong</CardTitle>
                        </div>
                        <CardDescription>
                            An unexpected error occurred. Please try again.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {this.state.error && (
                            <div className="p-4 bg-muted rounded-lg">
                                <p className="text-sm font-mono text-muted-foreground">
                                    {this.state.error.message}
                                </p>
                            </div>
                        )}
                        <Button
                            onClick={() => {
                                this.setState({ hasError: false, error: null })
                                window.location.reload()
                            }}
                        >
                            Reload Page
                        </Button>
                    </CardContent>
                </Card>
            )
        }

        return this.props.children
    }
}



