const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
const RETRYABLE_STATUS = new Set([408, 425, 429, 500, 502, 503, 504]);
const MAX_ATTEMPTS = 4;
const MIN_REQUEST_INTERVAL_MS = 300;

function retryDelay(response, attempt) {
    const header = response?.headers?.get('retry-after');
    if (header) {
        const seconds = Number(header);
        const dateDelay = Number.isFinite(seconds) ? seconds * 1000 : Date.parse(header) - Date.now();
        if (Number.isFinite(dateDelay) && dateDelay > 0) return Math.min(dateDelay, 30000);
    }
    return Math.min(750 * (2 ** (attempt - 1)), 6000) + Math.floor(Math.random() * 250);
}

export default class FebboxAPI {
    constructor() {
        this.baseUrl = 'https://www.febbox.com';
        this.lastRequestAt = 0;
        this.headers = {
            'x-requested-with': 'XMLHttpRequest',
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
            'accept': 'application/json, text/plain, */*',
        };
    }

    _setAuthCookie(cookie) {
        if (cookie) this.headers.cookie = `ui=${cookie.trim().replace(/^ui=/, '')}`;
        return this;
    }

    async _fetchJson(url) {
        let lastError;
        for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
            const waitMs = Math.max(0, this.lastRequestAt + MIN_REQUEST_INTERVAL_MS - Date.now());
            if (waitMs) await sleep(waitMs);
            this.lastRequestAt = Date.now();

            let response;
            try {
                response = await fetch(url, { headers: this.headers, signal: AbortSignal.timeout(20000) });
            } catch (error) {
                lastError = error;
                if (attempt < MAX_ATTEMPTS) {
                    await sleep(Math.min(750 * (2 ** (attempt - 1)), 6000) + Math.floor(Math.random() * 250));
                    continue;
                }
                throw new Error(`FebBox network request failed after ${MAX_ATTEMPTS} attempts: ${error?.message || error}`);
            }

            if (!response.ok) {
                const status = response.status;
                if (RETRYABLE_STATUS.has(status) && attempt < MAX_ATTEMPTS) {
                    await sleep(retryDelay(response, attempt));
                    continue;
                }
                const body = (await response.text().catch(() => '')).slice(0, 180).replace(/\s+/g, ' ');
                throw new Error(`FebBox request failed: HTTP ${status}${body ? ` (${body})` : ''}`);
            }

            const contentType = (response.headers.get('content-type') || '').toLowerCase();
            if (contentType.includes('text/html')) {
                throw new Error('FebBox returned HTML instead of JSON; the request may be blocked by an upstream challenge.');
            }
            try {
                return await response.json();
            } catch (error) {
                throw new Error(`FebBox returned invalid JSON: ${error?.message || error}`);
            }
        }
        throw lastError || new Error('FebBox request failed');
    }

    async getFileList(shareKey, parentId = 0) {
        const url = `${this.baseUrl}/file/file_share_list?share_key=${encodeURIComponent(shareKey)}&pwd=&parent_id=${encodeURIComponent(parentId)}&is_html=0`;
        this.headers.referer = `${this.baseUrl}/share/${shareKey}`;
        const data = await this._fetchJson(url);
        if (data?.code !== 1 || !Array.isArray(data?.data?.file_list)) return [];
        return data.data.file_list;
    }

    async getLinks(shareKey, fid) {
        const url = `${this.baseUrl}/console/video_quality_list?fid=${encodeURIComponent(fid)}`;
        this.headers.referer = `${this.baseUrl}/share/${shareKey}`;
        const data = await this._fetchJson(url);
        if (!data?.html || typeof data.html !== 'string') return [];

        const results = [];
        const blocks = data.html.split('class="file_quality"');
        const stripTags = (str) => str ? str.replace(/<[^>]*>?/gm, '').replace(/\s+/g, ' ').trim() : '';

        for (let i = 1; i < blocks.length; i++) {
            const block = blocks[i];
            const urlMatch = block.match(/data-url="([^"]+)"/);
            const qualityMatch = block.match(/data-quality="([^"]+)"/);
            const nameMatch = block.match(/class="name"[^>]*>([\s\S]*?)<\/div>/);
            const speedMatch = block.match(/class="speed"[^>]*>[\s\S]*?<span>([\s\S]*?)<\/span>/);
            const sizeMatch = block.match(/class="size"[^>]*>([\s\S]*?)<\/div>/);

            if (urlMatch) {
                results.push({
                    url: urlMatch[1].replace(/&amp;/g, '&'),
                    quality: qualityMatch ? qualityMatch[1] : 'Unknown',
                    name: stripTags(nameMatch ? nameMatch[1] : ''),
                    speed: stripTags(speedMatch ? speedMatch[1] : ''),
                    size: stripTags(sizeMatch ? sizeMatch[1] : '')
                });
            }
        }
        return results;
    }
}
