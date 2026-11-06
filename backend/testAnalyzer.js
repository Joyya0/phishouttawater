
const { analyze } = require("./analyzer");

const testEmails = [
  {
    name: "Normal email",
    text: "Hello, our meeting is at 3 PM.",
    expectedRisk: "Low"
  },
  {
    name: "Urgent password request",
    text: "URGENT! Verify your password immediately.",
    expectedRisk: "Medium"
  },
  {
    name: "Account suspension threat",
    text: "URGENT! Your account suspended. Verify your password.",
    expectedRisk: "Medium"
  },
  {
    name: "Email containing a suspicious URL",
    text: "Please visit https://fake-login.example",
    expectedRisk: null
  },
  {
    name: "Email containing an unknown URL",
    text: "Check out https://unlisted.example",
    expectedRisk: null
  }
];

let passed = 0;
let failed = 0;

for (let i = 0; i < testEmails.length; i++) {
  const test = testEmails[i];
  const result = analyze(test.text);

  console.log(`\nTest ${i + 1}: ${test.name}`);
  console.log("Email:", test.text);
  console.log("Risk Level:", result.riskLevel);
  console.log("Score:", result.score);
  console.log("Indicators:", result.indicators);
  console.log("Links:", result.links);

  if (test.expectedRisk === null) {
    console.log("RESULT: Inspection only");
  } else if (result.riskLevel === test.expectedRisk) {
    console.log("RESULT: PASS");
    passed++;
  } else {
    console.log(
      `RESULT: FAIL (expected ${test.expectedRisk})`
    );
    failed++;
  }
}

console.log("\n--- Test Summary ---");
console.log("Passed:", passed);
console.log("Failed:", failed);
console.log("Inspection only:", testEmails.length - passed - failed);

if (failed > 0) {
  process.exitCode = 1;
}
