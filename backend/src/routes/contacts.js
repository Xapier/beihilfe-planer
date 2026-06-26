const express = require('express');
const router = express.Router();
const Contact = require('../models/Contact');

/**
 * GET /api/contacts
 * Alle Kontakte abrufen
 */
router.get('/', async (req, res, next) => {
  try {
    const contacts = await Contact.getAll();
    res.json(contacts);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/contacts/:id
 * Kontakt nach ID abrufen
 */
router.get('/:id', async (req, res, next) => {
  try {
    const contact = await Contact.getById(req.params.id);
    if (!contact) {
      return res.status(404).json({ error: 'Kontakt nicht gefunden' });
    }
    res.json(contact);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/contacts
 * Neuen Kontakt erstellen
 */
router.post('/', async (req, res, next) => {
  try {
    const { name, specialty, address, phone, email } = req.body;

    if (!name) {
      return res.status(400).json({
        error: 'Validierungsfehler',
        details: 'name ist erforderlich'
      });
    }

    const contact = await Contact.create({
      name,
      specialty: specialty || null,
      address: address || null,
      phone: phone || null,
      email: email || null
    });

    res.status(201).json(contact);
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/contacts/:id
 * Kontakt aktualisieren
 */
router.put('/:id', async (req, res, next) => {
  try {
    const contact = await Contact.update(req.params.id, req.body);
    if (!contact) {
      return res.status(404).json({ error: 'Kontakt nicht gefunden' });
    }
    res.json(contact);
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/contacts/:id
 * Kontakt löschen - nur wenn keine Aufwendungen verknüpft sind
 */
router.delete('/:id', async (req, res, next) => {
  try {
    const hasAufwendungen = await Contact.hasAufwendungen(req.params.id);
    
    if (hasAufwendungen) {
      return res.status(409).json({
        error: 'Kontakt kann nicht gelöscht werden',
        details: 'Dieser Kontakt hat verknüpfte Belege. Löschen Sie zuerst die Belege.'
      });
    }
    
    await Contact.delete(req.params.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

module.exports = router;
