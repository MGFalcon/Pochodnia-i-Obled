/* Szkielet stołu: start, widoki, Pochodnia, dziennik z kośćmi i czatem. */
const VIEWS = {};
const TABS = [['stol', 'Stół'], ['bohaterowie', 'Bohaterowie'], ['wyprawa', 'Wyprawa'], ['osada', 'Osada'], ['mg', 'Ekran MG']];
const UI = { view: 'stol', heroSel: null, sideOpen: false, sel: {} };
const inClaude = () => !!(window.claude && typeof window.claude.use === 'function');

/* ---------- pomocnicze: bohaterowie i uprawnienia ---------- */
const heroes = () => Object.values(Store.S.heroes || {});
const liveHeroes = () => heroes().filter(h => !h.dead);
const H = id => Store.S.heroes[id];
const canHero = h => Store.canWrite() && (Store.isGM() || !h.owner || h.owner === Store.me.id);
const saveHero = (h, quiet) => Store.act([opSet('heroes.' + h.id, h)], { quiet });
const heroLabel = h => (h.name || CLS[h.cls].name);
function ownerName(h) {
  if (!h.owner) return 'wolny';
  if (h.owner === Store.me.id) return 'Twój';
  const p = Store.peers.find(x => x.id === h.owner); return p ? p.name : (h.ownerName || 'gracz');
}

/* ---------- start ---------- */
function identity() {
  let me = LS.get('pio:me');
  if (!me || !me.id) { me = { id: 'g-' + uid(), name: '' }; LS.set('pio:me', me); }
  Store.me = { id: me.id, name: me.name || 'Gracz' };
}
async function boot() {
  identity();
  wireGlobal();
  if (inClaude()) {
    T.startLocal(); renderAll();
    let db = null, user = null;
    try { db = await window.claude.use('db'); } catch (e) { }
    try { user = await window.claude.use('user'); } catch (e) { }
    if (db) { await DbT.start(db, user); startPresence(); }
    else Store.setStatus('local', 'tryb lokalny: zapis tylko w tej przeglądarce');
    renderAll();
    return;
  }
  const last = LS.get('pio:ostatni');
  const hash = location.hash.replace('#', '');
  if (/^pokoj-[A-Z0-9]{5}$/i.test(hash)) return startScreen(hash.slice(6).toUpperCase());
  if (last && last.role === 'mg' && last.code) { await Room.host(last.code, last.via || 'peer'); renderAll(); return; }
  if (last && last.role === 'gracz' && last.code) { await Room.join(last.code, last.name || Store.me.name, last.via || 'peer').catch(() => { }); renderAll(); return; }
  if (last && last.role === 'local') { T.startLocal(); renderAll(); return; }
  startScreen();
}
function startScreen(code) {
  const me = LS.get('pio:me') || {};
  $('#view').innerHTML = `<div class="start panel">
    <h2>Jak gracie?</h2>
    <div class="startgrid">
      <section><h3>Prowadzę grę</h3><p class="dim">Otwierasz pokój i dostajesz kod. Twoja przeglądarka przechowuje stan gry — nie zamykaj jej w trakcie sesji.</p>
        <button class="btn primary" data-act="host">Otwórz pokój</button></section>
      <section><h3>Dołączam do gry</h3><p class="dim">Wpisz kod od MG i imię, pod którym cię zobaczą.</p>
        <div class="row"><input type="text" id="jcode" maxlength="5" placeholder="KOD" value="${esc(code || '')}" style="width:7em;text-transform:uppercase">
        <input type="text" id="jname" placeholder="Twoje imię" value="${esc(me.name || '')}" style="width:12em"></div>
        <p><button class="btn primary" data-act="join">Dołącz</button></p></section>
      <section><h3>Jeden stół, jedno urządzenie</h3><p class="dim">Bez sieci: gracie przy prawdziwym stole, a stan zapisuje się w tej przeglądarce.</p>
        <button class="btn" data-act="local">Graj lokalnie</button></section>
    </div>
    <details class="muted"><summary>Test bez internetu (kilka kart tej przeglądarki)</summary>
      <p>Otwórz pokój testowy w tej karcie, a w drugiej karcie dołącz tym samym kodem. Przydaje się też jako drugi ekran dla graczy przy stole.</p>
      <div class="row"><button class="btn sm" data-act="host-bc">Otwórz pokój testowy</button><button class="btn sm" data-act="join-bc">Dołącz do testowego</button></div></details>
  </div>`;
  $('#side').innerHTML = '';
}
async function startAction(a) {
  const nm = ($('#jname') && $('#jname').value.trim()) || '';
  if (nm) { const me = LS.get('pio:me') || {}; me.name = nm; LS.set('pio:me', me); Store.me.name = nm; }
  if (a === 'local') { T.startLocal(); LS.set('pio:ostatni', { role: 'local' }); return renderAll(); }
  if (a === 'host' || a === 'host-bc') {
    Store.me.name = Store.me.name && Store.me.name !== 'Gracz' ? Store.me.name : 'MG';
    const code = Room.newCode();
    await Room.host(code, a === 'host' ? 'peer' : 'bc').catch(() => Store.setStatus('error', 'nie udało się wczytać modułu połączeń — sprawdź internet'));
    renderAll();
    roomInfo();
    return;
  }
  const code = ($('#jcode').value || '').trim().toUpperCase();
  if (!/^[A-Z0-9]{5}$/.test(code)) return toast('Kod ma 5 znaków, np. K7QXM.');
  if (!nm) return toast('Wpisz imię, żeby inni wiedzieli, kto rzuca.');
  await Room.join(code, nm, a === 'join' ? 'peer' : 'bc').catch(() => Store.setStatus('error', 'nie udało się wczytać modułu połączeń — sprawdź internet'));
  renderAll();
}
function roomInfo() {
  if (Store.mode !== 'host') return;
  const link = location.href.split('#')[0] + '#pokoj-' + Room.code;
  modal(`<h3>Pokój ${esc(Room.code)}</h3><p>Podaj graczom kod <b class="code">${esc(Room.code)}</b> albo link:</p>
    <p><input type="text" id="rlink" readonly value="${esc(link)}" style="width:100%"></p>
    <p class="dim">Pokój działa, dopóki ta karta jest otwarta. Po odświeżeniu otworzy się ten sam pokój z tym samym kodem.</p>`,
    [{ t: 'Kopiuj link', fn: () => { copyText(link); return false; } }, { t: 'Zamknij', cls: 'primary' }]);
}

