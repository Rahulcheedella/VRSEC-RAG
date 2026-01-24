import os
import io
import re
import json
import base64
import random
import datetime
from typing import Dict, Literal, List, Any, Optional

import requests
import torch
from dotenv import load_dotenv
from pypdf import PdfReader

from flask import Flask, request, jsonify, send_file
from flask_cors import CORS

# -------------------- LangChain + Chroma --------------------
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.vectorstores import Chroma

from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnableLambda, RunnablePassthrough
from langchain_core.output_parsers import StrOutputParser
from langchain_core.documents import Document


# ============================================================
# LOAD ENV
# ============================================================
load_dotenv()


# ============================================================
# CONFIG (config.py merged)
# ============================================================
# ---- Bhashini Config ----
USER_ID = os.getenv("USER_ID", "e98a6b8b96ef4d88811ae4a1a238e983")
ULCA_API_KEY = os.getenv("ULCA_API_KEY", "58c1c8d5a0-88f9-4e72-89fc-fc3b0ce428e0")
PIPELINE_ID = os.getenv("PIPELINE_ID", "64392f96daac500b55c543cd")

BHASHINI_HEADERS = {
    "userID": USER_ID,
    "ulcaApiKey": ULCA_API_KEY,
    "Content-Type": "application/json"
}

# ---- RAG Config ----
VECTORDB_DIR = os.getenv("VECTORDB_DIR", "storage/vectordb")
LLM_API_URL = os.getenv("LLM_API_URL")  # Example: http://218.248.4.106:8000/infer
EMBEDDING_MODEL = os.getenv("EMBEDDING_MODEL", "sentence-transformers/all-MiniLM-L6-v2")
RAG_TOP_K = int(os.getenv("RAG_TOP_K", "5"))

# ---- Timetable Config ----
PDF_PATH = os.getenv("TIMETABLE_PDF_PATH", "data/vrsec exam time table.pdf")
DEFAULT_TIME_SLOT = "10:00 AM to 01:00 PM"

ROOMS = {
    "Room-1": 70,
    "Room-2": 70,
    "Room-3": 70,
    "Room-4": 70,
    "Room-5": 70,
}

DEPT_INTAKE = {
    "CSE": 120,
    "ECE": 120,
    "MEC": 120,
    "CIVIL": 120
}

YEAR_DISTRIBUTION = {
    "1": 40,
    "2": 40,
    "3": 40
}


# ============================================================
# BHASHINI (bhashini.py merged)
# ============================================================
def get_pipeline(task_type, source_lang, target_lang=None):
    payload = {
        "pipelineTasks": [{
            "taskType": task_type,
            "config": {
                "language": {
                    "sourceLanguage": source_lang
                }
            }
        }],
        "pipelineRequestConfig": {
            "pipelineId": PIPELINE_ID
        }
    }

    if target_lang:
        payload["pipelineTasks"][0]["config"]["language"]["targetLanguage"] = target_lang

    res = requests.post(
        "https://meity-auth.ulcacontrib.org/ulca/apis/v0/model/getModelsPipeline",
        json=payload,
        headers=BHASHINI_HEADERS
    )

    return res.json()


# ============================================================
# RAG ROUTER (rag_router.py merged)
# ============================================================
Domain = Literal["college", "cse", "ece", "mec"]
CHAIN_CACHE: Dict[str, object] = {}
EMBEDDINGS_CACHE = None


def get_embeddings():
    global EMBEDDINGS_CACHE
    if EMBEDDINGS_CACHE is None:
        EMBEDDINGS_CACHE = HuggingFaceEmbeddings(model_name=EMBEDDING_MODEL)
    return EMBEDDINGS_CACHE


def remote_llm_call(prompt: str) -> str:
    """
    Calls GPU Server LLM API: POST /infer
    """
    if not LLM_API_URL:
        raise ValueError("LLM_API_URL not found in .env file. Add: LLM_API_URL=http://<server>:8000/infer")

    res = requests.post(
        LLM_API_URL,
        json={
            "prompt": prompt,
            "max_new_tokens": 200
        },
        timeout=120
    )

    if res.status_code != 200:
        raise RuntimeError(f"LLM Server error: {res.status_code} - {res.text}")

    data = res.json()
    return data.get("response", "").strip()


