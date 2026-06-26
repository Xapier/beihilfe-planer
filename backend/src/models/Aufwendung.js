const { getDb } = require('../db/database');

class Aufwendung {
  /**
   * Alle Aufwendungen abrufen
   */
  static async getAll() {
    const db = getDb();
    const rows = await db.all(
      `SELECT * FROM aufwendungen ORDER BY datum DESC, faelligkeitsDatum DESC`
    );
    
    return rows.map(row => this.deserialize(row));
  }

  /**
   * Aufwendungen für einen Patienten abrufen
   */
  static async getByPatientId(patientId) {
    const db = getDb();
    const rows = await db.all(
      `SELECT * FROM aufwendungen WHERE patientId = ? ORDER BY datum DESC`,
      [patientId]
    );
    
    return rows.map(row => this.deserialize(row));
  }

  /**
   * Aufwendung nach ID abrufen
   */
  static async getById(id) {
    const db = getDb();
    const row = await db.get(
      `SELECT * FROM aufwendungen WHERE id = ?`,
      [id]
    );
    
    return row ? this.deserialize(row) : null;
  }

  /**
   * Neue Aufwendung erstellen
   */
  static async create(data) {
    const db = getDb();
    
    const statusDaten = data.daten || {};
    
    const result = await db.run(
      `INSERT INTO aufwendungen (
        patientId, datum, faelligkeitsDatum, kontaktId, aufTyp, beschreibung,
        rechnungsNr, betrag, rechnungStatus, pkvStatus, betStatus,
        beihilfeStatus, pkvBetrag, betBetrag, beihilfeBetrag, statusDaten
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.patientId,
        data.datum,
        data.faelligkeitsDatum,
        data.kontaktId,
        data.aufTyp,
        data.beschreibung,
        data.rechnungsNr,
        data.betrag,
        data.status?.rechnung || 'offen',
        data.status?.pkv || 'offen',
        data.status?.bet || 'offen',
        data.status?.beihilfe || 'offen',
        data.betraege?.pkv || 0,
        data.betraege?.bet || 0,
        data.betraege?.beihilfe || 0,
        JSON.stringify(statusDaten)
      ]
    );
    
    const created = await this.getById(result.lastID);
    return created;
  }

  /**
   * Aufwendung aktualisieren
   */
  static async update(id, data) {
    const db = getDb();
    
    const updates = [];
    const values = [];
    
    if (data.patientId !== undefined) {
      updates.push('patientId = ?');
      values.push(data.patientId);
    }
    if (data.datum !== undefined) {
      updates.push('datum = ?');
      values.push(data.datum);
    }
    if (data.faelligkeitsDatum !== undefined) {
      updates.push('faelligkeitsDatum = ?');
      values.push(data.faelligkeitsDatum);
    }
    if (data.kontaktId !== undefined) {
      updates.push('kontaktId = ?');
      values.push(data.kontaktId);
    }
    if (data.aufTyp !== undefined) {
      updates.push('aufTyp = ?');
      values.push(data.aufTyp);
    }
    if (data.beschreibung !== undefined) {
      updates.push('beschreibung = ?');
      values.push(data.beschreibung);
    }
    if (data.rechnungsNr !== undefined) {
      updates.push('rechnungsNr = ?');
      values.push(data.rechnungsNr);
    }
    if (data.betrag !== undefined) {
      updates.push('betrag = ?');
      values.push(data.betrag);
    }
    if (data.status) {
      if (data.status.rechnung !== undefined) {
        updates.push('rechnungStatus = ?');
        values.push(data.status.rechnung);
      }
      if (data.status.pkv !== undefined) {
        updates.push('pkvStatus = ?');
        values.push(data.status.pkv);
      }
      if (data.status.bet !== undefined) {
        updates.push('betStatus = ?');
        values.push(data.status.bet);
      }
      if (data.status.beihilfe !== undefined) {
        updates.push('beihilfeStatus = ?');
        values.push(data.status.beihilfe);
      }
    }
    if (data.betraege) {
      if (data.betraege.pkv !== undefined) {
        updates.push('pkvBetrag = ?');
        values.push(data.betraege.pkv);
      }
      if (data.betraege.bet !== undefined) {
        updates.push('betBetrag = ?');
        values.push(data.betraege.bet);
      }
      if (data.betraege.beihilfe !== undefined) {
        updates.push('beihilfeBetrag = ?');
        values.push(data.betraege.beihilfe);
      }
    }
    if (data.daten) {
      updates.push('statusDaten = ?');
      values.push(JSON.stringify(data.daten));
    }
    
    updates.push('updatedAt = CURRENT_TIMESTAMP');
    values.push(id);
    
    if (updates.length > 1) {
      await db.run(
        `UPDATE aufwendungen SET ${updates.join(', ')} WHERE id = ?`,
        values
      );
    }
    
    return await this.getById(id);
  }

  /**
   * Aufwendung löschen
   */
  static async delete(id) {
    const db = getDb();
    await db.run('DELETE FROM aufwendungen WHERE id = ?', [id]);
  }

  /**
   * Hilfsfunktion: Konvertiere DB-Reihe zu Frontend-Format
   */
  static deserialize(row) {
    return {
      id: row.id,
      patientId: row.patientId,
      datum: row.datum,
      faelligkeitsDatum: row.faelligkeitsDatum,
      kontaktId: row.kontaktId,
      aufTyp: row.aufTyp,
      beschreibung: row.beschreibung,
      rechnungsNr: row.rechnungsNr,
      betrag: row.betrag,
      status: {
        rechnung: row.rechnungStatus,
        pkv: row.pkvStatus,
        bet: row.betStatus,
        beihilfe: row.beihilfeStatus
      },
      betraege: {
        pkv: row.pkvBetrag,
        bet: row.betBetrag,
        beihilfe: row.beihilfeBetrag
      },
      daten: row.statusDaten ? JSON.parse(row.statusDaten) : {}
    };
  }

  /**
   * Hilfsfunktion: Konvertiere Frontend-Format zu DB-Format für Insert/Update
   */
  static serialize(data) {
    return {
      patientId: data.patientId,
      datum: data.datum,
      faelligkeitsDatum: data.faelligkeitsDatum,
      kontaktId: data.kontaktId,
      aufTyp: data.aufTyp,
      beschreibung: data.beschreibung,
      rechnungsNr: data.rechnungsNr,
      betrag: data.betrag,
      status: data.status || {},
      betraege: data.betraege || {},
      daten: data.daten || {}
    };
  }
}

module.exports = Aufwendung;
