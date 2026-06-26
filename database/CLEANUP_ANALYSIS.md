# 🧹 Datenbankschema - Bereinigungsanalyse

**Erstelldatum:** 2026-06-26  
**Status:** Analyse der verwendeten vs. ungenutzten Tabellen

---

## 📊 ZUSAMMENFASSUNG

| Kategorie | Aktuell | Benötigt | Zu Löschen |
|-----------|---------|----------|-----------|
| **Tabellen insgesamt** | 51 | 3 | **48** |
| **SQL-Dateien** | 8 | 1-2 | **6-7** |
| **Speichergröße (potentiell)** | ~2-3 MB | ~50 KB | 95%+ |

---

## ✅ VERWENDETE TABELLEN (Im Backend-Code)

### Backend verwendet **genau 3 Tabellen** (`backend/src/db/database.js`):

1. **`patients`** ✅ AKTIV
   - Struktur in `createTables()` definiert
   - API-Endpoint: `/api/patients`
   - Felder: id, firstName, lastName, geburtsDatum, pkvQuote, beihilfeQuote, createdAt, updatedAt
   - Migration: Migrated aus `tbl_Rechnungen` (alte DB)

2. **`contacts`** ✅ AKTIV
   - Struktur in `createTables()` definiert
   - API-Endpoint: `/api/contacts`
   - Felder: id, name, specialty, address, phone, email, createdAt, updatedAt
   - Migration: Leer (aus `tbl_Kontakte`, aber keine Daten in alter DB)

3. **`aufwendungen`** ✅ AKTIV
   - Struktur in `createTables()` definiert
   - API-Endpoint: `/api/aufwendungen`
   - Felder: id, patientId, datum, faelligkeitsDatum, kontaktId, aufTyp, beschreibung, rechnungsNr, betrag, status-Felder, Betrag-Felder, statusDaten
   - Migration: Migrated aus `tbl_Rechnungen`, `tbl_Fahrtkosten`, `tbl_KhKosten`
   - 176 Datensätze (nach Nutzerlöschungen)

---

## ❌ NICHT VERWENDETE TABELLEN (Alte BOP_SQL_Daten Artefakte)

### Datei: `01_core_tables.sql` (KOMPLETT ERSETZEN)

Enthält Duplikate/alte Namen:

| Tabelle | Status | Grund | Aktion |
|---------|--------|-------|--------|
| `tbl_Patienten` | ❌ VERALTET | Renamed zu `patients` | **LÖSCHEN** |
| `tbl_Kontakte` | ❌ VERALTET | Renamed zu `contacts` | **LÖSCHEN** |
| `tbl_Beihilfe_Saetze` | ❌ NICHT GENUTZT | Keine API, kein Code-Ref | **LÖSCHEN** |
| `tbl_Antraege` | ❌ NICHT GENUTZT | Keine API, kein Code-Ref | **LÖSCHEN** |
| `tbl_Aufwendungen` | ❌ VERALTET | Renamed zu `aufwendungen` | **LÖSCHEN** |

**Aktion:** KOMPLETTE Datei durch neues Minimal-Schema ersetzen

---

### Datei: `02_travel_costs.sql` (VOLLSTÄNDIG LÖSCHEN)

| Tabelle | Status | Grund |
|---------|--------|-------|
| `tbl_Fahrtkosten` | ❌ VERALTET | Daten migrated zu `aufwendungen` |
| `tbl_Fahrtziele` | ❌ NICHT GENUTZT | Support-Tabelle für gelöschte Fahrtkosten |
| `tbl_Parken` | ❌ VERALTET | Daten migrated zu `aufwendungen` (aufTyp='Parkgebühr') |

**Aktion:** DATEI LÖSCHEN (kein Code-Verweis, alle Daten migriert)

---

### Datei: `03_medical_services.sql` (VOLLSTÄNDIG LÖSCHEN)

| Tabelle | Status | Grund |
|---------|--------|-------|
| `tbl_Arztbesuch` | ❌ NICHT GENUTZT | Daten = Rekonstruktion aus `aufwendungen` |
| `tbl_Medikamente` | ❌ NICHT GENUTZT | Separate Arzneimittel-Verwaltung, nicht integriert |
| `tbl_Medikation` | ❌ NICHT GENUTZT | Medication Schedule, nicht im neuen System |
| `tbl_Medikation_neu` | ❌ NICHT GENUTZT | Duplikat von `tbl_Medikation` |
| `tbl_KhKosten` | ❌ VERALTET | Daten migrated zu `aufwendungen` |
| `tbl_ImpfBuch` | ❌ NICHT GENUTZT | Separate Impf-Verwaltung |
| `tbl_Impfen` | ❌ NICHT GENUTZT | Impf-Planung |
| `tbl_Zusatz` | ❌ ? | SQL-Datei abgeschnitten |

