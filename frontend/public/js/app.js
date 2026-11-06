const form = document.querySelector("#analyzer-form");
const messageInput = document.querySelector("#email-message");
const analyzeButton = document.querySelector("#analyze-button");
const buttonLabel = document.querySelector(".button-label");
const buttonSpinner = document.querySelector(".button-spinner");
const clearButton = document.querySelector("#clear-button");
const characterCount = document.querySelector("#character-count");
const resultsSection = document.querySelector("#results-section");

messageInput.addEventListener("input", () => {
  const count = messageInput.value.length;
  characterCount.textContent = `${count} ${count === 1 ? "character" : "characters"}`;
});

clearButton.addEventListener("click", () => {
  messageInput.value = "";
  messageInput.dispatchEvent(new Event("input"));
  messageInput.focus();
  resultsSection.hidden = true;
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const message = messageInput.value.trim();
  if (message.length < 10) {
    messageInput.setCustomValidity("Please paste a little more of the email before analyzing it.");
    messageInput.reportValidity();
    messageInput.setCustomValidity("");
    return;
  }

  setLoading(true);
  resultsSection.hidden = true;

  try {
    const response = await fetch("/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message })
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.error || data.message || `Request failed (${response.status}).`);
    }

    renderResults(data);
    resultsSection.hidden = false;
    resultsSection.scrollIntoView({ behavior: "smooth", block: "start" });
  } catch (error) {
    showError(error.message || "Something went wrong while analyzing the email.");
  } finally {
    setLoading(false);
  }
});

function setLoading(isLoading) {
  analyzeButton.disabled = isLoading;
  buttonLabel.textContent = isLoading ? "Analyzing..." : "Analyze Message";
  buttonSpinner.classList.toggle("hidden", !isLoading);
}

function renderResults(data) {
  const risk = firstValue(data.riskLevel, data.risk, data.verdict, data.classification, "Analysis complete");
  const summary = firstValue(data.summary, data.explanation, data.analysis, data.message, "The analysis is complete.");
  const indicators = firstArray(data.indicators, data.flags, data.findings, data.phishingIndicators, data.matchedIndicators);
  const recommendations = firstArray(data.recommendations, data.actions, data.suggestedActions, data.nextSteps);

  document.querySelector("#result-title").textContent = "Your email analysis";
  const badge = document.querySelector("#risk-badge");
  badge.textContent = String(risk);
  badge.className = `rounded-full px-4 py-2 text-xs font-bold ${riskClass(risk)}`;
  document.querySelector("#result-summary").textContent = String(summary);

  fillList("#indicators-list", "#indicators-empty", indicators);
  fillList("#recommendations-list", "#recommendations-empty", recommendations);
}

function firstValue(...values) {
  return values.find(value => value !== undefined && value !== null && value !== "") ?? "";
}

function firstArray(...values) {
  const arrayValue = values.find(item => Array.isArray(item));
  if (arrayValue) return arrayValue;
  const stringValue = values.find(item => typeof item === "string" && item.trim());
  return stringValue ? [stringValue] : [];
}

function fillList(listSelector, emptySelector, items) {
  const list = document.querySelector(listSelector);
  const emptyMessage = document.querySelector(emptySelector);
  list.replaceChildren();

  items.forEach(item => {
    const value = typeof item === "string"
      ? item
      : firstValue(item.description, item.message, item.name, item.title, JSON.stringify(item));
    const li = document.createElement("li");
    li.textContent = String(value);
    list.appendChild(li);
  });

  emptyMessage.hidden = items.length > 0;
}

function riskClass(value) {
  const risk = String(value).toLowerCase();
  if (risk.includes("high") || risk.includes("critical")) return "bg-[#f8e7e7] text-[#a83e43]";
  if (risk.includes("medium") || risk.includes("suspicious")) return "bg-[#f7efdf] text-[#94651d]";
  if (risk.includes("low") || risk.includes("safe")) return "bg-[#e5f2ea] text-[#327354]";
  return "bg-[#e9e9ed] text-navy";
}

function showError(message) {
  resultsSection.hidden = false;
  document.querySelector("#result-title").textContent = "We couldn't analyze that message";

  const badge = document.querySelector("#risk-badge");
  badge.textContent = "Error";
  badge.className = "rounded-full bg-[#e9e9ed] px-4 py-2 text-xs font-bold text-navy";

  document.querySelector("#result-summary").textContent = message;
  fillList("#indicators-list", "#indicators-empty", []);
  fillList("#recommendations-list", "#recommendations-empty", [
    "Check that the Express server is running.",
    "Confirm that POST /analyze accepts JSON with a message property."
  ]);
}
