from __future__ import annotations

import time
import random
import os
from dataclasses import dataclass
from typing import Any, Dict, Iterable, List, Optional, Tuple

from google.oauth2.service_account import Credentials
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

# ---------------------------
# Auth + retry helpers
# ---------------------------

GSC_SCOPES = [
    # Full access (needed for some operations like sitemap submit)
    "https://www.googleapis.com/auth/webmasters",
    # If you want readonly only, replace with:
    # "https://www.googleapis.com/auth/webmasters.readonly",
]

def _sleep_backoff(attempt: int, base: float = 1.0, cap: float = 30.0) -> None:
    # Exponential backoff + jitter
    delay = min(cap, base * (2 ** attempt))
    delay = delay * (0.7 + random.random() * 0.6)
    time.sleep(delay)

def _call_with_retries(fn, *, max_retries: int = 6) -> Any:
    """
    Retries on rate limits / transient server errors.
    """
    for attempt in range(max_retries + 1):
        try:
            return fn()
        except HttpError as e:
            status = getattr(e.resp, "status", None)
            # Retry: 429, 500, 502, 503, 504
            if status in (429, 500, 502, 503, 504) and attempt < max_retries:
                _sleep_backoff(attempt)
                continue
            raise

@dataclass(frozen=True)
class SearchConsoleRawClient:
    """
    Thin wrapper around:
      - webmasters v3 endpoints (searchAnalytics, sitemaps, sites)
      - searchconsole v1 endpoint (urlInspection)
    """
    webmasters: Any
    searchconsole: Any

    @staticmethod
    def from_service_account_json(
        json_path: str,
        scopes: List[str] = GSC_SCOPES,
    ) -> "SearchConsoleRawClient":
        if not os.path.exists(json_path):
            raise FileNotFoundError(f"Service account file not found: {json_path}")
            
        creds = Credentials.from_service_account_file(json_path, scopes=scopes)

        # Search Analytics / Sites / Sitemaps are under "webmasters" v3
        webmasters = build("webmasters", "v3", credentials=creds, cache_discovery=False)

        # URL Inspection is under "searchconsole" v1
        searchconsole = build("searchconsole", "v1", credentials=creds, cache_discovery=False)

        return SearchConsoleRawClient(webmasters=webmasters, searchconsole=searchconsole)

    # ---------------------------
    # Sites API
    # ---------------------------

    def sites_list(self) -> Dict[str, Any]:
        """
        Lists properties the credential has access to.
        """
        return _call_with_retries(lambda: self.webmasters.sites().list().execute())

    def sites_get(self, site_url: str) -> Dict[str, Any]:
        """
        Get a specific property (permission level etc.).
        """
        return _call_with_retries(lambda: self.webmasters.sites().get(siteUrl=site_url).execute())

    # ---------------------------
    # Sitemaps API
    # ---------------------------

    def sitemaps_list(self, site_url: str, sitemap_index: Optional[str] = None) -> Dict[str, Any]:
        """
        GET /sites/{siteUrl}/sitemaps
        Optional query param: sitemapIndex
        """
        kwargs = {"siteUrl": site_url}
        if sitemap_index:
            kwargs["sitemapIndex"] = sitemap_index
        return _call_with_retries(lambda: self.webmasters.sitemaps().list(**kwargs).execute())

    def sitemaps_get(self, site_url: str, feedpath: str) -> Dict[str, Any]:
        """
        GET /sites/{siteUrl}/sitemaps/{feedpath}
        feedpath is the sitemap URL itself.
        """
        return _call_with_retries(
            lambda: self.webmasters.sitemaps().get(siteUrl=site_url, feedpath=feedpath).execute()
        )

    # ---------------------------
    # Search Analytics API (core)
    # ---------------------------

    def search_analytics_query(
        self,
        site_url: str,
        *,
        start_date: str,
        end_date: str,
        dimensions: Optional[List[str]] = None,
        type_: Optional[str] = None,
        # Search Console doc calls this dimensionFilterGroups (list of groups)
        dimension_filter_groups: Optional[List[Dict[str, Any]]] = None,
        aggregation_type: Optional[str] = None,
        row_limit: int = 1000,
        start_row: int = 0,
        data_state: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        POST /sites/{siteUrl}/searchAnalytics/query
        """
        body: Dict[str, Any] = {
            "startDate": start_date,
            "endDate": end_date,
            "rowLimit": int(row_limit),
            "startRow": int(start_row),
        }
        if dimensions is not None:
            body["dimensions"] = dimensions
        if type_ is not None:
            body["type"] = type_
        if dimension_filter_groups is not None:
            body["dimensionFilterGroups"] = dimension_filter_groups
        if aggregation_type is not None:
            body["aggregationType"] = aggregation_type
        if data_state is not None:
            body["dataState"] = data_state

        return _call_with_retries(
            lambda: self.webmasters.searchanalytics().query(siteUrl=site_url, body=body).execute()
        )

    def search_analytics_iter_all_rows(
        self,
        site_url: str,
        *,
        start_date: str,
        end_date: str,
        dimensions: Optional[List[str]] = None,
        type_: Optional[str] = None,
        dimension_filter_groups: Optional[List[Dict[str, Any]]] = None,
        aggregation_type: Optional[str] = None,
        data_state: Optional[str] = None,
        page_size: int = 25000,
        max_pages: Optional[int] = None,
    ) -> Iterable[Dict[str, Any]]:
        """
        Paginates using startRow + rowLimit until no rows returned.
        """
        start_row = 0
        pages = 0
        while True:
            resp = self.search_analytics_query(
                site_url,
                start_date=start_date,
                end_date=end_date,
                dimensions=dimensions,
                type_=type_,
                dimension_filter_groups=dimension_filter_groups,
                aggregation_type=aggregation_type,
                row_limit=page_size,
                start_row=start_row,
                data_state=data_state,
            )

            rows = resp.get("rows", []) or []
            for r in rows:
                yield r

            if not rows or len(rows) < page_size:
                break

            start_row += len(rows)
            pages += 1
            if max_pages is not None and pages >= max_pages:
                break

    # ---------------------------
    # URL Inspection API
    # ---------------------------

    def url_inspect(
        self,
        *,
        inspection_url: str,
        site_url: str,
        language_code: str = "en-US",
    ) -> Dict[str, Any]:
        """
        POST https://searchconsole.googleapis.com/v1/urlInspection/index:inspect
        Body: { inspectionUrl, siteUrl, languageCode? }
        """
        body = {
            "inspectionUrl": inspection_url,
            "siteUrl": site_url,
            "languageCode": language_code,
        }
        return _call_with_retries(
            lambda: self.searchconsole.urlInspection().index().inspect(body=body).execute()
        )

# ---------------------------
# Convenience: building filters
# ---------------------------

def make_filter_group_and(filters: List[Tuple[str, str, str]]) -> Dict[str, Any]:
    """
    Build a dimensionFilterGroup with groupType="and"
    filters: list of (dimension, operator, expression)
    """
    return {
        "groupType": "and",
        "filters": [
            {"dimension": dim, "operator": op, "expression": expr}
            for (dim, op, expr) in filters
        ],
    }
