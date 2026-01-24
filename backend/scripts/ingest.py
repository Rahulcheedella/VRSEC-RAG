import os
from typing import List, Dict

from dotenv import load_dotenv
load_dotenv()

from langchain_community.document_loaders import JSONLoader, PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.vectorstores import Chroma


# =========================
# CONFIG (Enterprise Style)
# =========================
STORAGE_DIR = os.getenv("STORAGE_DIR", "storage")
DATA_DIR = os.getenv("DATA_DIR", os.path.join(STORAGE_DIR, "data"))
VECTORDB_DIR = os.getenv("VECTORDB_DIR", os.path.join(STORAGE_DIR, "vectordb"))

EMBEDDING_MODEL = os.getenv(
    "EMBEDDING_MODEL",
    "sentence-transformers/all-MiniLM-L6-v2"
)

CHUNK_SIZE = int(os.getenv("CHUNK_SIZE", "900"))
CHUNK_OVERLAP = int(os.getenv("CHUNK_OVERLAP", "180"))


# =========================
# DOMAIN FILES
# =========================
DOMAINS: Dict[str, str] = {
    "college": os.path.join(DATA_DIR, "college.pdf"),
    "cse": os.path.join(DATA_DIR, "cse_data.pdf"),
    "ece": os.path.join(DATA_DIR, "ece_data.pdf"),
    "mec": os.path.join(DATA_DIR, "mec_data.pdf"),
}


# =========================
# LOAD DOCUMENTS
# =========================
def load_docs(domain: str, file_path: str) -> List:
    """
    Loads either PDF or JSON into LangChain Documents.
    """
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"[INGEST] Missing file for {domain}: {file_path}")

    ext = os.path.splitext(file_path)[1].lower()

    if ext == ".pdf":
        loader = PyPDFLoader(file_path)
        docs = loader.load()

    elif ext == ".json":
        loader = JSONLoader(
            file_path=file_path,
            jq_schema=".[]",  # adjust if nested JSON
            text_content=False
        )
        docs = loader.load()

    else:
        raise ValueError(f"[INGEST] Unsupported file type for {domain}: {ext}")

    # Add metadata
    for d in docs:
        d.metadata["domain"] = domain
        d.metadata["source_file"] = os.path.basename(file_path)

    return docs


# =========================
# CHUNK DOCUMENTS
# =========================
def chunk_documents(docs: List):
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=CHUNK_SIZE,
        chunk_overlap=CHUNK_OVERLAP,
        separators=["\n\n", "\n", ".", " ", ""]
    )
    return splitter.split_documents(docs)


# =========================
# BUILD VECTORDB
# =========================
def build_chroma_index(domain: str, docs: List, embeddings, persist_dir: str):
    os.makedirs(persist_dir, exist_ok=True)

    vectordb = Chroma.from_documents(
        documents=docs,
        embedding=embeddings,
        persist_directory=persist_dir,
        collection_name=f"vrsec_{domain}"
    )

    # Persist to disk
    vectordb.persist()
    return vectordb


# =========================
# MAIN
# =========================
def main():
    print("======================================")
    print(" VRSEC-RAG Ingestion (EA Architecture) ")
    print("======================================")
    print(f"[CONFIG] STORAGE_DIR  : {STORAGE_DIR}")
    print(f"[CONFIG] DATA_DIR     : {DATA_DIR}")
    print(f"[CONFIG] VECTORDB_DIR : {VECTORDB_DIR}")
    print(f"[CONFIG] MODEL        : {EMBEDDING_MODEL}")
    print("======================================\n")

    embeddings = HuggingFaceEmbeddings(model_name=EMBEDDING_MODEL)

    for domain, file_path in DOMAINS.items():
        print(f"\n[INGEST] Domain: {domain.upper()}")
        print(f"[INGEST] File  : {file_path}")

        raw_docs = load_docs(domain, file_path)
        print(f"[INGEST] Loaded docs: {len(raw_docs)}")

        chunks = chunk_documents(raw_docs)
        print(f"[INGEST] Chunks created: {len(chunks)}")

        persist_dir = os.path.join(VECTORDB_DIR, domain)
        build_chroma_index(domain, chunks, embeddings, persist_dir)

        print(f"[INGEST] Vector DB saved at: {persist_dir}")

    print("\n✅ Ingestion completed for all domains.")


if __name__ == "__main__":
    main()