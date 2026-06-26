# 🚀 Beihilfe-Planer Webanwendung

## 📍 Übersicht

Diese HTML5/CSS3/JavaScript-Anwendung bietet eine benutzerfreundliche Weboberfläche für die vereinfachte Beihilfe-Verwaltung.

**Status:** MVP (Minimum Viable Product)  
**Technologie:** Pure HTML5 / CSS3 / Vanilla JavaScript (keine externe Abhängigkeiten)  
**Browser-Kompatibilität:** Alle modernen Browser (Chrome, Firefox, Safari, Edge)

---

## 📁 Dateistruktur

```
app/
├── index.html                    # 🏠 Dashboard & Startseite
├── form_aufwendungen_status.html # ⭐ Hauptformular "Aufwendungen & Status"
├── patients.html                 # 👥 Patienten-Verwaltung (Platzhalter)
├── contacts.html                 # 🏥 Kontakt-Verwaltung (Platzhalter)
└── reports.html                  # 📊 Berichte (Platzhalter)
```

---

## 🎯 Funktionen

### ✅ Implementiert

| Seite | Funktion | Status |
|-------|---------|--------|
| **index.html** | Dashboard mit Statistiken | ✅ Fertig |
| **form_aufwendungen_status.html** | Aufwendungs-Erfassung mit 5-Säulen | ✅ Fertig |
| | Farb-kodierte Status | ✅ Fertig |
| | Ratenzahlungs-Verwaltung | ✅ Fertig |
| | Dokumenten-Upload | ✅ Fertig |

### 🔜 In Planung

- [ ] Patienten-Verwaltung (Hinzufügen, Bearbeiten, Löschen)
- [ ] Kontakt-Verwaltung (Ärzte, Apotheken, etc.)
- [ ] Antrag-Tracking mit Status-Übersicht
- [ ] Berichte & Auswertungen
- [ ] Export zu PDF/Excel
- [ ] Benutzer-Authentifizierung
- [ ] Offline-Funktionalität (Service Worker)

---

## 🎨 Design-Features

### Responsive Layout
- ✅ Desktop (1920px+)
- ✅ Tablet (768px - 1024px)
- ✅ Mobile (< 768px)

### 5-Säulen Farbsystem

```
┌──────────┐
│ RECHNUNG │  Status der Rechnungsbearbeitung
├──────────┤
│   PKV    │  Kostenübernahme durch Private KV
├──────────┤
│   BET    │  Beihilfeanspruchsrückerstattung
├──────────┤
│ BEIHILFE │  Kostenübernahme durch Beihilfe
├──────────┤
│  PFLEGE  │  Pflegezuschüsse & Sonderzahlungen
└──────────┘

🎨 FARBEN:
🔴 Rot    = Offen (keine Aktion)
🟡 Gelb   = In Bearbeitung (eingereicht)
🟢 Grün   = Erledigt (erstattet)
⚫ Grau   = Nicht zutreffend (N/A)
```

---

## 🚀 Verwendung

### 1. Lokal öffnen
```bash
# Mit Python SimpleHTTPServer
cd /Users/davidsiegeris/Beihilfe-Planer/app
python3 -m http.server 8000

# Dann Browser öffnen:
# http://localhost:8000
```

Oder direkt im Browser:
```
file:///Users/davidsiegeris/Beihilfe-Planer/app/index.html
```

### 2. Mit Web-Server (empfohlen)
```bash
# Apache, Nginx, IIS, etc.
# App-Verzeichnis als Virtual Host oder Subfolder
```

### 3. Mit Node.js
```bash
npm install -g http-server
http-server /Users/davidsiegeris/Beihilfe-Planer/app -p 8000
```

---

## 📋 Hauptformular: "Aufwendungen & Status"

### Aufbau

**Sektion 1: Grunddaten**
- Patient auswählen
- Aufwendungsdatum
- Kontakt (Arzt/Klinik)
- Aufwendungstyp
- Rechnungsnummer & Betrag

**Sektion 2: 5-Säulen Status** ⭐
Jede Säule mit:
- Dropdown für Status
- Datumfeld (bei Status-Änderung)
- Betrag-Feld (Erstattungsbetrag)

**Sektion 3: Ratenzahlung**
- Checkbox zum Aktivieren
- Rate pro Monat
- Anzahl Raten
- Startdatum

**Sektion 4: Notizen & Anhänge**
- Freitext-Notizen
- Dokumenten-Upload (Multi-File)

### Interaktivität

