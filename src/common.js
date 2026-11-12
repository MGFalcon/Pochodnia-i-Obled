/* Pochodnia i Obłęd — wspólny kod narzędzi: zapis, kości, zasady wrogów, okna. */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const md = s => esc(s).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>');
const clone = o => JSON.parse(JSON.stringify(o));
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const obrN = n => n + ' ' + (n === 1 ? 'obrażenie' : (n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 12 || n % 100 > 14)) ? 'obrażenia' : 'obrażeń');
const sgn = n => (n > 0 ? '+' + n : n < 0 ? '−' + Math.abs(n) : '±0');

/* ---------- kości ---------- */
function d(n) {
  try { const a = new Uint32Array(1); crypto.getRandomValues(a); return 1 + (a[0] % n); } catch (e) { return 1 + Math.floor(Math.random() * n); }
}
function pick(arr) { return arr[d(arr.length) - 1]; }
/* losowanie z widoczną kością: {r, v, n, t: 'k7 = **3**'} */
function pickD(arr) { const n = arr.length; const r = d(n); return { r, v: arr[r - 1], n, t: 'k' + n + ' = **' + r + '**' }; }
/* kości w tekście jako plakietki: „k10 = **4**”, „rzut **7**” */
function diceBadges(html) {
  return html.replace(/k(\d+) = (?:<b>)?(\d+)(?:<\/b>)?/g, '<span class="dieb" title="rzut k$1"><i>k$1</i>$2</span>').replace(/rzut <b>(\d+)<\/b>/g, 'rzut <span class="dieb" title="rzut k10"><i>k10</i>$1</span>');
}
/* "k6+1" -> {n:6, plus:1}; "1" -> {n:0, plus:1}; "k10+5" ... */
function parseDice(s) {
  if (s == null) return null;
  const m = String(s).replace(/\s/g, '').match(/^k(\d+)([+-]\d+)?$/);
  if (m) return { n: +m[1], plus: m[2] ? +m[2] : 0 };
  const f = String(s).match(/^(\d+)$/);
  if (f) return { n: 0, plus: +f[1] };
  return null;
}
function diceStr(p, bonus = 0) {
  if (!p) return '—';
  const plus = p.plus + bonus;
  if (!p.n) return String(Math.max(1, plus));
  return 'k' + p.n + (plus > 0 ? '+' + plus : plus < 0 ? '−' + Math.abs(plus) : '');
}
function diceMax(p, bonus = 0) { return p ? (p.n || 0) + p.plus + bonus : 0; }
function rollDice(p, bonus = 0) {
  if (!p) return { roll: 0, total: 0 };
  const r = p.n ? d(p.n) : 0;
  return { roll: r, total: Math.max(1, r + p.plus + bonus) };
}

/* ---------- pamięć przeglądarki ---------- */
const LS = {
  get(k) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : null; } catch (e) { return null; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { } }
};

/* ---------- pliki: zapis kopii i wczytanie ---------- */
async function saveFile(filename, text) {
  let dl = null;
  try { dl = (window.claude && window.claude.use) ? await window.claude.use('downloads') : null; } catch (e) { dl = null; }
  if (dl) {
    try { await dl.save({ filename, data: text }); toast('Zapisano plik ' + filename); return true; }
    catch (e) { if (e && e.code === 'declined') { toast('Zapis anulowany.'); return false; } }
  }
  try {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([text], { type: 'application/json' }));
    a.download = filename; document.body.appendChild(a); a.click(); a.remove();
    toast('Plik ' + filename + ' powinien się pobrać. Jeśli nie, użyj „Kopiuj jako tekst”.');
    return true;
  } catch (e) { return false; }
}
function copyText(text) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(() => toast('Skopiowano do schowka.'), () => showText(text));
  } else showText(text);
}
function showText(text) {
  modal(`<h3>Kopia danych</h3><p class="dim">Zaznacz cały tekst i skopiuj go ręcznie.</p><textarea id="cpy" rows="10" readonly>${esc(text)}</textarea>`, [{ t: 'Zamknij' }]);
  const ta = $('#cpy'); ta.focus(); ta.select();
}
function importDialog(onData) {
  modal(`<h3>Wczytaj kopię</h3>
    <p class="dim">Wybierz plik zapisany wcześniej albo wklej skopiowany tekst. Wczytanie zastąpi obecne dane na tej stronie.</p>
    <p><input type="file" id="impf" accept=".json,application/json,text/plain"></p>
    <textarea id="impt" rows="6" placeholder="…albo wklej tutaj tekst kopii"></textarea>`,
    [{ t: 'Anuluj' }, { t: 'Wczytaj', cls: 'primary', fn: () => { const t = $('#impt').value.trim(); if (t) { tryParse(t); return true; } toast('Wklej tekst albo wybierz plik.'); return false; } }]);
  function tryParse(t) { try { onData(JSON.parse(t)); toast('Wczytano.'); } catch (e) { toast('To nie wygląda na kopię z tej strony (błąd w tekście).'); } }
  $('#impf').addEventListener('change', e => {
    const f = e.target.files[0]; if (!f) return;
    const r = new FileReader(); r.onload = () => { closeModal(); tryParse(r.result); }; r.readAsText(f);
  });
}

