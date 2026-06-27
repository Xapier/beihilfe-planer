# Screenshot & Dokumentation Guide

Diese Anleitung erklärt, wie Sie Screenshots der Beihilfe-Planer Benutzeroberfläche erstellen und diese für die Veröffentlichung verpixeln können.

## Warum Verpixelung?

Alle Screenshots in der Dokumentation müssen **vollständig verpixelt** werden, um zu gewährleisten, dass:
- ✅ Keine personenbezogenen Daten sichtbar sind
- ✅ Keine Krankheitsdaten oder medizinischen Informationen erkennbar sind
- ✅ Keine Finanzinformationen zu sehen sind
- ✅ Auch KI-Systeme die Daten nicht rekonstruieren können

## Automatisierte Screenshot-Erfassung

### Schritt 1: Raw Screenshots erstellen

```bash
# Navigieren Sie zum Repository
cd Beihilfe-Planer

# Option A: Mit Python/Playwright (wenn installiert)
python3 scripts/capture-screenshots.py

# Option B: Manuell mit Browser
# Öffnen Sie jeden URL in Ihrem Browser und nehmen einen Full-Page Screenshot:
# - http://192.168.188.61/index.html → docs/screenshots/dashboard-raw.png
# - http://192.168.188.61/form_aufwendungen_status.html → docs/screenshots/aufwendungen-raw.png
# - http://192.168.188.61/patients.html → docs/screenshots/patienten-raw.png
# - http://192.168.188.61/contacts.html → docs/screenshots/kontakte-raw.png
# - http://192.168.188.61/reports.html → docs/screenshots/berichte-raw.png
```

### Schritt 2: Verpixeln mit ImageMagick

```bash
# Installation von ImageMagick (einmalig)
brew install imagemagick

# Verpixeln aller Raw-Screenshots
python3 scripts/pixelate-screenshots.py

# Oder manuell mit convert:
convert docs/screenshots/dashboard-raw.png -sample 10% -sample 1000% docs/screenshots/dashboard.png
convert docs/screenshots/aufwendungen-raw.png -sample 10% -sample 1000% docs/screenshots/aufwendungen.png
# ... etc.
```

### Schritt 3: Überprüfung

```bash
# Überprüfen Sie, dass die Daten vollständig unkenntlich gemacht sind
open docs/screenshots/dashboard.png
open docs/screenshots/aufwendungen.png
# etc.
```

## Manuelle Verpixelung (macOS)

Falls Sie einzelne Screenshots verpixeln möchten:

```bash
# Mit ImageMagick
convert input.png -sample 10% -sample 1000% output.png

# Mit höherer Verpixelung (aggressiver)
convert input.png -sample 5% -sample 2000% output.png

# Mit niedriger Verpixelung (weniger pixelig)
convert input.png -sample 15% -sample 666% output.png
```

## Screenshot-Anforderungen

### Größe
- **Breite:** Mindestens 1200px (ideal für responsive Anzeige)
- **Höhe:** Full-Page (gesamte Seite, nicht nur viewport)

### Bildqualität
- **Format:** PNG (für verlustfreie Komprimierung)
- **Qualität:** 95% (gute Balance zwischen Größe und Qualität)
- **Farbraum:** RGB (Standard)

### Verpixelung
- **Pixel-Größe:** 10-15px Blöcke (gut lesbar für Struktur, aber Daten unkenntlich)
- **Aggressivität:** Alles, was Daten enthält:
  - ✓ Alle Tabellenzellen
  - ✓ Alle Zahlwerte
  - ✓ Alle Personennamen
  - ✓ Alle Datum/Zeit-Angaben
  - ✓ Alle Email-Adressen
  - ✓ Alle Telefon nummern

### Was NICHT verpixeln
- ✓ Navigation/Menu (erlaubt zu sehen, welche Seiten es gibt)
- ✓ Button-Labels (z.B. "Neu hinzufügen", "Speichern")
- ✓ Field-Labels (z.B. "Datum", "Betrag", "Patient")
- ✓ Struktur-Elemente (Grid, Layout, Farben)
- ✓ Symbole/Icons

## Verweis in README

Sobald die verpixelten Screenshots vorhanden sind, können sie in der README referenziert werden:

```markdown
### 📋 Aufwendungen & Status

[Beschreibung...]

![Aufwendungen Übersicht](docs/screenshots/aufwendungen.png)

> ℹ️ *Die Daten in den Screenshots sind aus Datenschutzgründen verpixelt.*

[weitere Beschreibung...]
```

## Datenschutz-Checkliste

Vor dem Commit von Screenshots:

- [ ] Alle Zahlwerte sind verpixelt
- [ ] Alle Personennamen sind verpixelt
- [ ] Alle Daten sind verpixelt
- [ ] Alle Kontaktinformationen sind verpixelt
- [ ] Die Struktur/UI ist noch erkennbar
- [ ] Navigation und Labels sind lesbar
- [ ] Kein Text ist lesbar, der Daten enthält

## Häufige Fragen

**F: Können die Werte rekonstruiert werden?**  
A: Mit modernen KI-Systemen ist eine Rekonstruktion theoretisch möglich, wenn die Verpixelung zu schwach ist. Daher verwenden wir 10-15px Pixel-Blöcke, was eine zuverlässige Sicherheit gewährleistet.

**F: Welches Tool ist am besten?**  
A: ImageMagick's `convert` Befehl ist schnell, zuverlässig und Open-Source. Alternativ: GIMP (GUI), Python PIL/Pillow, oder Online-Tools (aber diese speichern möglicherweise Daten).

**F: Kann ich meine Screenshots automatisiert machen?**  
A: Ja! Mit Playwright oder Selenium können Sie Screenshots über APIs machen. Die Scripts sind in `scripts/` verfügbar.

**F: Wie oft sollten Screenshots aktualisiert werden?**  
A: Bei großen UI-Änderungen. Das Verpixeln der Daten ändert sich nicht, nur die Struktur/Layout.

---

## Kontakt

Bei Fragen zur Screenshot-Dokumentation oder Datenschutz: siehe [Lizenz](../LICENSE)
