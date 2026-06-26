# Detaillierte Schemadokumentation - Beihilfe-Planer

## 1. KERNTABELLEN

### tbl_Rechnungen (Zentrale Rechnungstabelle)
**Zweck**: Alle medizinischen Rechnungen und Leistungen

```
Schlüsselfelder:
- Re_ID (PK): Eindeutige Rechnungs-ID
- Re_Nr: Externe Rechnungsnummer
- Re_Aussteller: Arzt/Klinik/Provider
- Re_Datum: Rechnungsdatum
- Re_Betrag: Rechnungsbetrag (MONEY)

Zahlungsfluss-Tracking:
- PKV_Einreichung: Datum Einreichung Private KV
- PKV_Direkt: Direktzahlung PKV
- PKV_Erstattung: PKV Kostenübernahme
- BH_Einreichung: Datum Beihilfe-Einreichung
- BH_Erstattung: Beihilfe-Erstattung
- BET_Erstattung: Arzt-Beihilfeanspruch-Erstattung
- Pkv_SB, Pkv_HB: Selbstbeteiligung/Höchstbeteiligung PKV
- BH_EA, BH_HB: Eigenanteil/Höchstbeteiligung Beihilfe

Status-Marker:
- Re_marker: Markiertes Rechnungsstatus
- Rech_marker, PKV_marker, BET_marker, BH_marker: Status per Kostenträger
- Loesch_marker: Löschmarkierung
- Re_Abschluss: Abschlussstatus (Zahlung, Storno, etc.)
- PS_marker: Verarbeitungsstatus (0-4)

QR-Code:
- QrEmpfaenger, QrIban, QrZweck, QrBetrag: SEPA-Zahlungsdetails
```

### tbl_ReDetails (Leistungsdetails)
**Zweck**: Zeilenpositionen einer Rechnung nach GOÄ/EBM

```
- RD_ID (PK)
- Re_ID (FK): Zuordnung zu tbl_Rechnungen
- RD_GOAe: GOÄ-Nummer oder Leistungskennzeichen
- RD_Beschreibung: Leistungsbeschreibung
- RD_Faktor: Steigerungsfaktor (1-3,5)
- RD_Anz: Anzahl Leistungserbringung
- RD_Kosten: Berechnete Kosten
```

### tbl_Antraege (Beihilfeanträge)
**Zweck**: Nachverfolgung von Beihilfeantragsstellung

```
- BHA_ID (PK)
- BHA_Nr: Antragsnummer (Format: YYYY-MM)
- BHA_Dat: Antragsdatum
- BHA_BeschDat: Bescheid-Datum
- BHA_aktiv: Status (1=aktiv, 0=inaktiv)
```

---

## 2. MEDIZINISCHE LEISTUNGEN

### tbl_Fahrtkosten (Fahrten)
**Zweck**: Kilometergeld und Fahrtkosten für medizinische Ziele

```
- Fk_ID (PK)
- Re_ID (FK): Zuordnung zu Rechnung
- Fk_Hinfahrt, Fk_Rueckfahrt: Fahrtdaten
- Fk_Fahrtziel: Bestimmungsort
- Fk_Verkehrsmittel: auto|oevm|taxi
- Fk_Entfernung: Kilometer
- Fk_Kosten: Fahrtkosten (€)
- Fk_Pauschale: Kilometerpauschale
- Fk_oeVm: Öffentliche Verkehrsmittel-Flag
- Alt_Re_ID: Historische Rechnung
- CheckOut: Zahlungsstatus
```

### tbl_Fahrtziele
**Zweck**: Häufig angefahrene medizinische Ziele

```
- Fz_ID (PK)
- Fz_Fahrtziel: Zielname (Krankenhaus, Praxis, etc.)
- Fz_Entfernung: Standard-Entfernung (km)
```

### tbl_KhKosten (Krankenhauskosten)
**Zweck**: Stationäre Behandlungen und deren Kosten

```
- Kh_ID (PK)
- Re_ID (FK): Zuordnung zu Rechnung
- Kh_Hinfahrt, Kh_Rueckfahrt: Aufenthaltsdatum
- Kh_Kategorie: Operation|Therapie|Diagnostik
- Kh_Massnahme: Leistungsbeschreibung
- Kh_Kosten: Gesamtkosten
- Kh_E_Kosten: Eigenanteil-Kosten
- Kh_Sb_Kosten: Selbstbeteiligung
- Kh_Zuordnung: PKV|BH|privat
- CheckOut: Zahlungsstatus
```

### tbl_Medikamente (Verschriebene Medikation)
**Zweck**: Dokumentation verschriebener Arzneimittel

```
- M_ID (PK)
- Re_ID (FK): Zuordnung zu Rechnung/Apotheke
- M_Datum: Ausstellungsdatum Rezept
- M_Patient: Patientenname
- M_Name: Medikamentenname
- M_PZN: Pharmazentralnummer
- M_Wirkstoff: Wirksame Substanz
- M_Rzpfl: Rezeptpflicht (1=ja, 0=nein)
```

