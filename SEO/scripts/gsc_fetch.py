#!/usr/bin/env python3
"""
GSC Data Fetcher

Usage:
    python3 gsc_fetch.py [command] [options]

Commands:
    pass-a      Fetch property-level query data
    pass-b      Fetch property-level page data
    pass-c      Fetch page-scoped query data (requires --page-url)
    inspect     Inspect a specific URL

Options:
    --site-url      GSC Site URL (e.g., sc-domain:example.com)
    --start-date    YYYY-MM-DD
    --end-date      YYYY-MM-DD
    --page-url      Specific page URL (for pass-c or inspect)
    --limit         Row limit (default 1000)
    --output        Output file path (JSON)
    --auth-json     Path to service account JSON (default: ../../service_account_credentials.json)

Examples:
    python3 gsc_fetch.py pass-a --site-url sc-domain:example.com --start-date 2023-01-01 --end-date 2023-01-07
    python3 gsc_fetch.py inspect --site-url sc-domain:example.com --page-url https://example.com/blog/post-1
"""

import argparse
import json
import sys
import os
from datetime import datetime, timedelta
from pathlib import Path

# Add current directory to path so we can import gsc_client
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from gsc_client import SearchConsoleRawClient, make_filter_group_and

def get_default_dates():
    end_date = datetime.now() - timedelta(days=3) # GSC is usually 2-3 days behind
    start_date = end_date - timedelta(days=2) # Default to 3 days window
    return start_date.strftime("%Y-%m-%d"), end_date.strftime("%Y-%m-%d")

def save_output(data, output_path):
    if output_path:
        with open(output_path, 'w') as f:
            json.dump(data, f, indent=2)
        print(f"Output saved to {output_path}")
    else:
        print(json.dumps(data, indent=2))

def fetch_pass_a(client, site_url, start_date, end_date, limit, all_rows=False, page_size=25000):
    """Pass A: Property-level query facts"""
    print(f"Fetching Pass A (Queries) for {site_url} [{start_date} to {end_date}]...", file=sys.stderr)
    if all_rows:
        rows = list(
            client.search_analytics_iter_all_rows(
                site_url,
                start_date=start_date,
                end_date=end_date,
                dimensions=["query"],
                data_state="final",
                page_size=page_size,
            )
        )
        return {"rows": rows}
    return client.search_analytics_query(
        site_url,
        start_date=start_date,
        end_date=end_date,
        dimensions=["query"],
        row_limit=limit,
        data_state="final"
    )

def fetch_pass_b(client, site_url, start_date, end_date, limit, all_rows=False, page_size=25000):
    """Pass B: Property-level page facts"""
    print(f"Fetching Pass B (Pages) for {site_url} [{start_date} to {end_date}]...", file=sys.stderr)
    if all_rows:
        rows = list(
            client.search_analytics_iter_all_rows(
                site_url,
                start_date=start_date,
                end_date=end_date,
                dimensions=["page"],
                data_state="final",
                aggregation_type="auto",
                page_size=page_size,
            )
        )
        return {"rows": rows}
    return client.search_analytics_query(
        site_url,
        start_date=start_date,
        end_date=end_date,
        dimensions=["page"],
        row_limit=limit,
        data_state="final",
        aggregation_type="auto"
    )

def fetch_pass_c(client, site_url, page_url, start_date, end_date, limit, all_rows=False, page_size=25000):
    """Pass C: Page-scoped query facts"""
    if not page_url:
        raise ValueError("Page URL is required for Pass C")
        
    print(f"Fetching Pass C (Queries for {page_url}) [{start_date} to {end_date}]...", file=sys.stderr)
    dfg = [make_filter_group_and([("page", "equals", page_url)])]
    if all_rows:
        rows = list(
            client.search_analytics_iter_all_rows(
                site_url,
                start_date=start_date,
                end_date=end_date,
                dimensions=["query"],
                dimension_filter_groups=dfg,
                data_state="final",
                page_size=page_size,
            )
        )
        return {"rows": rows}
    return client.search_analytics_query(
        site_url,
        start_date=start_date,
        end_date=end_date,
        dimensions=["query"],
        dimension_filter_groups=dfg,
        row_limit=limit,
        data_state="final"
    )

def inspect_url(client, site_url, page_url):
    """URL Inspection"""
    if not page_url:
        raise ValueError("Page URL is required for inspection")
        
    print(f"Inspecting URL: {page_url}...", file=sys.stderr)
    return client.url_inspect(
        inspection_url=page_url,
        site_url=site_url
    )

def main():
    parser = argparse.ArgumentParser(description="GSC Data Fetcher")
    
    subparsers = parser.add_subparsers(dest='command', help='Command to run')
    
    # Common arguments
    common_parser = argparse.ArgumentParser(add_help=False)
    common_parser.add_argument('--site-url', required=True, help='GSC Property URL')
    common_parser.add_argument('--auth-json', default='../../service_account_credentials.json', help='Path to params JSON')
    common_parser.add_argument('--output', help='Output JSON file path')

    # Date arguments
    date_parser = argparse.ArgumentParser(add_help=False)
    def_start, def_end = get_default_dates()
    date_parser.add_argument('--start-date', default=def_start, help='Start date YYYY-MM-DD')
    date_parser.add_argument('--end-date', default=def_end, help='End date YYYY-MM-DD')
    date_parser.add_argument('--limit', type=int, default=1000, help='Row limit')
    date_parser.add_argument('--all-rows', action='store_true', help='Paginate using startRow until all rows are fetched')
    date_parser.add_argument('--page-size', type=int, default=25000, help='Pagination size when --all-rows is used')

    # Commands
    subparsers.add_parser('pass-a', parents=[common_parser, date_parser], help='Fetch queries')
    subparsers.add_parser('pass-b', parents=[common_parser, date_parser], help='Fetch pages')
    
    pass_c = subparsers.add_parser('pass-c', parents=[common_parser, date_parser], help='Fetch page queries')
    pass_c.add_argument('--page-url', required=True, help='Page URL')
    
    inspect = subparsers.add_parser('inspect', parents=[common_parser], help='Inspect URL')
    inspect.add_argument('--page-url', required=True, help='URL to inspect')

    args = parser.parse_args()
    
    if not args.command:
        parser.print_help()
        sys.exit(1)

    # Resolve auth path
    auth_path = os.path.abspath(args.auth_json)
    if not os.path.exists(auth_path):
        # Try relative to current script
        script_dir = os.path.dirname(os.path.abspath(__file__))
        auth_path = os.path.join(script_dir, args.auth_json)
        
    try:
        client = SearchConsoleRawClient.from_service_account_json(auth_path)
    except Exception as e:
        print(f"Error loading credentials: {e}", file=sys.stderr)
        sys.exit(1)

    result = {}
    
    try:
        if args.command == 'pass-a':
            result = fetch_pass_a(client, args.site_url, args.start_date, args.end_date, args.limit, args.all_rows, args.page_size)
        elif args.command == 'pass-b':
            result = fetch_pass_b(client, args.site_url, args.start_date, args.end_date, args.limit, args.all_rows, args.page_size)
        elif args.command == 'pass-c':
            result = fetch_pass_c(client, args.site_url, args.page_url, args.start_date, args.end_date, args.limit, args.all_rows, args.page_size)
        elif args.command == 'inspect':
            result = inspect_url(client, args.site_url, args.page_url)
            
        save_output(result, args.output)
        
    except Exception as e:
        print(f"API Error: {e}", file=sys.stderr)
        sys.exit(1)

if __name__ == '__main__':
    main()
