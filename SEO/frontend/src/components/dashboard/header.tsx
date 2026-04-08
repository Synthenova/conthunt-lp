"use client"

import { RefreshCcw } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

interface DashboardHeaderProps {
  healthy: boolean | null
  refreshing: boolean
  onRefresh: () => void
}

export function DashboardHeader({ healthy, refreshing, onRefresh }: DashboardHeaderProps) {
  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">SEO Dashboard</h1>
        <p className="text-muted-foreground text-sm">Monitor query intelligence and trigger background data pipelines.</p>
      </div>
      <div className="flex items-center gap-3">
        <Badge variant={healthy ? "default" : "destructive"}>
          API: {healthy === null ? "Checking" : healthy ? "Online" : "Offline"}
        </Badge>
        <Button onClick={onRefresh} disabled={refreshing} variant="outline" size="sm">
          <RefreshCcw className={refreshing ? "animate-spin" : ""} />
          Refresh
        </Button>
      </div>
    </header>
  )
}
