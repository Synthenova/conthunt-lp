import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { OverviewResponse } from "@/lib/types"
import { formatNumber, formatPercent } from "@/lib/format"

interface OverviewKpisProps {
  data: OverviewResponse | null
}

export function OverviewKpis({ data }: OverviewKpisProps) {
  const kpis = data?.kpis
  const cards = [
    { key: "impressions", title: "Impressions", value: kpis ? formatNumber(kpis.total_impressions) : "-" },
    { key: "clicks", title: "Clicks", value: kpis ? formatNumber(kpis.total_clicks) : "-" },
    { key: "ctr", title: "CTR", value: kpis ? formatPercent(kpis.ctr) : "-" },
    { key: "position", title: "Avg Position", value: kpis ? kpis.avg_position.toFixed(2) : "-" },
    { key: "ai", title: "AI Visibility", value: kpis ? formatPercent(kpis.ai_visibility_rate) : "-" },
    { key: "tracked", title: "Tracked Keywords", value: kpis ? formatNumber(kpis.tracked_keywords) : "-" },
    { key: "gainers", title: "Gainers", value: kpis ? formatNumber(kpis.gainers) : "-" },
    { key: "losers", title: "Losers", value: kpis ? formatNumber(kpis.losers) : "-" },
  ]

  return (
    <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.key}>
          <CardHeader className="pb-1">
            <CardTitle className="text-xs font-medium text-muted-foreground">{card.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-semibold">{card.value}</div>
          </CardContent>
        </Card>
      ))}
    </section>
  )
}
