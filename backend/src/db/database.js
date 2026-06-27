const sqlite3 = require('sqlite3').verbose();
const sqlite = require('sqlite');
const path = require('path');
const fs = require('fs');

// Pfad zur SQLite-Datenbank
const dbPath = process.env.DB_PATH || path.join(__dirname, '../../data/beihilfe.db');

// Stelle sicher, dass das data-Verzeichnis existiert
const dataDir = path.dirname(dbPath);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

let db = null;

/**
 * Initialisiere die Datenbankverbindung
 */
async function initDb() {
  if (db) return db;

  db = await sqlite.open({
    filename: dbPath,
    driver: sqlite3.Database
  });

  await db.exec('PRAGMA foreign_keys = ON');
  await createTables();
  
  // Führe Migrationen aus
  const { migrateLegacyCalculations } = require('./migrations');
  await migrateLegacyCalculations();
  
  return db;
}

/**
 * Erstelle alle notwendigen Tabellen
 */
async function createTables() {
  await db.exec(`
    -- Patienten Tabelle
    CREATE TABLE IF NOT EXISTS patients (
      id TEXT PRIMARY KEY,
      firstName TEXT NOT NULL,
      lastName TEXT NOT NULL,
      geburtsDatum TEXT,
      pkvQuote REAL DEFAULT 0,
      beihilfeQuote REAL DEFAULT 0,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Kontakte Tabelle
    CREATE TABLE IF NOT EXISTS contacts (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      specialty TEXT,
      address TEXT,
      phone TEXT,
      email TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Aufwendungen Tabelle
    CREATE TABLE IF NOT EXISTS aufwendungen (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      patientId TEXT NOT NULL,
      datum TEXT NOT NULL,
      faelligkeitsDatum TEXT NOT NULL,
      kontaktId TEXT,
      aufTyp TEXT NOT NULL,
      beschreibung TEXT,
      rechnungsNr TEXT,
      betrag REAL NOT NULL,
      
      -- Status für die 5 Säulen
      rechnungStatus TEXT DEFAULT 'offen',
      pkvStatus TEXT DEFAULT 'offen',
      betStatus TEXT DEFAULT 'offen',
      beihilfeStatus TEXT DEFAULT 'offen',
      -- Tatsächliche Beträge
      pkvBetrag REAL DEFAULT 0,
      betBetrag REAL DEFAULT 0,
      beihilfeBetrag REAL DEFAULT 0,
      
      -- Daten wann Status gesetzt wurde (JSON)
      statusDaten TEXT,
      
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      
      FOREIGN KEY (patientId) REFERENCES patients(id),
      FOREIGN KEY (kontaktId) REFERENCES contacts(id)
    );

    -- Index für bessere Performance
    CREATE INDEX IF NOT EXISTS idx_aufwendungen_patientId ON aufwendungen(patientId);
    CREATE INDEX IF NOT EXISTS idx_aufwendungen_datum ON aufwendungen(datum);
    CREATE INDEX IF NOT EXISTS idx_aufwendungen_faelligkeitsDatum ON aufwendungen(faelligkeitsDatum);

    -- Berechnete Werte Tabelle (zentrale Berechnung)
    CREATE TABLE IF NOT EXISTS aufwendung_berechnungen (
      id TEXT PRIMARY KEY,
      aufwendungId INTEGER NOT NULL UNIQUE,
      
      -- Hauptwerte
      betrag REAL NOT NULL,
      ausstehend REAL NOT NULL,
      eigenbehalt REAL NOT NULL,
      
      -- Komponenten (für Debugging/Detail-Ansicht)
      pkvSoll REAL,
      pkvAusstehend REAL,
      pkvErledigt REAL,
      beihilfeSoll REAL,
      beihilfeAusstehend REAL,
      beihilfeErledigt REAL,
      betSoll REAL,
      betErledigt REAL,
      
      -- Audit
      lastUpdated DATETIME DEFAULT CURRENT_TIMESTAMP,
      calculatedAt DATETIME,
      
      FOREIGN KEY (aufwendungId) REFERENCES aufwendungen(id) ON DELETE CASCADE
    );

    -- Index für schnelle Joins
    CREATE INDEX IF NOT EXISTS idx_berechnungen_aufwendungId 
      ON aufwendung_berechnungen(aufwendungId);
  `);

  console.log('✅ Datenbanktabellen initialisiert');
}

/**
 * Hole die Datenbankverbindung
 */
function getDb() {
  if (!db) {
    throw new Error('Datenbank nicht initialisiert. Rufe initDb() auf.');
  }
  return db;
}

module.exports = {
  initDb,
  getDb
};
