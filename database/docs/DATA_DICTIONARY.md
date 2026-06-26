# Datenbank Datenwörterbuch

## Übersicht aller Tabellen und Spalten

### 1. tbl_Antraege
| Spalte | Typ | Länge | Beschreibung |
|--------|-----|-------|-------------|
| BHA_ID | INTEGER | - | Primärschlüssel (Autoincrement) |
| BHA_Nr | VARCHAR | 7 | Antragsnummer (Format: YYYY-MM) |
| BHA_Dat | DateTime | - | Antragsdatum |
| BHA_BeschDat | DateTime | - | Bescheid-Ausstellungsdatum |
| SuchMarke | VARCHAR | 1 | Suchmarke für Filterung |
| BHA_aktiv | BIT | - | Antragsstatus (1=aktiv, 0=inaktiv) |

---

### 2. tbl_Rechnungen (Zentrale Rechnungstabelle)
| Spalte | Typ | Default | Beschreibung |
|--------|-----|---------|-------------|
| Re_ID | INTEGER | - | Primärschlüssel |
| Re_Aussteller | VARCHAR | 80 | Rechnungsaussteller (Arzt/Klinik) |
| Re_Person | VARCHAR | 25 | Versicherter/Patient |
| Re_Nr | VARCHAR | 20 | Externe Rechnungsnummer |
| Re_Datum | DATETIME | - | Rechnungsdatum |
| Re_Massnahme | VARCHAR | 130 | Leistungsbeschreibung |
| Re_Betrag | MONEY | 0 | Rechnungssumme |
| Re_Eingang | DATETIME | - | Eingangsbestätigung |
| Re_Termin | DATETIME | - | Zahlungsziel |
| Re_Zahltag | DATETIME | - | Tatsächliches Zahlungsdatum |
| PKV_Einreichung | DATETIME | - | Einreichung bei PKV |
| PKV_Direkt | MONEY | 0 | Direktzahlung PKV an Provider |
| PKV_Erstattung | MONEY | 0 | Kostenerstattung PKV |
| PKV_Bem | TEXT | - | PKV-Bemerkungen |
| BH_Einreichung | DATETIME | - | Einreichung bei Beihilfe |
| BH_Antrag_Nr | VARCHAR | 7 | Beihilfe-Antragsnummer |
| BH_Erstattung | MONEY | 0 | Beihilfe-Kostenerstattung |
| BET_Erwartung | MONEY | 0 | BET-Erwartungsleistung |
| BET_BH_PKV | DATETIME | - | BET-Bearbeitungsstichtag |
| BET_Erstattung | DECIMAL | 0 | BET-Ausgleichszahlung |
| Re_Abschluss | VARCHAR | 10 | Status (offen, bezahlt, storno) |
| Re_Abschluss_Datum | DATETIME | - | Abschlussdatum |
| Prozent_PKV | INTEGER | 0 | PKV Kostenquote (%) |
| Prozent_BH | INTEGER | 0 | Beihilfe Kostenquote (%) |
| PKV_Prognose | MONEY | 0 | Prognostizierte PKV-Zahlung |
| BH_Prognose | MONEY | 0 | Prognostizierte Beihilfe |
| Pkv_SB | MONEY | 0 | PKV Selbstbeteiligung |
| Pkv_HB | MONEY | 0 | PKV Höchstbeteiligung |
| BH_EA | MONEY | 0 | Beihilfe Eigenanteil |
| BH_HB | MONEY | 0 | Beihilfe Höchstbeteiligung |
| Rz_Rest | MONEY | 0 | Ratenzahlungsrest |
| Alt_Re_ID | INTEGER | 0 | Alternative (historische) Re_ID |
| QrEmpfaenger | TEXT | - | SEPA QR-Code Empfänger |
| QrIban | TEXT | - | SEPA QR-Code IBAN |
| QrZweck | TEXT | - | SEPA QR-Code Verwendungszweck |
| QrBetrag | REAL | 0 | SEPA QR-Code Betrag |

**Marker-Felder:**
- `Re_marker` (BIT): Rechnungsmarkierung
- `Rech_marker` (BIT): Rechnungsstatus-Marker
- `PKV_marker` (VARCHAR): PKV-Verarbeitungsstatus
- `BET_marker` (VARCHAR): BET-Verarbeitungsstatus
- `BH_marker` (VARCHAR): Beihilfe-Verarbeitungsstatus
- `Loesch_marker` (BIT): Soft-Delete Flag
- `PS_marker` (VARCHAR): Verarbeitungsschritt (0-4)

