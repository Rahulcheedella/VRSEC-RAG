from single import get_chain

ALLOWED_DOMAINS = {"college", "cse", "ece", "mec"}

def rag_chat(domain: str, question: str):
    if domain not in ALLOWED_DOMAINS:
        return {"error": f"Invalid domain '{domain}'"}

    chain = get_chain(domain)
    answer = chain.invoke(question)

    return {
        "domain": domain,
        "question": question,
        "answer": answer
    }