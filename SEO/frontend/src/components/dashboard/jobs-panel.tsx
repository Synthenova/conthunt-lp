"use client"

import { useState } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { GscProgressResponse, Job } from "@/lib/types"
import { formatDate } from "@/lib/format"

interface JobsPanelProps {
  jobs: Job[]
  gscProgress: GscProgressResponse | null
  onRefresh: () => void
  onCancel: (jobId: number) => Promise<void>
  onEnqueueGscSync: (payload: {
    site_url: string
    window_days: 1 | 7 | 30 | 60
    pass_a: { mode: "top" | "all"; max_top_queries?: number }
    pass_c: { scope: "none" | "top_pages" | "all_pages" | "custom"; top_pages_limit?: number; custom_page_urls?: string[] }
    inspect: { enabled: boolean; inspect_max_urls?: number; custom_page_urls?: string[] }
  }) => Promise<void>
  onEnqueueSeranking: (payload: { batch_size?: number }) => Promise<void>
  onEnqueuePrioritize: (payload: { batch_size?: number }) => Promise<void>
  onEnqueueSerp: (payload: { domain: string }) => Promise<void>
  onEnqueueAi: (payload: { domain: string; concurrency?: number }) => Promise<void>
  onEnqueueFullRefresh: (payload: Record<string, unknown>) => Promise<void>
}

