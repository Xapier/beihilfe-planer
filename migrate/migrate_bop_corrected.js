#!/usr/bin/env node

/**
 * =============================================================================
 * BEIHILFE-PLANER: Corrected Migration BOP_SQL_Daten → Backend Schema
 * =============================================================================
 * Verwendet das gleiche Schema wie das Backend erwartet
 */

const sqlite3 = require('sqlite3').verbose();
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');

const args = process.argv.slice(2);
if (args.length < 2) {
  console.error('❌ Fehler: node migrate_bop_corrected.js <alte-db> <neue-db>');
  process.exit(1);
}

const OLD_DB_PATH = args[0];
const NEW_DB_PATH = args[1];

if (!fs.existsSync(OLD_DB_PATH)) {
  console.error(`❌ Alte DB nicht gefunden: ${OLD_DB_PATH}`);
  process.exit(1);
}

console.log(`\n🚀 Starte korrigierte Migration\n  Quelle: ${OLD_DB_PATH}\n  Ziel:   ${NEW_DB_PATH}\n`);

const oldDb = new sqlite3.Database(OLD_DB_PATH);
const newDb = new sqlite3.Database(NEW_DB_PATH);

function query(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows || []);
    });
  });
}

function run(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) reject(err);
      else resolve(this.lastID);
    });
  });
}

async function start() {
  try {
    // 1. Erstelle Schema
    console.log('📋 Erstelle Schema...');
    await createSchema();

    // 2. Migriere Patienten
    console.log('👥 Migriere Patienten...');
    const patientCount = await migratePatients();

    // 3. Migriere Kontakte
    console.log('👨‍⚕️ Migriere Kontakte...');
    const contactCount = await migrateContacts();

    // 4. Migriere Aufwendungen
    console.log('💰 Migriere Aufwendungen...');
    const aufwendungCount = await migrateAufwendungen();

    console.log(`\n✅ Migration erfolgreich!\n`);
    console.log(`   Patienten:     ${patientCount}`);
    console.log(`   Kontakte:      ${contactCount}`);
    console.log(`   Aufwendungen:  ${aufwendungCount}\n`);

    newDb.close();
    oldDb.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Fehler:', error.message);
    newDb.close();
    oldDb.close();
    process.exit(1);
  }
}

