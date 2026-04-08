"use client"

import { useCallback, useEffect, useMemo, useState } from "react"

import { DashboardHeader } from "@/components/dashboard/header"
import { JobsPanel } from "@/components/dashboard/jobs-panel"
import { OverviewKpis } from "@/components/dashboard/overview-kpis"
import { OverviewCharts } from "@/components/dashboard/overview-charts"
import { OverviewInsights } from "@/components/dashboard/overview-insights"
import { TimeRangeBar } from "@/components/dashboard/time-range-bar"
import { FilterBarKeywords, KeywordFilterState } from "@/components/dashboard/filter-bar-keywords"
import { FilterBarAi, AiFilterState } from "@/components/dashboard/filter-bar-ai"
import { GscPassPanels } from "@/components/dashboard/gsc-pass-panels"
import { ContentActionsPanel } from "@/components/dashboard/content-actions-panel"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { api } from "@/lib/api"
import {
  AiAnalyticsResponse,
  GscPassResponse,
  GscPassARow,
  GscPassBRow,
  GscPassCRow,
  GscProgressResponse,
  Job,
  OverviewResponse,
  QueryClass,
  TimeRangeState,
  TrendResponse,
  KeywordAnalyticsResponse,
} from "@/lib/types"
import { formatNumber, formatPercent } from "@/lib/format"
import { TrendDialog } from "@/components/dashboard/trend-dialog"

const DEFAULT_RANGE: TimeRangeState = { from_day_ago: 60, to_day_ago: 1 }

const DEFAULT_KEYWORD_FILTER: KeywordFilterState = {
  search: "",
  sourceType: "all",
  isActive: "all",
  serankingStatus: "all",
  hasGscData: "all",
  volumeMin: 0,
  volumeMax: 10000,
  difficultyMin: 0,
  difficultyMax: 100,
  priorityMin: 0,
  priorityMax: 10,
  sortBy: "priority_score",
  sortDir: "desc",
}

const DEFAULT_AI_FILTER: AiFilterState = {
  search: "",
  sourceType: "all",
  isActive: "all",
  visibilityState: "all",
  volumeMin: 0,
  volumeMax: 10000,
  priorityMin: 0,
  priorityMax: 10,
  sortBy: "visibility_rate",
  sortDir: "desc",
}

