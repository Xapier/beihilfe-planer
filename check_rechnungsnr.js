const sqlite3 = require('sqlite3').verbose();

const BOP_DB = '/Users/davidsiegeris/Library/Mobile Documents/com~apple~CloudDocs/Persönlich/Beruf/Beihilfe/Beihile-Software/BOP_SQL_Daten.s3db';
const db = new sqlite3.Database(BOP_DB);

function query(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows || []);
    });
  });
}

async function check() {
  try {
    console.log('\n🔍 SUCHE RECHNUNGSNUMMER: 409499/01\n');
    
    const rows = await query(`
      SELECT 
        Re_Nr,
        Re_Person,
        Re_Betrag,
        Re_Datum,
        Rech_marker,
        PKV_marker,
        BH_marker,
        BET_marker,
        PKV_Erstattung,
        BH_Erstattung
      FROM tbl_Rechnungen
      WHERE Re_Nr LIKE '%409499%' OR Re_Nr LIKE '%409499/01%'
    `);
    
    if (rows.length === 0) {
      console.log('❌ Keine Rechnungsnummer mit 409499 gefunden!\n');
      console.log('Suche nach ähnlichen Nummern:');
      const similar = await query(`
        SELECT Re_Nr, PKV_marker, BH_marker
        FROM tbl_Rechnungen
        WHERE Re_Nr LIKE '%4094%'
        ORDER BY Re_Nr
      `);
      console.log('\n' + similar.map(r => `  ${r.Re_Nr} (PKV: ${r.PKV_marker}, BH: ${r.BH_marker})`).join('\n'));
    } else {
      rows.forEach(r => {
        console.log('✓ Gefunden!\n');
        console.log(`  Rechnungs-Nr.: ${r.Re_Nr}`);
        console.log(`  Person:        ${r.Re_Person}`);
        console.log(`  Betrag:        €${r.Re_Betrag}`);
        console.log(`  Datum:         ${r.Re_Datum}`);
        console.log(`  \n  MARKER:`);
        console.log(`  - Rech_marker: ${r.Rech_marker || '0/leer'}`);
        console.log(`  - PKV_marker:  ${r.PKV_marker}`);
        console.log(`  - BH_marker:   ${r.BH_marker}`);
        console.log(`  - BET_marker:  ${r.BET_marker}`);
        console.log(`  \n  ERSTATTUNGEN:`);
        console.log(`  - PKV:         €${r.PKV_Erstattung}`);
        console.log(`  - BH:          €${r.BH_Erstattung}`);
      });
    }
    
    db.close();
  } catch (error) {
    console.error('❌ Fehler:', error.message);
    db.close();
  }
}

check();
