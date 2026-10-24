export async function handleProxy(request, env) {
    if (request.method === 'OPTIONS') {
        return new Response(null, {
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
                'Access-Control-Allow-Headers': request.headers.get('Access-Control-Request-Headers') || '*',
                'Access-Control-Max-Age': '86400',
            },
        });
    }

    if (request.method !== 'GET' && request.method !== 'HEAD') {
        return new Response('Method not allowed', { status: 405 });
    }

    const requestUrl = new URL(request.url);
    const target = requestUrl.searchParams.get('url');
    if (!target) return new Response('Missing target URL', { status: 400 });

    let targetUrl;
    try {
        targetUrl = new URL(target);
        if (targetUrl.protocol !== 'https:') throw new Error('HTTPS required');
    } catch {
        return new Response('Invalid target URL; HTTPS is required', { status: 400 });
    }

    const allowList = String(env.ALLOWED_ORIGINS || '').split(',').map(v => v.trim().toLowerCase()).filter(Boolean);
    if (!allowList.length) {
        return new Response('Proxy is disabled until ALLOWED_ORIGINS contains approved target hostnames', { status: 503 });
    }
    if (!allowList.includes(targetUrl.hostname.toLowerCase())) {
        return new Response('Target host not allowed', { status: 403 });
    }

    const upstreamHeaders = new Headers();
    if (request.headers.has('range')) upstreamHeaders.set('range', request.headers.get('range'));
    if (request.headers.has('if-range')) upstreamHeaders.set('if-range', request.headers.get('if-range'));
    upstreamHeaders.set('user-agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36');
    upstreamHeaders.set('accept-encoding', 'identity');

    let upstreamUrl = targetUrl;
    let response;
    for (let redirectCount = 0; redirectCount <= 5; redirectCount++) {
        response = await fetch(upstreamUrl.toString(), {
            method: request.method,
            headers: upstreamHeaders,
            redirect: 'manual',
        });
        if (![301, 302, 303, 307, 308].includes(response.status)) break;
        const location = response.headers.get('location');
        if (!location || redirectCount === 5) return new Response('Upstream redirect could not be followed', { status: 502 });
        let nextUrl;
        try { nextUrl = new URL(location, upstreamUrl); } catch { return new Response('Invalid upstream redirect', { status: 502 }); }
        if (nextUrl.protocol !== 'https:' || !allowList.includes(nextUrl.hostname.toLowerCase())) {
            return new Response('Upstream redirect target not allowed', { status: 403 });
        }
        upstreamUrl = nextUrl;
    }

    const clientHeaders = new Headers(response.headers);
    clientHeaders.set('access-control-allow-origin', '*');
    clientHeaders.set('access-control-expose-headers', 'Content-Length, Content-Range, Accept-Ranges, Content-Type');
    const contentType = (response.headers.get('content-type') || '').toLowerCase();
    const isM3U8 = upstreamUrl.pathname.includes('.m3u8') || contentType.includes('mpegurl') || contentType.includes('apple.mpegurl');

    if (isM3U8) {
        clientHeaders.set('content-type', 'application/vnd.apple.mpegurl');
        clientHeaders.delete('content-disposition');
        clientHeaders.delete('content-length');
        if (request.method === 'HEAD') {
            return new Response(null, { status: response.status, statusText: response.statusText, headers: clientHeaders });
        }

        let text = await response.text();
        text = text.replace(/URI="(.*?)"/g, (match, value) => {
            let absolute;
            try { absolute = new URL(value, upstreamUrl).toString(); } catch { return match; }
            if (!isAllowedUrl(absolute, allowList)) return match;
            const ext = absolute.includes('.m3u8') ? '.m3u8' : (absolute.includes('.ts') ? '.ts' : '');
            return `URI="${requestUrl.origin}/proxy/hls${ext}?url=${encodeURIComponent(absolute)}"`;
        });
        const lines = text.split('\n').map(line => {
            const trimmed = line.trim();
            if (!trimmed || trimmed.startsWith('#')) return line;
            let absolute;
            try { absolute = new URL(trimmed, upstreamUrl).toString(); } catch { return line; }
            if (!isAllowedUrl(absolute, allowList)) return line;
            const ext = absolute.includes('.m3u8') ? '.m3u8' : (absolute.includes('.ts') ? '.ts' : '');
            return `${requestUrl.origin}/proxy/hls${ext}?url=${encodeURIComponent(absolute)}`;
        });
        return new Response(lines.join('\n'), { status: response.status, statusText: response.statusText, headers: clientHeaders });
    }

    if (!clientHeaders.has('accept-ranges')) clientHeaders.set('accept-ranges', 'bytes');
    if (!clientHeaders.has('content-type')) {
        clientHeaders.set('content-type', upstreamUrl.pathname.includes('.ts') ? 'video/mp2t' : 'video/mp4');
    }
    if (!upstreamUrl.pathname.includes('.ts')) {
        const filename = encodeURIComponent(upstreamUrl.pathname.split('/').pop() || 'video.mp4');
        clientHeaders.set('content-disposition', `inline; filename="${filename}"`);
    } else {
        clientHeaders.delete('content-disposition');
    }

    return new Response(request.method === 'HEAD' ? null : response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: clientHeaders,
    });
}

function isAllowedUrl(value, allowList) {
    try {
        const url = new URL(value);
        return url.protocol === 'https:' && allowList.includes(url.hostname.toLowerCase());
    } catch {
        return false;
    }
}
