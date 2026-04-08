import os
import argparse
import json
import asyncio
from urllib.parse import urlparse
from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI

# Load environment variables
load_dotenv()

async def process_query(llm_with_tools, query, domain, semaphore, quiet=False):
    async with semaphore:
        if not quiet:
            print(f"\n--- Processing Query: '{query}' ---")
        try:
            # Invoke the model asynchronously
            response = await llm_with_tools.ainvoke(query)
            
            urls = []
            if hasattr(response, 'response_metadata'):
                meta = response.response_metadata
                # Extract URLs from grounding metadata
                if 'grounding_metadata' in meta:
                    grounding_chunks = meta['grounding_metadata'].get('grounding_chunks', [])
                    for chunk in grounding_chunks:
                        if 'web' in chunk and 'uri' in chunk['web']:
                            uri = chunk['web']['uri']
                            if uri:
                                urls.append(uri)
            
            # Formatting output to look somewhat atomic to avoid interleaved print mess
            found = None
            if domain:
                domain_lower = domain.lower()
                found = False
                for url in urls:
                    try:
                        parsed_url = urlparse(url)
                        netloc = parsed_url.netloc.lower()
                        if domain_lower == netloc or netloc.endswith(f".{domain_lower}"):
                            found = True
                            break
                        if domain_lower in url.lower(): 
                            found = True 
                            break
                    except:
                        pass
                
                if not quiet:
                    output = [f"Query: '{query}'", f"Found {len(urls)} URLs.", f"Checking for domain: {domain}", f"Query: \"{query}\" -> Found: {found}"]
                    print("\n".join(output))
            else:
                if not quiet:
                    output = [f"Query: '{query}'", f"Found {len(urls)} URLs.", f"URLs found: {urls}"]
                    print("\n".join(output))

            return {"query": query, "urls": urls, "found": found}

        except Exception as e:
            if not quiet:
                print(f"Error processing query '{query}': {e}")
                print(f"Query: \"{query}\" -> Found: False (Error)")
            return {"query": query, "urls": [], "found": False, "error": str(e)}

async def search_queries(queries, domain=None, concurrency=50):
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        print("Error: GEMINI_API_KEY not found in environment variables.")
        return

    try:
        # Initialize Gemini
        llm = ChatGoogleGenerativeAI(
            model="google/gemini-3-flash-preview",
            temperature=0.7,
            api_key=api_key,
            max_retries=1,
        )
        
        # Bind the tool
        llm_with_tools = llm.bind_tools([{"google_search": {}}])
        
        semaphore = asyncio.Semaphore(concurrency)
        
        tasks = [process_query(llm_with_tools, query, domain, semaphore, quiet=True) for query in queries]
        results = await asyncio.gather(*tasks)
        return results
                
    except Exception as e:
        print(f"Initialization Error: {e}")
        return []

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Google Search via Gemini (Async)")
    parser.add_argument("queries", nargs='+', help="List of queries to search")
    parser.add_argument("--domain", help="Domain to filter/check", default=None)
    parser.add_argument("--concurrency", type=int, help="Number of concurrent requests", default=50)
    parser.add_argument("--json", action="store_true", help="Emit JSON only")
    
    args = parser.parse_args()
    results = asyncio.run(search_queries(args.queries, args.domain, args.concurrency))
    if args.json:
        print(json.dumps({
            "domain": args.domain,
            "queries_checked": len(args.queries),
            "results": results,
        }))
    else:
        for item in results:
            print(f"Query: {item['query']}")
            if args.domain is not None:
                print(f"  Found: {item.get('found')}")
            print(f"  URL count: {len(item.get('urls', []))}")
