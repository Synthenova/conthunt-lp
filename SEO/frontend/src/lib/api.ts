import {
  AiLatestResponse,
  AiAnalyticsResponse,
  GscLatestResponse,
  GscPassARow,
  GscPassBRow,
  GscPassCRow,
  GscPassResponse,
  GscProgressResponse,
  HealthResponse,
  JobDetailResponse,
  JobListResponse,
  KeywordAnalyticsResponse,
  MetaSummary,
  OverviewResponse,
  QueryClass,
  QueryListResponse,
  QueryRow,
  TimeRangeState,
  SerpLatestResponse,
  TrendResponse,
  ContentActionListResponse,
} from "@/lib/types"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8010"

async function request<T>(
  path: string,
  init?: RequestInit,
  signal?: AbortSignal
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
    signal,
  })

  if (!response.ok) {
    let detail = response.statusText
    try {
      const body = (await response.json()) as { detail?: string }
      detail = body.detail ?? detail
    } catch {
      // no-op
    }
    throw new Error(`${response.status} ${detail}`)
  }

  return (await response.json()) as T
}

export const api = {
  health: (signal?: AbortSignal) => request<HealthResponse>("/api/health", undefined, signal),
  metaSummary: (signal?: AbortSignal) => request<MetaSummary>("/api/meta/summary", undefined, signal),
  listQueries: (
    queryClass: QueryClass,
    opts?: { search?: string; sourceType?: string; isActive?: number; limit?: number; offset?: number },
    signal?: AbortSignal
  ) => {
    const params = new URLSearchParams({
      query_class: queryClass,
      limit: String(opts?.limit ?? 200),
      offset: String(opts?.offset ?? 0),
    })
    if (opts?.search) params.set("search", opts.search)
    if (opts?.sourceType) params.set("source_type", opts.sourceType)
    if (opts?.isActive !== undefined) params.set("is_active", String(opts.isActive))
    return request<QueryListResponse>(`/api/queries?${params.toString()}`, undefined, signal)
  },
  patchQuery: (queryId: number, payload: Partial<Pick<QueryRow, "is_active" | "query_class">>) =>
    request<QueryRow>(`/api/queries/${queryId}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),
  latestSerp: (signal?: AbortSignal) => request<SerpLatestResponse>("/api/results/serp/latest", undefined, signal),
  latestAi: (signal?: AbortSignal) => request<AiLatestResponse>("/api/results/ai/latest", undefined, signal),
  latestGsc: (signal?: AbortSignal) => request<GscLatestResponse>("/api/results/gsc/latest", undefined, signal),
  serpTrend: (queryId: number, signal?: AbortSignal) =>
    request<TrendResponse>(`/api/charts/serp/rank-trend?query_id=${queryId}`, undefined, signal),
  aiTrend: (queryId: number, signal?: AbortSignal) =>
    request<TrendResponse>(`/api/charts/ai/visibility-trend?query_id=${queryId}`, undefined, signal),
  gscTrend: (queryId: number, signal?: AbortSignal) =>
    request<TrendResponse>(`/api/charts/gsc/query-trend?query_id=${queryId}`, undefined, signal),
  listJobs: (opts?: { status?: string; jobType?: string; limit?: number; offset?: number }, signal?: AbortSignal) => {
    const params = new URLSearchParams({
      limit: String(opts?.limit ?? 100),
      offset: String(opts?.offset ?? 0),
    })
    if (opts?.status) params.set("status", opts.status)
    if (opts?.jobType) params.set("job_type", opts.jobType)
    return request<JobListResponse>(`/api/jobs?${params.toString()}`, undefined, signal)
  },
  getJob: (jobId: number, signal?: AbortSignal) => request<JobDetailResponse>(`/api/jobs/${jobId}`, undefined, signal),
  getGscProgress: (jobId: number, signal?: AbortSignal) =>
    request<GscProgressResponse>(`/api/jobs/${jobId}/gsc-progress`, undefined, signal),
  cancelJob: (jobId: number) => request<{ job_id: number; status: string }>(`/api/jobs/${jobId}/cancel`, { method: "POST" }),
  enqueueGscSync: (payload: {
    site_url: string
    window_days: 1 | 7 | 30 | 60
    pass_a?: { mode: "top" | "all"; max_top_queries?: number }
    pass_c?: { scope: "none" | "top_pages" | "all_pages" | "custom"; top_pages_limit?: number; custom_page_urls?: string[] }
    inspect?: { enabled: boolean; inspect_max_urls?: number; custom_page_urls?: string[] }
    auth_json?: string
    requested_by?: string
  }) => request<{ id: number; status: string }>("/api/jobs/gsc-sync", { method: "POST", body: JSON.stringify(payload) }),
  enqueueSeranking: (payload: { query_ids?: number[]; batch_size?: number; requested_by?: string }) =>
    request<{ id: number; status: string }>("/api/jobs/seranking-enrich", { method: "POST", body: JSON.stringify(payload) }),
  enqueuePrioritize: (payload: { query_ids?: number[]; batch_size?: number; requested_by?: string }) =>
    request<{ id: number; status: string }>("/api/jobs/prioritize", { method: "POST", body: JSON.stringify(payload) }),
  enqueueSerpCheck: (payload: { domain: string; query_ids?: number[]; batch_size?: number; requested_by?: string }) =>
    request<{ id: number; status: string }>("/api/jobs/serp-check", { method: "POST", body: JSON.stringify(payload) }),
  enqueueAiVisibility: (payload: { domain: string; query_ids?: number[]; batch_size?: number; concurrency?: number; requested_by?: string }) =>
    request<{ id: number; status: string }>("/api/jobs/ai-visibility-check", { method: "POST", body: JSON.stringify(payload) }),
  enqueueFullRefresh: (payload: Record<string, unknown>) =>
    request<{ id: number; status: string }>("/api/jobs/full-refresh", { method: "POST", body: JSON.stringify(payload) }),
  dashboardOverview: (range: TimeRangeState, signal?: AbortSignal) =>
    request<OverviewResponse>(
      `/api/dashboard/overview?from_day_ago=${range.from_day_ago}&to_day_ago=${range.to_day_ago}`,
      undefined,
      signal
    ),
  keywordAnalytics: (
    params: {
      range: TimeRangeState
      search?: string
      sourceType?: string
      isActive?: number
      serankingStatus?: string
      hasGscData?: number
      volumeMin?: number
      volumeMax?: number
      difficultyMin?: number
      difficultyMax?: number
      priorityMin?: number
      priorityMax?: number
      sortBy?: string
      sortDir?: "asc" | "desc"
      limit?: number
      offset?: number
    },
    signal?: AbortSignal
  ) => {
    const q = new URLSearchParams({
      from_day_ago: String(params.range.from_day_ago),
      to_day_ago: String(params.range.to_day_ago),
      sort_by: params.sortBy ?? "priority_score",
      sort_dir: params.sortDir ?? "desc",
      limit: String(params.limit ?? 100),
      offset: String(params.offset ?? 0),
    })
    if (params.search) q.set("search", params.search)
    if (params.sourceType) q.set("source_type", params.sourceType)
    if (params.isActive !== undefined) q.set("is_active", String(params.isActive))
    if (params.serankingStatus) q.set("seranking_status", params.serankingStatus)
    if (params.hasGscData !== undefined) q.set("has_gsc_data", String(params.hasGscData))
    if (params.volumeMin !== undefined) q.set("volume_min", String(params.volumeMin))
    if (params.volumeMax !== undefined) q.set("volume_max", String(params.volumeMax))
    if (params.difficultyMin !== undefined) q.set("difficulty_min", String(params.difficultyMin))
    if (params.difficultyMax !== undefined) q.set("difficulty_max", String(params.difficultyMax))
    if (params.priorityMin !== undefined) q.set("priority_min", String(params.priorityMin))
    if (params.priorityMax !== undefined) q.set("priority_max", String(params.priorityMax))
    return request<KeywordAnalyticsResponse>(`/api/queries/keyword-analytics?${q.toString()}`, undefined, signal)
  },
  aiAnalytics: (
    params: {
      range: TimeRangeState
      search?: string
      sourceType?: string
      isActive?: number
      visibilityState?: "all" | "visible" | "not_visible"
      volumeMin?: number
      volumeMax?: number
      priorityMin?: number
      priorityMax?: number
      sortBy?: string
      sortDir?: "asc" | "desc"
      limit?: number
      offset?: number
    },
    signal?: AbortSignal
  ) => {
    const q = new URLSearchParams({
      from_day_ago: String(params.range.from_day_ago),
      to_day_ago: String(params.range.to_day_ago),
      visibility_state: params.visibilityState ?? "all",
      sort_by: params.sortBy ?? "visibility_rate",
      sort_dir: params.sortDir ?? "desc",
      limit: String(params.limit ?? 100),
      offset: String(params.offset ?? 0),
    })
    if (params.search) q.set("search", params.search)
    if (params.sourceType) q.set("source_type", params.sourceType)
    if (params.isActive !== undefined) q.set("is_active", String(params.isActive))
    if (params.volumeMin !== undefined) q.set("volume_min", String(params.volumeMin))
    if (params.volumeMax !== undefined) q.set("volume_max", String(params.volumeMax))
    if (params.priorityMin !== undefined) q.set("priority_min", String(params.priorityMin))
    if (params.priorityMax !== undefined) q.set("priority_max", String(params.priorityMax))
    return request<AiAnalyticsResponse>(`/api/queries/ai-analytics?${q.toString()}`, undefined, signal)
  },
  gscPassA: (
    params: { range: TimeRangeState; search?: string; sortBy?: string; sortDir?: "asc" | "desc"; limit?: number; offset?: number },
    signal?: AbortSignal
  ) => {
    const q = new URLSearchParams({
      from_day_ago: String(params.range.from_day_ago),
      to_day_ago: String(params.range.to_day_ago),
      sort_by: params.sortBy ?? "impressions",
      sort_dir: params.sortDir ?? "desc",
      limit: String(params.limit ?? 100),
      offset: String(params.offset ?? 0),
    })
    if (params.search) q.set("search", params.search)
    return request<GscPassResponse<GscPassARow>>(`/api/gsc/pass-a?${q.toString()}`, undefined, signal)
  },
  gscPassB: (
    params: { range: TimeRangeState; search?: string; sortBy?: string; sortDir?: "asc" | "desc"; limit?: number; offset?: number },
    signal?: AbortSignal
  ) => {
    const q = new URLSearchParams({
      from_day_ago: String(params.range.from_day_ago),
      to_day_ago: String(params.range.to_day_ago),
      sort_by: params.sortBy ?? "impressions",
      sort_dir: params.sortDir ?? "desc",
      limit: String(params.limit ?? 100),
      offset: String(params.offset ?? 0),
    })
    if (params.search) q.set("search", params.search)
    return request<GscPassResponse<GscPassBRow>>(`/api/gsc/pass-b?${q.toString()}`, undefined, signal)
  },
  gscPassC: (
    params: { range: TimeRangeState; search?: string; sortBy?: string; sortDir?: "asc" | "desc"; limit?: number; offset?: number },
    signal?: AbortSignal
  ) => {
    const q = new URLSearchParams({
      from_day_ago: String(params.range.from_day_ago),
      to_day_ago: String(params.range.to_day_ago),
      sort_by: params.sortBy ?? "impressions",
      sort_dir: params.sortDir ?? "desc",
      limit: String(params.limit ?? 100),
      offset: String(params.offset ?? 0),
    })
    if (params.search) q.set("search", params.search)
    return request<GscPassResponse<GscPassCRow>>(`/api/gsc/pass-c?${q.toString()}`, undefined, signal)
  },
  listContentActions: (
    opts?: { status?: string; actionType?: string; limit?: number; offset?: number },
    signal?: AbortSignal
  ) => {
    const params = new URLSearchParams({
      limit: String(opts?.limit ?? 100),
      offset: String(opts?.offset ?? 0),
    })
    if (opts?.status) params.set("status", opts.status)
    if (opts?.actionType) params.set("action_type", opts.actionType)
    return request<ContentActionListResponse>(`/api/content-actions?${params.toString()}`, undefined, signal)
  },
}
