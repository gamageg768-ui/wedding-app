from flask import Blueprint, request, jsonify
import requests

ai_chat_bp = Blueprint('ai_chat', __name__)

OLLAMA_URL = "http://localhost:11434/api/generate"
MODEL = "llama3"

SYSTEM_PROMPT = """You are a warm, professional wedding planning assistant with deep expertise in wedding coordination.
You help couples plan their perfect wedding day with advice on venues, vendors, timelines, budgets, etiquette, 
decorations, catering, photography, and more. Keep responses helpful, concise, and encouraging.
Always be sensitive to different cultural wedding traditions when relevant."""

@ai_chat_bp.route('/chat', methods=['POST'])
def chat():
    data = request.json
    user_message = data.get('message', '')
    history = data.get('history', [])

    conversation = f"{SYSTEM_PROMPT}\n\n"
    for msg in history[-6:]:
        role = "User" if msg['role'] == 'user' else "Assistant"
        conversation += f"{role}: {msg['content']}\n"
    conversation += f"User: {user_message}\nAssistant:"

    try:
        response = requests.post(OLLAMA_URL, json={
            "model": MODEL,
            "prompt": conversation,
            "stream": False,
            "options": {"temperature": 0.7, "num_predict": 512}
        }, timeout=60)

        if response.status_code == 200:
            result = response.json()
            return jsonify({"reply": result.get("response", "").strip()})
        else:
            return jsonify({"reply": "I'm having trouble connecting. Please check if Ollama is running."}), 200
    except requests.exceptions.ConnectionError:
        return jsonify({"reply": "Ollama is not running. Start it with: `ollama serve` and pull a model with `ollama pull llama3`"}), 200
    except Exception as e:
        return jsonify({"reply": f"Error: {str(e)}"}), 500
