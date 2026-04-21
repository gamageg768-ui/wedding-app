from flask import Flask, jsonify
from flask_cors import CORS
from models import init_db
from routes.guests import guests_bp
from routes.invitation import invitation_bp
from routes.planner import planner_bp
from routes.budget import budget_bp
from routes.vendors import vendors_bp
from routes.ai_chat import ai_chat_bp

app = Flask(__name__)
CORS(app)

app.config['DATABASE'] = 'database.db'

# Register blueprints
app.register_blueprint(guests_bp, url_prefix='/api/guests')
app.register_blueprint(invitation_bp, url_prefix='/api/invitation')
app.register_blueprint(planner_bp, url_prefix='/api/planner')
app.register_blueprint(budget_bp, url_prefix='/api/budget')
app.register_blueprint(vendors_bp, url_prefix='/api/vendors')
app.register_blueprint(ai_chat_bp, url_prefix='/api/ai')

@app.route('/api/health')
def health():
    return jsonify({"status": "ok", "app": "Wedding Planner API"})

if __name__ == '__main__':
    init_db()
    app.run(debug=True, port=5000)
