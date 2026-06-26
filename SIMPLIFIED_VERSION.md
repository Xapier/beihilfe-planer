# Beihilfe-Planer Anwendung - Vereinfachte Version

## 📋 Übersicht

Diese vereinfachte Version fokussiert sich auf die **essenziellen Features**:

✅ **Patienten-Verwaltung** - Familie / mehrere Versicherte  
✅ **Kontakt-Verwaltung** - Ärzte, Zahnärzte, Kliniken, Apotheken  
✅ **Beihilfe-Sätze** - Unterschiedliche Kostenquoten pro Patient  
✅ **Antrags-Tracking** - Status eingereichte Anträge  
✅ **Aufwendungs-Erfassung** - Mit 5-Säulen Status-System  

---

## 🗂️ Projektstruktur

```
/Beihilfe-Planer/
├── database/                        # Datenbank-Schema & Dokumentation
│   ├── schema/
│   │   └── 01_core_tables.sql      # ✨ OPTIMIERT: 5 Essentials-Tabellen
│   ├── docs/
│   │   └── SIMPLIFIED.md            # Dokumentation dieser Version
│   └── ...
│
└── app/                             # 🆕 Webanwendung
    ├── form_aufwendungen_status.html # Hauptformular
    ├── index.html                    # Startseite (TBD)
    ├── patients.html                 # Patient-Verwaltung
    ├── contacts.html                 # Kontakt-Verwaltung
    └── reports.html                  # Berichte & Übersichten
```

---

## 🗄️ Datenbank-Schema (Vereinfacht)

### 5 Kern-Tabellen:

#### 1. `tbl_Patienten` 👤
```sql
Patient_ID (PK), Patient_Name, Patient_Vorname, Patient_GebDatum,
Versicherungs_Typ, Status, Notizen
```
**Zweck:** Verwandte / Familienangehörige mit unterschiedlichen Versicherungen

---

#### 2. `tbl_Kontakte` 🏥
```sql
Kontakt_ID (PK), Kontakt_Name, Kontakt_Typ (Arzt/Zahnarzt/Klinik/Apotheke),
Fachrichtung, Adresse, Telefon, Email, IK_Nummer, Status
```
**Zweck:** Arzt- & Anbieter-Verzeichnis

---

#### 3. `tbl_Beihilfe_Saetze` 💰
```sql
BS_ID (PK), Patient_ID (FK), PKV_Quote (%), Beihilfe_Quote (%),
BET_Quote (%), Eigenanteil_Min, Eigenanteil_Max, Pflegezusatz,
Gueltigkeit_Von, Gueltigkeit_Bis
```
**Zweck:** Unterschiedliche Kostenverteilung pro Patient (PKV% + Beihilfe% muss 100% ergeben!)

**Beispiele:**
```
Max Mustermann (Beamter mit PKV): 50% PKV + 50% Beihilfe = 100% (+ optional 20% BET)
Erika Musterfrau (Beamtin ohne PKV): 0% PKV + 100% Beihilfe = 100%
Tim Musterkind (Schüler): 0% PKV + 100% Beihilfe = 100%
```

---

#### 4. `tbl_Antraege` 📝
```sql
Antrag_ID (PK), Patient_ID (FK), Antrag_Nr, Antrag_Datum,
Antrag_Periode (YYYY-MM), Status (offen/eingereicht/genehmigt/ausgezahlt),
Eingereicht_Am, Genehmigt_Am, Ausgezahlt_Am, Erstattungsbetrag, Notizen
```
**Zweck:** Tracking von eingereichten Beihilfe-Anträgen

**Status:**
- 🔴 **offen** - Noch nicht eingereicht
- 🟡 **eingereicht** - Bei Beihilfestelle eingegangen
- 🟢 **genehmigt** - Beihilfestelle hat genehmigt
- ✅ **ausgezahlt** - Geld erhalten

---

#### 5. `tbl_Aufwendungen` 💳
```sql
Auf_ID (PK), Patient_ID (FK), Kontakt_ID (FK), Antrag_ID (FK),
Auf_Datum, Auf_Typ, Beschreibung, Rechnungsbetrag,

-- 5-SÄULEN STATUS:
Rechnung_Status, Rechnung_Eingang_Datum,
PKV_Status, PKV_Erstattung, PKV_Erstattung_Datum,
BET_Status, BET_Betrag, BET_Datum,
Beihilfe_Status, Beihilfe_Erstattung, Beihilfe_Erstattung_Datum,
Pflege_Status, Pflege_Zuschuss,

-- RATENZAHLUNG:
Ratenzahlung_Aktiv, Ratenzahlung_Betrag, Ratenzahlung_Anz
```

