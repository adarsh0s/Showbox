import CryptoJS from 'crypto-js';
import { customAlphabet } from 'nanoid';

const nanoid = customAlphabet('0123456789abcdef', 32);
const MAX_ATTEMPTS = 4;
const RETRYABLE_STATUS = new Set([408, 425, 429, 500, 502, 503, 504]);
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

function retryDelay(response, attempt) {
    const header = response?.headers?.get('retry-after');
    if (header) {
        const seconds = Number(header);
        const dateDelay = Number.isFinite(seconds) ? seconds * 1000 : Date.parse(header) - Date.now();
        if (Number.isFinite(dateDelay) && dateDelay > 0) return Math.min(dateDelay, 30000);
    }
    return Math.min(700 * (2 ** (attempt - 1)), 5000) + Math.floor(Math.random() * 250);
}

async function fetchWithRetry(url, options, label) {
    const { timeoutMs = 20000, ...requestOptions } = options;
    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
        let response;
        try {
            response = await fetch(url, { ...requestOptions, signal: AbortSignal.timeout(timeoutMs) });
        } catch (error) {
            if (attempt === MAX_ATTEMPTS) throw new Error(`${label} failed after ${MAX_ATTEMPTS} attempts: ${error?.message || error}`);
            await sleep(Math.min(700 * (2 ** (attempt - 1)), 5000) + Math.floor(Math.random() * 250));
            continue;
        }
        if (response.ok) return response;
        if (RETRYABLE_STATUS.has(response.status) && attempt < MAX_ATTEMPTS) {
            await sleep(retryDelay(response, attempt));
            continue;
        }
        throw new Error(`${label} failed: HTTP ${response.status}`);
    }
    throw new Error(`${label} failed`);
}

const CONFIG = {
    BASE_URL: 'https://mbpapi.shegu.net/api/api_client/index/',
    APP_KEY: 'moviebox',
    APP_ID: 'com.tdo.showbox',
    IV: 'wEiphTn!',
    KEY: '123d6cedf626dy54233aa1w6',
    DEFAULTS: {
        CHILD_MODE: '0', APP_VERSION: '11.5', LANG: 'en',
        PLATFORM: 'android', CHANNEL: 'Website', APPID: '27',
        VERSION: '129', MEDIUM: 'Website',
    },
};

export default class ShowboxAPI {
    encrypt(data) {
        return CryptoJS.TripleDES.encrypt(
            data, CryptoJS.enc.Utf8.parse(CONFIG.KEY), { iv: CryptoJS.enc.Utf8.parse(CONFIG.IV) }
        ).toString();
    }

    generateVerify(encryptedData) {
        return CryptoJS.MD5(CryptoJS.MD5(CONFIG.APP_KEY).toString() + CONFIG.KEY + encryptedData).toString();
    }

    async request(module, params = {}) {
        const requestData = {
            ...CONFIG.DEFAULTS,
            expired_date: Math.floor(Date.now() / 1000 + 60 * 60 * 12),
            module, ...params,
        };

        const encryptedData = this.encrypt(JSON.stringify(requestData));
        const body = JSON.stringify({
            app_key: CryptoJS.MD5(CONFIG.APP_KEY).toString(),
            verify: this.generateVerify(encryptedData),
            encrypt_data: encryptedData,
        });

        const formData = new URLSearchParams({
            data: btoa(body),
            appid: CONFIG.DEFAULTS.APPID, platform: CONFIG.DEFAULTS.PLATFORM,
            version: CONFIG.DEFAULTS.VERSION, medium: CONFIG.DEFAULTS.MEDIUM,
        });

        const response = await fetchWithRetry(CONFIG.BASE_URL, {
            method: 'POST',
            headers: {
                'Platform': CONFIG.DEFAULTS.PLATFORM,
                'Content-Type': 'application/x-www-form-urlencoded',
                'User-Agent': 'okhttp/3.2.0',
            },
            body: `${formData.toString()}&token${nanoid()}`,
            timeoutMs: 20000,
        }, 'ShowBox API');
        return response.json();
    }

    async search(title, type = 'all', page = 1, pagelimit = 20) {
        const data = await this.request('Search5', { page, type, keyword: title, pagelimit });
        return data?.data || [];
    }

    async getFebBoxId(id, type) {
        const url = `https://showbox.media/index/share_link?id=${encodeURIComponent(id)}&type=${encodeURIComponent(type)}`;
        const response = await fetchWithRetry(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0',
                'Accept': 'application/json, text/plain, */*',
                'Referer': 'https://showbox.media/',
                'X-Requested-With': 'XMLHttpRequest',
            },
            timeoutMs: 20000,
        }, 'ShowBox share-link lookup');
        const data = await response.json();
        return data?.code === 1 && data?.data?.link ? data.data.link.split('/').filter(Boolean).pop() : null;
    }
}
