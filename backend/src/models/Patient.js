const { getDb } = require('../db/database');
const { v4: uuidv4 } = require('uuid');

class Patient {
  /**
   * Alle Patienten abrufen
   */
  static async getAll() {
    const db = getDb();
    return await db.all('SELECT * FROM patients ORDER BY lastName, firstName');
  }

  /**
   * Patient nach ID abrufen
   */
  static async getById(id) {
    const db = getDb();
    return await db.get('SELECT * FROM patients WHERE id = ?', [id]);
  }

  /**
   * Neuen Patienten erstellen
   */
  static async create(data) {
    const db = getDb();
    const id = uuidv4();
    
    await db.run(
      `INSERT INTO patients (id, firstName, lastName, geburtsDatum, pkvQuote, beihilfeQuote)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [id, data.firstName, data.lastName, data.geburtsDatum, data.pkvQuote, data.beihilfeQuote]
    );
    
    return { id, ...data };
  }

  /**
   * Patienten aktualisieren
   */
  static async update(id, data) {
    const db = getDb();
    
    const updates = [];
    const values = [];
    
    if (data.firstName !== undefined) {
      updates.push('firstName = ?');
      values.push(data.firstName);
    }
    if (data.lastName !== undefined) {
      updates.push('lastName = ?');
      values.push(data.lastName);
    }
    if (data.geburtsDatum !== undefined) {
      updates.push('geburtsDatum = ?');
      values.push(data.geburtsDatum);
    }
    if (data.pkvQuote !== undefined) {
      updates.push('pkvQuote = ?');
      values.push(data.pkvQuote);
    }
    if (data.beihilfeQuote !== undefined) {
      updates.push('beihilfeQuote = ?');
      values.push(data.beihilfeQuote);
    }
    
    updates.push('updatedAt = CURRENT_TIMESTAMP');
    values.push(id);
    
    if (updates.length > 1) {
      await db.run(
        `UPDATE patients SET ${updates.join(', ')} WHERE id = ?`,
        values
      );
    }
    
    return await this.getById(id);
  }

  /**
   * Patienten löschen (und alle verknüpften Aufwendungen)
   */
  static async delete(id) {
    const db = getDb();
    
    // Zuerst alle Aufwendungen für diesen Patienten löschen
    await db.run('DELETE FROM aufwendungen WHERE patientId = ?', [id]);
    
    // Dann den Patienten löschen
    await db.run('DELETE FROM patients WHERE id = ?', [id]);
  }

  /**
   * Prüfe ob Aufwendungen für diesen Patienten existieren
   */
  static async hasAufwendungen(id) {
    const db = getDb();
    const result = await db.get(
      'SELECT COUNT(*) as count FROM aufwendungen WHERE patientId = ?',
      [id]
    );
    return result.count > 0;
  }
}

module.exports = Patient;