**Zweck:** Zentrale Erfassung von Aufwendungen mit vollständigem Zahlungsfluss

---

## 📋 Das Hauptformular: "Aufwendungen & Status"

### Formular-Struktur (in app/form_aufwendungen_status.html):

#### **Sektion 1: Grunddaten**
- 👤 Patient (Dropdown)
- 📅 Datum der Aufwendung
- 🏥 Arzt / Kontakt (Dropdown)
- Aufwendungstyp (Arzt, Zahnarzt, Apotheke, KH, Therapie, Fahrtkosten, Parkgebühr)
- Beschreibung
- Rechnungsnummer
- 💰 Rechnungsbetrag

#### **Sektion 2: 5-Säulen Status** ⭐
Farbcodierung für den Status:

```
┌─────────────┬─────────────┬─────────────┬─────────────┬─────────────┐
│  RECHNUNG   │     PKV     │     BET     │  BEIHILFE   │   PFLEGE    │
├─────────────┼─────────────┼─────────────┼─────────────┼─────────────┤
│   Status:   │   Status:   │   Status:   │   Status:   │   Status:   │
│  ○ Offen    │  ○ Offen    │  ○ N/A      │  ○ Offen    │  ○ N/A      │
│  ○ Eingeg.  │  ○ Eingere. │  ○ Geplant  │  ○ Eingere. │  ○ Geplant  │
│  ○ Bearb.   │  ○ Erstattet│  ○ Gebündelt│  ○ Erstattet│  ○ Erledigt │
│  ○ Bezahlt  │  ○ Abgelehnt│  ○ Erledigt │  ○ Abgelehnt│             │
│             │             │             │             │             │
│   Datum:    │   Datum:    │   Datum:    │   Datum:    │   Datum:    │
│   [______]  │   [______]  │   [______]  │   [______]  │   [______]  │
│             │   Betrag:   │   Betrag:   │   Betrag:   │   Betrag:   │
│             │   [______]€ │   [______]€ │   [______]€ │   [______]€ │
└─────────────┴─────────────┴─────────────┴─────────────┴─────────────┘

   FARBEN:
   🔴 Rot    = Offen (noch nichts unternommen)
   🟡 Gelb   = In Bearbeitung (eingereicht)
   🟢 Grün   = Erledigt (erstattet/bezahlt)
   ⚫ Grau   = Trifft nicht zu (N/A)
```

**Jede Säule:**
- Dropdown für Status
- Datumfeld (wann geändert)
- Betrag-Feld (Erstattungsbetrag)

#### **Sektion 3: Ratenzahlung (optional)**
- ☑️ Checkbox "Ratenzahlung erforderlich"
- ⏰ Rate pro Monat (€)
- 📊 Anzahl Raten
- 📅 Ratenzahlung ab (Startdatum)

#### **Sektion 4: Notizen & Anhänge**
- 📝 Freitext-Notizen
- 📎 Dokumenten-Upload (PDF, Bilder, Office)

---

## 🎯 Anwendungs-Workflow

### Use Case 1: Neue Aufwendung erfassen

```
1. Formular öffnen: form_aufwendungen_status.html
2. Patient wählen (z.B. "Max Mustermann")
3. Aufwendungstyp wählen (z.B. "Zahnarzt")
4. Rechnungsbetrag eingeben (z.B. 450 €)
5. Alle Säulen-Status auf "🔴 offen" setzen (=default)
6. Speichern → Datenbank
```

### Use Case 2: Status aktualisieren

```
1. Bestehende Aufwendung öffnen
2. PKV-Status ändern: "eingereicht" → 🟡 Gelb
3. PKV-Datum setzen (heute)
4. Speichern
5. Später: PKV_Status → "erstattet" → 🟢 Grün
6. PKV_Erstattung eingeben (z.B. 225 €)
7. Speichern
```

### Use Case 3: Antragsstatus prüfen

```
1. Patient wählen
2. Antrag prüfen:
   - Ist eingereicht?
   - Bearbeitungsdauer (Eingereicht - heute)
   - Welche Aufwendungen noch ausstehend?
3. Fehlende Arbeitsschritte identifizieren
```

---

## 🔧 Installation

### 1. Datenbank initialisieren
```bash
cd /Users/davidsiegeris/Beihilfe-Planer
sqlite3 beihilfe.db < database/schema/01_core_tables.sql
```

