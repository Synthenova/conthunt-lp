CREATE TABLE blogs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    filename TEXT UNIQUE NOT NULL
, url TEXT);
CREATE TABLE sqlite_sequence(name,seq);
CREATE TABLE IF NOT EXISTS "queries" (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            query_text TEXT NOT NULL,
            source_type TEXT NOT NULL CHECK (source_type IN ('seed', 'gsc', 'manual', 'import')),
            is_active INTEGER NOT NULL DEFAULT 1 CHECK (is_active IN (0, 1)),
            seranking_status TEXT NOT NULL DEFAULT 'pending'
                CHECK (seranking_status IN ('pending', 'ready', 'failed')),
            priority_status TEXT NOT NULL DEFAULT 'pending'
                CHECK (priority_status IN ('pending', 'ready', 'failed')),
            first_seen_at TEXT NOT NULL DEFAULT (datetime('now')),
            last_seen_at TEXT NOT NULL DEFAULT (datetime('now')),
            created_at TEXT NOT NULL DEFAULT (datetime('now')),
            updated_at TEXT NOT NULL DEFAULT (datetime('now'))
        , query_class TEXT NOT NULL DEFAULT 'keyword');
CREATE TABLE jobs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    job_type TEXT NOT NULL CHECK (
        job_type IN (
            'gsc_sync',
            'seranking_enrich',
            'prioritize',
            'serp_check',
            'ai_visibility_check',
            'full_refresh'
        )
    ),
    status TEXT NOT NULL CHECK (status IN ('queued', 'running', 'succeeded', 'failed', 'cancelled')),
    target_key TEXT,
    payload_json TEXT,
    requested_by TEXT,
    requested_at TEXT NOT NULL DEFAULT (datetime('now')),
    started_at TEXT,
    finished_at TEXT,
    error_text TEXT
);
CREATE UNIQUE INDEX ux_jobs_running_target
    ON jobs(job_type, target_key)
    WHERE status = 'running' AND target_key IS NOT NULL;
CREATE INDEX ix_jobs_status_requested_at
    ON jobs(status, requested_at DESC);
CREATE TABLE script_runs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    job_id INTEGER NOT NULL,
    script_name TEXT NOT NULL CHECK (
        script_name IN (
            'gsc_fetch.py',
            'get_keyword_data.py',
            'prioritize_keywords.py',
            'check_rankings.py',
            'google_search_test.py'
        )
    ),
    status TEXT NOT NULL CHECK (status IN ('running', 'succeeded', 'failed')),
    run_key TEXT UNIQUE,
    args_json TEXT,
    exit_code INTEGER,
    output_json TEXT,
    error_text TEXT,
    started_at TEXT NOT NULL DEFAULT (datetime('now')),
    finished_at TEXT,
    FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE
);
CREATE INDEX ix_script_runs_job_id
    ON script_runs(job_id);
CREATE UNIQUE INDEX ux_queries_text_nocase
    ON queries(query_text COLLATE NOCASE);
CREATE INDEX ix_queries_source_type
    ON queries(source_type);
CREATE INDEX ix_queries_seranking_status
    ON queries(seranking_status);
CREATE TABLE query_seranking_current (
    query_id INTEGER PRIMARY KEY,
    volume INTEGER NOT NULL,
    cpc REAL NOT NULL,
    competition REAL NOT NULL,
    difficulty INTEGER NOT NULL,
    fetched_at TEXT NOT NULL DEFAULT (datetime('now')),
    source_run_id INTEGER,
    FOREIGN KEY (query_id) REFERENCES queries(id) ON DELETE CASCADE,
    FOREIGN KEY (source_run_id) REFERENCES script_runs(id) ON DELETE SET NULL
);
CREATE TABLE query_seranking_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    query_id INTEGER NOT NULL,
    volume INTEGER NOT NULL,
    cpc REAL NOT NULL,
    competition REAL NOT NULL,
    difficulty INTEGER NOT NULL,
    fetched_at TEXT NOT NULL DEFAULT (datetime('now')),
    source_run_id INTEGER,
    FOREIGN KEY (query_id) REFERENCES queries(id) ON DELETE CASCADE,
    FOREIGN KEY (source_run_id) REFERENCES script_runs(id) ON DELETE SET NULL
);
CREATE INDEX ix_seranking_hist_query_time
    ON query_seranking_history(query_id, fetched_at DESC);
CREATE TABLE query_priority_current (
    query_id INTEGER PRIMARY KEY,
    priority_score REAL NOT NULL,
    priority_reason TEXT NOT NULL,
    prioritized_at TEXT NOT NULL DEFAULT (datetime('now')),
    source_run_id INTEGER,
    FOREIGN KEY (query_id) REFERENCES queries(id) ON DELETE CASCADE,
    FOREIGN KEY (source_run_id) REFERENCES script_runs(id) ON DELETE SET NULL
);
CREATE TABLE query_priority_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    query_id INTEGER NOT NULL,
    priority_score REAL NOT NULL,
    priority_reason TEXT NOT NULL,
    prioritized_at TEXT NOT NULL DEFAULT (datetime('now')),
    source_run_id INTEGER,
    FOREIGN KEY (query_id) REFERENCES queries(id) ON DELETE CASCADE,
    FOREIGN KEY (source_run_id) REFERENCES script_runs(id) ON DELETE SET NULL
);
CREATE INDEX ix_priority_hist_query_time
    ON query_priority_history(query_id, prioritized_at DESC);
