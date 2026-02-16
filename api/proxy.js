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
        const headers = new Headers();
        // Forward essential headers and all x-ms- headers
        const allowedHeaders = ['content-type', 'accept', 'if-match', 'if-none-match', 'if-modified-since', 'if-unmodified-since'];

        for (const [key, value] of req.headers.entries()) {
            const lowerKey = key.toLowerCase();
            if (allowedHeaders.includes(lowerKey) || lowerKey.startsWith('x-ms-')) {
                headers.set(key, value);
            }
        }

        let body = null;
        if (req.method === 'PUT' || req.method === 'POST') {
            // CRITICAL: Azure Storage does not support "Transfer-Encoding: chunked".
            // By consuming the body into an ArrayBuffer, we force fetch to set a 
            // concrete Content-Length and avoid chunked encoding.
            const buffer = await req.arrayBuffer();
            body = buffer;
            headers.set('content-length', buffer.byteLength.toString());
            
            // Ensure x-ms-blob-type is set for Azure
            if (!headers.has('x-ms-blob-type')) {
                headers.set('x-ms-blob-type', 'BlockBlob');
            }
        }

        const response = await fetch(targetUrl, {
            method: req.method,
            headers: headers,
            body: body,
            redirect: 'follow',
        });

        const response = await fetch(targetUrl, {
            method: req.method,
            headers: headers,
            body: body,
            redirect: 'follow', // Azure sometimes redirects
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
