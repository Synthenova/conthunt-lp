"use client"

import { useMemo, useState } from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid } from "recharts"
import { formatNumber, formatPercent } from "@/lib/format"
import { GscPassARow, GscPassBRow, GscPassCRow, GscPassResponse } from "@/lib/types"
import { FilterBarGsc, GscFilterState } from "@/components/dashboard/filter-bar-gsc"

interface GscPassPanelsProps {
  passA: GscPassResponse<GscPassARow> | null
  passB: GscPassResponse<GscPassBRow> | null
  passC: GscPassResponse<GscPassCRow> | null
  filter: GscFilterState
  onFilterChange: (next: GscFilterState) => void
}

export function GscPassPanels({ passA, passB, passC, filter, onFilterChange }: GscPassPanelsProps) {
  const [activePass, setActivePass] = useState<"pass_a" | "pass_b" | "pass_c">("pass_a")
  const selected = useMemo(() => {
    if (activePass === "pass_b") return passB
    if (activePass === "pass_c") return passC
    return passA
  }, [activePass, passA, passB, passC])

  return (
    <div className="space-y-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">GSC Pass Analytics</CardTitle>
          <Tabs value={activePass} onValueChange={(v) => setActivePass(v as "pass_a" | "pass_b" | "pass_c")}> 
            <TabsList>
              <TabsTrigger value="pass_a">Pass A</TabsTrigger>
              <TabsTrigger value="pass_b">Pass B</TabsTrigger>
              <TabsTrigger value="pass_c">Pass C</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent className="space-y-3">
          <FilterBarGsc passType={activePass} state={filter} onChange={onFilterChange} />

          <div className="grid grid-cols-2 gap-2 lg:grid-cols-5">
            <MiniStat title="Rows" value={formatNumber(selected?.summary.rows_count)} />
            <MiniStat title="Impressions" value={formatNumber(selected?.summary.impressions)} />
            <MiniStat title="Clicks" value={formatNumber(selected?.summary.clicks)} />
            <MiniStat title="CTR" value={selected ? formatPercent(selected.summary.ctr) : "-"} />
            <MiniStat title="Position" value={selected ? selected.summary.position.toFixed(2) : "-"} />
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Daily Trend</CardTitle>
            </CardHeader>
            <CardContent className="h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={selected?.trend ?? []}>
                  <CartesianGrid vertical={false} />
                  <XAxis dataKey="day" tickFormatter={(v) => String(v).slice(5)} />
                  <YAxis />
                  <Line dataKey="impressions" stroke="var(--chart-1)" dot={false} strokeWidth={2} />
                  <Line dataKey="clicks" stroke="var(--chart-2)" dot={false} strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {activePass === "pass_a" && <PassATable rows={(selected?.items as GscPassARow[]) ?? []} />}
          {activePass === "pass_b" && <PassBTable rows={(selected?.items as GscPassBRow[]) ?? []} />}
          {activePass === "pass_c" && <PassCTable rows={(selected?.items as GscPassCRow[]) ?? []} />}
        </CardContent>
      </Card>
    </div>
  )
}

function MiniStat({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-md border p-3">
      <p className="text-xs text-muted-foreground">{title}</p>
      <p className="text-lg font-semibold">{value}</p>
    </div>
  )
}

function PassATable({ rows }: { rows: GscPassARow[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Query</TableHead>
          <TableHead>Impressions</TableHead>
          <TableHead>Clicks</TableHead>
          <TableHead>CTR</TableHead>
          <TableHead>Position</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row) => (
          <TableRow key={row.query_id}>
            <TableCell className="max-w-[320px] truncate">{row.query_text}</TableCell>
            <TableCell>{formatNumber(row.impressions)}</TableCell>
            <TableCell>{formatNumber(row.clicks)}</TableCell>
            <TableCell>{formatPercent(row.ctr)}</TableCell>
            <TableCell>{row.position.toFixed(2)}</TableCell>
          </TableRow>
        ))}
        {!rows.length && (
          <TableRow>
            <TableCell colSpan={5} className="text-muted-foreground">No pass-a rows in this range.</TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  )
}

function PassBTable({ rows }: { rows: GscPassBRow[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Page URL</TableHead>
          <TableHead>Impressions</TableHead>
          <TableHead>Clicks</TableHead>
          <TableHead>CTR</TableHead>
          <TableHead>Position</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row) => (
          <TableRow key={row.page_url}>
            <TableCell className="max-w-[420px] truncate">{row.page_url}</TableCell>
            <TableCell>{formatNumber(row.impressions)}</TableCell>
            <TableCell>{formatNumber(row.clicks)}</TableCell>
            <TableCell>{formatPercent(row.ctr)}</TableCell>
            <TableCell>{row.position.toFixed(2)}</TableCell>
          </TableRow>
        ))}
        {!rows.length && (
          <TableRow>
            <TableCell colSpan={5} className="text-muted-foreground">No pass-b rows in this range.</TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  )
}

function PassCTable({ rows }: { rows: GscPassCRow[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Page URL</TableHead>
          <TableHead>Query</TableHead>
          <TableHead>Impressions</TableHead>
          <TableHead>Clicks</TableHead>
          <TableHead>CTR</TableHead>
          <TableHead>Position</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row) => (
          <TableRow key={`${row.page_url}-${row.query_id}`}>
            <TableCell className="max-w-[280px] truncate">{row.page_url}</TableCell>
            <TableCell className="max-w-[280px] truncate">{row.query_text}</TableCell>
            <TableCell>{formatNumber(row.impressions)}</TableCell>
            <TableCell>{formatNumber(row.clicks)}</TableCell>
            <TableCell>{formatPercent(row.ctr)}</TableCell>
            <TableCell>{row.position.toFixed(2)}</TableCell>
          </TableRow>
        ))}
        {!rows.length && (
          <TableRow>
            <TableCell colSpan={6} className="text-muted-foreground">No pass-c rows in this range.</TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  )
}
