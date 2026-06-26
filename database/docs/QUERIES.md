# Häufig verwendete SQL-Abfragen

## 📊 Finanzauswertungen

### 1. Rechnungsübersicht mit Zahlungsstatus
```sql
SELECT 
    r.Re_ID,
    r.Re_Nr,
    r.Re_Datum,
    r.Re_Aussteller,
    r.Re_Person,
    r.Re_Betrag,
    COALESCE(r.PKV_Erstattung, 0) + COALESCE(r.BH_Erstattung, 0) AS bezahlt,
    r.Re_Betrag - COALESCE(r.PKV_Erstattung, 0) - COALESCE(r.BH_Erstattung, 0) AS offen,
    r.Re_Abschluss
FROM tbl_Rechnungen r
WHERE YEAR(r.Re_Datum) = YEAR(GETDATE())
ORDER BY r.Re_Datum DESC;
```

### 2. Monatsübersicht - Gesamtkosten vs. Erstattung
```sql
SELECT 
    strftime('%Y-%m', r.Re_Datum) AS monat,
    COUNT(DISTINCT r.Re_ID) AS rechnung_anzahl,
    SUM(r.Re_Betrag) AS gesamtbetrag,
    SUM(r.PKV_Erstattung) AS pkv_zahlung,
    SUM(r.BH_Erstattung) AS beihilfe_zahlung,
    SUM(r.Re_Betrag) - SUM(r.PKV_Erstattung) - SUM(r.BH_Erstattung) AS eigenanteil
FROM tbl_Rechnungen r
WHERE r.Loesch_marker IS NULL OR r.Loesch_marker = 0
GROUP BY strftime('%Y-%m', r.Re_Datum)
ORDER BY monat DESC;
```

### 3. Zahlungsquoten pro Kostenträger
```sql
SELECT 
    r.Re_Person,
    COUNT(*) AS rechnungen,
    SUM(r.Re_Betrag) AS gesamt,
    ROUND(100.0 * SUM(COALESCE(r.PKV_Erstattung, 0)) / SUM(r.Re_Betrag), 2) AS pkv_quote_prozent,
    ROUND(100.0 * SUM(COALESCE(r.BH_Erstattung, 0)) / SUM(r.Re_Betrag), 2) AS beihilfe_quote_prozent
FROM tbl_Rechnungen r
WHERE r.Re_Datum >= DATE('now', '-12 months')
GROUP BY r.Re_Person
ORDER BY gesamt DESC;
```

---

## 🚗 Fahrtkosten

### 1. Fahrtkostenanalyse nach Patient
```sql
SELECT 
    f.Fk_Patient,
    COUNT(*) AS fahrt_anzahl,
    COUNT(DISTINCT f.Fk_Fahrtziel) AS ziele_anzahl,
    SUM(f.Fk_Entfernung) AS km_gesamt,
    SUM(f.Fk_Kosten) AS kosten_gesamt,
    ROUND(AVG(f.Fk_Entfernung), 2) AS km_durchschnitt,
    ROUND(AVG(f.Fk_Kosten), 2) AS kosten_durchschnitt
FROM tbl_Fahrtkosten f
WHERE f.SuchMarke IS NULL OR f.SuchMarke != 'X'
GROUP BY f.Fk_Patient
ORDER BY kosten_gesamt DESC;
```

### 2. Ausstehende Fahrtkosten
```sql
SELECT 
    f.Fk_ID,
    f.Fk_Patient,
    f.Fk_Hinfahrt,
    f.Fk_Fahrtziel,
    f.Fk_Verkehrsmittel,
    f.Fk_Kosten,
    r.Re_Nr
FROM tbl_Fahrtkosten f
LEFT JOIN tbl_Rechnungen r ON f.Re_ID = r.Re_ID
WHERE f.CheckOut IS NULL OR f.CheckOut = 0
ORDER BY f.Fk_Hinfahrt DESC;
```

