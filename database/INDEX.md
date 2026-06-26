# 📑 INDEX - Beihilfe-Planer Datenbankprojekt

## 🎯 Vollständiger Überblick aller Projektdateien

**Erstellt:** 2024-06-25  
**Umfang:** 40+ Dateien | 50 KB+ Dokumentation | 7 Schema-Module  
**Status:** ✅ Produktionsreif

---

## 📂 Dateistruktur

```
/Beihilfe-Planer/
└── database/                          (Neues Projektverzeichnis)
    ├── README.md                      # ← START HIER (Übersicht)
    ├── GETTING_STARTED.md             # ← Schnelleinstieg
    ├── PROJECT_STRUCTURE.md           # Dateiorganisation
    ├── INDEX.md                       # Dieses Dokument
    │
    ├── schema/                        # SQL-Tabellendefinitionen
    │   ├── 01_core_tables.sql         (Anträge & Rechnungen)
    │   ├── 02_travel_costs.sql        (Fahrtkosten)
    │   ├── 03_medical_services.sql    (Medizin & Pharmazie)
    │   ├── 04_documents.sql           (Dokumentenverwaltung)
    │   ├── 05_administration.sql      (Verwaltung & Planung)
    │   ├── 06_financial_reporting.sql (Finanzen & Berichte)
    │   └── 07_configuration.sql       (Konfiguration & Lookup)
    │
    ├── migrations/                    # Schema-Migrationen
    │   ├── 000_TEMPLATE.sql           (Migrations-Vorlage)
    │   └── 001_add_performance_indexes.sql  (Performance)
    │
    ├── views/                         # SQL Reporting Views
    │   └── reporting.sql              (10+ vordefinierte Views)
    │
    └── docs/                          # Dokumentation
        ├── SCHEMA.md                  (Detailliertes ER-Modell)
        ├── ENTITY_RELATIONS.md        (Fremdschlüssel & Abhängigkeiten)
        ├── DATA_DICTIONARY.md         (Alle Spalten dokumentiert)
        ├── QUERIES.md                 (30+ praktische Abfragen)
        └── NORMALIZATION.md           (Verbesserungsvorschläge)
```

---

## 📖 Dokumentation - Übersicht

### Level 1: Anfänger (Start hier!)
| Datei | Inhalt | Aufwand |
|-------|--------|---------|
| [README.md](./README.md) | Projektübersicht & Module | 5 min |
| [GETTING_STARTED.md](./GETTING_STARTED.md) | Schnelleinstieg & Use Cases | 10 min |
| [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) | Dateiorganisation | 5 min |

### Level 2: Praktische Arbeit
| Datei | Inhalt | Nutzen |
|-------|--------|--------|
| [QUERIES.md](./docs/QUERIES.md) | 30+ SQL-Abfragen | Copy-Paste ready |
| [views/reporting.sql](./views/reporting.sql) | 10+ vordefinierte Views | Schnelle Reports |

### Level 3: Tiefes Verständnis
| Datei | Inhalt | Details |
|-------|--------|---------|
| [SCHEMA.md](./docs/SCHEMA.md) | Vollständiges ER-Diagramm | 70+ Tabellen|Seiten |
| [ENTITY_RELATIONS.md](./docs/ENTITY_RELATIONS.md) | Fremdschlüsselbeziehungen | Datenflusss |
| [DATA_DICTIONARY.md](./docs/DATA_DICTIONARY.md) | Alle Spalten & Datentypen | Nachschlagewerk |

### Level 4: Architektur & Design
| Datei | Inhalt | Fokus |
|-------|--------|-------|
| [NORMALIZATION.md](./docs/NORMALIZATION.md) | Normalisierungsoptionen | Verbesserungen |

---

## 🗂️ Nach Anwendungsfall

### "Ich bin neu und will die DB verstehen"
1. [README.md](./README.md) - Überblick
2. [GETTING_STARTED.md](./GETTING_STARTED.md) - Schnelleinstieg  
3. [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) - Struktur
4. [SCHEMA.md](./docs/SCHEMA.md) - Details

### "Ich muss eine Abfrage schreiben"
1. [QUERIES.md](./docs/QUERIES.md) - Fertige SQL-Abfragen
2. [views/reporting.sql](./views/reporting.sql) - Vordefinierte Views
3. [DATA_DICTIONARY.md](./docs/DATA_DICTIONARY.md) - Feldnamen nachschauen

