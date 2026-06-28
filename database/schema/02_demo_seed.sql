-- =============================================================================
-- BEIHILFE-PLANER: Demo-Datenbank mit Beispieldaten
-- =============================================================================
-- Zweck: Beispieldaten für Dokumentation und Demos
-- Alle Daten sind fiktiv. Keine echten Personen oder Ärzte.
-- =============================================================================

BEGIN TRANSACTION;

-- =============================================================================
-- PATIENTEN (fiktive Personen)
-- =============================================================================
INSERT INTO patients (id, firstName, lastName, geburtsDatum, pkvQuote, beihilfeQuote)
VALUES
  ('pat-001', 'Max',    'Mustermann', '1975-04-12', 50, 50),
  ('pat-002', 'Erika',  'Mustermann', '1978-09-03', 30, 70),
  ('pat-003', 'Lukas',  'Mustermann', '2005-02-21', 20, 80);

-- =============================================================================
-- KONTAKTE (fiktive Ärzte / Einrichtungen)
-- =============================================================================
INSERT INTO contacts (id, name, specialty, address, phone, email)
VALUES
  ('con-001', 'Dr. med. Anna Bergmann',     'Allgemeinmedizin',       'Hauptstraße 12, 10115 Berlin',        '030 123456',   NULL),
  ('con-002', 'Dr. med. Stefan Hoffmann',   'Innere Medizin',         'Parkweg 5, 10117 Berlin',             '030 654321',   NULL),
  ('con-003', 'Dr. med. Julia Schneider',   'Zahnarzt',               'Schloßallee 3, 10178 Berlin',         '030 111222',   NULL),
  ('con-004', 'Krankenhaus Mitte GmbH',     'Krankenhaus',            'Berliner Allee 100, 10115 Berlin',    '030 9876543',  'info@kh-mitte.example'),
  ('con-005', 'Stadt-Apotheke am Markt',    'Apotheke',               'Marktplatz 1, 10115 Berlin',          '030 333444',   NULL),
  ('con-006', 'Dr. med. Klaus Fischer',     'Orthopädie',             'Friedrichstraße 88, 10117 Berlin',    '030 555666',   NULL),
  ('con-007', 'Physiotherapie Sonnenhof',   'Physiotherapie',         'Sonnenweg 7, 10179 Berlin',           '030 777888',   NULL),
  ('con-008', 'Dr. med. dent. Maria Wolff', 'Kieferorthopädie',       'Kastanienallee 22, 10435 Berlin',     '030 999000',   NULL);

-- =============================================================================
-- AUFWENDUNGEN (verschiedene Status-Kombinationen)
-- =============================================================================

-- Aufwendung 1: Vollständig abgeschlossen (alle erstattet)
INSERT INTO aufwendungen (patientId, datum, faelligkeitsDatum, kontaktId, aufTyp, beschreibung, rechnungsNr, betrag,
  rechnungStatus, pkvStatus, betStatus, beihilfeStatus, pkvBetrag, betBetrag, beihilfeBetrag, statusDaten)
VALUES
  ('pat-001', '2026-01-15', '2026-02-15', 'con-001', 'Arzt', 'Quartalsuntersuchung / Blutbild', 'RE-2026-0042', 185.00,
   'bezahlt', 'erstattet', 'entfällt', 'erstattet', 92.50, 0, 92.50,
   '{"rechnungDatum":"2026-01-20","pkvDatum":"2026-02-01","beihilfeDatum":"2026-02-10"}');

-- Aufwendung 2: PKV erstattet, Beihilfe noch eingereicht
INSERT INTO aufwendungen (patientId, datum, faelligkeitsDatum, kontaktId, aufTyp, beschreibung, rechnungsNr, betrag,
  rechnungStatus, pkvStatus, betStatus, beihilfeStatus, pkvBetrag, betBetrag, beihilfeBetrag, statusDaten)
VALUES
  ('pat-001', '2026-02-03', '2026-03-03', 'con-002', 'Arzt', 'Gastroskopie', 'RE-2026-0115', 320.00,
   'bezahlt', 'erstattet', 'entfällt', 'eingereicht', 160.00, 0, 0,
   '{"rechnungDatum":"2026-02-10","pkvDatum":"2026-02-28"}');

