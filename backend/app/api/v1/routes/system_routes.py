from flask import Blueprint, jsonify
import torch

system_bp = Blueprint("system", __name__)

@system_bp.route("/system/info", methods=["GET"])
def system_info():
    return jsonify({
        "cuda_available": torch.cuda.is_available(),
        "device": "cuda" if torch.cuda.is_available() else "cpu",
        "gpu_name": torch.cuda.get_device_name(0) if torch.cuda.is_available() else None
    })