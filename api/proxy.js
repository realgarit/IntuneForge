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
        const allowedHeaders = ['content-type', 'content-length', 'x-ms-blob-type', 'x-ms-version', 'x-ms-date'];

        for (const [key, value] of req.headers.entries()) {
            if (allowedHeaders.includes(key.toLowerCase())) {
                headers.set(key, value);
            }
        }

        const response = await fetch(targetUrl, {
            method: req.method,
            headers: headers,
            body: req.body, // Stream the body directly
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
