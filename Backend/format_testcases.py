import os
import json
import time
import psycopg2
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()

OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
DATABASE_URL = os.getenv("DATABASE_URL")

client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=OPENROUTER_API_KEY,
)

conn = psycopg2.connect(DATABASE_URL)
cursor = conn.cursor()

def format_problem_testcases(problem_id, title, input_format, test_cases):
    prompt = f"""You are a test case re-formatter for a competitive programming platform.
Your task is to take flat strings of inputs and reformat them into standard multi-line competitive programming format using newlines (\\n).
DO NOT CHANGE ANY NUMBERS OR VALUES. ONLY add newlines (\\n).
Return ONLY a valid JSON object mapping testcase ID to the formatted string. No markdown, no explanations.

Problem Title: {title}
Input Format Description: {input_format}

Test Cases to format:
"""
    for tc in test_cases:
        prompt += f"ID: {tc['id']}, Input: '{tc['input']}'\n"

    prompt += "\nExample Response:\n{\n  \"651\": \"4\\n1 -1 2 -2\",\n  \"652\": \"6\\n-1 0 1 -1 2 -2\"\n}"

    try:
        response = client.chat.completions.create(
            model="mistralai/mistral-7b-instruct",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.1,
        )

        raw = response.choices[0].message.content.strip()
        
        # Clean up JSON
        if raw.startswith("```"):
            raw = raw.split("```")[1]
            if raw.startswith("json"):
                raw = raw[4:]
        
        first_brace = raw.find("{")
        last_brace = raw.rfind("}")
        if first_brace != -1 and last_brace != -1:
            raw = raw[first_brace:last_brace + 1]

        data = json.loads(raw)
        return data
    except Exception as e:
        print(f"Error formatting problem {problem_id}: {e}")
        return {}

def run():
    print("Fetching problems with flat testcases...")
    cursor.execute("""
        SELECT p.id, p.title, p.input_format, t.id, t.input 
        FROM test_cases t 
        JOIN problems p ON t.problem_id = p.id 
        WHERE t.input NOT LIKE '%\\n%' 
        ORDER BY p.id
    """)
    rows = cursor.fetchall()

    if not rows:
        print("No flat test cases found!")
        return

    # Group by problem
    problems = {}
    for row in rows:
        pid, title, fmt, tid, inp = row
        if pid not in problems:
            problems[pid] = {'title': title, 'format': fmt, 'test_cases': []}
        problems[pid]['test_cases'].append({'id': tid, 'input': inp})

    print(f"Found {len(problems)} problems to process.")

    total_updated = 0
    for pid, pdata in problems.items():
        print(f"Processing Problem {pid}: {pdata['title']} ({len(pdata['test_cases'])} cases)...")
        
        formatted_map = format_problem_testcases(pid, pdata['title'], pdata['format'], pdata['test_cases'])
        
        if formatted_map:
            updated_for_problem = 0
            for tid_str, new_input in formatted_map.items():
                try:
                    tid = int(tid_str)
                    cursor.execute("UPDATE test_cases SET input = %s WHERE id = %s", (new_input, tid))
                    updated_for_problem += 1
                except Exception as e:
                    print(f"Failed to update TC {tid_str}: {e}")
            
            conn.commit()
            total_updated += updated_for_problem
            print(f"✅ Updated {updated_for_problem} test cases for Problem {pid}.")
        else:
            print(f"❌ Failed to format Problem {pid}.")
            
        time.sleep(1)  # Rate limiting

    print(f"Finished processing. Total test cases updated: {total_updated}")

if __name__ == "__main__":
    run()
    cursor.close()
    conn.close()
