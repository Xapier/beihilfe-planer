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
| **PKV** | Einreichung und Erstattung durch die private Krankenversicherung (mit BRE-Support) |
| **Beihilfeergänzung (BET)** | Beihilfeergänzungstarif oder entfällt |
| **Beihilfe** | Staatliche Beihilfe (Antrag bei der Beihilfestelle) |

Jede Säule hat einen eigenen Status und einen Erstattungsbetrag:
- **Rechnung:** offen → eingegangen → bezahlt
- **PKV:** offen → eingereicht → BRE offen → BRE erstattet → erstattet / entfällt
- **Beihilfeergänzung (BET):** entfällt (Standard) oder offen → eingereicht → erstattet
- **Beihilfe:** offen → eingereicht → erstattet / entfällt

### Berechnung von Ausstehend und Eigenbehalt

**Zentrale Berechnungslogik** befindet sich im Backend (`calculateAmounts()` in `backend/src/db/migrations.js`). Frontend bezieht alle berechneten Werte von der API.

**Formeln:**
```
PKV ausstehend = PKV-Soll, wenn Status ∈ {offen, eingereicht}, sonst 0
Beihilfe ausstehend = Beihilfe-Soll, wenn Status ∈ {offen, eingereicht}, sonst 0

AUSSTEHEND = PKV ausstehend + Beihilfe ausstehend
             (Summe der noch zu erwartenden Erstattungen)

PKV erledigt = PKV-Soll, wenn Status = "erstattet", sonst 0
Beihilfe erledigt = Beihilfe-Soll, wenn Status = "erstattet", sonst 0

EIGENBEHALT = Betrag - PKV erledigt - Beihilfe erledigt
              (nur wenn PKV Status = "entfällt" ODER Beihilfe Status = "entfällt")
              (sonst 0 - Patient zahlt nichts, da Kostenträger zuständig)
```

**Unterstützte Aufwendungstypen:** Arzt, Zahnarzt, Apotheke, Krankenhaus, Therapie, Fahrtkosten, Parkgebühr, Sonstiges

**Farbkodierung in der Übersicht:**
- 🔴 Rot — offen/fällig
- 🟡 Gelb — eingereicht/in Bearbeitung
- 🟢 Grün — erledigt/erstattet
- ⚫ Grau — nicht zutreffend (N/A)
- 🟣 Lila — überfällig

## Technischer Aufbau

**Architektur:**
- **Frontend (nginx):** Statische HTML/CSS/JS-Seiten (Pure JavaScript, keine Frameworks)
- **Backend (Node.js + Express):** REST-API mit zentraler Berechnung
- **Datenbank (SQLite):** Schemas in `database/schema/`

**Besonderheit:** Alle Berechnungen (Ausstehend, Eigenbehalt, etc.) erfolgen **zentral im Backend**. Das Frontend verwendet nur die API-Ergebnisse – keine lokalen Berechnungen.

**Datenpersistenz:**
- SQLite-Datei im Docker-Volume `db_data:/data`
- Auto-Migration beim Backend-Start
- 178 Testdatensätze werden bei Bedarf migriert

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