✨ **Status-Farben wechseln in Echtzeit:**
```javascript
Status "offen" → Säule wird Rot
Status "eingereicht" → Säule wird Gelb
Status "erstattet" → Säule wird Grün
Status "N/A" → Säule wird Grau
```

✨ **Ratenzahlung Toggle:**
```javascript
Checkbox aktiviert → Ratenzahlungsdetails sichtbar
Checkbox deaktiviert → Ratenzahlungsdetails verborgen
```

---

## � Berechnung & Verrechnung (Sollbetrag vs. Istbetrag)

### 📐 Berechnungslogik

Die Quoten (PKV%, Beihilfe%, etc.) sind **Stammdaten pro Patient**, nicht variabel pro Beleg!

**Wichtig:** `PKV_Quote% + Beihilfe_Quote% = 100%` (mathematisch bindend!)

#### Beispiel: Max Mustermann

```
Stammdaten:
- PKV-Quote: 50%
- Beihilfe-Quote: 50%
- BET-Quote: 20% (optional)
- Pflege-Quote: 0%

Rechnung: €450

Berechnung:
├─ PKV Sollbetrag    = €450 × 50%  = €225
│  (tatsächlich erstattet: €200) → Differenz: -€25
├─ Beihilfe Sollbetrag = €450 × 50%  = €225
│  (tatsächlich erstattet: €220) → Differenz: -€5
├─ BET              = €450 × 20%  = €90 (nicht erstattet)
└─ Pflege           = €450 × 0%   = €0

EIGENLEISTUNG:
€450 (Rechnung) - €200 (PKV) - €220 (Beihilfe) = €30 selbst zahlen
```

### 🔍 Warum "Sollbetrag" vs. "Istbetrag"?

Manchmal wird weniger erstattet, als die Quoten berechnen:

```
Sollbetrag (erwartete Erstattung) ≠ Istbetrag (tatsächliche Erstattung)

Gründe:
- Beihilfestelle lehnt Teile ab
- Kostenübernahmeerklärung nicht vollständig
- Zahnersatz-Regelleistung nicht ausgeschöpft
- Administrative Verzögerungen
```

### 📊 Ausgabe der Verrechnung

Am Ende des Formulars erscheint eine Übersicht:

```
═══════════════════════════════════════════════════════
VERRECHNUNG & EIGENANTEIL
───────────────────────────────────────────────────────
Rechnungsbetrag:                    €450.00

PKV Sollbetrag (50%):      €225.00
  PKV erstattet:           €200.00
  Differenz:               (-€25.00)  ← Weniger bezahlt

Beihilfe Sollbetrag (50%): €225.00
  Beihilfe erstattet:      €220.00
  Differenz:               (-€5.00)   ← Weniger bezahlt

───────────────────────────────────────────────────────
IHRE EIGENLEISTUNG:                 €30.00
(€450 - €200 - €220 = €30 zu zahlen)

Gesamtverstattung (Soll):   €450.00 (100%)
Gesamtverstattung (Ist):    €420.00 (93%)
═══════════════════════════════════════════════════════
```

---

## �🔗 Integration mit Datenbank

### Backend-Anforderungen

Das Frontend benötigt eine REST-API oder ähnliche Schnittstelle für:

1. **Patient-Liste laden**
```javascript
GET /api/patienten
→ JSON: [{id, name, versicherung}, ...]
```

2. **Kontakt-Liste laden**
```javascript
GET /api/kontakte
→ JSON: [{id, name, typ, telefon}, ...]
```

3. **Aufwendung speichern**
```javascript
POST /api/aufwendungen
Body: { patient_id, auf_datum, ... }
→ JSON: {success, auf_id}
```

4. **Aufwendung laden**
```javascript
GET /api/aufwendungen/{auf_id}
→ JSON: {auf_id, patient_id, ...}
```

### Beispiel-Backend (Node.js/Express)

```javascript
const express = require('express');
const sqlite3 = require('sqlite3');
const app = express();

const db = new sqlite3.Database('/path/to/beihilfe.db');

// Patienten laden
app.get('/api/patienten', (req, res) => {
    db.all('SELECT * FROM tbl_Patienten', (err, rows) => {
        res.json(rows);
    });
});

// Aufwendung speichern
app.post('/api/aufwendungen', (req, res) => {
    const data = req.body;
    db.run(
        `INSERT INTO tbl_Aufwendungen 
         (Patient_ID, Auf_Datum, Rechnungsbetrag, ...) 
         VALUES (?, ?, ?, ...)`,
        [data.patient_id, data.auf_datum, data.rechnungsbetrag, ...],
        function(err) {
            res.json({success: !err, auf_id: this.lastID});
        }
    );
});

app.listen(3000);
```

