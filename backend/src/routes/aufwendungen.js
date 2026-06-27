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

/**
 * GET /api/aufwendungen/debug/calc/:id
 * Debug: Zeige rohe Daten aus aufwendung_berechnungen Tabelle
 * ACHTUNG: Nur in Development-Umgebung verfügbar (exposes internal/personal data)
 */
if (process.env.NODE_ENV === 'development') {
  router.get('/debug/calc/:id', async (req, res, next) => {
    try {
      const { getDb } = require('../db/database');
      const db = getDb();
    
    const result = await db.get(`
      SELECT 
        a.id,
        a.betrag,
        a.patientId,
        b.eigenbehalt,
        b.ausstehend,
        b.pkvSoll,
        b.pkvErledigt,
        b.pkvAusstehend,
        b.beihilfeSoll,
        b.beihilfeErledigt,
        b.beihilfeAusstehend,
        b.betSoll,
        b.betErledigt,
        b.calculatedAt
      FROM aufwendungen a
      LEFT JOIN aufwendung_berechnungen b ON a.id = b.aufwendungId
      WHERE a.id = ?
    `, [req.params.id]);
    
      res.json(result || { error: 'Aufwendung nicht gefunden' });
    } catch (error) {
      next(error);
    }
  });

  /**
   * GET /api/aufwendungen/debug/all-calcs
   * Debug: Zeige erste 5 Berechnungen aus Tabelle
   * ACHTUNG: Nur in Development-Umgebung verfügbar (exposes internal data)
   */
  router.get('/debug/all-calcs', async (req, res, next) => {
    try {
      const { getDb } = require('../db/database');
      const db = getDb();
    
    const results = await db.all(`
      SELECT 
        a.id,
        a.betrag,
        b.eigenbehalt,
        b.pkvErledigt,
        b.beihilfeErledigt,
        b.calculatedAt
      FROM aufwendungen a
      LEFT JOIN aufwendung_berechnungen b ON a.id = b.aufwendungId
      LIMIT 5
    `);
    
      res.json(results);
    } catch (error) {
      next(error);
    }
  });

  /**
   * POST /api/aufwendungen/debug/recalculate
   * Debug: Lösche alle Berechnungen und triggere Neuberechnung beim nächsten Server-Restart
   * ACHTUNG: Nur in Development-Umgebung verfügbar (DoS/manipulation risk)
   */
  router.post('/debug/recalculate', async (req, res, next) => {
    try {
      const { getDb } = require('../db/database');
      const db = getDb();
    
    // Lösche alle Berechnungen
    await db.run('DELETE FROM aufwendung_berechnungen');
    
      // Triggere Migration
    const { migrateLegacyCalculations } = require('../db/migrations');
    await migrateLegacyCalculations();
    
    const count = await db.get('SELECT COUNT(*) as count FROM aufwendung_berechnungen');
    res.json({ 
      success: true, 
      message: `Neuberechnung abgeschlossen: ${count.count} Records`,
      count: count.count 
    });
    } catch (error) {
      next(error);
    }
  });
}

module.exports = router;
