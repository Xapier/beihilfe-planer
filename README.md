# Beihilfe-Planer

Web-Anwendung zur Erfassung und Nachverfolgung von Gesundheitskosten für Beamte mit Beihilfeanspruch und privater Krankenversicherung (PKV).

## Funktionsumfang

### Patienten

Jeder Patient (Antragsteller oder Familienmitglied) wird mit individuellen Erstattungsquoten geführt:

- **PKV-Quote** und **Beihilfe-Quote** ergänzen sich automatisch auf 100 % (Eingabe eines Werts berechnet den anderen)
- Geburtsdatum optional

### Kontakte

Ärzte, Kliniken, Apotheken und Therapeuten können als Kontakte hinterlegt werden und stehen beim Erfassen von Aufwendungen als Zuordnung zur Verfügung.

### Aufwendungen

Kern der Anwendung. Jede Aufwendung durchläuft ein **5-Säulen-System**:

| Säule | Beschreibung |
|-------|-------------|
| **Rechnung** | Eingang und Bezahlung der Originalrechnung |
| **PKV** | Einreichung und Erstattung durch die private Krankenversicherung |
| **BET** | Beamten-Ergänzungs-Tarif (Sammeleinreichung) |
| **Beihilfe** | Staatliche Beihilfe (Antrag bei der Beihilfestelle) |

Jede Säule hat einen eigenen Status (`offen` → `eingereicht` → `erstattet`/`abgelehnt`) und einen Erstattungsbetrag.

**Unterstützte Aufwendungstypen:** Arzt, Zahnarzt, Apotheke, Krankenhaus, Therapie, Fahrtkosten, Parkgebühr, Sonstiges

**Farbkodierung in der Übersicht:**
- 🔴 Rot — offen/fällig
- 🟡 Gelb — eingereicht/in Bearbeitung
- 🟢 Grün — erledigt/erstattet
- ⚫ Grau — nicht zutreffend (N/A)
- 🟣 Lila — überfällig

## Technischer Aufbau

```
Frontend (nginx)       → statische HTML/CSS/JS Seiten
Backend (Node.js)      → REST-API auf Port 3000
Datenbank (SQLite)     → 3 Tabellen: patients, contacts, aufwendungen
```

### Deployment (Docker)

```bash
git clone https://github.com/Xapier/beihilfe-planer.git
cd beihilfe-planer
docker compose up -d
```

Die Anwendung ist danach erreichbar unter `http://<host>`.  
Beim ersten Start wird eine **leere Datenbank** automatisch initialisiert.

### Datenmigration aus BOP_SQL_Daten

Falls eine bestehende Access/SQLite-Datenbank (BOP_SQL_Daten.s3db) migriert werden soll:

```bash
cd migrate
npm install
node migrate_bop_corrected.js "<Pfad zur BOP_SQL_Daten.s3db>" "./beihilfe-migrated.db"
```

Anschließend die erzeugte `beihilfe-migrated.db` in das Docker-Volume einspielen.  
Detaillierte Anleitung: [migrate/MIGRATION_GUIDE.md](migrate/MIGRATION_GUIDE.md)

## Datenbankschema

Siehe [database/schema/01_core_tables.sql](database/schema/01_core_tables.sql)

## Lizenz

Siehe [LICENSE](LICENSE)
