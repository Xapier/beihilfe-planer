# Beihilfe-Planer – Datenbankdokumentation

## Übersicht

Die Datenbank des Beihilfe-Planers besteht aus **4 Tabellen** und wird als SQLite-Datei im Docker-Volume persistiert. Das Schema wird beim Start des Backends automatisch initialisiert (`CREATE TABLE IF NOT EXISTS`).

**Schema-Datei:** [`schema/01_core_tables.sql`](schema/01_core_tables.sql)

## Wichtigste Module

## Tabellen

### `patients`
Versicherte Personen (Antragsteller und Familienmitglieder).

| Feld | Typ | Beschreibung |
|------|-----|-------------|
| id | TEXT (UUID) | Primärschlüssel |
| firstName | TEXT | Vorname |
| lastName | TEXT | Nachname |
| geburtsDatum | TEXT | optional |
| pkvQuote | REAL | PKV-Erstattungsquote in % |
| beihilfeQuote | REAL | Beihilfe-Erstattungsquote in % |

PKV- und Beihilfe-Quote werden im Frontend gegenseitig auf 100 % ergänzt.

---

### `contacts`
Ärzte, Kliniken, Apotheken und Therapeuten.

| Feld | Typ | Beschreibung |
|------|-----|-------------|
| id | TEXT (UUID) | Primärschlüssel |
| name | TEXT | Name / Bezeichnung |
| specialty | TEXT | Fachrichtung (optional) |
| address | TEXT | Adresse (optional) |
| phone | TEXT | Telefon (optional) |
| email | TEXT | E-Mail (optional) |

---

### `aufwendungen`
Alle Gesundheitsausgaben. Zentrale Tabelle mit dem **4-Säulen-System** (+ Rechnung).

| Feld | Typ | Beschreibung |
|------|-----|-------------|
| id | INTEGER (AI) | Primärschlüssel |
| patientId | TEXT | FK → patients |
| datum | TEXT | Rechnungs-/Leistungsdatum |
| faelligkeitsDatum | TEXT | Zahlungsfrist |
| kontaktId | TEXT | FK → contacts (optional) |
| aufTyp | TEXT | Typ: Rechnung, Fahrtkosten, Parkgebühr, KH-Kosten, ... |
| beschreibung | TEXT | Freitext-Beschreibung |
| rechnungsNr | TEXT | Rechnungsnummer |
| betrag | REAL | Gesamtbetrag |

**4-Säulen-Status** (für PKV, Beihilfe, BET) + Rechnungs-Status:

| Status-Feld | Bedeutung | Status-Werte |
|-------------|-----------|--------------|
| rechnungStatus | Eingang und Bezahlung der Originalrechnung | offen, eingegangen, bezahlt |
| pkvStatus | Private Krankenversicherung (inkl. BRE) | offen, eingereicht, BRE offen, BRE erstattet, erstattet, entfällt |
| beihilfeStatus | Staatliche Beihilfe | offen, eingereicht, erstattet, entfällt |
| betStatus | Beamten-Ergänzungs-Tarif | offen, eingereicht, erstattet, entfällt |

---

### `aufwendung_berechnungen` (NEU)

Speichert vorberechnete Werte für jede Aufwendung (zentrale Berechnung im Backend).

| Feld | Typ | Beschreibung |
|------|-----|-------------|
| id | TEXT (UUID) | Primärschlüssel |
| aufwendungId | INTEGER | FK → aufwendungen.id (mit CASCADE DELETE) |
| betrag | REAL | Gesamtbetrag |
| ausstehend | REAL | PKV ausstehend + Beihilfe ausstehend |
| eigenbehalt | REAL | Betrag - PKV erl. - Beihilfe erl. (nur wenn entfällt) |
| pkvSoll | REAL | PKV-Quote × Betrag |
| pkvAusstehend | REAL | PKV-Soll wenn Status ∈ {offen, eingereicht} |
| pkvErledigt | REAL | PKV-Soll wenn Status = "erstattet" |
| beihilfeSoll | REAL | Beihilfe-Quote × Betrag |
| beihilfeAusstehend | REAL | Beihilfe-Soll wenn Status ∈ {offen, eingereicht} |
| beihilfeErledigt | REAL | Beihilfe-Soll wenn Status = "erstattet" |
| betSoll | REAL | BET-Soll (normalerweise 0) |
| betErledigt | REAL | BET-Erledigt (normalerweise 0) |
| calculatedAt | TEXT (ISO) | Zeitstempel der Berechnung |

**Besonderheit:** Diese Tabelle wird automatisch bei Status-Änderungen neu berechnet. Die Formeln befinden sich in `backend/src/db/migrations.js` (`calculateAmounts()` Funktion).

---

## Indizes

```sql
idx_aufwendungen_patientId
idx_aufwendungen_datum
idx_aufwendungen_faelligkeitsDatum
idx_aufwendungen_status  (rechnungStatus, pkvStatus, beihilfeStatus)
```

---

## Berechnung (Backend-Architektur)

**Zentralisierte Berechnung:** Alle Berechnungen erfolgen im Backend, nicht im Frontend.

### Berechnung-Algorithmus (`backend/src/db/migrations.js`)

```javascript
function calculateAmounts(patient, auf) {
  // 1. Sollbeträge berechnen (basierend auf Quoten)
  const pkvSoll = (betrag * pkvQuote) / 100;
  const beihilfeSoll = (betrag * beihilfeQuote) / 100;

  // 2. Ausstehende Beträge (nur wenn offen/eingereicht)
  const pkvAusstehend = (auf.pkvStatus ∈ {offen, eingereicht}) ? pkvSoll : 0;
  const beihilfeAusstehend = (auf.beihilfeStatus ∈ {offen, eingereicht}) ? beihilfeSoll : 0;
  const ausstehend = pkvAusstehend + beihilfeAusstehend;

  // 3. Erledigte Beträge (nur wenn erstattet)
  const pkvErledigt = (auf.pkvStatus === "erstattet") ? pkvSoll : 0;
  const beihilfeErledigt = (auf.beihilfeStatus === "erstattet") ? beihilfeSoll : 0;

  // 4. Eigenbehalt (nur wenn entfällt)
  const eigenbehalt = (auf.pkvStatus === "entfällt" OR auf.beihilfeStatus === "entfällt")
    ? (betrag - pkvErledigt - beihilfeErledigt)
    : 0;

  return { pkvSoll, pkvAusstehend, pkvErledigt, beihilfeSoll, beihilfeAusstehend, 
           beihilfeErledigt, ausstehend, eigenbehalt };
}
```

### Aufruf & Caching

- **Trigger:** Bei jeder Änderung eines aufwendung-Status
- **Speicherort:** Tabelle `aufwendung_berechnungen`
- **API-Response:** Berechnungen als `berechnungen` Objekt in jedem aufwendung

### Frontend-Verwendung

Das Frontend bezieht **alle berechneten Werte** von der API:
```javascript
// Frontend nutzt vorberechnete Werte (KEIN Fallback zu lokalen Berechnungen)
auf.berechnungen.ausstehend     // € noch zu erwarten
auf.berechnungen.eigenbehalt    // € Patient zahlt
auf.berechnungen.pkvAusstehend  // € von PKV ausstehend
```

## Verzeichnisstruktur

```
database/
├── schema/
│   └── 01_core_tables.sql   ← Produktionsschema (3 Tabellen + Indizes)
├── CLEANUP_ANALYSIS.md      ← Dokumentation der Bereinigung (BOP-Artefakte)
└── README.md                ← Dieses Dokument
```

