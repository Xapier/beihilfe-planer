-- =============================================================================
-- BEIHILFE-PLANER: Vereinfachtes Schema (Essentials)
-- =============================================================================
-- Zweck: Fokussierte Kern-Funktionalität
-- Erstellt: 2024 | Optimiert: 2026-06-25
-- Zielserver: SQLite
-- Module: Patienten, Kontakte, Beihilfe, Aufwendungen
-- =============================================================================

BEGIN TRANSACTION;

-- ============================================================================
-- 1. PATIENTEN (Familie/Versicherte)
-- ============================================================================

CREATE TABLE IF NOT EXISTS "tbl_Patienten" (
	"Patient_ID"	INTEGER NOT NULL,
	"Patient_Name"	VARCHAR(100) NOT NULL,
	"Patient_Vorname"	VARCHAR(100),
	"Patient_GebDatum"	DATE,
	"Patient_Geschlecht"	VARCHAR(1),  -- M/W/D
	"Versicherungs_Typ"	VARCHAR(20),  -- PKV, GKV, Beihilfe
	"Status"	BIT DEFAULT 1,  -- 1=aktiv, 0=inaktiv
	"Erstellungsdatum"	DATETIME DEFAULT CURRENT_TIMESTAMP,
	"Notizen"	TEXT,
	CONSTRAINT "Patient_ID" PRIMARY KEY("Patient_ID" AUTOINCREMENT)
);

-- ============================================================================
-- 2. KONTAKTE (Ärzte, Kliniken, Apotheken)
-- ============================================================================

CREATE TABLE IF NOT EXISTS "tbl_Kontakte" (
	"Kontakt_ID"	INTEGER NOT NULL,
	"Kontakt_Name"	VARCHAR(150) NOT NULL,
	"Kontakt_Typ"	VARCHAR(30),  -- Arzt, Zahnarzt, Klinik, Apotheke, Therapeut
	"Fachrichtung"	VARCHAR(100),
	"Strasse"	VARCHAR(100),
	"PLZ"	VARCHAR(5),
	"Stadt"	VARCHAR(50),
	"Telefon"	VARCHAR(20),
	"Mobil"	VARCHAR(20),
	"Email"	VARCHAR(100),
	"IK_Nummer"	VARCHAR(10),  -- Institutskennzeichen
	"Status"	BIT DEFAULT 1,
	"Notizen"	TEXT,
	"Erstellungsdatum"	DATETIME DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT "Kontakt_ID" PRIMARY KEY("Kontakt_ID" AUTOINCREMENT)
);

-- ============================================================================
-- 3. BEIHILFE-SÄTZE PRO PATIENT (unterschiedliche Quote pro Person)
-- ============================================================================

CREATE TABLE IF NOT EXISTS "tbl_Beihilfe_Saetze" (
	"BS_ID"	INTEGER NOT NULL,
	"Patient_ID"	INTEGER NOT NULL,
	"PKV_Quote"	DECIMAL(3,1) DEFAULT 0.0,  -- z.B. 50.0 für 50%
	"Beihilfe_Quote"	DECIMAL(3,1) DEFAULT 0.0,  -- z.B. 80.0 für 80%
	"BET_Quote"	DECIMAL(3,1) DEFAULT 0.0,  -- BET-Ergänzung %
	"Eigenanteil_Min"	MONEY DEFAULT 0,  -- Selbstbeteiligung
	"Eigenanteil_Max"	MONEY DEFAULT 0,  -- Höchstbeteiligung
	"Pflegezusatz"	MONEY DEFAULT 0,  -- Pflegegeld/Zuschuss
	"Gueltigkeit_Von"	DATE,
	"Gueltigkeit_Bis"	DATE,
	"Bemerkung"	TEXT,
	CONSTRAINT "BS_ID" PRIMARY KEY("BS_ID" AUTOINCREMENT),
	CONSTRAINT "FK_Patient" FOREIGN KEY("Patient_ID") REFERENCES "tbl_Patienten"("Patient_ID")
);

-- ============================================================================
-- 4. BEIHILFE-ANTRÄGE (Eingereichte Anträge mit Status)
-- ============================================================================