### tbl_Medikation (Dauermedikation)
**Zweck**: Regelmäßig einzunehmende Medikamente

```
- Mk_ID (PK)
- Mk_Patient: Patientenname
- Mk_Name: Medikamentenname
- Mk_PZN: Pharmazentralnummer
- Mk_F/M/A/N: Häufigkeit (Frühstück/Mittag/Abend/Nacht)
  - Wert: Anzahl Tabletten/Dosis pro Zeitpunkt
- Mk_Bem: Besonderheiten/Hinweise

Hinweis: tbl_Medikation_neu hat Mk_F/M/A/N als DOUBLE (Dezimalzahlen)
```

### tbl_ImpfBuch & tbl_Impfen (Impfungen)
**Zweck**: Impfpass und Impfplanungen

```
ImpfBuch:
- Imp_ID (PK)
- Imp_Datum: Impfdatum
- Imp_Patient: Patientenname
- Imp_Massnahme: Impfstoff/Indikation
- Imp_Bemerkung: Nebenwirkungen, Nächste Impfung

Impfen (Planung):
- Imp_PlanDat: Geplantes Datum
- Imp_Monat, Imp_Jahr: Zeitliche Kategorisierung
```

### tbl_Arztbesuch (Dokumentation)
**Zweck**: Einzelne Arztkonsultationen

```
- AB_ID (PK)
- AB_Datum: Besuchsdatum
- AB_Patient: Patientenname
- AB_Arzt: Fachbereich/Name
- AB_Grund: Diagnose/Besuchsgrund
- Druck_aktiv: Ausdruckstatus
```

### tbl_Parken (Parkgebühren)
**Zweck**: Parkkosten als medizinische Nebenkosten

```
- P_ID (PK)
- Re_ID (FK): Zuordnung zu Fahrt/Rechnung
- P_Tag: Parkdatum
- P_Kategorie: Art Parkplatz
- P_Parkplatz: Lokation
- P_Kosten: Gebühren (€)
```

### tbl_Zusatz (Zusatzversicherungen)
**Zweck**: Zusatzleistungen von Zusatzversicherungen

```
- Z_ID (PK)
- Z_Re_ID (FK): Rechnungszuordnung
- Z_BhPkv: 0=Beihilfe, 1=PKV (Zuordnung)
- Z_Bez: Leistungsbeschreibung
- Z_Betrag: Erstattungsbetrag
```

---

## 3. VERWALTUNG & PLANUNG

### tbl_Kontakte (Arztverzeichnis)
**Zweck**: Ärzte, Kliniken, Therapeuten

```
- K_ID (PK)
- K_Arzt: Name/Praxis
- K_Tel: Telefon
- K_Mobil: Mobilnummer
- K_Mail: Email
- K_Bem: Bemerkungen/Spezialgebiet
```

### tbl_ToDoListe (Aufgaben)
**Zweck**: Aktionsaufgaben und Nachverfolgung

```
- TD_ID (PK)
- Re_ID (FK): Zuordnung zu Rechnung
- TD_Datum: Aufgabendatum
- TD_Stelle: Zuständige Stelle (Beihilfe, PKV, etc.)
- TD_Aufgabe: Aufgabentyp
- TD_Beschreibung: Details
- TD_Status: 0=offen, >0=abgeschlossen
- TD_EndDatum: Abschlussdatum
```

### tbl_ToDoVorlagen (Aufgabenvorlagen)
**Zweck**: Wiederverwendbare Aufgabenschablonen

### tbl_Vorsorge (Vorsorgeplanung)
**Zweck**: Präventive Maßnahmen und Impfplanungen

```
- Vs_ID (PK)
- Vs_PlanDat: Geplantes Datum
- Vs_Turnus: Intervall (jährlich, halbjährlich, etc.)
- Vs_Termin: Nächster Termin
- Vs_Massnahme: Vorsorgetyp (Zahnreinigung, etc.)
```

### tbl_Lexikon (Begriffserklärungen)
**Zweck**: Glossar für Benutzer

```
- Lexikon_ID (PK)
- Stichwort: Begriffs
- Beschreibung: Erklärung (TEXT)
```

---

## 4. DOKUMENTENVERWALTUNG

### tbl_DokSql (SQL-gespeicherte Dokumente)
**Zweck**: Digitale Dokumente in Datenbank

```
- Doc_ID (PK)
- Re_ID (FK): Zuordnung zu Rechnung
- Doc_Bez: Dokumentname
- Doc_Datei: Dateiname
- Doc_Exist: Dateiexistenzflag
- Doc_Typ: PDF|Bild|Office
- Doc_Datum: Dokumentdatum
- Doc_Person: Aussteller
```

### tbl_DokMig & tbl_DokSonstige (Andere Dokumentformate)
**Zweck**: Migration und externe Dokumente

### tbl_DokSuche (Suchindex)
**Zweck**: Optimierte Dokumentsuche

