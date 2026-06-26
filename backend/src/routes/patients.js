const express = require('express');
const router = express.Router();
const Patient = require('../models/Patient');

/**
 * GET /api/patients
 * Alle Patienten abrufen
 */
router.get('/', async (req, res, next) => {
  try {
    const patients = await Patient.getAll();
    res.json(patients);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/patients/:id
 * Patient nach ID abrufen
 */
router.get('/:id', async (req, res, next) => {
  try {
    const patient = await Patient.getById(req.params.id);
    if (!patient) {
      return res.status(404).json({ error: 'Patient nicht gefunden' });
    }
    res.json(patient);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/patients
 * Neuen Patienten erstellen
 */
router.post('/', async (req, res, next) => {
  try {
    const { firstName, lastName, geburtsDatum, pkvQuote, beihilfeQuote } = req.body;

    if (!firstName || !lastName) {
      return res.status(400).json({
        error: 'Validierungsfehler',
        details: 'firstName und lastName sind erforderlich'
      });
    }

    const patient = await Patient.create({
      firstName,
      lastName,
      geburtsDatum: geburtsDatum || null,
      pkvQuote: pkvQuote || 0,
      beihilfeQuote: beihilfeQuote || 0
    });

    res.status(201).json(patient);
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/patients/:id
 * Patienten aktualisieren
 */
router.put('/:id', async (req, res, next) => {
  try {
    const patient = await Patient.update(req.params.id, req.body);
    if (!patient) {
      return res.status(404).json({ error: 'Patient nicht gefunden' });
    }
    res.json(patient);
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/patients/:id
 * Patienten löschen (mit allen verknüpften Aufwendungen)
 */
router.delete('/:id', async (req, res, next) => {
  try {
    await Patient.delete(req.params.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/patients/:id/aufwendungen-count
 * Anzahl der verknüpften Aufwendungen abrufen
 */
router.get('/:id/aufwendungen-count', async (req, res, next) => {
  try {
    const hasAufwendungen = await Patient.hasAufwendungen(req.params.id);
    res.json({ hasAufwendungen });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