### 2. Testdaten einfügen
```sql
INSERT INTO tbl_Patienten VALUES 
  (1, 'Mustermann', 'Max', '1965-03-15', 'M', 'PKV', 1, datetime('now'), NULL),
  (2, 'Musterfrau', 'Erika', '1968-07-22', 'W', 'Beihilfe', 1, datetime('now'), NULL),
  (3, 'Musterkind', 'Tim', '2015-11-10', 'M', 'Beihilfe', 1, datetime('now'), NULL);

INSERT INTO tbl_Kontakte VALUES 
  (1, 'Dr. Schmidt', 'Zahnarzt', 'Zahnmedizin', 'Hauptstr. 10', '10115', 'Berlin', '030-12345678', '0160-1234567', 'contact@dent.de', '123456789', 1, NULL, datetime('now')),
  (2, 'Dr. Meyer', 'Arzt', 'Internist', 'Bahnhofstr. 5', '10115', 'Berlin', '030-87654321', '0170-9876543', 'dr@meyer.de', '987654321', 1, NULL, datetime('now'));

INSERT INTO tbl_Beihilfe_Saetze VALUES 
  (1, 1, 50.0, 80.0, 20.0, 10.0, 1000.0, 0, '2024-01-01', '2024-12-31'),
  (2, 2, 0.0, 100.0, 0.0, 0.0, 500.0, 0, '2024-01-01', '2024-12-31');
```

### 3. Formular öffnen
```
Webbrowser: file:///Users/davidsiegeris/Beihilfe-Planer/app/form_aufwendungen_status.html
```

---

## 📊 SQL-Abfragen für häufige Aufgaben

### Alle ausstehenden Aufwendungen (Rot-Status)
```sql
SELECT a.Auf_ID, p.Patient_Name, a.Rechnungsbetrag, a.Auf_Datum
FROM tbl_Aufwendungen a
JOIN tbl_Patienten p ON a.Patient_ID = p.Patient_ID
WHERE a.Rechnung_Status = 'offen' OR a.PKV_Status = 'offen' OR a.Beihilfe_Status = 'offen'
ORDER BY a.Auf_Datum DESC;
```

### Bearbeitungsdauer pro Antrag
```sql
SELECT 
  a.Antrag_Nr,
  p.Patient_Name,
  a.Antrag_Datum,
  a.Eingereicht_Am,
  JULIANDAY(a.Genehmigt_Am) - JULIANDAY(a.Eingereicht_Am) AS tage_bis_genehmigung,
  a.Status
FROM tbl_Antraege a
JOIN tbl_Patienten p ON a.Patient_ID = p.Patient_ID
ORDER BY a.Antrag_Datum DESC;
```

### Aufwendungen pro Patient (Kostenübersicht)
```sql
SELECT 
  p.Patient_Name,
  COUNT(*) AS anzahl,
  SUM(a.Rechnungsbetrag) AS total,
  SUM(a.PKV_Erstattung) AS pkv_gezahlt,
  SUM(a.Beihilfe_Erstattung) AS beihilfe_gezahlt,
  SUM(a.Rechnungsbetrag) - SUM(COALESCE(a.PKV_Erstattung, 0)) - SUM(COALESCE(a.Beihilfe_Erstattung, 0)) AS eigenanteil
FROM tbl_Aufwendungen a
JOIN tbl_Patienten p ON a.Patient_ID = p.Patient_ID
GROUP BY p.Patient_ID
ORDER BY total DESC;
```

---

## 🚀 Nächste Schritte

- [ ] Backend-API (Python/Node.js/PHP) für Formular-Verarbeitung
- [ ] Patienten-Verwaltungs-Seite
- [ ] Kontakt-Verwaltungs-Seite
- [ ] Report-Generator (Jahresübersicht, etc.)
- [ ] PDF-Export für Beihilfestelle
- [ ] Belegverwaltung (Upload & Archivierung)
- [ ] Benutzer-Authentifizierung
- [ ] Mobile-Version (Responsive Design - teilweise bereits umgesetzt)

---

## 📖 Dokumentation

Siehe auch:
- [database/README.md](../database/README.md) - Vollständige DB-Dokumentation
- [database/docs/SCHEMA.md](../database/docs/SCHEMA.md) - Details aller Tabellen
- [database/docs/QUERIES.md](../database/docs/QUERIES.md) - SQL-Abfragen

---

**Version:** 1.0  
**Status:** MVP (Minimum Viable Product)  
**Erstellt:** 2026-06-25

