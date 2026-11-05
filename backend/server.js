const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '200kb' }));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Stub: real analyzer comes next.
app.post('/api/analyze', (req, res) => {
  const { emailText } = req.body || {};
  if (typeof emailText !== 'string' || !emailText.trim()) {
    return res.status(400).json({ error: 'emailText is required' });
  }
  res.json({
    riskLevel: 'Low',
    score: 0,
    indicators: [],
    links: [],
    timestamp: new Date().toISOString(),
  });
});

app.listen(PORT, () => console.log(`Backend listening on http://localhost:${PORT}`));
