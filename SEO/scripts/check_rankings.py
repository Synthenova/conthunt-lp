import os
import sys
import json
import argparse
import asyncio
from typing import Dict, List
from urllib.parse import urlparse
from apify_client import ApifyClientAsync
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def extract_domain(url: str) -> str:
    """Extract root domain from URL."""
    try:
        parsed = urlparse(url)
        domain = parsed.netloc.lower()
        if domain.startswith("www."):
            domain = domain[4:]
        return domain
    except:
        return ""

async def check_single_keyword(client: ApifyClientAsync, domain: str, keyword: str, limit: int = 30) -> Dict:
    """
    Checks SERP results for a single keyword using Apify Actor.
    """
    target_domain = domain.lower().replace("www.", "")
    
    run_input = {
        "country": "US",
        "include_merged": False, # Merged is usually for all pages, we perform individual check
        "keyword": keyword,
        "limit": str(limit),
        "proxy_location": "us"
    }

    try:
        # Start the run
        run = await client.actor("563JCPLOqM1kMmbbP").call(run_input=run_input)
        
        if not run:
            return {"keyword": keyword, "rank": None, "url": None, "error": "Run failed to start"}

        # Fetch results
        dataset_items = await client.dataset(run["defaultDatasetId"]).list_items()
        items = dataset_items.items
        
        found_rank = None
        found_url = None
        
        # User's previous screenshot showed items having "results" list inside. 
        # But sometimes single keyword output might differ. 
        # Let's assume the standard output structure for this actor.
        # Usually checking 'organicResults' or mapped 'results'
        
        # Determine the source of results list
        all_results = []
        for item in items:
            if "results" in item and isinstance(item["results"], list):
                 all_results.extend(item["results"])
            elif "organicResults" in item and isinstance(item["organicResults"], list):
                 all_results.extend(item["organicResults"])
        
        # Find ranking
        for res in all_results:
            link = res.get("url") or res.get("link")
            position = res.get("position")
            
            if link and position:
                res_domain = extract_domain(link)
                if res_domain == target_domain or res_domain.endswith("." + target_domain):
                    # If duplicate positions, take the first/best one
                    if found_rank is None or position < found_rank:
                        found_rank = position
                        found_url = link
        
        return {
            "keyword": keyword, 
            "rank": found_rank, 
            "url": found_url
        }

    except Exception as e:
        return {"keyword": keyword, "rank": None, "url": None, "error": str(e)}

def parse_args():
    parser = argparse.ArgumentParser(description="Check SERP rankings for a domain and keywords")
    parser.add_argument("domain", help="Target domain")
    parser.add_argument("keywords", nargs="+", help="Keywords list (or a single comma-separated string)")
    parser.add_argument("--json", action="store_true", help="Emit JSON only")
    parser.add_argument("--concurrency", type=int, default=20, help="Concurrent actor runs")
    parser.add_argument("--limit", type=int, default=30, help="SERP result limit per keyword")
    return parser.parse_args()


def normalize_keywords(keywords_arg: List[str]) -> List[str]:
    if len(keywords_arg) == 1 and "," in keywords_arg[0]:
        return [k.strip() for k in keywords_arg[0].split(",") if k.strip()]
    return [k.strip() for k in keywords_arg if k.strip()]


async def main_async():
    args = parse_args()
    domain = args.domain
    keywords = normalize_keywords(args.keywords)

    api_token = os.getenv("APIFY_API_TOKEN")
    if not api_token:
        print("Error: APIFY_API_TOKEN not found in environment variables.", file=sys.stderr)
        return

    client = ApifyClientAsync(token=api_token)
    
    concurrency = args.concurrency
    result_limit = args.limit

    if not args.json:
        print(f"Checking rankings for domain: {domain}")
        print(f"Keywords: {len(keywords)} keywords")
        print(f"Configuration: Concurrent Runs={concurrency}, Limit={result_limit}")
        print("-" * 40)

    semaphore = asyncio.Semaphore(concurrency)
    
    async def bound_check(kw):
        async with semaphore:
            if not args.json:
                print(f"Starting check for: {kw}")
            res = await check_single_keyword(client, domain, kw, limit=result_limit)
            if not args.json:
                print(f"Finished check for: {kw}")
            return res

    tasks = [bound_check(kw) for kw in keywords]
    results = await asyncio.gather(*tasks)

    found_count = 0
    clean_results = []
    
    for res in results:
        rank_display = res["rank"] if res["rank"] else "Not Found"
        url_display = res["url"] if res["url"] else "-"
        if res["rank"]:
            found_count += 1
        
        clean_results.append({
            "keyword": res["keyword"],
            "rank": res["rank"],
            "url": res["url"]
        })

        if not args.json:
            print(f"Keyword: {res['keyword']}")
            print(f"  Rank: {rank_display}")
            print(f"  URL: {url_display}")
            if "error" in res:
                print(f"  Error: {res['error']}")
            print("-" * 20)

    if args.json:
        print(json.dumps({
            "domain": domain,
            "keywords_checked": len(keywords),
            "found_count": found_count,
            "results": clean_results
        }))
        return

    print(f"Summary: Found {found_count} rankings out of {len(keywords)} keywords.")
    print("\n[RAW LIST OUTPUT]")
    print(clean_results)

def main():
    asyncio.run(main_async())

if __name__ == "__main__":
    main()
