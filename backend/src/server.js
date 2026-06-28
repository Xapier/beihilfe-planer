const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { initDb } = require('./db/database');

const patientRoutes = require('./routes/patients');
const contactRoutes = require('./routes/contacts');
const aufwendungRoutes = require('./routes/aufwendungen');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    environment: process.env.NODE_ENV || 'production',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/patients', patientRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/aufwendungen', aufwendungRoutes);

// Error Handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({
    error: 'Interner Fehler',
    message: err.message
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Nicht gefunden',
    path: req.path
  });
});

/**
 * Starte den Server
 */
async function start() {
  try {
    // Initialisiere die Datenbank
    await initDb();
    console.log('✅ Datenbank verbunden');

    // Starte den Server
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server läuft auf http://localhost:${PORT}`);
      console.log(`📊 API verfügbar unter http://localhost:${PORT}/api`);
    });
  } catch (error) {
    console.error('❌ Fehler beim Starten des Servers:', error);
    process.exit(1);
  }
}

start();

module.exports = app;
