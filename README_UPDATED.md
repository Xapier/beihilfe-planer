# 🎯 Beihilfe-Planer - Vereinfachte Anwendung

> **Eine fokussierte Web-Anwendung zur Verwaltung von Gesundheitskosten und Beihilfeansprüchen**

## ✨ Was wurde umgesetzt?

### 1️⃣ **Optimierte Datenbank** (5 Essentials-Tabellen)

Statt der ursprünglichen 35+ Tabellen wurde ein **schlankes Schema** mit den wichtigsten Features erstellt:

```sql
✅ tbl_Patienten         (Familienmitglieder)
✅ tbl_Kontakte          (Ärzte, Kliniken, Apotheken)
✅ tbl_Beihilfe_Saetze   (Unterschiedliche Kostenquoten pro Patient)
✅ tbl_Antraege          (Status eingereichte Anträge)
✅ tbl_Aufwendungen      (Kostenerfassung mit 5-Säulen System)
```

**Datei:** [`database/schema/01_core_tables.sql`](database/schema/01_core_tables.sql)

---

### 2️⃣ **Interaktives HTML-Formular** - "Aufwendungen & Status"

Ein modernes, benutzerfreundliches Formular mit **5 Bearbeitungssäulen**:

```
┌──────────┬─────────┬─────────┬──────────┬─────────┐
│ RECHNUNG │   PKV   │   BET   │ BEIHILFE │ PFLEGE  │
├──────────┼─────────┼─────────┼──────────┼─────────┤
│ 🔴 Offen │ 🟡 Bearb│ 🟢 Erl. │ 🟡 Bearb │ ⚫ N/A   │
└──────────┴─────────┴─────────┴──────────┴─────────┘
```

**Features:**
- ✅ Echtzeit Farb-Codierung (Rot→Gelb→Grün)
- ✅ Datumsverfolgung pro Status
- ✅ Betrag-Eingabe (Erstattungen)
- ✅ Ratenzahlung-Verwaltung
- ✅ Dokumenten-Upload
- ✅ Responsive Design (Mobile, Tablet, Desktop)

**Datei:** [`app/form_aufwendungen_status.html`](app/form_aufwendungen_status.html)

---

### 3️⃣ **Web-Anwendung mit Navigation**

```
app/
├── index.html (Dashboard)
├── form_aufwendungen_status.html (Hauptformular)
├── patients.html (Patienten - Platzhalter)
├── contacts.html (Kontakte - Platzhalter)
├── reports.html (Berichte - Platzhalter)
└── README.md (Dokumentation)
```

---

## 📊 Datenbank-Schema Übersicht

### Tabelle: `tbl_Aufwendungen` (Herzstück)

```sql
Auf_ID              -- Eindeutige ID
Patient_ID          -- Welcher Patient
Kontakt_ID          -- Welcher Arzt/Anbieter
Auf_Datum           -- Wann
Auf_Typ             -- Arzt/Zahnarzt/Apotheke/KH/etc.
Rechnungsbetrag     -- Kostengesamtbetrag

-- 5-SÄULEN STATUS:
Rechnung_Status + Datum + Eingang
PKV_Status + Datum + Erstattung
BET_Status + Datum + Betrag
Beihilfe_Status + Datum + Erstattung
Pflege_Status + Datum + Zuschuss

-- RATENZAHLUNG:
Ratenzahlung_Aktiv + Betrag + Anzahl
```

---

## 🎨 Das Formular im Detail

### Sektion 1: Grunddaten ✏️
```
Patient:           [Dropdown: Max, Erika, Tim]
Datum:             [2026-06-25]
Arzt/Klinik:       [Dropdown: Dr. Schmidt, ...]
Aufwendungstyp:    [Dropdown: Zahnarzt, Apotheke, ...]
Rechnungsnummer:   [REG-2024-001]
Rechnungsbetrag:   [€450.00]
```

### Sektion 2: 5-Säulen Status ⭐
Jede Säule mit eigenem Zustand:
```
┌─ RECHNUNG ─┐
│ Status:    │  [Dropdown: Offen, Eingegangen, Bearbeitet, Bezahlt]
│ Datum:     │  [2026-06-25]
└────────────┘

┌─ PKV ──────┐
│ Status:    │  [Dropdown: Offen, Eingereicht, Erstattet, Abgelehnt]
│ Datum:     │  [2026-06-28]
│ Betrag:    │  [€225.00]
└────────────┘

... (weitere 3 Säulen analog)
```

