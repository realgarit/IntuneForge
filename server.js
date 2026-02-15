import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import https from 'https';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 10000;
const distPath = path.join(__dirname, 'dist');
const indexPath = path.join(distPath, 'index.html');

// Health check endpoint - always returns 200 to keep Render happy
app.get('/health', (req, res) => {
    res.status(200).json({ 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        distExists: fs.existsSync(distPath),
        indexExists: fs.existsSync(indexPath)
    });
});

// Log requests
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// Proxy endpoint logic
app.all('/api/proxy', (req, res) => {
    const targetUrl = req.query.url;
    if (!targetUrl) return res.status(400).send('Missing "url"');

    try {
        const targetUrlObj = new URL(targetUrl);
        const options = {
            hostname: targetUrlObj.hostname,
            port: 443,
            path: `${targetUrlObj.pathname}${targetUrlObj.search}`,
            method: req.method,
            headers: { ...req.headers, host: targetUrlObj.hostname },
        };

        const proxyReq = https.request(options, (proxyRes) => {
            res.writeHead(proxyRes.statusCode || 500, {
                ...proxyRes.headers,
                'Access-Control-Allow-Origin': '*'
            });
            proxyRes.pipe(res);
        });

        proxyReq.on('error', (err) => {
            console.error('[Proxy Error]:', err);
            res.status(502).send(`Proxy Error: ${err.message}`);
        });

        req.pipe(proxyReq);
    } catch (error) {
        res.status(400).send(`Invalid URL: ${error.message}`);
    }
});

// Serve static files
if (fs.existsSync(distPath)) {
    app.use(express.static(distPath));
}

// Handle SPA routing
app.use((req, res) => {
    if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath, (err) => {
            if (err) {
                console.error('Error sending index.html:', err);
                res.status(500).send('Error loading application');
            }
        });
    } else {
        console.warn('dist/index.html not found. Build might still be in progress.');
        res.status(200).send(`
            <html>
                <body style="font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; flex-direction: column;">
                    <h1>Build in Progress</h1>
                    <p>The application is starting up but the static assets aren't ready yet.</p>
                    <p>Current directory: ${__dirname}</p>
                    <p>Dist exists: ${fs.existsSync(distPath)}</p>
                    <script>setTimeout(() => window.location.reload(), 5000)</script>
                </body>
            </html>
        `);
    }
});

app.listen(port, '0.0.0.0', () => {
    console.log(`Server running on port ${port}`);
    console.log(`Checking paths:
    __dirname: ${__dirname}
    distPath: ${distPath}
    distExists: ${fs.existsSync(distPath)}
    indexPath: ${indexPath}
    indexExists: ${fs.existsSync(indexPath)}`);
});
\nconsole.log('Manual Preview Trigger: ' + new Date().toISOString());
