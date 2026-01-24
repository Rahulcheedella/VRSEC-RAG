from flask import Blueprint, request, jsonify
from app.services.rag_service import rag_chat

rag_bp = Blueprint("rag", __name__)

@rag_bp.route("/rag/<domain>/chat", methods=["POST"])
def chat(domain):
    data = request.get_json()
    if not data or "question" not in data:
        return jsonify({"error": "Missing 'question' in request body"}), 400

    question = data["question"].strip()
    if not question:
        return jsonify({"error": "Question cannot be empty"}), 400

    result = rag_chat(domain, question)
    if "error" in result:
        return jsonify(result), 400

    return jsonify(result)