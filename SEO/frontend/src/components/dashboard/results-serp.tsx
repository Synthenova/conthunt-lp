import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { SerpLatestResponse } from "@/lib/types"
import { formatDate } from "@/lib/format"

interface SerpResultsProps {
  data: SerpLatestResponse | null
}

export function ResultsSerp({ data }: SerpResultsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-base">
          Latest SERP Results
          <Badge variant="outline">{data?.run ? formatDate(data.run.started_at) : "No run"}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Query</TableHead>
              <TableHead>Rank</TableHead>
              <TableHead>URL</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(data?.items ?? []).slice(0, 20).map((item) => (
              <TableRow key={item.query_id}>
                <TableCell className="max-w-[320px] truncate">{item.query_text}</TableCell>
                <TableCell>{item.rank ?? "Not Found"}</TableCell>
                <TableCell className="max-w-[360px] truncate">{item.url ?? "-"}</TableCell>
              </TableRow>
            ))}
            {!data?.items?.length && (
              <TableRow>
                <TableCell colSpan={3} className="text-muted-foreground">
                  No SERP data available.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
