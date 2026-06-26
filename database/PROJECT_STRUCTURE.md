# Beihilfe-Planer Datenbankprojekt Struktur

## 📁 Verzeichnisstruktur

```
Beihilfe-Planer/
└── database/
    ├── README.md                          # Überblick & Projektinformation
    │
    ├── schema/                            # SQL Schema-Definitionen
    │   ├── 01_core_tables.sql            # Anträge & Rechnungen (Kerntabellen)
    │   ├── 02_travel_costs.sql           # Fahrtkosten
    │   ├── 03_medical_services.sql       # Medizinische Leistungen
    │   ├── 04_documents.sql              # Dokumentenverwaltung
    │   ├── 05_administration.sql         # Verwaltung & Planung
    │   ├── 06_financial_reporting.sql    # Finanzberichte & Auswertungen
    │   └── 07_configuration.sql          # Konfiguration & Lookup-Codes
    │
    ├── migrations/                        # Schema-Migrationen
    │   ├── 000_TEMPLATE.sql              # Migrations-Vorlage
    │   ├── 001_add_performance_indexes.sql # Performance-Indizes
    │   └── [weitere Migrationen...]
    │
    ├── views/                             # SQL Views für Reporting
    │   └── reporting.sql                 # Vordefinierte Auswertungs-Views
    │
    └── docs/                              # Projektdokumentation
        ├── SCHEMA.md                      # Detaillierte Schema-Dokumentation
        ├── ENTITY_RELATIONS.md            # Entity-Relationship-Diagram
        ├── DATA_DICTIONARY.md             # Datenwörterbuch (alle Spalten)
        ├── NORMALIZATION.md               # Normalisierungsempfehlungen
        └── QUERIES.md                     # Häufig verwendete Abfragen
```

---

## 🗂️ Datei-Übersicht

### Schema-Dateien (schema/)

| Datei | Tabellen | Zweck |
|-------|----------|-------|
| `01_core_tables.sql` | tbl_Antraege, tbl_Rechnungen, tbl_ReDetails | Zentrale Rechnungsverwaltung |
| `02_travel_costs.sql` | tbl_Fahrtkosten, tbl_Fahrtziele, tbl_Parken | Mobilität & Fahrtkosten |
| `03_medical_services.sql` | tbl_Arztbesuch, tbl_Medikamente, tbl_KhKosten, tbl_ImpfBuch | Medizinische Leistungen |
| `04_documents.sql` | tbl_DokSql, tbl_DokMig, tbl_DokSonstige, tbl_DokSuche | Dokumentenspeicherung |
| `05_administration.sql` | tbl_Kontakte, tbl_ToDoListe, tbl_Vorsorge, tbl_Lexikon | Verwaltung |
| `06_financial_reporting.sql` | tbl_Beitraege, tbl_BRE, tbl_Ratenzahlung, tbl_Monat_RepDaten | Finanzauswertungen |
| `07_configuration.sql` | tbl_DLC, tbl_PersAuswahl, tbl_Sicht | Systemkonfiguration |

### Migrations-Dateien (migrations/)

| Datei | Beschreibung |
|-------|------------|
| `000_TEMPLATE.sql` | Vorlage für neue Migrationen |
| `001_add_performance_indexes.sql` | Indizes für Query-Performance |

### Dokumentation (docs/)

| Datei | Inhalt |
|-------|--------|
| `SCHEMA.md` | Vollständige Schema-Dokumentation mit Felderbeschreibungen |
| `ENTITY_RELATIONS.md` | ER-Diagramme & Fremdschlüssel-Beziehungen |
| `DATA_DICTIONARY.md` | Datenwörterbuch - alle Spalten & deren Datentypen |
| `NORMALIZATION.md` | Normalisierungsmöglichkeiten (kommend) |
| `QUERIES.md` | Häufig verwendete SQL-Abfragen (kommend) |

### Views (views/)

| Datei | Views | Zweck |
|-------|-------|-------|
| `reporting.sql` | vw_rechnung_zahlungsstand, vw_monatliche_kosten, vw_fahrtkosten_zusammenfassung, etc. | Reporting & Analyse |