def load_retriever(domain: Domain):
    persist_dir = os.path.join(VECTORDB_DIR, domain)

    if not os.path.exists(persist_dir):
        raise FileNotFoundError(
            f"Vector DB for '{domain}' not found at {persist_dir}. Run ingest.py first."
        )

    vectordb = Chroma(
        persist_directory=persist_dir,
        embedding_function=get_embeddings(),
        collection_name=f"vrsec_{domain}"
    )

    return vectordb.as_retriever(search_kwargs={"k": RAG_TOP_K})


def format_docs(docs: List[Document]) -> str:
    if not docs:
        return ""
    return "\n\n".join([f"[Doc{i+1}] {d.page_content}" for i, d in enumerate(docs)])


def build_domain_chain(domain: Domain):
    retriever = load_retriever(domain)

    rag_prompt = ChatPromptTemplate.from_messages([
        ("system",
         f"You are VRSEC {domain.upper()} Assistant.\n\n"
         "You are a retrieval-augmented assistant.\n"
         "You MUST answer ONLY using the provided CONTEXT.\n\n"
         "STRICT RULES:\n"
         "2) Do NOT guess, do NOT assume, do NOT use outside knowledge.\n"
         "3) If multiple points exist, answer in 3-6 bullet points.\n"
         "4) If the question is unclear, ask 1 short clarification question.\n"
         "5) Keep response short and factual.\n"
         "6) If the context contains information directly OR indirectly relavant, you MUST answer.\n"
         "7) You are allowed to infer obivious facts.\n"
         "8) There is no need to give the exact sentence matches to the answer.\n"
         "9) If the question is short OR vague, interpret it in the most reasonable way using the context. "
         "If it is really unrelated, only then answer:\n"
         "\"I don't have enough information in the provided college data to answer that.\"\n"
         ),
        ("human",
         "CONTEXT:\n{context}\n\n"
         "QUESTION:\n{question}\n\n"
         "FINAL ANSWER:")
    ])

    chain = (
        {
            "question": RunnablePassthrough(),
            "context": retriever | RunnableLambda(format_docs),
        }
        | rag_prompt
        | RunnableLambda(lambda prompt_value: remote_llm_call(prompt_value.to_string()))
        | StrOutputParser()
    )

    return chain


def get_chain(domain: Domain):
    if domain in CHAIN_CACHE:
        return CHAIN_CACHE[domain]

    chain = build_domain_chain(domain)
    CHAIN_CACHE[domain] = chain
    return chain


# ============================================================
# TIMETABLE (rag_timetable.py merged)
# ============================================================
def extract_pdf_text(pdf_path: str, max_pages: int = 4) -> str:
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
    if not pdf_text:
        return "No PDF examples available."

    return (
        "FEW-SHOT STYLE REFERENCE (from previous VRSEC exam timetables):\n"
        "Use this ONLY for structure, date formatting, and professional formatting.\n"
        "Do NOT copy subject names from here unless they match the input.\n\n"
        f"{pdf_text}\n"
    )


def make_alternate_day_dates(n: int, start_date: Optional[str] = None) -> List[str]:
    if start_date:
        base = datetime.datetime.strptime(start_date, "%Y-%m-%d").date()
    else:
        base = datetime.date.today() + datetime.timedelta(days=random.randint(3, 10))

    dates = []
    for i in range(n):
        d = base + datetime.timedelta(days=i * 2)
        dates.append(d.strftime("%Y-%m-%d"))
    return dates


def extract_json_block(text: str) -> str:
    match = re.search(r"\{[\s\S]*\}", text)
    if not match:
        return ""
    return match.group(0).strip()


def call_llm(prompt: str, temperature: float = 0.2, top_p: float = 0.9, max_new_tokens: int = 1200) -> str:
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
    return json.loads(json_text)


def allocate_students_for_exam(dept: str, year: str, subject: str) -> Dict[str, List[Dict[str, Any]]]:
    total_students = YEAR_DISTRIBUTION[year]
    room_names = list(ROOMS.keys())

    allocations = {room: [] for room in room_names}

    base = total_students // len(room_names)
    extra = total_students % len(room_names)

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


