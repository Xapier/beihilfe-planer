# Beihilfe-Planer – Datenbankdokumentation

## Übersicht

Die Datenbank des Beihilfe-Planers besteht aus **3 Tabellen** und wird als SQLite-Datei im Docker-Volume persistiert. Das Schema wird beim Start des Backends automatisch initialisiert (`CREATE TABLE IF NOT EXISTS`).

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
Alle Gesundheitsausgaben. Zentrale Tabelle mit dem **5-Säulen-System**.

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

**5-Säulen-Status** (je `offen` / `eingereicht` / `erstattet` / `abgelehnt`):

| Status-Feld | Betrag-Feld | Bedeutung |
|-------------|-------------|-----------|
| rechnungStatus | — | Eingang und Bezahlung der Rechnung |
| pkvStatus | pkvBetrag | Private Krankenversicherung |
| betStatus | betBetrag | Beamten-Ergänzungs-Tarif |
| beihilfeStatus | beihilfeBetrag | Staatliche Beihilfe |
| pflegeStatus | pflegeBetrag | Pflegezusatz |

`statusDaten` (JSON) speichert optionale Zeitstempel pro Säule.

---

## Indizes

```sql
idx_aufwendungen_patientId
idx_aufwendungen_datum
idx_aufwendungen_faelligkeitsDatum
idx_aufwendungen_status  (rechnungStatus, pkvStatus, beihilfeStatus)
```

## Verzeichnisstruktur

```
database/
├── schema/
│   └── 01_core_tables.sql   ← Produktionsschema (3 Tabellen + Indizes)
├── CLEANUP_ANALYSIS.md      ← Dokumentation der Bereinigung (BOP-Artefakte)
└── README.md                ← Dieses Dokument
```