/* ---------- render ---------- */
function renderTabs() {
  $('#tabs').innerHTML = TABS.filter(([k]) => k !== 'mg' || Store.isGM()).map(([k, t]) => `<a href="#${k}" class="tab ${UI.view === k ? 'on' : ''}" ${UI.view === k ? 'aria-current="page"' : ''}>${t}</a>`).join('');
  const role = { mg: 'MG', gracz: 'gracz', widz: 'widz' }[Store.role];
  $('#who').innerHTML = `<span class="chip ${Store.role === 'mg' ? 'gold' : ''}" title="Twoja rola przy stole">${esc(Store.me.name)} · ${role}</span>` +
    (Store.peers.length ? `<span class="chip" title="${esc(Store.peers.map(p => p.name).join(', '))}">przy stole: ${Store.peers.length}</span>` : '') +
    ` <button class="btn sm ghost" data-act="gloss" title="Wyjaśnienia stanów, efektów, Przypadłości i Cnót">Słownik</button>` +
    (Store.mode === 'host' ? ` <button class="btn sm ghost" data-act="roominfo">Pokój ${esc(Room.code)}</button>` : '') +
    (!inClaude() && (Store.mode === 'local' || Store.mode === 'host' || Store.mode === 'client') ? ` <button class="btn sm ghost" data-act="leave" title="Wróć do wyboru trybu gry">Zmień tryb</button>` : '');
}
function renderTorch() {
  const t = Store.S.stol.torch; const ti = torchInfo(t);
  document.documentElement.style.setProperty('--dark', String((10 - t) / 10));
  $('#torchbar').innerHTML = `<div class="torch" role="group" aria-label="Pochodnia">
    <span class="lbl">Pochodnia</span>
    <div class="flames">${Array.from({ length: 10 }, (_, i) => `<button class="fl ${i < t ? 'on' : ''}" data-act="torch" data-v="${i + 1}" aria-label="Pochodnia ${i + 1}" title="Ustaw Pochodnię na ${i + 1}"></button>`).join('')}</div>
    <b class="tv num">${t}</b><span class="tname">${ti.name}</span>
    <span class="tinfo muted">wrogowie: ${ti.enemy} · łupy: ${ti.loot} · zwiad ${ti.scout || 'brak'}</span>
    <span class="sp"></span>
    <button class="btn sm ghost" data-act="torchDim" title="Przygaś o 1 — decyzja graczy" ${t > 0 ? '' : 'disabled'}>Przygaś −1</button><button class="btn sm ghost" data-act="torch0" title="Zgaś do zera — decyzja graczy" ${t > 0 ? '' : 'disabled'}>Zgaś</button>
    ${Store.S.wyprawa.quest ? `<span class="tpack" title="Pochodnie w plecaku"><span class="lbl">w plecaku</span> <b class="num">${(Store.S.wyprawa.sup || {}).Pochodnie || 0}</b> poch. · <span class="lbl">korytarze</span> <b class="num">${Store.S.wyprawa.crossed || 0}</b> · <span class="lbl">głód za</span> <b class="num">${4 - ((Store.S.wyprawa.crossed || 0) % 4)}</b></span>` : ''}
    ${Store.S.wyprawa.quest && Store.canWrite() && scoutable().length ? `<button class="btn scoutbtn sm2" data-act="scoutAny">Zwiad (${scoutChance(Store.S.stol, party()).chance})</button>` : ''}
    <button class="btn sm" data-act="torchUse" title="Pochodnia z plecaka: +3" ${Store.S.wyprawa.quest && !((Store.S.wyprawa.sup || {}).Pochodnie > 0) ? 'disabled' : ''}>Pochodnia +3</button>
  </div>`;
}
function renderView() {
  const v = VIEWS[UI.view] || VIEWS.stol;
  const el = $('#view');
  renderInto(el, v.render());
  if (v.after) v.after(el);
}
function renderAll() { Store.ready = true; renderTabs(); renderTorch(); renderView(); renderSide(); }
Store.onChange(what => {
  if (what === 'peers') return renderTabs();
  if (what === 'log') { renderSide(); checkRollCard(); checkCaption(); return; }
  if (what === 'role') return renderAll();
  renderTorch(); renderView(); renderSide(); renderTabs(); checkCaption(); checkRollCard();
});

