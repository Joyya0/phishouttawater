const fs = require('fs');
const path = require('path');

const FILE = path.join(__dirname, 'data', 'history.json');

function readAll() {
  try { return JSON.parse(fs.readFileSync(FILE, 'utf8')); } catch { return []; }
}

// Stores only the result summary, never the email body or URLs.
function save(result) {
  const all = readAll();
  all.push({
    id: Date.now().toString(36),
    riskLevel: result.riskLevel,
    score: result.score,
    // record suspicious links and de-duplicate indicator types
    indicators: [...new Set([
      ...result.indicators.map((i) => i.type),
      ...(result.links.some((l) => l.suspicious) ? ['suspicious_link'] : []),
    ])],
    timestamp: result.timestamp,
  });
  fs.mkdirSync(path.dirname(FILE), { recursive: true });
  fs.writeFileSync(FILE, JSON.stringify(all.slice(-100), null, 2));
}

module.exports = { readAll, save };
