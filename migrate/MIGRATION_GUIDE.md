# 🔄 Migration: BOP_SQL_Daten → Beihilfe-Planer (Neues Modell)

## 📋 Übersicht

Dieses Skript migriert historische Daten aus der **alten BOP_SQL_Daten.s3db** Datenbank in das neue, vereinfachte Beihilfe-Planer Modell mit:

- **patients** - Patienten/Versicherte
- **contacts** - Ärzte und Kontakte  
- **aufwendungen** - Alle Kosten (Rechnungen, Fahrtkosten, Krankenhaus)

---

## 🚀 Verwendung

### Schritt 1: Node.js Dependencies installieren

Falls noch nicht geschehen:

```bash
cd /Users/davidsiegeris/Beihilfe-Planer
npm install sqlite3
```

### Schritt 2: Migration ausführen

```bash
node migrate/migrate_bop_to_new.js \
  "~/Library/Mobile Documents/com~apple~CloudDocs/Persönlich/Beruf/Beihilfe/Beihile-Software/BOP_SQL_Daten.s3db" \
  "./beihilfe-migrated.db"
```

**Oder in einer Zeile:**

```bash
node migrate/migrate_bop_to_new.js ~/Library/Mobile\ Documents/com~apple~CloudDocs/Persönlich/Beruf/Beihilfe/Beihile-Software/BOP_SQL_Daten.s3db ./beihilfe-migrated.db
```

### Schritt 3: Neue DB in Docker deployieren

```bash
# 1. Neue DB zur Docker-Komponente kopieren
scp ./beihilfe-migrated.db beihilfe:/opt/beihilfe-planer/data/beihilfe.db

# 2. Container neustarten
ssh beihilfe 'cd /opt/beihilfe-planer && docker compose restart backend'
```

---

## 📊 Was wird migriert?

### ✅ Patienten
- **Quelle:** `tbl_Rechnungen.Re_Person` (unique)
- **Ziel:** `patients.name`
- **Standard:** insurance_type = 'PKV'

### ✅ Kontakte (Ärzte)
- **Quelle:** `tbl_Kontakte`
- **Felder:** Name, Telefon, Email, Bemerkungen
- **Ziel:** `contacts` mit `type='Arzt'`

### ✅ Aufwendungen (3 Kategorien)

#### 1️⃣ Rechnungen (Arztrechnungen, etc.)
- Quelle: `tbl_Rechnungen`
- Typ: 'Rechnung'
- Includet: Betrag, Datum, Beschreibung, Referenznummer, Status

#### 2️⃣ Fahrtkosten
- Quelle: `tbl_Fahrtkosten`
- Typ: 'Fahrtkosten'
- Kategorie: Verkehrsmittel (PKW, Taxi, ÖPNV)

#### 3️⃣ Krankenhauskosten
- Quelle: `tbl_KhKosten`
- Typ: 'Krankenhaus'
- Includet: Anlass, Kosten

---

## 📈 Beispiel-Output

```
🚀 Starte Migration: BOP_SQL_Daten → Neues Modell

  Quelle:  ~/Library/Mobile Documents/...BOP_SQL_Daten.s3db
  Ziel:    ./beihilfe-migrated.db

✅ Alte DB geöffnet
✅ Neue DB erstellt

📋 Erstelle neues Schema...
   ✓ Schema erstellt

👥 Migriere Patienten...
   ✓ 5 Patienten migriert

👨‍⚕️ Migriere Kontakte (Ärzte)...
   ✓ 8 Kontakte migriert

💰 Migriere Aufwendungen...
   → Rechnungen...
   → Fahrtkosten...
   → Krankenhauskosten...
   ✓ 127 Aufwendungen migriert

✅ Migration abgeschlossen!

📊 Zusammenfassung:
   Patienten:     5
   Kontakte:      8
   Aufwendungen:  127
```

---

## ⚠️ Wichtige Hinweise

### 1. **Daten-Matchting**
Das Skript matched Aufwendungen zu Patienten anhand des Namens (`Re_Person`). 
- ✅ Funktioniert wenn Namen identisch sind
- ⚠️ Kann fehlschlagen bei Tippfehlern oder unterschiedlicher Formatierung

### 2. **NULL-Werte**
Aufwendungen ohne zugeordneten Patienten werden **übersprungen** (nicht migriert).

### 3. **Backup vor Migration**
```bash
# Sicherungskopie erstellen
cp /opt/beihilfe-planer/data/beihilfe.db /opt/beihilfe-planer/data/beihilfe.backup.db
```

### 4. **Status-Mapping**
- Alte `Re_Abschluss` Werte → neue `aufwendungen.status`
- Standard: 'offen' wenn leer

---

## 🔧 Fehlerbehebung

### Fehler: "Alte Datenbank nicht gefunden"
```
Pfad prüfen - Leerzeichen escapen:
node migrate_bop_to_new.js ~/Library/Mobile\ Documents/...
```

### Fehler: "SQLITE_CANTOPEN"
```
Berechtigungen prüfen:
ls -la ~/Library/Mobile\ Documents/.../BOP_SQL_Daten.s3db
```

### Fehler: "sqlite3 not found"
```
Dependencies installieren:
npm install sqlite3
```

---

## 📝 Weitere Migrationen

Sollen weitere Felder/Tabellen migriert werden? Anpassungen möglich:

- Medikationen → `aufwendungen` als Typ 'Medikament'
- ImpfBuch → separate Tabelle `vaccinations`
- Todo-Liste → `tasks`
- Etc.

Kontakt für Erweiterungen! 🚀
