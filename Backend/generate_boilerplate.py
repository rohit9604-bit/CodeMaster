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

def generate_code_templates(title, description, input_format, output_format, test_cases):
    prompt = f"""You are a competitive programming backend system. 
You need to generate standard LeetCode-style 'starter_code' and the corresponding invisible 'driver_code' for the following problem.
Return ONLY a valid JSON object. No explanation, no markdown formatting outside of the JSON. If possible, avoid markdown entirely.

Problem Title: {title}
Description: {description}
Input Format: {input_format}
Output Format: {output_format}

The JSON MUST have two top-level keys: "starter_code" and "driver_code".
Inside both of these keys, there MUST be keys for "python", "javascript", "java", and "cpp".

"starter_code" is what the user sees in the editor. E.g., for Python:
class Solution:
    def solve(self, a: int, b: int) -> int:
        pass

"driver_code" is appended/prepended invisibly to execute their code using standard input (sys.stdin) and printing to standard output. E.g., for Python:
import sys
if __name__ == '__main__':
    input_data = sys.stdin.read().split()
    if input_data:
        a = int(input_data[0])
        b = int(input_data[1])
        print(Solution().solve(a, b))

Ensure the "driver_code" robustly parses the standard input based on the problem's Input Format and calls the user's class method, then prints the output matching the Output Format. For JavaScript, assume Node.js fs.readFileSync('/dev/stdin').

Return ONLY the raw JSON string starting with {{ and ending with }}.
"""
    try:
        response = client.chat.completions.create(
            model="google/gemini-1.5-flash",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.1,
        )

        with open('debug.txt', 'w', encoding='utf-8') as f:
            f.write(str(response))
            
        raw = response.choices[0].message.content.strip()
        
        # Clean up JSON
        if raw.startswith("```"):
            raw = raw.split("```")[1]
            if raw.lower().startswith("json"):
                raw = raw[4:]
        
        first_brace = raw.find("{")
        last_brace = raw.rfind("}")
        if first_brace != -1 and last_brace != -1:
            raw = raw[first_brace:last_brace + 1]

        data = json.loads(raw)
        return data
    except Exception as e:
        with open('error.log', 'w') as f:
            f.write(str(e))
        print(f"Error generating templates for '{title}': written to error.log")
        return None

def run():
    print("Fetching problems...")
    cursor.execute("""
        SELECT id, title, description, input_format, output_format 
        FROM problems 
        WHERE starter_code IS NULL OR driver_code IS NULL
        ORDER BY id LIMIT 1
    """)
    problems = cursor.fetchall()
    print(f"Found {len(problems)} problems to process.")

    for pid, title, desc, ifmt, ofmt in problems:
        print(f"Processing Problem {pid}: {title}...")
        
        templates = generate_code_templates(title, desc, ifmt, ofmt, [])
        if templates and "starter_code" in templates and "driver_code" in templates:
            try:
                cursor.execute(
                    "UPDATE problems SET starter_code = %s, driver_code = %s WHERE id = %s",
                    (json.dumps(templates["starter_code"]), json.dumps(templates["driver_code"]), pid)
                )
                conn.commit()
                print(f"[SUCCESS] Updated templates for Problem {pid}.")
            except Exception as e:
                print(f"Failed to update DB for Problem {pid}: {e}")
                conn.rollback()
        else:
            print(f"[FAILED] Failed to generate valid JSON for Problem {pid}.")
            
        time.sleep(1)

if __name__ == "__main__":
    # For testing, we can limit fetching by appending `LIMIT 1` in the SQL, 
    # but the above code does all. I will just run it.
    run()
    cursor.close()
    conn.close()