---

## 5. FINANZIELLE AUSWERTUNGEN

### tbl_Monat_RepDaten (Monatsberichte)
**Zweck**: Aggregierte monatliche Finanzauswertungen

```
- MonatsZahl: Monatsnummer (01-12)
- JahresZahl: Jahr
- RechBetrag: Gesamtrechnungsbetrag
- GesPKV_Grund: PKV Grundzahlung
- GesPKV_Direkt: PKV Direktzahlung
- GesPKV_BET: PKV BET-Anteile
- GesBH_Erstatt: Beihilfe-Erstattung
- GesSE: Selbstbeteiligung
- GesSK: Selbstbeteiligung-Kostenanteil
```

### tbl_Beitraege (Versicherungsbeiträge)
**Zweck**: Monatliche Beitragszahlungen

```
- BB_Monat, BB_Jahr: Zeitraum
- BB_Patient: Versicherter
- BB_Beitrag: Beitragsbetrag
- BB_Bre: BRE-Anrechnung
- BB_Bem: Besonderheiten
```

### tbl_BRE (Beihilfeberechnung)
**Zweck**: Beihilfe-Rückerstattungseinheit (komplex)

```
- BRE_ID (PK)
- Re_ID (FK): Rechnungszuordnung
- BRE_Person: Versicherter
- BRE_ReDatum: Rechnungsdatum
- BRE_Prozent: Beihilfequote (%)
- BRE_ReBetrag: Auszahlungsbetrag
- BRE_Abzug: Abzüge
- BRE_Status: Bearbeitungsstatus
```

### tbl_PlusMinus (Ausgleichszahlungen)
**Zweck**: Nachzahlungen, Ausgleiche, Korrektionen

```
- PM_ID (PK)
- PM_Tag: Datum
- PM_Kategorie: Art (Nachzahlung, Erstattung, etc.)
- PM_Plus: Gutschriftbetrag
- PM_Minus: Belastungsbetrag
```

### tbl_Ratenzahlung (Installmentplan)
**Zweck**: Zahlung in Raten

```
- Rz_ID (PK)
- Re_ID (FK): Rechnungszuordnung
- Rz_Datum: Ratendatum
- Rz_Rate: Ratenbetrag
- Rz_Bem: Besonderheiten
```

---

## 6. KONFIGURATION

### tbl_DLC (Lookup-Codes)
**Zweck**: Kategorien und Klassifizierungen

```
- L_ID (PK)
- LCode: Kategorie-Code (auto|oevm|taxi|etc.)
```

### tbl_PersAuswahl (Personenverwaltung)
**Zweck**: Familienmitglieder und deren Versicherungskombinationen

```
- Pa_ID (PK)
- Pa_Person: Name
- Pa_PKV: PKV-Status (1/0)
- Pa_BH: Beihilfe-Status (1/0)
```

### tbl_Sicht (Ansichtseinstellungen)
**Zweck**: Benutzereinstellungen für UI-Sichtbarkeit

```
- cb_ID (PK)
- cb_Txt: Ansicht-Name
- cb1-cb15: Spalten-Visibility-Flags
```

---

## 7. HISTORISCHE & REPORTING-TABELLEN

### tbl_Monat_RepBasis & tbl_Monat_RepAnsicht
**Beschreibung**: Verschiedene Aggregationen für Berichte
- **RepBasis**: Keine PK, Basis-Aggregationen
- **RepAnsicht**: Mit XX_ID für historische Aufzeichnungen

---

## Datentyp-Mapping

| Datentyp | Verwendung |
|----------|-----------|
| INTEGER | IDs, Zähler, Prozente, Jahre |
| VARCHAR(n) | Namen, Nummern, Beschreibungen |
| TEXT | Lange Texte, Notizen, Lexikon |
| DATETIME | Datumsangaben |
| MONEY | Finanzbetrag |
| DECIMAL | Dezimalzahlen (BET_Erstattung) |
| REAL | Floating-Point (Faktoren, Dosierungen) |
| DOUBLE | Präzisions-Dezimalzahlen |
| BIT | Boolesche Werte |

---

## Wichtige Felder (Cross-Tabelle)

| Feld | Bedeutung | Tabellen |
|------|----------|----------|
| `Re_ID` | Rechnungsreferenz | Fahrtkosten, KhKosten, etc. |
| `SuchMarke` | Schnell-Filtermarke | Alle (Archivierung, aktiv/inaktiv) |
| `Alt_Re_ID` | Historische Rechnungs-ID | Fahrtkosten, KhKosten, Medikamente |
| `CheckOut` | Zahlungsstatus | Fahrtkosten, KhKosten |
- `*_marker` | Status-Flags | Rechnungen, ToDoListe |
| `_Person` | Patientenname | Fahrtkosten, KhKosten, Medikation, etc. |
| `_Patient` | Patientenname (Variante) | Arztbesuch, Beitraege, etc. |
| `_Datum` | Zeitstempel | Durchgehend |

