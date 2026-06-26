# Entity-Relationship-Diagramm - Beihilfe-Planer

## Tabellenhierarchie

```
tbl_Antraege (Beihilfeantrag)
    └── tbl_Rechnungen (Zentrale Rechnung)
        ├── tbl_ReDetails (GOÄ-Leistungsdetails)
        ├── tbl_Fahrtkosten (Fahrten)
        │   └── tbl_Fahrtziele (Fahrtzielbeschreibung)
        ├── tbl_KhKosten (Krankenhausleistungen)
        ├── tbl_Medikamente (Einzelmedikation)
        ├── tbl_Parken (Parkgebühren)
        ├── tbl_Zusatz (Zusatzversicherung)
        ├── tbl_Ratenzahlung (Ratenplan)
        ├── tbl_BRE (Beihilferückerstattung)
        ├── tbl_ToDoListe (Aufgaben)
        └── tbl_DokSql (Digitale Dokumente)

tbl_Medikation (Dauermedikation)
    └── [Kein FK, Patienten-referenziert]

tbl_Arztbesuch [Unabhängig, Patienten-referenziert]

tbl_ImpfBuch (Impfpass)
    └── tbl_Impfen (Impfplanung)

tbl_Vorsorge (Vorsorgeerinnerungen)

tbl_Kontakte (Adressbuch)
    ├── K_Arzt (Arztname)
    └── [Referenziert von tbl_Rechnungen als Re_Aussteller]

tbl_PersAuswahl (Familienmitglieder)
    ├── Pa_Person
    └── [Versicherungskombinationen]

Reporting-Tabellen (Denormalisiert):
├── tbl_Monat_RepDaten (Aggregierte Finanzauswertung)
├── tbl_Monat_RepBasis (Basis-Aggregation)
└── tbl_Monat_RepAnsicht (Historische Auswertungen)

Verwaltung:
├── tbl_Sicht (View-Preferences)
├── tbl_DLC (Lookup-Codes)
├── tbl_Lexikon (Glossar)
└── tbl_ToDoVorlagen (Aufgabenvorlagen)
```

## Primäre Fremdschlüsselbeziehungen

### Viele-zu-Eins Beziehungen

```
Fahrtkosten --Re_ID--> Rechnungen
KhKosten --Re_ID--> Rechnungen
Medikamente --Re_ID--> Rechnungen
ReDetails --Re_ID--> Rechnungen
Ratenzahlung --Re_ID--> Rechnungen
BRE --Re_ID--> Rechnungen
ToDoListe --Re_ID--> Rechnungen
DokSql --Re_ID--> Rechnungen
```

### Eins-zu-Viele Beziehungen

```
Fahrtziele <--Fz_Fahrtziel-- Fahrtkosten
(Mit Entfernungs-Nachschlag)
```

### Sekundäre Referenzierungen (nicht erzwungen)

```
Rechnungen.Re_Aussteller --> Kontakte.K_Arzt (String-Match)
Fahrtkosten.Fk_Patient --> PersAuswahl.Pa_Person
Fahrtkosten.Fk_Fahrtziel --> Fahrtziele.Fz_Fahrtziel
ToDoListe.TD_Stelle --> [Fest codierte Stellen: Beihilfe, PKV, etc.]
```

## Zahlungsfluss-Mapping

### Einzelrechnung zu Erstattung

```
tbl_Rechnungen
├─ Re_Betrag (Rechnungssumme)
├─ Re_Eingang (Eingangsbestätigung)
├─ Re_Zahltag (Zahlungstermin)
│
├─ PKV-Strang:
│  ├─ PKV_Einreichung → PKV_Direkt | PKV_Erstattung
│  ├─ Pkv_SB (Selbstbeteiligung)
│  ├─ Pkv_HB (Höchstbeteiligung)
│  └─ Prozent_PKV (Kostenquote %)
│
├─ BH-Strang:
│  ├─ BH_Einreichung → BH_Erstattung
│  ├─ BH_EA (Eigenanteil)
│  ├─ BH_HB (Höchstbeteiligung)
│  ├─ BH_Antrag_Nr (Antragszuordnung)
│  └─ Prozent_BH (Kostenquote %)
│
├─ BET-Strang:
│  ├─ BET_BH_PKV (Stichtag)
│  └─ BET_Erstattung → tbl_BRE
│
└─ Arzt-Prognose:
   ├─ PKV_Prognose (Erwartete PKV-Zahlung)
   └─ BH_Prognose (Erwartete Beihilfe-Zahlung)
```

## Lebenszyklusstatus

### Rechnungsstatus-Fluss