/* ---------- okna i komunikaty ---------- */
let _toastT = null;
function toast(msg, ms) {
  let el = $('.toast');
  if (!el) { el = document.createElement('div'); el.className = 'toast'; el.setAttribute('role', 'status'); document.body.appendChild(el); }
  el.textContent = msg; el.hidden = false;
  clearTimeout(_toastT); _toastT = setTimeout(() => { el.hidden = true; }, ms || 3200);
}
function closeModal() { const m = $('.modal-bg'); if (m) m.remove(); }
function modal(html, buttons) {
  closeModal();
  const bg = document.createElement('div'); bg.className = 'modal-bg';
  bg.innerHTML = `<div class="modal panel" role="dialog" aria-modal="true">${html}<div class="mrow">${(buttons || []).map((b, i) => `<button class="btn ${b.cls || ''}" data-mb="${i}">${esc(b.t)}</button>`).join('')}</div></div>`;
  bg.addEventListener('click', e => {
    if (e.target === bg) return closeModal();
    const b = e.target.closest('[data-mb]'); if (!b) return;
    const def = buttons[+b.dataset.mb];
    if (def.fn) { const keep = def.fn() === false; if (keep) return; }
    closeModal();
  });
  document.body.appendChild(bg);
  const f = bg.querySelector('input,select,textarea,button.primary'); if (f) f.focus();
}
function confirmBox(title, text, okText, fn) {
  modal(`<h3>${esc(title)}</h3><p>${esc(text)}</p>`, [{ t: 'Anuluj' }, { t: okText, cls: 'primary', fn }]);
}

/* ---------- render z zachowaniem fokusu ---------- */
function renderInto(el, html) {
  const a = document.activeElement;
  const id = a && a.id && el.contains(a) ? a.id : null;
  let s0 = null, s1 = null;
  try { if (id && a.selectionStart != null) { s0 = a.selectionStart; s1 = a.selectionEnd; } } catch (e) { }
  el.innerHTML = html;
  if (id) { const n = document.getElementById(id); if (n) { n.focus({ preventScroll: true }); try { if (s0 != null) n.setSelectionRange(s0, s1); } catch (e) { } } }
}

/* ---------- wrogowie: odczyt ataków i premie poziomu lochu ---------- */
const DL = ['Uczniowski', 'Weterański', 'Mistrzowski'];
const DL_SHORT = ['Ucz.', 'Wet.', 'Mistrz.'];
const DL_ROMAN = ['I', 'II', 'III'];
/* "Cięcie: W 1–2, Cel. 8, k4+1, krwawienie 1" -> obiekt */
function parseAttack(s) {
  s = s.replace(/\*\*/g, '').trim().replace(/\.$/, '');
  const m = s.match(/^([^:]+):\s*(.*)$/);
  if (!m) return { name: '', text: s };
  const name = m[1].trim(); const rest = m[2];
  const w = rest.match(/W ([0-9+–-]+)/);
  const cel = rest.match(/Cel\. (\d+)/);
  if (!w || !cel) return { name, text: rest };
  let after = rest.slice(rest.indexOf(cel[0]) + cel[0].length).replace(/^,\s*/, '');
  let dmg = null, stress = 0;
  const dm = after.match(/^(k\d+(?:\+\d+)?|\d+)(?: obrażenie| obrażeń)?/);
  if (dm) { dmg = dm[1]; after = after.slice(dm[0].length).replace(/^(,\s*|\s+i\s+)/, ''); }
  const sm = after.match(/\+(\d+) Stres/);
  if (sm) stress = +sm[1];
  return { name, w: w[1], aoe: w[1].includes('+'), cel: +cel[1], dmg, stress, rest: after };
}
function scaleAttack(a, dl, flat) {
  if (!a.w || flat) return Object.assign({}, a, { celS: a.cel, dmgS: a.dmg, stressS: a.stress });
  const p = parseDice(a.dmg);
  const dmgB = a.aoe ? 0 : dl;
  return Object.assign({}, a, {
    celS: a.cel + dl,
    dmgS: p ? diceStr(p, dmgB) : a.dmg,
    stressS: a.stress ? a.stress + (dl === 2 && !a.aoe ? 1 : 0) : 0
  });
}
function attackText(a) {
  if (!a.w) return (a.name ? '<b>' + esc(a.name) + ':</b> ' : '') + esc(a.text || '');
  const bits = ['W ' + a.w, 'Cel. ' + a.celS];
  if (a.dmgS) bits.push(a.dmgS);
  let rest = a.rest || '';
  if (a.stress) rest = rest.replace(/\+\d+ Stres/, '+' + a.stressS + ' Stres');
  if (rest) bits.push(rest);
  return '<b>' + esc(a.name) + ':</b> ' + esc(bits.join(', '));
}
/* "Zdrowie 42 · Unik 2 · Szybkość 4 · Człowiek · zaczyna…" */
function parseBossLine(line) {
  const g = re => { const m = line.match(re); return m ? +m[1] : 0; };
  const parts = line.split(' · ');
  const type = parts.find(p => /^(Człowiek|Plugaw|Nieumar|Besti)/.test(p) || /Człowiek i Bestia/.test(p)) || '';
  return { hp: g(/Zdrowie (\d+)/), dodge: g(/Unik (\d+)/), prot: g(/Pancerz (\d+)/), speed: g(/Szybkość (\d+)/), krzepa: g(/Krzepa (\d+)/) || 7, type, where: parts.slice(parts.indexOf(type) + 1).join(' · ') };
}