---

### 3. tbl_ReDetails (Leistungsdetails)
| Spalte | Typ | Beschreibung |
|--------|-----|-------------|
| RD_ID | INTEGER | Primärschlüssel |
| Re_ID | INTEGER | Fremdschlüssel zu tbl_Rechnungen |
| RD_Datum | DATETIME | Leistungsdatum |
| RD_GOAe | VARCHAR(12) | GOÄ/EBM-Leistungsnummer |
| RD_Beschreibung | VARCHAR(255) | Leistungsbeschreibung |
| RD_Faktor | DOUBLE | Steigerungsfaktor (1-3,5) |
| RD_Anz | INTEGER | Anzahl Leistungen |
| RD_Kosten | MONEY | Berechnete Kosten |
| Alt_Re_ID | INTEGER | Historische Rechnungs-ID |
| SuchMarke | VARCHAR(1) | Filtermarke |

---

### 4. tbl_Fahrtkosten (Fahrten)
| Spalte | Typ | Beschreibung |
|--------|-----|-------------|
| Fk_ID | INTEGER | Primärschlüssel |
| Re_ID | INTEGER | Zuordnung zu Rechnung |
| Fk_Hinfahrt | DATETIME | Anfahrtsdatum |
| Fk_Rueckfahrt | DATETIME | Rückfahrtsdatum |
| Fk_Patient | VARCHAR(30) | Fahrendende Person |
| Fk_Fahrtziel | VARCHAR(200) | Zielort (Krankenhaus, Praxis, etc.) |
| Fk_Verkehrsmittel | VARCHAR(15) | auto / oevm / taxi |
| Fk_Anzahl | INTEGER | Anzahl Fahrten |
| Fk_Entfernung | INTEGER | Kilometer (einfache Fahrt) |
| Fk_Kosten | MONEY | Fahrtkosten (€) |
| Fk_Pauschale | MONEY | Kilometerpauschale |
| Fk_oeVm | BIT | Öffentliche Verkehrsmittel? |
| CheckOut | BIT | Zahlungsstatus |
| SuchMarke | VARCHAR(1) | Filtermarke |

---

### 5. tbl_KhKosten (Krankenhauskosten)
| Spalte | Typ | Beschreibung |
|--------|-----|-------------|
| Kh_ID | INTEGER | Primärschlüssel |
| Re_ID | INTEGER | Zuordnung zu Rechnung |
| Kh_Hinfahrt | DATETIME | Aufnahmedatum |
| Kh_Rueckfahrt | DATETIME | Entlassungsdatum |
| Kh_Patient | VARCHAR(30) | Patient |
| Kh_Kategorie | VARCHAR(50) | Operation / Therapie / Diagnostik / Rehab |
| Kh_Massnahme | VARCHAR(200) | Leistungsbeschreibung |
| Kh_Kosten | MONEY | Gesamtkosten |
| Kh_E_Kosten | MONEY | Eigenanteilkosten |
| Kh_Sb_Kosten | MONEY | Selbstbeteiligung |
| Kh_Zuordnung | VARCHAR(25) | PKV / BH / privat |
| CheckOut | BIT | Zahlungsstatus |

---

### 6. tbl_Medikamente (Einzelmedikation)
| Spalte | Typ | Beschreibung |
|--------|-----|-------------|
| M_ID | INTEGER | Primärschlüssel |
| Re_ID | INTEGER | Zuordnung zu Rechnung (Apotheke) |
| M_Datum | DATETIME | Ausstellungsdatum Rezept |
| M_Patient | VARCHAR(30) | Versicherter Patient |
| M_Name | VARCHAR(200) | Medikamentenname |
| M_PZN | VARCHAR(20) | Pharmazentralnummer |
| M_Wirkstoff | VARCHAR(200) | Wirkstoff/Indikation |
| M_Rzpfl | BIT | Rezeptpflicht (1=ja) |

---

### 7. tbl_Medikation (Dauermedikation)
| Spalte | Typ | Beschreibung |
|--------|-----|-------------|
| Mk_ID | INTEGER | Primärschlüssel |
| Mk_Patient | VARCHAR(30) | Patient |
| Mk_Name | VARCHAR(200) | Medikamentenname |
| Mk_PZN | VARCHAR(20) | Pharmazentralnummer |
| Mk_F | INTEGER/DOUBLE | Frühstück-Dosis |
| Mk_M | INTEGER/DOUBLE | Mittag-Dosis |
| Mk_A | INTEGER/DOUBLE | Abend-Dosis |
| Mk_N | INTEGER/DOUBLE | Nacht-Dosis |
| Mk_Bem | VARCHAR(100) | Besonderheiten (z.B. "zu den Mahlzeiten") |

