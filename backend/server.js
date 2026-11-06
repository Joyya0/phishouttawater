// Backend by Matthew (PHI backend tasks)
const express = require('express');
const cors = require('cors');
const path = require('path');
const { analyze } = require('./analyzer');
const storage = require('./storage');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '200kb' }));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Edited by Matthew: serve the frontend from this server (so its relative fetch('/analyze')
// works), accept both /analyze and /api/analyze, and accept 'message' or 'emailText'.
const FRONTEND = path.join(__dirname, '..', 'frontend');
app.use(express.static(path.join(FRONTEND, 'public')));
app.get('/', (req, res) => res.sendFile(path.join(FRONTEND, 'views', 'index.ejs'), { headers: { 'Content-Type': 'text/html' } }));

app.post(['/analyze', '/api/analyze'], (req, res) => {
  const body = req.body || {};
  const emailText = body.message ?? body.emailText;
  if (typeof emailText !== 'string' || !emailText.trim()) {
    return res.status(400).json({ error: 'message is required' });
  }
  const result = analyze(emailText);
  storage.save(result);
  res.json(result);
});

// Edited by Matthew: optional scan history endpoint
app.get('/api/history', (req, res) => {
  res.json(storage.readAll());
});

// Edited by Matthew: JSON error handling so clients always get { "error": "..." }
app.use((req, res) => res.status(404).json({ error: 'Not found' }));
app.use((err, req, res, next) => {
  const status = err.status || 500;
  res.status(status).json({ error: status === 400 ? 'Invalid JSON in request body' : 'Server error' });
});

app.listen(PORT, () => console.log(`Backend listening on http://localhost:${PORT}`));
