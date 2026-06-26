const express = require('express');
const router = express.Router();
const Aufwendung = require('../models/Aufwendung');

/**
 * GET /api/aufwendungen
 * Alle Aufwendungen abrufen
 */
router.get('/', async (req, res, next) => {
  try {
    const aufwendungen = await Aufwendung.getAll();
    res.json(aufwendungen);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/aufwendungen/patient/:patientId
 * Aufwendungen für einen Patienten
 */
router.get('/patient/:patientId', async (req, res, next) => {
  try {
    const aufwendungen = await Aufwendung.getByPatientId(req.params.patientId);
    res.json(aufwendungen);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/aufwendungen/:id
 * Aufwendung nach ID abrufen
 */
router.get('/:id', async (req, res, next) => {
  try {
    const aufwendung = await Aufwendung.getById(req.params.id);
    if (!aufwendung) {
      return res.status(404).json({ error: 'Aufwendung nicht gefunden' });
    }
    res.json(aufwendung);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/aufwendungen
 * Neue Aufwendung erstellen
 */
router.post('/', async (req, res, next) => {
  try {
    const {
      patientId,
      datum,
      faelligkeitsDatum,
      kontaktId,
      aufTyp,
      beschreibung,
      rechnungsNr,
      betrag,
      status,
      betraege,
      daten
    } = req.body;

    // Validierung
    if (!patientId || !datum || !faelligkeitsDatum || !aufTyp || betrag === undefined) {
      return res.status(400).json({
        error: 'Validierungsfehler',
        details: 'patientId, datum, faelligkeitsDatum, aufTyp und betrag sind erforderlich'
      });
    }

    const aufwendung = await Aufwendung.create({
      patientId,
      datum,
      faelligkeitsDatum,
      kontaktId: kontaktId || null,
      aufTyp,
      beschreibung: beschreibung || null,
      rechnungsNr: rechnungsNr || null,
      betrag,
      status: status || {},
      betraege: betraege || {},
      daten: daten || {}
    });

    res.status(201).json(aufwendung);
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/aufwendungen/:id
 * Aufwendung aktualisieren
 */
router.put('/:id', async (req, res, next) => {
  try {
    const aufwendung = await Aufwendung.update(req.params.id, req.body);
    if (!aufwendung) {
      return res.status(404).json({ error: 'Aufwendung nicht gefunden' });
    }
    res.json(aufwendung);
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/aufwendungen/:id
 * Aufwendung löschen
 */
router.delete('/:id', async (req, res, next) => {
  try {
    await Aufwendung.delete(req.params.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

module.exports = router;
