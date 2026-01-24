import os
import requests
from typing import Dict, Literal

from dotenv import load_dotenv
load_dotenv()

from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.vectorstores import Chroma

from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnableLambda, RunnablePassthrough
from langchain_core.output_parsers import StrOutputParser
from langchain_core.documents import Document


VECTORDB_DIR = "storage/vectordb"

# Your GPU server inference API
LLM_API_URL = os.getenv("LLM_API_URL")  # Example: http://218.248.4.106:8000/infer

Domain = Literal["college", "cse", "ece", "mec"]

CHAIN_CACHE: Dict[str, object] = {}


# ----------------------------
# 1) Remote LLM caller (GPU server)
# ----------------------------
def remote_llm_call(prompt: str) -> str:
    """
    Calls GPU Server LLM API: POST /infer
    Input: prompt string
    Output: response string
    """
    if not LLM_API_URL:
        raise ValueError("LLM_API_URL not found in .env file. Add: LLM_API_URL=http://<server>:8000/infer")

    res = requests.post(
        LLM_API_URL,
        json={"prompt": prompt,
            "max_new_tokens": 200
        },
        timeout=120
    )

    if res.status_code != 200:
        raise RuntimeError(f"LLM Server error: {res.status_code} - {res.text}")

    data = res.json()
    return data.get("response", "").strip()


# ----------------------------
# 2) Retriever Loader
# ----------------------------
def load_retriever(domain: Domain):
    embeddings = HuggingFaceEmbeddings(
        model_name="sentence-transformers/all-MiniLM-L6-v2"
    )

    persist_dir = os.path.join(VECTORDB_DIR, domain)
    if not os.path.exists(persist_dir):
        raise FileNotFoundError(
            f"Vector DB for '{domain}' not found at {persist_dir}. Run ingest.py first."
        )

    vectordb = Chroma(
        persist_directory=persist_dir,
        embedding_function=embeddings,
        collection_name=f"vrsec_{domain}"
    )

    return vectordb.as_retriever(search_kwargs={"k": 5})


def format_docs(docs: list[Document]) -> str:
    if not docs:
        return ""
    return "\n\n".join([f"[Doc{i+1}] {d.page_content}" for i, d in enumerate(docs)])


