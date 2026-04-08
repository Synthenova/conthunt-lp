import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { MetaSummary } from "@/lib/types"

interface KpiCardsProps {
  summary: MetaSummary | null
  loading: boolean
}

const CARD_CONFIG = [
  { key: "total_queries", title: "Total Queries" },
  { key: "keyword_queries", title: "Keyword Queries" },
  { key: "ai_queries", title: "AI Queries" },
  { key: "queued_jobs", title: "Queued Jobs" },
  { key: "running_jobs", title: "Running Jobs" },
] as const

export function KpiCards({ summary, loading }: KpiCardsProps) {
  return (
    <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
      {CARD_CONFIG.map((card) => (
        <Card key={card.key}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{card.title}</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-7 w-16" />
            ) : (
              <div className="text-2xl font-semibold">{summary ? summary[card.key] : "-"}</div>
            )}
          </CardContent>
        </Card>
      ))}
    </section>
  )
}
