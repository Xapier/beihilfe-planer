# Beihilfe-Planer Backend

Node.js + Express REST-API mit zentralisierter Berechnungslogik für Aufwendungen.

## Technologie-Stack

- **Runtime:** Node.js v18 (Alpine Linux)
- **Framework:** Express.js
- **Datenbank:** SQLite3 (persistent volume)
- **Deployment:** Docker / Docker Compose

## Architektur

### Module

```
backend/src/
├── db/
│   ├── database.js        # SQLite Verbindung & Schema-Initialisierung (generiert DDL)
│   └── migrations.js      # Zentrale calculateAmounts() Funktion & Auto-Migration
├── models/
│   └── Aufwendung.js      # Data Access Layer mit Calculation Caching
├── routes/
│   └── aufwendungen.js    # REST-API Endpoints (+ Debug-Routes)
└── server.js              # Express App Initialisierung
```

**Schema-Referenzmaterial:** Siehe auch [`database/schema/01_core_tables.sql`](../database/schema/01_core_tables.sql)

### Berechnungslogik

**Zentrale Funktion:** `calculateAmounts(patient, auf)` in `backend/src/db/migrations.js`

```javascript
function calculateAmounts(patient, auf) {
  // Sollbeträge basierend auf Quote
  const pkvSoll = (betrag * pkvQuote) / 100;
  const beihilfeSoll = (betrag * beihilfeQuote) / 100;

  // Ausstehend: Sum of pending amounts
  const pkvAusstehend = ['offen', 'eingereicht'].includes(auf.pkvStatus) ? pkvSoll : 0;
  const beihilfeAusstehend = ['offen', 'eingereicht'].includes(auf.beihilfeStatus) ? beihilfeSoll : 0;
  const ausstehend = pkvAusstehend + beihilfeAusstehend;

  // Erledigt: Only when "erstattet"
  const pkvErledigt = auf.pkvStatus === 'erstattet' ? pkvSoll : 0;
  const beihilfeErledigt = auf.beihilfeStatus === 'erstattet' ? beihilfeSoll : 0;

  // Eigenbehalt: Only when entfällt
  const eigenbehalt = (auf.pkvStatus === 'entfällt' || auf.beihilfeStatus === 'entfällt')
    ? Math.max(0, betrag - pkvErledigt - beihilfeErledigt)
    : 0;

  return { pkvSoll, pkvAusstehend, pkvErledigt, beihilfeSoll, beihilfeAusstehend, 
           beihilfeErledigt, eigenbehalt, ausstehend, betSoll: 0, betErledigt: 0, 
           calculatedAt: new Date().toISOString() };
}
```

**Speicherung:** Alle berechneten Werte werden in der Tabelle `aufwendung_berechnungen` gecacht.

---

## REST-API Endpoints

### Production Endpoints (immer verfügbar)

#### GET `/api/aufwendungen`
Alle 178 Aufwendungen mit vorberechneten Berechnungen abrufen.

**Response:**
```json
[
  {
    "id": 1,
    "patientId": "...",
    "betrag": 150.00,
    "datum": "2026-06-27",
    "status": { "rechnung": "bezahlt", "pkv": "erstattet", "beihilfe": "offen", "bet": "entfällt" },
    "berechnungen": {
      "pkvSoll": 75.00,
      "pkvAusstehend": 0,
      "pkvErledigt": 75.00,
      "beihilfeSoll": 75.00,
      "beihilfeAusstehend": 75.00,
      "beihilfeErledigt": 0,
      "eigenbehalt": 0,
      "ausstehend": 75.00,
      "calculatedAt": "2026-06-27T10:30:45.123Z"
    }
  }
]
```

#### GET `/api/aufwendungen/patient/:patientId`
Aufwendungen für einen bestimmten Patienten.

---

### Debug Endpoints (nur Development)

⚠️ **Nur aktiv wenn** `NODE_ENV === 'development'`

#### GET `/api/aufwendungen/debug/calc/:id`
Detaillierte Berechnungsdaten für einzelne Aufwendung (mit Patient-ID, Beträge, etc.)

#### GET `/api/aufwendungen/debug/all-calcs`
Erste 5 Berechnungen aus Datenbank (zum Debugging)

#### POST `/api/aufwendungen/debug/recalculate`
Lösche alle `aufwendung_berechnungen` und triggere Neuberechnung aller 178 Records.