```
Erfassung → Eingang → Gültigkeitsprüfung → Einreichung → Zahlung → Abschluss

Marker-Felder:
- Re_marker: Allgemeine Markierung
- PKV_marker: PKV-Status (Zahlung, Storno, Ablehnung)
- BET_marker: BET-Status
- BH_marker: Beihilfe-Status
- Loesch_marker: Löschmarkierung (soft-delete)
- Re_Abschluss: Endstatus
```

### Aufgaben-Fluss

```
Erstellung → Zuweisung (TD_Stelle) → In Bearbeitung (TD_Status=0)
                                     → Abschluss (TD_Status>0, TD_EndDatum gesetzt)
```

## Patientenidentifizierung

### Mehrere Patientenfelder (Normalisierungsopportunität)

```
tbl_Fahrtkosten.Fk_Patient
tbl_Medikamente.M_Patient
tbl_Medikation.Mk_Patient
tbl_ArztBesuch.AB_Patient
tbl_Beitraege.BB_Patient
tbl_ImpfBuch.Imp_Patient
tbl_Impfen.Imp_Patient
tbl_Arztbesuch.AB_Patient
tbl_Parken.P_Patient
tbl_KhKosten.Kh_Patient
tbl_PlusMinus.PM_Patient

EMPFEHLUNG: Könnte durch Patienten-ID normalisiert werden
Könnte sich auf tbl_PersAuswahl beziehen
```

## Zeitliche Dimensionen

### Granularität der Zeitstempel

```
Tagesgenau:
- Rechnungen (Re_Datum, Re_Eingang, Re_Zahltag)
- Fahrtkosten (Fk_Hinfahrt, Fk_Rueckfahrt)
- Medikation (M_Datum)

Monatsgenau:
- Beitraege (BB_Monat, BB_Jahr)
- Impfen (Imp_Monat, Imp_Jahr)

Berichts-Dimensionen:
- tbl_Monat_RepDaten (aggregiert auf Monatsebene)
```

## Duplicate/Alternative IDs

```
tbl_Fahrtkosten.Alt_Re_ID (Alternative Rechnungs-ID)
tbl_KhKosten.Alt_Re_ID    (Alternative Rechnungs-ID)
tbl_Medikamente.Alt_Re_ID (Alternative Rechnungs-ID)
tbl_ReDetails.Alt_Re_ID   (Alternative Rechnungs-ID)
tbl_Ratenzahlung.Alt_Re_ID (Alternative Rechnungs-ID)

ZWECK: Historische Nachverfolgung von Datenmigration oder Korrektionen
EMPFEHLUNG: Audit-Trail oder Datamigration-Versionierung
```

## Suchmechanismen

### SuchMarke Feld

Präsent in nahezu allen Tabellen: `SuchMarke VARCHAR(1)`

ANNAHME:
- Boolesche Aktivierung/Archivierung
- Schneller Index für Filter

EMPFEHLUNG:
- Konsistente Datenwerte (z.B. '1'=aktiv, '0'=archiviert)
- Sollte explizit dokumentiert werden

---

## Normalisierungsevaluation

### Nicht-normalisierte Bereiche:

1. **Patientenverwaltung**
   - STRING-Referenzen zu Patientenname statt ID
   - Sollte: `Patient_ID -> tbl_Patienten.Patient_ID`

2. **Arztverzeichnis**
   - String-Referenzen zu Re_Aussteller
   - Könnte: `Arzt_ID -> tbl_Kontakte.K_ID`

3. **Reporting-Tabellen**
   - Absichtlich denormalisiert (Performance)
   - tbl_Monat_RepDaten ist flach aggregierte Struktur

4. **Fahrtzielbeschreibung**
   - tbl_Fahrtkosten.Fk_Fahrtziel (STRING)
   - tbl_Fahrtziele.Fz_Fahrtziel (STRING)
   - Sollte: Fz_ID in Fahrtkosten statt String

---

## Empfohlene Verbesserungen

```sql
-- NORMALISIERUNG:
-- 1. Patient Dimension Table
CREATE TABLE tbl_Patienten (
    Patient_ID INTEGER PRIMARY KEY,
    Patient_Name VARCHAR(30),
    Versicherungsstatus VARCHAR(20)
);

-- 2. Arzt/Anbieter Dimension Table
-- Bereits vorhanden: tbl_Kontakte
-- Sollte: Re_Aussteller_ID statt STRING

-- 3. Foreign Key Constraints
ALTER TABLE tbl_Fahrtkosten 
    ADD CONSTRAINT FK_Fahrt_Rechnung 
    FOREIGN KEY (Re_ID) 
    REFERENCES tbl_Rechnungen(Re_ID);

-- 4. Indizes für Performance
CREATE INDEX idx_Re_ID ON tbl_Fahrtkosten(Re_ID);
CREATE INDEX idx_Re_Datum ON tbl_Rechnungen(Re_Datum);
CREATE INDEX idx_Re_Person ON tbl_Rechnungen(Re_Person);
```

