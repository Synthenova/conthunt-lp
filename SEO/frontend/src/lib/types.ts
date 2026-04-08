export type QueryClass = "keyword" | "ai_visibility"
export type SortDirection = "asc" | "desc"

export interface TimeRangeState {
  from_day_ago: number
  to_day_ago: number
}

export interface HealthResponse {
  status: "ok" | string
}

export interface MetaSummary {
  total_queries: number
  keyword_queries: number
  ai_queries: number
  queued_jobs: number
  running_jobs: number
}

export interface QueryRow {
  id: number
  query_text: string
  query_class: QueryClass
  source_type: "seed" | "gsc" | "manual" | "import"
  is_active: 0 | 1
  seranking_status: "pending" | "ready" | "failed"
  priority_status: "pending" | "ready" | "failed"
  volume: number | null
  cpc: number | null
  competition: number | null
  difficulty: number | null
  priority_score: number | null
  priority_reason: string | null
}

export interface QueryListResponse {
  items: QueryRow[]
  limit: number
  offset: number
}

export interface TrendPoint {
  started_at: string
  rank?: number | null
  is_visible?: 0 | 1
  clicks?: number
  impressions?: number
  ctr?: number
  position?: number
  start_date?: string
  end_date?: string
}

export interface TrendResponse {
  query_id: number
  points: TrendPoint[]
}

export interface Job {
  id: number
  job_type: string
  status: "queued" | "running" | "succeeded" | "failed" | "cancelled"
  target_key: string | null
  payload_json: string | null
  requested_by: string | null
  requested_at: string
  started_at: string | null
  finished_at: string | null
  error_text: string | null
}

export interface JobListResponse {
  items: Job[]
  limit: number
  offset: number
}

export interface JobDetailResponse {
  job: Job
  script_runs: Array<{
    id: number
    script_name: string
    status: "running" | "succeeded" | "failed"
    args_json: string | null
    exit_code: number | null
    output_json: string | null
    error_text: string | null
    started_at: string
    finished_at: string | null
  }>
}

export interface GscSyncTask {
  id: number
  job_id: number
  property_id: number
  day: string
  pass_type: "pass_a" | "pass_b" | "pass_c" | "inspect"
  page_url: string | null
  fingerprint: string
  status: "queued" | "running" | "succeeded" | "failed" | "skipped_dedupe_24h" | "skipped_policy"
  rows_written: number
  script_run_id: number | null
  error_text: string | null
  created_at: string
  started_at: string | null
  finished_at: string | null
}

export interface GscProgressResponse {
  job: Job
  summary: {
    total_tasks: number
    queued_tasks: number
    running_tasks: number
    succeeded_tasks: number
    failed_tasks: number
    skipped_tasks: number
  }
  current_task: GscSyncTask | null
  tasks: GscSyncTask[]
}

export interface OverviewResponse {
  range: TimeRangeState
  kpis: {
    total_impressions: number
    total_clicks: number
    ctr: number
    avg_position: number
    ai_visibility_rate: number
    tracked_keywords: number
    gainers: number
    losers: number
  }
  charts: {
    gsc_daily: Array<{ day: string; impressions: number; clicks: number; avg_position: number }>
    ai_daily: Array<{ day: string; visibility_rate: number; total_checks: number }>
    rank_buckets: {
      top_3: number
      top_10: number
      beyond_10: number
      not_found: number
    }
  }
  insights: {
    top_gainers: Array<{ query_id: number; query_text: string; first_rank: number; last_rank: number; delta: number }>
    top_losers: Array<{ query_id: number; query_text: string; first_rank: number; last_rank: number; delta: number }>
    opportunities: Array<{ query_id: number; query_text: string; impressions: number; clicks: number; rank: number | null }>
  }
}

export interface KeywordAnalyticsRow extends QueryRow {
  updated_at: string
  impressions: number
  clicks: number
  avg_position: number
  serp_rank: number | null
}

export interface KeywordAnalyticsResponse {
  items: KeywordAnalyticsRow[]
  total: number
  limit: number
  offset: number
  chart_summary: {
    top_3: number
    top_10: number
    beyond_10: number
    not_found: number
  }
}

export interface AiAnalyticsRow {
  id: number
  query_text: string
  query_class: QueryClass
  source_type: "seed" | "gsc" | "manual" | "import"
  is_active: 0 | 1
  updated_at: string
  volume: number | null
  priority_score: number | null
  priority_reason: string | null
  visibility_rate: number
  checks: number
}

export interface AiAnalyticsResponse {
  items: AiAnalyticsRow[]
  total: number
  limit: number
  offset: number
  chart_daily: Array<{ day: string; visibility_rate: number; total_checks: number }>
}

export interface GscPassSummary {
  rows_count: number
  impressions: number
  clicks: number
  ctr: number
  position: number
}

export interface GscPassResponse<T> {
  pass_type: "pass_a" | "pass_b" | "pass_c"
  items: T[]
  total: number
  limit: number
  offset: number
  summary: GscPassSummary
  trend: Array<{ day: string; impressions: number; clicks: number; position: number }>
}

export interface GscPassARow {
  query_id: number
  query_text: string
  impressions: number
  clicks: number
  ctr: number
  position: number
}

export interface GscPassBRow {
  page_url: string
  impressions: number
  clicks: number
  ctr: number
  position: number
}

export interface GscPassCRow {
  page_url: string
  query_id: number
  query_text: string
  impressions: number
  clicks: number
  ctr: number
  position: number
}

export interface SerpLatestResponse {
  run: { id: number; domain: string; started_at: string } | null
  items: Array<{
    query_id: number
    query_text: string
    rank: number | null
    url: string | null
    is_found: 0 | 1
  }>
}

export interface AiLatestResponse {
  run: { id: number; domain: string; started_at: string } | null
  items: Array<{
    query_id: number
    query_text: string
    is_visible: 0 | 1
    citation_urls: string[]
  }>
}

export interface GscPassData<T> {
  run: {
    id: number
    property_id: number
    site_url: string
    pass_type: "pass_a" | "pass_b" | "pass_c" | "inspect"
    page_url: string | null
    start_date: string
    end_date: string
    started_at: string
  } | null
  items: T[]
}

export interface GscLatestResponse {
  pass_a: GscPassData<{
    query_id: number
    query_text: string
    clicks: number
    impressions: number
    ctr: number
    position: number
  }>
  pass_b: GscPassData<{
    page_url: string
    clicks: number
    impressions: number
    ctr: number
    position: number
  }>
  pass_c: GscPassData<{
    page_url: string
    query_id: number
    query_text: string
    clicks: number
    impressions: number
    ctr: number
    position: number
  }>
  inspect: GscPassData<{
    page_url: string
    status: string | null
    coverage_state: string | null
    robots_txt_state: string | null
    indexing_state: string | null
    last_crawl_time: string | null
    inspected_at: string
  }>
}

export interface ContentAction {
  id: number
  action_type: "create" | "refresh" | "consolidate" | "prune" | "investigate" | "ai_citation"
  status: "proposed" | "approved" | "rejected" | "done" | "failed"
  target_page_url: string | null
  target_keyword: string | null
  target_blog_id: number | null
  target_query_id: number | null
  priority_score: number
  created_at: string
  brief_json: string
  evidence_json: string
  fingerprint: string
}

export interface ContentActionListResponse {
  items: ContentAction[]
  total: number
  limit: number
  offset: number
}
