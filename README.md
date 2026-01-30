
# 🎓 VRSEC Personal ChatBot – Backend

A unified **AI-powered backend system** for VRSEC that provides:

- 🤖 **RAG-based College ChatBot**
- 🎤 **Speech-to-Text (ASR)**
- 🌐 **English ↔ Telugu Translation (NMT)**
- 🔊 **Text-to-Speech (TTS)**
- 🗣️ **Speech → Telugu Audio Pipeline**
- 📅 **AI-based Exam Timetable Generator**

Built using **Flask**, **LangChain**, **LLMs**, and **Bhashini APIs**, with optional **GPU acceleration**.

---

## 🚀 Features Overview

### 1️⃣ RAG ChatBot (Domain-wise)
Ask questions related to:
- `college`
- `cse`
- `ece`
- `mec`

Uses **Retrieval Augmented Generation (RAG)** with vector databases and a GPU-hosted LLM.

---

### 2️⃣ Speech & Language Services (Bhashini)

| Feature | Description |
|------|------------|
| ASR | Audio → English text |
| NMT | English → Telugu translation |
| TTS | Text → WAV audio |
| Full Pipeline | Audio → Telugu Audio |

---

### 3️⃣ Exam Timetable Generator
Generates **non-colliding, rule-based exam timetables** using AI.

- Department-wise subjects
- Alternate-day exams
- Room allocation
- Capacity handling
- Few-shot prompting using previous timetable PDFs

---

## 🧠 System Architecture (High Level)

```

Client (Web / Postman)
|
v
Flask API
|
|-- RAG Router (LangChain + VectorDB + LLM)
|
|-- Bhashini APIs (ASR / NMT / TTS)
|
|-- Exam Timetable Generator (LLM + Constraints)

```

---

## 🛠️ Tech Stack

- **Backend**: Flask
- **LLM Orchestration**: LangChain
- **Vector DB**: ChromaDB
- **Embeddings**: sentence-transformers
- **Speech APIs**: Bhashini
- **GPU Support**: PyTorch (CUDA)
- **PDF Parsing**: PyPDF
- **Deployment Ready**: REST APIs

---

## 📦 Project Structure

```

project-root/
│
├── app.py                     # Main unified Flask app
├── rag_router.py              # RAG logic (retrieval + LLM)
├── rag_timetable.py           # Exam timetable generator
├── bhashini.py                # Bhashini pipeline config
├── vectordb/                  # Vector databases (domain-wise)
├── data/
│   └── vrsec_exam_time_table.pdf
├── .env                       # Environment variables
└── README.md

````

---

## ⚙️ Environment Setup

### 1️⃣ Create Virtual Environment
```bash
python -m venv venv
source venv/bin/activate   # Linux / Mac
venv\Scripts\activate      # Windows
````

---

### 2️⃣ Install Dependencies

```bash
pip install flask flask-cors requests torch
pip install langchain langchain-community langchain-huggingface
pip install chromadb sentence-transformers pypdf python-dotenv
```

---

### 3️⃣ Environment Variables (`.env`)

```env
LLM_API_URL=http://<GPU_SERVER_IP>:8000/infer
```

---

## ▶️ Run the Server

```bash
python app.py
```

Server runs on:

```
http://0.0.0.0:5000
```

---

## 🔍 API Endpoints

### 🩺 Health & System

| Method | Endpoint       | Description   |
| ------ | -------------- | ------------- |
| GET    | `/health`      | Server health |
| GET    | `/system/info` | GPU/CPU info  |

---

### 🤖 RAG ChatBot

| Method | Endpoint        |
| ------ | --------------- |
| POST   | `/chat/college` |
| POST   | `/chat/cse`     |
| POST   | `/chat/ece`     |
| POST   | `/chat/mec`     |

**Request**

```json
{
  "question": "What are the facilities in CSE?"
}
```

---

### 🎤 ASR (Speech → Text)

| POST | `/bhashini/asr/upload` |

* Form-data key: `audio`

---

### 🌐 Translation (English → Telugu)

| POST | `/bhashini/nmt` |

```json
{
  "text": "Hello students"
}
```

---

### 🔊 Text to Speech

| POST | `/bhashini/tts/audio` |

```json
{
  "text": "Welcome to VRSEC"
}
```

---

### 🗣️ Speech → Telugu Audio

| POST | `/bhashini/speech-to-telugu/audio` |

* Form-data key: `audio`

---

### 📅 Exam Timetable Generator

| POST | `/generate` |

**Input**

```json
{
  "CSE": ["DSA", "OS", "DBMS", "DAA"],
  "ECE": ["Signals", "VLSI", "EM"],
  "MEC": ["Thermodynamics", "Manufacturing"],
  "Civil": ["Structures", "Hydraulics"],
  "start_date": "2026-02-02"
}
```

**Output**

* Date-wise
* Room-wise allocations
* Roll number ranges
* Capacity aware
* Strict JSON

---

## ⚠️ Known Limitations & Fixes

### Telugu responses getting cut?

👉 Increase `max_new_tokens` in your GPU `infer.py`:

```python
max_new_tokens=512 or 1024
```

👉 Ensure your LLM does **not stop on newline or language tokens**.

---

## 🔐 Best Practices Used

* Strict JSON validation
* Retry + correction logic
* Constraint validation
* Few-shot prompting from PDFs
* Domain isolation
* GPU-safe inference calls

---

## 📈 Future Enhancements

* Streaming responses
* WebSocket chat
* User authentication
* Admin timetable overrides
* Multi-language chatbot
* Frontend dashboard

---

## 👨‍💻 Author

**VRSEC AI Backend Project**
Designed & implemented as a **production-grade AI system** combining **RAG + Speech + Planning AI**.

---


