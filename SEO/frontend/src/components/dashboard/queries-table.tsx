"use client"

import { useMemo, useState } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { QueryClass, QueryRow } from "@/lib/types"
import { formatNumber } from "@/lib/format"

interface QueriesTableProps {
  title: string
  rows: QueryRow[]
  queryClass: QueryClass
  loading: boolean
  onRefresh: () => void
  onPatchQuery: (queryId: number, payload: Partial<Pick<QueryRow, "is_active" | "query_class">>) => Promise<void>
  onOpenTrend: (row: QueryRow) => void
}

export function QueriesTable({
  title,
  rows,
  queryClass,
  loading,
  onRefresh,
  onPatchQuery,
  onOpenTrend,
}: QueriesTableProps) {
  const [search, setSearch] = useState("")
  const [sourceFilter, setSourceFilter] = useState("all")
  const [activeFilter, setActiveFilter] = useState("all")

  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      if (sourceFilter !== "all" && row.source_type !== sourceFilter) return false
      if (activeFilter !== "all" && String(row.is_active) !== activeFilter) return false
      if (search && !row.query_text.toLowerCase().includes(search.toLowerCase())) return false
      return true
    })
  }, [rows, search, sourceFilter, activeFilter])

  return (
    <Card>
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <CardTitle className="text-base">{title}</CardTitle>
        <div className="flex flex-wrap items-center gap-2">
          <Input
            placeholder="Search query..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="w-[220px]"
          />
          <Select value={sourceFilter} onValueChange={setSourceFilter}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Source" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All source</SelectItem>
              <SelectItem value="seed">Seed</SelectItem>
              <SelectItem value="gsc">GSC</SelectItem>
              <SelectItem value="manual">Manual</SelectItem>
              <SelectItem value="import">Import</SelectItem>
            </SelectContent>
          </Select>
          <Select value={activeFilter} onValueChange={setActiveFilter}>
            <SelectTrigger className="w-[110px]">
              <SelectValue placeholder="Active" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="1">Active</SelectItem>
              <SelectItem value="0">Inactive</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={onRefresh}>Refresh</Button>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Query</TableHead>
              <TableHead>Source</TableHead>
              <TableHead>Volume</TableHead>
              <TableHead>CPC</TableHead>
              <TableHead>Difficulty</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Active</TableHead>
              <TableHead>Class</TableHead>
              <TableHead>Trend</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRows.map((row) => (
              <TableRow key={row.id}>
                <TableCell className="max-w-[340px] truncate">{row.query_text}</TableCell>
                <TableCell><Badge variant="outline">{row.source_type}</Badge></TableCell>
                <TableCell>{formatNumber(row.volume)}</TableCell>
                <TableCell>{row.cpc ?? "-"}</TableCell>
                <TableCell>{row.difficulty ?? "-"}</TableCell>
                <TableCell>{row.priority_score ?? "-"}</TableCell>
                <TableCell>
                  <Switch
                    checked={Boolean(row.is_active)}
                    onCheckedChange={(checked) => {
                      void onPatchQuery(row.id, { is_active: checked ? 1 : 0 })
                    }}
                  />
                </TableCell>
                <TableCell>
                  <Select
                    value={row.query_class}
                    onValueChange={(value) => {
                      void onPatchQuery(row.id, { query_class: value as QueryClass })
                    }}
                  >
                    <SelectTrigger className="w-[140px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="keyword">keyword</SelectItem>
                      <SelectItem value="ai_visibility">ai_visibility</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  <Button variant="outline" size="sm" onClick={() => onOpenTrend(row)}>
                    View
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {!filteredRows.length && !loading && (
              <TableRow>
                <TableCell colSpan={9} className="text-muted-foreground">
                  No queries matched filters.
                </TableCell>
              </TableRow>
            )}
            {loading && (
              <TableRow>
                <TableCell colSpan={9} className="text-muted-foreground">
                  Loading {queryClass} queries...
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
