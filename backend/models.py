import sqlite3

DB_PATH = 'database.db'

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    c = conn.cursor()

    c.executescript('''
        CREATE TABLE IF NOT EXISTS invitation (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            couple_names TEXT NOT NULL,
            wedding_date TEXT NOT NULL,
            venue TEXT NOT NULL,
            venue_address TEXT,
            ceremony_time TEXT,
            reception_time TEXT,
            message TEXT,
            theme TEXT DEFAULT 'classic',
            background_color TEXT DEFAULT '#fff8f0',
            accent_color TEXT DEFAULT '#c9a96e',
            font_style TEXT DEFAULT 'serif',
            rsvp_deadline TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS guests (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT,
            phone TEXT,
            group_name TEXT DEFAULT 'General',
            rsvp_status TEXT DEFAULT 'pending',
            dietary TEXT DEFAULT 'none',
            plus_one INTEGER DEFAULT 0,
            plus_one_name TEXT,
            table_number INTEGER,
            seat_number INTEGER,
            notes TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS checklist (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            task TEXT NOT NULL,
            category TEXT DEFAULT 'General',
            due_date TEXT,
            completed INTEGER DEFAULT 0,
            priority TEXT DEFAULT 'medium',
            notes TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS budget (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            category TEXT NOT NULL,
            item TEXT NOT NULL,
            estimated REAL DEFAULT 0,
            actual REAL DEFAULT 0,
            paid INTEGER DEFAULT 0,
            vendor TEXT,
            notes TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS vendors (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            category TEXT NOT NULL,
            contact_name TEXT,
            email TEXT,
            phone TEXT,
            website TEXT,
            price REAL DEFAULT 0,
            deposit_paid REAL DEFAULT 0,
            status TEXT DEFAULT 'considering',
            contract_signed INTEGER DEFAULT 0,
            notes TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    ''')

    conn.commit()
    conn.close()
    print("Database initialized successfully.")
