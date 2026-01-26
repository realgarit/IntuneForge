import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import https from 'https'
import { IncomingMessage, ServerResponse } from 'http'
import { ViteDevServer } from 'vite'

// Custom Middleware to proxy Azure Blob Storage requests
// This mimics the Vercel /api/proxy serverless function.
const azureBlobProxy = () => ({
  name: 'azure-blob-proxy',
  configureServer(server: ViteDevServer) {
    server.middlewares.use('/api/proxy', (req: IncomingMessage, res: ServerResponse, _next: any) => {
      // Parse the target URL from the query parameter
      // req.url is the path relative to the mount point (e.g. /?url=...)
      // We construct a dummy base to parse it easily
      const urlObj = new URL(req.url!, `http://${req.headers.host}`);
      const targetUrl = urlObj.searchParams.get('url');

      if (!targetUrl) {
        res.statusCode = 400;
        res.end('Missing "url" query parameter');
        return;
      }

      // console.log(`[AzureProxy] Proxying to: ${targetUrl}`);

      try {
        const targetUrlObj = new URL(targetUrl);
        const options: https.RequestOptions = {
          hostname: targetUrlObj.hostname,
          port: 443,
          path: `${targetUrlObj.pathname}${targetUrlObj.search}`,
          method: req.method,
          headers: {
            ...req.headers,
            host: targetUrlObj.hostname, // Important: Set Host header to Azure
          },
        };

        // Filter out headers that might cause issues (like Origin/Referer if strict)
        if (options.headers) {
          delete (options.headers as any).origin;
          delete (options.headers as any).referer;
          // delete (options.headers as any).host; // construct handled above
        }

        const proxyReq = https.request(options, (proxyRes) => {
          res.writeHead(proxyRes.statusCode || 500, proxyRes.headers);
          proxyRes.pipe(res);
        });

        proxyReq.on('error', (err) => {
          console.error('[AzureProxy] Error:', err);
          res.statusCode = 502;
          res.end(`Proxy Error: ${err.message}`);
        });

        req.pipe(proxyReq);
      } catch (error: any) {
        console.error('[AzureProxy] Invalid Target URL:', targetUrl);
        res.statusCode = 400;
        res.end(`Invalid Target URL: ${error.message}`);
      }
    });
  },
});

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    azureBlobProxy(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    cors: true,
  }
});