-- Aufwendung 3: Noch offen – frisch eingegangen
INSERT INTO aufwendungen (patientId, datum, faelligkeitsDatum, kontaktId, aufTyp, beschreibung, rechnungsNr, betrag,
  rechnungStatus, pkvStatus, betStatus, beihilfeStatus, pkvBetrag, betBetrag, beihilfeBetrag, statusDaten)
VALUES
  ('pat-001', '2026-03-12', '2026-04-12', 'con-006', 'Arzt', 'Knieuntersuchung + MRT-Befund', 'RE-2026-0287', 540.00,
   'eingegangen', 'offen', 'entfällt', 'offen', 0, 0, 0,
   '{"rechnungDatum":"2026-03-14"}');

-- Aufwendung 4: Zahnarzt – vollständig erstattet
INSERT INTO aufwendungen (patientId, datum, faelligkeitsDatum, kontaktId, aufTyp, beschreibung, rechnungsNr, betrag,
  rechnungStatus, pkvStatus, betStatus, beihilfeStatus, pkvBetrag, betBetrag, beihilfeBetrag, statusDaten)
VALUES
  ('pat-001', '2026-01-28', '2026-02-28', 'con-003', 'Zahnarzt', 'Füllung Zahn 36 + Profyreinigung', 'ZA-2026-0091', 210.00,
   'bezahlt', 'erstattet', 'entfällt', 'erstattet', 105.00, 0, 105.00,
   '{"rechnungDatum":"2026-02-02","pkvDatum":"2026-02-15","beihilfeDatum":"2026-02-20"}');

-- Aufwendung 5: Krankenhaus-Aufenthalt – groß, teilweise erstattet
INSERT INTO aufwendungen (patientId, datum, faelligkeitsDatum, kontaktId, aufTyp, beschreibung, rechnungsNr, betrag,
  rechnungStatus, pkvStatus, betStatus, beihilfeStatus, pkvBetrag, betBetrag, beihilfeBetrag, statusDaten)
VALUES
  ('pat-001', '2026-02-10', '2026-03-10', 'con-004', 'Rechnung', 'Stationärer Aufenthalt 3 Tage', 'KH-2026-00334', 1850.00,
   'bezahlt', 'erstattet', 'eingereicht', 'eingereicht', 925.00, 0, 0,
   '{"rechnungDatum":"2026-02-18","pkvDatum":"2026-03-01"}');

-- Aufwendung 6: Apotheke – günstig, abgeschlossen
INSERT INTO aufwendungen (patientId, datum, faelligkeitsDatum, kontaktId, aufTyp, beschreibung, rechnungsNr, betrag,
  rechnungStatus, pkvStatus, betStatus, beihilfeStatus, pkvBetrag, betBetrag, beihilfeBetrag, statusDaten)
VALUES
  ('pat-001', '2026-03-05', '2026-04-05', 'con-005', 'Apotheke', 'Rezeptpflichtige Medikamente', 'APO-2026-1122', 47.80,
   'bezahlt', 'erstattet', 'entfällt', 'erstattet', 23.90, 0, 23.90,
   '{"rechnungDatum":"2026-03-05","pkvDatum":"2026-03-20","beihilfeDatum":"2026-03-25"}');

-- Aufwendung 7: Erika – Zahnarzt Kieferorthopädie, BET aktiv
INSERT INTO aufwendungen (patientId, datum, faelligkeitsDatum, kontaktId, aufTyp, beschreibung, rechnungsNr, betrag,
  rechnungStatus, pkvStatus, betStatus, beihilfeStatus, pkvBetrag, betBetrag, beihilfeBetrag, statusDaten)
VALUES
  ('pat-002', '2026-01-10', '2026-02-10', 'con-008', 'Zahnarzt', 'Kieferorthopädische Behandlung Q1', 'KFO-2026-0011', 680.00,
   'bezahlt', 'erstattet', 'erstattet', 'erstattet', 204.00, 136.00, 340.00,
   '{"rechnungDatum":"2026-01-15","pkvDatum":"2026-02-01","betDatum":"2026-02-05","beihilfeDatum":"2026-02-08"}');

