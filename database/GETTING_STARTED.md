# 🚀 Beihilfe-Planer Datenbank - Schnelleinstieg

## 📍 Überblick

Dieses Datenbankprojekt dokumentiert und verwaltet ein deutsches **Gesundheitskostenverwaltungssystem** für Beihilfeansprüche (Subventionen). Die Datenbank verfolgt medizinische Ausgaben, deren Erstattungen durch verschiedene Versicherungsträger (PKV, Beihilfe, BET) und die gesamte Zahlungsabwicklung.

---

## 📚 Dokumentation - Schnellzugriff

### 1. **Anfang - Hier starten!**
   - [README.md](./README.md) - Projektübersicht
   - [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) - Dateiorganisation

### 2. **Schema & Struktur**
   - [SCHEMA.md](./docs/SCHEMA.md) - **Detailliertes ER-Modell & Tabellendefinitionen**
   - [ENTITY_RELATIONS.md](./docs/ENTITY_RELATIONS.md) - **Fremdschlüssel & Abhängigkeiten**
   - [DATA_DICTIONARY.md](./docs/DATA_DICTIONARY.md) - **Alle Spalten mit Datentypen**

### 3. **Praktische Nutzung**
   - [QUERIES.md](./docs/QUERIES.md) - **30+ häufig verwendete SQL-Abfragen**
   - [NORMALIZATION.md](./docs/NORMALIZATION.md) - **Verbesserungsvorschläge**

### 4. **Technisches**
   - `schema/` - SQL-Tabellendefinitionen (modulweise)
   - `migrations/` - Schema-Änderungen
   - `views/` - Vordefinierte Reporting-Views

---

## 🎯 Häufigste Use Cases

