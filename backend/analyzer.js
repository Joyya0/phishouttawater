// Backend by Matthew (PHI backend tasks)
const blocklist = require('./suspiciousLinks.json');

const URGENT = [
  'act now', 'urgent', 'immediately', 'within 24 hours', 'account suspended',
  'account will be closed', 'final notice', 'verify your account', 'limited time', 'action required',
];
const PERSONAL = [
  'password', 'social security', 'ssn', 'credit card', 'card number', 'cvv',
  'bank account', 'routing number', 'pin number', 'date of birth', 'login credentials',
];
const URL_RE = /\bhttps?:\/\/[^\s<>"')]+/gi;

function findKeywords(text, list, type, explanation, points) {
  const lower = text.toLowerCase();
  return list.filter((k) => lower.includes(k)).map((k) => ({
    type, match: k, explanation, points,
  }));
}

function checkLink(url) {
  let host;
  try { host = new URL(url).hostname.toLowerCase(); } catch { return { url, suspicious: false, reason: 'Could not parse URL', points: 0 }; }
  if (blocklist.domains.some((d) => host === d || host.endsWith('.' + d)))
    return { url, suspicious: true, reason: `Domain ${host} is on the suspicious-link blocklist`, points: 3 };
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(host))
    return { url, suspicious: true, reason: 'Link uses a raw IP address instead of a domain name', points: 3 };
  if (blocklist.suspiciousTlds.some((t) => host.endsWith(t)))
    return { url, suspicious: true, reason: `Link uses a high-abuse top-level domain (${host.slice(host.lastIndexOf('.'))})`, points: 2 };
  if (blocklist.keywords.some((k) => url.toLowerCase().includes(k)))
    return { url, suspicious: true, reason: 'URL contains a phrase commonly used in phishing links', points: 2 };
  return { url, suspicious: false, reason: 'No known red flags', points: 0 };
}

function analyze(text) {
  const urgent = findKeywords(text, URGENT, 'urgent_language', 'Urgent wording is used to pressure you into acting without thinking.', 1);
  const personal = findKeywords(text, PERSONAL, 'personal_info_request', 'Legitimate companies rarely ask for this by email.', 2);
  const urls = [...new Set(text.match(URL_RE) || [])];
  const links = urls.map(checkLink);

  // Edited by Matthew: suspicious links also appear as indicators, and every indicator
  // gets a plain-text "description" so the frontend can display it.
  const linkIndicators = links.filter((l) => l.suspicious).map((l) => ({
    type: 'suspicious_link', match: l.url, explanation: l.reason, points: 0,
  }));
  const indicators = [...urgent, ...personal, ...linkIndicators].map(({ points, ...rest }) => ({
    ...rest,
    description: `${rest.type === 'suspicious_link' ? 'Suspicious link' : 'Found'} "${rest.match}": ${rest.explanation}`,
  }));
  const score = [...urgent, ...personal, ...links].reduce((s, i) => s + i.points, 0);
  const riskLevel = score >= 6 ? 'High' : score >= 3 ? 'Medium' : 'Low';

  const summaries = {
    Low: 'No strong phishing signs were found, but stay cautious with unexpected emails.',
    Medium: 'Some phishing signs were found. Be careful before clicking links or replying.',
    High: 'Many phishing signs were found. This email is very likely a phishing attempt.',
  };
  const recommendations = riskLevel === 'Low'
    ? ['Still verify the sender if the email was unexpected.']
    : ['Do not click any links or open attachments.', 'Do not reply with passwords or personal information.', 'Contact the company directly using a website or phone number you already trust.', 'Report the email as phishing and delete it.'];

  return {
    riskLevel,
    score,
    summary: summaries[riskLevel],
    recommendations,
    indicators,
    links: links.map(({ points, ...rest }) => rest),
    timestamp: new Date().toISOString(),
  };
}

module.exports = { analyze };
