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

## 📸 Screenshots

![Dashboard](../docs/screenshots/dashboard.png)

![Kontakte Verwaltung](../docs/screenshots/kontakte.png)

![Berichte](../docs/screenshots/berichte.png)

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

![Patienten Verwaltung](../docs/screenshots/patienten.png)

## Aufwendungen (`form_aufwendungen_status.html`)

Hauptformular der Anwendung.

![Aufwendungen & Status](../docs/screenshots/aufwendungen.png)

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

Jede Aufwendung hat 4 unabhängige Status-Spalten (plus Rechnung):

| Säule | Status-Werte | Beschreibung |
|-------|------------|-------------|
| Rechnung | offen → eingegangen → bezahlt | Originalrechnung |
| PKV | offen → eingereicht → BRE offen → BRE erstattet → erstattet → entfällt | Private Krankenversicherung (mit Beitragsrückerstattung) |
| Beihilfeergänzung (BET) | offen → eingereicht → erstattet / entfällt | Beamten-Ergänzungs-Tarif (Standard: entfällt) |
| Beihilfe | offen → eingereicht → erstattet → entfällt | Staatliche Beihilfe |

**Hinweis:** BRE-Status sind nur für PKV relevant. Beihilfe und BET haben keine BRE-Logik.

### Berechnung (Backend-API)

Frontend zeigt drei berechnete Spalten an (alle vom Backend berechnet):

| Spalte | Formel | Bedeutung |
|--------|--------|-----------|
| Eigenbehalt | Betrag - PKV erl. - Beihilfe erl. *nur wenn entfällt* | Patient zahlt selbst |
| Ausstehend | PKV ausstehend + Beihilfe ausstehend | Noch zu erwartende Erstattungen |
| 4-Säulen Status | 5 Status-Felder | Farbig kodiert |

**Farbkodierung:**
- 🔴 Rot — offen
- 🟡 Gelb — eingereicht / BRE offen / in Bearbeitung
- 🟢 Grün — erledigt / erstattet
- ⚫ Grau — entfällt / nicht zutreffend
- 🟣 Lila — überfällig

## Deployment

Das Frontend läuft im Docker-Container `beihilfe-frontend` (nginx). Konfiguration: [docker/nginx.conf](../docker/nginx.conf)

API-Requests von `/api/*` werden von nginx an den Backend-Container weitergeleitet.
