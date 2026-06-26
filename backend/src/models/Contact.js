const { getDb } = require('../db/database');
const { v4: uuidv4 } = require('uuid');

class Contact {
  /**
   * Alle Kontakte abrufen
   */
  static async getAll() {
    const db = getDb();
    return await db.all('SELECT * FROM contacts ORDER BY name');
  }

  /**
   * Kontakt nach ID abrufen
   */
  static async getById(id) {
    const db = getDb();
    return await db.get('SELECT * FROM contacts WHERE id = ?', [id]);
  }

  /**
   * Neuen Kontakt erstellen
   */
  static async create(data) {
    const db = getDb();
    const id = uuidv4();
    
    await db.run(
      `INSERT INTO contacts (id, name, specialty, address, phone, email)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [id, data.name, data.specialty, data.address, data.phone, data.email]
    );
    
    return { id, ...data };
  }

  /**
   * Kontakt aktualisieren
   */
  static async update(id, data) {
    const db = getDb();
    
    const updates = [];
    const values = [];
    
    if (data.name !== undefined) {
      updates.push('name = ?');
      values.push(data.name);
    }
    if (data.specialty !== undefined) {
      updates.push('specialty = ?');
      values.push(data.specialty);
    }
    if (data.address !== undefined) {
      updates.push('address = ?');
      values.push(data.address);
    }
    if (data.phone !== undefined) {
      updates.push('phone = ?');
      values.push(data.phone);
    }
    if (data.email !== undefined) {
      updates.push('email = ?');
      values.push(data.email);
    }
    
    updates.push('updatedAt = CURRENT_TIMESTAMP');
    values.push(id);
    
    if (updates.length > 1) {
      await db.run(
        `UPDATE contacts SET ${updates.join(', ')} WHERE id = ?`,
        values
      );
    }
    
    return await this.getById(id);
  }

  /**
   * Kontakt löschen
   */
  static async delete(id) {
    const db = getDb();
    await db.run('DELETE FROM contacts WHERE id = ?', [id]);
  }

  /**
   * Prüfe ob Aufwendungen für diesen Kontakt existieren
   */
  static async hasAufwendungen(id) {
    const db = getDb();
    const result = await db.get(
      'SELECT COUNT(*) as count FROM aufwendungen WHERE kontaktId = ?',
      [id]
    );
    return result.count > 0;
  }
}

module.exports = Contact;
