from flask import Flask
from flask_cors import CORS

from app.api.v1.routes.health_routes import health_bp
from app.api.v1.routes.system_routes import system_bp
from app.api.v1.routes.rag_routes import rag_bp
from app.api.v1.routes.bhashini_routes import bhashini_bp
from app.api.v1.routes.timetable_routes import timetable_bp

def create_app():
    app = Flask(__name__)
    CORS(app)

    app.register_blueprint(health_bp, url_prefix="/api/v1")
    app.register_blueprint(system_bp, url_prefix="/api/v1")
    app.register_blueprint(rag_bp, url_prefix="/api/v1")
    app.register_blueprint(bhashini_bp, url_prefix="/api/v1")
    app.register_blueprint(timetable_bp, url_prefix="/api/v1")

    return app