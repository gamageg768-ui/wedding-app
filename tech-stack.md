# Tech Stack — Wedding Planner App

## Frontend
- **Framework**: React 18
- **Language**: TypeScript (strict mode)
- **Build Tool**: Vite 5
- **Routing**: React Router DOM v6
- **Styling**: TailwindCSS 3 with custom wedding theme tokens
- **Charts**: Recharts (pie charts for budget breakdown)
- **Icons**: Lucide React
- **Notifications**: react-hot-toast
- **HTTP Client**: Fetch API (native browser)
- **Fonts**: Playfair Display (Google Fonts) + Inter

## Backend
- **Language**: Python 3.10+
- **Framework**: Flask 3
- **Architecture**: Blueprint-based route separation
- **CORS**: flask-cors
- **HTTP**: requests (for Ollama proxy)
- **Environment**: python-dotenv

## Database
- **Engine**: SQLite 3 (Python stdlib)
- **File**: `backend/database.db`
- **Schema management**: Auto-created via `init_db()` on startup
- **Tables**: invitation, guests, checklist, budget, vendors

## AI / LLM
- **Runtime**: Ollama (local, no API key required)
- **Default Model**: llama3
- **Integration**: REST API proxy at `http://localhost:11434/api/generate`
- **System prompt**: Custom wedding planning assistant persona
- **Context**: Last 6 messages kept for conversational memory

## App Modules
- **Dashboard** — Stats, countdown, progress bars, quick actions
- **Invitation** — Online invitation builder with 5 themes, live preview, share link
- **Guests** — Full CRUD, RSVP tracking, dietary management, CSV export
- **Planner** — 20 pre-seeded tasks, category grouping, progress tracking
- **Budget** — Estimated vs. actual, paid tracking, pie chart, category breakdown
- **Vendors** — Service provider management with contract and status tracking
- **Seating** — Drag-and-drop table builder with visual seat grid
- **AI Chat** — Floating assistant powered by Ollama llama3

## Dev Tools
- **Package Manager (frontend)**: npm
- **Package Manager (backend)**: pip + virtualenv
- **Version Control**: Git
- **IDE recommended**: VS Code with ESLint + Python extensions
