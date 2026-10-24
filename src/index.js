import { handleProxy } from './proxy.js';
import { handleStream, buildManifest } from './addon.js';
import { handleValidateCookie, handleFebboxFlow } from './febbox.js';
import { CONFIG_HTML } from './ui.js';

function decodeConfig(encoded) {
    let value = encoded.replace(/-/g, '+').replace(/_/g, '/');
    while (value.length % 4) value += '=';
    return JSON.parse(atob(value));
}

function handlePreflight(request) {
    const origin = request.headers.get('origin') || '*';
    return new Response(null, {
        status: 204,
        headers: {
            'access-control-allow-origin': origin,
            'access-control-allow-methods': 'GET, HEAD, POST, OPTIONS',
            'access-control-allow-headers': request.headers.get('access-control-request-headers') || 'Range, Content-Type',
            'access-control-max-age': '86400',
            ...(request.headers.get('origin') ? { 'access-control-allow-credentials': 'true' } : {}),
        },
    });
}

function jsonResponse(data, status = 200, cacheAge = 0) {
    const headers = {
        'content-type': 'application/json;charset=UTF-8',
        'access-control-allow-origin': '*',
        'cache-control': cacheAge > 0
            ? `public, max-age=${cacheAge}, s-maxage=${cacheAge}, stale-while-revalidate=${cacheAge * 2}`
            : 'no-cache, no-store, must-revalidate',
    };
    return new Response(JSON.stringify(data), { status, headers });
}

function htmlResponse() {
    return new Response(CONFIG_HTML, {
        headers: {
            'content-type': 'text/html;charset=UTF-8',
            'cache-control': 'no-store',
            'x-content-type-options': 'nosniff',
            'referrer-policy': 'strict-origin-when-cross-origin',
        },
    });
}

export default {
    async fetch(request, env, ctx) {
        const url = new URL(request.url);
        const path = url.pathname;
        const proxyBase = url.origin;
        const tmdbApiKey = env.TMDB_API_KEY || '';

        if (request.method === 'OPTIONS') return handlePreflight(request);
        if (path.startsWith('/proxy')) return handleProxy(request, env);
        if (path === '/api/validate-cookie' && request.method === 'POST') return handleValidateCookie(request);
        if (path === '/api/febbox-flow' && request.method === 'POST') return handleFebboxFlow(request);
        if (path === '/' || path === '/configure') return htmlResponse();

        const cache = caches.default;
        const cacheKey = new Request(url.toString(), request);
        if (request.method === 'GET' && path.endsWith('.json')) {
            const cached = await cache.match(cacheKey);
            if (cached) return cached;
        }

        let response;
        const processStreamResponse = async (type, id, config) => {
            try {
                let decodedId = id;
                try { decodedId = decodeURIComponent(id); } catch { /* Keep the route ID if it is already decoded. */ }
                const data = await handleStream(request, type, decodedId, config, proxyBase, tmdbApiKey);
                if (!data.streams?.length || (data.streams[0].name || '').includes('Error')) return jsonResponse(data);
                // Provider links can expire; avoid caching signed stream URLs for hours.
                return jsonResponse(data, 200, 300);
            } catch (error) {
                console.error('Stream processing failed:', error?.message || error);
                return jsonResponse({ streams: [] });
            }
        };

        if (path === '/manifest.json') {
            response = jsonResponse(buildManifest({}), 200, 86400);
        } else {
            const noConfig = path.match(/^\/stream\/(movie|series)\/(.+)\.json$/);
            if (noConfig) response = await processStreamResponse(noConfig[1], noConfig[2], {});
        }

        if (!response) {
            const match = path.match(/^\/([^/]+)\/(configure|manifest\.json|stream\/(movie|series)\/(.+)\.json)$/);
            if (match) {
                const [, encoded, subpath, type, id] = match;
                let config = {};
                try { config = decodeConfig(encoded); } catch (error) { console.error('Config decode failed:', error?.message || error); }
                if (subpath === 'configure') return htmlResponse();
                if (subpath === 'manifest.json') response = jsonResponse(buildManifest(config), 200, 86400);
                else response = await processStreamResponse(type, id, config);
            }
        }

        if (!response) return new Response('Not found', { status: 404 });
        const cacheControl = response.headers.get('cache-control') || '';
        if (response.status === 200 && cacheControl.includes('max-age')) {
            ctx.waitUntil(cache.put(cacheKey, response.clone()));
        }
        return response;
    },
};
