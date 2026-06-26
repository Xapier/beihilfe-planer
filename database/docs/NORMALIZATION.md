# Normalisierungsempfehlungen

## Normalisierungsstatus

Das aktuelle Schema ist teilweise normalisiert, mit einigen denormalisierten Bereichen für Performance:

| Tabelle | Normalisierung | Status | Empfehlung |
|---------|----------------|--------|-----------|
| tbl_Rechnungen | 2NF | ⚠️ Viele Kostenträgerspalten | Könnte in tbl_Rechnungen_Kosten zerlegt werden |
| tbl_Fahrtkosten | 1NF | ⚠️ String-Referenzen zu Fahrtziel | Sollte Fz_ID statt String verwenden |
| tbl_Medikation | 1NF | ⚠️ Patient-String statt ID | Normalisierungsmöglichkeit |
| tbl_Monat_RepDaten | Denormalisiert | ✅ Intentional | Performance-Reporting |

---

## 1. Patienten-Normalisierung

### Problem
Mehrere Tabellen verwenden String-Referenzen zu Patienten:

```sql
-- Aktuell:
tbl_Fahrtkosten.Fk_Patient VARCHAR(30)
tbl_KhKosten.Kh_Patient VARCHAR(30)
tbl_Medikamente.M_Patient VARCHAR(30)
tbl_ArztBesuch.AB_Patient VARCHAR(30)
```

### Lösung: Neue tbl_Patienten Dimension
```sql
CREATE TABLE tbl_Patienten (
    Patient_ID INTEGER PRIMARY KEY AUTOINCREMENT,
    Patient_Name VARCHAR(30) NOT NULL,
    Patient_Geb_Datum DATE,
    Patient_Versicherung_Typ VARCHAR(20),  -- PKV, GKV, Beihilfe
    Status BIT DEFAULT 1,
    SuchMarke VARCHAR(1)
);

-- Dann Fremdschlüssel in Tabellen:
ALTER TABLE tbl_Fahrtkosten ADD COLUMN Patient_ID INTEGER;
ALTER TABLE tbl_KhKosten ADD COLUMN Patient_ID INTEGER;
ALTER TABLE tbl_Medikamente ADD COLUMN Patient_ID INTEGER;
```

**Vorteile:**
- Konsistente Patient-Identifikation
- Schnellere Joins statt String-Matches
- Leichte Duplikaterkennung

---

## 2. Arzt/Anbieter-Normalisierung

### Problem
`tbl_Rechnungen.Re_Aussteller` ist VARCHAR, sollte FK sein:

```sql
-- Aktuell:
tbl_Rechnungen.Re_Aussteller VARCHAR(80)  -- String
tbl_Kontakte.K_Arzt VARCHAR(100)          -- Adressbuch
```

### Lösung: FK zu tbl_Kontakte
```sql
-- Erweiterte tbl_Kontakte:
ALTER TABLE tbl_Kontakte ADD COLUMN Kontakt_Typ VARCHAR(20);  -- Arzt, Zahnarzt, Klinik, Apotheke
ALTER TABLE tbl_Kontakte ADD COLUMN IK_Nummer VARCHAR(10);    -- IK-Nummer für Abrechnung
ALTER TABLE tbl_Kontakte ADD COLUMN Status BIT DEFAULT 1;

-- Dann in tbl_Rechnungen:
ALTER TABLE tbl_Rechnungen ADD COLUMN Aussteller_ID INTEGER;
ALTER TABLE tbl_Rechnungen ADD FOREIGN KEY (Aussteller_ID) REFERENCES tbl_Kontakte(K_ID);
```

---

## 3. Kostenträger-Normalisierung

### Problem
`tbl_Rechnungen` hat viele Spalten für verschiedene Kostenträger:

```sql
-- Aktuell flache Struktur:
PKV_Einreichung, PKV_Direkt, PKV_Erstattung, PKV_Bem, Prozent_PKV, ...
BH_Einreichung, BH_Antrag_Nr, BH_Erstattung, Prozent_BH, ...
BET_Erwartung, BET_BH_PKV, BET_Erstattung, ...
Pkv_SB, Pkv_HB, BH_EA, BH_HB, ...
```

