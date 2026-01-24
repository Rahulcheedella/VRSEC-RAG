from flask import Blueprint, request, jsonify
from app.services.timetable_service import generate_exam_timetable

timetable_bp = Blueprint("timetable", __name__)

@timetable_bp.route("/timetable/generate", methods=["POST"])
def generate():
    data = request.get_json()
    if not data:
        return jsonify({"error": "Missing JSON body"}), 400

    start_date = data.pop("start_date", None)

    if len(data) == 0:
        return jsonify({"error": "Provide departments with subjects"}), 400

    output = generate_exam_timetable(data, start_date=start_date)
    return jsonify(output)