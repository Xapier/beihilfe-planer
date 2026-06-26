-- =============================================================================
-- BEIHILFE-PLANER: Reporting & Analysis Views
-- =============================================================================

BEGIN TRANSACTION;

-- ============================================================================
-- View: Zahlungsübersicht pro Rechnung
-- ============================================================================
CREATE VIEW IF NOT EXISTS vw_rechnung_zahlungsstand AS
SELECT 
    r.Re_ID,
    r.Re_Nr,
    r.Re_Datum,
    r.Re_Aussteller,
    r.Re_Person,
    r.Re_Betrag,
    r.Re_Betrag - COALESCE(r.PKV_Erstattung, 0) - COALESCE(r.BH_Erstattung, 0) - COALESCE(r.BET_Erstattung, 0) AS offen_betrag,
    CASE 
        WHEN r.PKV_Erstattung > 0 AND r.BH_Erstattung > 0 THEN 'Vollständig bezahlt'
        WHEN r.PKV_Erstattung > 0 OR r.BH_Erstattung > 0 THEN 'Teilweise bezahlt'
        WHEN r.Re_Abschluss = 'Storno' THEN 'Storniert'
        ELSE 'Ausstehend'
    END AS zahlungsstatus,
    r.Re_Abschluss,
    r.PKV_Direkt,
    r.PKV_Erstattung,
    r.BH_Erstattung
FROM tbl_Rechnungen r
WHERE r.Loesch_marker IS NULL OR r.Loesch_marker = 0;

-- ============================================================================
-- View: Monatliche Kostenübersicht
-- ============================================================================
CREATE VIEW IF NOT EXISTS vw_monatliche_kosten AS
SELECT 
    strftime('%Y-%m', r.Re_Datum) AS monat,
    COUNT(DISTINCT r.Re_ID) AS rechnung_anzahl,
    SUM(r.Re_Betrag) AS gesamtbetrag,
    SUM(r.PKV_Erstattung) AS pkv_gesamt,
    SUM(r.BH_Erstattung) AS beihilfe_gesamt,
    SUM(COALESCE(r.Pkv_SB, 0) + COALESCE(r.BH_EA, 0)) AS selbstbeteiligung_gesamt
FROM tbl_Rechnungen r
WHERE (r.Loesch_marker IS NULL OR r.Loesch_marker = 0)
GROUP BY strftime('%Y-%m', r.Re_Datum)
ORDER BY monat DESC;

-- ============================================================================
-- View: Fahrtkostenübersicht
-- ============================================================================
CREATE VIEW IF NOT EXISTS vw_fahrtkosten_zusammenfassung AS
SELECT 
    fk.Fk_Patient,
    COUNT(fk.Fk_ID) AS fahrt_anzahl,
    SUM(fk.Fk_Kosten) AS kostengesamt,
    AVG(fk.Fk_Entfernung) AS durchschnitt_km,
    MAX(fk.Fk_Rueckfahrt) AS letzte_fahrt
FROM tbl_Fahrtkosten fk
WHERE fk.SuchMarke IS NULL OR fk.SuchMarke != 'X'
GROUP BY fk.Fk_Patient;

-- ============================================================================
-- View: Medikationen pro Patient
-- ============================================================================
CREATE VIEW IF NOT EXISTS vw_patient_medikationen AS
SELECT 
    mk.Mk_Patient,
    COUNT(mk.Mk_ID) AS medikation_anzahl,
    GROUP_CONCAT(mk.Mk_Name, ', ') AS medikamente
FROM tbl_Medikation mk
WHERE mk.SuchMarke IS NULL OR mk.SuchMarke != 'X'
GROUP BY mk.Mk_Patient;

-- ============================================================================
-- View: Offene Aufgaben
-- ============================================================================
CREATE VIEW IF NOT EXISTS vw_offene_aufgaben AS
SELECT 
    td.TD_ID,
    td.Re_ID,
    td.TD_Datum,
    td.TD_Stelle,
    td.TD_Aufgabe,
    td.TD_Beschreibung,
    CASE 
        WHEN td.TD_EndDatum IS NULL THEN 'OFFEN'
        WHEN td.TD_EndDatum <= DATE('now') THEN 'ÜBERFÄLLIG'
        ELSE 'GEPLANT'
    END AS priorität
FROM tbl_ToDoListe td
WHERE td.TD_Status = 0
ORDER BY td.TD_Datum ASC;

-- ============================================================================
-- View: Krankenhauskosten nach Kategorie
-- ============================================================================
CREATE VIEW IF NOT EXISTS vw_khkosten_kategorien AS
SELECT 
    kh.Kh_Kategorie,
    kh.Kh_Zuordnung,
    COUNT(kh.Kh_ID) AS anzahl,
    SUM(kh.Kh_Kosten) AS kostengesamt,
    SUM(kh.Kh_E_Kosten) AS eigenanteil,
    SUM(kh.Kh_Sb_Kosten) AS selbstbeteiligung
FROM tbl_KhKosten kh
WHERE (kh.SuchMarke IS NULL OR kh.SuchMarke != 'X')
GROUP BY kh.Kh_Kategorie, kh.Kh_Zuordnung;

-- ============================================================================
-- View: Dokumentenverwaltung - Übersicht
-- ============================================================================
CREATE VIEW IF NOT EXISTS vw_dokumente_uebersicht AS
SELECT 
    r.Re_ID,
    r.Re_Nr,
    COUNT(ds.Doc_ID) AS dokument_anzahl,
    MAX(ds.Doc_Datum) AS letzte_aenderung
FROM tbl_Rechnungen r
LEFT JOIN tbl_DokSql ds ON r.Re_ID = ds.Re_ID
WHERE (r.Loesch_marker IS NULL OR r.Loesch_marker = 0)
GROUP BY r.Re_ID
HAVING dokument_anzahl > 0;

COMMIT;
