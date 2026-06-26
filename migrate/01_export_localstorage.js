/**
 * Migration: localStorage → REST-API
 *
 * Dieses Script führt man einmalig im Browser-Kontext der ALTEN App aus.
 * Es exportiert alle localStorage-Daten als JSON-Datei.
 * Anschließend importiert man diese Datei mit dem Node.js Import-Script.
 *
 * Schritt 1: Diesen Code in der Browser-Konsole der alten App ausführen.
 */
(function exportFromLocalStorage() {
    const data = {
        patients: JSON.parse(localStorage.getItem('patients') || '[]'),
        contacts: JSON.parse(localStorage.getItem('contacts') || '[]'),
        aufwendungen: JSON.parse(localStorage.getItem('aufwendungen') || '[]'),
        exportedAt: new Date().toISOString()
    };

    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'beihilfe-export.json';
    a.click();
    URL.revokeObjectURL(url);

    console.log(`Export abgeschlossen:
    - ${data.patients.length} Patienten
    - ${data.contacts.length} Kontakte
    - ${data.aufwendungen.length} Aufwendungen`);
})();
