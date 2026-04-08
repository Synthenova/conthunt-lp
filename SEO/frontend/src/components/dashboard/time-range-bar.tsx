"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TimeRangeState } from "@/lib/types"
import { DualRange } from "@/components/dashboard/dual-range"

interface TimeRangeBarProps {
  draft: TimeRangeState
  applied: TimeRangeState
  onDraftChange: (next: TimeRangeState) => void
  onApply: () => void
  onReset: () => void
}

export function TimeRangeBar({ draft, applied, onDraftChange, onApply, onReset }: TimeRangeBarProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">Time Range</CardTitle>
        <Badge variant="outline">
          Applied: {applied.from_day_ago}d to {applied.to_day_ago}d ago
        </Badge>
      </CardHeader>
      <CardContent className="space-y-3">
        <DualRange
          label="Global Range (Days Ago)"
          min={1}
          max={60}
          minValue={draft.to_day_ago}
          maxValue={draft.from_day_ago}
          onChange={({ minValue, maxValue }) => onDraftChange({ from_day_ago: maxValue, to_day_ago: minValue })}
        />
        <div className="flex items-center gap-2">
          <Button onClick={onApply}>Apply</Button>
          <Button variant="outline" onClick={onReset}>Reset to 60 to 1</Button>
        </div>
      </CardContent>
    </Card>
  )
}
