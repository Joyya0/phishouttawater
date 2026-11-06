Backend Report Sections (Phase II)

Part A: Essential vs Optional Features

The core of our backend is the analyze endpoint. A user pastes the text of a suspicious email, and the backend checks it for urgent language, requests for personal information and suspicious links, then returns a Low, Medium or High risk level along with a plain-language explanation of what it found and what the user should do next. Input validation and error handling are also core, so an empty or badly formed request gets a clear JSON error with a 400 status instead of crashing the server. Everything else is optional. The scan history endpoint, which lets the frontend show past results, is a nice extra but the app works without it, and the same goes for the health check endpoint that only confirms the server is running. Growing the list of known suspicious domains and moving from a JSON file to a real database are both things we would consider for Phase III rather than Phase II.

Part C: Preliminary Data Design

Storage approach

We store data in a plain JSON file, backend/data/history.json, and we keep our list of known suspicious links in a separate static file, suspiciousLinks.json. We picked a JSON file because it needs no database setup, anyone grading the project can run it right away, and it uses only built-in Node.js modules so the whole backend depends on just express and cors. For privacy, the email text the user pastes is analyzed in memory and thrown away. Only a short summary of each result is saved. The downside is that one file does not scale and is not safe when many people write to it at once, but that is fine for a prototype. Because all the reading and writing happens in one small file, storage.js, we can swap it for a database in Phase III without touching the rest of the backend.

Data entities and attributes

The main thing we store is a scan record, one for each email that gets analyzed. Each record has an id that is unique to the scan, a riskLevel of Low, Medium or High, a numeric score from the rule points, a list called indicators that names which kinds of rules fired (urgent_language, personal_info_request or suspicious_link), and a timestamp in ISO format showing when the scan ran. The second thing the backend uses is the suspicious link list in suspiciousLinks.json, which holds known bad domains, high-abuse top-level domains and phrases that often appear in phishing links. That list is only read, never changed while the app runs. The pasted email itself is deliberately not stored as an entity. Sample records are in docs/sample-records.md and docs/sample-records.json.

How data is created, retrieved and processed

When the frontend sends an email to POST /api/analyze, the backend first checks that the request is valid. The analyzer then pulls out any links, looks for urgent and personal-information phrases, checks each link against the suspicious link list, adds up the points and decides the risk level. After that, storage.js adds a short summary of the result to history.json, and the full analysis, including the matched phrases and the reason each link was flagged, goes back to the frontend in the response only. To retrieve data, GET /api/history returns the saved summaries. We never edit records once they are saved. The file only keeps the 100 most recent scans, and older ones are dropped.

Part D: Web API Design

D.1 Planned Web API operations

HTTP Method | Endpoint | Functionality
POST | /api/analyze | Analyze pasted email text and return the risk level, indicators, links, summary and recommendations (also available at /analyze)
GET | /api/history | Retrieve past scan results
GET | /api/health | Check that the server is running

All three are already implemented.

D.2 Sample request and response

The request below is what the frontend sends. The backend also accepts emailText in place of message.

POST /api/analyze
Content-Type: application/json

{
  "message": "URGENT act now! send your password at http://bit.ly/x"
}

The response, with status 200:

{
  "riskLevel": "High",
  "score": 7,
  "summary": "Many phishing signs were found. This email is very likely a phishing attempt.",
  "recommendations": [
    "Do not click any links or open attachments.",
    "Do not reply with passwords or personal information.",
    "Contact the company directly using a website or phone number you already trust.",
    "Report the email as phishing and delete it."
  ],
  "indicators": [
    { "type": "urgent_language", "match": "act now", "explanation": "Urgent wording is used to pressure you into acting without thinking.", "description": "Found \"act now\": Urgent wording is used to pressure you into acting without thinking." },
    { "type": "urgent_language", "match": "urgent", "explanation": "Urgent wording is used to pressure you into acting without thinking.", "description": "Found \"urgent\": Urgent wording is used to pressure you into acting without thinking." },
    { "type": "personal_info_request", "match": "password", "explanation": "Legitimate companies rarely ask for this by email.", "description": "Found \"password\": Legitimate companies rarely ask for this by email." },
    { "type": "suspicious_link", "match": "http://bit.ly/x", "explanation": "Domain bit.ly is on the suspicious-link blocklist", "description": "Suspicious link \"http://bit.ly/x\": Domain bit.ly is on the suspicious-link blocklist" }
  ],
  "links": [
    { "url": "http://bit.ly/x", "suspicious": true, "reason": "Domain bit.ly is on the suspicious-link blocklist" }
  ],
  "timestamp": "2026-11-06T14:55:55.436Z"
}

The score of 7 comes from "act now" (1), "urgent" (1), "password" (2) and the blocklisted link (3), and 6 or more counts as High. If the message is missing or empty, or the JSON is malformed, the backend responds with status 400 and a body like { "error": "message is required" }.

D.3 External APIs

We do not use any external APIs. All of the analysis is done by rule-based logic inside our own backend, so there are no API keys or credentials to protect. The only configuration value is the server PORT.

Part B.1: Backend part of the architecture

Diagram source (Mermaid, which can be pasted into mermaid.live or diagrams.net to export an image):

flowchart LR
  U[User] --> F[Frontend: email input page and results display]
  F -- "POST /analyze  {message}" --> S[Express server.js: routing, validation, error handling]
  S --> A[analyzer.js: URL extraction, keyword rules, scoring]
  A --> B[(suspiciousLinks.json: static blocklist)]
  S --> ST[storage.js]
  ST --> H[(data/history.json: results only)]
  S -- "JSON: riskLevel, indicators, summary" --> F
  F -- "GET /api/history (optional)" --> S

Explanation

The frontend sends the pasted email text to the Express backend as JSON over HTTP. The server file, server.js, receives the request and checks it, returning a JSON error with status 400 if it is invalid. For a valid request it hands the text to analyzer.js, which pulls out links, matches urgent and personal-information phrases, checks each link against the static suspiciousLinks.json list, and adds up a score that maps to a Low, Medium or High risk level. The server then asks storage.js to save a short summary of the result, never the email text, to history.json, and sends the full analysis back to the frontend, which shows the risk level, the red flags it found and what the user should do next. No external services are involved.