# ----------------------------
# 3) Build domain chain (RAG + remote LLM)
# ----------------------------
def build_domain_chain(domain: Domain):
    retriever = load_retriever(domain)

    # rag_prompt = ChatPromptTemplate.from_messages([
    #     ("system",
    #      f"You are VRSEC {domain.upper()} Assistant.\n"
    #      "You MUST answer ONLY using the provided CONTEXT.\n\n"
    #      "STRICT RULES:\n"
    #      "- If the answer is not present in the context, reply exactly:\n"
    #      "\"I don't have enough information in the provided college data to answer that.\"\n"
    #      "- Do NOT guess.\n"
    #      "- Do NOT use outside knowledge.\n"
    #      "- Keep answers short, clear, and factual.\n"
    #     ),
    #     ("human",
    #      "CONTEXT:\n{context}\n\n"
    #      "QUESTION:\n{question}\n\n"
    #      "Answer:")
    # ])

    rag_prompt = ChatPromptTemplate.from_messages([
        ("system",
         f"You are VRSEC {domain.upper()} Assistant.\n\n"
         "You are a retrieval-augmented assistant.\n"
         "You MUST answer ONLY using the provided CONTEXT.\n\n"
         "STRICT RULES:\n"
        #  "1) If the answer is not explicitly present in CONTEXT, reply exactly:\n"
        #  "\"I don't have enough information in the provided college data to answer that.\"\n"
         "2) Do NOT guess, do NOT assume, do NOT use outside knowledge.\n"
         "3) If multiple points exist, answer in 3-6 bullet points.\n"
         "4) If the question is unclear, ask 1 short clarification question.\n"
         "5) Keep response short and factual.\n"
         "6) If the context contains information directly OR indirectly relavant, you MUST answer.\n"
         "7) You are allowed to infer obivious facts.\n"
         "8) There is no need to give the exact sentence matches to the answer.\n"
         "9) If the question is short OR vague, interpret it in the most reasonable way using the context. If it is really unrelated, only then answer:\n"
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


# ----------------------------
# 4) Cached getter (same function name)
# ----------------------------
def get_chain(domain: Domain):
    if domain in CHAIN_CACHE:
        return CHAIN_CACHE[domain]

    chain = build_domain_chain(domain)
    CHAIN_CACHE[domain] = chain
    return chain

# import os
# import requests
# from typing import Dict, Literal, List

# from dotenv import load_dotenv
# load_dotenv()

# from langchain_huggingface import HuggingFaceEmbeddings
# from langchain_community.vectorstores import Chroma

# from langchain_core.prompts import ChatPromptTemplate
# from langchain_core.runnables import RunnableLambda, RunnablePassthrough
# from langchain_core.output_parsers import StrOutputParser
# from langchain_core.documents import Document


# # =========================
# # CONFIG
# # =========================
# VECTORDB_DIR = "vectordb"

# # Example: http://218.248.4.106:8000/infer  OR  http://127.0.0.1:8000/infer
# LLM_API_URL = os.getenv("LLM_API_URL")

# Domain = Literal["college", "cse", "ece", "mec"]

# CHAIN_CACHE: Dict[str, object] = {}

# # Generation defaults (remote LLM)
# DEFAULT_TEMP = float(os.getenv("LLM_TEMPERATURE", "0.2"))
# DEFAULT_TOP_P = float(os.getenv("LLM_TOP_P", "0.9"))
# DEFAULT_MAX_TOKENS = int(os.getenv("LLM_MAX_NEW_TOKENS", "180"))

# # Retrieval defaults
# TOP_K = int(os.getenv("RETRIEVER_TOP_K", "5"))


# # =========================
# # 1) Remote LLM caller (GPU server)
# # =========================
# def remote_llm_call(prompt: str,
#                     temperature: float = DEFAULT_TEMP,
#                     top_p: float = DEFAULT_TOP_P,
#                     max_new_tokens: int = DEFAULT_MAX_TOKENS) -> str:
#     """
#     Calls GPU Server LLM API: POST /infer
#     Input: prompt string
#     Output: response string
#     """
#     if not LLM_API_URL:
#         raise ValueError(
#             "LLM_API_URL not found in .env file. Add:\n"
#             "LLM_API_URL=http://<server>:8000/infer"
#         )

#     payload = {
#         "prompt": prompt,
#         "temperature": temperature,
#         "top_p": top_p,
#         "max_new_tokens": max_new_tokens
#     }

#     res = requests.post(LLM_API_URL, json=payload, timeout=180)

#     if res.status_code != 200:
#         raise RuntimeError(f"LLM Server error: {res.status_code} - {res.text}")

#     data = res.json()
#     return (data.get("response") or "").strip()


# # =========================
# # 2) Retriever Loader
# # =========================
# def load_retriever(domain: Domain):
#     embeddings = HuggingFaceEmbeddings(
#         model_name="sentence-transformers/all-MiniLM-L6-v2"
#     )

#     persist_dir = os.path.join(VECTORDB_DIR, domain)
#     if not os.path.exists(persist_dir):
#         raise FileNotFoundError(
#             f"Vector DB for '{domain}' not found at {persist_dir}. Run ingest.py first."
#         )

#     vectordb = Chroma(
#         persist_directory=persist_dir,
#         embedding_function=embeddings,
#         collection_name=f"vrsec_{domain}"
#     )

#     return vectordb.as_retriever(search_kwargs={"k": TOP_K})


# def format_docs(docs: List[Document]) -> str:
#     """
#     Clean context formatting to reduce noise and improve answer accuracy.
#     """
#     if not docs:
#         return ""

#     blocks = []
#     for i, d in enumerate(docs, start=1):
#         src = d.metadata.get("source", "unknown")
#         page = d.metadata.get("page", "")
#         blocks.append(
#             f"[Doc {i} | source={src} | page={page}]\n{d.page_content.strip()}"
#         )
#     return "\n\n".join(blocks)


# # =========================
# # 3) Optional: Query rewriting (improves retrieval)
# # =========================
# rewrite_prompt = ChatPromptTemplate.from_messages([
#     ("system",
#      "You are a query rewriter for a college information chatbot.\n"
#      "Rewrite the user question into a short, clear search query.\n"
#      "Do NOT answer the question.\n"
#      "Return only the rewritten query."
#     ),
#     ("human", "{question}")
# ])


# def rewrite_question(question: str) -> str:
#     """
#     Uses remote LLM to rewrite the query for better retrieval.
#     Uses very low temperature for stability.
#     """
#     prompt_val = rewrite_prompt.invoke({"question": question})
#     rewritten = remote_llm_call(prompt_val.to_string(), temperature=0.0, top_p=1.0, max_new_tokens=40)
#     return rewritten.strip() if rewritten else question


# # =========================
# # 4) Build domain chain (RAG + remote LLM)
# # =========================
# def build_domain_chain(domain: Domain):
#     retriever = load_retriever(domain)

#     # ⭐ Better RAG prompt for accuracy + refusal
#     rag_prompt = ChatPromptTemplate.from_messages([
#         ("system",
#          f"You are VRSEC {domain.upper()} Assistant.\n\n"
#          "You are a retrieval-augmented assistant.\n"
#          "You MUST answer ONLY using the provided CONTEXT.\n\n"
#          "STRICT RULES:\n"
#         #  "1) If the answer is not explicitly present in CONTEXT, reply exactly:\n"
#         #  "\"I don't have enough information in the provided college data to answer that.\"\n"
#          "2) Do NOT guess, do NOT assume, do NOT use outside knowledge.\n"
#          "3) If multiple points exist, answer in 3-6 bullet points.\n"
#          "4) If the question is unclear, ask 1 short clarification question.\n"
#          "5) Keep response short and factual.\n"
#          "6) If the context contains information directly OR indirectly relavant, you MUST answer.\n"
#          "7) You are allowed to infer obivious facts.\n"
#          "8) There is no need to give the exact sentence matches to the answer.\n"
#          "9) If the question is short OR vague, interpret it in the most reasonable way using the context. If it is really unrelated, only then answer:\n"
#          "\"I don't have enough information in the provided college data to answer that.\"\n"
#         ),
#         ("human",
#          "CONTEXT:\n{context}\n\n"
#          "QUESTION:\n{question}\n\n"
#          "FINAL ANSWER:")
#     ])

#     def retrieve_context(inputs: dict) -> dict:
#         """
#         Retrieves context using rewritten query for better matching.
#         """
#         question = inputs["question"]
#         rewritten = rewrite_question(question)

#         docs = retriever.invoke(rewritten)
#         context = format_docs(docs)

#         return {
#             "question": question,
#             "context": context
#         }

#     chain = (
#         {"question": RunnablePassthrough()}
#         | RunnableLambda(retrieve_context)
#         | rag_prompt
#         | RunnableLambda(lambda prompt_value: remote_llm_call(
#             prompt_value.to_string(),
#             temperature=DEFAULT_TEMP,
#             top_p=DEFAULT_TOP_P,
#             max_new_tokens=DEFAULT_MAX_TOKENS
#         ))
#         | StrOutputParser()
#     )

#     return chain


# # =========================
# # 5) Cached getter (same function name)
# # =========================
# def get_chain(domain: Domain):
#     if domain in CHAIN_CACHE:
#         return CHAIN_CACHE[domain]

#     chain = build_domain_chain(domain)
#     CHAIN_CACHE[domain] = chain
#     return chain
