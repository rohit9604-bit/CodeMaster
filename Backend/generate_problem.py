import os
import json
import time
import logging
import psycopg2
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()

OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
DATABASE_URL = os.getenv("DATABASE_URL")

logging.basicConfig(
    filename="batch_generation.log",
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s"
)

client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=OPENROUTER_API_KEY,
)

conn = psycopg2.connect(DATABASE_URL)
cursor = conn.cursor()

total_saved = 0


def generate_batch_prompt(topic, difficulty, count):
    return f"""
Generate {count} {difficulty} DSA problems about {topic}.

Return ONLY valid JSON array.
Do not include explanation.
Do not include markdown.

Each object must contain:
- title
- description
- difficulty
- tags (array of strings)
- test_cases (array with input and output strings)
- hints (array of strings)
"""


def generate_problem_batch(topic, difficulty, count=3, retries=2):
    for attempt in range(retries):
        try:
            response = client.chat.completions.create(
                model="mistralai/mistral-7b-instruct",
                messages=[{"role": "user", "content": generate_batch_prompt(topic, difficulty, count)}],
                temperature=0.8,
            )

            raw = response.choices[0].message.content.strip()

            if raw.startswith("```"):
                raw = raw.split("```")[1]

            first_bracket = raw.find("[")
            last_bracket = raw.rfind("]")

            if first_bracket != -1 and last_bracket != -1:
                raw = raw[first_bracket:last_bracket + 1]

            problems = json.loads(raw)

            print(f"✅ AI returned {len(problems)} problems")
            return problems

        except Exception as e:
            print(f"⚠ AI attempt {attempt+1} failed:", str(e))
            logging.error(str(e))
            time.sleep(2)

    print("❌ AI completely failed after retries.")
    return []


def is_duplicate(title):
    cursor.execute("SELECT id FROM problems WHERE title=%s", (title,))
    return cursor.fetchone() is not None


def sanitize_tags(tags):
    if isinstance(tags, str):
        return [tags]
    if isinstance(tags, list):
        clean = []
        for t in tags:
            if isinstance(t, dict):
                clean.append(str(t))
            else:
                clean.append(str(t))
        return clean
    return []


def save_problem(problem):
    global total_saved
    try:
        title = problem.get("title") or problem.get("problem_title") or problem.get("name")
        if not title:
            print("⚠ Missing title, skipped")
            return

        if is_duplicate(title):
            print("⚠ Duplicate skipped:", title)
            return

        description = problem.get("description", "")
        difficulty = problem.get("difficulty", "Easy")
        tags = sanitize_tags(problem.get("tags", []))

        cursor.execute(
            """
            INSERT INTO problems
            (title, description, difficulty, tags)
            VALUES (%s,%s,%s,%s)
            RETURNING id
            """,
            (title, description, difficulty, tags)
        )

        problem_id = cursor.fetchone()[0]

        hints = problem.get("hints", [])
        for i, hint in enumerate(hints):
            cursor.execute(
                "INSERT INTO hints(problem_id, hint_order, hint_text) VALUES (%s,%s,%s)",
                (problem_id, i + 1, hint)
            )

        tests = problem.get("test_cases", [])
        for test in tests:
            cursor.execute(
                "INSERT INTO test_cases(problem_id, input, expected_output) VALUES (%s,%s,%s)",
                (
                    problem_id,
                    str(test.get("input", "")),
                    str(test.get("output", ""))
                )
            )

        conn.commit()
        total_saved += 1
        print("✅ Saved:", title)

    except Exception as e:
        conn.rollback()
        print("❌ DB ERROR:", str(e))
        logging.error(str(e))


def run_batch(rounds=3):
    topics = [
        "Array", "String", "Recursion", "Stack", "Queue",
        "Binary Search", "Greedy", "DP", "Graph",
        "Tree", "Backtracking", "Sliding Window", "Heap"
    ]

    difficulties = ["Easy", "Medium"]

    for r in range(rounds):
        print(f"\n=========== ROUND {r+1} ===========")

        for topic in topics:
            for difficulty in difficulties:
                print(f"\n🚀 Generating {difficulty} {topic} problems...")

                problems = generate_problem_batch(topic, difficulty, count=3)

                for problem in problems:
                    save_problem(problem)

                time.sleep(2)


if __name__ == "__main__":
    run_batch(rounds=3)
    print(f"\n🎉 Batch generation completed.")
    print(f"📊 Total problems saved: {total_saved}")
    cursor.close()
    conn.close()