def build_prompt(input_subjects: Dict[str, List[str]], start_date: str, pdf_fewshot: str) -> str:
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


def generate_timetable(input_subjects: Dict[str, List[str]], start_date: Optional[str] = None) -> Dict[str, Any]:
    normalized = {k.upper(): v for k, v in input_subjects.items()}

    if not start_date:
        start_date = make_alternate_day_dates(1)[0]

    pdf_text = extract_pdf_text(PDF_PATH, max_pages=4)
    fewshot = build_fewshot_block(pdf_text)

    prompt = build_prompt(normalized, start_date, fewshot)

    raw = call_llm(prompt, temperature=0.15, top_p=0.9, max_new_tokens=1400)
    json_text = extract_json_block(raw)

    if not json_text:
        raise ValueError("Model did not return JSON output.")

    try:
        output = safe_json_loads(json_text)
    except Exception:
        repaired = repair_json_with_llm(json_text)
        if not repaired:
            raise ValueError("Model returned broken JSON and repair failed.")
        output = safe_json_loads(repaired)

    max_len = max(len(v) for v in normalized.values())
    dates = make_alternate_day_dates(max_len, start_date=start_date)

    final_sessions = []
    for i in range(max_len):
        session_date = dates[i]
        allocations = {room: [] for room in ROOMS.keys()}

        for dept, subjects in normalized.items():
            if i < len(subjects):
                subject_name = subjects[i]
                year = str((i % 3) + 1)

                dept_alloc = allocate_students_for_exam(dept, year, subject_name)
                for room, items in dept_alloc.items():
                    allocations[room].extend(items)

        final_sessions.append({
            "date": session_date,
            "time": DEFAULT_TIME_SLOT,
            "allocations": allocations
        })

    return {"timetables": final_sessions}


# ============================================================
# FLASK APP (ALL ROUTES)
# ============================================================
app = Flask(__name__)
CORS(app)  # dev mode allow all origins


@app.route("/", methods=["GET"])
def home():
    return jsonify({
        "message": "VRSEC Backend Running (Single File)",
        "endpoints": {
            "health": "/health (GET)",
            "system_info": "/system/info (GET)",
            "rag_chat": "/rag/<domain>/chat (POST)",
            "bhashini_asr_upload": "/bhashini/asr/upload (POST form-data)",
            "bhashini_nmt": "/bhashini/nmt (POST JSON)",
            "bhashini_tts_audio": "/bhashini/tts/audio (POST JSON)",
            "speech_to_telugu_audio": "/bhashini/speech-to-telugu/audio (POST form-data)",
            "timetable_generate": "/timetable/generate (POST JSON)"
        }
    })


@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"})


@app.route("/system/info", methods=["GET"])
def system_info():
    return jsonify({
        "cuda_available": torch.cuda.is_available(),
        "device": "cuda" if torch.cuda.is_available() else "cpu",
        "gpu_name": torch.cuda.get_device_name(0) if torch.cuda.is_available() else None
    })


# -----------------------------
# RAG CHAT
# -----------------------------
@app.route("/rag/<domain>/chat", methods=["POST"])
def rag_chat_api(domain):
    data = request.get_json()
    if not data or "question" not in data:
        return jsonify({"error": "Missing 'question' in request body"}), 400

    question = data["question"].strip()
    if not question:
        return jsonify({"error": "Question cannot be empty"}), 400

    try:
        chain = get_chain(domain)
        answer = chain.invoke(question)
        return jsonify({"domain": domain, "question": question, "answer": answer})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# -----------------------------
# TIMETABLE
# -----------------------------
@app.route("/timetable/generate", methods=["POST"])
def timetable_generate_api():
    data = request.get_json()
    if not data:
        return jsonify({"error": "Missing JSON body"}), 400

    start_date = data.pop("start_date", None)

    if len(data) == 0:
        return jsonify({"error": "Provide departments with subjects"}), 400

    try:
        output = generate_timetable(data, start_date=start_date)
        return jsonify(output)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# -----------------------------