/* ---------- dziennik, czat i kości ---------- */
function logLine(e) {
  const tm = new Date(e.t); const hh = String(tm.getHours()).padStart(2, '0') + ':' + String(tm.getMinutes()).padStart(2, '0');
  return `<div class="e ${e.cls || ''} k-${e.kind || 'sys'}"><span class="lt">${hh}</span> <span class="lb">${esc(e.by || '')}</span> ${diceBadges(md(e.text || ''))}</div>`;
}
function renderSide() {
  const side = $('#side');
  if (!side || !Store.S) return;
  const L = Store.S.log || [];
  const box = $('#logbox');
  const atBottom = !box || box.scrollTop + box.clientHeight >= box.scrollHeight - 30 || Date.now() - (UI.logScrollT || 0) > 15000;
  renderInto(side, `<div class="panel logpanel">
    <h2>Dziennik <span class="hint">rzuty, czat i Przodek</span></h2>
    <div class="log" id="logbox" aria-live="polite">${L.slice(-120).map(logLine).join('') || '<p class="muted">Tu pojawią się rzuty kośćmi, wyniki ataków i wiadomości.</p>'}</div>
    <div class="dice">${[2, 4, 6, 8, 10, 20].map(n => `<button class="btn sm" data-act="die" data-n="${n}">k${n}</button>`).join('')}
      <button class="btn sm" data-act="dieChance" title="Rzut na Szansę: k10 ≤ Szansa">Szansa…</button></div>
    <form class="chat" id="chatf"><input type="text" id="chatin" placeholder="${Store.canWrite() ? 'Napisz do stołu…' : 'Oglądasz — czat dla graczy z prawem edycji'}" ${Store.canWrite() ? '' : 'disabled'} autocomplete="off"><button class="btn sm" ${Store.canWrite() ? '' : 'disabled'}>Wyślij</button></form>
  </div>`);
  const nb = $('#logbox'); if (nb) { if (atBottom) nb.scrollTop = nb.scrollHeight; else if (box) nb.scrollTop = box.scrollTop; nb.addEventListener('wheel', () => { UI.logScrollT = Date.now(); }, { passive: true }); nb.addEventListener('touchmove', () => { UI.logScrollT = Date.now(); }, { passive: true }); }
}
function rollLog(text, cls, kind) { return Store.log({ text, cls: cls || '', kind: kind || 'roll' }); }
let _lastCap = null, _lastRoll = null;
function checkRollCard() {
  const L = Store.S.log || []; const e = L[L.length - 1];
  if (!e || e.id === _lastRoll) return; const fresh = Date.now() - e.t < 15000; _lastRoll = e.id;
  if (!fresh || !(e.kind === 'roll' || e.kind === 'sys') || !/k\d+ = |rzut \*\*/.test(e.text || '')) return;
  let c = document.getElementById('rollcard'); if (!c) { c = document.createElement('div'); c.id = 'rollcard'; c.className = 'rollcard'; c.setAttribute('role', 'status'); document.body.appendChild(c); c.addEventListener('click', () => { c.hidden = true; }); }
  c.innerHTML = `<button class="rc-x" aria-label="Zamknij" title="Zamknij">×</button><span class="lbl">Rzut${e.by ? ' · ' + esc(e.by) : ''}</span><div>${diceBadges(md(e.text))}</div>`; c.hidden = false;
  clearTimeout(c._t); c._t = setTimeout(() => { c.hidden = true; }, 5000);
}
function checkCaption() {
  const L = Store.S.log || []; const e = L[L.length - 1];
  if (!e || e.kind !== 'przodek' || e.id === _lastCap) return;
  if (Date.now() - e.t > 20000) { _lastCap = e.id; return; }
  _lastCap = e.id;
  const c = $('#caption'); c.innerHTML = `<span class="lbl">Przodek</span><p>${esc(e.text)}</p>`; c.hidden = false;
  clearTimeout(c._t); c._t = setTimeout(() => { c.hidden = true; }, 9000);
}