async function createSchema() {
  const statements = [
    `CREATE TABLE IF NOT EXISTS patients (
      id TEXT PRIMARY KEY,
      firstName TEXT NOT NULL,
      lastName TEXT NOT NULL,
      geburtsDatum TEXT,
      pkvQuote REAL DEFAULT 0,
      beihilfeQuote REAL DEFAULT 0,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,

    `CREATE TABLE IF NOT EXISTS contacts (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      specialty TEXT,
      address TEXT,
      phone TEXT,
      email TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,

    `CREATE TABLE IF NOT EXISTS aufwendungen (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      patientId TEXT NOT NULL,
      datum TEXT NOT NULL,
      faelligkeitsDatum TEXT NOT NULL,
      kontaktId TEXT,
      aufTyp TEXT NOT NULL,
      beschreibung TEXT,
      rechnungsNr TEXT,
      betrag REAL NOT NULL,
      rechnungStatus TEXT DEFAULT 'offen',
      pkvStatus TEXT DEFAULT 'offen',
      betStatus TEXT DEFAULT 'offen',
      beihilfeStatus TEXT DEFAULT 'offen',
      pflegeStatus TEXT DEFAULT 'offen',
      pkvBetrag REAL DEFAULT 0,
      betBetrag REAL DEFAULT 0,
      beihilfeBetrag REAL DEFAULT 0,
      pflegeBetrag REAL DEFAULT 0,
      statusDaten TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (patientId) REFERENCES patients(id),
      FOREIGN KEY (kontaktId) REFERENCES contacts(id)
    )`,

    `CREATE INDEX IF NOT EXISTS idx_aufwendungen_patientId ON aufwendungen(patientId)`,
    `CREATE INDEX IF NOT EXISTS idx_aufwendungen_datum ON aufwendungen(datum)`
  ];

  for (const stmt of statements) {
    await run(newDb, stmt);
  }
  console.log('   ✓ Schema erstellt');
}

async function migratePatients() {
  // Extrahiere unique Patienten aus tbl_Rechnungen
  const oldPatients = await query(oldDb, `
    SELECT DISTINCT Re_Person as fullName
    FROM tbl_Rechnungen
    WHERE Re_Person IS NOT NULL AND Re_Person != ''
    ORDER BY Re_Person
  `);

  const patientMap = {}; // Mapping: fullName -> id

  for (const patient of oldPatients) {
    const names = (patient.fullName || '').trim().split(/\s+/);
    const firstName = names[0] || 'Unknown';
    const lastName = names.slice(1).join(' ') || '';

    const id = uuidv4();
    await run(newDb,
      `INSERT INTO patients (id, firstName, lastName, pkvQuote, beihilfeQuote)
       VALUES (?, ?, ?, ?, ?)`,
      [id, firstName, lastName, 30, 70]
    );

    patientMap[patient.fullName] = id;
  }

  console.log(`   ✓ ${oldPatients.length} Patienten migriert`);
  return { count: oldPatients.length, map: patientMap };
}

async function migrateContacts() {
  const oldContacts = await query(oldDb, `
    SELECT 
      K_ID,
      K_Arzt as name,
      K_Tel as phone,
      K_Mail as email,
      K_Bem as notes
    FROM tbl_Kontakte
    WHERE K_Arzt IS NOT NULL AND K_Arzt != ''
  `);

  const contactMap = {}; // Mapping: name -> id

  for (const contact of oldContacts) {
    const id = uuidv4();
    await run(newDb,
      `INSERT INTO contacts (id, name, specialty, phone, email)
       VALUES (?, ?, ?, ?, ?)`,
      [id, contact.name, 'Arzt', contact.phone, contact.email]
    );

    contactMap[contact.name] = id;
  }

  console.log(`   ✓ ${oldContacts.length} Kontakte migriert`);
  return { count: oldContacts.length, map: contactMap };
}

async function migrateAufwendungen() {
  // Hole Patient-Map
  const allPatients = await query(newDb, `SELECT id, firstName, lastName FROM patients`);
  const patientMap = {};
  allPatients.forEach(p => {
    const fullName = `${p.firstName} ${p.lastName}`.trim();
    patientMap[fullName] = p.id;
  });

  // Hole Kontakt-Map
  const allContacts = await query(newDb, `SELECT id, name FROM contacts`);
  const contactMap = {};
  allContacts.forEach(c => {
    contactMap[c.name] = c.id;
  });

  let count = 0;

  // 1. Rechnungen
  const rechnungen = await query(oldDb, `
    SELECT 
      Re_ID,
      Re_Person,
      Re_Datum,
      Re_Betrag,
      Re_Massnahme,
      Re_Nr,
      PKV_Erstattung,
      BH_Erstattung
    FROM tbl_Rechnungen
    WHERE Re_Person IS NOT NULL AND Re_Betrag > 0
  `);

  for (const r of rechnungen) {
    const patientId = patientMap[r.Re_Person];
    if (!patientId) continue;

    const datum = r.Re_Datum ? new Date(r.Re_Datum).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
    const fuelligkeitsDatum = new Date(Date.now() + 30*24*60*60*1000).toISOString().split('T')[0];

    await run(newDb,
      `INSERT INTO aufwendungen 
       (patientId, datum, faelligkeitsDatum, aufTyp, beschreibung, rechnungsNr, betrag, pkvBetrag, beihilfeBetrag, rechnungStatus)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        patientId,
        datum,
        fuelligkeitsDatum,
        'Rechnung',
        r.Re_Massnahme || '',
        r.Re_Nr || '',
        r.Re_Betrag || 0,
        r.PKV_Erstattung || 0,
        r.BH_Erstattung || 0,
        'offen'
      ]
    );
    count++;
  }

  // 2. Fahrtkosten
  const fahrtkosten = await query(oldDb, `
    SELECT 
      Fk_ID,
      Fk_Patient,
      Fk_Hinfahrt,
      Fk_Kosten,
      Fk_Fahrtziel,
      Fk_Verkehrsmittel
    FROM tbl_Fahrtkosten
    WHERE Fk_Patient IS NOT NULL AND Fk_Kosten > 0
  `);

  for (const f of fahrtkosten) {
    const patientId = patientMap[f.Fk_Patient];
    if (!patientId) continue;

    const datum = f.Fk_Hinfahrt ? new Date(f.Fk_Hinfahrt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
    const faelligkeitsDatum = new Date(Date.now() + 14*24*60*60*1000).toISOString().split('T')[0];

    await run(newDb,
      `INSERT INTO aufwendungen 
       (patientId, datum, faelligkeitsDatum, aufTyp, beschreibung, betrag, rechnungStatus)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        patientId,
        datum,
        faelligkeitsDatum,
        `Fahrtkosten (${f.Fk_Verkehrsmittel || 'PKW'})`,
        f.Fk_Fahrtziel || '',
        f.Fk_Kosten || 0,
        'offen'
      ]
    );
    count++;
  }

  // 3. Krankenhauskosten
  const khkosten = await query(oldDb, `
    SELECT 
      Kh_ID,
      Kh_Patient,
      Kh_Hinfahrt,
      Kh_Kosten,
      Kh_Massnahme,
      Kh_Kategorie
    FROM tbl_KhKosten
    WHERE Kh_Patient IS NOT NULL AND Kh_Kosten > 0
  `);

  for (const k of khkosten) {
    const patientId = patientMap[k.Kh_Patient];
    if (!patientId) continue;

    const datum = k.Kh_Hinfahrt ? new Date(k.Kh_Hinfahrt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
    const faelligkeitsDatum = new Date(Date.now() + 30*24*60*60*1000).toISOString().split('T')[0];

    await run(newDb,
      `INSERT INTO aufwendungen 
       (patientId, datum, faelligkeitsDatum, aufTyp, beschreibung, betrag, rechnungStatus)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        patientId,
        datum,
        faelligkeitsDatum,
        `Krankenhaus (${k.Kh_Kategorie || 'Sonstiges'})`,
        k.Kh_Massnahme || '',
        k.Kh_Kosten || 0,
        'offen'
      ]
    );
    count++;
  }

  console.log(`   ✓ ${count} Aufwendungen migriert`);
  return count;
}

start();
