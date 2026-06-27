const { getDb } = require('./database');
const { v4: uuidv4 } = require('uuid');

/**
 * Berechne die Komponenten für eine Aufwendung
 * Wird zentral verwendet statt in Frontend-Code verteilt
 */
function calculateAmounts(patient, auf) {
  if (!patient) {
    return {
      pkvSoll: 0, pkvAusstehend: 0, pkvErledigt: 0,
      beihilfeSoll: 0, beihilfeAusstehend: 0, beihilfeErledigt: 0,
      betSoll: 0, betErledigt: 0,
      ausstehend: auf.betrag,
      eigenbehalt: auf.betrag
    };
  }

  const betrag = auf.betrag;
  const pkvQuote = patient.pkvQuote || 0;
  const beihilfeQuote = patient.beihilfeQuote || 0;

  // Sollbeträge
  const pkvSoll = (betrag * pkvQuote) / 100;
  const beihilfeSoll = (betrag * beihilfeQuote) / 100;
  const betSoll = 0;

  // Ausstehend: PKV/Beihilfe zählen nur, wenn Status "offen" oder "eingereicht"
  const pkvAusstehend = (auf.pkvStatus === 'offen' || auf.pkvStatus === 'eingereicht') ? pkvSoll : 0;
  const beihilfeAusstehend = (auf.beihilfeStatus === 'offen' || auf.beihilfeStatus === 'eingereicht') ? beihilfeSoll : 0;
  const ausstehend = Math.max(0, betrag - pkvAusstehend - beihilfeAusstehend);

  // Eigenbehalt: PKV wird abgezogen, wenn Status NICHT "offen", "eingereicht", "BRE offen", "BRE erstattet"
  // Beihilfe wird abgezogen, wenn Status NICHT "offen", "eingereicht"
  const pkvErledigt = !(auf.pkvStatus === 'offen' || auf.pkvStatus === 'eingereicht' || auf.pkvStatus === 'BRE offen' || auf.pkvStatus === 'BRE erstattet') ? pkvSoll : 0;
  const beihilfeErledigt = !(auf.beihilfeStatus === 'offen' || auf.beihilfeStatus === 'eingereicht') ? beihilfeSoll : 0;
  const eigenbehalt = Math.max(0, betrag - pkvErledigt - beihilfeErledigt);

  // BET wird nicht abgezogen (immer "entfällt")
  const betErledigt = 0;

  return {
    pkvSoll, pkvAusstehend, pkvErledigt,
    beihilfeSoll, beihilfeAusstehend, beihilfeErledigt,
    betSoll, betErledigt,
    ausstehend, eigenbehalt
  };
}

/**
 * Migration 001: Befülle aufwendung_berechnungen mit historischen Daten
 * Wird einmalig beim Start aufgerufen
 */
async function migrateLegacyCalculations() {
  const db = getDb();
  
  try {
    // Überprüfe ob Migration bereits gelaufen ist
    const existingCount = await db.get(
      'SELECT COUNT(*) as count FROM aufwendung_berechnungen'
    );
    
    if (existingCount.count > 0) {
      console.log('✅ Migration 001 bereits durchgeführt, überspringe...');
      return;
    }

    console.log('🔄 Starte Migration 001: Befülle aufwendung_berechnungen...');

    // Hole alle Aufwendungen
    const aufwendungen = await db.all(
      `SELECT a.*, p.pkvQuote, p.beihilfeQuote 
       FROM aufwendungen a
       LEFT JOIN patients p ON a.patientId = p.id
       ORDER BY a.id`
    );

    console.log(`   Found ${aufwendungen.length} Aufwendungen zum Migrieren...`);

    let inserted = 0;
    let errors = 0;

    for (const auf of aufwendungen) {
      try {
        const patient = {
          pkvQuote: auf.pkvQuote || 0,
          beihilfeQuote: auf.beihilfeQuote || 0
        };

        // Berechne Werte
        const berechnungen = calculateAmounts(patient, {
          betrag: auf.betrag,
          pkvStatus: auf.pkvStatus,
          beihilfeStatus: auf.beihilfeStatus
        });

        // Speichere in neue Tabelle
        await db.run(
          `INSERT INTO aufwendung_berechnungen (
            id, aufwendungId, betrag, ausstehend, eigenbehalt,
            pkvSoll, pkvAusstehend, pkvErledigt,
            beihilfeSoll, beihilfeAusstehend, beihilfeErledigt,
            betSoll, betErledigt, calculatedAt
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            uuidv4(),
            auf.id,
            berechnungen.ausstehend + berechnungen.eigenbehalt, // ursprünglicher Betrag
            berechnungen.ausstehend,
            berechnungen.eigenbehalt,
            berechnungen.pkvSoll,
            berechnungen.pkvAusstehend,
            berechnungen.pkvErledigt,
            berechnungen.beihilfeSoll,
            berechnungen.beihilfeAusstehend,
            berechnungen.beihilfeErledigt,
            berechnungen.betSoll,
            berechnungen.betErledigt,
            new Date().toISOString()
          ]
        );

        inserted++;
      } catch (err) {
        console.error(`   ❌ Fehler beim Migrieren von Aufwendung ${auf.id}:`, err.message);
        errors++;
      }
    }

    console.log(`✅ Migration 001 abgeschlossen: ${inserted} Records eingefügt, ${errors} Fehler`);

  } catch (err) {
    console.error('❌ Migration 001 fehlgeschlagen:', err);
    throw err;
  }
}

module.exports = {
  calculateAmounts,
  migrateLegacyCalculations
};
