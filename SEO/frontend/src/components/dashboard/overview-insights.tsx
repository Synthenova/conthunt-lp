import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { OverviewResponse } from "@/lib/types"
import { formatNumber } from "@/lib/format"

interface OverviewInsightsProps {
  data: OverviewResponse | null
}

export function OverviewInsights({ data }: OverviewInsightsProps) {
  const gainers = data?.insights.top_gainers ?? []
  const losers = data?.insights.top_losers ?? []
  const opportunities = data?.insights.opportunities ?? []

  return (
    <section className="grid grid-cols-1 gap-4 xl:grid-cols-3">
      <InsightTable
        title="Top Gainers"
        rows={gainers.map((row) => ({ k1: row.query_text, k2: `${row.first_rank} → ${row.last_rank}`, k3: `+${row.delta}` }))}
      />
      <InsightTable
        title="Top Losers"
        rows={losers.map((row) => ({ k1: row.query_text, k2: `${row.first_rank} → ${row.last_rank}`, k3: String(row.delta) }))}
      />
      <InsightTable
        title="Opportunities"
        rows={opportunities.map((row) => ({ k1: row.query_text, k2: formatNumber(row.impressions), k3: row.rank ?? "N/A" }))}
      />
    </section>
  )
}

function InsightTable({ title, rows }: { title: string; rows: Array<{ k1: string; k2: string | number; k3: string | number }> }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Query</TableHead>
              <TableHead>Metric</TableHead>
              <TableHead>Delta</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.slice(0, 8).map((row, idx) => (
              <TableRow key={`${row.k1}-${idx}`}>
                <TableCell className="max-w-[260px] truncate">{row.k1}</TableCell>
                <TableCell>{row.k2}</TableCell>
                <TableCell>{row.k3}</TableCell>
              </TableRow>
            ))}
            {!rows.length && (
              <TableRow>
                <TableCell colSpan={3} className="text-muted-foreground">No rows in this range.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