### Sektion 3: Ratenzahlung 🔄
```
☑️ Ratenzahlung erforderlich
   Rate:      [€100.00]
   Anzahl:    [5]
   Beginn:    [2026-07-15]
```

### Sektion 4: Notizen 📝
```
Notizen:           [Textbox für Bemerkungen]
Dokumente:         [Multifile Upload]
```

---

## 🚀 Schnellstart

### 1. Datenbank erstellen
```bash
cd /Users/davidsiegeris/Beihilfe-Planer
sqlite3 beihilfe.db < database/schema/01_core_tables.sql
```

### 2. Testdaten einfügen
```bash
sqlite3 beihilfe.db < database/schema/sample_data.sql  # (wird noch erstellt)
```

### 3. Web-App öffnen
```bash
# Option A: Direkter Dateizugriff
open app/index.html

# Option B: Local Web Server
cd app && python3 -m http.server 8000
# http://localhost:8000

# Option C: Mit Node.js
npx http-server app -p 8000
```

---

## 📋 Beihilfe-Sätze pro Patient

Die `tbl_Beihilfe_Saetze` ermöglicht unterschiedliche Kostenverteilung:

**Beispiel Max (Beamter mit PKV):**
```
Patient:          Max
Versicherung:     PKV
PKV-Quote:        50%    (Private KV zahlt 50%)
Beihilfe-Quote:   80%    (Beihilfe zahlt 80%)
BET-Quote:        20%    (BET-Ergänzung 20%)
Eigenanteil:      Variabel
```

**Beispiel Erika (Beamtin, nur Beihilfe):**
```
Patient:          Erika
Versicherung:     Beihilfe
PKV-Quote:        0%     (Keine PKV)
Beihilfe-Quote:   100%   (Beihilfe zahlt alles)
BET-Quote:        0%     (Keine BET)
Eigenanteil:      0€ - 600€ pro Jahr
```

**Beispiel Tim (Kind, Beihilfe):**
```
Patient:          Tim
Versicherung:     Beihilfe
PKV-Quote:        0%
Beihilfe-Quote:   100%   (Kinder meist 100%)
BET-Quote:        0%
Eigenanteil:      0€     (Keine Zuzahlung für Kinder)
```

---

## 🎯 Anwendungs-Szenarien

### Szenario 1: Neue Zahnarzt-Rechnung
```
1. Formular öffnen
2. Patient: "Max Mustermann"
3. Aufwendungstyp: "Zahnbehandlung"
4. Rechnungsbetrag: €450
5. Arzt: "Dr. Schmidt"
6. Alle Status: 🔴 Rot (Offen)
7. Speichern → Datenbank
```

### Szenario 2: PKV-Zahlung registrieren
```
1. Bestehende Aufwendung öffnen
2. PKV-Status: Gelb "Eingereicht" → Grün "Erstattet"
3. PKV-Datum: 2026-06-28
4. PKV-Betrag: €225.00
5. Speichern → Status aktualisiert
```

### Szenario 3: Antragsstatus prüfen
```
1. Tab "Antrag-Status"
2. Antrag-Nummer: "2024-06-001"
3. Status: "Eingereicht" (seit 10 Tagen)
4. Aufwendungen: 5 offen, 3 bearbeitet, 2 erledigt
5. Nächste Aktion: "PKV-Einreichung bei fehlenden Belegen"
```

---

## 💾 Datenbank-Befehle

### Neue Aufwendung erfassen
```sql
INSERT INTO tbl_Aufwendungen (
    Patient_ID, Kontakt_ID, Auf_Datum, Auf_Typ, 
    Auf_Beschreibung, Rechnungsbetrag, Rechnung_Status
) VALUES (
    1, 1, '2026-06-25', 'Zahnarzt', 
    'Zahnreinigung und 2 Füllungen', 450.00, 'offen'
);
```

### Status aktualisieren
```sql
UPDATE tbl_Aufwendungen 
SET 
    PKV_Status = 'erstattet',
    PKV_Erstattung_Datum = '2026-06-28',
    PKV_Erstattung = 225.00
WHERE Auf_ID = 1;
```

