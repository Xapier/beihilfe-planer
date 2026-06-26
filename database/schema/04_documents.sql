-- =============================================================================
-- MODUL: Dokumentenverwaltung
-- =============================================================================

BEGIN TRANSACTION;

CREATE TABLE IF NOT EXISTS "tbl_DokMig" (
	"Doc_ID"	INTEGER NOT NULL,
	"Re_ID"	INTEGER DEFAULT 0,
	"Doc_Bez"	VARCHAR(150),
	"Doc_Datei"	VARCHAR(50),
	"Doc_Exist"	INTEGER DEFAULT 0,
	"SuchMarke"	VARCHAR(1),
	"Doc_Typ"	TEXT,
	"Doc_Sql_ID"	INTEGER DEFAULT 0,
	"Doc_Datum"	DATETIME,
	"Doc_Person"	TEXT,
	CONSTRAINT "Doc_ID" PRIMARY KEY("Doc_ID" AUTOINCREMENT)
);

CREATE TABLE IF NOT EXISTS "tbl_DokSql" (
	"Doc_ID"	INTEGER NOT NULL,
	"Re_ID"	INTEGER DEFAULT 0,
	"Doc_Bez"	VARCHAR(150),
	"Doc_Datei"	VARCHAR(50),
	"Doc_Exist"	INTEGER DEFAULT 0,
	"SuchMarke"	VARCHAR(1),
	"Doc_Typ"	TEXT,
	"Doc_Datum"	DATETIME,
	"Doc_Person"	TEXT,
	CONSTRAINT "Doc_ID" PRIMARY KEY("Doc_ID" AUTOINCREMENT)
);

CREATE TABLE IF NOT EXISTS "tbl_DokSonstige" (
	"DocS_ID"	INTEGER NOT NULL,
	"DocS_Datum"	DATETIME,
	"DocS_Bez"	VARCHAR(150),
	"DocS_Datei"	VARCHAR(50),
	"DocS_Exist"	INTEGER DEFAULT 0,
	"SuchMarke"	VARCHAR(1),
	"DocS_Typ"	TEXT,
	"DocS_Person"	TEXT,
	"TD_Anzahl"	INTEGER DEFAULT 0,
	CONSTRAINT "DocS_ID" PRIMARY KEY("DocS_ID" AUTOINCREMENT)
);

CREATE TABLE IF NOT EXISTS "tbl_DokSonstigeLink" (
	"DocL_ID"	INTEGER,
	"Re_ID"	INTEGER DEFAULT 0,
	"DocS_ID"	INTEGER DEFAULT 0,
	"DocL_Datum"	DATETIME,
	"DocL_Bez"	TEXT,
	"DocL_Datei"	TEXT,
	"DocL_Typ"	TEXT,
	"SuchMarke"	TEXT,
	PRIMARY KEY("DocL_ID" AUTOINCREMENT)
);

CREATE TABLE IF NOT EXISTS "tbl_DokSuche" (
	"Re_ID"	INTEGER DEFAULT 0,
	"Doc_Bez"	TEXT,
	"Doc_Datei"	TEXT,
	"Doc_Exist"	INTEGER DEFAULT 0,
	"Doc_Datum"	DATETIME,
	"Doc_Typ"	TEXT,
	"Doc_Person"	TEXT,
	"Doc_Sql_ID"	INTEGER DEFAULT 0,
	"Doc_Archiv"	TEXT,
	"SuchMarke"	TEXT,
	"DsNr"	INTEGER DEFAULT 0,
	"DsID"	TEXT
);

COMMIT;
