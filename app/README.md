# Beihilfe-Planer – Frontend

Statische HTML/CSS/JavaScript-Oberfläche, ausgeliefert über nginx. Kommuniziert ausschließlich über die REST-API des Backends.

**Technologie:** HTML5 / CSS3 / Vanilla JavaScript (keine externen Abhängigkeiten)

## Seiten

```
app/
├── index.html                    → Dashboard mit Übersicht offener Aufwendungen
├── form_aufwendungen_status.html → Aufwendungen erfassen und Status verwalten
├── patients.html                 → Patienten anlegen und bearbeiten
├── contacts.html                 → Kontakte (Ärzte, Kliniken) verwalten
├── reports.html                  → Auswertungen
└── api.js                        → Gemeinsamer API-Client für alle Seiten
```

## API-Client (`api.js`)

Alle Seiten verwenden dasselbe `api.js`, das HTTP-Anfragen an `/api` sendet (nginx-Proxy → Backend Port 3000).

```javascript
API.patients.getAll()
API.patients.create(data)
API.patients.update(id, data)
API.patients.delete(id)

API.contacts.getAll()
API.contacts.create(data)
// ...

API.aufwendungen.getAll()
API.aufwendungen.getByPatient(patientId)
API.aufwendungen.create(data)
// ...
```

## Patienten (`patients.html`)

- Patient anlegen mit Vorname, Nachname, Geburtsdatum
- **PKV-Quote** und **Beihilfe-Quote** ergänzen sich automatisch auf 100 %:
  - PKV-Quote eingeben → Beihilfe-Quote wird berechnet
  - Beihilfe-Quote eingeben → PKV-Quote wird berechnet
- Validierung verhindert Speichern ohne mindestens einen Quotenwert

## Aufwendungen (`form_aufwendungen_status.html`)

Hauptformular der Anwendung.

### Erfassungsfelder

| Feld | Pflicht | Beschreibung |
|------|---------|-------------|
| Patient | ja | Auswahl aus vorhandenen Patienten |
| Datum | ja | Leistungs-/Rechnungsdatum |
| Fälligkeitsdatum | ja | Zahlungsfrist |
| Kontakt | nein | Arzt, Klinik, Apotheke |
| Aufwendungstyp | ja | Rechnung, Fahrtkosten, Parkgebühr, KH-Kosten, ... |
| Beschreibung | nein | Freitext |
| Rechnungsnummer | nein | Belegnummer |
| Betrag | ja | Gesamtbetrag in € |

### 5-Säulen-Statusverwaltung

Jede Aufwendung hat 5 unabhängige Status-Spalten:

| Säule | Status-Werte |
|-------|-------------|
| Rechnung | offen → eingegangen → bezahlt |
| PKV | offen → eingereicht → erstattet / abgelehnt |
| BET | offen → eingereicht → erstattet / abgelehnt |
| Beihilfe | offen → eingereicht → erstattet / abgelehnt |
| Pflege | offen → geplant → erledigt |

**Farbkodierung:**
- Rot — offen
- Gelb — eingereicht / in Bearbeitung
- Grün — erledigt / erstattet
- Grau — nicht zutreffend (N/A)
- Lila — überfällig

Zu jeder Säule kann ein tatsächlicher Erstattungsbetrag erfasst werden.

## Deployment

Das Frontend läuft im Docker-Container `beihilfe-frontend` (nginx). Konfiguration: [docker/nginx.conf](../docker/nginx.conf)

API-Requests von `/api/*` werden von nginx an den Backend-Container weitergeleitet.