### Lösung: Neue tbl_Rechnungen_Kostentraeger
```sql
CREATE TABLE tbl_Kostentraeger (
    KT_ID INTEGER PRIMARY KEY,
    KT_Name VARCHAR(20) NOT NULL  -- PKV, BH, BET, Privat
);
INSERT INTO tbl_Kostentraeger VALUES (1, 'PKV'), (2, 'BH'), (3, 'BET'), (4, 'Privat');

CREATE TABLE tbl_Rechnungen_Kostentraeger (
    RK_ID INTEGER PRIMARY KEY AUTOINCREMENT,
    Re_ID INTEGER NOT NULL,
    KT_ID INTEGER NOT NULL,
    Einreichungsdatum DATETIME,
    Direktzahlung MONEY DEFAULT 0,
    Erstattung MONEY DEFAULT 0,
    Eigenanteil MONEY DEFAULT 0,
    Hoechstbeteiligung MONEY DEFAULT 0,
    Kostenquote INTEGER DEFAULT 0,
    Status VARCHAR(20),
    Bemerkung TEXT,
    FOREIGN KEY (Re_ID) REFERENCES tbl_Rechnungen(Re_ID),
    FOREIGN KEY (KT_ID) REFERENCES tbl_Kostentraeger(KT_ID)
);
```

**Vorteile:**
- Flexible Kostenträger-Verwaltung
- Leichtere Queries
- Zukunftsicherer für neue Kostenträger

---

## 4. Fahrtziel-Normalisierung

### Problem
String-Referenzen zu Fahrtziel statt FK:

```sql
-- Aktuell:
tbl_Fahrtkosten.Fk_Fahrtziel VARCHAR(200)       -- String
tbl_Fahrtziele.Fz_Fahrtziel VARCHAR(200)        -- Katalog mit String-ID
tbl_Parken.P_Fahrtziel VARCHAR(200)             -- String
```

### Lösung: Konsistente FK
```sql
-- tbl_Fahrtziele erweitern:
ALTER TABLE tbl_Fahrtziele ADD COLUMN Fz_Kategorie VARCHAR(50);  -- Krankenhaus, Zahnarzt, etc.
ALTER TABLE tbl_Fahrtziele ADD COLUMN Fz_Stadt VARCHAR(50);
ALTER TABLE tbl_Fahrtziele ADD COLUMN Fz_Strasse VARCHAR(100);
ALTER TABLE tbl_Fahrtziele ADD COLUMN Fz_Status BIT DEFAULT 1;

-- Dann in Fahrtkosten:
ALTER TABLE tbl_Fahrtkosten ADD COLUMN Fz_ID INTEGER;
UPDATE tbl_Fahrtkosten f
SET Fz_ID = (SELECT Fz_ID FROM tbl_Fahrtziele WHERE Fz_Fahrtziel = f.Fk_Fahrtziel LIMIT 1);
ALTER TABLE tbl_Fahrtkosten ADD FOREIGN KEY (Fz_ID) REFERENCES tbl_Fahrtziele(Fz_ID);
```

---

## 5. Dokumenten-Normalisierung

### Problem
Mehrere Document-Tabellen mit reduzierter Normalisierung:

```sql
tbl_DokSql, tbl_DokMig, tbl_DokSonstige, tbl_DokSonstigeLink
```

### Lösung: Unified Document Model
```sql
CREATE TABLE tbl_Dokument_Typ (
    DT_ID INTEGER PRIMARY KEY,
    DT_Name VARCHAR(50),
    DT_Beschreibung TEXT
);

CREATE TABLE tbl_Dokumente (
    Doc_ID INTEGER PRIMARY KEY AUTOINCREMENT,
    Re_ID INTEGER,
    DT_ID INTEGER NOT NULL,
    Doc_Name VARCHAR(150) NOT NULL,
    Doc_Pfad VARCHAR(255),
    Doc_Groesse INTEGER,
    Doc_Datum DATETIME,
    Doc_Person VARCHAR(100),
    Status VARCHAR(20),
    FOREIGN KEY (Re_ID) REFERENCES tbl_Rechnungen(Re_ID),
    FOREIGN KEY (DT_ID) REFERENCES tbl_Dokument_Typ(DT_ID)
);
```

