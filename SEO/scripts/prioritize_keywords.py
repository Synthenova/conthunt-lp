import os
import glob
import json
import argparse
import sys
from pathlib import Path
from typing import List, Tuple, Dict, Any
from pydantic import BaseModel, Field
from dotenv import load_dotenv


def _load_env() -> None:
    script_dir = Path(__file__).resolve().parent
    candidate_paths = [
        script_dir.parent / ".env",          # autoseo/.env
        script_dir.parent.parent / ".env",   # workspace root .env
    ]
    for env_path in candidate_paths:
        if env_path.exists():
            load_dotenv(env_path, override=False)


_load_env()

# Define the Pydantic models for structured output
class KeywordPriority(BaseModel):
    keyword: str = Field(description="The keyword being prioritized.")
    priority_score: int = Field(description="Priority score from 1-10, where 10 is the highest priority.")
    priority_reason: str = Field(description="A short reason string for the priority, similar to 'VERY_HIGH_Reason_Clause'.")

class KeywordPrioritiesResponse(BaseModel):
    priorities: List[KeywordPriority]

def load_all_docs(docs_dir: str) -> str:
    """Reads all files in the docs directory and returns their content concatenated."""
    combined_content = ""
    # Docs are located at ../docs relative to this script
    # Or strict path as requested by User in @[autoseo/docs]
    
    # We resolve the path relative to this script
    script_dir = os.path.dirname(os.path.abspath(__file__))
    # Assuming the structure is autoseo/scripts/this_script.py and autoseo/docs/
    target_dir = os.path.join(script_dir, "../docs")
    
    if not os.path.exists(target_dir):
        # Fallback to checking absolute path if running from elsewhere or structure differs
        if os.path.exists("./autoseo/docs"):
            target_dir = "./autoseo/docs"
        elif os.path.exists("autoseo/docs"):
             target_dir = "autoseo/docs"
    
    if not os.path.exists(target_dir):
         print(f"Warning: Docs directory not found. Looked in {target_dir}", file=sys.stderr)
         return ""

    files = glob.glob(os.path.join(target_dir, "*"))
    for file_path in files:
        if os.path.isfile(file_path):
            try:
                with open(file_path, "r", encoding="utf-8") as f:
                    combined_content += f"\n\n--- START OF DOCUMENT: {os.path.basename(file_path)} ---\n"
                    combined_content += f.read()
                    combined_content += f"\n--- END OF DOCUMENT: {os.path.basename(file_path)} ---\n"
            except Exception as e:
                print(f"Error reading {file_path}: {e}", file=sys.stderr)
                
    return combined_content

def prioritize_keywords(keywords_data: List[Dict[str, Any]]) -> List[Tuple[int, str]]:
    """
    Takes a list of keyword data dicts (keyword, volume, difficulty, cpc, competition),
    prioritizes them using LLM and docs context,
    and returns a list of (score, reason) tuples corresponding to the input order.
    """
    
    from langchain_google_genai import ChatGoogleGenerativeAI
    from langchain_core.messages import HumanMessage

    # Initialize LLM
    llm = ChatGoogleGenerativeAI(
        model=os.getenv("PRIORITIZE_GEMINI_MODEL", "gemini-2.0-flash"),
        temperature=0.5,
        google_api_key=os.getenv("GEMINI_API_KEY"),
    )

    # Prepare Context
    all_docs_content = load_all_docs("../docs")
    
    # Format keywords for the prompt
    keywords_prompt_str = ""
    for kw in keywords_data:
        # Expected keys: keyword, volume, difficulty, cpc, competition
        k = kw.get("keyword", "unknown")
        v = kw.get("volume", 0)
        d = kw.get("difficulty", 0)
        c = kw.get("cpc", 0.0)
        comp = kw.get("competition", 0.0)
        keywords_prompt_str += f"- Keyword: {k}, Volume: {v}, Difficulty: {d}, CPC: {c}, Competition: {comp}\n"

    # Construct the message content
    prompt_content = f"this is brad deets for Conthunt {all_docs_content}\n\n" \
                     f"Based on the context above and the metrics provided (Volume, Difficulty, CPC, Competition), assign a priority score (1-10) and a reason for each of the following keywords.\n" \
                     f"Consider high volume and low difficulty as generally positive, but align primarily with the product context (Conthunt).\n" \
                     f"Keywords to prioritize:\n{keywords_prompt_str}"

    human = HumanMessage(content=prompt_content)
    
    # Structured Output
    structured_llm = llm.with_structured_output(KeywordPrioritiesResponse)
    
    try:
        response = structured_llm.invoke([human])
        
        # Create a map for easy lookup
        priority_map = {item.keyword: (item.priority_score, item.priority_reason) for item in response.priorities}
        
        # Output list preserving input order
        output_list = []
        for kw_data in keywords_data:
            kw = kw_data.get("keyword")
            if kw in priority_map:
                output_list.append(priority_map[kw])
            else:
                # Fallback if LLM missed one
                output_list.append((0, "Error_LLM_Missed_Keyword"))
            
        return output_list
        
    except Exception as e:
        print(f"Error executing LLM request: {e}", file=sys.stderr)
        return []

def main():
    parser = argparse.ArgumentParser(description="Prioritize keywords with LLM")
    parser.add_argument("--input-json", help="Path to input JSON list of keyword objects")
    parser.add_argument("--json", action="store_true", help="Emit JSON response")
    args = parser.parse_args()

    if args.input_json:
        with open(args.input_json, "r", encoding="utf-8") as f:
            sample_keywords = json.load(f)
    else:
        sample_keywords = [
            {"keyword": "viral video finder", "volume": 1000, "difficulty": 20, "cpc": 1.5, "competition": 0.2},
            {"keyword": "conthunt pricing", "volume": 50, "difficulty": 5, "cpc": 0.0, "competition": 0.0},
            {"keyword": "how to find trending tiktoks", "volume": 5000, "difficulty": 60, "cpc": 2.0, "competition": 0.8},
            {"keyword": "random keyword", "volume": 10, "difficulty": 10, "cpc": 0.0, "competition": 0.0}
        ]

    try:
        results = prioritize_keywords(sample_keywords)
        json_rows = []
        for kw_data, (score, reason) in zip(sample_keywords, results):
            json_rows.append({
                "keyword": kw_data["keyword"],
                "priority_score": score,
                "priority_reason": reason,
            })

        if args.json:
            print(json.dumps({"results": json_rows}))
            return

        print("Prioritization Results:")
        for row in json_rows:
            print(f"Keyword: {row['keyword']} | Score: {row['priority_score']} | Reason: {row['priority_reason']}")
        print("\nRaw Return Value:")
        print(json_rows)
    except Exception as e:
        print(f"Main execution failed: {e}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()
