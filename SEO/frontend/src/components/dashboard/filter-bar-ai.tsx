"use client"

import { DualRange } from "@/components/dashboard/dual-range"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export interface AiFilterState {
  search: string
  sourceType: string
  isActive: string
  visibilityState: "all" | "visible" | "not_visible"
  volumeMin: number
  volumeMax: number
  priorityMin: number
  priorityMax: number
  sortBy: string
  sortDir: "asc" | "desc"
}

interface FilterBarAiProps {
  state: AiFilterState
  onChange: (next: AiFilterState) => void
}

export function FilterBarAi({ state, onChange }: FilterBarAiProps) {
  return (
    <div className="space-y-3 rounded-md border p-3">
      <div className="grid grid-cols-1 gap-2 lg:grid-cols-6">
        <Input placeholder="Search query" value={state.search} onChange={(e) => onChange({ ...state, search: e.target.value })} />
        <Select value={state.sourceType} onValueChange={(v) => onChange({ ...state, sourceType: v })}>
          <SelectTrigger><SelectValue placeholder="Source" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All source</SelectItem>
            <SelectItem value="seed">Seed</SelectItem>
            <SelectItem value="gsc">GSC</SelectItem>
            <SelectItem value="manual">Manual</SelectItem>
            <SelectItem value="import">Import</SelectItem>
          </SelectContent>
        </Select>
        <Select value={state.isActive} onValueChange={(v) => onChange({ ...state, isActive: v })}>
          <SelectTrigger><SelectValue placeholder="Active" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All active</SelectItem>
            <SelectItem value="1">Active</SelectItem>
            <SelectItem value="0">Inactive</SelectItem>
          </SelectContent>
        </Select>
        <Select value={state.visibilityState} onValueChange={(v) => onChange({ ...state, visibilityState: v as "all" | "visible" | "not_visible" })}>
          <SelectTrigger><SelectValue placeholder="Visibility" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All visibility</SelectItem>
            <SelectItem value="visible">Visible</SelectItem>
            <SelectItem value="not_visible">Not Visible</SelectItem>
          </SelectContent>
        </Select>
        <Select value={state.sortBy} onValueChange={(v) => onChange({ ...state, sortBy: v })}>
          <SelectTrigger><SelectValue placeholder="Sort by" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="visibility_rate">Visibility</SelectItem>
            <SelectItem value="volume">Volume</SelectItem>
            <SelectItem value="priority_score">Priority</SelectItem>
            <SelectItem value="updated_at">Updated</SelectItem>
          </SelectContent>
        </Select>
        <Select value={state.sortDir} onValueChange={(v) => onChange({ ...state, sortDir: v as "asc" | "desc" })}>
          <SelectTrigger><SelectValue placeholder="Direction" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="desc">Desc</SelectItem>
            <SelectItem value="asc">Asc</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-1 gap-2 lg:grid-cols-2">
        <DualRange label="Volume" min={0} max={10000} minValue={state.volumeMin} maxValue={state.volumeMax} onChange={({ minValue, maxValue }) => onChange({ ...state, volumeMin: minValue, volumeMax: maxValue })} />
        <DualRange label="Priority" min={0} max={10} step={0.1} minValue={state.priorityMin} maxValue={state.priorityMax} onChange={({ minValue, maxValue }) => onChange({ ...state, priorityMin: minValue, priorityMax: maxValue })} />
      </div>
    </div>
  )
}