### 3. Fahrtenziele mit Häufigkeit
```sql
SELECT 
    f.Fk_Fahrtziel,
    COUNT(*) AS fahrt_count,
    COUNT(DISTINCT f.Fk_Patient) AS patienten,
    SUM(f.Fk_Kosten) AS kosten_gesamt,
    ROUND(AVG(f.Fk_Kosten), 2) AS kosten_durchschnitt
FROM tbl_Fahrtkosten f
GROUP BY f.Fk_Fahrtziel
ORDER BY fahrt_count DESC
LIMIT 20;
```

---

## 💊 Medikation

### 1. Patientenmedikamentation
```sql
SELECT 
    m.Mk_Patient,
    COUNT(*) AS medikament_anzahl,
    GROUP_CONCAT(m.Mk_Name, ', ') AS medikamente
FROM tbl_Medikation m
WHERE m.SuchMarke IS NULL OR m.SuchMarke != 'X'
GROUP BY m.Mk_Patient
ORDER BY medikament_anzahl DESC;
```

### 2. Medikamentenkosten
```sql
SELECT 
    m.M_Patient,
    m.M_Name,
    COUNT(*) AS rezept_anzahl,
    m.M_PZN,
    m.M_Wirkstoff,
    CASE WHEN m.M_Rzpfl = 1 THEN 'rezeptpflichtig' ELSE 'OTC' END AS status
FROM tbl_Medikamente m
WHERE m.M_Datum >= DATE('now', '-6 months')
GROUP BY m.M_Name, m.M_Patient
ORDER BY rezept_anzahl DESC;
```

---

## 🏥 Krankenhausleistungen

### 1. Krankenhausaufenthalte
```sql
SELECT 
    k.Kh_ID,
    k.Kh_Patient,
    k.Kh_Hinfahrt AS aufnahme,
    k.Kh_Rueckfahrt AS entlassung,
    JULIANDAY(k.Kh_Rueckfahrt) - JULIANDAY(k.Kh_Hinfahrt) AS tage,
    k.Kh_Kategorie,
    k.Kh_Kosten,
    k.Kh_Zuordnung
FROM tbl_KhKosten k
ORDER BY k.Kh_Hinfahrt DESC;
```

### 2. Krankenhauskosten nach Kategorie
```sql
SELECT 
    k.Kh_Kategorie,
    COUNT(*) AS anzahl,
    SUM(k.Kh_Kosten) AS kosten_gesamt,
    SUM(k.Kh_E_Kosten) AS eigenanteil,
    SUM(k.Kh_Sb_Kosten) AS selbstbeteiligung,
    ROUND(AVG(k.Kh_Kosten), 2) AS kosten_durchschnitt
FROM tbl_KhKosten k
GROUP BY k.Kh_Kategorie
ORDER BY kosten_gesamt DESC;
```

---

## 📋 Aufgabenmanagement

### 1. Offene Aufgaben
```sql
SELECT 
    t.TD_ID,
    t.TD_Datum,
    t.TD_Stelle,
    t.TD_Aufgabe,
    t.TD_Beschreibung,
    CASE 
        WHEN DATE(t.TD_Datum) < DATE('now') THEN 'ÜBERFÄLLIG'
        WHEN DATE(t.TD_Datum) = DATE('now') THEN 'HEUTE'
        ELSE 'GEPLANT'
    END AS status,
    r.Re_Nr
FROM tbl_ToDoListe t
LEFT JOIN tbl_Rechnungen r ON t.Re_ID = r.Re_ID
WHERE t.TD_Status = 0
ORDER BY t.TD_Datum ASC;
```

### 2. Aufgaben pro Stelle
```sql
SELECT 
    t.TD_Stelle,
    COUNT(*) AS anzahl_offen,
    COUNT(CASE WHEN DATE(t.TD_Datum) < DATE('now') THEN 1 END) AS ueberfaellig
FROM tbl_ToDoListe t
WHERE t.TD_Status = 0
GROUP BY t.TD_Stelle
ORDER BY ueberfaellig DESC;
```

---

## 🔍 Suche & Filterung

### 1. Rechnungen nach Datum suchen
```sql
SELECT * FROM tbl_Rechnungen
WHERE DATE(Re_Datum) BETWEEN DATE('2024-01-01') AND DATE('2024-06-30')
ORDER BY Re_Datum DESC;
```