---

## 🚀 Verwendung

### 1. Komplettes Schema erstellen
```bash
# Alle SQL-Dateien in der richtigen Reihenfolge ausführen:
sqlite3 beihilfe.db < database/schema/01_core_tables.sql
sqlite3 beihilfe.db < database/schema/02_travel_costs.sql
sqlite3 beihilfe.db < database/schema/03_medical_services.sql
sqlite3 beihilfe.db < database/schema/04_documents.sql
sqlite3 beihilfe.db < database/schema/05_administration.sql
sqlite3 beihilfe.db < database/schema/06_financial_reporting.sql
sqlite3 beihilfe.db < database/schema/07_configuration.sql
```

### 2. Views hinzufügen (nach Schema-Erstellung)
```bash
sqlite3 beihilfe.db < database/views/reporting.sql
```

### 3. Neue Migration durchführen
```bash
sqlite3 beihilfe.db < database/migrations/001_add_performance_indexes.sql
```

---

## 📊 Kernel-Tabellen

### Abhängigkeitsgraph

```
tbl_Antraege
    ↓
tbl_Rechnungen (zentral)
    ├→ tbl_ReDetails (Details)
    ├→ tbl_Fahrtkosten (Fahrten)
    │   └→ tbl_Fahrtziele
    ├→ tbl_KhKosten (Krankenhaus)
    ├→ tbl_Medikamente (Arzneien)
    ├→ tbl_Parken (Parkgebühren)
    ├→ tbl_ToDoListe (Aufgaben)
    ├→ tbl_DokSql (Dokumente)
    ├→ tbl_Ratenzahlung (Raten)
    └→ tbl_BRE (Erstattung)

Unabhängig:
├→ tbl_Medikation (Dauermedikation)
├→ tbl_ImpfBuch (Impfpass)
├→ tbl_Arztbesuch (Konsultationen)
├→ tbl_Kontakte (Adressbuch)
├→ tbl_PersAuswahl (Personen)
└→ tbl_Monat_RepDaten (Berichte)
```

---

## 🔍 Häufig genutzte Queries

### Gesamtumsatz im Monat
```sql
SELECT SUM(Re_Betrag) 
FROM tbl_Rechnungen
WHERE strftime('%Y-%m', Re_Datum) = '2024-06';
```

### Ausstehende Fahrtkosten
```sql
SELECT * FROM tbl_Fahrtkosten 
WHERE CheckOut IS NULL OR CheckOut = 0
ORDER BY Fk_Hinfahrt DESC;
```

### Zahlungsstatus pro Kostenträger
```sql
SELECT 
    COUNT(*) as anzahl,
    SUM(Re_Betrag) as gesamt,
    SUM(PKV_Erstattung) as pkv,
    SUM(BH_Erstattung) as beihilfe
FROM tbl_Rechnungen
WHERE Re_Abschluss != 'bezahlt';
```

Weitere Queries: siehe [QUERIES.md](./docs/QUERIES.md)

---

## ⚙️ Best Practices

### Datensicherung
- [ ] Vor jeder Migration Backup erstellen
- [ ] Monatliche vollständige Backups
- [ ] Transaktionen für kritische Operationen

### Datenpflege
- [ ] SuchMarke Feld konsistent nutzen (Archivierung)
- [ ] Loesch_marker statt echtes Löschen
- [ ] Audit-Trail für Änderungen führen

### Performance
- [ ] Regelmäßige Index-Analysen
- [ ] Views statt komplexe Ad-hoc-Queries
- [ ] Monatliche Datenbankoptimierung: `VACUUM;`

---

## 📝 Nächste Schritte

- [ ] NORMALIZATION.md: Normalisierungsempfehlungen
- [ ] QUERIES.md: Beispiel-Abfragen für häufige Geschäftsfälle
- [ ] Python/Node.js API für Datenbankzugriff
- [ ] Automatische Berichte (Monatliche Erstattungsstatistiken)
- [ ] Data-Export zu Excel/CSV
- [ ] Datenmigration von alten Versionen

