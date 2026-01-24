import requests

class BhashiniClient:
    def post(self, endpoint: dict, payload: dict) -> dict:
        res = requests.post(
            endpoint["callbackUrl"],
            json=payload,
            headers={"Authorization": endpoint["inferenceApiKey"]["value"]}
        )
        return res.json()