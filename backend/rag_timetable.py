import os
import re
import json
import random
import datetime
from typing import Dict, List, Any, Optional

import requests
from dotenv import load_dotenv
from pypdf import PdfReader

load_dotenv()

# ============================
# CONFIG
# ============================
PDF_PATH = "data/vrsec exam time table.pdf"
LLM_API_URL = os.getenv("LLM_API_URL")  # Example: http://127.0.0.1:8000/infer

# ----------------------------
# STATIC CONFIG (Fixed Inputs)
# ----------------------------
DEFAULT_TIME_SLOT = "10:00 AM to 01:00 PM"

# Static room capacities (as per your requirement)
ROOMS = {
    "Room-1": 70,
    "Room-2": 70,
    "Room-3": 70,
    "Room-4": 70,
    "Room-5": 70,
}

# Static department intake
DEPT_INTAKE = {
    "CSE": 120,
    "ECE": 120,
    "MEC": 120,
    "CIVIL": 120
}

# Static year distribution
YEAR_DISTRIBUTION = {
    "1": 40,
    "2": 40,
    "3": 40
}


# ============================
# 1) Extract Few-shot Examples from PDF
# ============================
def extract_pdf_text(pdf_path: str, max_pages: int = 4) -> str:
    """
    Extract raw text from PDF for few-shot style reference.
    Works if PDF has selectable text.
    """
    if not os.path.exists(pdf_path):
        return ""

    reader = PdfReader(pdf_path)
    pages = reader.pages[:max_pages]

    text = []
    for i, page in enumerate(pages):
        page_text = page.extract_text() or ""
        page_text = page_text.strip()
        if page_text:
            text.append(f"\n--- PDF PAGE {i+1} ---\n{page_text}")

    return "\n".join(text).strip()


def build_fewshot_block(pdf_text: str) -> str:
    """
    Few-shot block used ONLY for style/format reference.
    """
    if not pdf_text:
        return "No PDF examples available."

    return (
        "FEW-SHOT STYLE REFERENCE (from previous VRSEC exam timetables):\n"
        "Use this ONLY for structure, date formatting, and professional formatting.\n"
        "Do NOT copy subject names from here unless they match the input.\n\n"
        f"{pdf_text}\n"
    )


# ============================
# 2) Date Utilities
# ============================
def make_alternate_day_dates(n: int, start_date: Optional[str] = None) -> List[str]:
    """
    Generate n dates with alternate-day pattern:
    2026-02-02, 2026-02-04, 2026-02-06...
    """
    if start_date:
        base = datetime.datetime.strptime(start_date, "%Y-%m-%d").date()
    else:
        base = datetime.date.today() + datetime.timedelta(days=random.randint(3, 10))

    dates = []
    for i in range(n):
        d = base + datetime.timedelta(days=i * 2)
        dates.append(d.strftime("%Y-%m-%d"))
    return dates


# ============================
# 3) JSON Extraction + Repair Helpers
# ============================
def extract_json_block(text: str) -> str:
    """
    Extract the first JSON-like block from model output.
    """
    match = re.search(r"\{[\s\S]*\}", text)
    if not match:
        return ""
    return match.group(0).strip()


def call_llm(prompt: str, temperature: float = 0.2, top_p: float = 0.9, max_new_tokens: int = 1200) -> str:
    """
    Calls your GPU server /infer endpoint.
    NOTE: infer.py must accept these params. If not, remove them.
    """
    if not LLM_API_URL:
        raise ValueError("LLM_API_URL missing in .env. Example: LLM_API_URL=http://127.0.0.1:8000/infer")

    payload = {
        "prompt": prompt,
        "temperature": temperature,
        "top_p": top_p,
        "max_new_tokens": max_new_tokens
    }

    res = requests.post(LLM_API_URL, json=payload, timeout=180)
    if res.status_code != 200:
        raise RuntimeError(f"LLM Server error: {res.status_code} - {res.text}")

    return res.json().get("response", "").strip()


def repair_json_with_llm(broken_json: str) -> str:
    """
    Calls the LLM to fix broken JSON and return valid JSON only.
    """
    repair_prompt = f"""
You are a JSON Repair Assistant.

The following JSON is broken/incomplete.
Fix it and return ONLY valid JSON.
Do not add any extra text.

BROKEN JSON:
{broken_json}
""".strip()

    fixed = call_llm(repair_prompt, temperature=0.0, top_p=1.0, max_new_tokens=1200)
    fixed_json = extract_json_block(fixed)
    return fixed_json


def safe_json_loads(json_text: str) -> Dict[str, Any]:
    """
    Strict JSON parsing.
    """
    return json.loads(json_text)


# ============================
# 4) Roll Allocation Logic (Static rooms + static intake)
# ============================
def allocate_students_for_exam(dept: str, year: str, subject: str) -> Dict[str, List[Dict[str, Any]]]:
    """
    Forcefully distributes students across all rooms (Room-1 to Room-5),
    even if Room-1 alone can hold them.

    Example:
    total_students = 40
    rooms = 5
    distribution = [8, 8, 8, 8, 8]
    """
    total_students = YEAR_DISTRIBUTION[year]
    room_names = list(ROOMS.keys())

    allocations = {room: [] for room in room_names}

    # Split students evenly across all rooms
    base = total_students // len(room_names)
    extra = total_students % len(room_names)

    # Example: 40 students, 5 rooms -> base=8, extra=0
    distribution = []
    for i in range(len(room_names)):
        take = base + (1 if i < extra else 0)
        distribution.append(take)

    current_roll = 1
    for room, take in zip(room_names, distribution):
        if take == 0:
            continue

        start_roll = current_roll
        end_roll = current_roll + take - 1

        allocations[room].append({
            "department": dept,
            "year": year,
            "subject": subject,
            "start_roll": start_roll,
            "end_roll": end_roll,
            "count": take
        })

        current_roll = end_roll + 1

    return allocations