---

## 🎓 Lernressourcen

### HTML5
- [MDN Web Docs - HTML5](https://developer.mozilla.org/en-US/docs/Web/HTML)
- [W3C HTML5 Specification](https://html.spec.whatwg.org/)

### CSS3
- [MDN Web Docs - CSS](https://developer.mozilla.org/en-US/docs/Web/CSS)
- [CSS Tricks](https://css-tricks.com/)

### JavaScript
- [MDN Web Docs - JavaScript](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
- [Vanilla JS](http://vanilla-js.com/)

---

## 🔒 Datenschutz & Sicherheit

### Wichtige Hinweise

⚠️ **Diese Version speichert Daten NICHT lokal!**
- Alle Formulardaten sind nur im RAM
- Nach Neuladen/Tab-Schließen sind Daten weg
- **Backend-Integration erforderlich** für Persistierung!

### Sicherheits-Best-Practices für Backend

1. **Input-Validierung** - Alle Eingaben prüfen
2. **SQL-Injection Schutz** - Prepared Statements verwenden
3. **HTTPS** - Verschlüsselte Übertragung
4. **Authentifizierung** - Benutzer-Login
5. **Autorisierung** - Nur eigene Daten sehen
6. **Audit-Trail** - Änderungen protokollieren
7. **DSGVO-Konformität** - Datenschutz beachten

---

## 🐛 Browser DevTools

### Debugging

**Console öffnen:** F12 oder Ctrl+Shift+I

**FormData inspizieren:**
```javascript
// In der Browser-Console:
document.querySelector('#aufwendungenForm').addEventListener('submit', (e) => {
    const data = new FormData(e.target);
    console.log(Object.fromEntries(data));
});
```

**Netzwerk-Requests:**
1. DevTools öffnen → Network-Tab
2. Formular abschicken
3. Netzwerk-Requests inspizieren

---

## 📱 Mobile Optimierung

### Tested auf:
- ✅ iPhone 12/13/14/15
- ✅ iPad
- ✅ Samsung Galaxy S10+
- ✅ Google Pixel

### Features:
- ✅ Touch-friendly Buttons (mind. 44px)
- ✅ Responsive Grid-Layout
- ✅ Mobile Navigation
- ✅ Viewport-Optimierung

---

## 🚀 Performance-Tipps

### Optimierung

1. **CSS Minification**
   ```bash
   npm install -g cssnano
   cssnano styles.css > styles.min.css
   ```

2. **JavaScript Minification**
   ```bash
   npm install -g terser
   terser script.js -o script.min.js
   ```

3. **Image Optimization**
   - Verwende moderne Formate (WebP)
   - Komprimiere mit TinyPNG

4. **Lazy Loading**
   ```html
   <img loading="lazy" src="...">
   ```

---

## 📊 Analytics Integration (Optional)

### Google Analytics Code
```html
<!-- In index.html HEAD-Bereich -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

---

## 🆘 Häufige Probleme

### Problem: CORS-Fehler bei Backend-Requests
**Lösung:** Backend muss CORS Headers setzen
```javascript
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));
```

### Problem: Formular wird nach Submit nicht geleert
**Lösung:** JavaScript hinzufügen
```javascript
document.getElementById('aufwendungenForm').reset();
```

### Problem: Datepicker funktioniert nicht
**Lösung:** Browser-kompatibilität checken (IE11 nicht unterstützt)

---

## 📝 Checkliste vor Production

- [ ] Backend-API implementiert
- [ ] HTTPS aktiviert
- [ ] Sicherheits-Headers gesetzt
- [ ] Input-Validierung
- [ ] Error-Handling
- [ ] Logging implementiert
- [ ] Tests geschrieben
- [ ] Dokumentation aktualisiert
- [ ] Performance-Test (Lighthouse)
- [ ] Datenschutz-Erklärung
- [ ] Impressum hinzufügt

---

## 📞 Support & Kontakt

Fragen oder Issues?
- 📧 Email: [your-email]
- 🐛 Bug Report: [Github Issues]
- 💬 Discussion: [Forum/Chat]

---

**Version:** 1.0 MVP  
**Erstellt:** 2026-06-25  
**Status:** Bereit für Backend-Integration

