export const config = {
    runtime: 'edge', // Use Edge runtime for better performance with streaming
};

export default async function handler(req) {
    const url = new URL(req.url);
    const targetUrl = url.searchParams.get('url');

    if (!targetUrl) {
        return new Response('Missing "url" query parameter', { status: 400 });
    }

    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        return new Response(null, {
            status: 204,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, PUT, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, x-ms-blob-type, x-ms-version, x-ms-date',
            },
        });
    }

    try {
        // Forward the request to Azure
        // We strictly filter headers to avoid sending host/connection headers from Vercel
        const headers = new Headers();
        
        // Forward allowed headers and all x-ms- headers
        const allowedHeaders = ['content-type', 'content-length', 'if-match', 'if-none-match', 'if-modified-since', 'if-unmodified-since'];

        for (const [key, value] of req.headers.entries()) {
            const lowerKey = key.toLowerCase();
            if (allowedHeaders.includes(lowerKey) || lowerKey.startsWith('x-ms-')) {
                headers.set(key, value);
            }
        }

        // For PUT/POST, we might need to read the body as arrayBuffer 
        // to ensure Content-Length is correctly handled by the outgoing fetch
        let body = req.body;
        if (req.method === 'PUT' || req.method === 'POST') {
            const contentType = req.headers.get('content-type');
            // Only use arrayBuffer if not too large (Edge limit is usually 4MB-10MB for some operations, 
            // but here we are just forwarding. However, reading it all helps with Content-Length).
            // Our blocks are 4MB, so this is safe.
            body = await req.arrayBuffer();
            
            // If we have the body as ArrayBuffer, fetch will set Content-Length automatically.
            // We can also set it explicitly if it was in the original request.
            if (req.headers.has('content-length')) {
                headers.set('content-length', req.headers.get('content-length'));
            } else {
                headers.set('content-length', body.byteLength.toString());
            }
        }

        const response = await fetch(targetUrl, {
            method: req.method,
            headers: headers,
            body: body,
        });

        // Create a new response with CORS headers
        const responseHeaders = new Headers(response.headers);
        responseHeaders.set('Access-Control-Allow-Origin', '*');

        return new Response(response.body, {
            status: response.status,
            statusText: response.statusText,
            headers: responseHeaders,
        });

    } catch (error) {
        return new Response(`Proxy Error: ${error.message}`, { status: 502 });
    }
}
