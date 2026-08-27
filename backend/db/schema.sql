PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS hospitals (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    address TEXT NOT NULL,
    location TEXT,
    distance_km REAL DEFAULT 0,
    eta_minutes INTEGER DEFAULT 0,
    emergency_trauma_level TEXT,
    contact_number TEXT,
    latitude REAL NOT NULL,
    longitude REAL NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS hospital_resources (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    hospital_id TEXT NOT NULL,

    resource_type TEXT NOT NULL,

    total INTEGER NOT NULL DEFAULT 0,
    available INTEGER NOT NULL DEFAULT 0,
    occupied INTEGER NOT NULL DEFAULT 0,
    maintenance INTEGER NOT NULL DEFAULT 0,

    minimum_threshold INTEGER NOT NULL DEFAULT 0,

    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (hospital_id)
        REFERENCES hospitals(id)
        ON DELETE CASCADE,

    UNIQUE(hospital_id, resource_type),

    CHECK(total >= 0),
    CHECK(available >= 0),
    CHECK(occupied >= 0),
    CHECK(maintenance >= 0)
);

CREATE TABLE IF NOT EXISTS doctors (
    id TEXT PRIMARY KEY,

    hospital_id TEXT NOT NULL,

    name TEXT NOT NULL,
    specialization TEXT,
    department TEXT,

    status TEXT NOT NULL DEFAULT 'off_duty',

    emergency_available INTEGER NOT NULL DEFAULT 0,

    next_available_at TEXT,

    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (hospital_id)
        REFERENCES hospitals(id)
        ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS ambulances (
    id TEXT PRIMARY KEY,

    hospital_id TEXT NOT NULL,

    ambulance_type TEXT NOT NULL,

    status TEXT NOT NULL DEFAULT 'available',

    latitude REAL,
    longitude REAL,

    destination_hospital_id TEXT,

    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (hospital_id)
        REFERENCES hospitals(id)
        ON DELETE CASCADE,

    FOREIGN KEY (destination_hospital_id)
        REFERENCES hospitals(id)
        ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS resource_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    hospital_id TEXT NOT NULL,

    resource_type TEXT NOT NULL,

    previous_available INTEGER,
    new_available INTEGER,

    previous_occupied INTEGER,
    new_occupied INTEGER,

    source TEXT NOT NULL DEFAULT 'hospital_admin',

    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (hospital_id)
        REFERENCES hospitals(id)
        ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS alerts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    hospital_id TEXT NOT NULL,

    severity TEXT NOT NULL,

    title TEXT NOT NULL,
    message TEXT NOT NULL,

    acknowledged INTEGER NOT NULL DEFAULT 0,

    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    acknowledged_at TEXT,

    FOREIGN KEY (hospital_id)
        REFERENCES hospitals(id)
        ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS forecasts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    hospital_id TEXT NOT NULL,

    resource_type TEXT NOT NULL,

    forecast_hours INTEGER NOT NULL,

    current_available INTEGER NOT NULL,

    predicted_available INTEGER NOT NULL,

    predicted_utilization REAL NOT NULL,

    risk_level TEXT NOT NULL,

    readiness_score INTEGER,

    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (hospital_id)
        REFERENCES hospitals(id)
        ON DELETE CASCADE
);