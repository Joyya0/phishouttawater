
require('dotenv').config();

const express = require('express');
const fs = require('fs');
const path = require('path');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yaml');
const { runAgent } = require('./agent');

const app = express();
const PORT = process.env.PORT || 4004;

app.use(express.json({ limit: '200kb' }));

// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        service: 'ai-agent-service'
    });
});

// Swagger documentation
const openapi = YAML.parse(
    fs.readFileSync(
        path.join(__dirname, 'openapi.yaml'),
        'utf8'
    )
);

app.use('/docs', swaggerUi.serve, swaggerUi.setup(openapi));

// Internal API key authentication
app.use((req, res, next) => {
    const apiKey = req.headers['x-api-key'];

    if (!process.env.SERVICE_API_KEY ||
        apiKey !== process.env.SERVICE_API_KEY) {
        return res.status(401).json({
            error: 'Invalid or missing API key'
        });
    }

    next();
});

// AI phishing email analysis
app.post('/analyze', async (req, res) => {
    const { emailText } = req.body || {};

    if (typeof emailText !== 'string' ||
        !emailText.trim()) {
        return res.status(400).json({
            error: 'Email text is required'
        });
    }

    if (emailText.length > 10000) {
        return res.status(400).json({
            error: 'Email text exceeds 10000 characters'
        });
    }

    try {
        const result = await runAgent(emailText.trim());
        res.status(200).json(result);
    } catch (error) {
        console.error('AI analysis failed:', error.message);

        if (error.status === 429) {
            return res.status(429).json({
                error: 'AI rate limit reached. Please try again later.'
            });
        }

        res.status(503).json({
            error: 'The AI assistant is temporarily unavailable.'
        });
    }
});

// Unknown routes
app.use((req, res) => {
    res.status(404).json({
        error: 'Not found'
    });
});

// JSON error handling
app.use((err, req, res, next) => {
    const status = err.status || 500;

    res.status(status).json({
        error: status === 400
            ? 'Invalid JSON in request body'
            : 'Server error'
    });
});

// Start the AI Agent Service
app.listen(PORT, () => {
    console.log(
        `AI Agent Service running on http://localhost:${PORT}`
    );
});
