# Beihilfe-Planer Datenbankprojekt

## Übersicht

Das **Beihilfe-Planer** System ist eine spezialisierte Anwendung zur Verwaltung von Gesundheitskosten und Beihilfeansprüchen (deutsche Subventionssystem). Die Datenbank dokumentiert medizinische Ausgaben, deren Erstattungen durch verschiedene Versicherungsträger und die Nachverfolgung von Zahlungen.

## Wichtigste Module

### 1. **Anträge & Rechnungen**
- `tbl_Antraege` - Beihilfeanträge mit Datumskennzeichnung
- `tbl_Rechnungen` - Detaillierte Rechnungen mit Erstattungsstatus
- `tbl_ReDetails` - Zeilenweise Details von Rechnungen (GOÄ-Leistungen)
- `tbl_Ratenzahlung` - Ratenzahlungsmanagement

**Zahlungsflüsse:**
- PKV (Private Krankenversicherung) - Eigenversicherung
- BH (Beihilfe) - Behördliche Subventionierung
- BET - Beihilfeanspruch von Ärzten
- Kostenerstattung in verschiedenen Stadien

### 2. **Medizinische Leistungen**
- `tbl_Arztbesuch` - Dokumentation von Arztterminen
- `tbl_Medikamente` - Verschriebene Medikationen mit PZN
- `tbl_Medikation` - Dauermedikation der Patienten (F/M/A/N = Wochentage)
- `tbl_ImpfBuch` - Impfpass-Dokumentation
- `tbl_Impfen` - Impfplanungen

### 3. **Fahrtkosten**
- `tbl_Fahrtkosten` - Einzelne Fahrten mit Kosten
- `tbl_Fahrtziele` - Zielkatalog für häufige Fahrtziele
- `tbl_Parken` - Parkgebühren
- **Verkehrsmittel:** Öffentliche Verkehrsmittel, PKW, Taxi

### 4. **Stationäre Leistungen**
- `tbl_KhKosten` - Krankenhauskosten mit Kategorien
- `tbl_Zusatz` - Zusatzversicherungsleistungen

### 5. **Verwaltung & Dokumentation**
- `tbl_DokMig`, `tbl_DokSql`, `tbl_DokSonstige` - Dokumentenverwaltung
- `tbl_Kontakte` - Ärzte, Krankenhäuser, Kliniken
- `tbl_Lexikon` - Begriffserklärungen
- `tbl_ToDoListe` - Aufgabenmanagement
- `tbl_Vorsorge` - Vorsorgeerinnerungen
- `tbl_ImpfBuch` - Impfpass

### 6. **Finanzielle Übersichten**
- `tbl_Monat_RepDaten` - Monatsberichte mit Gesamtübersichten
- `tbl_Beitraege` - Beitragszahlungen
- `tbl_BRE` - Beihilfeanspruchsrückerstattungen
- `tbl_PlusMinus` - Ausgleichszahlungen

### 7. **Konfiguration**
- `tbl_DLC` - Lookup-Codes (Kategorien)
- `tbl_PersAuswahl` - Personenauswahl (Familienmitglieder)
- `tbl_Sicht` - Ansichtseinstellungen
- `tbl_ToDoVorlagen` - Aufgabenvorlagen

## Datenbankstruktur

### Konventionen
- **IDs**: Alle Tabellen verwenden AutoIncrement-Primärschlüssel
- **Datum/Zeit**: DATETIME-Format für Zeitmessung
- **Geldbeträge**: MONEY-Datentyp für Finanzwerte
- **Suchmarke**: VARCHAR(1)-Feld für schnelle Filterung
- **Alt_Re_ID**: Alte Rechnungs-ID für historische Zuordnung
- **CheckOut**: BIT-Feld für Verarbeitungsstatus

### Wichtige Fremdschlüsselbeziehungen
- `Re_ID` verbindet fast alle Leistungstabellen mit `tbl_Rechnungen`
- `Fk_ID`, `Kh_ID`, `P_ID` sind Einzelleistungen einer Rechnung
- `Doc_Sql_ID` verknüpft Dokumente mit SQL-Dokumenten

## Key Tables

| Tabelle | Beschreibung | Priorität |
|---------|-------------|-----------|
| tbl_Rechnungen | Zentrales Rechnungsregister | ⭐⭐⭐ |
| tbl_Fahrtkosten | Fahrtkostenberechnung | ⭐⭐⭐ |
| tbl_KhKosten | Krankenhausleistungen | ⭐⭐⭐ |
| tbl_Medikamente | Medikationsverlauf | ⭐⭐⭐ |
| tbl_ReDetails | Leistungsdetails (GOÄ) | ⭐⭐⭐ |
| tbl_DokSql | Dokumentenverwaltung | ⭐⭐ |
| tbl_Monat_RepDaten | Finanzauswertungen | ⭐⭐ |

## Datenbankverwaltung

Struktur:
```
database/
├── schema/                 # Schemadefinitionen
│   ├── init.sql           # Initiales Schema
│   └── tables.sql         # Tabellenstruktur
├── migrations/            # Schema-Migrationen
│   ├── 001_initial.sql
│   └── ...
├── views/                 # Datenbank-Views
│   └── reporting.sql
├── docs/                  # Dokumentation
│   ├── SCHEMA.md         # Detaillierte Schema-Doku
│   └── ENTITY_RELATIONS.md
└── README.md             # Dieses Dokument
```

## Zukunftsoptimierungen
- [ ] Normalisierung einiger denormalisierter Tabellen
- [ ] Foreign-Key-Constraints hinzufügen
- [ ] Indices für Performance-Optimierung
- [ ] Archivierungsstrategie für alte Rechnungen
- [ ] API-Schnittstelle für Integration
