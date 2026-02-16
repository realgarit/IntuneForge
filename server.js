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
app.all('/api/proxy', async (req, res) => {
    const targetUrl = req.query.url;
    if (!targetUrl) return res.status(400).send('Missing "url"');

    try {
        const response = await fetch(targetUrl, {
            method: req.method,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
                'Accept': '*/*',
            },
            // fetch follows redirects by default
        });

        // Copy headers from response
        const responseHeaders = {};
        response.headers.forEach((value, key) => {
            // Skip headers that might cause issues when forwarded
            if (!['content-encoding', 'content-length', 'transfer-encoding', 'connection'].includes(key.toLowerCase())) {
                responseHeaders[key] = value;
            }
        });
        
        // Ensure CORS is allowed
        responseHeaders['Access-Control-Allow-Origin'] = '*';
        
        res.writeHead(response.status, responseHeaders);
        
        // Stream the response body
        if (response.body) {
            const reader = response.body.getReader();
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                res.write(value);
            }
        }
        res.end();
    } catch (error) {
        console.error('[Proxy Error]:', error);
        res.status(502).send(`Proxy Error: ${error.message}`);
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
