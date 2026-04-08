"use client"

import { useMemo, useState } from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { GscLatestResponse } from "@/lib/types"
import { formatDate, formatNumber, formatPercent } from "@/lib/format"

interface GscResultsProps {
  data: GscLatestResponse | null
}

export function ResultsGsc({ data }: GscResultsProps) {
  const [passType, setPassType] = useState<"pass_a" | "pass_b" | "pass_c" | "inspect">("pass_a")
  const selected = useMemo(() => (data ? data[passType] : null), [data, passType])

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2">
        <CardTitle className="text-base">Latest GSC Results</CardTitle>
        <div className="flex items-center gap-2">
          <Badge variant="outline">{selected?.run ? formatDate(selected.run.started_at) : "No run"}</Badge>
          <Select value={passType} onValueChange={(value) => setPassType(value as typeof passType)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pass_a">Pass A</SelectItem>
              <SelectItem value="pass_b">Pass B</SelectItem>
              <SelectItem value="pass_c">Pass C</SelectItem>
              <SelectItem value="inspect">Inspect</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {passType === "pass_a" && (
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
              {selected?.items?.map((item) => (
                <TableRow key={`${item.query_id}`}>
                  <TableCell className="max-w-[360px] truncate">{"query_text" in item ? item.query_text : "-"}</TableCell>
                  <TableCell>{"impressions" in item ? formatNumber(item.impressions) : "-"}</TableCell>
                  <TableCell>{"clicks" in item ? formatNumber(item.clicks) : "-"}</TableCell>
                  <TableCell>{"ctr" in item ? formatPercent(item.ctr) : "-"}</TableCell>
                  <TableCell>{"position" in item ? Number(item.position).toFixed(2) : "-"}</TableCell>
                </TableRow>
              ))}
              {!selected?.items?.length && (
                <TableRow>
                  <TableCell colSpan={5} className="text-muted-foreground">No GSC pass-a data available.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}

        {passType === "pass_b" && (
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
              {selected?.items?.map((item) => (
                <TableRow key={`${item.page_url}`}>
                  <TableCell className="max-w-[420px] truncate">{"page_url" in item ? item.page_url : "-"}</TableCell>
                  <TableCell>{"impressions" in item ? formatNumber(item.impressions) : "-"}</TableCell>
                  <TableCell>{"clicks" in item ? formatNumber(item.clicks) : "-"}</TableCell>
                  <TableCell>{"ctr" in item ? formatPercent(item.ctr) : "-"}</TableCell>
                  <TableCell>{"position" in item ? Number(item.position).toFixed(2) : "-"}</TableCell>
                </TableRow>
              ))}
              {!selected?.items?.length && (
                <TableRow>
                  <TableCell colSpan={5} className="text-muted-foreground">No GSC pass-b data available.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}

        {passType === "pass_c" && (
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
              {selected?.items?.map((item) => (
                <TableRow key={`${item.page_url}:${item.query_id}`}>
                  <TableCell className="max-w-[260px] truncate">{"page_url" in item ? item.page_url : "-"}</TableCell>
                  <TableCell className="max-w-[260px] truncate">{"query_text" in item ? item.query_text : "-"}</TableCell>
                  <TableCell>{"impressions" in item ? formatNumber(item.impressions) : "-"}</TableCell>
                  <TableCell>{"clicks" in item ? formatNumber(item.clicks) : "-"}</TableCell>
                  <TableCell>{"ctr" in item ? formatPercent(item.ctr) : "-"}</TableCell>
                  <TableCell>{"position" in item ? Number(item.position).toFixed(2) : "-"}</TableCell>
                </TableRow>
              ))}
              {!selected?.items?.length && (
                <TableRow>
                  <TableCell colSpan={6} className="text-muted-foreground">No GSC pass-c data available.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}

        {passType === "inspect" && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Page URL</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Coverage</TableHead>
                <TableHead>Robots</TableHead>
                <TableHead>Indexing</TableHead>
                <TableHead>Last Crawl</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {selected?.items?.map((item) => (
                <TableRow key={`${item.page_url}:${item.inspected_at}`}>
                  <TableCell className="max-w-[220px] truncate">{"page_url" in item ? item.page_url : "-"}</TableCell>
                  <TableCell>{"status" in item ? item.status ?? "-" : "-"}</TableCell>
                  <TableCell className="max-w-[180px] truncate">{"coverage_state" in item ? item.coverage_state ?? "-" : "-"}</TableCell>
                  <TableCell>{"robots_txt_state" in item ? item.robots_txt_state ?? "-" : "-"}</TableCell>
                  <TableCell>{"indexing_state" in item ? item.indexing_state ?? "-" : "-"}</TableCell>
                  <TableCell>{"last_crawl_time" in item ? formatDate(item.last_crawl_time) : "-"}</TableCell>
                </TableRow>
              ))}
              {!selected?.items?.length && (
                <TableRow>
                  <TableCell colSpan={6} className="text-muted-foreground">No GSC inspection data available.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