/* ---------- zdarzenia globalne ---------- */
const ACT = {};
function wireGlobal() {
  document.addEventListener('click', ev => {
    const el = ev.target.closest('[data-act]'); if (!el) return;
    if (el.disabled || el.getAttribute('aria-disabled') === 'true' || el.closest('fieldset[disabled]')) { ev.preventDefault(); return; }
    const a = el.dataset.act;
    if (ACT[a]) { ev.preventDefault(); ACT[a](el, ev); }
  });
  document.addEventListener('submit', ev => {
    if (ev.target.id === 'chatf') {
      ev.preventDefault(); const i = $('#chatin'); const t = i.value.trim(); if (!t) return;
      Store.log({ text: t, kind: 'chat' }); i.value = '';
    }
  });
  document.addEventListener('click', ev => {
    const g = ev.target.closest('[data-gloss]'); if (!g) return;
    ev.stopPropagation(); ev.preventDefault(); toast(g.dataset.gloss, 7000);
  }, true);
  document.addEventListener('keydown', ev => { if (ev.key === 'Enter' && ev.target.dataset && ev.target.dataset.gloss) toast(ev.target.dataset.gloss, 7000); });
  document.addEventListener('input', ev => { if (ev.target.id === 'scoutB') UI.scoutB = +ev.target.value || 0; });
  document.addEventListener('input', ev => onBind(ev, false));
  document.addEventListener('change', ev => onBind(ev, true));
  window.addEventListener('hashchange', route);
  $('#logfab').addEventListener('click', () => { document.body.classList.toggle('side-open'); });
  route();
}
function route() {
  const h = location.hash.replace('#', '');
  if (/^pokoj-/.test(h)) return;
  if (TABS.some(([k]) => k === h)) { if (UI.view !== h) $$('#pops .pop').forEach(p => p.remove()); UI.view = h; if (h === 'mg' && !Store.isGM()) UI.view = 'stol'; }
  document.body.classList.remove('side-open');
  if (Store.ready) renderAll();
}
/* pola formularzy: data-bind="heroes.<id>.name" itp. Tekst wysyłany po przerwie, reszta od razu. */
const _bindT = {};
function onBind(ev, commit) {
  const el = ev.target; const p = el.dataset && el.dataset.bind; if (!p) return;
  if (!Store.canWrite()) return;
  let v = el.type === 'checkbox' ? el.checked : el.value;
  if (el.dataset.num != null) v = el.value === '' ? 0 : Number(el.value);
  const isText = (el.tagName === 'TEXTAREA' || el.type === 'text');
  if (isText && !commit) {
    applyOp(Store.S, opSet(p, v));
    clearTimeout(_bindT[p]); _bindT[p] = setTimeout(() => T.send([opSet(p, v)]), 450);
    return;
  }
  if (isText && commit) { clearTimeout(_bindT[p]); T.send([opSet(p, v)]); return; }
  if (commit) Store.act([opSet(p, v)]);
}
Object.assign(ACT, {
  host: () => startAction('host'), join: () => startAction('join'), local: () => startAction('local'),
  'host-bc': () => startAction('host-bc'), 'join-bc': () => startAction('join-bc'),
  roominfo: () => roomInfo(),
  gloss: () => glossaryModal(),
  leave: () => confirmBox('Zmienić tryb gry?', 'Wrócisz do ekranu wyboru. Zapisany stan zostaje w tej przeglądarce.', 'Zmień', () => { LS.set('pio:ostatni', null); location.hash = ''; location.reload(); }),
  torch: el => Store.act([opSet('stol.torch', +el.dataset.v === Store.S.stol.torch ? +el.dataset.v - 1 : +el.dataset.v)]),
  torchDim: () => { const t = Math.max(0, Store.S.stol.torch - 1); Store.act([opSet('stol.torch', t)]); rollLog('Drużyna przygasza pochodnię: Pochodnia **' + t + '** (' + torchInfo(t).name + ').', t <= 2 ? 'bad' : '', 'sys'); },
  torch0: () => { Store.act([opSet('stol.torch', 0)]); rollLog('Drużyna gasi pochodnię. **Ciemność.**', 'bad', 'sys'); },
  torchUse: () => {
    const w = Store.S.wyprawa; const n = (w.sup && w.sup.Pochodnie) || 0;
    const ops = [opSet('stol.torch', Math.min(10, Store.S.stol.torch + 3))];
    if (w.quest && n > 0) ops.push(opSet('wyprawa.sup.Pochodnie', n - 1));
    Store.act(ops); rollLog('Zapalono pochodnię: Pochodnia **' + Math.min(10, Store.S.stol.torch) + '**' + (w.quest ? ' (w plecaku zostało ' + Math.max(0, n - 1) + ')' : ''), '', 'sys');
  },
  die: el => { const n = +el.dataset.n; const r = d(n); rollLog('rzuca **k' + n + ': ' + r + '**', r === n ? 'crit' : ''); },
  dieChance: () => {
    modal(`<h3>Rzut na Szansę</h3><p class="dim">k10 ≤ Szansa to sukces. 1 zawsze się udaje, 10 zawsze zawodzi.</p>
      <div class="row"><label>Szansa <input type="number" id="chv" min="0" max="12" value="5" style="width:5em"></label>
      <label>Za co? <input type="text" id="chw" placeholder="np. rozbrojenie pułapki"></label></div>`,
      [{ t: 'Anuluj' }, { t: 'Rzuć k10', cls: 'primary', fn: () => {
        const v = +$('#chv').value; const r = d(10); const ok = r === 1 || (r !== 10 && r <= v);
        rollLog(($('#chw').value ? esc($('#chw').value) + ': ' : '') + 'k10 = **' + r + '** przy Szansie ' + v + ' → **' + (ok ? 'sukces' : 'porażka') + '**', ok ? 'good' : 'bad');
      } }]);
  }
});
