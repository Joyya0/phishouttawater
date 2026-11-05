

const express = require("express");
const path = require("path");

const app = express();
const PORT = 4000;

const frontendPath = path.join(__dirname, "..", "frontend");

app.use(express.static(path.join(frontendPath, "public")));

app.set("view engine", "ejs");
app.set("views", path.join(frontendPath, "views"));

// Home page
app.get("/", (req, res) => {
    res.render("index");
});

// Analyze email

    // Common phishing indicators
 
// Start server
app.listen(PORT, () => {
    console.log(`Phish Outta Water running at http://localhost:${PORT}`);
});
