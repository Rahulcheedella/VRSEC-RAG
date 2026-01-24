import base64
import io

from single import get_pipeline
from app.integrations.bhashini_client import BhashiniClient

client = BhashiniClient()

def asr_audio_to_english(audio_bytes: bytes) -> str:
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
        "inputData": {"audio": [{"audioContent": audio_b64}]}
    }

    res = client.post(endpoint, payload)

    english_text = (
        res.get("output", [{}])[0].get("source")
        or res.get("pipelineResponse", [{}])[0].get("output", [{}])[0].get("source")
    )

    if not english_text:
        raise Exception("ASR failed to extract text")

    return english_text


def translate_en_to_te(text: str) -> str:
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
        "inputData": {"input": [{"source": text}]}
    }

    res = client.post(endpoint, payload)

    telugu_text = (
        res.get("output", [{}])[0].get("target")
        or res.get("pipelineResponse", [{}])[0].get("output", [{}])[0].get("target")
    )

    if not telugu_text:
        raise Exception("Translation failed")

    return telugu_text


def tts_text_to_audio(text: str, lang: str = "en") -> io.BytesIO:
    tts_pipe = get_pipeline("tts", lang)
    endpoint = tts_pipe["pipelineInferenceAPIEndPoint"]

    payload = {
        "pipelineTasks": [{
            "taskType": "tts",
            "config": {
                "language": {"sourceLanguage": lang},
                "serviceId": tts_pipe["pipelineResponseConfig"][0]["config"][0]["serviceId"],
                "gender": "female",
                "samplingRate": 16000
            }
        }],
        "inputData": {"input": [{"source": text}]}
    }

    res = client.post(endpoint, payload)

    audio_b64 = (
        res.get("audio", [{}])[0].get("audioContent")
        or res.get("pipelineResponse", [{}])[0].get("audio", [{}])[0].get("audioContent")
    )

    if not audio_b64:
        raise Exception("TTS failed to return audio")

    audio_bytes = base64.b64decode(audio_b64)
    return io.BytesIO(audio_bytes)


def speech_to_telugu_audio_pipeline(audio_bytes: bytes) -> io.BytesIO:
    english = asr_audio_to_english(audio_bytes)
    telugu = translate_en_to_te(english)
    audio_io = tts_text_to_audio(telugu, lang="te")
    audio_io.seek(0)
    return audio_io