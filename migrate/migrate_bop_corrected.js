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
      betStatus TEXT DEFAULT 'nicht nötig',
      beihilfeStatus TEXT DEFAULT 'offen',
      pkvBetrag REAL DEFAULT 0,
      betBetrag REAL DEFAULT 0,
      beihilfeBetrag REAL DEFAULT 0,
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
  // tbl_Kontakte ist leer - Kontakte aus Re_Aussteller in tbl_Rechnungen extrahieren
  // Einige Aussteller sind keine echten Kontakte (Fahrtkosten-Sammelpositionen, Platzhalter)
  const SKIP_AUSSTELLER = [
    '<Rechnungsaussteller>',
    'Krankheitskosten Steuererklärung'
  ];
  const FAHRTKOSTEN_PATTERN = /Fahrtkosten/i;

  const aussteller = await query(oldDb, `
    SELECT DISTINCT Re_Aussteller as name
    FROM tbl_Rechnungen
    WHERE Re_Aussteller IS NOT NULL AND Re_Aussteller != ''
    ORDER BY Re_Aussteller
  `);

  const contactMap = {};

  for (const a of aussteller) {
    const name = (a.name || '').trim();
    if (!name) continue;
    if (SKIP_AUSSTELLER.includes(name)) continue;
    if (FAHRTKOSTEN_PATTERN.test(name)) continue;

    // Fachrichtung aus dem Namen ableiten
    let specialty = null;
    if (/\(ZA\)|Zahn/i.test(name))              specialty = 'Zahnarzt';
    else if (/\(KFO\)|Kieferorth/i.test(name))   specialty = 'Kieferorthopädie';
    else if (/Labor/i.test(name))                specialty = 'Labor';
    else if (/Klinik|KH\b|Uniklinik/i.test(name)) specialty = 'Klinik';
    else if (/Urolog/i.test(name))               specialty = 'Urologie';
    else if (/HNO/i.test(name))                  specialty = 'HNO';
    else if (/Orthop/i.test(name))               specialty = 'Orthopädie';
    else if (/Pneumo/i.test(name))               specialty = 'Pneumologie';
    else if (/Anästhes/i.test(name))             specialty = 'Anästhesiologie';
    else if (/Chirurg/i.test(name))              specialty = 'Chirurgie';
    else if (/Schlaf/i.test(name))               specialty = 'Schlafmedizin';
    else if (/Dr\.|Privatärzt/i.test(name))      specialty = 'Arzt';

    const id = uuidv4();
    await run(newDb,
      `INSERT INTO contacts (id, name, specialty) VALUES (?, ?, ?)`,
      [id, name, specialty]
    );
    contactMap[name] = id;
  }

  const count = Object.keys(contactMap).length;
  console.log(`   ✓ ${count} Kontakte migriert (aus Re_Aussteller)`);
  return { count, map: contactMap };
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

  // Marker → Status Mapping
  // Rechnung: 0 = bezahlt
  // PKV/BH:   3 = erstattet, 4 = offen, 5 = eingereicht (PKV), 6 = abgelehnt (PKV)
  // BET:      immer 'nicht nötig'
  function mapMarker(marker, col) {
    const m = String(marker || '');
    
    if (col === 'rechnung') {
      // Rech_marker: 0 → bezahlt, sonst offen
      return m === '0' || m === '' ? 'bezahlt' : 'offen';
    }
    
    if (col === 'bet') {
      // BET_marker: immer 4 → nicht nötig
      return 'nicht nötig';
    }
    
    if (col === 'pkv') {
      // PKV_marker: 3→erstattet, 4→nicht nötig, 5→eingereicht (BRE offen), 6→erstattet (BRE erstattet)
      switch (m) {
        case '3': return 'erstattet';
        case '4': return 'nicht nötig';
        case '5': return 'eingereicht';
        case '6': return 'erstattet';
        default: return 'offen';
      }
    }
    
    if (col === 'beihilfe') {
      // BH_marker: 1→offen, 3→erstattet, 4→nicht nötig
      switch (m) {
        case '1': return 'offen';
        case '3': return 'erstattet';
        case '4': return 'nicht nötig';
        default: return 'offen';
      }
    }
    
    return 'offen';
  }

  // 1. Rechnungen
  const rechnungen = await query(oldDb, `
    SELECT 
      Re_ID,
      Re_Person,
      Re_Aussteller,
      Re_Datum,
      Re_Betrag,
      Re_Massnahme,
      Re_Nr,
      PKV_Erstattung,
      BH_Erstattung,
      BET_Erstattung,
      Rech_marker,
      PKV_marker,
      BH_marker,
      BET_marker
    FROM tbl_Rechnungen
    WHERE Re_Person IS NOT NULL AND Re_Betrag > 0
  `);

  for (const r of rechnungen) {
    const patientId = patientMap[r.Re_Person];
    if (!patientId) continue;

    const datum = r.Re_Datum ? new Date(r.Re_Datum).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
    const faelligkeitsDatum = new Date(Date.now() + 30*24*60*60*1000).toISOString().split('T')[0];
    const kontaktId = r.Re_Aussteller ? (contactMap[r.Re_Aussteller] || null) : null;

    await run(newDb,
      `INSERT INTO aufwendungen 
       (patientId, datum, faelligkeitsDatum, kontaktId, aufTyp, beschreibung, rechnungsNr, betrag,
        pkvBetrag, beihilfeBetrag, betBetrag,
        rechnungStatus, pkvStatus, beihilfeStatus, betStatus)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        patientId,
        datum,
        faelligkeitsDatum,
        kontaktId,
        'Rechnung',
        r.Re_Massnahme || '',
        r.Re_Nr || '',
        r.Re_Betrag || 0,
        r.PKV_Erstattung || 0,
        r.BH_Erstattung || 0,
        r.BET_Erstattung || 0,
        mapMarker(r.Rech_marker, 'rechnung'),
        mapMarker(r.PKV_marker, 'pkv'),
        mapMarker(r.BH_marker, 'beihilfe'),
        mapMarker(r.BET_marker, 'bet')
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