-- Aufwendung 8: Erika – Physiotherapie, noch in Bearbeitung
INSERT INTO aufwendungen (patientId, datum, faelligkeitsDatum, kontaktId, aufTyp, beschreibung, rechnungsNr, betrag,
  rechnungStatus, pkvStatus, betStatus, beihilfeStatus, pkvBetrag, betBetrag, beihilfeBetrag, statusDaten)
VALUES
  ('pat-002', '2026-03-01', '2026-04-01', 'con-007', 'Arzt', '10x Physiotherapie Schulter', 'PT-2026-0044', 420.00,
   'bezahlt', 'eingereicht', 'entfällt', 'offen', 0, 0, 0,
   '{"rechnungDatum":"2026-03-05","pkvDatum":"2026-03-10"}');

-- Aufwendung 9: Erika – Allgemeinarzt, vollständig
INSERT INTO aufwendungen (patientId, datum, faelligkeitsDatum, kontaktId, aufTyp, beschreibung, rechnungsNr, betrag,
  rechnungStatus, pkvStatus, betStatus, beihilfeStatus, pkvBetrag, betBetrag, beihilfeBetrag, statusDaten)
VALUES
  ('pat-002', '2026-02-20', '2026-03-20', 'con-001', 'Arzt', 'Vorsorgeuntersuchung', 'RE-2026-0198', 95.00,
   'bezahlt', 'erstattet', 'entfällt', 'erstattet', 28.50, 0, 66.50,
   '{"rechnungDatum":"2026-02-22","pkvDatum":"2026-03-05","beihilfeDatum":"2026-03-10"}');

-- Aufwendung 10: Lukas (Kind) – Zahnarzt, vollständig
INSERT INTO aufwendungen (patientId, datum, faelligkeitsDatum, kontaktId, aufTyp, beschreibung, rechnungsNr, betrag,
  rechnungStatus, pkvStatus, betStatus, beihilfeStatus, pkvBetrag, betBetrag, beihilfeBetrag, statusDaten)
VALUES
  ('pat-003', '2026-02-14', '2026-03-14', 'con-003', 'Zahnarzt', 'Kontrolle + Versiegelung', 'ZA-2026-0177', 135.00,
   'bezahlt', 'erstattet', 'entfällt', 'erstattet', 27.00, 0, 108.00,
   '{"rechnungDatum":"2026-02-16","pkvDatum":"2026-03-01","beihilfeDatum":"2026-03-05"}');

-- Aufwendung 11: Lukas – Apotheke offen
INSERT INTO aufwendungen (patientId, datum, faelligkeitsDatum, kontaktId, aufTyp, beschreibung, rechnungsNr, betrag,
  rechnungStatus, pkvStatus, betStatus, beihilfeStatus, pkvBetrag, betBetrag, beihilfeBetrag, statusDaten)
VALUES
  ('pat-003', '2026-03-18', '2026-04-18', 'con-005', 'Apotheke', 'Antibiotika-Kur', 'APO-2026-1388', 28.40,
   'eingegangen', 'offen', 'entfällt', 'offen', 0, 0, 0,
   '{}');

-- Aufwendung 12: Max – Fahrtkosten Krankenhaus
INSERT INTO aufwendungen (patientId, datum, faelligkeitsDatum, kontaktId, aufTyp, beschreibung, rechnungsNr, betrag,
  rechnungStatus, pkvStatus, betStatus, beihilfeStatus, pkvBetrag, betBetrag, beihilfeBetrag, statusDaten)
VALUES
  ('pat-001', '2026-02-10', '2026-03-10', NULL, 'Rechnung', 'Fahrtkosten Krankenhaus (Hin- und Rückfahrt)', NULL, 38.00,
   'bezahlt', 'entfällt', 'entfällt', 'erstattet', 0, 0, 38.00,
   '{"rechnungDatum":"2026-02-18","beihilfeDatum":"2026-03-01"}');