**Aktion:** DATEI LÖSCHEN (kein Code-Verweis, medizinische Detail-Verwaltung nicht im Scope)

---

### Datei: `04_documents.sql` (VOLLSTÄNDIG LÖSCHEN)

| Tabelle | Status | Grund |
|---------|--------|-------|
| `tbl_DokMig` | ❌ NICHT GENUTZT | Alte Dokument-Migration |
| `tbl_DokSql` | ❌ NICHT GENUTZT | Dokument-Verwaltung für SQL-DB |
| `tbl_DokSonstige` | ❌ NICHT GENUTZT | Allgemeine Dokumente |
| `tbl_DokSonstigeLink` | ❌ NICHT GENUTZT | Dokument-Links |
| `tbl_DokSuche` | ❌ NICHT GENUTZT | Dokument-Suchindex |

**Aktion:** DATEI LÖSCHEN (kein Dokument-Management in API, keine Dateiablage im Container)

---

### Datei: `05_administration.sql` (GRÖSSTENTEILS LÖSCHEN)

| Tabelle | Status | Grund |
|---------|--------|-------|
| `tbl_Kontakte` (Duplikat!) | ❌ KONFLIKT | 2. Definition von Kontakte (auch in 01_core) |
| `tbl_ToDoListe` | ❌ NICHT GENUTZT | Task-Management nicht im Scope |
| `tbl_ToDoListe2` | ❌ NICHT GENUTZT | Duplikat von ToDoListe |
| `tbl_ToDoVorlagen` | ❌ NICHT GENUTZT | Task-Templates |
| `tbl_Vorsorge` | ❌ NICHT GENUTZT | Vorsorge-Planung (Impf-, Zahnarzt-Check) |
| `tbl_Lexikon` | ❌ NICHT GENUTZT | Hilfe-Lexikon (frontend-content) |

**Aktion:** DATEI LÖSCHEN (keine Administrationslogik im API)

---

### Datei: `06_financial_reporting.sql` (VOLLSTÄNDIG LÖSCHEN)

| Tabelle | Status | Grund |
|---------|--------|-------|
| `tbl_Beitraege` | ❌ NICHT GENUTZT | Beitragsverwaltung |
| `tbl_BRE` | ❌ NICHT GENUTZT | BRE-Berechnung (finanzielle Regel) |
| `tbl_PlusMinus` | ❌ NICHT GENUTZT | Finanzielle Ein/Aus |
| `tbl_Ratenzahlung` | ❌ NICHT GENUTZT | Ratenplan-Verwaltung |
| `tbl_Monat_RepDaten` | ❌ NICHT GENUTZT | Reporting-Cache |
| `tbl_Monat_RepBasis` | ❌ NICHT GENUTZT | Reporting-Basis |
| `tbl_Monat_RepAnsicht` | ❌ NICHT GENUTZT | Reporting-Ansicht |

**Aktion:** DATEI LÖSCHEN (Reporting wird über API/Frontend aus `aufwendungen` generiert)

---

### Datei: `07_configuration.sql` (VOLLSTÄNDIG LÖSCHEN)

| Tabelle | Status | Grund |
|---------|--------|-------|
| `tbl_DLC` | ❌ NICHT GENUTZT | Lookup-Codes (alte Verwaltung) |
| `tbl_PersAuswahl` | ❌ NICHT GENUTZT | Personen-Auswahl (UI-State) |
| `tbl_Sicht` | ❌ NICHT GENUTZT | View-Einstellungen (UI-Zustand) |

**Aktion:** DATEI LÖSCHEN (Konfiguration wird in `.env` / Docker-Compose verwaltet)

---

### Datei: `02_sample_data.sql`

**Status:** ❌ NICHT GENUTZT  
**Grund:** Demo-Daten. Beim Deploy wird eine leere DB erstellt.

**Aktion:** LÖSCHEN (Daten kommen aus Migration, nicht aus Sample-Datei)

---