**Response:**
```json
{
  "success": true,
  "message": "Neuberechnung abgeschlossen: 178 Records",
  "count": 178
}
```

---

## Development Setup

### Lokal (ohne Docker)

```bash
cd backend
npm install
NODE_ENV=development npm start
```

Debug-Endpoints sind dann unter `http://localhost:3000/api/aufwendungen/debug/*` erreichbar.

### Mit Docker (Production-Simulation)

```bash
cd /path/to/beihilfe-planer
docker compose up --build -d
```

Debug-Endpoints sind **nicht erreichbar** (Production-Modus).

---

## Environment Variables

| Variable | Wert | Zweck |
|----------|------|-------|
| `NODE_ENV` | `development` | Aktiviert Debug-Endpoints & verbose Logging |
| `NODE_ENV` | `production` | Deaktiviert Debug-Endpoints, optimiert Performance |
| `PORT` | `3000` (default) | Express Server Port |
| `DB_PATH` | `/data/beihilfe.db` | SQLite Datenbankpfad |

**In Production (docker-compose.yml):**
```yaml
environment:
  NODE_ENV: production
  PORT: 3000
  DB_PATH: /data/beihilfe.db
```

**Für Development:**
```bash
NODE_ENV=development npm start
```

---

## Datenbank-Migrationen

Beim Backend-Start automatisch ausgelöst:

1. **Initialisierung:** Alle 4 Tabellen werden mit `CREATE TABLE IF NOT EXISTS` angelegt
2. **Auto-Migration:** Alle existierenden Aufwendungen werden mit `calculateAmounts()` durchgerechnet
3. **Ergebnis:** 178 Records in `aufwendung_berechnungen` Tabelle mit aktuellen Berechnungen

**Manuelle Neuberechnung:**
```bash
curl -X POST http://localhost:3000/api/aufwendungen/debug/recalculate
# (Nur im Development-Modus verfügbar)
```

---

## Sicherheit

### Debug-Endpoints

⚠️ **Sicherheitskritisch:** Debug-Endpoints exponieren personenbezogene Daten!

- **Production:** Automatisch deaktiviert (`NODE_ENV=production`)
- **Development:** Nur verfügbar bei `NODE_ENV === 'development'` (explizit aktivieren!)
- **Staging/Test:** Debug-Endpoints werden **nicht** aktiviert (sicherer Standard)

### Sensible Daten

Die Debug-API gibt folgende Informationen preis:
- Patient-IDs
- Beträge & Berechnungen
- Status-Informationen
- Timestamps

**Freigabe nur in authorized Development Umgebungen!**

---

## Troubleshooting

### Migration läuft nicht

**Symptom:** 178 Records nicht in `aufwendung_berechnungen`

**Lösung:**
```bash
# 1. Manuell via Debug-Endpoint (nur Development)
NODE_ENV=development npm start
curl -X POST http://localhost:3000/api/aufwendungen/debug/recalculate

# 2. Oder Docker rebuild
docker compose up --build -d backend
docker compose logs backend
```

### Debug-Endpoints nicht erreichbar

**Symptom:** 404 auf `/api/aufwendungen/debug/*`

**Wahrscheinlich Production-Modus:**
```bash
# Check NODE_ENV
docker compose exec backend printenv NODE_ENV

# Wenn "production": Debug-Endpoints sind absichtlich deaktiviert
# Für Development starten:
NODE_ENV=development npm start
```

### Timestamp-Format Mismatch

**Problem:** `calculatedAt` hat unterschiedliche Formate

**Lösung:** Beide INSERT und UPDATE verwenden ISO-8601 String (nicht gemischt mit CURRENT_TIMESTAMP)

```javascript
calculatedAt: new Date().toISOString()  // z.B. "2026-06-27T10:30:45.123Z"
```

---

## Performance

### N+1 Query Prevention

Aufwendungen werden mit `Promise.all()` batch-geladen (nicht pro Aufwendung separate DB-Queries).

```javascript
const aufwendungen = await Aufwendung.getAll();  // Efficient batch-loading
```

### Calculation Caching

Berechnungen sind in `aufwendung_berechnungen` gecacht → nur einmalige Berechnung bei Status-Change.

---

## Dokumentation

- [Root README](../README.md) - Allgemeiner Überblick
- [Database README](../database/README.md) - Datenbankschema
- [Frontend README](../app/README.md) - UI & 5-Säulen-System
