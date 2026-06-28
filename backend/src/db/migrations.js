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
      ausstehend: 0,
      eigenbehalt: 0
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
  const ausstehend = pkvAusstehend + beihilfeAusstehend;

  // Erledigt: tatsächlich erstatteter Betrag nutzen falls angegeben, sonst Sollbetrag
  // Wenn tatsächlicher Betrag < Soll, erhöht die Differenz den Eigenbehalt automatisch
  const pkvTatsaechlich = auf.pkvBetrag || 0;
  const beihilfeTatsaechlich = auf.beihilfeBetrag || 0;
  const betTatsaechlich = auf.betBetrag || 0;

  const pkvErledigt = auf.pkvStatus === 'erstattet'
    ? (pkvTatsaechlich > 0 ? pkvTatsaechlich : pkvSoll)
    : 0;
  const beihilfeErledigt = auf.beihilfeStatus === 'erstattet'
    ? (beihilfeTatsaechlich > 0 ? beihilfeTatsaechlich : beihilfeSoll)
    : 0;
  const betErledigt = auf.betStatus === 'erstattet'
    ? (betTatsaechlich > 0 ? betTatsaechlich : 0)
    : 0;

  // Eigenbehalt: universelle Formel – was weder erstattet noch noch ausstehend ist
  // Deckt ab: entfällt-Anteile, BRE offen, Teilerstattungen (Soll - Tatsächlich)
  const eigenbehalt = Math.max(0, betrag - pkvErledigt - beihilfeErledigt - betErledigt - ausstehend);

  return {
    pkvSoll, pkvAusstehend, pkvErledigt, pkvTatsaechlich,
    beihilfeSoll, beihilfeAusstehend, beihilfeErledigt, beihilfeTatsaechlich,
    betSoll, betErledigt, betTatsaechlich,
    ausstehend, eigenbehalt
  };
}

/**
 * Migration 002: Füge tatsaechlich-Spalten zu aufwendung_berechnungen hinzu
 * Idempotent – schlägt nicht fehl wenn Spalten bereits existieren
 */
async function migrateAddTatsaechlichColumns() {
  const db = getDb();
  const columns = ['pkvTatsaechlich', 'beihilfeTatsaechlich', 'betTatsaechlich'];
  for (const col of columns) {
    try {
      await db.run(`ALTER TABLE aufwendung_berechnungen ADD COLUMN ${col} REAL DEFAULT 0`);
      console.log(`✅ Spalte ${col} zu aufwendung_berechnungen hinzugefügt`);
    } catch (err) {
      if (!err.message.includes('duplicate column name')) {
        console.error(`❌ Fehler beim Hinzufügen von ${col}:`, err.message);
      }
    }
  }
}

/**
 * Migration 001: Befülle aufwendung_berechnungen mit historischen Daten
 * Wird einmalig beim Start aufgerufen
 */
async function migrateLegacyCalculations() {
  const db = getDb();
  
  try {
    // Überprüfe ob Migration bereits gelaufen ist
    let existingCount = 0;
    try {
      const result = await db.get(
        'SELECT COUNT(*) as count FROM aufwendung_berechnungen'
      );
      existingCount = result?.count || 0;
    } catch (err) {
      // Tabelle existiert noch nicht - das ist OK
      console.log('🔄 Aufwendung_berechnungen Tabelle existiert noch nicht, wird erstellt...');
    }
    
    if (existingCount > 0) {
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
          beihilfeStatus: auf.beihilfeStatus,
          betStatus: auf.betStatus,
          pkvBetrag: auf.pkvBetrag,
          beihilfeBetrag: auf.beihilfeBetrag,
          betBetrag: auf.betBetrag
        });

        // Speichere in neue Tabelle
        await db.run(
          `INSERT INTO aufwendung_berechnungen (
            id, aufwendungId, betrag, ausstehend, eigenbehalt,
            pkvSoll, pkvAusstehend, pkvErledigt, pkvTatsaechlich,
            beihilfeSoll, beihilfeAusstehend, beihilfeErledigt, beihilfeTatsaechlich,
            betSoll, betErledigt, betTatsaechlich, calculatedAt
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            uuidv4(),
            auf.id,
            auf.betrag,
            berechnungen.ausstehend,
            berechnungen.eigenbehalt,
            berechnungen.pkvSoll,
            berechnungen.pkvAusstehend,
            berechnungen.pkvErledigt,
            berechnungen.pkvTatsaechlich,
            berechnungen.beihilfeSoll,
            berechnungen.beihilfeAusstehend,
            berechnungen.beihilfeErledigt,
            berechnungen.beihilfeTatsaechlich,
            berechnungen.betSoll,
            berechnungen.betErledigt,
            berechnungen.betTatsaechlich,
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
    console.error('❌ Migration 001 fehlgeschlagen:', err.message);
    console.error(err.stack);
    // Nicht werfen - System soll weiterarbeiten
  }
}

module.exports = {
  calculateAmounts,
  migrateLegacyCalculations,
  migrateAddTatsaechlichColumns
};
