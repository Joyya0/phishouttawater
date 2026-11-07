Backend Report Sections (Phase II)

Part A: Essential vs Optional Features

The core of our backend is the analyze endpoint. A user pastes the text of a suspicious email, and the backend checks it for urgent language, requests for personal information and suspicious links, then returns a low, medium or high risk level along with a plain-language explanation of what it found and what the user should do next. Scan history is also core, based on the Phase I feedback. The backend saves a short summary of every scan and the history endpoint returns those summaries, so users can look back at earlier results. Input validation and error handling are core too, so an empty or badly formed request gets a clear JSON error with a 400 status instead of crashing the server. The optional features are the health check endpoint that only confirms the server is running, a larger and updatable list of known suspicious domains, and moving from a JSON file to a real database, which we would consider for Phase III rather than Phase II.

Backend Revisions Based on Phase I Feedback

Our Phase I feedback said the proposal was clear and feasible and praised the link-checking tool, but pointed out that the app was mostly one page. It suggested making scan history part of the core scope and adding more client and server functionality, for example user accounts or a phishing-training mode. In response, we moved scan history from an optional feature to a core one, and on the backend it is already working. Every analysis now saves a short summary, and the history endpoint returns the saved results. We also made the analysis response more useful by adding a short summary, a list of recommended actions and readable descriptions for each red flag, so the frontend has more to show than a single risk label. For the suggestion about more functionality, we are planning to extend the backend in Phase III with additional features such as user accounts or a phishing-training mode, which would give the app more screens and more client and server interaction. We have not built those yet because Phase II only requires one working interaction, and we want to build them on top of the current design, which keeps storage in one small file that can be swapped for a database later.

Part C: Preliminary Data Design

Storage approach

We store data in a JSON file, backend/data/history.json, and we keep our list of known suspicious links in a separate static file, suspiciousLinks.json. We picked a JSON file because it needs no database setup and it uses only built-in Node.js modules so the whole backend depends on just express and cors. For privacy, the email the user does pastes is analyzed in memory and thrown away. The short summary of each results is saves and the only downside is that one file doesn't scale and is not safe when many people write to it at once, but this a prototype. Because all the reading and writing happens in one small file, storage.js, we can swap it for a database in Phase III without touching the rest of the backend.

Data entities and attributes

We save the scan record one per each scanned email. Record consists of unique id of the scan, riskLevel attribute equal to low, medium or high, score of the scan calculated according to rule points, indicators, and time stamp in ISO format of scanning time. The second data source used by the backend is suspicious links list located in suspiciousLinks.json file, where we store domains blacklisted due to high abuse level, top-level domains often used in phishing links and phishing-specific phrases. This file is read-only during execution of the application. Pasted email is not saved as an entity on purpose. Some sample records are provided in docs/sample-records.md and docs/sample-records.json.

How data is created, retrieved and processed

When the frontend submits an email to the POST /api/analyze route, the backend verifies whether the request is a valid one. The analyzer finds links, looks for urgent and personal-information related phrases, compares all the links against the suspicious link database, calculates the score and evaluates the risk level. Secondly, storage.js updates the history.json file with the result summary, and the whole result with the relevant phrases and explanation of why a certain link was marked as suspicious, is returned only to the frontend. Thirdly, GET /api/history is used to receive the stored summaries. We never change the records after they have been stored. The file keeps only 100 most recent scans.

Part D: Web API Design

D.1 Planned Web API operations

HTTP Method | Endpoint | Functionality

POST | /api/analyze | Analyze pasted email text and return the risk level, indicators, links, summary and recommendations (also available at /analyze)

GET | /api/history | Retrieve past scan results

GET | /api/health | Check that the server is running

All three are already in place.

D.2 Sample request and response

The request that's sent from the frontend. The backend will also accept emailText in lieu of message.

POST /api/analyze

Content-Type: application/json

{

  "message": "URGENT act now! send your password at http://bit.ly/x"

}

The response, with status 200:

{

  "riskLevel": "High",

  "score": 7,

  "summary": "A number of phishing indicators were identified." This email is very likely a phishing attempt.",

  "recommendations": [

    "Do not click any links or open attachments.",

    "Do not reply with passwords or personal information.",

    "Contact the company directly using a website or phone number you already trust.",

    "Report the email as phishing and delete it."

  ],

  "indicators": [

    { "type": "urgent_language", "match": "act now", "explanation": "Urgent wording is used to pressure you into acting without thinking.", "description": "Found 'act now' - urgent wording is used to get you to act without thinking." },

    { "type": "urgent_language", "match": "urgent", "explanation": "Urgent wording is used to pressure you into acting without thinking.", "description": "Found 'urgent': 'Urgent' wording is used to pressure you into acting without thinking." },

    { "type": "personal_info_request", "match": "password", "explanation": "Legitimate companies rarely ask for this by email.", "description": "Found \"password\": legitimate companies will almost never ask for this via email." },

    { "type": "suspicious_link", "match": "http://bit.ly/x", "explanation": "Domain bit.ly is on the suspicious-link blocklist", "description": "Suspicious link \"http://bit.ly/x\": Domain bit.ly is on the suspicious-link blocklist" }

  ],

  "links": [

    { "url": "http://bit.ly/x", "suspicious": true, "reason": "Domain bit.ly is on the suspicious-link blocklist" }

  ],

  "timestamp": "2026-11-06T14:55:55.436Z"

}

The 7 comes from "act now" (1), "urgent" (1), "password" (2) and the blocklisted link (3) and 6 or more is High. If the message is missing or empty or the JSON is malformed the backend returns a 400 with a body of something like { "error": "message is required" }.

D.3 External APIs

We don't use any external APIs at all. All the analysis is done via rule-based logic in our own backend so there are no API keys or credentials to protect. The only config value is the server PORT.

Part B.1: Backend part of the architecture

The finished image is docs/architecture-diagram.svg. Diagram source (Mermaid, which can be pasted into mermaid.live or diagrams.net to export an image):

flowchart LR

  U[User] --> F[React frontend, Vite port 5173: email input page and results display]

  F -- "POST /analyze  {message}" --> S[Express server.js, port 4000: routing, validation, error handling]

  S --> A[analyzer.js: URL extraction, keyword rules, scoring]

  A --> B[(suspiciousLinks.json: static blocklist)]

  S --> ST[storage.js]

  ST --> H[(data/history.json: results only)]

  S -- "JSON: riskLevel, indicators, summary" --> F

  F -- "GET /api/history (optional)" --> S

Explanation

The frontend passes the pasted content of an email to the server-side backend implemented using Express and JavaScript through HTTP requests encoded in JSON format. The server-side script, server.js, parses and verifies the request, sending back a JSON object with a status code 400 in case of an error. In the case of a successful request, the text is forwarded to analyzer.js where the links are identified, urgent or personal information keywords are detected, the links are matched to the static suspiciousLinks.json file, and a number is computed representing the risk of the email: Low, Medium, or High. Then the server asks storage.js to save a small part of the result in history.json without ever saving the email text and passes the complete analysis back to the frontend, which presents the risk level, identified red flags, and instructions for the user.