---

## 6. Zeitliche Dimension - Fakten-Tabelle

### Problem
Berichtsdaten sind denormalisiert:

```sql
tbl_Monat_RepDaten  -- Flache Aggregationen
```

### Lösung (Optional - nur wenn komplexe Historik nötig)
```sql
CREATE TABLE tbl_Datum (
    Datum_ID INTEGER PRIMARY KEY,
    Datum DATE UNIQUE,
    Jahr INTEGER,
    Monat INTEGER,
    Tag INTEGER,
    Quartal INTEGER,
    Woche INTEGER,
    Wochentag VARCHAR(10)
);

CREATE TABLE tbl_Fakten_Rechnungen (
    Fakt_ID INTEGER PRIMARY KEY AUTOINCREMENT,
    Datum_ID INTEGER,
    Patient_ID INTEGER,
    Aussteller_ID INTEGER,
    Re_Betrag MONEY,
    PKV_Quote DECIMAL,
    BH_Quote DECIMAL,
    FOREIGN KEY (Datum_ID) REFERENCES tbl_Datum(Datum_ID),
    FOREIGN KEY (Patient_ID) REFERENCES tbl_Patienten(Patient_ID),
    FOREIGN KEY (Aussteller_ID) REFERENCES tbl_Kontakte(K_ID)
);
```

---

## Migrationsplan

### Phase 1: Niedrig-Risiko-Normalisierungen (Schnelle Gewinne)
1. **Fahrtziel-FK** - Geringer Impact, klare Vorteile
2. **Patienten-Normalisierung** - Neu, dann Migration alter Daten

### Phase 2: Mittleres Risiko
3. **Arzt/Anbieter-FK** - Erfordert Datammigration
4. **Kostenträger-Normalisierung** - Vielen betroffene Queries

### Phase 3: Höheres Risiko (Optional)
5. **Dokumente-Vereinheitlichung** - Evtl. Datenverlust
6. **Fakten-Dimension** - Nur bei Bedarf für Analytics

---

## Empfohlene Normalisierungsreihenfolge

```sql
-- 1. Neue Dimensionen erstellen
CREATE TABLE tbl_Patienten (...);
CREATE TABLE tbl_Fahrtziele_neu (...);

-- 2. Daten migrieren
INSERT INTO tbl_Patienten SELECT DISTINCT ...
INSERT INTO tbl_Fahrtziele_neu SELECT DISTINCT ...

-- 3. Neue Spalten in bestehende Tabellen
ALTER TABLE tbl_Fahrtkosten ADD COLUMN Patient_ID INTEGER;
ALTER TABLE tbl_Fahrtkosten ADD COLUMN Fz_ID_NEW INTEGER;

-- 4. Daten kopieren via Join
UPDATE tbl_Fahrtkosten f
SET Patient_ID = (SELECT Patient_ID FROM tbl_Patienten WHERE Patient_Name = f.Fk_Patient LIMIT 1);

-- 5. Validierung durchführen
SELECT COUNT(*) WHERE Patient_ID IS NULL;  -- Sollte 0 sein

-- 6. FK-Constraints hinzufügen (nur wenn Validierung bestanden)
ALTER TABLE tbl_Fahrtkosten ADD FOREIGN KEY (Patient_ID) REFERENCES tbl_Patienten(Patient_ID);

-- 7. Alte Spalten deaktivieren/entfernen
-- ALTER TABLE tbl_Fahrtkosten DROP COLUMN Fk_Patient;
```

---

## Impact-Analyse

| Normalisierung | Komplexität | Impact | Nutzen |
|---|---|---|---|
| Patienten | Mittel | Hoch | Hoch |
| Fahrtziel-FK | Niedrig | Mittel | Hoch |
| Arzt-FK | Hoch | Mittel | Mittel |
| Kostenträger | Sehr Hoch | Sehr Hoch | Mittel |
| Dokumente | Mittel | Niedrig | Niedrig |

**Empfehlung:** Patienten + Fahrtziel-FK umsetzen, andere als Optional betrachten.

