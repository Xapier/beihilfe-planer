-- =============================================================================
-- BEIHILFE-PLANER: Beispiel-Migrationen
-- =============================================================================

-- Migration 1: Indexes hinzufügen für Performance
-- =============================================================================
BEGIN TRANSACTION;

CREATE INDEX IF NOT EXISTS idx_rechnungen_re_datum 
ON tbl_rechnungen(re_datum DESC);

CREATE INDEX IF NOT EXISTS idx_rechnungen_re_person 
ON tbl_rechnungen(re_person);

CREATE INDEX IF NOT EXISTS idx_fahrtkosten_re_id 
ON tbl_fahrtkosten(re_id);

CREATE INDEX IF NOT EXISTS idx_fahrtkosten_patient 
ON tbl_fahrtkosten(fk_patient);

CREATE INDEX IF NOT EXISTS idx_khkosten_re_id 
ON tbl_khkosten(re_id);

CREATE INDEX IF NOT EXISTS idx_medikamente_re_id 
ON tbl_medikamente(re_id);

CREATE INDEX IF NOT EXISTS idx_redetails_re_id 
ON tbl_redetails(re_id);

COMMIT;

-- Migration 2: Foreign Key Constraints (empfohlen für Dataintegrität)
-- =============================================================================
-- HINWEIS: SQLite hat eingeschränkte ALTER TABLE Unterstützung
-- Diese Constraints sollten bei Neuerstellung der Datenbank berücksichtigt werden

/*
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS tbl_fahrtkosten_new AS
SELECT * FROM tbl_fahrtkosten;

ALTER TABLE tbl_fahrtkosten_new 
ADD CONSTRAINT fk_fahrtkosten_rechnung 
FOREIGN KEY (re_id) 
REFERENCES tbl_rechnungen(re_id);
*/

-- Migration 3: View für häufig genutzte Queries
-- =============================================================================
-- Diese Views vereinfachen komplexe Abfragen

-- Siehe: views/

-- Migration 4: Datenbasis-Backup
-- =============================================================================
-- Empfehlung: Vor jeder Migration durchführen
-- PRAGMA: .dump > backup_YYYY_MM_DD.sql
