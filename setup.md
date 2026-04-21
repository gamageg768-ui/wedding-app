# Setup Guide — Wedding Planner App 💍

## Prerequisites
- Node.js 18+
- Python 3.10+
- Ollama installed (https://ollama.com)
- Git

---

## 1. Clone / Download the Project
1. Extract the downloaded ZIP or clone the repo
2. `cd wedding-app`

---

## 2. Frontend Setup
1. `cd frontend`
2. `npm install`
3. `npm run dev`
   - Runs on: http://localhost:5173

---

## 3. Backend Setup
1. `cd backend`
2. `python -m venv venv`
3. Activate the virtual environment:
   - macOS/Linux: `source venv/bin/activate`
   - Windows: `venv\Scripts\activate`
4. `pip install -r requirements.txt`
5. `python app.py`
   - Runs on: http://localhost:5000
   - Database auto-created at `backend/database.db`

---

## 4. Ollama AI Assistant Setup
1. Install Ollama: https://ollama.com/download
2. Pull the llama3 model: `ollama pull llama3`
3. Start Ollama service: `ollama serve`
   - Runs on: http://localhost:11434
4. The AI Wedding Assistant (✨ button, bottom-right) will now be active

---

## 5. Database
- SQLite database auto-created on first backend run
- File: `backend/database.db`
- 20 wedding planning tasks pre-seeded on first Dashboard visit

---

## 6. App Features
- **Dashboard** — Wedding countdown, RSVP stats, planning progress
- **Invitation** — Design & customize online invitation with live preview
- **Guests** — Add guests, track RSVPs, dietary needs, export CSV
- **Planner** — 20 pre-loaded tasks, organized by category with progress
- **Budget** — Track estimated vs. actual costs, pie chart visualization
- **Vendors** — Manage all service providers with contract tracking
- **Seating** — Drag-and-drop seating chart builder
- **AI Chat** — Wedding planning assistant powered by Ollama (llama3)
