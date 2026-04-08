import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { AiLatestResponse } from "@/lib/types"
import { formatDate } from "@/lib/format"

interface AiResultsProps {
  data: AiLatestResponse | null
}

export function ResultsAi({ data }: AiResultsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-base">
          Latest AI Visibility Results
          <Badge variant="outline">{data?.run ? formatDate(data.run.started_at) : "No run"}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Query</TableHead>
              <TableHead>Visible</TableHead>
              <TableHead>Citations</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(data?.items ?? []).slice(0, 20).map((item) => (
              <TableRow key={item.query_id}>
                <TableCell className="max-w-[360px] truncate">{item.query_text}</TableCell>
                <TableCell>
                  <Badge variant={item.is_visible ? "default" : "secondary"}>{item.is_visible ? "Yes" : "No"}</Badge>
                </TableCell>
                <TableCell>{item.citation_urls.length}</TableCell>
              </TableRow>
            ))}
            {!data?.items?.length && (
              <TableRow>
                <TableCell colSpan={3} className="text-muted-foreground">
                  No AI visibility data available.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
