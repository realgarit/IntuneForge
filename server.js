import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import https from 'https';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 10000;

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Log requests
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// Proxy endpoint logic ported from api/proxy.js
app.all('/api/proxy', (req, res) => {
    const targetUrl = req.query.url;

    if (!targetUrl) {
        return res.status(400).send('Missing "url" query parameter');
    }

    try {
        const targetUrlObj = new URL(targetUrl);

        // Handle CORS preflight
        if (req.method === 'OPTIONS') {
            res.header('Access-Control-Allow-Origin', '*');
            res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, OPTIONS');
            res.header('Access-Control-Allow-Headers', 'Content-Type, x-ms-blob-type, x-ms-version, x-ms-date');
            return res.status(204).end();
        }

        const options = {
            hostname: targetUrlObj.hostname,
            port: 443,
            path: `${targetUrlObj.pathname}${targetUrlObj.search}`,
            method: req.method,
            headers: {},
        };

        // Forward allowed headers
        const allowedHeaders = ['content-type', 'content-length', 'x-ms-blob-type', 'x-ms-version', 'x-ms-date'];
        for (const [key, value] of Object.entries(req.headers)) {
            if (allowedHeaders.includes(key.toLowerCase())) {
                options.headers[key] = value;
            }
        }

        // Always set the host header to the target hostname
        options.headers['host'] = targetUrlObj.hostname;

        const proxyReq = https.request(options, (proxyRes) => {
            // Set CORS headers on the response
            const responseHeaders = { ...proxyRes.headers };
            responseHeaders['Access-Control-Allow-Origin'] = '*';

            res.writeHead(proxyRes.statusCode || 500, responseHeaders);
            proxyRes.pipe(res);
        });

        proxyReq.on('error', (err) => {
            console.error('[Proxy Error]:', err);
            res.status(502).send(`Proxy Error: ${err.message}`);
        });

        // Pipe the request body to the proxy request
        req.pipe(proxyReq);

    } catch (error) {
        console.error('[Proxy Error] Invalid URL:', targetUrl);
        res.status(400).send(`Invalid Target URL: ${error.message}`);
    }
});

// Serve static files from the dist directory
app.use(express.static(path.join(__dirname, 'dist')));

// Handle SPA routing - send all other requests to index.html
// Using a generic catch-all for Express 5
app.use((req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(port, '0.0.0.0', () => {
    console.log(`Server running on port ${port}`);
});