CREATE TABLE gsc_properties (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    site_url TEXT NOT NULL UNIQUE,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE gsc_runs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    job_id INTEGER NOT NULL,
    run_key TEXT UNIQUE,
    property_id INTEGER NOT NULL,
    pass_type TEXT NOT NULL CHECK (pass_type IN ('pass_a', 'pass_b', 'pass_c', 'inspect')),
    page_url TEXT,
    start_date TEXT NOT NULL,
    end_date TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('running', 'succeeded', 'failed')),
    started_at TEXT NOT NULL DEFAULT (datetime('now')),
    finished_at TEXT,
    error_text TEXT,
    FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
    FOREIGN KEY (property_id) REFERENCES gsc_properties(id) ON DELETE CASCADE
);
CREATE INDEX ix_gsc_runs_prop_time
    ON gsc_runs(property_id, started_at DESC);
CREATE TABLE gsc_query_metrics (
    gsc_run_id INTEGER NOT NULL,
    query_id INTEGER NOT NULL,
    clicks REAL NOT NULL,
    impressions REAL NOT NULL,
    ctr REAL NOT NULL,
    position REAL NOT NULL,
    PRIMARY KEY (gsc_run_id, query_id),
    FOREIGN KEY (gsc_run_id) REFERENCES gsc_runs(id) ON DELETE CASCADE,
    FOREIGN KEY (query_id) REFERENCES queries(id) ON DELETE CASCADE
);
CREATE INDEX ix_gsc_query_metrics_query_id
    ON gsc_query_metrics(query_id);
CREATE TABLE gsc_page_metrics (
    gsc_run_id INTEGER NOT NULL,
    page_url TEXT NOT NULL,
    clicks REAL NOT NULL,
    impressions REAL NOT NULL,
    ctr REAL NOT NULL,
    position REAL NOT NULL,
    PRIMARY KEY (gsc_run_id, page_url),
    FOREIGN KEY (gsc_run_id) REFERENCES gsc_runs(id) ON DELETE CASCADE
);
CREATE TABLE gsc_page_query_metrics (
    gsc_run_id INTEGER NOT NULL,
    page_url TEXT NOT NULL,
    query_id INTEGER NOT NULL,
    clicks REAL NOT NULL,
    impressions REAL NOT NULL,
    ctr REAL NOT NULL,
    position REAL NOT NULL,
    PRIMARY KEY (gsc_run_id, page_url, query_id),
    FOREIGN KEY (gsc_run_id) REFERENCES gsc_runs(id) ON DELETE CASCADE,
    FOREIGN KEY (query_id) REFERENCES queries(id) ON DELETE CASCADE
);
CREATE INDEX ix_gsc_pq_query_id
    ON gsc_page_query_metrics(query_id);
CREATE TABLE gsc_url_inspections (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    gsc_run_id INTEGER NOT NULL,
    page_url TEXT NOT NULL,
    status TEXT,
    coverage_state TEXT,
    robots_txt_state TEXT,
    indexing_state TEXT,
    last_crawl_time TEXT,
    raw_json TEXT,
    inspected_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (gsc_run_id) REFERENCES gsc_runs(id) ON DELETE CASCADE
);
CREATE INDEX ix_gsc_inspections_page_time
    ON gsc_url_inspections(page_url, inspected_at DESC);
CREATE TABLE serp_runs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    job_id INTEGER NOT NULL,
    run_key TEXT UNIQUE,
    domain TEXT NOT NULL,
    country TEXT NOT NULL DEFAULT 'US',
    limit_per_keyword INTEGER NOT NULL DEFAULT 30,
    status TEXT NOT NULL CHECK (status IN ('running', 'succeeded', 'failed')),
    started_at TEXT NOT NULL DEFAULT (datetime('now')),
    finished_at TEXT,
    error_text TEXT,
    FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE
);
CREATE TABLE serp_results (
    serp_run_id INTEGER NOT NULL,
    query_id INTEGER NOT NULL,
    rank INTEGER,
    url TEXT,
    is_found INTEGER NOT NULL CHECK (is_found IN (0, 1)),
    raw_json TEXT,
    PRIMARY KEY (serp_run_id, query_id),
    FOREIGN KEY (serp_run_id) REFERENCES serp_runs(id) ON DELETE CASCADE,
    FOREIGN KEY (query_id) REFERENCES queries(id) ON DELETE CASCADE
);
CREATE INDEX ix_serp_results_query_id
    ON serp_results(query_id);