export default function Home() {
  const [activeTab, setActiveTab] = useState("overview")

  const [healthy, setHealthy] = useState<boolean | null>(null)
  const [jobs, setJobs] = useState<Job[]>([])
  const [gscProgress, setGscProgress] = useState<GscProgressResponse | null>(null)
  const [activeGscJobId, setActiveGscJobId] = useState<number | null>(null)

  const [draftRange, setDraftRange] = useState<TimeRangeState>(DEFAULT_RANGE)
  const [appliedRange, setAppliedRange] = useState<TimeRangeState>(DEFAULT_RANGE)

  const [overview, setOverview] = useState<OverviewResponse | null>(null)
  const [keywordData, setKeywordData] = useState<KeywordAnalyticsResponse | null>(null)
  const [aiData, setAiData] = useState<AiAnalyticsResponse | null>(null)
  const [passA, setPassA] = useState<GscPassResponse<GscPassARow> | null>(null)
  const [passB, setPassB] = useState<GscPassResponse<GscPassBRow> | null>(null)
  const [passC, setPassC] = useState<GscPassResponse<GscPassCRow> | null>(null)

  const [keywordFilter, setKeywordFilter] = useState<KeywordFilterState>(DEFAULT_KEYWORD_FILTER)
  const [aiFilter, setAiFilter] = useState<AiFilterState>(DEFAULT_AI_FILTER)
  const [gscFilter, setGscFilter] = useState({ search: "", sortBy: "impressions", sortDir: "desc" as "asc" | "desc" })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  const [trendOpen, setTrendOpen] = useState(false)
  const [trendTitle, setTrendTitle] = useState("Trend")
  const [trendMetric, setTrendMetric] = useState<"rank" | "is_visible" | "clicks">("rank")
  const [trendData, setTrendData] = useState<TrendResponse | null>(null)

  const trackedGscJobId = useMemo(() => {
    if (activeGscJobId) return activeGscJobId
    const runningOrQueued = jobs.find((job) => job.job_type === "gsc_sync" && (job.status === "queued" || job.status === "running"))
    return runningOrQueued?.id ?? null
  }, [activeGscJobId, jobs])

  const loadHealthAndSummary = useCallback(async () => {
    const controller = new AbortController()
    try {
      const [health, meta] = await Promise.all([api.health(controller.signal), api.metaSummary(controller.signal)])
      setHealthy(health.status === "ok")
      void meta
    } catch (err) {
      setHealthy(false)
      setError(err instanceof Error ? err.message : "Failed to load summary")
    }
    return () => controller.abort()
  }, [])

  const loadJobs = useCallback(async () => {
    const controller = new AbortController()
    try {
      const response = await api.listJobs({ limit: 200 }, controller.signal)
      setJobs(response.items)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load jobs")
    }
    return () => controller.abort()
  }, [])

  const loadOverview = useCallback(async () => {
    const controller = new AbortController()
    try {
      setOverview(await api.dashboardOverview(appliedRange, controller.signal))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load overview")
    }
    return () => controller.abort()
  }, [appliedRange])

  const loadKeywordAnalytics = useCallback(async () => {
    const controller = new AbortController()
    try {
      setKeywordData(
        await api.keywordAnalytics(
          {
            range: appliedRange,
            search: keywordFilter.search || undefined,
            sourceType: keywordFilter.sourceType !== "all" ? keywordFilter.sourceType : undefined,
            isActive: keywordFilter.isActive !== "all" ? Number(keywordFilter.isActive) : undefined,
            serankingStatus: keywordFilter.serankingStatus !== "all" ? keywordFilter.serankingStatus : undefined,
            hasGscData: keywordFilter.hasGscData !== "all" ? Number(keywordFilter.hasGscData) : undefined,
            volumeMin: keywordFilter.volumeMin,
            volumeMax: keywordFilter.volumeMax,
            difficultyMin: keywordFilter.difficultyMin,
            difficultyMax: keywordFilter.difficultyMax,
            priorityMin: keywordFilter.priorityMin,
            priorityMax: keywordFilter.priorityMax,
            sortBy: keywordFilter.sortBy,
            sortDir: keywordFilter.sortDir,
            limit: 100,
            offset: 0,
          },
          controller.signal
        )
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load keyword analytics")
    }
    return () => controller.abort()
  }, [appliedRange, keywordFilter])

  const loadAiAnalytics = useCallback(async () => {
    const controller = new AbortController()
    try {
      setAiData(
        await api.aiAnalytics(
          {
            range: appliedRange,
            search: aiFilter.search || undefined,
            sourceType: aiFilter.sourceType !== "all" ? aiFilter.sourceType : undefined,
            isActive: aiFilter.isActive !== "all" ? Number(aiFilter.isActive) : undefined,
            visibilityState: aiFilter.visibilityState,
            volumeMin: aiFilter.volumeMin,
            volumeMax: aiFilter.volumeMax,
            priorityMin: aiFilter.priorityMin,
            priorityMax: aiFilter.priorityMax,
            sortBy: aiFilter.sortBy,
            sortDir: aiFilter.sortDir,
            limit: 100,
            offset: 0,
          },
          controller.signal
        )
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load AI analytics")
    }
    return () => controller.abort()
  }, [aiFilter, appliedRange])

  const loadGscAnalytics = useCallback(async () => {
    const controller = new AbortController()
    try {
      const [a, b, c] = await Promise.all([
        api.gscPassA({ range: appliedRange, search: gscFilter.search || undefined, sortBy: gscFilter.sortBy, sortDir: gscFilter.sortDir, limit: 100 }, controller.signal),
        api.gscPassB({ range: appliedRange, search: gscFilter.search || undefined, sortBy: gscFilter.sortBy, sortDir: gscFilter.sortDir, limit: 100 }, controller.signal),
        api.gscPassC({ range: appliedRange, search: gscFilter.search || undefined, sortBy: gscFilter.sortBy, sortDir: gscFilter.sortDir, limit: 100 }, controller.signal),
      ])
      setPassA(a)
      setPassB(b)
      setPassC(c)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load GSC analytics")
    }
    return () => controller.abort()
  }, [appliedRange, gscFilter])

  const refreshAll = useCallback(async () => {
    setLoading(true)
    setError(null)
    await Promise.all([
      loadHealthAndSummary(),
      loadJobs(),
      loadOverview(),
      loadKeywordAnalytics(),
      loadAiAnalytics(),
      loadGscAnalytics(),
    ])
    setLoading(false)
  }, [loadAiAnalytics, loadGscAnalytics, loadHealthAndSummary, loadJobs, loadKeywordAnalytics, loadOverview])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void refreshAll()
  }, [refreshAll])

  useEffect(() => {
    if (activeTab !== "jobs") return
    const interval = setInterval(() => {
      void loadJobs()
    }, 3000)
    return () => clearInterval(interval)
  }, [activeTab, loadJobs])

  useEffect(() => {
    if (activeTab !== "jobs") return
    if (!trackedGscJobId) return

    const pollProgress = async () => {
      try {
        const progress = await api.getGscProgress(trackedGscJobId)
        setGscProgress(progress)
      } catch {
        // keep silent polling
      }
    }

    void pollProgress()
    const interval = setInterval(() => {
      void pollProgress()
    }, 2000)
    return () => clearInterval(interval)
  }, [activeTab, trackedGscJobId])

  const handlePatchQuery = useCallback(
    async (queryId: number, payload: Partial<{ is_active: 0 | 1; query_class: QueryClass }>) => {
      await api.patchQuery(queryId, payload)
      await Promise.all([loadKeywordAnalytics(), loadAiAnalytics(), loadHealthAndSummary()])
      setNotice("Query updated.")
    },
    [loadAiAnalytics, loadHealthAndSummary, loadKeywordAnalytics]
  )

  const openTrend = useCallback(async (row: { id: number; query_text: string; query_class: QueryClass }) => {
    setTrendTitle(row.query_text)
    if (row.query_class === "keyword") {
      setTrendMetric("rank")
      setTrendData(await api.serpTrend(row.id))
    } else {
      setTrendMetric("is_visible")
      setTrendData(await api.aiTrend(row.id))
    }
    setTrendOpen(true)
  }, [])

  const enqueueAndRefreshJobs = useCallback(
    async (enqueueFn: () => Promise<unknown>, successNotice = "Job enqueued successfully.") => {
      setError(null)
      try {
        await enqueueFn()
        await Promise.all([loadJobs(), loadHealthAndSummary()])
        setActiveTab("jobs")
        setNotice(successNotice)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to enqueue job")
      }
    },
    [loadHealthAndSummary, loadJobs]
  )

  return (
    <main className="min-h-screen bg-background px-4 py-6 sm:px-6 lg:px-10">
      <div className="mx-auto flex w-full max-w-[1500px] flex-col gap-6">
        <DashboardHeader healthy={healthy} refreshing={loading} onRefresh={() => void refreshAll()} />
        <TimeRangeBar
          draft={draftRange}
          applied={appliedRange}
          onDraftChange={setDraftRange}
          onApply={() => setAppliedRange(draftRange)}
          onReset={() => {
            setDraftRange(DEFAULT_RANGE)
            setAppliedRange(DEFAULT_RANGE)
          }}
        />

        {notice && (
          <Card>
            <CardContent className="py-3 text-sm text-muted-foreground">{notice}</CardContent>
          </Card>
        )}

        {error && (
          <Card>
            <CardContent className="py-3 text-sm text-destructive">{error}</CardContent>
          </Card>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full justify-start overflow-auto">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="keywords">Keywords</TabsTrigger>
            <TabsTrigger value="ai">AI Visibility</TabsTrigger>
            <TabsTrigger value="gsc">GSC</TabsTrigger>
            <TabsTrigger value="content-actions">Content Logs</TabsTrigger>
            <TabsTrigger value="jobs">Jobs</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <OverviewKpis data={overview} />
            <OverviewCharts data={overview} />
            <OverviewInsights data={overview} />
          </TabsContent>

          <TabsContent value="keywords" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Keyword Analytics</h2>
              <Badge variant="outline">{keywordData?.total ?? 0} rows</Badge>
            </div>
            <FilterBarKeywords state={keywordFilter} onChange={setKeywordFilter} />
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Rank Distribution</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-2 lg:grid-cols-4">
                <MiniMetric title="Top 3" value={formatNumber(keywordData?.chart_summary.top_3)} />
                <MiniMetric title="Top 10" value={formatNumber(keywordData?.chart_summary.top_10)} />
                <MiniMetric title=">10" value={formatNumber(keywordData?.chart_summary.beyond_10)} />
                <MiniMetric title="N/A" value={formatNumber(keywordData?.chart_summary.not_found)} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Keywords</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Query</TableHead>
                      <TableHead>Volume</TableHead>
                      <TableHead>Difficulty</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Impressions</TableHead>
                      <TableHead>Clicks</TableHead>
                      <TableHead>SERP Rank</TableHead>
                      <TableHead>Active</TableHead>
                      <TableHead>Class</TableHead>
                      <TableHead>Trend</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(keywordData?.items ?? []).map((row) => (
                      <TableRow key={row.id}>
                        <TableCell className="max-w-[320px] truncate">{row.query_text}</TableCell>
                        <TableCell>{formatNumber(row.volume)}</TableCell>
                        <TableCell>{row.difficulty ?? "-"}</TableCell>
                        <TableCell>{row.priority_score ?? "-"}</TableCell>
                        <TableCell>{formatNumber(row.impressions)}</TableCell>
                        <TableCell>{formatNumber(row.clicks)}</TableCell>
                        <TableCell>{row.serp_rank ?? "N/A"}</TableCell>
                        <TableCell>
                          <Switch checked={Boolean(row.is_active)} onCheckedChange={(checked) => void handlePatchQuery(row.id, { is_active: checked ? 1 : 0 })} />
                        </TableCell>
                        <TableCell>
                          <Select value={row.query_class} onValueChange={(value) => void handlePatchQuery(row.id, { query_class: value as QueryClass })}>
                            <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="keyword">keyword</SelectItem>
                              <SelectItem value="ai_visibility">ai_visibility</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm" onClick={() => void openTrend(row)}>View</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {!keywordData?.items?.length && (
                      <TableRow>
                        <TableCell colSpan={10} className="text-muted-foreground">No keyword rows in this range.</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ai" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">AI Visibility Analytics</h2>
              <Badge variant="outline">{aiData?.total ?? 0} rows</Badge>
            </div>
            <FilterBarAi state={aiFilter} onChange={setAiFilter} />
            <Card>
              <CardHeader>
                <CardTitle className="text-base">AI Query Table</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Query</TableHead>
                      <TableHead>Visibility</TableHead>
                      <TableHead>Checks</TableHead>
                      <TableHead>Volume</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Active</TableHead>
                      <TableHead>Class</TableHead>
                      <TableHead>Trend</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(aiData?.items ?? []).map((row) => (
                      <TableRow key={row.id}>
                        <TableCell className="max-w-[320px] truncate">{row.query_text}</TableCell>
                        <TableCell>{formatPercent(row.visibility_rate)}</TableCell>
                        <TableCell>{formatNumber(row.checks)}</TableCell>
                        <TableCell>{formatNumber(row.volume)}</TableCell>
                        <TableCell>{row.priority_score ?? "-"}</TableCell>
                        <TableCell>
                          <Switch checked={Boolean(row.is_active)} onCheckedChange={(checked) => void handlePatchQuery(row.id, { is_active: checked ? 1 : 0 })} />
                        </TableCell>
                        <TableCell>
                          <Select value={row.query_class} onValueChange={(value) => void handlePatchQuery(row.id, { query_class: value as QueryClass })}>
                            <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="keyword">keyword</SelectItem>
                              <SelectItem value="ai_visibility">ai_visibility</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm" onClick={() => void openTrend(row)}>View</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {!aiData?.items?.length && (
                      <TableRow>
                        <TableCell colSpan={8} className="text-muted-foreground">No AI rows in this range.</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="gsc" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">GSC (Pass A/B/C)</h2>
              <Badge variant="outline">Inspect hidden in V1</Badge>
            </div>
            <GscPassPanels passA={passA} passB={passB} passC={passC} filter={gscFilter} onFilterChange={setGscFilter} />
          </TabsContent>

          <TabsContent value="content-actions" className="space-y-4">
            <ContentActionsPanel />
          </TabsContent>

          <TabsContent value="jobs" className="space-y-4">
            <JobsPanel
              jobs={jobs}
              gscProgress={gscProgress}
              onRefresh={() => void loadJobs()}
              onCancel={async (jobId) => {
                await api.cancelJob(jobId)
                await loadJobs()
              }}
              onEnqueueGscSync={async (payload) => {
                setError(null)
                try {
                  const job = await api.enqueueGscSync(payload)
                  setActiveGscJobId(job.id)
                  setGscProgress(null)
                  await Promise.all([loadJobs(), loadHealthAndSummary()])
                  setActiveTab("jobs")
                  setNotice("GSC sync enqueued successfully.")
                } catch (err) {
                  setError(err instanceof Error ? err.message : "Failed to enqueue GSC sync")
                }
              }}
              onEnqueueSeranking={async (payload) => {
                await enqueueAndRefreshJobs(() => api.enqueueSeranking(payload))
              }}
              onEnqueuePrioritize={async (payload) => {
                await enqueueAndRefreshJobs(() => api.enqueuePrioritize(payload))
              }}
              onEnqueueSerp={async (payload) => {
                await enqueueAndRefreshJobs(() => api.enqueueSerpCheck(payload))
              }}
              onEnqueueAi={async (payload) => {
                await enqueueAndRefreshJobs(() => api.enqueueAiVisibility(payload))
              }}
              onEnqueueFullRefresh={async (payload) => {
                await enqueueAndRefreshJobs(() => api.enqueueFullRefresh(payload))
              }}
            />
          </TabsContent>
        </Tabs>
      </div>

      <TrendDialog open={trendOpen} onOpenChange={setTrendOpen} title={trendTitle} metric={trendMetric} data={trendData} />
    </main>
  )
}

function MiniMetric({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-md border p-3">
      <p className="text-xs text-muted-foreground">{title}</p>
      <p className="text-lg font-semibold">{value}</p>
    </div>
  )
}
