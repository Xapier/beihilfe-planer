-- =============================================================================
-- MODUL: Fahrtkosten und Reiseleistungen
-- =============================================================================

BEGIN TRANSACTION;

CREATE TABLE IF NOT EXISTS "tbl_Fahrtkosten" (
	"Fk_ID"	INTEGER NOT NULL,
	"Re_ID"	INTEGER DEFAULT 0,
	"Fk_Hinfahrt"	DATETIME,
	"Fk_Rueckfahrt"	DATETIME,
	"Fk_Patient"	VARCHAR(30),
	"Fk_Fahrtziel"	VARCHAR(200),
	"Fk_Verkehrsmittel"	VARCHAR(15),
	"Fk_Anzahl"	INTEGER DEFAULT 0,
	"Fk_Entfernung"	INTEGER DEFAULT 0,
	"Fk_Kosten"	MONEY DEFAULT 0,
	"Fk_Pauschale"	MONEY DEFAULT 0,
	"Fk_oeVm"	BIT,
	"Alt_Re_ID"	INTEGER DEFAULT 0,
	"CheckOut"	BIT,
	"SuchMarke"	VARCHAR(1),
	CONSTRAINT "Fk_ID" PRIMARY KEY("Fk_ID" AUTOINCREMENT)
);

CREATE TABLE IF NOT EXISTS "tbl_Fahrtziele" (
	"Fz_ID"	INTEGER NOT NULL,
	"Fz_Fahrtziel"	VARCHAR(200),
	"Fz_Entfernung"	INTEGER DEFAULT 0,
	"SuchMarke"	VARCHAR(1),
	CONSTRAINT "Fz_ID" PRIMARY KEY("Fz_ID" AUTOINCREMENT)
);

CREATE TABLE IF NOT EXISTS "tbl_Parken" (
	"P_ID"	INTEGER NOT NULL,
	"Re_ID"	INTEGER DEFAULT 0,
	"P_Tag"	DATETIME,
	"P_Patient"	VARCHAR(30),
	"P_Kategorie"	VARCHAR(30),
	"P_Fahrtziel"	VARCHAR(200),
	"P_Parkplatz"	VARCHAR(200),
	"P_Kosten"	MONEY DEFAULT 0,
	"Alt_Re_ID"	INTEGER DEFAULT 0,
	"SuchMarke"	VARCHAR(1),
	CONSTRAINT "P_ID" PRIMARY KEY("P_ID" AUTOINCREMENT)
);

COMMIT;
