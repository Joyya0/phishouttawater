
const suspiciousLinks = require('./suspiciousLinks.json');

async function checkUrl(url) {
    const parsedUrl = new URL(url);
    const hostname = parsedUrl.hostname.toLowerCase();

    // Check the local blocklist
    const blocklisted = suspiciousLinks.some(link => {
        const entry = link.toLowerCase();

        return hostname === entry ||
            hostname.endsWith('.' + entry) ||
            url.toLowerCase() === entry;
    });

    if (blocklisted) {
        return {
            url,
            suspicious: true,
            source: 'blocklist',
            reason: 'URL matches a known suspicious link'
        };
    }

    // Check the external URLhaus API
    const apiKey = process.env.URLHAUS_API_KEY;

    if (!apiKey) {
        return {
            url,
            suspicious: false,
            source: 'blocklist',
            reason: 'No local match; external check not configured'
        };
    }

    const response = await fetch(
        'https://urlhaus-api.abuse.ch/v1/url/',
        {
            method: 'POST',
            headers: {
                'Auth-Key': apiKey,
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({ url }),
            signal: AbortSignal.timeout(10000)
        }
    );

    if (!response.ok) {
        const error = new Error('External API request failed');
        error.status = response.status;
        throw error;
    }

    const data = await response.json();

    if (!['ok', 'no_results'].includes(data.query_status)) {
        throw new Error('Unexpected URLhaus response');
    }

    const suspicious = data.query_status === 'ok';

    return {
        url,
        suspicious,
        source: 'URLhaus',
        reason: suspicious
            ? 'URL found in the URLhaus threat database'
            : 'No known threat found; URL safety is not guaranteed'
    };
}

module.exports = { checkUrl };
