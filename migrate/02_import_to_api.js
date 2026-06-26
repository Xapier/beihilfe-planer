/**
 * Migration: JSON-Export → REST-API
 *
 * Verwendung:
 *   node 02_import_to_api.js <pfad-zur-export-datei.json> [api-url]
 *
 * Beispiel (lokal):
 *   node 02_import_to_api.js beihilfe-export.json http://localhost:3000
 *
 * Beispiel (Proxmox):
 *   node 02_import_to_api.js beihilfe-export.json http://192.168.1.100:3000
 */

const fs = require('fs');
const path = require('path');

const exportFile = process.argv[2];
const apiBase = (process.argv[3] || 'http://localhost:3000') + '/api';

if (!exportFile) {
    console.error('Fehler: Bitte Pfad zur Export-Datei angeben.');
    console.error('Verwendung: node 02_import_to_api.js <export.json> [api-url]');
    process.exit(1);
}

const data = JSON.parse(fs.readFileSync(path.resolve(exportFile), 'utf8'));

async function post(path, body) {
    const res = await fetch(`${apiBase}${path}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    });
    if (!res.ok) {
        const err = await res.text();
        throw new Error(`POST ${path} → ${res.status}: ${err}`);
    }
    return res.json();
}

// Mapping: alte ID → neue API-ID (UUID)
const patientIdMap = {};
const contactIdMap = {};

async function migratePatients() {
    console.log(`\n👤 Importiere ${data.patients.length} Patienten...`);
    for (const p of data.patients) {
        try {
            const created = await post('/patients', {
                firstName: p.firstName,
                lastName: p.lastName,
                geburtsDatum: p.geburtsDatum || null,
                pkvQuote: p.pkvQuote || 0,
                beihilfeQuote: p.beihilfeQuote || 0
            });
            patientIdMap[p.id] = created.id;
            console.log(`  ✓ ${p.firstName} ${p.lastName} → ${created.id}`);
        } catch (err) {
            console.error(`  ✗ ${p.firstName} ${p.lastName}: ${err.message}`);
        }
    }
}

async function migrateContacts() {
    console.log(`\n🏥 Importiere ${data.contacts.length} Kontakte...`);
    for (const c of data.contacts) {
        try {
            const created = await post('/contacts', {
                name: c.name,
                specialty: c.type || c.specialty || '',
                address: c.address || '',
                phone: c.phone || '',
                email: c.email || ''
            });
            contactIdMap[c.id] = created.id;
            console.log(`  ✓ ${c.name} → ${created.id}`);
        } catch (err) {
            console.error(`  ✗ ${c.name}: ${err.message}`);
        }
    }
}

async function migrateAufwendungen() {
    console.log(`\n📋 Importiere ${data.aufwendungen.length} Aufwendungen...`);
    let ok = 0;
    let fail = 0;
    for (const a of data.aufwendungen) {
        try {
            const newPatientId = patientIdMap[a.patientId];
            if (!newPatientId) {
                console.warn(`  ⚠ Aufwendung ${a.id}: Patient ${a.patientId} nicht gefunden, übersprungen.`);
                fail++;
                continue;
            }
            const newKontaktId = a.kontaktId ? (contactIdMap[a.kontaktId] || null) : null;

            await post('/aufwendungen', {
                patientId: newPatientId,
                datum: a.datum,
                faelligkeitsDatum: a.faelligkeitsDatum,
                kontaktId: newKontaktId,
                aufTyp: a.aufTyp,
                beschreibung: a.beschreibung || '',
                rechnungsNr: a.rechnungsNr || '',
                betrag: a.betrag,
                status: a.status || {},
                betraege: a.betraege || {},
                daten: a.daten || {}
            });
            ok++;
        } catch (err) {
            console.error(`  ✗ Aufwendung ${a.id}: ${err.message}`);
            fail++;
        }
    }
    console.log(`  ${ok} erfolgreich, ${fail} fehlgeschlagen`);
}

async function main() {
    console.log(`🚀 Starte Migration nach ${apiBase}`);
    console.log(`📁 Export-Datei: ${exportFile} (vom ${data.exportedAt || 'unbekannt'})`);

    // Gesundheitscheck
    try {
        const health = await fetch(`${apiBase}/health`);
        if (!health.ok) throw new Error('nicht erreichbar');
        console.log('✅ Backend erreichbar');
    } catch {
        console.error('❌ Backend nicht erreichbar. Bitte zuerst den Server starten.');
        process.exit(1);
    }

    await migratePatients();
    await migrateContacts();
    await migrateAufwendungen();

    console.log('\n✅ Migration abgeschlossen!');
    console.log(`   ${Object.keys(patientIdMap).length} Patienten migriert`);
    console.log(`   ${Object.keys(contactIdMap).length} Kontakte migriert`);
}

main().catch(err => {
    console.error('Unerwarteter Fehler:', err);
    process.exit(1);
});
