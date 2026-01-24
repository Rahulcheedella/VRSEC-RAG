from flask import Blueprint, request, jsonify, send_file
from app.services.bhashini_service import (
    asr_audio_to_english,
    translate_en_to_te,
    tts_text_to_audio,
    speech_to_telugu_audio_pipeline
)

bhashini_bp = Blueprint("bhashini", __name__)

@bhashini_bp.route("/bhashini/asr/upload", methods=["POST"])
def asr_upload():
    if "audio" not in request.files:
        return jsonify({"error": "Missing audio file. Use form-data key: audio"}), 400

    audio_bytes = request.files["audio"].read()
    english_text = asr_audio_to_english(audio_bytes)
    return jsonify({"englishText": english_text})


@bhashini_bp.route("/bhashini/nmt", methods=["POST"])
def nmt():
    data = request.get_json()
    if not data or "text" not in data:
        return jsonify({"error": "Missing 'text' in request body"}), 400

    telugu = translate_en_to_te(data["text"])
    return jsonify({"englishText": data["text"], "teluguText": telugu})


@bhashini_bp.route("/bhashini/tts/audio", methods=["POST"])
def tts_audio():
    data = request.get_json()
    if not data or "text" not in data:
        return jsonify({"error": "Missing 'text' in request body"}), 400

    audio_io = tts_text_to_audio(data["text"], lang="en")

    return send_file(
        audio_io,
        mimetype="audio/wav",
        as_attachment=False,
        download_name="tts_output.wav"
    )


@bhashini_bp.route("/bhashini/speech-to-telugu/audio", methods=["POST"])
def speech_to_telugu_audio():
    if "audio" not in request.files:
        return jsonify({"error": "Missing audio file. Use form-data key: audio"}), 400

    audio_bytes = request.files["audio"].read()
    audio_io = speech_to_telugu_audio_pipeline(audio_bytes)

    return send_file(
        audio_io,
        mimetype="audio/wav",
        as_attachment=False,
        download_name="speech_to_telugu.wav"
    )