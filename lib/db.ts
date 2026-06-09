import { createClient, type Client, type InValue } from '@libsql/client'

let _client: Client | null = null

function getDb(): Client {
  if (!_client) {
    _client = createClient({
      url: process.env.TURSO_DATABASE_URL ?? 'file:wedding.db',
      authToken: process.env.TURSO_AUTH_TOKEN || undefined,
    })
  }
  return _client
}

let _initialized = false
let _initPromise: Promise<void> | null = null

async function ensureInit(): Promise<void> {
  if (_initialized) return
  if (_initPromise) { await _initPromise; return }
  _initPromise = doInit()
  await _initPromise
  _initialized = true
}

async function doInit(): Promise<void> {
  const db = getDb()

  await db.batch([
    {
      sql: `CREATE TABLE IF NOT EXISTS invitation (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        couple_names TEXT NOT NULL DEFAULT '',
        wedding_date TEXT NOT NULL DEFAULT '',
        venue TEXT NOT NULL DEFAULT '',
        venue_address TEXT,
        ceremony_time TEXT,
        reception_time TEXT,
        message TEXT,
        theme TEXT DEFAULT 'classic',
        background_color TEXT DEFAULT '#fff8f0',
        accent_color TEXT DEFAULT '#c9a96e',
        font_style TEXT DEFAULT 'serif',
        rsvp_deadline TEXT,
        public_slug TEXT,
        show_registry INTEGER DEFAULT 1,
        show_timeline INTEGER DEFAULT 1,
        show_accommodation INTEGER DEFAULT 1,
        story TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      )`, args: []
    },
    {
      sql: `CREATE TABLE IF NOT EXISTS guests (
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
        conflict_with TEXT DEFAULT '',
        accessibility_needs TEXT DEFAULT '',
        address TEXT DEFAULT '',
        last_nudged_at TEXT,
        nudge_count INTEGER DEFAULT 0,
        checked_in INTEGER DEFAULT 0,
        check_in_time TEXT,
        meal_choice TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      )`, args: []
    },
    {
      sql: `CREATE TABLE IF NOT EXISTS checklist (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        task TEXT NOT NULL,
        category TEXT DEFAULT 'General',
        due_date TEXT,
        completed INTEGER DEFAULT 0,
        priority TEXT DEFAULT 'medium',
        notes TEXT,
        prerequisite_id INTEGER,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      )`, args: []
    },
    {
      sql: `CREATE TABLE IF NOT EXISTS budget (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        category TEXT NOT NULL,
        item TEXT NOT NULL,
        estimated REAL DEFAULT 0,
        actual REAL DEFAULT 0,
        paid INTEGER DEFAULT 0,
        vendor TEXT,
        notes TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      )`, args: []
    },
    {
      sql: `CREATE TABLE IF NOT EXISTS vendors (
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
        deposit_due_date TEXT,
        final_payment_date TEXT,
        cancellation_deadline TEXT,
        last_contacted_at TEXT,
        last_replied_at TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      )`, args: []
    },
    {
      sql: `CREATE TABLE IF NOT EXISTS timeline_events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        start_time TEXT NOT NULL,
        duration_minutes INTEGER DEFAULT 30,
        vendor_id INTEGER,
        notes TEXT,
        event_type TEXT DEFAULT 'general',
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      )`, args: []
    },
    {
      sql: `CREATE TABLE IF NOT EXISTS rsvp_questions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        question_text TEXT NOT NULL,
        field_type TEXT DEFAULT 'text',
        options TEXT DEFAULT '',
        required INTEGER DEFAULT 0,
        sort_order INTEGER DEFAULT 0,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      )`, args: []
    },
    {
      sql: `CREATE TABLE IF NOT EXISTS rsvp_answers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        guest_id INTEGER NOT NULL,
        question_id INTEGER NOT NULL,
        answer TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      )`, args: []
    },
    {
      sql: `CREATE TABLE IF NOT EXISTS vendor_communications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        vendor_id INTEGER NOT NULL,
        comm_date TEXT NOT NULL,
        comm_type TEXT DEFAULT 'note',
        content TEXT,
        extracted_actions TEXT DEFAULT '',
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      )`, args: []
    },
    {
      sql: `CREATE TABLE IF NOT EXISTS decisions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT,
        options TEXT NOT NULL DEFAULT '[]',
        deadline TEXT,
        status TEXT DEFAULT 'open',
        final_choice TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      )`, args: []
    },
    {
      sql: `CREATE TABLE IF NOT EXISTS votes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        decision_id INTEGER NOT NULL,
        voter_name TEXT NOT NULL,
        choice TEXT NOT NULL,
        comment TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      )`, args: []
    },
    {
      sql: `CREATE TABLE IF NOT EXISTS hotel_blocks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        hotel_name TEXT NOT NULL,
        address TEXT,
        block_code TEXT,
        rate REAL DEFAULT 0,
        cutoff_date TEXT,
        total_rooms INTEGER DEFAULT 0,
        booked_rooms INTEGER DEFAULT 0,
        notes TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      )`, args: []
    },
    {
      sql: `CREATE TABLE IF NOT EXISTS catering_menu (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        item_name TEXT NOT NULL,
        course TEXT DEFAULT 'main',
        compatible_diets TEXT DEFAULT 'none,vegetarian,vegan,gluten-free,halal,kosher,nut-free',
        notes TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      )`, args: []
    },
    {
      sql: `CREATE TABLE IF NOT EXISTS price_benchmarks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        category TEXT NOT NULL,
        median_price REAL DEFAULT 0,
        low_price REAL DEFAULT 0,
        high_price REAL DEFAULT 0,
        region TEXT DEFAULT 'US National Average',
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      )`, args: []
    },
    // New tables for features
    {
      sql: `CREATE TABLE IF NOT EXISTS meal_options (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        label TEXT NOT NULL,
        description TEXT,
        dietary_tags TEXT DEFAULT '',
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      )`, args: []
    },
    {
      sql: `CREATE TABLE IF NOT EXISTS events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        type TEXT DEFAULT 'general',
        date TEXT,
        venue TEXT,
        notes TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      )`, args: []
    },
    {
      sql: `CREATE TABLE IF NOT EXISTS event_guests (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        event_id INTEGER NOT NULL,
        guest_id INTEGER NOT NULL
      )`, args: []
    },
    {
      sql: `CREATE TABLE IF NOT EXISTS registry_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        price REAL DEFAULT 0,
        store TEXT,
        url TEXT,
        quantity INTEGER DEFAULT 1,
        claimed_count INTEGER DEFAULT 0,
        image_url TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      )`, args: []
    },
    {
      sql: `CREATE TABLE IF NOT EXISTS registry_claims (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        item_id INTEGER NOT NULL,
        guest_name TEXT NOT NULL,
        claimed_at TEXT DEFAULT CURRENT_TIMESTAMP
      )`, args: []
    },
    {
      sql: `CREATE TABLE IF NOT EXISTS transport_groups (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        departure_time TEXT,
        departure_location TEXT,
        capacity INTEGER DEFAULT 10,
        driver_name TEXT,
        driver_contact TEXT,
        notes TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      )`, args: []
    },
    {
      sql: `CREATE TABLE IF NOT EXISTS transport_members (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        transport_id INTEGER NOT NULL,
        guest_id INTEGER NOT NULL
      )`, args: []
    },
    {
      sql: `CREATE TABLE IF NOT EXISTS speeches (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        type TEXT NOT NULL,
        tone TEXT DEFAULT 'romantic',
        content TEXT NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      )`, args: []
    },
    {
      sql: `CREATE TABLE IF NOT EXISTS photos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        blob_url TEXT NOT NULL,
        uploader_name TEXT,
        caption TEXT,
        approved INTEGER DEFAULT 0,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      )`, args: []
    },
  ], 'write')

  // Migrate existing tables: add new columns if they don't exist
  const migrations = [
    'ALTER TABLE guests ADD COLUMN checked_in INTEGER DEFAULT 0',
    'ALTER TABLE guests ADD COLUMN check_in_time TEXT',
    'ALTER TABLE guests ADD COLUMN meal_choice TEXT',
    'ALTER TABLE invitation ADD COLUMN public_slug TEXT',
    'ALTER TABLE invitation ADD COLUMN show_registry INTEGER DEFAULT 1',
    'ALTER TABLE invitation ADD COLUMN show_timeline INTEGER DEFAULT 1',
    'ALTER TABLE invitation ADD COLUMN show_accommodation INTEGER DEFAULT 1',
    'ALTER TABLE invitation ADD COLUMN story TEXT',
  ]
  for (const sql of migrations) {
    try { await db.execute(sql) } catch { /* column already exists */ }
  }

  // Seed price benchmarks
  const benchResult = await db.execute('SELECT COUNT(*) as c FROM price_benchmarks')
  const benchCount = Number(benchResult.rows[0]?.c ?? 0)
  if (benchCount === 0) {
    await db.batch([
      { sql: 'INSERT INTO price_benchmarks (category, median_price, low_price, high_price) VALUES (?,?,?,?)', args: ['Venue', 6000, 2000, 15000] },
      { sql: 'INSERT INTO price_benchmarks (category, median_price, low_price, high_price) VALUES (?,?,?,?)', args: ['Photography', 2800, 1200, 5500] },
      { sql: 'INSERT INTO price_benchmarks (category, median_price, low_price, high_price) VALUES (?,?,?,?)', args: ['Videography', 2200, 800, 4500] },
      { sql: 'INSERT INTO price_benchmarks (category, median_price, low_price, high_price) VALUES (?,?,?,?)', args: ['Catering', 8500, 4000, 18000] },
      { sql: 'INSERT INTO price_benchmarks (category, median_price, low_price, high_price) VALUES (?,?,?,?)', args: ['Florist', 2500, 800, 6000] },
      { sql: 'INSERT INTO price_benchmarks (category, median_price, low_price, high_price) VALUES (?,?,?,?)', args: ['Music/DJ', 1500, 600, 3500] },
      { sql: 'INSERT INTO price_benchmarks (category, median_price, low_price, high_price) VALUES (?,?,?,?)', args: ['Hair & Makeup', 1200, 400, 2800] },
      { sql: 'INSERT INTO price_benchmarks (category, median_price, low_price, high_price) VALUES (?,?,?,?)', args: ['Transport', 800, 300, 2000] },
      { sql: 'INSERT INTO price_benchmarks (category, median_price, low_price, high_price) VALUES (?,?,?,?)', args: ['Cake', 600, 250, 1500] },
      { sql: 'INSERT INTO price_benchmarks (category, median_price, low_price, high_price) VALUES (?,?,?,?)', args: ['Officiant', 500, 200, 1200] },
      { sql: 'INSERT INTO price_benchmarks (category, median_price, low_price, high_price) VALUES (?,?,?,?)', args: ['Stationery', 400, 150, 900] },
      { sql: 'INSERT INTO price_benchmarks (category, median_price, low_price, high_price) VALUES (?,?,?,?)', args: ['Decor', 3000, 800, 8000] },
      { sql: 'INSERT INTO price_benchmarks (category, median_price, low_price, high_price) VALUES (?,?,?,?)', args: ['Other', 1000, 200, 4000] },
    ], 'write')
  }
}

export async function dbAll<T = Record<string, unknown>>(sql: string, args: InValue[] = []): Promise<T[]> {
  await ensureInit()
  const result = await getDb().execute({ sql, args })
  return result.rows as unknown as T[]
}

export async function dbGet<T = Record<string, unknown>>(sql: string, args: InValue[] = []): Promise<T | undefined> {
  await ensureInit()
  const result = await getDb().execute({ sql, args })
  return result.rows[0] as unknown as T | undefined
}

export async function dbRun(sql: string, args: InValue[] = []): Promise<void> {
  await ensureInit()
  await getDb().execute({ sql, args })
}

export async function dbBatch(stmts: { sql: string; args: unknown[] }[]): Promise<void> {
  await ensureInit()
  await getDb().batch(stmts as Parameters<Client['batch']>[0], 'write')
}
