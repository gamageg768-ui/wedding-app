# Error Report — Wedding Planner App

## Frontend Errors

- **ERR001** — White screen on load
  - Cause: Vite dev server not started or build error
  - Fix: Run `npm run dev` inside `frontend/` and check terminal output

- **ERR002** — TypeScript compile errors
  - Cause: Missing packages or type mismatch
  - Fix: Run `npm install` and then `npm run build` to view errors

- **ERR003** — API calls return network error
  - Cause: Backend is not running
  - Fix: Start Flask backend with `python app.py` in `backend/`

- **ERR004** — Charts not rendering (Budget page)
  - Cause: Missing `recharts` package
  - Fix: Run `npm install recharts` in `frontend/`

- **ERR005** — Drag and drop not working on seating chart
  - Cause: Browser may not support HTML5 drag events in certain modes
  - Fix: Use a Chromium-based browser; ensure guests have `rsvp_status = confirmed`

---

## Backend Errors

- **ERR006** — `ModuleNotFoundError`
  - Cause: Missing Python packages
  - Fix: Activate virtualenv and run `pip install -r requirements.txt`

- **ERR007** — `sqlite3.OperationalError: no such table`
  - Cause: Database not initialized
  - Fix: Delete `database.db` and restart the backend; tables are created on startup

- **ERR008** — CORS error in browser console
  - Cause: `flask-cors` not installed or not applied
  - Fix: Verify `flask-cors` is in `requirements.txt` and `CORS(app)` is in `app.py`

- **ERR009** — `Address already in use` on port 5000
  - Cause: Another process is using port 5000
  - Fix (macOS/Linux): `lsof -i :5000` then `kill <PID>`
  - Fix (Windows): `netstat -ano | findstr :5000` then `taskkill /PID <PID> /F`

- **ERR010** — `500 Internal Server Error` on save
  - Cause: Malformed request body or missing required field
  - Fix: Check browser DevTools → Network tab for request payload; check Flask terminal

---

## Ollama / AI Chat Errors

- **ERR011** — AI Assistant says "Ollama is not running"
  - Cause: Ollama service is not started
  - Fix: Open a terminal and run `ollama serve`

- **ERR012** — "Model not found" in AI response
  - Cause: llama3 model has not been pulled
  - Fix: Run `ollama pull llama3` (this may take several minutes)

- **ERR013** — AI responses are very slow
  - Cause: Running on CPU without GPU acceleration
  - Fix: This is normal on CPU-only machines; consider using a smaller model like `ollama pull phi3`

---

## General Errors

- **ERR014** — Invitation page not saving
  - Cause: Backend not reachable or couple_names field empty
  - Fix: Ensure all required fields are filled; verify backend is running

- **ERR015** — Guest CSV export is blank
  - Cause: No guests in the database
  - Fix: Add at least one guest first, then export

- **ERR016** — Tasks not appearing on Planner page
  - Cause: Seed endpoint not called
  - Fix: Visit Dashboard first — it automatically calls `/api/planner/seed` on load
