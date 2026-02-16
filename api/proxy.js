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
        // We explicitly skip content-length here and set it later
        const allowedHeaders = ['content-type', 'accept', 'if-match', 'if-none-match', 'if-modified-since', 'if-unmodified-since'];

        for (const [key, value] of req.headers.entries()) {
            const lowerKey = key.toLowerCase();
            if (allowedHeaders.includes(lowerKey) || lowerKey.startsWith('x-ms-')) {
                headers.set(key, value);
            }
        }

        let body = null;
        if (req.method === 'PUT' || req.method === 'POST') {
            // Priority 1: Check for 'len' query parameter (our custom fallback)
            const queryLen = url.searchParams.get('len');
            
            // Priority 2: Use existing content-length header
            const incomingContentLength = req.headers.get('content-length');

            if (queryLen) {
                headers.set('content-length', queryLen);
                body = req.body; // Try streaming first if we have the length
            } else if (incomingContentLength && incomingContentLength !== '0') {
                headers.set('content-length', incomingContentLength);
                body = req.body;
            } else {
                // Priority 3: Consume body to determine length
                const buffer = await req.arrayBuffer();
                if (buffer.byteLength > 0) {
                    body = buffer;
                    headers.set('content-length', buffer.byteLength.toString());
                } else {
                    headers.set('content-length', '0');
                }
            }

            // Always ensure x-ms-blob-type for PUT requests
            if (!headers.has('x-ms-blob-type')) {
                headers.set('x-ms-blob-type', 'BlockBlob');
            }
        }

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
