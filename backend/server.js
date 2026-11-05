const express = require('express');
const cors = require('cors');
const { analyze } = require('./analyzer');
const storage = require('./storage');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '200kb' }));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.post('/api/analyze', (req, res) => {
  const { emailText } = req.body || {};
  if (typeof emailText !== 'string' || !emailText.trim()) {
    return res.status(400).json({ error: 'emailText is required' });
  }
  const result = analyze(emailText);
  storage.save(result);
  res.json(result);
});

app.get('/api/history', (req, res) => {
  res.json(storage.readAll());
});

app.listen(PORT, () => console.log(`Backend listening on http://localhost:${PORT}`));
