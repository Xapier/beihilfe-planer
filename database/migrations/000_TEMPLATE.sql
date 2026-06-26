-- =============================================================================
-- BEIHILFE-PLANER: Migrationsvorlage
-- =============================================================================
-- Beschreibung: Template für Schema-Migrationen
-- Versionierung: YYYY_MM_DD_HHmm_beschreibung.sql
-- Status: TEMPLATE
-- =============================================================================

/**
MIGRATIONSLEITFADEN:
1. Neue Migration im Ordner 'migrations/' mit Zeitstempel erstellen
2. Template kopieren und anpassen
3. Änderungen dokumentieren mit UP/DOWN-Blöcken
4. Vor Production testen!
5. Backup vor jeder Migration!
*/

-- ============================================================================
-- VORLAGE: Neue Spalte hinzufügen
-- ============================================================================

BEGIN TRANSACTION;

-- UP: Spalte hinzufügen
ALTER TABLE tbl_Rechnungen 
ADD COLUMN neue_spalte VARCHAR(50) DEFAULT NULL;

-- DOWN: Spalte entfernen
-- ALTER TABLE tbl_Rechnungen 
-- DROP COLUMN neue_spalte;

COMMIT;

-- ============================================================================
-- VORLAGE: Neue Tabelle erstellen
-- ============================================================================

BEGIN TRANSACTION;

-- UP: Neue Tabelle
CREATE TABLE IF NOT EXISTS "tbl_neue_tabelle" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "beschreibung" TEXT,
    "status" VARCHAR(20) DEFAULT 'aktiv'
);

-- DOWN: Tabelle löschen
-- DROP TABLE tbl_neue_tabelle;

COMMIT;

-- ============================================================================
-- VORLAGE: Daten migrieren
-- ============================================================================

BEGIN TRANSACTION;

-- UP: Daten kopieren/transformieren
INSERT INTO tbl_neue_tabelle (beschreibung, status)
SELECT DISTINCT re_aussteller, 'aktiv'
FROM tbl_rechnungen
WHERE re_aussteller IS NOT NULL;

-- DOWN: Daten zurücksetzen
-- DELETE FROM tbl_neue_tabelle;

COMMIT;

-- ============================================================================
-- VORLAGE: Index erstellen
-- ============================================================================

-- UP: Indizes für Performance
CREATE INDEX IF NOT EXISTS idx_tbl_rechnungen_re_datum 
ON tbl_rechnungen(re_datum DESC);

CREATE INDEX IF NOT EXISTS idx_tbl_fahrtkosten_re_id 
ON tbl_fahrtkosten(re_id);

-- DOWN: Indizes löschen
-- DROP INDEX IF EXISTS idx_tbl_rechnungen_re_datum;
-- DROP INDEX IF EXISTS idx_tbl_fahrtkosten_re_id;
