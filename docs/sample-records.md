# Sample Records (backend)

## Purpose
These records show what the application actually stores and how it relates to the API. They were produced by running real scans against the prototype, not written by hand. The full file is `docs/sample-records.json`.

## Entities
- **ScanRecord** (stored, one per analysis). Created by `POST /api/analyze`, read by `GET /api/history`.
- **BlocklistEntry** (static reference data in `suspiciousLinks.json`). Read-only at runtime, never written.
- The pasted email body is deliberately **not** an entity. It is analyzed in memory and discarded, so no email text or URLs are ever stored.

## ScanRecord structure
| Field | Type | Description |
|---|---|---|
| `id` | string | Unique scan ID (base-36 timestamp) |
| `riskLevel` | "Low" \| "Medium" \| "High" | Overall verdict |
| `score` | integer >= 0 | Rule points. Low 0-2, Medium 3-5, High 6+ |
| `indicators` | string[] | Unique rule types that fired: `urgent_language`, `personal_info_request`, `suspicious_link` |
| `timestamp` | ISO 8601 string (UTC) | When the scan ran |

Storage: a JSON array in `backend/data/history.json`, oldest first, capped at the 100 most recent records.

## Sample records
```json
[
  { "id": "mw43o7cj", "riskLevel": "High",   "score": 11, "indicators": ["urgent_language", "personal_info_request", "suspicious_link"], "timestamp": "2026-11-05T22:11:17.680Z" },
  { "id": "mw43o7hd", "riskLevel": "Medium", "score": 3,  "indicators": ["urgent_language", "personal_info_request"], "timestamp": "2026-11-05T22:11:17.855Z" },
  { "id": "mw43o7mg", "riskLevel": "Medium", "score": 3,  "indicators": ["suspicious_link"], "timestamp": "2026-11-05T22:11:18.038Z" },
  { "id": "mw43o7rv", "riskLevel": "Low",    "score": 0,  "indicators": [], "timestamp": "2026-11-05T22:11:18.233Z" }
]
```

| Record | Input (not stored) | Why it is included |
|---|---|---|
| mw43o7cj | "URGENT: act now! Verify your account and send your password at http://bit.ly/x or http://192.168.1.5/login" | High risk: all three rule types, score 11 (3 urgent phrases + password 2 + two bad links 6) |
| mw43o7hd | "Please verify your account by replying with your password." | Medium from wording alone, no links (1 + 2 = 3) |
| mw43o7mg | "Check out this article http://bit.ly/abc" | Medium from a blocklisted link alone (3), no suspicious wording |
| mw43o7rv | "Lunch tomorrow? See https://example.com/menu" | Low: a normal email with a clean link, empty `indicators` |

## How records connect to the backend
1. **Create:** the client POSTs `{ "emailText": "..." }`. `analyzer.js` extracts URLs, matches keywords, checks links against `suspiciousLinks.json`, and computes the score and level.
2. **Store:** `storage.js` keeps only `id`, `riskLevel`, `score`, the indicator types and `timestamp`.
3. **Respond:** the full detail (matched phrases, explanations, per-link reasons) goes back to the client in that response only. It is not stored.
4. **Retrieve:** `GET /api/history` returns the array above.
