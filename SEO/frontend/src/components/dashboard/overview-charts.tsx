"use client"

import { Area, AreaChart, Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, XAxis, YAxis } from "recharts"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { OverviewResponse } from "@/lib/types"

interface OverviewChartsProps {
  data: OverviewResponse | null
}

export function OverviewCharts({ data }: OverviewChartsProps) {
  const gscDaily = data?.charts.gsc_daily ?? []
  const aiDaily = data?.charts.ai_daily ?? []
  const bucket = data?.charts.rank_buckets
  const bucketData = [
    { name: "Top 3", value: bucket?.top_3 ?? 0 },
    { name: "Top 10", value: bucket?.top_10 ?? 0 },
    { name: ">10", value: bucket?.beyond_10 ?? 0 },
    { name: "N/A", value: bucket?.not_found ?? 0 },
  ]

  return (
    <section className="grid grid-cols-1 gap-4 xl:grid-cols-3">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Impressions vs Clicks</CardTitle>
        </CardHeader>
        <CardContent className="h-[260px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={gscDaily}>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="day" tickFormatter={(v) => String(v).slice(5)} />
              <YAxis />
              <Area type="monotone" dataKey="impressions" stroke="var(--chart-1)" fill="var(--chart-1)" fillOpacity={0.2} />
              <Area type="monotone" dataKey="clicks" stroke="var(--chart-2)" fill="var(--chart-2)" fillOpacity={0.2} />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Average Position Trend</CardTitle>
        </CardHeader>
        <CardContent className="h-[260px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={gscDaily}>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="day" tickFormatter={(v) => String(v).slice(5)} />
              <YAxis reversed />
              <Line type="monotone" dataKey="avg_position" stroke="var(--chart-3)" dot={false} strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">AI Visibility + Rank Buckets</CardTitle>
        </CardHeader>
        <CardContent className="grid h-[260px] grid-cols-2 gap-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={aiDaily}>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="day" tickFormatter={(v) => String(v).slice(5)} />
              <YAxis domain={[0, 1]} />
              <Line type="monotone" dataKey="visibility_rate" stroke="var(--chart-4)" dot={false} strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={bucketData}>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="name" />
              <YAxis />
              <Bar dataKey="value" fill="var(--chart-5)" radius={6} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </section>
  )
}
