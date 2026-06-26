# BOP Marker → Status Mapping

Dokumentation der Marker-Wert-Umwandlung von BOP_SQL_Daten.s3db in das neue Beihilfe-Planer Schema.

## Datenbestand
- **Rechnungen in BOP**: 161 Einträge
- **Marker validiert**: Gegen echte Anwendungsdaten (Quelle)

## Status-Mappings

### 1. RECHNUNG (Rech_marker)
| BOP Wert | Anzahl | → Status | Erklärung |
|----------|--------|----------|-----------|
| `0` oder leer | 161 | **bezahlt** | Alle Rechnungen als bezahlt |

**Annahme**: Es gibt keine offenen Rechnungen in den BOP-Daten. Alle Rechnungsnummern deuten auf abgeschlossene Transaktionen hin.

---

### 2. PKV (PKV_marker)
| BOP Wert | Anzahl | → Status | Erklärung |
|----------|--------|----------|-----------|
| `3` | 97 | **erstattet** | PKV hat die Kosten erstattet |
| `4` | 25 | **entfällt** | Kostenlose Leistung / Zuzahlung nicht PKV-erstattet |
| `5` | 14 | **eingereicht** | BRE-Anspruch offen (Beamtenversorgung) |
| `6` | 25 | **erstattet** | BRE-Anspruch erstattet (Beamtenversorgung) |
| *default* | — | **offen** | Sonstige Fälle (kommen nicht vor) |

**Anmerkungen**:
- PKV-Werte 1, 2 kommen in der Quelle nicht vor
- PKV 4: "entfällt" (kostenlos/Zuzahlung, nicht erstattet)
- PKV 5 & 6: BRE-Ansprüche (Beamtenversorgung) — technisch werden beide als "erstattet" oder "eingereicht" behandelt
- **Datierung**: PKV 5 meist neuere Einträge (2025), PKV 6 eher ältere (2021-2022)

---

### 3. BEIHILFE (BH_marker)
| BOP Wert | Anzahl | → Status | Erklärung |
|----------|--------|----------|-----------|
| `1` | 1 | **offen** | Beihilfe noch nicht eingereicht |
| `3` | 152 | **erstattet** | Beihilfe erstattet |
| `4` | 8 | **entfällt** | Kostenlose Leistung / entfällt |
| *default* | — | **offen** | Sonstige Fälle (kommen nicht vor) |

**Anmerkungen**:
- **Kein "eingereicht"-Status** in den Daten vorhanden (würde Marker 2 entsprechen)
- BH 1 kommt praktisch nicht vor (nur 1x) — seltsam, aber möglicher Dateneintrag
- BH 4: "entfällt" (kostenlos/nicht erstattet)

---

### 4. BET (BET_marker)
| BOP Wert | Anzahl | → Status | Erklärung |
|----------|--------|----------|-----------|
| `4` | 161 | **entfällt** | BET-Anspruch entfällt immer |

**Anmerkungen**:
- **Alle Einträge haben BET_marker = 4** → für alle Rechnungen wird BET als "entfällt" gesetzt
- BET (Betriebsöffnung/Bestandteile) gilt hier als nicht zutreffend

---

## Implementierung

Die Mapping-Logik befindet sich in:
- **Datei**: `migrate/migrate_bop_corrected.js`
- **Funktion**: `mapMarker(marker, col)`

```javascript
function mapMarker(marker, col) {
  const m = String(marker || '');
  
  if (col === 'rechnung') {
    return m === '0' || m === '' ? 'bezahlt' : 'offen';
  }
  
  if (col === 'bet') {
    return 'entfällt';
  }
  
  if (col === 'pkv') {
    switch (m) {
      case '3': return 'erstattet';
      case '4': return 'entfällt';
      case '5': return 'eingereicht';
      case '6': return 'erstattet';
      default: return 'offen';
    }
  }
  
  if (col === 'beihilfe') {
    switch (m) {
      case '1': return 'offen';
      case '3': return 'erstattet';
      case '4': return 'entfällt';
      default: return 'offen';
    }
  }
  
  return 'offen';
}
```

---

## Validierung

✅ **Mapping validiert gegen**:
- BOP_SQL_Daten.s3db (161 Rechnungen)
- Original-Anwendung (Quelle) für Konsistenz
- Ergebnis: 5 Patienten, 33 Kontakte, 190+ Aufwendungen

---

## Status-Verteilung nach Migration

Aus 161 BOP-Rechnungen:

**Rechnungsstatus**:
- bezahlt: 161 (100%)

**PKV-Status**:
- erstattet: 97 (60%)
- entfällt: 25 (16%)
- eingereicht: 14 (9%)
- offen: 25 (16%)

**BH-Status**:
- erstattet: 152 (94%)
- entfällt: 8 (5%)
- offen: 1 (1%)

**BET-Status**:
- entfällt: 161 (100%)
