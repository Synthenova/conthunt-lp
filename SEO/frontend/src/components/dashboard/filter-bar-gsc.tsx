"use client"

import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export interface GscFilterState {
  search: string
  sortBy: string
  sortDir: "asc" | "desc"
}

interface FilterBarGscProps {
  state: GscFilterState
  passType: "pass_a" | "pass_b" | "pass_c"
  onChange: (next: GscFilterState) => void
}

export function FilterBarGsc({ state, passType, onChange }: FilterBarGscProps) {
  return (
    <div className="grid grid-cols-1 gap-2 rounded-md border p-3 lg:grid-cols-3">
      <Input placeholder="Search query/page" value={state.search} onChange={(e) => onChange({ ...state, search: e.target.value })} />
      <Select value={state.sortBy} onValueChange={(v) => onChange({ ...state, sortBy: v })}>
        <SelectTrigger><SelectValue placeholder="Sort by" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="impressions">Impressions</SelectItem>
          <SelectItem value="clicks">Clicks</SelectItem>
          <SelectItem value="ctr">CTR</SelectItem>
          <SelectItem value="position">Position</SelectItem>
          {passType !== "pass_b" && <SelectItem value="query_text">Query</SelectItem>}
          {passType !== "pass_a" && <SelectItem value="page_url">Page URL</SelectItem>}
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
  )
}
