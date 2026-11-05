

const express = require("express");
const path = require("path");

const app = express();
const PORT = 4000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// EJS setup
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Home page
app.get("/", (req, res) => {
    res.render("index");
});

// Analyze email
app.post("/analyze", (req, res) => {
    const message = req.body.message;

    // Check for empty message
    if (!message || message.trim().length < 10) {
        return res.status(400).json({
            error: "Please provide a longer email message."
        });
    }

    const email = message.toLowerCase();

    // Common phishing indicators
    const phishingKeywords = [
        "urgent",
        "immediately",
        "password",
        "verify your account",
        "account suspended",
        "click here",
        "gift card",
        "wire transfer",
        "social security",
        "confirm your identity",
        "unusual activity",
        "limited time"
    ];

    // Find matching keywords
    const indicators = phishingKeywords.filter(keyword =>
        email.includes(keyword)
    );

    // Determine risk level
    let riskLevel;
    let summary;

    if (indicators.length >= 3) {
        riskLevel = "High Risk";
        summary = "This email contains several common phishing warning signs. Be cautious and avoid clicking links or sharing personal information.";
    } else if (indicators.length >= 1) {
        riskLevel = "Medium Risk";
        summary = "This email contains some potentially suspicious language. Verify the sender before taking action.";
    } else {
        riskLevel = "Low Risk";
        summary = "No common phishing keywords were detected. However, this does not guarantee that the email is safe.";
    }

    const recommendations = [
        "Check the sender's email address carefully.",
        "Avoid clicking links or downloading unexpected attachments.",
        "Never share passwords or sensitive personal information.",
        "Contact the organization through its official website if you are unsure."
    ];

    // Send results to frontend
    res.json({
        riskLevel,
        summary,
        indicators,
        recommendations
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Phish Outta Water running at http://localhost:${PORT}`);
});
