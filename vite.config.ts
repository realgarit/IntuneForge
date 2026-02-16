/// <reference types="vitest" />
import { defineConfig } from 'vitest/config'
import { type ViteDevServer } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import https from 'https'
import { IncomingMessage, ServerResponse } from 'http'

// Custom Middleware to proxy Azure Blob Storage requests
// This mimics the Vercel /api/proxy serverless function.
const azureBlobProxy = () => ({
  name: 'azure-blob-proxy',
  configureServer(server: ViteDevServer) {
    server.middlewares.use('/api/proxy', async (req: IncomingMessage, res: ServerResponse) => {
      // Parse the target URL from the query parameter
      const urlObj = new URL(req.url!, `http://${req.headers.host}`);
      const targetUrl = urlObj.searchParams.get('url');

      if (!targetUrl) {
        res.statusCode = 400;
        res.end('Missing "url" query parameter');
        return;
      }

      try {
        const response = await fetch(targetUrl, {
          method: req.method,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
            'Accept': '*/*',
          },
        });

        // Copy headers from response
        response.headers.forEach((value, key) => {
            if (!['content-encoding', 'content-length', 'transfer-encoding', 'connection'].includes(key.toLowerCase())) {
                res.setHeader(key, value);
            }
        });
        
        // Ensure CORS is allowed
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.statusCode = response.status;
        
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
      } catch (error: unknown) {
        console.error('[AzureProxy] Error:', error);
        res.statusCode = 502;
        const message = error instanceof Error ? error.message : 'Unknown error';
        res.end(`Proxy Error: ${message}`);
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
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
  },
});