### 2. Rechnungen eines Arztes
```sql
SELECT * FROM tbl_Rechnungen
WHERE Re_Aussteller LIKE '%Müller%'
ORDER BY Re_Datum DESC;
```

### 3. Rechnungen eines Patienten
```sql
SELECT 
    r.Re_ID,
    r.Re_Nr,
    r.Re_Datum,
    r.Re_Aussteller,
    r.Re_Betrag,
    r.Re_Abschluss
FROM tbl_Rechnungen r
WHERE r.Re_Person = ?  -- Parameter
ORDER BY r.Re_Datum DESC;
```

### 4. Rechnungen mit ausstehenden Aufgaben
```sql
SELECT DISTINCT
    r.Re_ID,
    r.Re_Nr,
    r.Re_Datum,
    COUNT(DISTINCT t.TD_ID) AS offene_aufgaben
FROM tbl_Rechnungen r
LEFT JOIN tbl_ToDoListe t ON r.Re_ID = t.Re_ID AND t.TD_Status = 0
GROUP BY r.Re_ID
HAVING COUNT(t.TD_ID) > 0
ORDER BY r.Re_Datum DESC;
```

---

## 📈 Analyse & Reporting

### 1. Jahresbericht - Gesamt
```sql
SELECT 
    YEAR(r.Re_Datum) AS jahr,
    COUNT(*) AS rechnungen,
    SUM(r.Re_Betrag) AS gesamt_kosten,
    SUM(r.PKV_Erstattung) AS pkv_gesamt,
    SUM(r.BH_Erstattung) AS beihilfe_gesamt,
    SUM(r.Re_Betrag) - SUM(r.PKV_Erstattung) - SUM(r.BH_Erstattung) AS eigenanteil
FROM tbl_Rechnungen r
GROUP BY YEAR(r.Re_Datum)
ORDER BY jahr DESC;
```

### 2. Top Kostenverursacher
```sql
SELECT 
    r.Re_Aussteller,
    COUNT(*) AS rechnungen,
    SUM(r.Re_Betrag) AS kosten_gesamt
FROM tbl_Rechnungen r
WHERE r.Re_Datum >= DATE('now', '-1 year')
GROUP BY r.Re_Aussteller
ORDER BY kosten_gesamt DESC
LIMIT 10;
```

### 3. Ersattungsquote Trend
```sql
SELECT 
    strftime('%Y-%m', r.Re_Datum) AS monat,
    ROUND(100.0 * SUM(COALESCE(r.PKV_Erstattung, 0) + COALESCE(r.BH_Erstattung, 0)) / SUM(r.Re_Betrag), 1) AS erstattung_prozent
FROM tbl_Rechnungen r
WHERE r.Re_Datum >= DATE('now', '-12 months')
GROUP BY strftime('%Y-%m', r.Re_Datum)
ORDER BY monat;
```

---

## 🔧 Datenverwaltung

### 1. Datenarchivierung (alt markieren)
```sql
UPDATE tbl_Rechnungen 
SET SuchMarke = 'X' 
WHERE Re_Datum < DATE('now', '-3 years')
  AND Re_Abschluss = 'bezahlt';
```

### 2. Duplikate finden
```sql
SELECT Re_Nr, COUNT(*) 
FROM tbl_Rechnungen 
GROUP BY Re_Nr 
HAVING COUNT(*) > 1;
```

### 3. Fehlende Daten identifizieren
```sql
SELECT * FROM tbl_Rechnungen
WHERE Re_Aussteller IS NULL 
   OR Re_Datum IS NULL 
   OR Re_Betrag <= 0;
```

### 4. Konsistenzprüfung - Fahrtkosten ohne Rechnung
```sql
SELECT f.* 
FROM tbl_Fahrtkosten f
LEFT JOIN tbl_Rechnungen r ON f.Re_ID = r.Re_ID
WHERE f.Re_ID > 0 AND r.Re_ID IS NULL;
```

