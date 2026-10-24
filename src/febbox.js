import ShowboxAPI from './ShowboxAPI.js';
import FebboxAPI from './FebBoxApi.js';

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const FEBBOX_HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    'X-Requested-With': 'XMLHttpRequest',
    'Accept': 'application/json, text/plain, */*',
    'Referer': 'https://www.febbox.com/',
};
const VIDEO_EXTENSIONS = /\.(mp4|mkv|avi|mov|m4v|webm|ts|m3u8|wmv|flv|mpg|mpeg|3gp)$/i;
const MAX_FOLDER_DEPTH = 6;
const MAX_VIDEO_FILES = 500;

function normalizeCookie(cookie) {
    const value = String(cookie || '').trim().replace(/^ui=/, '');
    return value ? `ui=${value}` : '';
}

function normalizeId(id) {
    let value = String(id ?? '');
    try { value = decodeURIComponent(value); } catch { /* Keep the original ID if it is not valid URI encoding. */ }
    return value;
}

export async function convertImdbToTmdb(imdbId, expectedType, apiKey) {
    const normalizedId = normalizeId(imdbId).split(':')[0];
    if (!normalizedId.startsWith('tt') || !apiKey) return null;
    try {
        const resp = await fetch(`${TMDB_BASE_URL}/find/${encodeURIComponent(normalizedId)}?api_key=${encodeURIComponent(apiKey)}&external_source=imdb_id`, {
            signal: AbortSignal.timeout(12000),
        });
        if (!resp.ok) return null;
        const data = await resp.json();
        const results = expectedType === 'tv' ? (data.tv_results || []) : (data.movie_results || []);
        if (results.length) {
            const r = results[0];
            return {
                tmdbId: String(r.id),
                tmdbType: expectedType,
                title: r.title || r.name || r.original_title || r.original_name || '',
                year: (r.release_date || r.first_air_date || '').slice(0, 4),
            };
        }
    } catch (e) {
        console.error('TMDB lookup failed:', e?.message || e);
    }
    return null;
}

function isDirectory(file) {
    return Number(file?.is_dir) === 1 || file?.is_dir === true;
}

function seasonFromPath(path) {
    const parts = String(path || '').split('/').slice(0, -1);
    for (const part of parts) {
        let match = part.match(/\bseason\s*0*(\d{1,2})\b/i);
        if (!match) match = part.match(/^s\s*0*(\d{1,2})$/i);
        if (match) return Number(match[1]);
    }
    return null;
}

function collectEpisodeNumbers(fileName) {
    const name = String(fileName || '');
    const result = [];
    let match;
    const seasonEpisode = /\bs\s*0*(\d{1,2})[ ._-]*e\s*0*(\d{1,3})\b/ig;
    while ((match = seasonEpisode.exec(name))) result.push({ season: Number(match[1]), episode: Number(match[2]), explicitSeason: true });
    const xPattern = /\b(\d{1,2})\s*x\s*(\d{1,3})\b/ig;
    while ((match = xPattern.exec(name))) result.push({ season: Number(match[1]), episode: Number(match[2]), explicitSeason: true });
    const named = /\bseason\s*0*(\d{1,2})\D{0,12}(?:episode|ep)\s*0*(\d{1,3})\b/ig;
    while ((match = named.exec(name))) result.push({ season: Number(match[1]), episode: Number(match[2]), explicitSeason: true });
    const episodeOnly = /(?:^|[\s._()[\]-])(?:episode|ep|e)\s*0*(\d{1,3})(?=$|[\s._()[\]-])/ig;
    while ((match = episodeOnly.exec(name))) result.push({ season: null, episode: Number(match[1]), explicitSeason: false });
    return result;
}

function chooseEpisodeFile(files, seasonNum, episodeNum) {
    const strict = [];
    const contextual = [];
    const episodeOnly = [];
    for (const file of files) {
        const name = String(file.file_name || '');
        const numbers = collectEpisodeNumbers(name);
        const pathSeason = seasonFromPath(file._path);
        for (const item of numbers) {
            if (item.explicitSeason) {
                if (item.season === seasonNum && item.episode === episodeNum) strict.push(file);
                continue;
            }
            if (item.episode !== episodeNum) continue;
            if (pathSeason === seasonNum) contextual.push(file);
            else if (pathSeason === null) episodeOnly.push(file);
        }
    }
    return strict[0] || contextual[0] || (seasonNum === 1 ? episodeOnly[0] : null) || null;
}

async function collectVideos(febboxAPI, shareKey, parentId = 0, depth = 0, parentPath = '', state = { seen: new Set(), files: [] }) {
    if (depth > MAX_FOLDER_DEPTH || state.files.length >= MAX_VIDEO_FILES) return state.files;
    const parentKey = String(parentId);
    if (state.seen.has(parentKey)) return state.files;
    state.seen.add(parentKey);

    let entries;
    try {
        entries = await febboxAPI.getFileList(shareKey, parentId);
    } catch (error) {
        if (depth === 0) throw error;
        console.warn(`Skipping inaccessible FebBox folder ${parentKey}: ${error?.message || error}`);
        return state.files;
    }

    for (const entry of entries) {
        if (state.files.length >= MAX_VIDEO_FILES) break;
        const name = String(entry.file_name || entry.name || '');
        const path = parentPath ? `${parentPath}/${name}` : name;
        if (isDirectory(entry)) {
            if (entry.fid !== undefined && entry.fid !== null) {
                await collectVideos(febboxAPI, shareKey, entry.fid, depth + 1, path, state);
            }
        } else if (VIDEO_EXTENSIONS.test(name)) {
            state.files.push({ ...entry, file_name: name, _path: path });
        }
    }
    return state.files;
}

