-- =============================================================================
-- BEIHILFE-PLANER: Testdaten
-- =============================================================================

BEGIN TRANSACTION;

-- Testdaten für Patienten
INSERT INTO tbl_Patienten (Patient_Name, Patient_Vorname, Patient_GebDatum, Patient_Geschlecht, Versicherungs_Typ, Status, Notizen) VALUES
('Mustermann', 'Max', '1965-03-15', 'M', 'PKV', 1, 'Beamter mit PKV'),
('Musterfrau', 'Erika', '1968-07-22', 'W', 'Beihilfe', 1, 'Beamtin nur Beihilfe'),
('Musterkind', 'Tim', '2015-11-10', 'M', 'Beihilfe', 1, 'Schüler mit Beihilfe');

-- Testdaten für Kontakte
INSERT INTO tbl_Kontakte (Kontakt_Name, Kontakt_Typ, Fachrichtung, Strasse, PLZ, Stadt, Telefon, Mobil, Email, IK_Nummer, Status) VALUES
('Dr. Schmidt', 'Zahnarzt', 'Zahnmedizin', 'Hauptstr. 10', '10115', 'Berlin', '030-12345678', '0160-1234567', 'contact@dent.de', '123456789', 1),
('Dr. Meyer', 'Arzt', 'Internist', 'Bahnhofstr. 5', '10115', 'Berlin', '030-87654321', '0170-9876543', 'dr@meyer.de', '987654321', 1),
('Charité Krankenhaus', 'Klinik', 'Allgemein', 'Charitéplatz 1', '10117', 'Berlin', '030-450', NULL, 'info@charite.de', '111111111', 1),
('Apotheke am Markt', 'Apotheke', 'Apotheken', 'Marktstr. 15', '10115', 'Berlin', '030-555555', NULL, NULL, NULL, 1);

-- Testdaten für Beihilfe-Sätze
INSERT INTO tbl_Beihilfe_Saetze (Patient_ID, PKV_Quote, Beihilfe_Quote, BET_Quote, Eigenanteil_Min, Eigenanteil_Max, Pflegezusatz, Gueltigkeit_Von, Gueltigkeit_Bis, Bemerkung) VALUES
(1, 50.0, 80.0, 20.0, 10.0, 1000.0, 0.0, '2026-01-01', '2026-12-31', 'Beamter Standard'),
(2, 0.0, 100.0, 0.0, 0.0, 500.0, 0.0, '2026-01-01', '2026-12-31', 'Beamtin Beihilfe'),
(3, 0.0, 100.0, 0.0, 0.0, 0.0, 0.0, '2026-01-01', '2026-12-31', 'Kind Beihilfe 100%');

-- Testdaten für Anträge
INSERT INTO tbl_Antraege (Patient_ID, Antrag_Nr, Antrag_Datum, Antrag_Periode, Status, Behoerde, Notizen) VALUES
(1, '2026-06-001', '2026-06-01', '2026-06', 'eingereicht', 'Beihilfestelle Berlin', 'Juni-Antrag eingereicht'),
(2, '2026-06-002', '2026-06-02', '2026-06', 'offen', 'Beihilfestelle Berlin', 'Juni-Antrag in Vorbereitung'),
(3, '2026-05-001', '2026-05-15', '2026-05', 'genehmigt', 'Beihilfestelle Berlin', 'Mai-Antrag genehmigt');

COMMIT;