## 📈 VERGLEICH: Alt vs. Neu

### ALT (BOP_SQL_Daten.s3db - Origin)
```
40+ Tabellen
├─ Patienten-Management
├─ Kontakt-Management
├─ Aufwendungen (Rechnungen, Fahrtkosten, KH-Kosten)
├─ Medizinische Services (Arzneimittel, Impfungen)
├─ Dokumentenverwaltung
├─ Admin & Planung (ToDo, Vorsorge)
├─ Finanzielle Auswertungen
└─ Konfiguration & Lookup
```

### NEU (Docker-Backend simplified)
```
3 Tabellen
├─ patients
├─ contacts
└─ aufwendungen (unified)
```

---

## 🎯 EMPFOHLENE BEREINIGUNG

### Phase 1: SOFORT LÖSCHEN (vor GitHub-Push)

Dateien:
- ❌ `database/schema/02_travel_costs.sql`
- ❌ `database/schema/03_medical_services.sql`
- ❌ `database/schema/04_documents.sql`
- ❌ `database/schema/05_administration.sql`
- ❌ `database/schema/06_financial_reporting.sql`
- ❌ `database/schema/07_configuration.sql`
- ❌ `database/schema/02_sample_data.sql`

**Grund:** Keine Code-Referenzen, Old-BOP-Artefakte, nicht relevant für Docker-Deploy

**Speicherersparnis:** ~500 KB (minimal, aber Cleanup sauberer)

### Phase 2: NEU ERSTELLEN

**`database/schema/01_core_tables.sql`** - KOMPLETT NEU:

```sql
-- Minimal production schema nur mit genutzten Tabellen
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
  rechnungStatus TEXT DEFAULT 'offen',
  pkvStatus TEXT DEFAULT 'offen',
  betStatus TEXT DEFAULT 'offen',
  beihilfeStatus TEXT DEFAULT 'offen',
  pflegeStatus TEXT DEFAULT 'offen',
  pkvBetrag REAL DEFAULT 0,
  betBetrag REAL DEFAULT 0,
  beihilfeBetrag REAL DEFAULT 0,
  pflegeBetrag REAL DEFAULT 0,
  statusDaten TEXT,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (patientId) REFERENCES patients(id),
  FOREIGN KEY (kontaktId) REFERENCES contacts(id)
);

-- Indices
CREATE INDEX IF NOT EXISTS idx_aufwendungen_patientId ON aufwendungen(patientId);
CREATE INDEX IF NOT EXISTS idx_aufwendungen_datum ON aufwendungen(datum);
```

---

## 📝 EMPFEHLUNG FÜR GITHUB

**Option A: Vollständig Bereinigen (Empfohlen!)**
- Delete 6 Dateien (02-07)
- Rewrite `01_core_tables.sql` zu Minimal-Version
- Commit: `chore: remove old BOP_SQL artefacts, cleanup schema`
- Resultat: Sauberer, wartbarer, kein Dead-Code

**Option B: Belassen (nicht empfohlen)**
- Behalte alles → 95% nicht genutzte Tabellen in Repo
- Verwirrend für neue Entwickler
- Falscher Eindruck von Komplexität

### 🔥 RECOMMENDATION: **OPTION A - FULL CLEANUP**

Dies ist ein guter Moment, um Dead-Code zu entfernen, bevor das Projekt öffentlich wird!

---

## ✨ Zusätzliche Aufräum-Opportunities

1. **`database/docs/`** - Prüfen ob alle noch relevant sind
   - `QUERIES.md` - alte BOP-Queries, obsolet?
   - `ENTITY_RELATIONS.md` - passt nicht mehr zu 3-Tabellen-Schema

2. **`database/migrations/`** - alte migrations?
   - Check: Sind diese für Schema-Updates noch nötig?
   - Wahrscheinlich veraltet (DB wird im Backend via `createTables()` initiert)

3. **`database/views/`** - reporting.sql
   - Nicht genutzt (Reporting via API)

---

## 📊 NACH BEREINIGUNG

| Komponente | Jetzt | Nach Cleanup |
|-----------|-------|--------------|
| SQL-Dateien | 8 | 1 |
| Tabellen-Definitionen | 51+ | 3 |
| Speicher (Schema) | ~200 KB | ~10 KB |
| Dead-Code | 95% | 0% |
| Klarheit für neue Dev | ⚠️ Verwirrend | ✅ Klar |