# BHASHINI: ASR upload
# -----------------------------
@app.route("/bhashini/asr/upload", methods=["POST"])
def bhashini_asr_upload_api():
    try:
        if "audio" not in request.files:
            return jsonify({"error": "Missing audio file. Use form-data key: audio"}), 400

        audio_file = request.files["audio"]
        audio_bytes = audio_file.read()

        audio_b64 = base64.b64encode(audio_bytes).decode("utf-8")

        asr_pipe = get_pipeline("asr", "en")
        endpoint = asr_pipe["pipelineInferenceAPIEndPoint"]

        payload = {
            "pipelineTasks": [{
                "taskType": "asr",
                "config": {
                    "language": {"sourceLanguage": "en"},
                    "serviceId": asr_pipe["pipelineResponseConfig"][0]["config"][0]["serviceId"],
                    "audioFormat": "wav",
                    "samplingRate": 16000
                }
            }],
            "inputData": {
                "audio": [{
                    "audioContent": audio_b64
                }]
            }
        }

        res = requests.post(
            endpoint["callbackUrl"],
            json=payload,
            headers={"Authorization": endpoint["inferenceApiKey"]["value"]}
        ).json()

        english_text = (
            res.get("output", [{}])[0].get("source")
            or res.get("pipelineResponse", [{}])[0].get("output", [{}])[0].get("source")
        )

        return jsonify({"englishText": english_text})

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# -----------------------------
# BHASHINI: NMT (en -> te)
# -----------------------------
@app.route("/bhashini/nmt", methods=["POST"])
def bhashini_nmt_api():
    try:
        data = request.get_json()
        if not data or "text" not in data:
            return jsonify({"error": "Missing 'text' in request body"}), 400

        text = data["text"]

        nmt_pipe = get_pipeline("translation", "en", "te")
        endpoint = nmt_pipe["pipelineInferenceAPIEndPoint"]

        payload = {
            "pipelineTasks": [{
                "taskType": "translation",
                "config": {
                    "language": {"sourceLanguage": "en", "targetLanguage": "te"},
                    "serviceId": nmt_pipe["pipelineResponseConfig"][0]["config"][0]["serviceId"]
                }
            }],
            "inputData": {
                "input": [{
                    "source": text
                }]
            }
        }

        res = requests.post(
            endpoint["callbackUrl"],
            json=payload,
            headers={"Authorization": endpoint["inferenceApiKey"]["value"]}
        ).json()

        telugu_text = (
            res.get("output", [{}])[0].get("target")
            or res.get("pipelineResponse", [{}])[0].get("output", [{}])[0].get("target")
        )

        return jsonify({
            "englishText": text,
            "teluguText": telugu_text
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# -----------------------------
# BHASHINI: TTS (text -> audio)
# -----------------------------
@app.route("/bhashini/tts/audio", methods=["POST"])
def bhashini_tts_audio_api():
    try:
        data = request.get_json()
        if not data or "text" not in data:
            return jsonify({"error": "Missing 'text' in request body"}), 400

        text = data["text"]

        tts_pipe = get_pipeline("tts", "en")
        endpoint = tts_pipe["pipelineInferenceAPIEndPoint"]

        payload = {
            "pipelineTasks": [{
                "taskType": "tts",
                "config": {
                    "language": {"sourceLanguage": "en"},
                    "serviceId": tts_pipe["pipelineResponseConfig"][0]["config"][0]["serviceId"],
                    "gender": "female",
                    "samplingRate": 16000
                }
            }],
            "inputData": {
                "input": [{
                    "source": text
                }]
            }
        }

        res = requests.post(
            endpoint["callbackUrl"],
            json=payload,
            headers={"Authorization": endpoint["inferenceApiKey"]["value"]}
        ).json()

        audio_b64 = (
            res.get("audio", [{}])[0].get("audioContent")
            or res.get("pipelineResponse", [{}])[0].get("audio", [{}])[0].get("audioContent")
        )

        if not audio_b64:
            return jsonify({"error": "No audio returned from Bhashini TTS"}), 500

        audio_bytes = base64.b64decode(audio_b64)

        return send_file(
            io.BytesIO(audio_bytes),
            mimetype="audio/wav",
            as_attachment=False,
            download_name="tts_output.wav"
        )

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# -----------------------------
# BHASHINI: FULL PIPELINE (speech -> ASR -> NMT -> TTS)
# -----------------------------
@app.route("/bhashini/speech-to-telugu/audio", methods=["POST"])
def speech_to_telugu_audio_api():
    try:
        if "audio" not in request.files:
            return jsonify({"error": "Missing audio file. Use form-data key: audio"}), 400

        audio_file = request.files["audio"]
        audio_bytes = audio_file.read()
        audio_b64 = base64.b64encode(audio_bytes).decode("utf-8")

        # ---------- ASR ----------
        asr_pipe = get_pipeline("asr", "en")
        endpoint = asr_pipe["pipelineInferenceAPIEndPoint"]

        asr_payload = {
            "pipelineTasks": [{
                "taskType": "asr",
                "config": {
                    "language": {"sourceLanguage": "en"},
                    "serviceId": asr_pipe["pipelineResponseConfig"][0]["config"][0]["serviceId"],
                    "audioFormat": "wav",
                    "samplingRate": 16000
                }
            }],
            "inputData": {"audio": [{"audioContent": audio_b64}]}
        }

        asr_res = requests.post(
            endpoint["callbackUrl"],
            json=asr_payload,
            headers={"Authorization": endpoint["inferenceApiKey"]["value"]}
        ).json()

        english_text = (
            asr_res.get("output", [{}])[0].get("source")
            or asr_res.get("pipelineResponse", [{}])[0].get("output", [{}])[0].get("source")
        )

        if not english_text:
            return jsonify({"error": "ASR failed to extract text"}), 500

        # ---------- NMT ----------
        nmt_pipe = get_pipeline("translation", "en", "te")
        endpoint = nmt_pipe["pipelineInferenceAPIEndPoint"]

        nmt_payload = {
            "pipelineTasks": [{
                "taskType": "translation",
                "config": {
                    "language": {"sourceLanguage": "en", "targetLanguage": "te"},
                    "serviceId": nmt_pipe["pipelineResponseConfig"][0]["config"][0]["serviceId"]
                }
            }],
            "inputData": {"input": [{"source": english_text}]}
        }

        nmt_res = requests.post(
            endpoint["callbackUrl"],
            json=nmt_payload,
            headers={"Authorization": endpoint["inferenceApiKey"]["value"]}
        ).json()

        telugu_text = (
            nmt_res.get("output", [{}])[0].get("target")
            or nmt_res.get("pipelineResponse", [{}])[0].get("output", [{}])[0].get("target")
        )

        if not telugu_text:
            return jsonify({"error": "Translation failed"}), 500

        # ---------- TTS ----------
        tts_pipe = get_pipeline("tts", "te")
        endpoint = tts_pipe["pipelineInferenceAPIEndPoint"]

        tts_payload = {
            "pipelineTasks": [{
                "taskType": "tts",
                "config": {
                    "language": {"sourceLanguage": "te"},
                    "serviceId": tts_pipe["pipelineResponseConfig"][0]["config"][0]["serviceId"],
                    "gender": "female",
                    "samplingRate": 16000
                }
            }],
            "inputData": {"input": [{"source": telugu_text}]}
        }

        tts_res = requests.post(
            endpoint["callbackUrl"],
            json=tts_payload,
            headers={"Authorization": endpoint["inferenceApiKey"]["value"]}
        ).json()

        audio_b64_out = (
            tts_res.get("audio", [{}])[0].get("audioContent")
            or tts_res.get("pipelineResponse", [{}])[0].get("audio", [{}])[0].get("audioContent")
        )

        if not audio_b64_out:
            return jsonify({"error": "TTS failed to return audio"}), 500

        audio_out_bytes = base64.b64decode(audio_b64_out)

        return send_file(
            io.BytesIO(audio_out_bytes),
            mimetype="audio/wav",
            as_attachment=False,
            download_name="speech_to_telugu.wav"
        )

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ============================================================
# RUN SERVER
# ============================================================
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)