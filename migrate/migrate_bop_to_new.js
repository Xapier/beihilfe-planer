#!/usr/bin/env node

/**
 * =============================================================================
 * BEIHILFE-PLANER: Migration BOP_SQL_Daten → Neues Modell
 * =============================================================================
 * Beschreibung: Migriert Daten aus der alten BOP_SQL_Daten.s3db in das neue
 *               vereinfachte Modell (patients, contacts, aufwendungen)
 * 
 * Verwendung:
 *   node migrate_bop_to_new.js <alte-db-pfad> <neue-db-pfad>
 *   
 * Beispiel:
 *   node migrate_bop_to_new.js \
 *     ~/Library/Mobile\ Documents/com~apple~CloudDocs/Persönlich/Beruf/Beihilfe/Beihile-Software/BOP_SQL_Daten.s3db \
 *     ./beihilfe-migrated.db
 * =============================================================================
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Konfiguration
const args = process.argv.slice(2);
if (args.length < 2) {
  console.error('❌ Fehler: Zu wenig Argumente');
  console.error('Verwendung: node migrate_bop_to_new.js <alte-db> <neue-db>');
  process.exit(1);
}

const OLD_DB_PATH = args[0];
const NEW_DB_PATH = args[1];

// Prüfe alte DB
if (!fs.existsSync(OLD_DB_PATH)) {
  console.error(`❌ Alte Datenbank nicht gefunden: ${OLD_DB_PATH}`);
  process.exit(1);
}

console.log(`\n🚀 Starte Migration: BOP_SQL_Daten → Neues Modell\n`);
console.log(`  Quelle:  ${OLD_DB_PATH}`);
console.log(`  Ziel:    ${NEW_DB_PATH}\n`);

// Öffne Datenbanken
const oldDb = new sqlite3.Database(OLD_DB_PATH, (err) => {
  if (err) {
    console.error('❌ Fehler beim Öffnen der alten DB:', err.message);
    process.exit(1);
  }
  console.log('✅ Alte DB geöffnet\n');
});

const newDb = new sqlite3.Database(NEW_DB_PATH, (err) => {
  if (err) {
    console.error('❌ Fehler beim Erstellen der neuen DB:', err.message);
    process.exit(1);
  }
  console.log('✅ Neue DB erstellt\n');
  startMigration();
});

async function startMigration() {
  try {
    // Schritt 1: Erstelle neues Schema
    await createNewSchema();
    
    // Schritt 2: Migriere Patienten (aus tbl_Rechnungen.Re_Person unique)
    const patientCount = await migratePatients();
    
    // Schritt 3: Migriere Kontakte (Ärzte aus tbl_Kontakte)
    const contactCount = await migrateContacts();
    
    // Schritt 4: Migriere Aufwendungen (Rechnungen, Fahrtkosten, KhKosten)
    const expenseCount = await migrateExpenses();
    
    console.log(`\n✅ Migration abgeschlossen!\n`);
    console.log(`📊 Zusammenfassung:`);
    console.log(`   Patienten:     ${patientCount}`);
    console.log(`   Kontakte:      ${contactCount}`);
    console.log(`   Aufwendungen:  ${expenseCount}\n`);
    
    cleanup();
  } catch (error) {
    console.error('❌ Migrationsfehler:', error);
    cleanup();
    process.exit(1);
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function promiseQuery(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows || []);
    });
  });
}

function promiseRun(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) reject(err);
      else resolve(this.lastID);
    });
  });
}

async function createNewSchema() {
  console.log('📋 Erstelle neues Schema...');
  
  const schema = `
    CREATE TABLE IF NOT EXISTS patients (
      id TEXT PRIMARY KEY,
      firstName TEXT NOT NULL,
      lastName TEXT NOT NULL,
      geburtsDatum TEXT,
      pkvQuote REAL DEFAULT 0,
      beihilfeQuote REAL DEFAULT 0,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS contacts (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      specialty TEXT,
      address TEXT,
      phone TEXT,
      email TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS aufwendungen (
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
    );

    CREATE INDEX IF NOT EXISTS idx_aufwendungen_patientId ON aufwendungen(patientId);
    CREATE INDEX IF NOT EXISTS idx_aufwendungen_datum ON aufwendungen(datum);
  `;

  const statements = schema.split(';').filter(s => s.trim());
  for (const stmt of statements) {
    if (stmt.trim()) {
      await promiseRun(newDb, stmt);
    }
  }
  
  console.log('   ✓ Schema erstellt\n');
}

async function migratePatients() {
  console.log('👥 Migriere Patienten...');
  
  // Extrahiere unique Patienten aus alten Rechnungen
  const patients = await promiseQuery(oldDb, `
    SELECT DISTINCT Re_Person as fullName
    FROM tbl_Rechnungen
    WHERE Re_Person IS NOT NULL AND Re_Person != ''
  `);
  
  const { v4: uuidv4 } = require('uuid');
  
  for (const patient of patients) {
    // Spalte Namen in firstName und lastName
    const names = (patient.fullName || '').split(' ');
    const firstName = names[0] || 'Unknown';
    const lastName = names.slice(1).join(' ') || '';
    
    const id = uuidv4();
    await promiseRun(newDb, 
      `INSERT INTO patients (id, firstName, lastName, geburtsDatum, pkvQuote, beihilfeQuote) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [id, firstName, lastName, null, 30, 70]  // Default quotes: 30% PKV, 70% Beihilfe
    );
  }
  
  console.log(`   ✓ ${patients.length} Patienten migriert\n`);
  return patients.length;
}

async function migrateContacts() {
  console.log('👨‍⚕️ Migriere Kontakte (Ärzte)...');
  
  // Extrahiere Ärzte/Kontakte
  const contacts = await promiseQuery(oldDb, `
    SELECT 
      K_ID as id,
      K_Arzt as name,
      K_Tel as phone,
      K_Mail as email,
      K_Bem as notes
    FROM tbl_Kontakte
    WHERE K_Arzt IS NOT NULL AND K_Arzt != ''
  `);
  
  const { v4: uuidv4 } = require('uuid');
  
  for (const contact of contacts) {
    const id = uuidv4();
    await promiseRun(newDb,
      `INSERT INTO contacts (id, name, specialty, phone, email) 
       VALUES (?, ?, ?, ?, ?)`,
      [id, contact.name, 'Arzt', contact.phone, contact.email]
    );
  }
  
  console.log(`   ✓ ${contacts.length} Kontakte migriert\n`);
  return contacts.length;
}

async function migrateExpenses() {
  console.log('💰 Migriere Aufwendungen...');
  
  let totalExpenses = 0;
  
  // 1. Rechnungen (Arztrechnungen, Krankenhaus, etc.)
  console.log('   → Rechnungen...');
  const rechnungen = await promiseQuery(oldDb, `
    SELECT 
      Re_ID as id,
      Re_Person as patient_name,
      Re_Aussteller as provider,
      Re_Datum as date,
      Re_Betrag as amount,
      Re_Massnahme as description,
      Re_Nr as reference,
      Re_Abschluss as status
    FROM tbl_Rechnungen
    WHERE Re_Person IS NOT NULL AND Re_Betrag > 0
  `);
  
  for (const r of rechnungen) {
    const patient = await promiseQuery(newDb,
      `SELECT id FROM patients WHERE name = ?`,
      [r.patient_name]
    );
    
    if (patient.length > 0) {
      await promiseRun(newDb,
        `INSERT INTO aufwendungen 
         (patient_id, type, amount, date, description, reference_number, status)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          patient[0].id,
          'Rechnung',
          r.amount,
          r.date,
          r.description,
          r.reference,
          r.status || 'offen'
        ]
      );
      totalExpenses++;
    }
  }
  
  // 2. Fahrtkosten
  console.log('   → Fahrtkosten...');
  const fahrtkosten = await promiseQuery(oldDb, `
    SELECT 
      Fk_ID as id,
      Fk_Patient as patient_name,
      Fk_Fahrtziel as description,
      Fk_Hinfahrt as date,
      Fk_Kosten as amount,
      Fk_Verkehrsmittel as vehicle_type
    FROM tbl_Fahrtkosten
    WHERE Fk_Patient IS NOT NULL AND Fk_Kosten > 0
  `);
  
  for (const f of fahrtkosten) {
    const patient = await promiseQuery(newDb,
      `SELECT id FROM patients WHERE name = ?`,
      [f.patient_name]
    );
    
    if (patient.length > 0) {
      await promiseRun(newDb,
        `INSERT INTO aufwendungen 
         (patient_id, type, amount, date, description, category)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          patient[0].id,
          'Fahrtkosten',
          f.amount,
          f.date,
          f.description,
          f.vehicle_type
        ]
      );
      totalExpenses++;
    }
  }
  
  // 3. Krankenhauskosten
  console.log('   → Krankenhauskosten...');
  const khkosten = await promiseQuery(oldDb, `
    SELECT 
      Kh_ID as id,
      Kh_Patient as patient_name,
      Kh_Kategorie as category,
      Kh_Hinfahrt as date,
      Kh_Kosten as amount,
      Kh_Massnahme as description
    FROM tbl_KhKosten
    WHERE Kh_Patient IS NOT NULL AND Kh_Kosten > 0
  `);
  
  for (const k of khkosten) {
    const patient = await promiseQuery(newDb,
      `SELECT id FROM patients WHERE name = ?`,
      [k.patient_name]
    );
    
    if (patient.length > 0) {
      await promiseRun(newDb,
        `INSERT INTO aufwendungen 
         (patient_id, type, amount, date, description)
         VALUES (?, ?, ?, ?, ?)`,
        [
          patient[0].id,
          'Krankenhaus',
          k.amount,
          k.date,
          k.description
        ]
      );
      totalExpenses++;
    }
  }
  
  console.log(`   ✓ ${totalExpenses} Aufwendungen migriert\n`);
  return totalExpenses;
}

function cleanup() {
  oldDb.close((err) => {
    if (err) console.error('Fehler beim Schließen alte DB:', err);
  });
  
  newDb.close((err) => {
    if (err) console.error('Fehler beim Schließen neue DB:', err);
    else process.exit(0);
  });
}
