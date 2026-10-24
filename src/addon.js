import { convertImdbToTmdb, getStreamsFromTmdbId, getBestCookie } from './febbox.js';

const MANIFEST = {
    id: 'org.showbox.addon',
    version: '3.6.0',
    name: 'ShowBox',
    description: 'ShowBox — unofficial Stremio addon for FebBox streams.',
    logo: 'https://raw.githubusercontent.com/adarsh0s/Showbox/refs/heads/main/src/icon.png',
    resources: ['stream'],
    types: ['movie', 'series'],
    catalogs: [],
    behaviorHints: { configurable: true, configurationRequired: true },
};

const REGIONS = {
    Auto: '🌍', USA7: '🇺🇸', USA6: '🇺🇸', USA5: '🇺🇸', UK3: '🇬🇧',
    CA1: '🇨🇦', FR1: '🇫🇷', DE2: '🇩🇪', HK1: '🇭🇰', IN1: '🇮🇳', AU1: '🇦🇺', SZ: '🇨🇳',
};

export function buildManifest(config) {
    const manifest = JSON.parse(JSON.stringify(MANIFEST));
    if (config?.showboxRegion) manifest.name = `ShowBox (${config.showboxRegion})`;
    if (config && Object.keys(config).length) manifest.behaviorHints = { configurable: true, configurationRequired: false };
    return manifest;
}

export async function handleStream(request, type, id, config, proxyBase, tmdbApiKey) {
    if (config.enableShowbox === false) return { streams: [] };

    const cookies = config.showboxCookies || [];
    if (!cookies.length) {
        return { streams: [{ name: 'Setup Required', title: 'No FebBox token configured. Open the add-on configuration page.', url: 'https://example.invalid/setup-required' }] };
    }

    const activeCookieData = await getBestCookie(cookies);
    if (activeCookieData.remaining !== undefined && activeCookieData.remaining <= 0) {
        return { streams: [{ name: 'Quota Exceeded', title: 'All configured FebBox accounts have reached their limits.', url: 'https://example.invalid/quota-exceeded' }] };
    }

    let normalizedId = String(id ?? '');
    try { normalizedId = decodeURIComponent(normalizedId); } catch { /* The ID may already be decoded. */ }
    const parts = normalizedId.split(':');
    const imdbId = parts[0];
    const season = type === 'series' && parts.length >= 3 ? Number(parts[1]) : null;
    const episode = type === 'series' && parts.length >= 3 ? Number(parts[2]) : null;
    if (!imdbId || (type === 'series' && (!Number.isInteger(season) || !Number.isInteger(episode) || season < 0 || episode < 0))) {
        return { streams: [] };
    }

    const tmdbType = type === 'series' ? 'tv' : 'movie';
    const meta = await convertImdbToTmdb(imdbId, tmdbType, tmdbApiKey) ||
        { tmdbId: imdbId, tmdbType, title: '', year: '' };
    if (!meta.title) return { streams: [] };

    let region = config.showboxRegion || 'Auto';
    const displayRegion = region;
    if (region === 'Auto') {
        const country = (request.cf?.country || 'US').toUpperCase();
        const map = { US: 'USA7', CA: 'CA1', GB: 'UK3', FR: 'FR1', DE: 'DE2', IN: 'IN1', HK: 'HK1', AU: 'AU1', CN: 'SZ' };
        region = map[country] || 'USA7';
    }

    const data = await getStreamsFromTmdbId(meta.tmdbType, meta, season, episode, region, activeCookieData.cookie, tmdbApiKey);
    if (!data?.versions) return { streams: [] };

    let streams = [];
    data.versions.forEach(version => {
        (version.links || []).forEach(link => {
            if (!link.url) return;
            const qualityText = String(link.quality || link.name || version.name || '').toLowerCase();
            const isOrg = qualityText.includes('org') || qualityText.includes('original');
            let resolution = 'Unknown';
            if (qualityText.includes('2160') || qualityText.includes('4k')) resolution = '4K';
            else if (qualityText.includes('1080')) resolution = '1080p';
            else if (qualityText.includes('720')) resolution = '720p';
            else if (qualityText.includes('480')) resolution = '480p';
            else if (qualityText.includes('360')) resolution = '360p';
            else if (isOrg) resolution = 'ORG';

            let qualityLabel = resolution;
            if (isOrg && resolution !== 'ORG' && resolution !== 'Unknown') qualityLabel = `${resolution} ORG`;
            if (config.sbExcludeDV && String(version.name).toLowerCase().includes('dv')) return;
            if (config.sbExcludeHDR && String(version.name).toLowerCase().includes('hdr')) return;

            if (config.sbMinQuality && config.sbMinQuality !== 'all') {
                const qualityMap = { ORG: 0, '360p': 360, '480p': 480, '720p': 720, '1080p': 1080, '4K': 2160 };
                if ((qualityMap[resolution] ?? 0) < (qualityMap[config.sbMinQuality] ?? 0)) return;
            }

            let finalUrl = link.url;
            if (config.useProxy === true) {
                const base = (config.customProxyUrl || proxyBase).replace(/\/$/, '');
                const safeName = encodeURIComponent(version.name || 'video.mp4');
                finalUrl = `${base}/proxy/${safeName}?url=${encodeURIComponent(link.url)}`;
            }

            streams.push({
                name: `ShowBox ${REGIONS[displayRegion] || ''} · ${qualityLabel}`,
                title: `${meta.title} ${meta.year ? `(${meta.year})` : ''}\n${version.name}\nSize: ${link.size || version.size || 'Unknown'}`,
                url: finalUrl,
                behaviorHints: { notWebReady: true },
                _resolution: resolution,
                _original: isOrg,
                _sizeGB: parseSizeGB(link.size || version.size || ''),
            });
        });
    });

    streams.sort((a, b) => {
        const rank = (resolution, original) => {
            const base = ({ '4K': 80, '1080p': 60, '720p': 40, '480p': 30, '360p': 20, ORG: 90 })[resolution] || 0;
            return base + (original ? 5 : 0);
        };
        const rankDiff = rank(b._resolution, b._original) - rank(a._resolution, a._original);
        return rankDiff || b._sizeGB - a._sizeGB;
    });

    streams = streams.map(stream => {
        delete stream._resolution;
        delete stream._original;
        delete stream._sizeGB;
        return stream;
    });
    return { streams };
}

function parseSizeGB(size) {
    if (!size) return 0;
    const match = String(size).toLowerCase().match(/([\d.]+)\s*(gb|mb|kb|b)/i);
    if (!match) return 0;
    const value = parseFloat(match[1]);
    if (match[2] === 'gb') return value;
    if (match[2] === 'mb') return value / 1024;
    if (match[2] === 'kb') return value / (1024 * 1024);
    return 0;
}