---

### 8. tbl_Kontakte (Adressbuch)
| Spalte | Typ | Beschreibung |
|--------|-----|-------------|
| K_ID | INTEGER | Primärschlüssel |
| K_Arzt | VARCHAR(100) | Name/Praxis/Einrichtung |
| K_Tel | VARCHAR(30) | Telefon |
| K_Mobil | VARCHAR(30) | Mobilnummer |
| K_Mail | VARCHAR(80) | Email-Adresse |
| K_Bem | VARCHAR(255) | Bemerkungen (Spezialgebiet, etc.) |
| SuchMarke | VARCHAR(1) | Filtermarke |

---

### 9. tbl_ToDoListe (Aufgaben)
| Spalte | Typ | Beschreibung |
|--------|-----|-------------|
| TD_ID | INTEGER | Primärschlüssel |
| Re_ID | INTEGER | Zuordnung zu Rechnung |
| TD_Datum | DATETIME | Aufgabendatum |
| TD_Stelle | VARCHAR(8) | Zuständige Stelle (BH, PKV, Arzt, etc.) |
| TD_Aufgabe | VARCHAR(15) | Aufgabentyp |
| TD_Beschreibung | VARCHAR(255) | Aufgabendetails |
| TD_Status | INTEGER | 0=offen, >0=abgeschlossen |
| TD_EndDatum | DATETIME | Abschlussdatum |
| SuchMarke | VARCHAR(1) | Filtermarke |

---

### 10. tbl_BRE (Beihilfe-Rückerstattung)
| Spalte | Typ | Beschreibung |
|--------|-----|-------------|
| BRE_ID | INTEGER | Primärschlüssel |
| Re_ID | INTEGER | Zuordnung zu Rechnung |
| BRE_Person | TEXT | Patient/Versicherter |
| BRE_ReMassnahme | TEXT | Leistung |
| BRE_ReDatum | DateTime | Rechnungsdatum |
| BRE_Prozent | INTEGER | Beihilfequote (%) |
| BRE_ReBetrag | REAL | Auszahlungsbetrag |
| BRE_Abzug | REAL | Abzüge |
| BRE_Jahr | INTEGER | Jahrzuordnung |
| BRE_Status | TEXT | Bearbeitungsstatus |

---

### 11. tbl_Monat_RepDaten (Monatsberichte)
| Spalte | Typ | Beschreibung |
|--------|-----|-------------|
| MonatsZahl | INTEGER | Monat (01-12) |
| JahresZahl | INTEGER | Jahr |
| RechBetrag | MONEY | Gesamtrechnungsbetrag |
| GesPKV_Grund | MONEY | PKV Grundleistung |
| GesPKV_Direkt | MONEY | PKV Direktzahlungen |
| GesPKV_BET | MONEY | PKV BET-Anteile |
| GesPKV_Erstatt | MONEY | PKV Erstattungen |
| GesBH_Erstatt | MONEY | Beihilfe-Erstattungen |
| GesSE | MONEY | Selbstbeteiligung |
| GesSK | MONEY | Selbstbeteiligung-Kostenanteil |

---

## Häufig genutzte Kombinationen

### Patienten-Identifikation
- `tbl_Fahrtkosten.Fk_Patient`
- `tbl_KhKosten.Kh_Patient`
- `tbl_Medikamente.M_Patient`
- `tbl_Arztbesuch.AB_Patient`
- `tbl_PersAuswahl.Pa_Person`

### Rechnungslebenzyklus
1. Erfassung → `tbl_Rechnungen.Re_Datum`
2. Eingang → `Re_Eingang`
3. Einreichung PKV → `PKV_Einreichung`
4. Einreichung BH → `BH_Einreichung`
5. Zahlung → `Re_Zahltag`
6. Abschluss → `Re_Abschluss_Datum`

### Kostenträgerzuordnung
| Kostenträger | Felder |
|-------------|--------|
| PKV | `PKV_Direkt`, `PKV_Erstattung`, `PKV_Bem`, `Prozent_PKV` |
| Beihilfe | `BH_Erstattung`, `BH_Antrag_Nr`, `Prozent_BH` |
| BET | `BET_Erstattung`, `BET_Erwartung` |
| Privat | `Re_Betrag - (PKV_* + BH_*)` |