export async function getStreamsFromTmdbId(tmdbType, meta, seasonNum, episodeNum, regionPreference, cookieStr, tmdbApiKey) {
    const showboxAPI = new ShowboxAPI();
    const febboxAPI = new FebboxAPI();
    const normalizedCookie = normalizeCookie(cookieStr);
    if (normalizedCookie) febboxAPI._setAuthCookie(normalizedCookie);

    try {
        if (!meta?.title) return { versions: [] };
        if (tmdbType === 'tv' && (!Number.isInteger(Number(seasonNum)) || !Number.isInteger(Number(episodeNum)) || Number(seasonNum) < 0 || Number(episodeNum) < 0)) {
            return { versions: [] };
        }

        const showboxResults = await showboxAPI.search(meta.title, tmdbType === 'tv' ? 'tv' : 'movie');
        if (!showboxResults?.length) return { versions: [] };

        const normalizeTitle = (value) => String(value || '').trim().toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ');
        const expectedTitle = normalizeTitle(meta.title);
        const expectedYear = String(meta.year || '');
        const kindOf = (item) => {
            const value = String(item?.box_type ?? item?.type ?? item?.media_type ?? '').trim().toLowerCase();
            if (['2', 'tv', 'series', 'show'].includes(value)) return 'tv';
            if (['1', 'movie', 'film'].includes(value)) return 'movie';
            return null;
        };
        const sameKind = showboxResults.filter(item => !kindOf(item) || kindOf(item) === tmdbType);
        const candidates = sameKind.length ? sameKind : showboxResults;
        let showboxItem = candidates.find(item => normalizeTitle(item.title) === expectedTitle && String(item.year || '') === expectedYear);
        if (!showboxItem) showboxItem = candidates.find(item => normalizeTitle(item.title) === expectedTitle) || candidates[0];
        if (!showboxItem?.id) return { versions: [] };

        const febBoxId = await showboxAPI.getFebBoxId(showboxItem.id, showboxItem.box_type ?? (tmdbType === 'tv' ? '2' : '1'));
        if (!febBoxId) return { versions: [] };

        const files = await collectVideos(febboxAPI, febBoxId);
        if (!files.length) return { versions: [] };

        let targetFile;
        if (tmdbType === 'movie') {
            targetFile = files.find(file => /\.(mp4|mkv|avi|mov|m4v|webm|ts|wmv|flv|mpg|mpeg|3gp)$/i.test(file.file_name)) || files[0];
        } else {
            targetFile = chooseEpisodeFile(files, Number(seasonNum), Number(episodeNum));
        }
        if (!targetFile?.fid) return { versions: [] };

        const links = await febboxAPI.getLinks(febBoxId, targetFile.fid);
        return links?.length ? { versions: [{ name: targetFile.file_name || meta.title, links }] } : { versions: [] };
    } catch (e) {
        console.error('FebBox stream lookup failed:', e?.message || e);
        return { versions: [] };
    }
}

export async function getBestCookie(cookies) {
    if (!Array.isArray(cookies) || !cookies.length) return { cookie: null };
    if (cookies.length === 1) return { cookie: normalizeCookie(cookies[0]), remaining: undefined };

    const checks = await Promise.all(cookies.map(async (cookie) => {
        const reqCookie = normalizeCookie(cookie);
        try {
            const resp = await fetch('https://www.febbox.com/console/user_cards', {
                headers: { ...FEBBOX_HEADERS, Cookie: reqCookie },
                signal: AbortSignal.timeout(12000),
            });
            if (!resp.ok) return { cookie: reqCookie, remaining: undefined, ok: false };
            const data = await resp.json();
            const flow = data?.data?.flow;
            if (data?.code === 1 && flow && typeof flow.traffic_limit_mb === 'number' && typeof flow.traffic_usage_mb === 'number') {
                return { cookie: reqCookie, remaining: flow.traffic_limit_mb - flow.traffic_usage_mb, ok: true };
            }
            return { cookie: reqCookie, remaining: undefined, ok: false };
        } catch {
            return { cookie: reqCookie, remaining: undefined, ok: false };
        }
    }));

    const valid = checks.filter(c => c.ok && c.remaining !== undefined);
    if (!valid.length) return { cookie: normalizeCookie(cookies[0]), remaining: undefined };
    valid.sort((a, b) => b.remaining - a.remaining);
    return valid[0];
}

export async function handleValidateCookie(request) {
    try {
        const body = await request.json();
        const reqCookie = normalizeCookie(body?.cookie);
        if (!reqCookie) return json({ isValid: false }, 400);
        const resp = await fetch('https://www.febbox.com/console/user_cards', {
            headers: { ...FEBBOX_HEADERS, Cookie: reqCookie },
            signal: AbortSignal.timeout(12000),
        });
        if (!resp.ok) return json({ isValid: false });
        const data = await resp.json();
        return json({ isValid: data?.code === 1 && !!data?.data?.flow });
    } catch {
        return json({ isValid: false });
    }
}

export async function handleFebboxFlow(request) {
    try {
        const body = await request.json();
        const reqCookie = normalizeCookie(body?.cookie);
        if (!reqCookie) return json({ ok: false }, 400);
        const resp = await fetch('https://www.febbox.com/console/user_cards', {
            headers: { ...FEBBOX_HEADERS, Cookie: reqCookie },
            signal: AbortSignal.timeout(12000),
        });
        if (!resp.ok) return json({ ok: false });
        const data = await resp.json();
        const flow = data?.code === 1 ? data?.data?.flow : null;
        return json({ ok: !!flow, flow: flow || null });
    } catch {
        return json({ ok: false });
    }
}

function json(data, status = 200) {
    return new Response(JSON.stringify(data), {
        status,
        headers: { 'content-type': 'application/json;charset=UTF-8', 'cache-control': 'no-store' },
    });
}
