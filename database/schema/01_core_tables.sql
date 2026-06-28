-- =============================================================================
-- BEIHILFE-PLANER: Production Database Schema
-- =============================================================================
-- Zweck: Vereinfachtes, produktives Schema für Docker-Deploy
-- Optimiert: 2026-06-26
-- Zielserver: SQLite
-- Module: Patienten, Kontakte, Aufwendungen (Unified)
-- =============================================================================
-- HINWEIS: Alte BOP_SQL_Daten Artefakte wurden entfernt (51 → 3 Tabellen)
-- Migration aus BOP: siehe migrate/migrate_bop_corrected.js
-- =============================================================================

BEGIN TRANSACTION;

-- ============================================================================
-- 1. PATIENTS (Versicherte / Familie)
-- ============================================================================
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

-- ============================================================================
-- 2. CONTACTS (Ärzte, Kliniken, Apotheken)
-- ============================================================================
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

-- ============================================================================
-- 3. AUFWENDUNGEN (Unified: Rechnungen, Fahrtkosten, KH-Kosten)
-- ============================================================================
-- 5-Säulen-System für Beihilfeabrechnung:
--   • Rechnung: Ausgangsdokument
--   • PKV: Private Krankenversicherung
--   • BET: Beamten-Ergänzungs-Tarif
--   • Beihilfe: Staatliche Beihilfe
--   • Pflege: Pflegezusatz
-- ============================================================================
CREATE TABLE IF NOT EXISTS aufwendungen (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  patientId TEXT NOT NULL,
  datum TEXT NOT NULL,
  faelligkeitsDatum TEXT NOT NULL,
  kontaktId TEXT,
  aufTyp TEXT NOT NULL,                    -- 'Rechnung', 'Fahrtkosten', 'Parkgebühr', 'KH-Kosten', etc.
  beschreibung TEXT,
  rechnungsNr TEXT,
  betrag REAL NOT NULL,
  
  -- 5-Säulen Status
  rechnungStatus TEXT DEFAULT 'offen',     -- offen, eingegangen, bezahlt
  pkvStatus TEXT DEFAULT 'offen',          -- offen, eingereicht, erstattet, abgelehnt
  betStatus TEXT DEFAULT 'offen',          -- offen, eingereicht, erstattet, abgelehnt
  beihilfeStatus TEXT DEFAULT 'offen',     -- offen, eingereicht, erstattet, abgelehnt
  -- Tatsächliche Beträge (berechnet)
  pkvBetrag REAL DEFAULT 0,
  betBetrag REAL DEFAULT 0,
  beihilfeBetrag REAL DEFAULT 0,
  
  -- Status-Historie (JSON)
  statusDaten TEXT,
  
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (patientId) REFERENCES patients(id),
  FOREIGN KEY (kontaktId) REFERENCES contacts(id)
);

-- ============================================================================
-- 4. AUFWENDUNG_BERECHNUNGEN (Berechnete Werte – zentral im Backend)
-- ============================================================================
-- Wird vom Backend (calculateAmounts() in backend/src/db/migrations.js) befüllt und aktualisiert.
-- Das Frontend sollte diese Werte bevorzugt nutzen; es kann jedoch Anzeige-/Fallback-Logik im Frontend/Backend geben.
-- ============================================================================
CREATE TABLE IF NOT EXISTS aufwendung_berechnungen (
  id TEXT PRIMARY KEY,
  aufwendungId INTEGER NOT NULL UNIQUE,

  -- Hauptwerte (für UI-Anzeige)
  betrag REAL NOT NULL,
  ausstehend REAL NOT NULL,
  eigenbehalt REAL NOT NULL,

  -- PKV-Komponenten
  pkvSoll REAL,
  pkvAusstehend REAL,
  pkvErledigt REAL,
  pkvTatsaechlich REAL DEFAULT 0,

  -- Beihilfe-Komponenten
  beihilfeSoll REAL,
  beihilfeAusstehend REAL,
  beihilfeErledigt REAL,
  beihilfeTatsaechlich REAL DEFAULT 0,

  -- BET-Komponenten
  betSoll REAL,
  betErledigt REAL,
  betTatsaechlich REAL DEFAULT 0,

  -- Audit
  lastUpdated DATETIME DEFAULT CURRENT_TIMESTAMP,
  calculatedAt DATETIME,

  FOREIGN KEY (aufwendungId) REFERENCES aufwendungen(id) ON DELETE CASCADE
);

-- ============================================================================
-- INDICES für Performance
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_aufwendungen_patientId ON aufwendungen(patientId);
CREATE INDEX IF NOT EXISTS idx_aufwendungen_datum ON aufwendungen(datum);
CREATE INDEX IF NOT EXISTS idx_aufwendungen_faelligkeitsDatum ON aufwendungen(faelligkeitsDatum);
CREATE INDEX IF NOT EXISTS idx_aufwendungen_status ON aufwendungen(rechnungStatus, pkvStatus, beihilfeStatus);
CREATE INDEX IF NOT EXISTS idx_berechnungen_aufwendungId ON aufwendung_berechnungen(aufwendungId);

COMMIT;
