"use client"

import { DualRange } from "@/components/dashboard/dual-range"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export interface KeywordFilterState {
  search: string
  sourceType: string
  isActive: string
  serankingStatus: string
  hasGscData: string
  volumeMin: number
  volumeMax: number
  difficultyMin: number
  difficultyMax: number
  priorityMin: number
  priorityMax: number
  sortBy: string
  sortDir: "asc" | "desc"
}

interface FilterBarKeywordsProps {
  state: KeywordFilterState
  onChange: (next: KeywordFilterState) => void
}

export function FilterBarKeywords({ state, onChange }: FilterBarKeywordsProps) {
  return (
    <div className="space-y-3 rounded-md border p-3">
      <div className="grid grid-cols-1 gap-2 lg:grid-cols-6">
        <Input placeholder="Search keyword" value={state.search} onChange={(e) => onChange({ ...state, search: e.target.value })} />
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
        <Select value={state.serankingStatus} onValueChange={(v) => onChange({ ...state, serankingStatus: v })}>
          <SelectTrigger><SelectValue placeholder="SERanking" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All SERanking</SelectItem>
            <SelectItem value="ready">Ready</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
          </SelectContent>
        </Select>
        <Select value={state.hasGscData} onValueChange={(v) => onChange({ ...state, hasGscData: v })}>
          <SelectTrigger><SelectValue placeholder="GSC data" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All GSC</SelectItem>
            <SelectItem value="1">Has GSC data</SelectItem>
            <SelectItem value="0">No GSC data</SelectItem>
          </SelectContent>
        </Select>
        <div className="grid grid-cols-2 gap-1">
          <Select value={state.sortBy} onValueChange={(v) => onChange({ ...state, sortBy: v })}>
            <SelectTrigger><SelectValue placeholder="Sort by" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="priority_score">Priority</SelectItem>
              <SelectItem value="volume">Volume</SelectItem>
              <SelectItem value="difficulty">Difficulty</SelectItem>
              <SelectItem value="cpc">CPC</SelectItem>
              <SelectItem value="serp_rank">SERP Rank</SelectItem>
              <SelectItem value="impressions">Impressions</SelectItem>
              <SelectItem value="clicks">Clicks</SelectItem>
              <SelectItem value="updated_at">Updated</SelectItem>
            </SelectContent>
          </Select>
          <Select value={state.sortDir} onValueChange={(v) => onChange({ ...state, sortDir: v as "asc" | "desc" })}>
            <SelectTrigger><SelectValue placeholder="Dir" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="desc">Desc</SelectItem>
              <SelectItem value="asc">Asc</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-2 lg:grid-cols-3">
        <DualRange label="Volume" min={0} max={10000} minValue={state.volumeMin} maxValue={state.volumeMax} onChange={({ minValue, maxValue }) => onChange({ ...state, volumeMin: minValue, volumeMax: maxValue })} />
        <DualRange label="Difficulty" min={0} max={100} minValue={state.difficultyMin} maxValue={state.difficultyMax} onChange={({ minValue, maxValue }) => onChange({ ...state, difficultyMin: minValue, difficultyMax: maxValue })} />
        <DualRange label="Priority" min={0} max={10} step={0.1} minValue={state.priorityMin} maxValue={state.priorityMax} onChange={({ minValue, maxValue }) => onChange({ ...state, priorityMin: minValue, priorityMax: maxValue })} />
      </div>
    </div>
  )
}
