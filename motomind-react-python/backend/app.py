"""
MotoMind - Python REST API Server
Two-Wheeler Fault Diagnosis Expert System Backend

Endpoints:
  GET  /api/health     - Health check
  GET  /api/symptoms   - Master list of symptom categories and symptoms
  GET  /api/rules      - Knowledge base production rules
  POST /api/diagnose   - Run inference on selected symptoms
"""

import sys
import json
from rules import SYMPTOM_CATEGORIES, EXPERT_RULES
from engine import run_diagnosis

# Check if Flask and Flask-CORS are installed
try:
    from flask import Flask, request, jsonify
    from flask_cors import CORS
    FLASK_AVAILABLE = True
except ImportError:
    FLASK_AVAILABLE = False


def create_flask_app():
    """Builds and configures the Flask application."""
    app = Flask(__name__)
    CORS(app)  # Enable Cross-Origin Resource Sharing for React frontend

    @app.route("/", methods=["GET"])
    def root():
        return jsonify({
            "name": "MotoMind Expert System API",
            "version": "2.0.0",
            "status": "online",
            "framework": "Flask",
            "docs": "/api/symptoms, /api/rules, /api/diagnose"
        })

    @app.route("/api/health", methods=["GET"])
    def health():
        return jsonify({
            "status": "healthy",
            "rules_count": len(EXPERT_RULES),
            "categories_count": len(SYMPTOM_CATEGORIES)
        })

    @app.route("/api/symptoms", methods=["GET"])
    def get_symptoms():
        """Returns the master catalog of symptom categories and symptoms."""
        return jsonify({
            "status": "success",
            "categories": SYMPTOM_CATEGORIES
        })

    @app.route("/api/rules", methods=["GET"])
    def get_rules():
        """Returns the expert system rules for auditability and transparency."""
        return jsonify({
            "status": "success",
            "rules": EXPERT_RULES
        })

    @app.route("/api/diagnose", methods=["POST"])
    def diagnose():
        """
        Runs the forward-chaining rule-based inference engine on received symptoms.
        Expects JSON: {"symptoms": ["bike_wont_start", ...]}
        """
        payload = request.get_json(silent=True) or {}
        selected_symptoms = payload.get("symptoms", [])

        if not isinstance(selected_symptoms, list):
            return jsonify({
                "status": "error",
                "message": "'symptoms' must be a list of symptom ID strings."
            }), 400

        result = run_diagnosis(selected_symptoms)
        return jsonify(result)

    return app


def run_builtin_server(port=5000):
    """
    Zero-dependency HTTP server fallback using Python's standard library.
    Allows running immediately even before 'pip install flask flask-cors'.
    """
    from http.server import HTTPServer, BaseHTTPRequestHandler
    from urllib.parse import urlparse

    class MotoMindHandler(BaseHTTPRequestHandler):
        def _send_cors_headers(self):
            self.send_header("Access-Control-Allow-Origin", "*")
            self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
            self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization")

        def do_OPTIONS(self):
            self.send_response(204)
            self._send_cors_headers()
            self.end_headers()

        def do_GET(self):
            parsed = urlparse(self.path)
            path = parsed.path

            if path in ("/", "/api", "/api/health"):
                body = {
                    "status": "healthy",
                    "framework": "Python Built-in Server (Install Flask for production)",
                    "rules_count": len(EXPERT_RULES),
                    "categories_count": len(SYMPTOM_CATEGORIES)
                }
                status_code = 200
            elif path == "/api/symptoms":
                body = {"status": "success", "categories": SYMPTOM_CATEGORIES}
                status_code = 200
            elif path == "/api/rules":
                body = {"status": "success", "rules": EXPERT_RULES}
                status_code = 200
            else:
                body = {"status": "error", "message": "Not Found"}
                status_code = 404

            payload = json.dumps(body).encode("utf-8")
            self.send_response(status_code)
            self.send_header("Content-Type", "application/json")
            self._send_cors_headers()
            self.send_header("Content-Length", str(len(payload)))
            self.end_headers()
            self.wfile.write(payload)

        def do_POST(self):
            parsed = urlparse(self.path)
            path = parsed.path

            if path == "/api/diagnose":
                content_len = int(self.headers.get("Content-Length", 0))
                post_body = self.rfile.read(content_len).decode("utf-8") if content_len > 0 else "{}"
                try:
                    data = json.loads(post_body)
                    symptoms = data.get("symptoms", [])
                    result = run_diagnosis(symptoms)
                    status_code = 200
                except Exception as e:
                    result = {"status": "error", "message": str(e)}
                    status_code = 400
            else:
                result = {"status": "error", "message": "Not Found"}
                status_code = 404

            payload = json.dumps(result).encode("utf-8")
            self.send_response(status_code)
            self.send_header("Content-Type", "application/json")
            self._send_cors_headers()
            self.send_header("Content-Length", str(len(payload)))
            self.end_headers()
            self.wfile.write(payload)

        def log_message(self, format, *args):
            # Clean logging
            sys.stdout.write(f"[Python API] {self.address_string()} - {format % args}\n")
            sys.stdout.flush()

    print(f"==================================================")
    print(f"MotoMind Python Backend Server running on http://127.0.0.1:{port}")
    print(f"Status: Ready to accept requests from React frontend")
    print(f"==================================================")
    server = HTTPServer(("127.0.0.1", port), MotoMindHandler)
    server.serve_forever()


if __name__ == "__main__":
    PORT = 5000
    if FLASK_AVAILABLE:
        print(f"Starting MotoMind Flask Backend on http://127.0.0.1:{PORT}...")
        app = create_flask_app()
        app.run(host="127.0.0.1", port=PORT, debug=True)
    else:
        print("Note: Flask not detected in environment. Running standard library HTTP server fallback.")
        print("To run with Flask, install requirements: pip install -r requirements.txt")
        run_builtin_server(port=PORT)