CREATE TABLE ai_visibility_runs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    job_id INTEGER NOT NULL,
    run_key TEXT UNIQUE,
    domain TEXT NOT NULL,
    model TEXT NOT NULL DEFAULT 'google/gemini-3-flash-preview',
    concurrency INTEGER NOT NULL DEFAULT 50,
    status TEXT NOT NULL CHECK (status IN ('running', 'succeeded', 'failed')),
    started_at TEXT NOT NULL DEFAULT (datetime('now')),
    finished_at TEXT,
    error_text TEXT,
    FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE
);
CREATE TABLE ai_visibility_results (
    ai_run_id INTEGER NOT NULL,
    query_id INTEGER NOT NULL,
    is_visible INTEGER NOT NULL CHECK (is_visible IN (0, 1)),
    citation_urls_json TEXT,
    raw_json TEXT,
    PRIMARY KEY (ai_run_id, query_id),
    FOREIGN KEY (ai_run_id) REFERENCES ai_visibility_runs(id) ON DELETE CASCADE,
    FOREIGN KEY (query_id) REFERENCES queries(id) ON DELETE CASCADE
);
CREATE INDEX ix_ai_visibility_results_query_id
    ON ai_visibility_results(query_id);
CREATE INDEX ix_queries_query_class
    ON queries(query_class);
CREATE TABLE gsc_sync_tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    job_id INTEGER NOT NULL,
    property_id INTEGER NOT NULL,
    day TEXT NOT NULL,
    pass_type TEXT NOT NULL CHECK (pass_type IN ('pass_a', 'pass_b', 'pass_c', 'inspect')),
    page_url TEXT,
    fingerprint TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('queued', 'running', 'succeeded', 'failed', 'skipped_dedupe_24h', 'skipped_policy')),
    rows_written INTEGER NOT NULL DEFAULT 0,
    script_run_id INTEGER,
    error_text TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    started_at TEXT,
    finished_at TEXT,
    FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
    FOREIGN KEY (property_id) REFERENCES gsc_properties(id) ON DELETE CASCADE,
    FOREIGN KEY (script_run_id) REFERENCES script_runs(id) ON DELETE SET NULL
);
CREATE INDEX ix_gsc_sync_tasks_job_status
    ON gsc_sync_tasks(job_id, status);
CREATE INDEX ix_gsc_sync_tasks_property_day_pass
    ON gsc_sync_tasks(property_id, day, pass_type);
CREATE UNIQUE INDEX ux_gsc_sync_tasks_dedupe
    ON gsc_sync_tasks(job_id, day, pass_type, ifnull(page_url, ''), fingerprint);
CREATE TABLE gsc_api_call_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    fingerprint TEXT NOT NULL,
    job_id INTEGER,
    task_id INTEGER,
    status TEXT NOT NULL CHECK (status IN ('running', 'succeeded', 'failed', 'skipped_dedupe_24h')),
    called_at TEXT NOT NULL DEFAULT (datetime('now')),
    finished_at TEXT,
    FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE SET NULL,
    FOREIGN KEY (task_id) REFERENCES gsc_sync_tasks(id) ON DELETE SET NULL
);
CREATE INDEX ix_gsc_api_call_log_fingerprint_time
    ON gsc_api_call_log(fingerprint, called_at DESC);
CREATE TABLE gsc_known_pages (
    property_id INTEGER NOT NULL,
    page_url TEXT NOT NULL,
    first_seen_day TEXT NOT NULL,
    last_seen_day TEXT NOT NULL,
    PRIMARY KEY (property_id, page_url),
    FOREIGN KEY (property_id) REFERENCES gsc_properties(id) ON DELETE CASCADE
);
CREATE TABLE content_actions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    action_type TEXT NOT NULL CHECK (action_type IN ('create','refresh','consolidate','prune','investigate','ai_citation')),
    status TEXT NOT NULL DEFAULT 'proposed' CHECK (status IN ('proposed','approved','in_progress','done','rejected')),
    target_page_url TEXT,
    target_blog_id INTEGER,
    target_keyword TEXT,
    target_query_id INTEGER,
    supporting_keywords_json TEXT,
    merge_page_urls_json TEXT,
    brief_json TEXT NOT NULL,
    evidence_json TEXT NOT NULL,
    priority_score REAL DEFAULT 0,
    fingerprint TEXT NOT NULL UNIQUE,
    cooldown_until TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (target_blog_id) REFERENCES blogs(id) ON DELETE SET NULL,
    FOREIGN KEY (target_query_id) REFERENCES queries(id) ON DELETE SET NULL
);
CREATE INDEX ix_content_actions_status ON content_actions(status, priority_score DESC);
CREATE TABLE blog_query_links (blog_id INTEGER NOT NULL, query_id INTEGER NOT NULL, relevance_score INTEGER NOT NULL DEFAULT 0, PRIMARY KEY (blog_id, query_id), FOREIGN KEY (blog_id) REFERENCES blogs(id) ON DELETE CASCADE, FOREIGN KEY (query_id) REFERENCES queries(id) ON DELETE CASCADE);
