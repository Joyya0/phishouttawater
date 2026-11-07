const express = require('express');
const cors = require('cors');
const { analyze } = require('./analyzer');
const storage = require('./storage');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json({ limit: '200kb' }));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// the React frontend runs on its own Vite dev server and proxies
// /analyze and /api to this server (port 4000), so this server no longer serves the page.
// Accepts both /analyze and /api/analyze, and 'message' or 'emailText'.
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

// optional scan history endpoint
app.get('/api/history', (req, res) => {
  res.json(storage.readAll());
});

// JSON error handling so clients always get { "error": "..." }
app.use((req, res) => res.status(404).json({ error: 'Not found' }));
app.use((err, req, res, next) => {
  const status = err.status || 500;
  res.status(status).json({ error: status === 400 ? 'Invalid JSON in request body' : 'Server error' });
});

app.listen(PORT, () => console.log(`Backend listening on http://localhost:${PORT}`));