### Fall 1: "Ich muss Kostenträgerzahlungen checken"
```sql
-- Einfach-Query (aus QUERIES.md):
SELECT 
    strftime('%Y-%m', Re_Datum) AS monat,
    SUM(Re_Betrag) AS gesamt,
    SUM(PKV_Erstattung) AS pkv,
    SUM(BH_Erstattung) AS beihilfe
FROM tbl_Rechnungen
GROUP BY strftime('%Y-%m', Re_Datum);
```
👉 Siehe: [QUERIES.md - Finanzauswertungen](./docs/QUERIES.md#-finanzauswertungen)

### Fall 2: "Ich muss offene Fahrtkosten finden"
```sql
SELECT * FROM tbl_Fahrtkosten 
WHERE CheckOut = 0 OR CheckOut IS NULL
ORDER BY Fk_Hinfahrt DESC;
```
👉 Siehe: [QUERIES.md - Fahrtkosten](./docs/QUERIES.md#-fahrtkosten)

### Fall 3: "Welche Ärzte verursachen die höchsten Kosten?"
```sql
SELECT Re_Aussteller, COUNT(*), SUM(Re_Betrag)
FROM tbl_Rechnungen
GROUP BY Re_Aussteller
ORDER BY SUM(Re_Betrag) DESC LIMIT 10;
```
👉 Siehe: [QUERIES.md - Analyse & Reporting](./docs/QUERIES.md#-analyse--reporting)

### Fall 4: "Wie ist der aktuelle Zahlungsstatus?"
👉 **View verwenden:** `SELECT * FROM vw_rechnung_zahlungsstand WHERE offen_betrag > 0;`
👉 Siehe: [views/reporting.sql](./views/reporting.sql)

---

## 🏛️ Schema-Übersicht (Die 7 Module)

```
┌─────────────────────────────────────────────────────────────┐
│ BEIHILFE-PLANER DATENBANKARCHITEKTUR (7 Module)             │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  [01] CORE              [02] TRAVEL                        │
│  ├─ Anträge            ├─ Fahrtkosten                      │
│  ├─ Rechnungen (★)     ├─ Fahrtziele                       │
│  └─ Details            └─ Parkgebühren                      │
│                                                              │
│  [03] MEDICAL           [04] DOCUMENTS                      │
│  ├─ Arztbesuche        ├─ DokSql                           │
│  ├─ Medikamente        ├─ DokMig                           │
│  ├─ Krankenhauskosten  └─ DokSonstige                      │
│  ├─ Impfungen                                              │
│  └─ Zusatzleistungen   [05] ADMIN                          │
│                        ├─ Kontakte                         │
│  [06] REPORTING        ├─ ToDoListe                        │
│  ├─ Beiträge           ├─ Vorsorge                         │
│  ├─ BRE-Erstattungen   └─ Lexikon                          │
│  ├─ Monatsberichte                                         │
│  └─ Ausgleichszahlungen  [07] CONFIG                       │
│                        ├─ Lookup-Codes                     │
│ ★ = Zentrale Tabelle   ├─ Personenauswahl                  │
│                        └─ Ansichtseinstellungen            │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 💾 Datenbankinstallation

### Schritt 1: Schema erstellen
```bash
# Alle 7 Modultabellen nacheinander erstellen:
sqlite3 beihilfe.db < database/schema/01_core_tables.sql
sqlite3 beihilfe.db < database/schema/02_travel_costs.sql
sqlite3 beihilfe.db < database/schema/03_medical_services.sql
sqlite3 beihilfe.db < database/schema/04_documents.sql
sqlite3 beihilfe.db < database/schema/05_administration.sql
sqlite3 beihilfe.db < database/schema/06_financial_reporting.sql
sqlite3 beihilfe.db < database/schema/07_configuration.sql
```

### Schritt 2: Views hinzufügen (für Reporting)
```bash
sqlite3 beihilfe.db < database/views/reporting.sql
```

### Schritt 3: Performance-Indexes hinzufügen (optional)
```bash
sqlite3 beihilfe.db < database/migrations/001_add_performance_indexes.sql
```

### Schritt 4: Vorherige Daten importieren
```bash
# Original SQL-Datei einlesen:
sqlite3 beihilfe.db < BOP_SQL_Daten.s3db\ Kopie\ SQL.sql
```

---

## 🔑 Zentraltabellen verstehen

### tbl_Rechnungen ⭐ (Das Herzstück)

Jede Rechnung hat einen **Zahlungslebenszyklus**:

```
ERFASSUNG → EINGANG → EINREICHUNG → ZAHLUNG → ABSCHLUSS
   ↓          ↓           ↓           ↓         ↓
 Re_Datum  Re_Eingang  PKV_Einr.   Re_Zahltag  Re_Abschlu.
           Termin      BH_Einr.    Re_Betrag   Re_Absch_Dat
```

**Wichtigste Felder:**
- `Re_Betrag` - Rechnungssumme
- `PKV_Erstattung` - Private KV zahlt
- `BH_Erstattung` - Beihilfe zahlt
- `BET_Erstattung` - Arzt-BET-Ausgleich

**Zahlungsquoten berechnen:**
```
PKV-Quote = (PKV_Erstattung / Re_Betrag) * 100
BH-Quote = (BH_Erstattung / Re_Betrag) * 100
Eigenanteil = Re_Betrag - PKV_Erst. - BH_Erst. - BET_Erst.
```

---

## 🔗 Häufigste Joins

### Rechnung + Fahrtkosten
```sql
SELECT r.Re_Nr, f.Fk_Kosten, f.Fk_Fahrtziel
FROM tbl_Rechnungen r
JOIN tbl_Fahrtkosten f ON r.Re_ID = f.Re_ID;
```

### Rechnung + Krankenhauskosten
```sql
SELECT r.Re_Nr, k.Kh_Kosten, k.Kh_Kategorie
FROM tbl_Rechnungen r
JOIN tbl_KhKosten k ON r.Re_ID = k.Re_ID;
```

### Rechnung + Aufgaben
```sql
SELECT r.Re_Nr, t.TD_Stelle, t.TD_Status
FROM tbl_Rechnungen r
JOIN tbl_ToDoListe t ON r.Re_ID = t.Re_ID;
```

---

## 📊 Reporting mit Views

Vordefinierte Views für häufige Abfragen:

```sql
-- Zahlungsstatus
SELECT * FROM vw_rechnung_zahlungsstand;

-- Monatliche Kostenübersicht
SELECT * FROM vw_monatliche_kosten;

-- Fahrtkostenanalyse
SELECT * FROM vw_fahrtkosten_zusammenfassung;

-- Offene Aufgaben
SELECT * FROM vw_offene_aufgaben;
```

👉 Siehe: [reporting.sql](./views/reporting.sql)

---

## ⚠️ Häufige Fallstricke

### ❌ FALSCH: String-Patienten-Suche
```sql
-- SLOW! String-Matching
WHERE Fk_Patient LIKE 'Müller%'
```

### ✅ RICHTIG: Über Lookup
```sql
-- FAST! Mit Index auf tbl_Patienten (zukünftig)
WHERE Patient_ID IN (SELECT Patient_ID FROM tbl_Patienten WHERE Name = 'Müller')
```

### ❌ FALSCH: Nur PKV checken
```sql
WHERE PKV_Erstattung > 0  -- Ignoriert BH + BET!
```

### ✅ RICHTIG: Alle Kostenträger
```sql
WHERE COALESCE(PKV_Erstattung, 0) + COALESCE(BH_Erstattung, 0) + COALESCE(BET_Erstattung, 0) > 0
```

---

## 🔄 Datenlebenszyklen

### Rechnung-Workflow
```
1. Re_Datum setzen (Rechnungsdatum)
2. Re_Betrag erfassen
3. Re_Eingang bestätigen
4. ToDoListe: "An PKV einreichen"
5. PKV_Einreichung + Termin setzen
6. PKV_Einreichung → PKV_Erstattung
7. BH_Einreichung (falls nötig)
8. BH_Einreichung → BH_Erstattung
9. Re_Zahltag setzen
10. Re_Abschluss = "bezahlt"
```

---

## 🛠️ Wartung

### Monatlich
```sql
-- Indizes optimieren
ANALYZE;

-- Speicher freigeben
VACUUM;
```

### Quartalsweise
```sql
-- Backup erstellen
.dump > backup_2024_Q2.sql

-- Duplikate finden
SELECT Re_Nr, COUNT(*) FROM tbl_Rechnungen GROUP BY Re_Nr HAVING COUNT(*) > 1;
```

### Jährlich
```sql
-- Alte Daten archivieren
UPDATE tbl_Rechnungen SET SuchMarke = 'X' 
WHERE Re_Datum < DATE('now', '-3 years')
  AND Re_Abschluss = 'bezahlt';
```

---

## 📖 Weiterführende Ressourcen

- 📘 Vollständige Schemadokumentation: [SCHEMA.md](./docs/SCHEMA.md)
- 🔗 ER-Diagramm & Beziehungen: [ENTITY_RELATIONS.md](./docs/ENTITY_RELATIONS.md)
- 📋 Datenwörterbuch: [DATA_DICTIONARY.md](./docs/DATA_DICTIONARY.md)
- 💡 30+ Abfragen: [QUERIES.md](./docs/QUERIES.md)
- 🔨 Normalisierung: [NORMALIZATION.md](./docs/NORMALIZATION.md)

---

## ❓ FAQ

**F: Muss ich alle 7 Schema-Dateien verwenden?**  
A: Ja! Sie bilden zusammen das komplette Schema. Die Reihenfolge ist wichtig wegen Abhängigkeiten.

**F: Kann ich nur einzelne Teile verwenden?**  
A: Technisch ja, aber Kernmodul (01_core_tables.sql) muss zuerst kommen.

**F: Wie recovere ich nach Datenverlust?**  
A: Backup-Strategie: `PRAGMA: .dump > backup.sql` regelmäßig durchführen.

**F: Kann ich das Schema verändern?**  
A: Ja! Verwende dafür Migrationen im `migrations/` Folder. Niemals direkt Tabellen ändern!

---

## 🆘 Hilfe & Support

- 📧 Fragen zur Schemadefinition: Siehe [SCHEMA.md](./docs/SCHEMA.md)
- 🔍 Spezifische Abfragen: Siehe [QUERIES.md](./docs/QUERIES.md)
- 💾 Datenbankdesign-Tipps: Siehe [NORMALIZATION.md](./docs/NORMALIZATION.md)
- 📊 View-Queries: Siehe [views/reporting.sql](./views/reporting.sql)

---

**Letzte Aktualisierung:** 2024-06-25  
**Version:** 1.0  
**Status:** Produktionsbereit ✅

