
const LINK_CHECK_URL =
    process.env.LINK_CHECK_URL || 'http://localhost:4002';

const HISTORY_SERVICE_URL =
    process.env.HISTORY_SERVICE_URL || 'http://localhost:4001';

// Define the tools available to Groq
const toolSchemas = [
    {
        type: 'function',
        function: {
            name: 'checkUrl',
            description: 'Check a URL for known suspicious activity.',
            parameters: {
                type: 'object',
                properties: {
                    url: {
                        type: 'string',
                        description: 'URL extracted from the email'
                    }
                },
                required: ['url'],
                additionalProperties: false
            }
        }
    },
    {
        type: 'function',
        function: {
            name: 'getScanHistory',
            description: 'Retrieve previous phishing scan records.',
            parameters: {
                type: 'object',
                properties: {},
                additionalProperties: false
            }
        }
    }
];

// Send authenticated requests to other microservices
async function callService(url, options = {}) {
    const response = await fetch(url, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': process.env.SERVICE_API_KEY
        },
        signal: AbortSignal.timeout(10000)
    });

    if (!response.ok) {
        const error = new Error(
            `Service request failed: ${response.status}`
        );

        error.status = response.status;
        throw error;
    }

    return response.json();
}

// Execute the tools requested by Groq
const toolHandlers = {
    async checkUrl(args) {
        if (typeof args.url !== 'string' ||
            !args.url.trim()) {
            throw new Error('A valid URL is required');
        }

        const parsed = new URL(args.url);

        if (!['http:', 'https:'].includes(parsed.protocol)) {
            throw new Error('Invalid URL protocol');
        }

        return callService(`${LINK_CHECK_URL}/check`, {
            method: 'POST',
            body: JSON.stringify({
                url: args.url
            })
        });
    },

    async getScanHistory() {
        const records = await callService(
            `${HISTORY_SERVICE_URL}/history`
        );

        const scans = Array.isArray(records)
            ? records
            : records.scans;

        if (!Array.isArray(scans)) {
            throw new Error('Invalid scan history response');
        }

        // Return only relevant scan summaries
        return scans.slice(-10).map(scan => ({
            id: scan.id,
            riskLevel: scan.riskLevel,
            score: scan.score
        }));
    }
};

module.exports = {
    toolSchemas,
    toolHandlers
};