CREATE TABLE IF NOT EXISTS "tbl_Antraege" (
	"Antrag_ID"	INTEGER NOT NULL,
	"Patient_ID"	INTEGER NOT NULL,
	"Antrag_Nr"	VARCHAR(20) UNIQUE,  -- z.B. "2024-01-001"
	"Antrag_Datum"	DATE NOT NULL,
	"Antrag_Periode"	VARCHAR(7),  -- Format: YYYY-MM
	"Status"	VARCHAR(20) DEFAULT 'offen',  -- offen, eingereicht, genehmigt, ausgezahlt, abgelehnt
	"Status_Aenderung"	DATETIME,
	"Behoerde"	VARCHAR(100),  -- Beihilfestelle
	"Eingereicht_Am"	DATE,
	"Genehmigt_Am"	DATE,
	"Ausgezahlt_Am"	DATE,
	"Erstattungsbetrag"	MONEY DEFAULT 0,
	"Notizen"	TEXT,
	"Erstellungsdatum"	DATETIME DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT "Antrag_ID" PRIMARY KEY("Antrag_ID" AUTOINCREMENT),
	CONSTRAINT "FK_Patient_Antrag" FOREIGN KEY("Patient_ID") REFERENCES "tbl_Patienten"("Patient_ID")
);

-- ============================================================================
-- 5. AUFWENDUNGEN (5-Säulen: Rechnung, Pflege, PKV, BET, Beihilfe)
-- ============================================================================

CREATE TABLE IF NOT EXISTS "tbl_Aufwendungen" (
	"Auf_ID"	INTEGER NOT NULL,
	"Patient_ID"	INTEGER NOT NULL,
	"Kontakt_ID"	INTEGER,
	"Antrag_ID"	INTEGER,
	"Auf_Datum"	DATE NOT NULL,
	"Auf_Typ"	VARCHAR(30),  -- Arzt, Zahnarzt, Apotheke, KH, Therapie, Fahrtkosten, Parkgebühr
	"Auf_Beschreibung"	VARCHAR(255),
	"Rechnungs_Nr"	VARCHAR(50),
	"Rechnungsbetrag"	MONEY DEFAULT 0,
	-- 5-SÄULEN STATUS (mit Farbe): Rot=offen, Gelb=Bearbeitung, Grün=Erledigt, Grau=N/A
	"Rechnung_Status"	VARCHAR(20) DEFAULT 'offen',  -- offen, eingegangen, bearbeitet, bezahlt
	"Rechnung_Eingang_Datum"	DATE,
	"PKV_Status"	VARCHAR(20) DEFAULT 'grau',  -- offen, eingereicht, erstattet, abgelehnt
	"PKV_Einreichung_Datum"	DATE,
	"PKV_Erstattung"	MONEY DEFAULT 0,
	"PKV_Erstattung_Datum"	DATE,
	"BET_Status"	VARCHAR(20) DEFAULT 'grau',  -- geplant, gebuendelt, erledigt
	"BET_Datum"	DATE,
	"BET_Betrag"	MONEY DEFAULT 0,
	"Beihilfe_Status"	VARCHAR(20) DEFAULT 'offen',  -- offen, eingereicht, erstattet, abgelehnt
	"Beihilfe_Einreichung_Datum"	DATE,
	"Beihilfe_Antrag_Nr"	VARCHAR(20),
	"Beihilfe_Erstattung"	MONEY DEFAULT 0,
	"Beihilfe_Erstattung_Datum"	DATE,
	"Pflege_Status"	VARCHAR(20) DEFAULT 'grau',  -- N/A, geplant, erledigt
	"Pflege_Zuschuss"	MONEY DEFAULT 0,
	-- Ratenzahlung
	"Ratenzahlung_Aktiv"	BIT DEFAULT 0,
	"Ratenzahlung_Betrag"	MONEY DEFAULT 0,
	"Ratenzahlung_Anz"	INTEGER DEFAULT 0,
	-- Verarbeitung
	"Erstellungsdatum"	DATETIME DEFAULT CURRENT_TIMESTAMP,
	"Notizen"	TEXT,
	CONSTRAINT "Auf_ID" PRIMARY KEY("Auf_ID" AUTOINCREMENT),
	CONSTRAINT "FK_Patient_Auf" FOREIGN KEY("Patient_ID") REFERENCES "tbl_Patienten"("Patient_ID"),
	CONSTRAINT "FK_Kontakt_Auf" FOREIGN KEY("Kontakt_ID") REFERENCES "tbl_Kontakte"("Kontakt_ID"),
	CONSTRAINT "FK_Antrag_Auf" FOREIGN KEY("Antrag_ID") REFERENCES "tbl_Antraege"("Antrag_ID")
);

COMMIT;