export function JobsPanel({
  jobs,
  gscProgress,
  onRefresh,
  onCancel,
  onEnqueueGscSync,
  onEnqueueSeranking,
  onEnqueuePrioritize,
  onEnqueueSerp,
  onEnqueueAi,
  onEnqueueFullRefresh,
}: JobsPanelProps) {
  const [gscSiteUrl, setGscSiteUrl] = useState("sc-domain:conthunt.app")
  const [gscWindowDays, setGscWindowDays] = useState<"1" | "7" | "30" | "60">("7")
  const [passAMode, setPassAMode] = useState<"top" | "all">("top")
  const [maxTopQueries, setMaxTopQueries] = useState("1000")
  const [passCScope, setPassCScope] = useState<"none" | "top_pages" | "all_pages" | "custom">("top_pages")
  const [topPagesLimit, setTopPagesLimit] = useState("100")
  const [passCCustomUrls, setPassCCustomUrls] = useState("")
  const [inspectEnabled, setInspectEnabled] = useState(true)
  const [inspectMaxUrls, setInspectMaxUrls] = useState("200")
  const [inspectCustomUrls, setInspectCustomUrls] = useState("")
  const [serpDomain, setSerpDomain] = useState("")
  const [aiDomain, setAiDomain] = useState("")
  const [aiConcurrency, setAiConcurrency] = useState("20")
  const [batchSize, setBatchSize] = useState("200")

  const totalTasks = gscProgress?.summary.total_tasks ?? 0
  const doneTasks =
    (gscProgress?.summary.succeeded_tasks ?? 0) +
    (gscProgress?.summary.failed_tasks ?? 0) +
    (gscProgress?.summary.skipped_tasks ?? 0)
  const percentDone = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0

  const parseUrlList = (value: string) =>
    value
      .split(/[\n,]/)
      .map((item) => item.trim())
      .filter(Boolean)

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Trigger Jobs</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-3 rounded-md border p-4">
            <div className="space-y-1">
              <p className="text-sm font-semibold">1. GSC Daily Sync</p>
              <p className="text-xs text-muted-foreground">
                Fetches daily GSC data (pass-a, pass-b, pass-c, inspect) with dedupe and progress tracking.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3 lg:grid-cols-4">
              <div className="space-y-1">
                <Label>Search Console Property</Label>
                <Input placeholder="sc-domain:conthunt.app" value={gscSiteUrl} onChange={(e) => setGscSiteUrl(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label>Window</Label>
                <Select value={gscWindowDays} onValueChange={(value) => setGscWindowDays(value as "1" | "7" | "30" | "60")}>
                  <SelectTrigger>
                    <SelectValue placeholder="window_days" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Last 1 day</SelectItem>
                    <SelectItem value="7">Last 7 days</SelectItem>
                    <SelectItem value="30">Last 30 days</SelectItem>
                    <SelectItem value="60">Last 60 days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Pass-A Query Mode</Label>
                <Select value={passAMode} onValueChange={(value) => setPassAMode(value as "top" | "all")}>
                  <SelectTrigger>
                    <SelectValue placeholder="pass_a.mode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="top">Top queries only</SelectItem>
                    <SelectItem value="all">All queries</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Run</Label>
                <Button
                  className="w-full"
                  onClick={() =>
                    void onEnqueueGscSync({
                      site_url: gscSiteUrl.trim(),
                      window_days: Number(gscWindowDays) as 1 | 7 | 30 | 60,
                      pass_a: {
                        mode: passAMode,
                        max_top_queries: passAMode === "top" ? Number(maxTopQueries) || 1000 : undefined,
                      },
                      pass_c: {
                        scope: passCScope,
                        top_pages_limit: passCScope === "top_pages" ? Number(topPagesLimit) || 100 : undefined,
                        custom_page_urls: passCScope === "custom" ? parseUrlList(passCCustomUrls) : undefined,
                      },
                      inspect: {
                        enabled: inspectEnabled,
                        inspect_max_urls: inspectEnabled ? Number(inspectMaxUrls) || 200 : undefined,
                        custom_page_urls: inspectEnabled ? parseUrlList(inspectCustomUrls) : undefined,
                      },
                    })
                  }
                >
                  Enqueue GSC Sync
                </Button>
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-1 gap-3 lg:grid-cols-4">
              <div className="space-y-1">
                <Label>Max Top Queries</Label>
                <Input
                  placeholder="1000"
                  value={maxTopQueries}
                  disabled={passAMode !== "top"}
                  onChange={(e) => setMaxTopQueries(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label>Pass-C Scope</Label>
                <Select value={passCScope} onValueChange={(value) => setPassCScope(value as "none" | "top_pages" | "all_pages" | "custom")}>
                  <SelectTrigger>
                    <SelectValue placeholder="pass_c.scope" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Skip pass-c</SelectItem>
                    <SelectItem value="top_pages">Top pages from pass-b</SelectItem>
                    <SelectItem value="all_pages">All pages from pass-b</SelectItem>
                    <SelectItem value="custom">Custom page URLs</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Top Pages Limit</Label>
                <Input
                  placeholder="100"
                  value={topPagesLimit}
                  disabled={passCScope !== "top_pages"}
                  onChange={(e) => setTopPagesLimit(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label>Pass-C Custom URLs</Label>
                <Input
                  placeholder="https://site/page-a, https://site/page-b"
                  value={passCCustomUrls}
                  disabled={passCScope !== "custom"}
                  onChange={(e) => setPassCCustomUrls(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 lg:grid-cols-4">
              <div className="flex items-center gap-2 rounded-md border px-3 pt-6">
                <Switch checked={inspectEnabled} onCheckedChange={setInspectEnabled} />
                <Label>Enable Inspect</Label>
              </div>
              <div className="space-y-1">
                <Label>Inspect Max URLs</Label>
                <Input
                  placeholder="200"
                  value={inspectMaxUrls}
                  disabled={!inspectEnabled}
                  onChange={(e) => setInspectMaxUrls(e.target.value)}
                />
              </div>
              <div className="space-y-1 lg:col-span-2">
                <Label>Inspect Custom URLs</Label>
                <Input
                  placeholder="Optional custom URLs (comma separated)"
                  value={inspectCustomUrls}
                  disabled={!inspectEnabled}
                  onChange={(e) => setInspectCustomUrls(e.target.value)}
                />
              </div>
            </div>
          </div>

          {gscProgress && (
            <div className="grid gap-2 rounded-md border p-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">GSC Progress: Job #{gscProgress.job.id}</p>
                <Badge variant={gscProgress.job.status === "failed" ? "destructive" : "secondary"}>
                  {gscProgress.job.status}
                </Badge>
              </div>
              <div className="h-2 w-full overflow-hidden rounded bg-muted">
                <div className="h-full bg-primary transition-all" style={{ width: `${percentDone}%` }} />
              </div>
              <p className="text-xs text-muted-foreground">
                {doneTasks}/{totalTasks} complete ({percentDone}%) · running {gscProgress.summary.running_tasks} · failed{" "}
                {gscProgress.summary.failed_tasks} · skipped {gscProgress.summary.skipped_tasks}
              </p>
              {gscProgress.current_task && (
                <p className="text-xs text-muted-foreground">
                  Running: {gscProgress.current_task.day} · {gscProgress.current_task.pass_type} ·{" "}
                  {gscProgress.current_task.page_url ?? "-"}
                </p>
              )}
              <div className="max-h-56 overflow-auto rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Day</TableHead>
                      <TableHead>Pass</TableHead>
                      <TableHead>Page</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Rows</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {gscProgress.tasks.map((task) => (
                      <TableRow key={task.id}>
                        <TableCell>{task.day}</TableCell>
                        <TableCell>{task.pass_type}</TableCell>
                        <TableCell className="max-w-[300px] truncate">{task.page_url ?? "-"}</TableCell>
                        <TableCell>{task.status}</TableCell>
                        <TableCell>{task.rows_written}</TableCell>
                      </TableRow>
                    ))}
                    {!gscProgress.tasks.length && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-muted-foreground">
                          No task rows yet.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
            <div className="space-y-3 rounded-md border p-4">
              <div className="space-y-1">
                <p className="text-sm font-semibold">2. SERP Rank Check (Keyword Queries)</p>
                <p className="text-xs text-muted-foreground">Runs Google rank checks for normal keyword queries.</p>
              </div>
              <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
                <div className="space-y-1">
                  <Label>Domain</Label>
                  <Input placeholder="conthunt.app" value={serpDomain} onChange={(e) => setSerpDomain(e.target.value)} />
                </div>
                <div className="space-y-1">
                  <Label>Run</Label>
                  <Button className="w-full" onClick={() => void onEnqueueSerp({ domain: serpDomain })}>Enqueue SERP Check</Button>
                </div>
              </div>
            </div>

            <div className="space-y-3 rounded-md border p-4">
              <div className="space-y-1">
                <p className="text-sm font-semibold">3. AI Visibility Check (AI Queries)</p>
                <p className="text-xs text-muted-foreground">Runs AI search visibility checks for AI visibility queries.</p>
              </div>
              <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
                <div className="space-y-1">
                  <Label>Domain</Label>
                  <Input placeholder="conthunt.app" value={aiDomain} onChange={(e) => setAiDomain(e.target.value)} />
                </div>
                <div className="space-y-1">
                  <Label>Concurrency</Label>
                  <Input placeholder="20" value={aiConcurrency} onChange={(e) => setAiConcurrency(e.target.value)} />
                </div>
                <div className="space-y-1">
                  <Label>Run</Label>
                  <Button className="w-full" onClick={() => void onEnqueueAi({ domain: aiDomain, concurrency: Number(aiConcurrency) || 20 })}>Enqueue AI Check</Button>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3 rounded-md border p-4">
            <div className="space-y-1">
              <p className="text-sm font-semibold">4. Keyword Data Pipeline</p>
              <p className="text-xs text-muted-foreground">
                Enrich = pull SERanking metrics. Prioritize = compute priority scores. Full refresh runs both.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-3 lg:grid-cols-4">
              <div className="space-y-1">
                <Label>Batch Size</Label>
                <Input placeholder="200" value={batchSize} onChange={(e) => setBatchSize(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label>Enrich</Label>
                <Button className="w-full" variant="outline" onClick={() => void onEnqueueSeranking({ batch_size: Number(batchSize) || 200 })}>Enqueue Enrich</Button>
              </div>
              <div className="space-y-1">
                <Label>Prioritize</Label>
                <Button className="w-full" variant="outline" onClick={() => void onEnqueuePrioritize({ batch_size: Number(batchSize) || 200 })}>Enqueue Prioritize</Button>
              </div>
              <div className="space-y-1">
                <Label>Full Refresh</Label>
                <Button className="w-full" variant="secondary" onClick={() => void onEnqueueFullRefresh({ seranking: true, prioritize: true })}>Enqueue Full Refresh</Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Jobs</CardTitle>
          <div className="flex items-center gap-2">
            <Select defaultValue="all">
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="All status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All status</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" onClick={onRefresh}>Refresh</Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Requested</TableHead>
                <TableHead>Finished</TableHead>
                <TableHead>Error</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {jobs.map((job) => (
                <TableRow key={job.id}>
                  <TableCell>{job.id}</TableCell>
                  <TableCell>{job.job_type}</TableCell>
                  <TableCell>
                    <Badge variant={job.status === "failed" ? "destructive" : job.status === "succeeded" ? "default" : "secondary"}>{job.status}</Badge>
                  </TableCell>
                  <TableCell>{formatDate(job.requested_at)}</TableCell>
                  <TableCell>{formatDate(job.finished_at)}</TableCell>
                  <TableCell className="max-w-[260px] truncate">{job.error_text ?? "-"}</TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={job.status !== "queued"}
                      onClick={() => void onCancel(job.id)}
                    >
                      Cancel
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {!jobs.length && (
                <TableRow>
                  <TableCell colSpan={7} className="text-muted-foreground">No jobs yet.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
