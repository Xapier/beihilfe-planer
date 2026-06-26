-- =============================================================================
-- MODUL: Medizinische Leistungen
-- =============================================================================

BEGIN TRANSACTION;

CREATE TABLE IF NOT EXISTS "tbl_Arztbesuch" (
	"AB_ID"	INTEGER NOT NULL,
	"AB_Datum"	DATETIME,
	"AB_Patient"	VARCHAR(30),
	"AB_Arzt"	VARCHAR(100),
	"AB_Grund"	VARCHAR(255),
	"SuchMarke"	VARCHAR(1),
	"Druck_aktiv"	bit DEFAULT FALSE,
	CONSTRAINT "AB_ID" PRIMARY KEY("AB_ID" AUTOINCREMENT)
);

CREATE TABLE IF NOT EXISTS "tbl_Medikamente" (
	"M_ID"	INTEGER NOT NULL,
	"Re_ID"	INTEGER DEFAULT 0,
	"M_Datum"	DATETIME,
	"M_Patient"	VARCHAR(30),
	"M_Name"	VARCHAR(200),
	"M_PZN"	VARCHAR(20),
	"M_Wirkstoff"	VARCHAR(200),
	"M_Rzpfl"	BIT,
	"Alt_Re_ID"	INTEGER DEFAULT 0,
	"SuchMarke"	VARCHAR(1),
	CONSTRAINT "M_ID" PRIMARY KEY("M_ID" AUTOINCREMENT)
);

CREATE TABLE IF NOT EXISTS "tbl_Medikation" (
	"Mk_ID"	INTEGER NOT NULL,
	"Mk_Patient"	VARCHAR(30),
	"Mk_Name"	VARCHAR(200),
	"Mk_PZN"	VARCHAR(20),
	"Mk_F"	INTEGER DEFAULT 0,
	"Mk_M"	INTEGER DEFAULT 0,
	"Mk_A"	INTEGER DEFAULT 0,
	"Mk_N"	INTEGER DEFAULT 0,
	"Mk_Bem"	VARCHAR(100),
	"SuchMarke"	VARCHAR(1),
	CONSTRAINT "Mk_ID" PRIMARY KEY("Mk_ID" AUTOINCREMENT)
);

CREATE TABLE IF NOT EXISTS "tbl_Medikation_neu" (
	"Mk_ID"	INTEGER NOT NULL,
	"Mk_Patient"	VARCHAR(30),
	"Mk_Name"	VARCHAR(200),
	"Mk_PZN"	VARCHAR(20),
	"Mk_F"	DOUBLE DEFAULT 0,
	"Mk_M"	DOUBLE DEFAULT 0,
	"Mk_A"	DOUBLE DEFAULT 0,
	"Mk_N"	DOUBLE DEFAULT 0,
	"Mk_Bem"	VARCHAR(100),
	"SuchMarke"	VARCHAR(1),
	CONSTRAINT "Mk_ID" PRIMARY KEY("Mk_ID" AUTOINCREMENT)
);

CREATE TABLE IF NOT EXISTS "tbl_KhKosten" (
	"Kh_ID"	INTEGER NOT NULL,
	"Re_ID"	INTEGER DEFAULT 0,
	"Kh_Hinfahrt"	DATETIME,
	"Kh_Rueckfahrt"	DATETIME,
	"Kh_Patient"	VARCHAR(30),
	"Kh_Kategorie"	VARCHAR(50),
	"Kh_Massnahme"	VARCHAR(200),
	"Kh_Kosten"	MONEY DEFAULT 0,
	"Kh_E_Kosten"	MONEY DEFAULT 0,
	"Kh_Sb_Kosten"	MONEY DEFAULT 0,
	"Alt_Re_ID"	INTEGER DEFAULT 0,
	"CheckOut"	BIT,
	"SuchMarke"	VARCHAR(1),
	"Kh_Zuordnung"	VARCHAR(25),
	CONSTRAINT "Kh_ID" PRIMARY KEY("Kh_ID" AUTOINCREMENT)
);

CREATE TABLE IF NOT EXISTS "tbl_ImpfBuch" (
	"Imp_ID"	INTEGER NOT NULL,
	"Imp_Datum"	DATETIME,
	"Imp_Patient"	VARCHAR(30),
	"Imp_Massnahme"	VARCHAR(80),
	"Imp_Bemerkung"	VARCHAR(150),
	"SuchMarke"	VARCHAR(1),
	CONSTRAINT "Imp_ID" PRIMARY KEY("Imp_ID" AUTOINCREMENT)
);

CREATE TABLE IF NOT EXISTS "tbl_Impfen" (
	"Imp_ID"	INTEGER NOT NULL,
	"Imp_Monat"	INTEGER DEFAULT 0,
	"Imp_Jahr"	INTEGER DEFAULT 0,
	"Imp_PlanDat"	VARCHAR(10),
	"Imp_Patient"	VARCHAR(30),
	"Imp_Massnahme"	VARCHAR(80),
	"Imp_Bemerkung"	VARCHAR(150),
	"SuchMarke"	VARCHAR(1),
	CONSTRAINT "Imp_ID" PRIMARY KEY("Imp_ID" AUTOINCREMENT)
);

CREATE TABLE IF NOT EXISTS "tbl_Zusatz" (
	"Z_ID"	INTEGER NOT NULL,
	"Z_Re_ID"	INTEGER DEFAULT 0,
	"Z_BhPkv"	INTEGER DEFAULT 0,
	"Z_Bez"	VARCHAR(50),
	"Z_Betrag"	MONEY DEFAULT 0,
	"SuchMarke"	VARCHAR(1),
	CONSTRAINT "Z_ID" PRIMARY KEY("Z_ID" AUTOINCREMENT)
);

COMMIT;
