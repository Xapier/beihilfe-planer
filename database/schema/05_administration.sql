-- =============================================================================
-- MODUL: Verwaltung & Planung
-- =============================================================================

BEGIN TRANSACTION;

CREATE TABLE IF NOT EXISTS "tbl_Kontakte" (
	"K_ID"	INTEGER NOT NULL,
	"K_Arzt"	VARCHAR(100),
	"K_Tel"	VARCHAR(30),
	"K_Mobil"	VARCHAR(30),
	"K_Mail"	VARCHAR(80),
	"K_Bem"	VARCHAR(255),
	"SuchMarke"	VARCHAR(1),
	CONSTRAINT "K_ID" PRIMARY KEY("K_ID" AUTOINCREMENT)
);

CREATE TABLE IF NOT EXISTS "tbl_ToDoListe" (
	"TD_ID"	INTEGER NOT NULL,
	"Re_ID"	INTEGER DEFAULT 0,
	"TD_Datum"	DATETIME,
	"TD_Stelle"	VARCHAR(8),
	"TD_Aufgabe"	VARCHAR(15),
	"TD_Beschreibung"	VARCHAR(255),
	"TD_Status"	INTEGER DEFAULT 0,
	"TD_EndDatum"	DATETIME,
	"SuchMarke"	VARCHAR(1),
	CONSTRAINT "TD_ID" PRIMARY KEY("TD_ID" AUTOINCREMENT)
);

CREATE TABLE IF NOT EXISTS "tbl_ToDoListe2" (
	"TD_ID"	INTEGER,
	"DocS_ID"	INTEGER DEFAULT 0,
	"TD_Datum"	DATETIME,
	"TD_Stelle"	TEXT,
	"TD_Aufgabe"	TEXT,
	"TD_Beschreibung"	TEXT,
	"TD_Status"	INTEGER DEFAULT 0,
	"TD_EndDatum"	DATETIME,
	"SuchMarke"	TEXT,
	PRIMARY KEY("TD_ID" AUTOINCREMENT)
);

CREATE TABLE IF NOT EXISTS "tbl_ToDoVorlagen" (
	"TDV_ID"	INTEGER NOT NULL,
	"TDV_Beschreibung"	VARCHAR(255),
	"SuchMarke"	VARCHAR(1),
	CONSTRAINT "TDV_ID" PRIMARY KEY("TDV_ID" AUTOINCREMENT)
);

CREATE TABLE IF NOT EXISTS "tbl_Vorsorge" (
	"Vs_ID"	INTEGER NOT NULL,
	"Vs_Monat"	INTEGER DEFAULT 0,
	"Vs_Jahr"	INTEGER DEFAULT 0,
	"Vs_PlanDat"	VARCHAR(10),
	"Vs_Turnus"	VARCHAR(10),
	"Vs_Termin"	VARCHAR(25),
	"Vs_Patient"	VARCHAR(30),
	"Vs_Massnahme"	VARCHAR(150),
	"Vs_Bemerkung"	VARCHAR(150),
	"SuchMarke"	VARCHAR(1),
	CONSTRAINT "Vs_ID" PRIMARY KEY("Vs_ID" AUTOINCREMENT)
);

CREATE TABLE IF NOT EXISTS "tbl_Lexikon" (
	"Lexikon_ID"	INTEGER NOT NULL,
	"Stichwort"	VARCHAR(80),
	"Beschreibung"	TEXT,
	CONSTRAINT "Lexikon_ID" PRIMARY KEY("Lexikon_ID" AUTOINCREMENT)
);

COMMIT;
