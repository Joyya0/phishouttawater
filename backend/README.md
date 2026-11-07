# Phish Outta Water: Backend

Node.js/Express API checks pasted email text for phishing signs using a rule-based logic (urgent language, requests for personal information, a suspicious-link blocklist). No external services or API keys.

## Requirements
- Node.js 18 or newer

## Install
```
cd backend
npm install
```

## Configure
Optional. Copy `.env.example` to `.env` to change the port (default 4000):
```
PORT=4000
```
The server reads `PORT` from the environment and does not load `.env` by itself. To use the file, run `node --env-file=.env server.js` (Node 20.6+). Otherwise leave it unset.

## Run
```
npm start
```
The server listens on http://localhost:4000. The React frontend runs separately (`cd frontend`, `npm install`, `npm run dev`) and forwards `/analyze` and `/api` requests to this port, so start the backend first.

## Test
Unit tests for the analyzer:
```
node testAnalyzer.js
```
Check the API manually (in another terminal while the server is running):
```
curl http://localhost:4000/api/health
curl -X POST http://localhost:4000/api/analyze -H "Content-Type: application/json" -d "{\"message\":\"URGENT act now! send your password at http://bit.ly/x\"}"
```
Expected: `{"status":"ok"}`, then a High risk result with a score of 7. A request with no `message` returns `{"error":"message is required"}` with status 400.

## API
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/analyze` (also `/analyze`) | Body `{ "message": "..." }` (`emailText` also accepted). Returns `riskLevel`, `score`, `summary`, `recommendations`, `indicators`, `links`, `timestamp`. |
| GET | `/api/history` | Past results (risk level, score, indicator types, timestamp). Never the email text. |
| GET | `/api/health` | `{ "status": "ok" }` |

Errors are JSON: `{ "error": "..." }` with status 400 (bad input or malformed JSON), 404 (unknown route) or 500.

Risk levels: score 0-2 Low, 3-5 Medium, 6+ High.

## Files
- `server.js`: routes, validation, error handling
- `analyzer.js`: URL extraction, keyword rules, scoring
- `storage.js`: saves result summaries to `data/history.json` (created automatically, not committed)
- `suspiciousLinks.json`: static blocklist
- `testAnalyzer.js`: analyzer tests
