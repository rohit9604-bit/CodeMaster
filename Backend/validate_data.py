import os
import re
import requests
import psycopg2
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")

client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=OPENROUTER_API_KEY,
)

conn = psycopg2.connect(DATABASE_URL)
cursor = conn.cursor()

JUDGE0_URL = "https://ce.judge0.com/submissions"


# -----------------------------
# Clean AI Generated Code
# -----------------------------
def clean_code(raw):
    raw = raw.strip()

    if "```" in raw:
        parts = raw.split("```")
        if len(parts) >= 2:
            raw = parts[1]

    lines = raw.split("\n")
    cleaned_lines = []

    for line in lines:
        stripped = line.strip().lower()

        if stripped == "java":
            continue

        if stripped == "python":
            continue

        cleaned_lines.append(line)

    cleaned_code = "\n".join(cleaned_lines).strip()

    # Remove Python 3.9+ type hints like list[int]
    cleaned_code = re.sub(r'->.*?:', ':', cleaned_code)

    return cleaned_code


# -----------------------------
# Generate Reference Solution
# -----------------------------
def generate_solution(problem_description):
    prompt = f"""
Solve the following DSA problem in Python.

Return ONLY valid Python code.
Do NOT include explanation.
Do NOT include markdown.
Do NOT include backticks.
Do NOT include the word python.

Problem:
{problem_description}
"""

    response = client.chat.completions.create(
        model="mistralai/mistral-7b-instruct",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.2
    )

    raw = response.choices[0].message.content
    cleaned = clean_code(raw)

    print("\n--- GENERATED SOLUTION ---")
    print(cleaned)
    print("--------------------------\n")

    return cleaned


# -----------------------------
# Build Executable Script Wrapper
# -----------------------------
def build_executable_script(function_code):
    lines = function_code.strip().split("\n")
    func_name = None

    for line in lines:
        if line.strip().startswith("def "):
            func_name = line.split("def ")[1].split("(")[0]
            break

    if not func_name:
        return function_code

    wrapper = f"""
import ast
import json

{function_code}

raw_input = input()

try:
    data = ast.literal_eval(raw_input)
except:
    try:
        data = json.loads(raw_input)
    except:
        data = raw_input

if isinstance(data, dict):
    result = {func_name}(**data)
elif isinstance(data, tuple):
    result = {func_name}(*data)
else:
    result = {func_name}(data)

print(result)
"""


    return wrapper


# -----------------------------
# Run Code Using Judge0
# -----------------------------
def run_code(code, input_data):
    executable_code = build_executable_script(code)

    response = requests.post(
        f"{JUDGE0_URL}?base64_encoded=false&wait=true",
        json={
            "source_code": executable_code,
            "language_id": 71,
            "stdin": input_data
        }
    )

    result = response.json()

    if result.get("compile_output"):
        print("⚠ Compilation Error:", result["compile_output"])
        return None

    if result.get("stderr"):
        print("⚠ Runtime Error:", result["stderr"])
        return None

    stdout = result.get("stdout")

    if stdout is None:
        return None

    return stdout.strip()


# -----------------------------
# Validate Single Problem
# -----------------------------
def validate_problem(problem_id, description):
    print(f"\nValidating Problem ID: {problem_id}")

    solution_code = generate_solution(description)

    cursor.execute(
        "SELECT id, input, expected_output FROM test_cases WHERE problem_id = %s",
        (problem_id,)
    )

    test_cases = cursor.fetchall()

    if not test_cases:
        print("⚠ No test cases found.")
        return

    all_passed = True

    for test_id, input_data, expected in test_cases:
        actual_output = run_code(solution_code, input_data)

        print("INPUT:", input_data)
        print("EXPECTED:", expected)
        print("ACTUAL:", actual_output)

        if actual_output is None:
            print("❌ Solution execution failed.")
            all_passed = False
            break

        if actual_output.strip() != expected.strip():
            print("⚠ Fixing incorrect expected_output")

            cursor.execute(
                "UPDATE test_cases SET expected_output = %s WHERE id = %s",
                (actual_output, test_id)
            )

        cursor.execute(
            "UPDATE test_cases SET is_verified = true WHERE id = %s",
            (test_id,)
        )

    if all_passed:
        cursor.execute(
            "UPDATE problems SET is_validated = true WHERE id = %s",
            (problem_id,)
        )
        print("✅ Problem validated.")
    else:
        print("⚠ Problem NOT validated due to solution failure.")

    conn.commit()


# -----------------------------
# Batch Validator
# -----------------------------
def run_validation_batch(limit=5):
    cursor.execute(
        "SELECT id, description FROM problems WHERE is_validated = false LIMIT %s",
        (limit,)
    )

    problems = cursor.fetchall()

    for problem_id, description in problems:
        validate_problem(problem_id, description)


if __name__ == "__main__":
    run_validation_batch(limit=5)
    cursor.close()
    conn.close()
