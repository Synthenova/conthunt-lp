import os
import requests
import argparse
import json
import sys
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

SE_RANKING_API_KEY = os.environ.get("SE_RANKING_API_KEY", "c619658b-eded-0863-c230-a59d3d61f1e1")
SE_RANKING_API_URL = "https://api.seranking.com/v1"
MARKET = "us"

def se_headers():
    return {'Authorization': f'Token {SE_RANKING_API_KEY}'}

def fetch_metrics(keywords):
    """Fetch metrics for a list of specific keywords."""
    if not keywords:
        return []
        
    all_results = []
    batch_size = 1000 # API limit
    
    for i in range(0, len(keywords), batch_size):
        batch = keywords[i:i+batch_size]
        files = [('keywords[]', (None, kw)) for kw in batch]
        # Requested cols: volume,cpc,competition,difficutly (and keyword for identification)
        files.append(('cols', (None, 'keyword,volume,cpc,competition,difficulty')))
        
        try:
            response = requests.post(
                f"{SE_RANKING_API_URL}/keywords/export?source={MARKET}",
                headers=se_headers(),
                files=files,
                timeout=60
            )
            if response.status_code in [200, 201]:
                results = response.json()
                valid_results = [r for r in results if r.get('is_data_found', False)]
                all_results.extend(valid_results)
            else:
                print(f"Error fetching metrics: {response.status_code} - {response.text}", file=sys.stderr)
        except Exception as e:
            print(f"Exception during metrics fetch: {e}", file=sys.stderr)
            
    return all_results

def main():
    parser = argparse.ArgumentParser(description="Fetch keyword metrics from SE Ranking API")
    parser.add_argument("keywords", nargs='+', help="List of keywords to fetch metrics for")
    
    args = parser.parse_args()
    
    metrics = fetch_metrics(args.keywords)
    
    # Create a map for easy lookup ensuring we output order or handle missing data
    results_map = {m['keyword'].lower(): m for m in metrics}
    
    final_output = []
    for kw in args.keywords:
        kw_lower = kw.lower()
        if kw_lower in results_map:
            data = results_map[kw_lower]
            final_output.append({
                'keyword': data.get('keyword', kw),
                'volume': data.get('volume', 0),
                'cpc': data.get('cpc', 0.0),
                'competition': data.get('competition', 0.0),
                'difficulty': data.get('difficulty', 0)
            })
        else:
             final_output.append({
                'keyword': kw,
                'volume': 0,
                'cpc': 0.0,
                'competition': 0.0,
                'difficulty': 0,
                'error': 'No data found'
            })

    print(json.dumps(final_output, indent=2))

if __name__ == "__main__":
    main()