-- =============================================================================
-- BERECHNUNGEN (Demo: vorab befüllte Anzeige-Werte)
-- =============================================================================
-- Hinweis:
-- - Diese INSERTs befüllen `aufwendung_berechnungen` mit Beispielwerten für Doku/Screenshots.
-- - Sie sind nicht automatisch aus `backend/src/db/migrations.js` (`calculateAmounts()`) abgeleitet.
-- - Wenn sich die Berechnungslogik ändert, müssen diese Werte manuell aktualisiert werden.
-- =============================================================================
--   beihilfeSoll = betrag * (beihilfeQuote / 100)
--   pkvAusstehend = pkvSoll wenn pkvStatus in (offen, eingereicht), sonst 0
--   beihilfeAusstehend = beihilfeSoll wenn beihilfeStatus in (offen, eingereicht), sonst 0
--   ausstehend = pkvAusstehend + beihilfeAusstehend
--   pkvErledigt = pkvBetrag wenn pkvStatus = erstattet, sonst 0
--   beihilfeErledigt = beihilfeBetrag wenn beihilfeStatus = erstattet, sonst 0
--   eigenbehalt = betrag - pkvErledigt - beihilfeErledigt - betErledigt
-- =============================================================================

-- Aufwendung 1: 185 € – vollständig erstattet (PKV 50%, Beihilfe 50%)
INSERT INTO aufwendung_berechnungen (id, aufwendungId, betrag, ausstehend, eigenbehalt, pkvSoll, pkvAusstehend, pkvErledigt, beihilfeSoll, beihilfeAusstehend, beihilfeErledigt, betSoll, betErledigt, calculatedAt)
VALUES ('ber-001', 1, 185.00, 0.00, 0.00, 92.50, 0.00, 92.50, 92.50, 0.00, 92.50, 0, 0, CURRENT_TIMESTAMP);

-- Aufwendung 2: 320 € – Beihilfe noch ausstehend (160 €)
INSERT INTO aufwendung_berechnungen (id, aufwendungId, betrag, ausstehend, eigenbehalt, pkvSoll, pkvAusstehend, pkvErledigt, beihilfeSoll, beihilfeAusstehend, beihilfeErledigt, betSoll, betErledigt, calculatedAt)
VALUES ('ber-002', 2, 320.00, 160.00, 160.00, 160.00, 0.00, 160.00, 160.00, 160.00, 0.00, 0, 0, CURRENT_TIMESTAMP);

-- Aufwendung 3: 540 € – alles offen
INSERT INTO aufwendung_berechnungen (id, aufwendungId, betrag, ausstehend, eigenbehalt, pkvSoll, pkvAusstehend, pkvErledigt, beihilfeSoll, beihilfeAusstehend, beihilfeErledigt, betSoll, betErledigt, calculatedAt)
VALUES ('ber-003', 3, 540.00, 540.00, 540.00, 270.00, 270.00, 0.00, 270.00, 270.00, 0.00, 0, 0, CURRENT_TIMESTAMP);

-- Aufwendung 4: 210 € – vollständig erstattet
INSERT INTO aufwendung_berechnungen (id, aufwendungId, betrag, ausstehend, eigenbehalt, pkvSoll, pkvAusstehend, pkvErledigt, beihilfeSoll, beihilfeAusstehend, beihilfeErledigt, betSoll, betErledigt, calculatedAt)
VALUES ('ber-004', 4, 210.00, 0.00, 0.00, 105.00, 0.00, 105.00, 105.00, 0.00, 105.00, 0, 0, CURRENT_TIMESTAMP);

-- Aufwendung 5: 1850 € – PKV erstattet, BET + Beihilfe noch eingereicht
INSERT INTO aufwendung_berechnungen (id, aufwendungId, betrag, ausstehend, eigenbehalt, pkvSoll, pkvAusstehend, pkvErledigt, beihilfeSoll, beihilfeAusstehend, beihilfeErledigt, betSoll, betErledigt, calculatedAt)
VALUES ('ber-005', 5, 1850.00, 925.00, 925.00, 925.00, 0.00, 925.00, 925.00, 925.00, 0.00, 0, 0, CURRENT_TIMESTAMP);

