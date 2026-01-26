import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import https from 'https'
import { IncomingMessage, ServerResponse } from 'http'
import { PassThrough } from 'stream'

// Custom plugin to reliably proxy Azure Blob requests
const azureBlobProxy = () => ({
  name: 'configure-azure-proxy',
  configureServer(server: any) {
    server.middlewares.use('/azure-blob', (req: IncomingMessage, res: ServerResponse, _next: any) => {
      // The req.url here is stripping the mount point '/azure-blob', 
      // so it will look like: /<account_host>/<container>/<blob>...

      // 1. Validate and parse the URL
      // Expected format: /host/container/blob...
      const urlMatch = (req.url || '').match(/^\/([^/]+)(.*)$/);

      if (!urlMatch) {
        console.error('[AzureProxy] Invalid URL format:', req.url);
        res.statusCode = 400;
        res.end('Invalid Proxy URL format');
        return;
      }

      const azureHost = urlMatch[1];
      const restOfPath = urlMatch[2] || '/';

      // 2. Construct the upstream URL
      const targetUrl = `https://${azureHost}${restOfPath}`;
      const declaredSize = req.headers['content-length'] || 'unknown';

      console.log(`[AzureProxy] ${req.method} -> ${targetUrl} (Content-Length: ${declaredSize})`);

      // 3. Prepare headers
      const headers = { ...req.headers };
      // Remove headers that cause issues with Azure or are invalid for the upstream
      delete headers.host;
      delete headers.origin;
      delete headers.referer;
      delete headers.authorization;
      delete headers.connection;

      // Add required Azure headers
      headers['x-ms-version'] = '2020-10-02';

      // Only add BlobType for non-commit requests
      // Azure returns InvalidHeaderValue if x-ms-blob-type is present on PutBlockList (comp=blocklist)
      // We check if the URL contains 'comp=blocklist'
      if (!(req.url || '').includes('comp=blocklist')) {
        headers['x-ms-blob-type'] = 'BlockBlob';
      }

      // 4. Create the upstream request
      const proxyReq = https.request(targetUrl, {
        method: req.method,
        headers: headers,
        rejectUnauthorized: false // In case of any weird cert issues, though Azure should be fine
      }, (proxyRes) => {
        // 5. Pipe response back to client
        console.log(`[AzureProxy] Response: ${proxyRes.statusCode} ${proxyRes.statusMessage}`);

        res.statusCode = proxyRes.statusCode || 500;
        res.statusMessage = proxyRes.statusMessage || '';

        // Copy headers from upstream to response
        for (const [key, value] of Object.entries(proxyRes.headers)) {
          // content-encoding sometimes causes issues if double-applied, but usually safe to copy
          res.setHeader(key, value as string | string[]);
        }

        proxyRes.pipe(res);
      });

      proxyReq.on('error', (err) => {
        console.error('[AzureProxy] Upstream Error:', err.message);
        if (!res.headersSent) {
          res.statusCode = 502;
          res.end('Proxy Upstream Error: ' + err.message);
        }
      });

      // 6. Pipe client request body to upstream with byte counting
      const counter = new PassThrough();
      let totalBytes = 0;
      counter.on('data', (chunk) => {
        totalBytes += chunk.length;
      });
      counter.on('end', () => {
        console.log(`[AzureProxy] Upload Complete. Total Bytes Sent: ${totalBytes}`);
      });

      req.pipe(counter).pipe(proxyReq);
    });
  }
})

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), azureBlobProxy()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  // For GitHub Pages deployment
  base: './',
  server: {
    // No 'proxy' config needed anymore, handled by middleware
  },
})
