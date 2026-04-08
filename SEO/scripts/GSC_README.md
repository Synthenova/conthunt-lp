# GSC Helper Scripts Documentation

This directory contains standalone scripts for fetching data from the Google Search Console (GSC) API.

## `gsc_fetch.py`

A command-line tool to fetch data using the "3-pass" strategy + URL inspection.

### Usage

```bash
python3 autoseo/scripts/gsc_fetch.py [command] [options]
```

### Authentication
Requires a service account JSON file. Default path: `../../service_account_credentials.json`.
Override with `--auth-json /path/to/creds.json`.

### Commands & Input/Output

#### 1. `pass-a` (Property-level Query Facts)
Fetches aggregated query metrics for the entire property.

**Input:**
- `--site-url`: GSC property (e.g., `sc-domain:example.com`)
- `--start-date`: YYYY-MM-DD
- `--end-date`: YYYY-MM-DD
- `--limit`: Max rows (default 1000)

**Output (JSON):**
```json
{
  "rows": [
    {
      "keys": ["query_term"],
      "clicks": 150,
      "impressions": 2000,
      "ctr": 0.075,
      "position": 4.2
    }
    // ...
  ]
}
```

#### 2. `pass-b` (Property-level Page Facts)
Fetches aggregated metrics per page.

**Input:**
- Same as Pass A.

**Output (JSON):**
```json
{
  "rows": [
    {
      "keys": ["https://example.com/page-1"],
      "clicks": 50,
      "impressions": 500,
      "ctr": 0.1,
      "position": 8.5
    }
  ]
}
```

#### 3. `pass-c` (Page-scoped Query Facts)
Fetches queries *specific to a single URL*. Essential for mapping "which query belongs to which page".

**Input:**
- `--page-url`: The specific page URL to filter by.
- Other args same as Pass A.

**Output (JSON):**
```json
{
  "rows": [
    {
      "keys": ["specific query for this page"],
      "clicks": 10,
      "impressions": 100,
      "ctr": 0.1,
      "position": 3.0
    }
  ]
}
```

#### 4. `inspect` (URL Inspection)
Checks live index status of a URL.

**Input:**
- `--page-url`: The URL to inspect.
- `--site-url`: The property it belongs to.

**Output (JSON):**
```json
{
  "inspectionResult": {
    "indexStatusResult": {
      "status": "PASS",
      "coverageState": "Indexed, not submitted in sitemap",
      "robotsTxtState": "ALLOWED",
      "indexingState": "INDEXING_ALLOWED",
      "lastCrawlTime": "2023-10-27T10:00:00Z"
    }
  }
}
```

### Automation / Batching
The scripts are designed to be called by a parent process (backend or cron).
- **Idempotency**: Output is pure JSON; the caller is responsible for storage/deduplication.
- **Error Handling**: Non-zero exit code on API failure; stderr contains error details.
