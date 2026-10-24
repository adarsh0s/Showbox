export const CONFIG_HTML = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="theme-color" content="#0b0b12">
<title>ShowBox · Add-on setup</title>
<style>
:root{color-scheme:dark;--bg:#090a10;--panel:#11131d;--panel2:#171a27;--line:#292d40;--text:#f4f5fb;--muted:#9da3bb;--accent:#a78bfa;--accent2:#7c5cff;--good:#4ade80;--warn:#fbbf24;--bad:#fb7185;--radius:22px}
*{box-sizing:border-box}html{min-height:100%;background:var(--bg)}body{margin:0;background:radial-gradient(ellipse at 15% -10%,rgba(124,92,255,.22),transparent 42%),radial-gradient(ellipse at 95% 10%,rgba(45,212,191,.09),transparent 35%),var(--bg);color:var(--text);font:15px/1.55 Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;min-height:100vh;-webkit-font-smoothing:antialiased}
button,input,select{font:inherit}button,a,select,input{outline-color:var(--accent)}button{cursor:pointer}a{color:var(--accent)}
.shell{width:min(100% - 32px,980px);margin:0 auto;padding:34px 0 52px}.topbar{display:flex;justify-content:space-between;align-items:center;gap:16px;margin-bottom:34px}.brand{display:flex;align-items:center;gap:13px;font-weight:750;letter-spacing:-.035em;font-size:1.12rem}.brandmark{width:42px;height:42px;border-radius:14px;display:grid;place-items:center;background:linear-gradient(145deg,#b9a4ff,#7653ff);color:#100b22;box-shadow:0 8px 28px #7c5cff40}.brandmark svg{width:23px;height:23px}.pill{border:1px solid #34364b;border-radius:999px;padding:6px 11px;color:#c3c7d8;font-size:.76rem;display:flex;align-items:center;gap:7px;background:#11131dbb}.pulse{width:7px;height:7px;border-radius:50%;background:var(--good);box-shadow:0 0 12px #4ade8070}
.hero{margin-bottom:25px}.eyebrow{color:#b9a7ff;text-transform:uppercase;letter-spacing:.15em;font-size:.72rem;font-weight:800}.hero h1{font-size:clamp(2.1rem,5.8vw,3.65rem);line-height:1.04;letter-spacing:-.065em;margin:10px 0 13px;font-weight:800}.hero h1 span{background:linear-gradient(90deg,#c4b5fd,#7dd3fc);background-clip:text;-webkit-background-clip:text;color:transparent}.hero p{margin:0;color:var(--muted);max-width:620px;font-size:1rem}
.layout{display:grid;grid-template-columns:minmax(0,1.45fr) minmax(270px,.8fr);gap:18px;align-items:start}.stack{display:grid;gap:18px}.card{background:linear-gradient(150deg,#151725f5,#10121bf5);border:1px solid var(--line);border-radius:var(--radius);padding:24px;box-shadow:0 18px 55px #00000018}.cardhead{display:flex;gap:13px;align-items:flex-start;margin-bottom:20px}.step{width:36px;height:36px;flex:none;border-radius:12px;display:grid;place-items:center;background:#28203e;color:#cbbcff;font-weight:800}.card h2{font-size:1.04rem;letter-spacing:-.025em;margin:0 0 4px}.sub{color:var(--muted);font-size:.84rem;margin:0}.field{margin-top:17px}.labelrow{display:flex;justify-content:space-between;align-items:center;gap:12px;margin-bottom:8px}label{font-size:.84rem;font-weight:650;color:#e6e7f1}.hint{font-size:.76rem;color:var(--muted)}.inputrow{display:flex;gap:9px}.inputwrap{position:relative;flex:1;min-width:0}.inputwrap input{width:100%;padding:13px 14px 13px 39px}.dot{position:absolute;left:15px;top:50%;transform:translateY(-50%);width:8px;height:8px;border-radius:50%;background:#5c6177}.status-valid{background:var(--good);box-shadow:0 0 10px #4ade8060}.status-invalid{background:var(--bad)}.status-pending{background:var(--accent);animation:pulse 1s infinite}@keyframes pulse{50%{opacity:.35}}
input[type=text],input[type=password],select{width:100%;border:1px solid #30344a;background:#0d0f18;color:var(--text);border-radius:12px;padding:12px 13px;min-width:0;transition:border-color .18s,box-shadow .18s}input::placeholder{color:#70768f}input:focus,select:focus{border-color:#9278ff;box-shadow:0 0 0 3px #9278ff20}.btn{border:1px solid #353950;border-radius:12px;padding:11px 15px;background:#202337;color:#f1f0ff;font-weight:700;font-size:.84rem;transition:transform .15s,border-color .15s,background .15s;white-space:nowrap}.btn:hover{border-color:#7761c7;background:#282842}.btn:active{transform:scale(.98)}.btn:disabled{opacity:.42;cursor:not-allowed}.btn-primary{background:linear-gradient(135deg,#b6a0ff,#8b6bff);border-color:transparent;color:#140d2c;box-shadow:0 7px 22px #805bff25}.btn-primary:hover{background:linear-gradient(135deg,#c4b4ff,#a18aff)}.btn-ghost{background:transparent}.btn-danger{background:transparent;border-color:transparent;color:var(--bad);padding:6px 9px}.btn-full{width:100%;padding:14px 17px;font-size:.94rem}.btnrow{display:flex;gap:9px;margin-top:10px}.btnrow>*{flex:1}.quota{display:none;margin-top:15px;padding:14px;border:1px solid #2d3346;background:#0c1019;border-radius:14px}.quota.visible{display:block}.quota-top{display:flex;justify-content:space-between;gap:10px;font-size:.8rem;color:#dfe2f1}.bar{height:6px;border-radius:99px;background:#292d40;margin-top:10px;overflow:hidden}.barfill{height:100%;width:0;background:linear-gradient(90deg,#7c5cff,#5eead4);border-radius:99px;transition:width .3s}.barfill.low{background:var(--warn)}.barfill.empty{background:var(--bad)}
.divider{height:1px;background:var(--line);margin:22px 0}.badge{font-size:.66rem;letter-spacing:.07em;text-transform:uppercase;border-radius:6px;padding:3px 6px;background:#2a2342;color:#c8b9ff;font-weight:800}.cookie-list{display:grid;gap:8px;margin-top:12px}.cookie-card{display:flex;justify-content:space-between;align-items:center;gap:10px;padding:12px;border-radius:13px;background:#0d1019;border:1px solid #292d40}.cookie-title{font-size:.83rem;font-weight:700;display:flex;align-items:center;gap:8px}.cookie-hash{font: .72rem ui-monospace,SFMono-Regular,monospace;color:#8990aa}.cookie-sub{font-size:.75rem;color:var(--muted);margin-top:3px}.cookie-status{width:7px;height:7px;border-radius:50%;background:#5c6177;display:inline-block}.options{display:grid;grid-template-columns:1fr 1fr;gap:13px}.option{background:#0d0f18;border:1px solid #292d40;border-radius:15px;padding:14px}.option label{display:block;margin-bottom:9px}.toggleline{display:flex;justify-content:space-between;align-items:center;gap:14px}.toggle{appearance:none;width:43px;height:25px;border-radius:999px;background:#3a3e54;position:relative;cursor:pointer;transition:background .2s;flex:none}.toggle:before{content:"";position:absolute;width:19px;height:19px;border-radius:50%;left:3px;top:3px;background:white;transition:transform .2s}.toggle:checked{background:#9278ff}.toggle:checked:before{transform:translateX(18px)}.expandable{display:none;margin-top:14px}.expandable.open{display:block}.help-link{font-size:.78rem;text-decoration:none}.install-card{background:linear-gradient(145deg,#201b36,#141521 70%);border-color:#4b3d78}.install-card .step{background:#3a2d64;color:#ddd3ff}.manifest{font: .73rem/1.5 ui-monospace,SFMono-Regular,monospace;color:#aeb4ce;overflow-wrap:anywhere;background:#090b13;border:1px solid #2d3046;border-radius:12px;padding:13px;margin-top:13px;cursor:pointer}.manifest:hover{border-color:#8270ce}.fineprint{color:#7e849e;font-size:.76rem;margin-top:14px}.statusnote{color:var(--muted);font-size:.78rem;margin-top:9px;min-height:1.2em}.toast{position:fixed;z-index:20;bottom:24px;left:50%;transform:translate(-50%,20px);opacity:0;pointer-events:none;background:#f5f3ff;color:#19132c;padding:11px 17px;border-radius:12px;font-weight:750;font-size:.84rem;box-shadow:0 12px 35px #0008;transition:all .2s;max-width:calc(100% - 30px)}.toast.show{opacity:1;transform:translate(-50%,0)}.modal-overlay{display:none;position:fixed;inset:0;z-index:30;background:#05060bcc;backdrop-filter:blur(8px);padding:20px;align-items:center;justify-content:center}.modal-overlay.active{display:flex}.modal{width:min(100%,540px);background:#151725;border:1px solid #353950;border-radius:20px;padding:23px}.modalhead{display:flex;justify-content:space-between;align-items:center;margin-bottom:14px}.modal h2{margin:0}.modal pre{white-space:pre-wrap;overflow:auto;background:#090b13;padding:14px;border-radius:12px;color:#c5baff;font-size:.75rem}.footer{text-align:center;color:#666d87;font-size:.75rem;margin-top:22px}
@media(max-width:760px){.shell{width:min(100% - 22px,560px);padding-top:22px}.topbar{margin-bottom:27px}.pill{font-size:.68rem}.layout{grid-template-columns:1fr}.card{padding:19px;border-radius:19px}.hero h1{font-size:2.6rem}.options{gap:9px}.option{padding:12px}}
@media(max-width:420px){.brand{font-size:.98rem}.brandmark{width:37px;height:37px}.topbar{align-items:flex-start}.inputrow{flex-wrap:wrap}.inputrow .btn{flex:1}.options{grid-template-columns:1fr}.btnrow{flex-wrap:wrap}.btnrow>*{min-width:120px}}
</style>
</head>
<body>
<main class="shell">
  <header class="topbar">
    <div class="brand"><div class="brandmark" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none"><path d="M7 4.8a1.5 1.5 0 0 0-2.3 1.3v11.8a1.5 1.5 0 0 0 2.3 1.3l11-5.9a1.5 1.5 0 0 0 0-2.6L7 4.8Z" fill="currentColor"/></svg></div><span>ShowBox <span style="color:#9da3bb;font-weight:500">/ Stremio</span></span></div>
    <div class="pill"><span class="pulse"></span> Configuration center</div>
  </header>
  <section class="hero">
    <div class="eyebrow">Your streaming setup</div>
    <h1>Make it <span>yours.</span></h1>
    <p>Connect your FebBox account, tune playback preferences, and install the ShowBox add-on in Stremio.</p>
  </section>

  <div class="layout">
    <div class="stack">
      <section class="card">
        <div class="cardhead"><div class="step">01</div><div><h2>FebBox account</h2><p class="sub">Add your UI cookie to access your account's files.</p></div></div>
        <div class="field">
          <div class="labelrow"><label for="manualCookie">Primary UI cookie</label><span class="hint">Kept in this configuration URL</span></div>
          <div class="inputrow">
            <div class="inputwrap"><span class="dot" id="mainCookieStatus"></span><input type="password" id="manualCookie" autocomplete="off" spellcheck="false" placeholder="Paste FebBox UI cookie" oninput="resetCookieState()"></div>
            <button class="btn" type="button" onclick="toggleCookieVisibility()">Show</button>
            <button class="btn" type="button" onclick="validateMainCookie()">Validate</button>
          </div>
          <div class="btnrow"><button class="btn btn-primary" id="setCookieBtn" disabled onclick="setMainCookie()">Use primary cookie</button><button class="btn btn-ghost" id="overrideCookieBtn" onclick="overrideMainCookie()">Force apply</button></div>
          <div class="quota" id="mainCookieQuota"><div class="quota-top"><span id="quotaLabel">Account quota</span><span id="quotaPct"></span></div><div class="bar"><div class="barfill" id="quotaFill"></div></div></div>
          <div class="statusnote" id="cookieStatusNote" aria-live="polite">Your cookie is sent to FebBox only when you validate it.</div>
        </div>
        <div class="divider"></div>
        <div class="labelrow"><label>Fallback accounts</label><span class="badge">Load balancer</span></div>
        <p class="sub">Optional. Add extra cookies so ShowBox can prefer an account with more remaining traffic.</p>
        <div class="field"><div class="inputrow"><input type="password" id="multiCookieInput" autocomplete="off" spellcheck="false" placeholder="Add another UI cookie"><button class="btn" onclick="addMultiCookie()">Add account</button></div></div>
        <div class="btnrow"><button class="btn" onclick="validateAllCookies()">Validate all</button><button class="btn" onclick="applyMultiCookies()">Use fallback list</button></div>
        <div class="cookie-list" id="multiCookieList"></div>
      </section>

      <section class="card">
        <div class="cardhead"><div class="step">02</div><div><h2>Playback preferences</h2><p class="sub">Choose a preferred region, quality threshold, and optional proxy.</p></div></div>
        <div class="options">
          <div class="option"><label for="sbRegion">Server region</label><select id="sbRegion" class="auto-update">
            <option value="Auto">Auto detect</option><option value="USA7">USA · 7</option><option value="USA6">USA · 6</option><option value="USA5">USA · 5</option><option value="UK3">United Kingdom</option><option value="CA1">Canada</option><option value="FR1">France</option><option value="DE2">Germany</option><option value="HK1">Hong Kong</option><option value="IN1">India</option><option value="AU1">Australia</option><option value="SZ">China · SZ</option>
          </select></div>
          <div class="option"><label for="sbMinQuality">Minimum quality</label><select id="sbMinQuality" class="auto-update"><option value="all">Any available</option><option value="720p">720p or better</option><option value="1080p">1080p or better</option><option value="4K">4K only</option></select></div>
        </div>
        <div class="divider"></div>
        <div class="toggleline"><div><label for="useProxy">Stream proxy</label><p class="sub">Route playback through a Worker to improve client compatibility.</p></div><input type="checkbox" id="useProxy" class="toggle" onchange="toggleProxyOptions()"></div>
        <div id="proxyOptions" class="expandable">
          <div class="field"><div class="labelrow"><label for="proxyType">Proxy routing</label><a class="help-link" href="#" onclick="openGuide();return false">Setup guide</a></div><select id="proxyType" class="auto-update" onchange="toggleCustomProxy()"><option value="builtin">This ShowBox Worker</option><option value="custom">Custom Worker</option></select></div>
          <div class="field expandable" id="customProxyWrap"><label for="customProxyUrl">Custom Worker URL</label><input type="text" id="customProxyUrl" class="auto-update" placeholder="https://your-worker.workers.dev"></div>
        </div>
      </section>
    </div>

    <aside class="stack">
      <section class="card install-card">
        <div class="cardhead"><div class="step">03</div><div><h2>Install in Stremio</h2><p class="sub">Generate a personal manifest URL, then open it in Stremio.</p></div></div>
        <a href="#" id="installBtn" class="btn btn-primary btn-full">Install ShowBox</a>
        <button class="btn btn-full" style="margin-top:9px" onclick="copyManifest()">Copy manifest URL</button>
        <div class="manifest" id="manifestUrl" onclick="copyManifest()" title="Tap to copy">Preparing your manifest…</div>
        <p class="fineprint">Tap the URL to copy it. Your selected settings and cookie tokens are encoded into this URL.</p>
      </section>
      <section class="card">
        <div class="cardhead"><div class="step">i</div><div><h2>Before you start</h2><p class="sub">A few important details.</p></div></div>
        <p class="sub">• Validate the primary cookie before applying it.<br>• Keep your manifest URL private because it contains your configured token(s).<br>• If you replace or revoke a FebBox cookie, update the configuration and reinstall the add-on.</p>
        <div class="divider"></div>
        <div class="labelrow"><label>Service status</label><span class="badge">Unofficial</span></div>
        <p class="sub">ShowBox is an unofficial community add-on. Availability depends on upstream ShowBox and FebBox services.</p>
      </section>
    </aside>
  </div>
  <footer class="footer">ShowBox configuration · Settings are encoded in your personal manifest URL.</footer>
</main>

<div class="toast" id="toast" role="status" aria-live="polite">Done</div>
<div class="modal-overlay" id="guideModal" onclick="closeGuide(event)">
  <section class="modal" role="dialog" aria-modal="true" aria-labelledby="guideTitle">
    <div class="modalhead"><h2 id="guideTitle">Custom proxy setup</h2><button class="btn" onclick="closeGuide()">Close</button></div>
    <p class="sub">Deploy a compatible streaming proxy Worker, then choose “Custom Worker” and paste its URL. Use only a Worker you trust.</p>
    <pre>export default {
  async fetch(request) {
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": "*"
        }
      });
    }
    const url = new URL(request.url).searchParams.get("url");
    if (!url) return new Response("Add ?url=", { status: 400 });
    const target = new URL(url);
    if (!["http:", "https:"].includes(target.protocol)) {
      return new Response("Invalid URL", { status: 400 });
    }
    const upstream = await fetch(target, request);
    const response = new Response(upstream.body, upstream);
    response.headers.set("Access-Control-Allow-Origin", "*");
    return response;
  }
};</pre>
  </section>
</div>

<script>
let mainCookieFlow = null;
let nsMultiCookies = [];

function shortHash(str) {
  let h = 5381;
  for (let i = 0; i < str.length; i++) { h = ((h << 5) + h) + str.charCodeAt(i); h |= 0; }
  return (h >>> 0).toString(16).padStart(8, '0');
}
function showToast(message) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(window.__toastTimer);
  window.__toastTimer = setTimeout(() => toast.classList.remove('show'), 2800);
}
function toggleCookieVisibility() {
  const input = document.getElementById('manualCookie');
  const button = event.currentTarget;
  input.type = input.type === 'password' ? 'text' : 'password';
  button.textContent = input.type === 'password' ? 'Show' : 'Hide';
}
function toggleProxyOptions() {
  const wrap = document.getElementById('proxyOptions');
  document.getElementById('useProxy').checked ? wrap.classList.add('open') : wrap.classList.remove('open');
  generateManifest();
}
function toggleCustomProxy() {
  const wrap = document.getElementById('customProxyWrap');
  document.getElementById('proxyType').value === 'custom' ? wrap.classList.add('open') : wrap.classList.remove('open');
  generateManifest();
}
function openGuide() { document.getElementById('guideModal').classList.add('active'); }
function closeGuide(e) {
  if (!e || e.target.id === 'guideModal' || e.target.closest?.('button')) document.getElementById('guideModal').classList.remove('active');
}
function formatMB(value) {
  if (typeof value !== 'number' || Number.isNaN(value)) return 'N/A';
  const safe = Math.max(0, value);
  return safe >= 1024 ? (safe / 1024).toFixed(2) + ' GB' : safe.toFixed(2) + ' MB';
}
function resetCookieState() {
  document.getElementById('mainCookieStatus').className = 'dot';
  document.getElementById('setCookieBtn').disabled = true;
  mainCookieFlow = null;
  document.getElementById('mainCookieQuota').classList.remove('visible');
  document.getElementById('cookieStatusNote').textContent = 'Cookie changed. Validate it before applying.';
  generateManifest();
}
async function validateSingleCookie(cookieVal) {
  try {
    let response = await fetch('/api/febbox-flow', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ cookie: cookieVal }) });
    let result = await response.json();
    if (result?.ok && result.flow) return { valid: true, flow: result.flow };
    response = await fetch('/api/validate-cookie', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ cookie: cookieVal }) });
    result = await response.json();
    return result?.isValid ? { valid: true, flow: null } : { valid: false };
  } catch { return { valid: false }; }
}
async function validateMainCookie() {
  const value = document.getElementById('manualCookie').value.trim();
  if (!value) return showToast('Enter a FebBox cookie first.');
  const dot = document.getElementById('mainCookieStatus');
  dot.className = 'dot status-pending';
  document.getElementById('setCookieBtn').disabled = true;
  document.getElementById('mainCookieQuota').classList.remove('visible');
  document.getElementById('cookieStatusNote').textContent = 'Checking FebBox…';
  const result = await validateSingleCookie(value);
  if (result.valid) {
    dot.className = 'dot status-valid';
    document.getElementById('setCookieBtn').disabled = false;
    mainCookieFlow = result.flow;
    if (result.flow) showQuota(result.flow);
    document.getElementById('cookieStatusNote').textContent = 'Cookie validated. Apply it to include it in your manifest.';
    showToast('FebBox cookie validated.');
  } else {
    dot.className = 'dot status-invalid';
    document.getElementById('cookieStatusNote').textContent = 'Validation failed. Confirm the cookie is current and try again.';
    showToast('Cookie validation failed.');
  }
}
function showQuota(flow) {
  if (!flow || typeof flow.traffic_limit_mb !== 'number' || typeof flow.traffic_usage_mb !== 'number') return;
  const limit = flow.traffic_limit_mb;
  const remaining = Math.max(0, limit - flow.traffic_usage_mb);
  const percent = limit > 0 ? Math.round(remaining / limit * 100) : 100;
  document.getElementById('quotaLabel').textContent = limit > 0 ? formatMB(remaining) + ' remaining of ' + formatMB(limit) : 'No traffic limit reported';
  document.getElementById('quotaPct').textContent = limit > 0 ? percent + '% left' : 'Unlimited';
  const fill = document.getElementById('quotaFill');
  fill.style.width = percent + '%';
  fill.className = 'barfill' + (percent <= 10 ? ' empty' : percent <= 30 ? ' low' : '');
  document.getElementById('mainCookieQuota').classList.add('visible');
}
function setMainCookie() {
  if (!document.getElementById('manualCookie').value.trim()) return showToast('Enter a cookie first.');
  generateManifest();
  showToast('Primary cookie applied to manifest.');
}
function overrideMainCookie() {
  if (!document.getElementById('manualCookie').value.trim()) return showToast('Enter a cookie first.');
  document.getElementById('mainCookieStatus').className = 'dot status-valid';
  document.getElementById('setCookieBtn').disabled = false;
  document.getElementById('cookieStatusNote').textContent = 'Force applied without validation. If it is invalid, streams may not load.';
  generateManifest();
  showToast('Cookie force-applied.');
}
function addMultiCookie() {
  const input = document.getElementById('multiCookieInput');
  const value = input.value.trim();
  if (!value) return showToast('Enter a fallback cookie first.');
  if (!nsMultiCookies.some(item => item.value === value)) nsMultiCookies.push({ value, isValid: null, flow: null });
  input.value = '';
  renderMultiCookies();
  generateManifest();
}
function removeCookie(index) { nsMultiCookies.splice(index, 1); renderMultiCookies(); generateManifest(); }
async function validateAllCookies() {
  if (!nsMultiCookies.length) return showToast('Add a fallback account first.');
  showToast('Validating fallback cookies…');
  for (let i = 0; i < nsMultiCookies.length; i++) {
    const result = await validateSingleCookie(nsMultiCookies[i].value);
    nsMultiCookies[i].isValid = result.valid;
    nsMultiCookies[i].flow = result.flow || null;
    renderMultiCookies();
  }
  showToast('Fallback validation finished.');
}
function applyMultiCookies() {
  if (!nsMultiCookies.length) return showToast('Add a fallback account first.');
  generateManifest();
  showToast('Fallback list applied to manifest.');
}
function renderMultiCookies() {
  const list = document.getElementById('multiCookieList');
  list.replaceChildren();
  nsMultiCookies.forEach((item, index) => {
    const card = document.createElement('div');
    card.className = 'cookie-card';
    const info = document.createElement('div');
    const title = document.createElement('div');
    title.className = 'cookie-title';
    const dot = document.createElement('span');
    dot.className = 'cookie-status';
    if (item.isValid === true) dot.style.background = 'var(--good)';
    if (item.isValid === false) dot.style.background = 'var(--bad)';
    const label = document.createElement('span');
    label.textContent = 'Fallback account ' + (index + 1);
    const hash = document.createElement('span');
    hash.className = 'cookie-hash';
    hash.textContent = '#' + shortHash(item.value);
    title.append(dot, label, hash);
    const sub = document.createElement('div');
    sub.className = 'cookie-sub';
    const flow = item.flow;
    if (flow && typeof flow.traffic_limit_mb === 'number' && typeof flow.traffic_usage_mb === 'number') {
      sub.textContent = formatMB(Math.max(0, flow.traffic_limit_mb - flow.traffic_usage_mb)) + ' remaining';
    } else sub.textContent = item.isValid === true ? 'Validated' : item.isValid === false ? 'Validation failed' : 'Not validated';
    info.append(title, sub);
    const remove = document.createElement('button');
    remove.className = 'btn btn-danger';
    remove.type = 'button';
    remove.textContent = 'Remove';
    remove.onclick = () => removeCookie(index);
    card.append(info, remove);
    list.append(card);
  });
}
function generateManifest() {
  const cookie = document.getElementById('manualCookie').value.trim();
  const status = document.getElementById('mainCookieStatus').className;
  const cookies = [];
  let hasQuota = false;
  if (cookie && (status.includes('status-valid') || status.includes('status-override') || document.getElementById('cookieStatusNote').textContent.includes('Force applied'))) {
    cookies.push(cookie);
    if (mainCookieFlow && typeof mainCookieFlow.traffic_limit_mb === 'number' && typeof mainCookieFlow.traffic_usage_mb === 'number') {
      if (mainCookieFlow.traffic_limit_mb - mainCookieFlow.traffic_usage_mb > 0) hasQuota = true;
    } else hasQuota = true;
  }
  nsMultiCookies.forEach(item => {
    cookies.push(item.value);
    const flow = item.flow;
    if (flow && typeof flow.traffic_limit_mb === 'number' && typeof flow.traffic_usage_mb === 'number') {
      if (flow.traffic_limit_mb - flow.traffic_usage_mb > 0) hasQuota = true;
    } else if (item.isValid) hasQuota = true;
  });
  const config = {
    enableShowbox: true,
    showboxCookies: cookies,
    showboxRegion: document.getElementById('sbRegion').value,
    sbMinQuality: document.getElementById('sbMinQuality').value,
    useProxy: document.getElementById('useProxy').checked,
    customProxyUrl: document.getElementById('proxyType').value === 'custom' ? document.getElementById('customProxyUrl').value.trim() : '',
    showboxHasQuota: hasQuota
  };
  const encoded = btoa(unescape(encodeURIComponent(JSON.stringify(config)))).replace(/\\+/g, '-').replace(/\\//g, '_').replace(/=+$/, '');
  let manifest = location.origin + '/' + encoded + '/manifest.json';
  if (!cookies.length && config.showboxRegion === 'Auto' && config.sbMinQuality === 'all' && !config.useProxy) manifest = location.origin + '/manifest.json';
  document.getElementById('manifestUrl').textContent = manifest;
  document.getElementById('installBtn').href = manifest.replace(/^https?:\\/\\//, 'stremio://');
}
async function copyManifest() {
  const value = document.getElementById('manifestUrl').textContent;
  try {
    await navigator.clipboard.writeText(value);
    showToast('Manifest URL copied.');
  } catch {
    const area = document.createElement('textarea');
    area.value = value; document.body.append(area); area.select();
    const ok = document.execCommand('copy'); area.remove();
    showToast(ok ? 'Manifest URL copied.' : 'Copy failed. Select the URL and copy it manually.');
  }
}
document.querySelectorAll('.auto-update').forEach(element => {
  element.addEventListener('input', generateManifest);
  element.addEventListener('change', generateManifest);
});
generateManifest();
</script>
</body>
</html>`;
