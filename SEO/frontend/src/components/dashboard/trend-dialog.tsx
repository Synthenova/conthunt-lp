"use client"

import { useMemo } from "react"
import { CartesianGrid, Line, LineChart, XAxis } from "recharts"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { TrendResponse } from "@/lib/types"

interface TrendDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  metric: "rank" | "is_visible" | "clicks"
  data: TrendResponse | null
}

const chartConfig = {
  value: {
    label: "Value",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig

export function TrendDialog({ open, onOpenChange, title, metric, data }: TrendDialogProps) {
  const points = useMemo(
    () =>
      (data?.points ?? []).map((point) => ({
        date: point.started_at,
        value: metric === "rank" ? point.rank : metric === "clicks" ? point.clicks : point.is_visible,
      })),
    [data, metric]
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            {title}
            <Badge variant="outline">{points.length} points</Badge>
          </DialogTitle>
          <DialogDescription>Historical run trend for selected query.</DialogDescription>
        </DialogHeader>
        {!points.length ? (
          <p className="text-muted-foreground text-sm">No trend data available.</p>
        ) : (
          <ChartContainer className="h-[320px] w-full" config={chartConfig}>
            <LineChart data={points} margin={{ left: 8, right: 8 }}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="date"
                tickFormatter={(value) => new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                tickLine={false}
                axisLine={false}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line type="monotone" dataKey="value" stroke="var(--color-value)" strokeWidth={2} dot={false} />
            </LineChart>
          </ChartContainer>
        )}
      </DialogContent>
    </Dialog>
  )
}