### Monatliche Übersicht
```sql
SELECT 
    strftime('%Y-%m', Auf_Datum) AS Monat,
    COUNT(*) AS Anzahl,
    SUM(Rechnungsbetrag) AS Gesamtbetrag,
    SUM(PKV_Erstattung) AS PKV,
    SUM(Beihilfe_Erstattung) AS Beihilfe
FROM tbl_Aufwendungen
GROUP BY strftime('%Y-%m', Auf_Datum)
ORDER BY Monat DESC;
```

---

## 📁 Projektstruktur

```
/Beihilfe-Planer/
├── app/                                (🆕 Webanwendung)
│   ├── index.html                      (Dashboard)
│   ├── form_aufwendungen_status.html   (Hauptformular)
│   ├── patients.html                   (Patienten - TBD)
│   ├── contacts.html                   (Kontakte - TBD)
│   ├── reports.html                    (Berichte - TBD)
│   └── README.md                       (App-Dokumentation)
│
├── database/
│   ├── schema/
│   │   ├── 01_core_tables.sql          (✨ OPTIMIERT)
│   │   └── [alte Dateien - optional löschbar]
│   ├── docs/
│   │   └── [Dokumentation]
│   └── README.md
│
├── SIMPLIFIED_VERSION.md               (Diese Dokumentation)
└── README.md                           (Projekt-Überblick)
```

---

## 🔄 Workflow: Von Erfassung bis Erstattung

```
Tag 1: Arztbesuch
├─ Aufwendung erfassen: Form ausfüllen
└─ Status: 🔴 Rechnung offen

Tag 5: Rechnung erhalten
├─ Rechnung_Status: Eingegangen
└─ Status: 🔴 PKV + Beihilfe offen

Tag 10: PKV einreichung
├─ PKV_Status: 🟡 Eingereicht
├─ PKV_Einreichung_Datum: 2026-06-10
└─ Beihilfe_Status: 🔴 Offen

Tag 20: PKV zahlt
├─ PKV_Status: 🟢 Erstattet
├─ PKV_Erstattung: €225.00
├─ PKV_Erstattung_Datum: 2026-06-20
└─ Beihilfe_Status: 🔴 Offen

Tag 25: Beihilfe zahlt
├─ Beihilfe_Status: 🟢 Erstattet
├─ Beihilfe_Erstattung: €180.00
├─ Beihilfe_Erstattung_Datum: 2026-06-25
└─ Final Status: ✅ Alle Säulen Grün
```

---

## 🎓 Technologie-Stack

### Frontend
- **HTML5** - Strukturierung
- **CSS3** - Styling & Layout (Flexbox, Grid)
- **Vanilla JavaScript** - Interaktivität (keine jQuery, React, Vue)

### Backend (zu implementieren)
- Node.js + Express / Python Flask / PHP Laravel
- SQLite3 Datenbank
- REST API

### Datenbank
- SQLite3 (.s3db Format)
- 5 Kern-Tabellen
- ~50 Spalten total

---

## ✅ Testing-Checkliste

- [ ] Formular öffnet korrekt
- [ ] Alle Felder sind editierbar
- [ ] Status-Farben wechseln korrekt
- [ ] Ratenzahlung Toggle funktioniert
- [ ] Datepicker funktioniert
- [ ] Dokumenten-Upload funktioniert
- [ ] Responsive auf Mobile/Tablet
- [ ] Formular Reset funktioniert
- [ ] Speichern triggert Bestätigung
- [ ] Alle Links funktionieren

---

## 🚀 Nächste Schritte

### Phase 1: Backend-Integration (Diese Woche)
- [ ] Node.js/Express Setup
- [ ] REST API Endpoints
- [ ] SQLite Verbindung
- [ ] Formular ↔ Datenbank Sync

### Phase 2: Weitere Seiten (Diese Woche)
- [ ] Patienten-CRUD
- [ ] Kontakt-CRUD
- [ ] Antrag-Übersicht
- [ ] Status-Reports

### Phase 3: Advanced Features (Nächste Woche)
- [ ] PDF-Export
- [ ] Excel-Export
- [ ] Benutzer-Login
- [ ] Audit-Trail
- [ ] Mobile App (React Native)

---

## 📞 Support

**Fragen zur Anwendung?**
- 📖 Siehe [app/README.md](app/README.md)
- 🗄️ Siehe [database/README.md](database/README.md)
- 📝 Siehe [database/docs/](database/docs/)

---

## 📄 Lizenz

[Ihre Lizenz hier]

---

**🎉 Projekt abgeschlossen: 2026-06-25**  
**Status:** MVP fertig, bereit für Backend-Integration