-- Aufwendung 6: 47.80 € – vollständig erstattet
INSERT INTO aufwendung_berechnungen (id, aufwendungId, betrag, ausstehend, eigenbehalt, pkvSoll, pkvAusstehend, pkvErledigt, beihilfeSoll, beihilfeAusstehend, beihilfeErledigt, betSoll, betErledigt, calculatedAt)
VALUES ('ber-006', 6, 47.80, 0.00, 0.00, 23.90, 0.00, 23.90, 23.90, 0.00, 23.90, 0, 0, CURRENT_TIMESTAMP);

-- Aufwendung 7: 680 € – Erika, KFO mit BET, alles erstattet (PKV 30%, BET 20%, Beihilfe 50%)
INSERT INTO aufwendung_berechnungen (id, aufwendungId, betrag, ausstehend, eigenbehalt, pkvSoll, pkvAusstehend, pkvErledigt, beihilfeSoll, beihilfeAusstehend, beihilfeErledigt, betSoll, betErledigt, calculatedAt)
VALUES ('ber-007', 7, 680.00, 0.00, 0.00, 204.00, 0.00, 204.00, 340.00, 0.00, 340.00, 136.00, 136.00, CURRENT_TIMESTAMP);

-- Aufwendung 8: 420 € – Erika, PKV eingereicht, Beihilfe offen
INSERT INTO aufwendung_berechnungen (id, aufwendungId, betrag, ausstehend, eigenbehalt, pkvSoll, pkvAusstehend, pkvErledigt, beihilfeSoll, beihilfeAusstehend, beihilfeErledigt, betSoll, betErledigt, calculatedAt)
VALUES ('ber-008', 8, 420.00, 420.00, 0.00, 126.00, 126.00, 0.00, 294.00, 294.00, 0.00, 0, 0, CURRENT_TIMESTAMP);

-- Aufwendung 9: 95 € – Erika, vollständig erstattet
INSERT INTO aufwendung_berechnungen (id, aufwendungId, betrag, ausstehend, eigenbehalt, pkvSoll, pkvAusstehend, pkvErledigt, beihilfeSoll, beihilfeAusstehend, beihilfeErledigt, betSoll, betErledigt, calculatedAt)
VALUES ('ber-009', 9, 95.00, 0.00, 0.00, 28.50, 0.00, 28.50, 66.50, 0.00, 66.50, 0, 0, CURRENT_TIMESTAMP);

-- Aufwendung 10: 135 € – Lukas, vollständig erstattet (PKV 20%, Beihilfe 80%)
INSERT INTO aufwendung_berechnungen (id, aufwendungId, betrag, ausstehend, eigenbehalt, pkvSoll, pkvAusstehend, pkvErledigt, beihilfeSoll, beihilfeAusstehend, beihilfeErledigt, betSoll, betErledigt, calculatedAt)
VALUES ('ber-010', 10, 135.00, 0.00, 0.00, 27.00, 0.00, 27.00, 108.00, 0.00, 108.00, 0, 0, CURRENT_TIMESTAMP);

-- Aufwendung 11: 28.40 € – Lukas, alles offen
INSERT INTO aufwendung_berechnungen (id, aufwendungId, betrag, ausstehend, eigenbehalt, pkvSoll, pkvAusstehend, pkvErledigt, beihilfeSoll, beihilfeAusstehend, beihilfeErledigt, betSoll, betErledigt, calculatedAt)
VALUES ('ber-011', 11, 28.40, 28.40, 0.00, 5.68, 5.68, 0.00, 22.72, 22.72, 0.00, 0, 0, CURRENT_TIMESTAMP);

-- Aufwendung 12: 38 € – Max, Fahrtkosten, Beihilfe erstattet
INSERT INTO aufwendung_berechnungen (id, aufwendungId, betrag, ausstehend, eigenbehalt, pkvSoll, pkvAusstehend, pkvErledigt, beihilfeSoll, beihilfeAusstehend, beihilfeErledigt, betSoll, betErledigt, calculatedAt)
VALUES ('ber-012', 12, 38.00, 0.00, 0.00, 0.00, 0.00, 0.00, 38.00, 0.00, 38.00, 0, 0, CURRENT_TIMESTAMP);

COMMIT;