# ============================
# 5) Optimized Prompt Template (Few-shot + strict output)
# ============================
def build_prompt(
    input_subjects: Dict[str, List[str]],
    start_date: str,
    pdf_fewshot: str
) -> str:
    """
    Builds prompt with few-shot reference + strict constraints.
    """
    normalized = {k.upper(): v for k, v in input_subjects.items()}

    return f"""
You are a VRSEC Exam Timetable + Room Allocation Generator.

Your job:
- Generate a day-wise exam timetable
- Allocate students into fixed rooms based on fixed capacities
- Output must be STRICT VALID JSON only

=========================
FEW-SHOT STYLE REFERENCE
=========================
{pdf_fewshot}

=========================
STATIC RULES (DO NOT CHANGE)
=========================
1) Exam time slot must ALWAYS be: "{DEFAULT_TIME_SLOT}"
2) Rooms and capacities:
{json.dumps(ROOMS, indent=2)}
3) Each department has year-wise students:
{json.dumps(YEAR_DISTRIBUTION, indent=2)}

=========================
INPUT FORMAT (STRICT)
=========================
User gives departments and subject names in order.

INPUT JSON:
{json.dumps(normalized, indent=2)}

Start Date:
{start_date}

=========================
CONSTRAINTS (VERY IMPORTANT)
=========================
1) Schedule subjects in the SAME ORDER given for each department.
2) Dates must be alternate-day pattern: start_date, start_date+2, start_date+4...
3) Do NOT mix subjects between departments.
4) Each date represents one exam session.
5) Each department's subject on that date should have room allocations.
6) Roll numbers start from 1 for each department/year exam allocation.
7) Room allocation should split sequentially (Room-1 fills first, then Room-2, etc).

=========================
OUTPUT FORMAT (STRICT JSON ONLY)
=========================
Return ONLY valid JSON in the EXACT format below:

{{
  "timetables": [
    {{
      "date": "YYYY-MM-DD",
      "time": "{DEFAULT_TIME_SLOT}",
      "allocations": {{
        "Room-1": [
          {{"department":"CSE","year":"1","subject":"DSA","start_roll":1,"end_roll":40,"count":40}}
        ],
        "Room-2": []
      }}
    }}
  ]
}}

IMPORTANT:
- No markdown
- No explanations
- No extra text
""".strip()


# ============================
# 6) Main Timetable Generator
# ============================
def generate_timetable(input_subjects: Dict[str, List[str]], start_date: Optional[str] = None) -> Dict[str, Any]:
    """
    Generates final timetable JSON.
    Uses LLM for planning format + fallback deterministic allocation.
    Also repairs broken JSON automatically.
    """
    normalized = {k.upper(): v for k, v in input_subjects.items()}

    if not start_date:
        start_date = make_alternate_day_dates(1)[0]

    pdf_text = extract_pdf_text(PDF_PATH, max_pages=4)
    fewshot = build_fewshot_block(pdf_text)

    prompt = build_prompt(normalized, start_date, fewshot)

    # ---- LLM call ----
    raw = call_llm(prompt, temperature=0.15, top_p=0.9, max_new_tokens=1400)
    json_text = extract_json_block(raw)

    if not json_text:
        raise ValueError("Model did not return JSON output.")

    # ---- Parse JSON safely + auto repair ----
    try:
        output = safe_json_loads(json_text)
    except Exception:
        repaired = repair_json_with_llm(json_text)
        if not repaired:
            raise ValueError("Model returned broken JSON and repair failed.")
        output = safe_json_loads(repaired)

    # ---- If model forgets some departments -> deterministic fix ----
    if "timetables" not in output or not isinstance(output["timetables"], list):
        output["timetables"] = []

    # Ensure all departments exist across generated sessions
    # We build our own deterministic schedule if missing/empty
    if len(output["timetables"]) == 0:
        output["timetables"] = []

    # Determine max exams count among departments
    max_len = max(len(v) for v in normalized.values())
    dates = make_alternate_day_dates(max_len, start_date=start_date)

    # Deterministic generation (ensures all depts appear)
    final_sessions = []
    for i in range(max_len):
        session_date = dates[i]
        allocations = {room: [] for room in ROOMS.keys()}

        # For each dept, schedule i-th subject if exists
        for dept, subjects in normalized.items():
            if i < len(subjects):
                subject_name = subjects[i]

                # Assign year (simple round-robin: 1->2->3->1...)
                year = str((i % 3) + 1)

                dept_alloc = allocate_students_for_exam(dept, year, subject_name)

                # Merge allocations into global allocations
                for room, items in dept_alloc.items():
                    allocations[room].extend(items)

        final_sessions.append({
            "date": session_date,
            "time": DEFAULT_TIME_SLOT,
            "allocations": allocations
        })

    output = {"timetables": final_sessions}
    return output
