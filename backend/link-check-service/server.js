
require('dotenv').config();

const express = require('express');
const fs = require('fs');
const path = require('path');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yaml');
const { checkUrl } = require('./urlChecker.js');

const app = express();
const PORT = process.env.PORT || 4002;

app.use(express.json({ limit: '200kb' }));

// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        service: 'link-check-service'
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

// Check a suspicious URL
app.post('/check', async (req, res) => {
    const { url } = req.body || {};

    if (typeof url !== 'string' || !url.trim()) {
        return res.status(400).json({
            error: 'A valid URL is required'
        });
    }

    try {
        const parsedUrl = new URL(url);

        if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
            throw new Error('Invalid protocol');
        }
    } catch {
        return res.status(400).json({
            error: 'Invalid URL format'
        });
    }

    try {
        const result = await checkUrl(url);
        res.status(200).json(result);
    } catch (error) {
        console.error('URL check failed:', error.message);

        res.status(error.status === 429 ? 429 : 503).json({
            error: 'URL checking is temporarily unavailable'
        });
    }
});

// Handle unknown routes
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

// Start the service
app.listen(PORT, () => {
    console.log(
        `Link Check Service running on http://localhost:${PORT}`
    );
});
