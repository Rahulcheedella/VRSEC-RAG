import requests
from config import USER_ID, ULCA_API_KEY, PIPELINE_ID

HEADERS = {
    "userID": USER_ID,
    "ulcaApiKey": ULCA_API_KEY,
    "Content-Type": "application/json"
}

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
        headers=HEADERS
    )

    return res.json()
