"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface DualRangeProps {
  label: string
  min: number
  max: number
  step?: number
  minValue: number
  maxValue: number
  onChange: (next: { minValue: number; maxValue: number }) => void
}

export function DualRange({
  label,
  min,
  max,
  step = 1,
  minValue,
  maxValue,
  onChange,
}: DualRangeProps) {
  const safeMin = Math.min(minValue, maxValue)
  const safeMax = Math.max(minValue, maxValue)
  const range = Math.max(max - min, 1)
  const left = ((safeMin - min) / range) * 100
  const right = ((safeMax - min) / range) * 100

  return (
    <div className="space-y-2 rounded-md border p-3">
      <div className="flex items-center justify-between">
        <Label>{label}</Label>
        <span className="text-xs text-muted-foreground">
          {safeMin} - {safeMax}
        </span>
      </div>

      <div className="relative h-8">
        <div className="absolute top-1/2 h-2 w-full -translate-y-1/2 rounded-full bg-muted" />
        <div
          className="absolute top-1/2 h-2 -translate-y-1/2 rounded-full bg-primary/70"
          style={{
            left: `${left}%`,
            width: `${Math.max(right - left, 0)}%`,
          }}
        />
        <div
          className="pointer-events-none absolute top-1/2 z-20 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border border-border bg-background shadow"
          style={{ left: `${left}%` }}
        />
        <div
          className="pointer-events-none absolute top-1/2 z-20 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border border-border bg-background shadow"
          style={{ left: `${right}%` }}
        />

        <input
          className="range-thumb range-thumb-left"
          type="range"
          min={min}
          max={max}
          step={step}
          value={safeMin}
          onInput={(e) => {
            const next = Number(e.target.value)
            onChange({ minValue: Math.min(next, safeMax), maxValue: safeMax })
          }}
        />
        <input
          className="range-thumb range-thumb-right"
          type="range"
          min={min}
          max={max}
          step={step}
          value={safeMax}
          onInput={(e) => {
            const next = Number(e.target.value)
            onChange({ minValue: safeMin, maxValue: Math.max(next, safeMin) })
          }}
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Input
          type="number"
          value={safeMin}
          min={min}
          max={safeMax}
          onChange={(e) => {
            const next = Number(e.target.value)
            onChange({ minValue: Math.max(min, Math.min(next, safeMax)), maxValue: safeMax })
          }}
        />
        <Input
          type="number"
          value={safeMax}
          min={safeMin}
          max={max}
          onChange={(e) => {
            const next = Number(e.target.value)
            onChange({ minValue: safeMin, maxValue: Math.min(max, Math.max(next, safeMin)) })
          }}
        />
      </div>

      <style jsx>{`
        .range-thumb {
          position: absolute;
          pointer-events: none;
          -webkit-appearance: none;
          appearance: none;
          background: transparent;
          width: 100%;
          height: 2rem;
          top: 0;
          left: 0;
          margin: 0;
        }
        .range-thumb::-webkit-slider-thumb {
          pointer-events: auto;
          -webkit-appearance: none;
          appearance: none;
          width: 18px;
          height: 18px;
          border-radius: 9999px;
          border: 2px solid hsl(var(--primary));
          background: hsl(var(--background));
          box-shadow: 0 0 0 3px hsl(var(--primary) / 0.2);
          cursor: pointer;
        }
        .range-thumb::-moz-range-thumb {
          pointer-events: auto;
          width: 18px;
          height: 18px;
          border-radius: 9999px;
          border: 2px solid hsl(var(--primary));
          background: hsl(var(--background));
          box-shadow: 0 0 0 3px hsl(var(--primary) / 0.2);
          cursor: pointer;
        }
      `}</style>
    </div>
  )
}
