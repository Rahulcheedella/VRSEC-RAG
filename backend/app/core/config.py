import os

def get_env(key: str, default=None):
    return os.getenv(key, default)

API_VERSION = "v1"

STORAGE_DIR = get_env("STORAGE_DIR", "storage")
DATA_DIR = get_env("DATA_DIR", os.path.join(STORAGE_DIR, "data"))
VECTORDB_DIR = get_env("VECTORDB_DIR", os.path.join(STORAGE_DIR, "vectordb"))
UPLOADS_DIR = get_env("UPLOADS_DIR", os.path.join(STORAGE_DIR, "uploads"))