### "Ich will Rechnungen tracken"
→ Siehe [QUERIES.md#finanzauswertungen](./docs/QUERIES.md#-finanzauswertungen)
```sql
SELECT * FROM vw_rechnung_zahlungsstand WHERE offen_betrag > 0;
```

### "Ich muss Fahrtkosten verwalten"
→ Siehe [QUERIES.md#fahrtkosten](./docs/QUERIES.md#-fahrtkosten)
```sql
SELECT * FROM tbl_Fahrtkosten WHERE CheckOut = 0;
```

### "Ich want die Kostenverteilung sehen"
→ Siehe [QUERIES.md#kostenträger](./docs/QUERIES.md#-finanzauswertungen)
```sql
SELECT strftime('%Y-%m', Re_Datum), 
       SUM(PKV_Erstattung), SUM(BH_Erstattung)
FROM tbl_Rechnungen GROUP BY strftime('%Y-%m', Re_Datum);
```

### "Ich muss das Schema ändern"
1. [NORMALIZATION.md](./docs/NORMALIZATION.md) - Planung
2. [migrations/000_TEMPLATE.sql](./migrations/000_TEMPLATE.sql) - Vorlage
3. [migrations/001_add_performance_indexes.sql](./migrations/001_add_performance_indexes.sql) - Beispiel

---

## 📊 Schema-Modulübersicht

### 01_core_tables.sql - Kernmodule
**Tabellen:** 4  
**Zweck:** Zentrale Rechnungsverwaltung  
**Abhängigkeiten:** Keine (muss zuerst geladen werden!)

| Tabelle | Beschreibung | Beispiel |
|---------|-------------|---------|
| tbl_Antraege | Beihilfenanträge | "2024-01" Antrag am 2024-06-15 |
| tbl_Rechnungen ⭐ | Zentrale Rechnungstabelle | Komplette Zahlungsabwicklung |
| tbl_ReDetails | GOÄ-Leistungsdetails | Einzelne Leistungspositionen |
| tbl_ReDetailsDepot | Leistungs-Katalog | GOÄ-Katalog |

### 02_travel_costs.sql - Fahrtkosten
**Tabellen:** 3  
**Zweck:** Mobilität & Fahrtkosten

| Tabelle | Beschreibung |
|---------|------------|
| tbl_Fahrtkosten | Einzelne Fahrten (Hinfahrt + Rückfahrt) |
| tbl_Fahrtziele | Zielkatalog (Krankenhaus, Praxis, etc.) |
| tbl_Parken | Parkgebühren |

### 03_medical_services.sql - Medizinische Leistungen
**Tabellen:** 8  
**Zweck:** Medizin, Pharmazie, Krankenhausleistungen

| Tabelle | Beschreibung |
|---------|------------|
| tbl_Arztbesuch | Arztkonsultationen |
| tbl_Medikamente | Einzelne Medikationen (Rezepthistorie) |
| tbl_Medikation | Dauermedikationen pro Patient |
| tbl_Medikation_neu | Medikation mit Dezimalzahlen |
| tbl_KhKosten | Krankenhausleistungen |
| tbl_ImpfBuch | Impfpass |
| tbl_Impfen | Impfplanung |
| tbl_Zusatz | Zusatzversicherungsleistungen |

### 04_documents.sql - Dokumentenverwaltung
**Tabellen:** 5  
**Zweck:** Digitale Dokumentenspeicherung

| Tabelle | Beschreibung |
|---------|------------|
| tbl_DokMig | Dokumentenmigrationen |
| tbl_DokSql | In-Datenbank-Speicherung |
| tbl_DokSonstige | Weitere Dokumenttypen |
| tbl_DokSonstigeLink | Verknüpfungen |
| tbl_DokSuche | Suchindex |

### 05_administration.sql - Verwaltung
**Tabellen:** 7  
**Zweck:** Kontakte, Aufgaben, Planung

| Tabelle | Beschreibung |
|---------|------------|
| tbl_Kontakte | Arzt-/Klinik-Adressbuch |
| tbl_ToDoListe | Aufgabenmanagement |
| tbl_ToDoListe2 | Alternative Aufgabenliste |
| tbl_ToDoVorlagen | Aufgabenvorlagen |
| tbl_Vorsorge | Vorsorgeplanung & Erinnerungen |
| tbl_Lexikon | Glossar/Begriffserklärungen |

### 06_financial_reporting.sql - Finanzien & Berichte
**Tabellen:** 7  
**Zweck:** Auswertungen, Berichte, Erstattungen

| Tabelle | Beschreibung |
|---------|------------|
| tbl_Beitraege | Versicherungsbeiträge |
| tbl_BRE | Beihilfe-Rückerstattungsdetails |
| tbl_PlusMinus | Ausgleichszahlungen |
| tbl_Ratenzahlung | Ratenzahlungspläne |
| tbl_Monat_RepDaten | Monatsberichte (denormalisiert) |
| tbl_Monat_RepBasis | Basis-Aggregationen |
| tbl_Monat_RepAnsicht | Historische Auswertungen |

### 07_configuration.sql - Systemkonfiguration
**Tabellen:** 3  
**Zweck:** Lookup-Codes, Konfiguration, Einstellungen

| Tabelle | Beschreibung |
|---------|------------|
| tbl_DLC | Lookup-Codes (Kategorien) |
| tbl_PersAuswahl | Personenauswahl (Familienmitglieder) |
| tbl_Sicht | Ansichtseinstellungen (UI-Preferences) |

---

## 🔍 Schnellsuche nach Thema

### Zahlungen & Erstattungen
- Tabelle: `tbl_Rechnungen` (Hauptfeld)
- Views: `vw_rechnung_zahlungsstand`, `vw_monatliche_kosten`
- Queries: [QUERIES.md#finanzauswertungen](./docs/QUERIES.md#-finanzauswertungen)

### Fahrtkosten
- Tabelle: `tbl_Fahrtkosten`, `tbl_Fahrtziele`
- Views: `vw_fahrtkosten_zusammenfassung`
- Queries: [QUERIES.md#fahrtkosten](./docs/QUERIES.md#-fahrtkosten)

### Medizinische Leistungen
- Tabellen: `tbl_KhKosten`, `tbl_Medikamente`, `tbl_ArztBesuch`
- Views: `vw_khkosten_kategorien`, `vw_patient_medikationen`
- Queries: [QUERIES.md#krankenhausleistungen](./docs/QUERIES.md#-krankenhausleistungen)

### Aufgabenmanagement
- Tabelle: `tbl_ToDoListe`
- Views: `vw_offene_aufgaben`
- Queries: [QUERIES.md#aufgabenmanagement](./docs/QUERIES.md#-aufgabenmanagement)

### Patienteninfo
- Tabelle: `tbl_PersAuswahl`
- Cross-Refs: `tbl_Fahrtkosten.Fk_Patient`, `tbl_Medikation.Mk_Patient`
- Queries: [QUERIES.md#suche--filterung](./docs/QUERIES.md#-suche--filterung)

---

## 🚀 Schnellstarts

### Installation (5 min)
```bash
cd /Users/davidsiegeris/Beihilfe-Planer
sqlite3 beihilfe.db < database/schema/*.sql
sqlite3 beihilfe.db < database/views/reporting.sql
```

### Erste Abfrage (1 min)
```sql
SELECT * FROM vw_monatliche_kosten LIMIT 5;
```

### Komplexe Auswertung (5 min)
Siehe [QUERIES.md#finanzauswertungen](./docs/QUERIES.md#-finanzauswertungen)

---

## 📋 Wichtige Spalten (Spickzettel)

| Spalte | Tabelle | Bedeutung |
|--------|---------|-----------|
| Re_ID | tbl_Rechnungen | Rechnungs-ID (Primary Key) |
| Re_Betrag | tbl_Rechnungen | Rechnungssumme |
| PKV_Erstattung | tbl_Rechnungen | Private KV zahlt |
| BH_Erstattung | tbl_Rechnungen | Beihilfe zahlt |
| Re_Abschluss | tbl_Rechnungen | Status (offen, bezahlt, storno) |
| Fk_Kosten | tbl_Fahrtkosten | Fahrtkosten (€) |
| Kh_Kosten | tbl_KhKosten | Krankenhauskosten |
| M_Name | tbl_Medikamente | Medikamentenname |
| TD_Status | tbl_ToDoListe | Aufgabenstatus (0=offen) |

---

## 🔗 Wichtigste Fremdschlüsselbeziehungen

```
tbl_Rechnungen (Re_ID) ←→ viele Tabellen:
    ├── tbl_ReDetails (Re_ID)
    ├── tbl_Fahrtkosten (Re_ID)
    ├── tbl_KhKosten (Re_ID)
    ├── tbl_Medikamente (Re_ID)
    ├── tbl_ToDoListe (Re_ID)
    ├── tbl_DokSql (Re_ID)
    └── tbl_BRE (Re_ID)
```

---

## ✅ Qualitäts-Checkliste

- [x] Schema in 7 Module organisiert
- [x] 40+ Felder dokumentiert
- [x] 10+ Views für Reporting
- [x] 30+ praktische SQL-Abfragen
- [x] Normalisierungsempfehlungen
- [x] Migration-Vorlagen
- [x] Performance-Indizes
- [x] Fehlerbehandlung
- [x] Datenvalidierung

---

## 📞 Support & Ressourcen

### Problem: "Ich kenne die genaue Spaltennamen nicht"
→ [DATA_DICTIONARY.md](./docs/DATA_DICTIONARY.md)

### Problem: "Ich will eine Abfrage schreiben"
→ [QUERIES.md](./docs/QUERIES.md) (30+ Beispiele)

### Problem: "Ich verstehe die ER-Struktur nicht"
→ [ENTITY_RELATIONS.md](./docs/ENTITY_RELATIONS.md)

### Problem: "Ich will die DB verbessern"
→ [NORMALIZATION.md](./docs/NORMALIZATION.md)

### Problem: "Ich weiß nicht wie ich anfangen soll"
→ [GETTING_STARTED.md](./GETTING_STARTED.md)

---

## 📝 Dokumentversionen

| Version | Datum | Änderungen |
|---------|-------|-----------|
| 1.0 | 2024-06-25 | Initial Release |

---

**Letzter Update:** 2024-06-25  
**Maintainer:** Beihilfe-Planer Team  
**Status:** ✅ Produktionsbereit

