/* Widok Wyprawa: mapa posiadłości, tablica zadań, mapa komnat z korytarzami. */
const SUPPLY = [['Prowiant', 0.5, 'za 2 szt. 1 Z'], ['Pochodnie', 1], ['Łopaty', 2], ['Bandaże', 1], ['Antidota', 1], ['Laudanum', 1], ['Zioła', 2], ['Woda święcona', 2], ['Klucze', 2]];
const GOALS = { eksploracja: 'Eksploracja: odwiedź 9 na 10 komnat', oczyszczenie: 'Oczyszczenie: wygraj każdą walkę w komnatach', zbiorka: 'Zbiórka', aktywacja: 'Aktywacja', boss: 'Boss' };
const regionOfKey = k => REGION_IDS.find(id => REGIONS[id].key === k);
const topLevel = () => liveHeroes().reduce((m, h) => Math.max(m, h.level), 0);
const packCost = sup => Math.ceil(SUPPLY.reduce((a, [k, c]) => a + (sup[k] || 0) * c, 0));

function goalText(q) {
  const R = REGIONS[q.region];
  if (q.dd != null) return 'Zejdź na piętro ' + (q.dd + 1) + ' i pokonaj: ' + DD_FLOORS[q.dd].boss;
  if (q.goal === 'zbiorka') return 'Zbiórka: znajdź 3 × ' + R.gather;
  if (q.goal === 'aktywacja') return 'Aktywacja: użyj 3 × ' + R.activate;
  if (q.goal === 'boss') return 'Boss: ' + DATA.bestiary[R.key].boss.name + ' w lokacji ' + R.lair.name;
  return GOALS[q.goal];
}
function questReward(q) {
  if (q.dd != null) return { gold: 80, mem: 3, xp: 3 };
  const L = QUEST_LEN[q.len]; const m = DL_INFO[q.dl].mult;
  return { gold: Math.ceil(L.gold * m), mem: L.mem, xp: L.xp + (q.goal === 'boss' ? 1 : 0) };
}
/* tablica zadań: 3 zadania, każde w innym otwartym regionie; co najmniej jedno na każdym odblokowanym poziomie */
function rollBoard() {
  const o = Store.S.osada; const top = topLevel();
  const levels = [0].concat(top >= 3 ? [1] : [], top >= 5 ? [2] : []);
  const open = (o.regions || ['ruiny']).slice();
  const n = 3;
  const regs = []; const pool = open.slice();
  for (let i = 0; i < n; i++) { if (!pool.length) pool.push(...open); const k = d(pool.length) - 1; regs.push(pool.splice(k, 1)[0]); }
  const lv = levels.slice(); while (lv.length < n) { const r = d(10); lv.push(levels.length === 1 ? 0 : levels.length === 2 ? (r <= 5 ? 0 : 1) : (r <= 3 ? 0 : r <= 7 ? 1 : 2)); }
  const lines = [];
  const board = regs.map((reg, i) => {
    const rl = d(10); let len = rl <= 4 ? 'krotka' : rl <= 8 ? 'srednia' : 'dluga';
    const rg = d(10); let goal = rg <= 3 ? 'eksploracja' : rg <= 6 ? 'oczyszczenie' : rg <= 8 ? 'zbiorka' : rg === 9 ? 'aktywacja' : 'boss';
    if (goal === 'boss' && top < 2) goal = 'oczyszczenie';
    if (goal === 'boss') len = 'srednia';
    const q = { id: uid(), region: reg, dl: lv[i], len, goal };
    lines.push(REGIONS[reg].name + ' (' + DL[q.dl] + '): długość k10 = ' + rl + ', cel k10 = ' + rg);
    return q;
  });
  if (!(o.questsDone || 0) && !board.some(q => q.len === 'krotka')) { board[0].len = 'krotka'; if (board[0].goal === 'boss') board[0].goal = 'eksploracja'; lines.push('pierwsza wyprawa kampanii: ' + REGIONS[board[0].region].name + ' — krótka'); }
  for (const reg of open) {
    if (((o.regionDone || {})[reg] || 0) < 3 || board.some(q => q.region === reg && q.goal === 'boss')) continue;
    const dl = Math.max(...levels.filter(l => !(o.bosses || {})[reg + l]).concat(-1)); if (dl < 0) continue;
    board.push({ id: uid(), region: reg, dl, len: 'srednia', goal: 'boss' }); lines.push(REGIONS[reg].name + ': po ' + o.regionDone[reg] + ' zadaniach w regionie budzi się boss (' + DL[dl] + ')');
  }
  if (top >= 5 && (o.dd || 0) < 4) board.push({ id: uid(), region: 'dd', dd: o.dd || 0, dl: 2, len: 'srednia', goal: 'boss' });
  Store.act([opSet('osada.board', board), { log: { id: uid(), t: Date.now(), by: byName(), uid: Store.me.id, kind: 'sys', text: '**Tablica zadań, tydzień ' + o.week + '.** ' + lines.join('; ') + '.' } }]);
}

/* ---------- mapa posiadłości (SVG) ---------- */
let _mapArt = null;
function mapArt() {
  if (_mapArt) return _mapArt;
  let seed = 7; const rnd = () => (seed = (seed * 9301 + 49297) % 233280) / 233280;
  let trees = '';
  for (let i = 0; i < 150; i++) {
    const x = 590 + rnd() * 400, y = 60 + rnd() * 330;
    if (y > 330 && x < 700) continue;
    const s = 7 + rnd() * 7;
    trees += `<path d="M${x.toFixed(1)} ${(y - s).toFixed(1)} L${(x - s * .6).toFixed(1)} ${(y + s * .5).toFixed(1)} L${(x + s * .6).toFixed(1)} ${(y + s * .5).toFixed(1)} Z" />`;
  }
  let waves = '';
  for (let i = 0; i < 46; i++) { const x = 600 + rnd() * 400, y = 430 + rnd() * 210; if (x + (y - 430) * 0.9 < 800) continue; waves += `<path d="M${x.toFixed(0)} ${y.toFixed(0)} q6 -5 12 0 t12 0" />`; }
  let rubble = '';
  for (let i = 0; i < 26; i++) { const x = 70 + rnd() * 270, y = 70 + rnd() * 200; rubble += `<rect x="${x.toFixed(0)}" y="${y.toFixed(0)}" width="${(4 + rnd() * 9).toFixed(0)}" height="${(3 + rnd() * 6).toFixed(0)}" transform="rotate(${(rnd() * 40 - 20).toFixed(0)} ${x.toFixed(0)} ${y.toFixed(0)})"/>`; }
  let holes = '';
  for (let i = 0; i < 16; i++) { const x = 70 + rnd() * 300, y = 420 + rnd() * 190; holes += `<ellipse cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" rx="${(5 + rnd() * 7).toFixed(0)}" ry="${(3 + rnd() * 3).toFixed(0)}"/>`; }
  _mapArt = { trees, waves, rubble, holes }; return _mapArt;
}
function estateSvg() {
  const o = Store.S.osada; const A = mapArt(); const sel = UI.mapSel || {};
  const road = (a, b) => { const mx = (a[0] + b[0]) / 2 + (a[1] - b[1]) * 0.12, my = (a[1] + b[1]) / 2 + (b[0] - a[0]) * 0.12; return `<path d="M${a[0]} ${a[1]} Q${mx.toFixed(0)} ${my.toFixed(0)} ${b[0]} ${b[1]}" />`; };
  let roads = '';
  REGION_IDS.forEach(id => { const L = REGIONS[id].locs; roads += road(OSADA_AT, L[0].at) + road(L[0].at, L[1].at) + road(L[1].at, L[2].at); });
  roads += road(OSADA_AT, MANOR_AT);
  const marks = REGION_IDS.map(id => {
    const R = REGIONS[id]; const open = (o.regions || []).includes(id);
    const hasQ = i => (o.board || []).some(q => q.region === id && q.dl === i && q.goal !== 'boss');
    const locs = R.locs.map((l, i) => `<g class="mk ${open ? '' : 'locked'} ${sel.r === id && sel.l === i ? 'on' : ''} ${hasQ(i) ? 'hasq' : ''}" data-act="mapSel" data-r="${id}" data-l="${i}" tabindex="0" role="button" aria-label="${esc(l.name)}, poziom ${DL[i]}${hasQ(i) ? ', jest zadanie' : ''}">
      ${hasQ(i) ? `<circle cx="${l.at[0]}" cy="${l.at[1]}" r="24" class="qring"/><text x="${l.at[0] + 20}" y="${l.at[1] - 14}" class="qmark">!</text>` : ''}
      <circle cx="${l.at[0]}" cy="${l.at[1]}" r="15" class="lv${i}"/><text x="${l.at[0]}" y="${l.at[1] + 5}" text-anchor="middle" class="mkn">${DL_ROMAN[i]}</text>
      <text x="${l.at[0]}" y="${l.at[1] + 32}" text-anchor="middle" class="mkl">${esc(l.name)}</text></g>`).join('');
    const bossDone = [0, 1, 2].filter(i => o.bosses && o.bosses[id + i]).length;
    const lair = `<g class="mk lair ${open ? '' : 'locked'} ${sel.r === id && sel.l === 'lair' ? 'on' : ''}" data-act="mapSel" data-r="${id}" data-l="lair" tabindex="0" role="button" aria-label="${esc(R.lair.name)}">
      <path d="M${R.lair.at[0]} ${R.lair.at[1] - 17} l15 17 l-15 17 l-15 -17 Z" /><text x="${R.lair.at[0]}" y="${R.lair.at[1] + 5}" text-anchor="middle" class="mkn">✕</text>
      <text x="${R.lair.at[0]}" y="${R.lair.at[1] + 34}" text-anchor="middle" class="mkl">${esc(R.lair.name)}${bossDone ? ' · ' + bossDone + '/3' : ''}</text></g>`;
    return `<g><text x="${R.at[0]}" y="${R.at[1]}" text-anchor="middle" class="rname ${open ? '' : 'locked'}">${esc(R.name)}</text>${!open ? `<text x="${R.at[0]}" y="${R.at[1] + 18}" text-anchor="middle" class="rlock">zamknięte</text>` : ''}${locs}${lair}</g>`;
  }).join('');
  return `<svg class="estate" viewBox="0 0 1000 640" role="img" aria-label="Mapa posiadłości">
    <rect width="1000" height="640" class="land"/>
    <path class="sea" d="M1000 330 C930 360 880 420 840 450 C800 480 760 520 720 560 C690 590 650 620 620 640 L1000 640 Z"/>
    <path class="coast" d="M1000 330 C930 360 880 420 840 450 C800 480 760 520 720 560 C690 590 650 620 620 640"/>
    <g class="waves">${A.waves}</g>
    <g class="trees">${A.trees}</g>
    <g class="rubble">${A.rubble}</g>
    <g class="holes">${A.holes}</g>
    <g class="roads">${roads}</g>
    <g class="manor ${sel.r === 'dd' ? 'on' : ''}" data-act="mapSel" data-r="dd" tabindex="0" role="button" aria-label="Posiadłość i Najmroczniejszy Loch">
      <path d="M${MANOR_AT[0] - 46} ${MANOR_AT[1] + 26} V${MANOR_AT[1] - 6} L${MANOR_AT[0] - 30} ${MANOR_AT[1] - 26} L${MANOR_AT[0] - 14} ${MANOR_AT[1] - 6} V${MANOR_AT[1] - 30} L${MANOR_AT[0]} ${MANOR_AT[1] - 50} L${MANOR_AT[0] + 14} ${MANOR_AT[1] - 30} V${MANOR_AT[1] - 6} L${MANOR_AT[0] + 30} ${MANOR_AT[1] - 26} L${MANOR_AT[0] + 46} ${MANOR_AT[1] - 6} V${MANOR_AT[1] + 26} Z"/>
      <rect x="${MANOR_AT[0] - 7}" y="${MANOR_AT[1] + 8}" width="14" height="18" class="door"/>
      <text x="${MANOR_AT[0]}" y="${MANOR_AT[1] + 48}" text-anchor="middle" class="rname">Posiadłość</text>
      <text x="${MANOR_AT[0]}" y="${MANOR_AT[1] + 66}" text-anchor="middle" class="mkl">Najmroczniejszy Loch · piętra ${o.dd || 0}/4</text></g>
    <g class="osada">
      ${[[-30, 0], [-8, -14], [16, -4], [36, 10], [-18, 18], [8, 20]].map(([dx, dy]) => `<path d="M${OSADA_AT[0] + dx - 9} ${OSADA_AT[1] + dy + 8} v-10 l9 -8 l9 8 v10 Z"/>`).join('')}
      <text x="${OSADA_AT[0]}" y="${OSADA_AT[1] + 50}" text-anchor="middle" class="rname">Osada</text></g>
    ${marks}
  </svg>`;
}
function mapPanel() {
  const sel = UI.mapSel; const o = Store.S.osada;
  if (!sel) return `<section class="panel"><h2>Posiadłość</h2><p>Kliknij lokację na mapie. Rzymska cyfra to poziom lochu: <span class="ldot lv0">I</span> Uczniowski, <span class="ldot lv1">II</span> Weterański, <span class="ldot lv2">III</span> Mistrzowski. Romb to leże bossa regionu.</p>
    <p class="dim">Ruiny są otwarte od początku. Po każdej wykonanej wyprawie otwiera się jeden nowy region, aż otwarte będą wszystkie cztery. Bossowie pojawiają się na tablicy, gdy któryś bohater osiągnie Poziom 2.</p></section>`;
  if (sel.r === 'dd') return `<section class="panel"><h2>Najmroczniejszy Loch</h2><p class="dim">Cztery piętra pod posiadłością. Każde to średnia wyprawa zakończona bossem. Schodźcie, gdy czterech bohaterów ma Poziom 6 i rangi 4. Kto przeżył piętro, przez 2 tygodnie nie zejdzie do żadnego lochu i nie wróci na to piętro.</p>
    <ol class="floors">${DD_FLOORS.map((f, i) => `<li class="${i < (o.dd || 0) ? 'done' : ''}"><b>${esc(f.name)}</b> — ${esc(f.boss)}<br><span class="dim small">${esc(f.desc)}</span></li>`).join('')}</ol>
    ${Store.isGM() ? `<div class="row"><span class="lbl">Ukończone piętra</span>${[0, 1, 2, 3, 4].map(i => `<button class="btn sm ${(o.dd || 0) === i ? 'gold' : 'ghost'}" data-act="ddSet" data-v="${i}">${i}</button>`).join('')}</div>` : ''}</section>`;
  const R = REGIONS[sel.r]; const reg = DATA.regions[R.key]; const open = (o.regions || []).includes(sel.r);
  const curios = DATA.curios.filter(c => c.region === R.key || c.region === 'wszędzie');
  let head;
  if (sel.l === 'lair') {
    const b = DATA.bestiary[R.key].boss;
    head = `<h2>${esc(R.lair.name)} <span class="hint">leże bossa</span></h2><p>${esc(R.lair.desc)}</p>
      <p><b>${esc(b.name)}</b> <span class="dim">${esc(b.line)}</span></p>
      <div class="row"><span class="lbl">Pokonany</span>${[0, 1, 2].map(i => `<label class="chk"><input type="checkbox" data-bind="osada.bosses.${sel.r}${i}" ${o.bosses && o.bosses[sel.r + i] ? 'checked' : ''} ${Store.isGM() ? '' : 'disabled'}> ${DL[i]}</label>`).join('')}</div>`;
  } else {
    const l = R.locs[sel.l]; const I = DL_INFO[sel.l];
    head = `<h2>${esc(l.name)} <span class="hint"><span class="ldot lv${sel.l}">${DL_ROMAN[sel.l]}</span> ${DL[sel.l]}</span></h2><p>${esc(l.desc)}</p>
      <table class="t"><tr><th>Kto zejdzie</th><td>${I.who}</td></tr><tr><th>Złoto</th><td>×${String(I.mult).replace('.', ',')}</td></tr><tr><th>Wrogowie</th><td>${I.scale}</td></tr></table>`;
  }
  const here = (o.board || []).filter(q => q.region === sel.r && (sel.l === 'lair' ? q.goal === 'boss' : q.dl === sel.l && q.goal !== 'boss'));
  const qbox = `<div class="mapq">${here.length ? here.map(q => questCard(q, true)).join('') : `<p class="muted small">${open ? 'Na tablicy nie ma teraz zadania w tym miejscu.' : 'Region jeszcze zamknięty — otworzy się po wykonanej wyprawie.'} ${(o.board || []).length ? 'Zadania są tu: ' + (o.board || []).map(q => q.dd != null ? 'Najmroczniejszy Loch' : REGIONS[q.region].locs[q.dl].name).join(', ') + ' (świecą na mapie).' : ''}</p>`}</div>`;
  return `<section class="panel">${head}${qbox}
    <div class="ph">${esc(R.name)}${open ? '' : ' · zamknięty'}</div>
    <p class="dim">${esc(R.desc)}</p>
    <p><b>Mieszkańcy:</b> ${esc(reg.who)}. <b>Groźba:</b> ${esc(reg.threat)}.</p>
    <p><b>Przodownicy:</b> ${esc(DATA.encounters[R.key].front)}. <b>Tylni:</b> ${esc(DATA.encounters[R.key].back)}.</p>
    <p><b>Osobliwości:</b> ${curios.map(c => { const k = curioKnow(c.name); return esc(c.name) + (k.item ? ' (działa: ' + esc(k.item.toLowerCase()) + ')' : ''); }).join(', ')}.</p>
    ${Store.isGM() ? `<label class="chk"><input type="checkbox" data-act-change="regionOpen" value="${sel.r}" ${open ? 'checked' : ''}> region otwarty</label>` : ''}
  </section>`;
}

/* ---------- mapa komnat ---------- */
function genDungeon(q) {
  const n = q.dd != null ? 8 + d(3) - 1 : { krotka: 3 + d(3), srednia: 7 + d(3), dluga: 11 + d(5) }[q.len];
  const cells = {}; const rooms = []; const edges = [];
  const add = (x, y) => { const r = { id: 'r' + rooms.length, x, y, seen: false, visited: false, cleared: false, c: 'pusta' }; rooms.push(r); cells[x + ',' + y] = r; return r; };
  const start = add(0, 0); start.c = 'wejście'; start.seen = start.visited = true;
  let guard = 0;
  while (rooms.length < n && guard++ < 2000) {
    const from = pick(rooms); const [dx, dy] = pick([[1, 0], [1, 0], [0, 1], [0, -1], [-1, 0]]);
    const nx = from.x + dx, ny = from.y + dy; if (cells[nx + ',' + ny] || nx < 0 || Math.abs(ny) > 3) continue;
    const r = add(nx, ny); edges.push({ a: from.id, b: r.id, crossed: false });
  }
  const extra = q.len === 'krotka' ? 0 : q.len === 'srednia' ? 1 : 2;
  for (let i = 0, t = 0; i < extra && t < 200; t++) {
    const a = pick(rooms); const nb = [[1, 0], [0, 1], [-1, 0], [0, -1]].map(([dx, dy]) => cells[(a.x + dx) + ',' + (a.y + dy)]).filter(Boolean);
    const b = nb.find(b => !edges.some(e => (e.a === a.id && e.b === b.id) || (e.a === b.id && e.b === a.id)));
    if (b) { edges.push({ a: a.id, b: b.id, crossed: false }); i++; }
  }
  const R = q.region === 'dd' ? null : REGIONS[q.region];
  const curioPool = R ? DATA.curios.filter(c => c.region === R.key || c.region === 'wszędzie').map(c => c.name) : ['Zakazana księga'];
  rooms.slice(1).forEach(r => { const t = rollTable('komnata'); r.c = t.text; if (/osobliwość/.test(r.c)) r.curio = pick(curioPool); if (r.c === 'pusta' && d(2) === 1) r.feature = pick(ROOM_FEATURES).key; });
  /* odległości od wejścia */
  const dist = { r0: 0 }; const qd = ['r0'];
  while (qd.length) { const c = qd.shift(); edges.forEach(e => { const o = e.a === c ? e.b : e.b === c ? e.a : null; if (o && dist[o] == null) { dist[o] = dist[c] + 1; qd.push(o); } }); }
  const far = rooms.slice(1).sort((a, b) => dist[b.id] - dist[a.id]);
  if (q.goal === 'boss' || q.dd != null) { far[0].c = 'boss'; delete far[0].curio; }
  if (q.goal === 'zbiorka') shuffle(rooms.slice(1).filter(r => r.c !== 'boss')).slice(0, 3).forEach(r => { r.item = R.gather; });
  if (q.goal === 'aktywacja') shuffle(rooms.slice(1).filter(r => r.c !== 'boss')).slice(0, 3).forEach(r => { r.c = /walka/.test(r.c) ? 'walka i osobliwość' : 'osobliwość'; r.curio = R.activate; r.goal = true; });
  const minY = Math.min(...rooms.map(r => r.y)); rooms.forEach(r => r.y -= minY);
  const regKey = q.dd != null ? 'DD' : REGIONS[q.region].key; rooms.forEach(r => { r.desc = roomDesc(regKey, r.c); });
  return { rooms, edges };
}
function shuffle(a) { for (let i = a.length - 1; i > 0; i--) { const j = d(i + 1) - 1; [a[i], a[j]] = [a[j], a[i]]; } return a; }
function dungeonSvg() {
  const w = Store.S.wyprawa; const cell = 120;
  const W = (Math.max(...w.rooms.map(r => r.x)) + 1) * cell + 20, Hh = (Math.max(...w.rooms.map(r => r.y)) + 1) * cell + 20;
  const pos = r => [r.x * cell + 60, r.y * cell + 50];
  const byId = Object.fromEntries(w.rooms.map(r => [r.id, r]));
  const at = byId[w.at];
  const adj = id => w.edges.filter(e => e.a === id || e.b === id).map(e => e.a === id ? e.b : e.a);
  const near = at ? adj(at.id) : [];
  const edges = w.edges.map(e => {
    const A = byId[e.a], B = byId[e.b]; const vis = (A.seen || A.visited) && (B.seen || B.visited) || A.visited || B.visited;
    if (!vis) return '';
    const [x1, y1] = pos(A), [x2, y2] = pos(B);
    return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" class="cor ${e.crossed ? 'done' : ''}"/>`;
  }).join('') + (Store.canWrite() ? w.edges.map((e, i) => {
    if (e.crossed || e.scout || !(e.a === w.at || e.b === w.at)) return '';
    const [x1, y1] = pos(byId[e.a]), [x2, y2] = pos(byId[e.b]); const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
    return `<g class="scoutmk" data-act="scout" data-i="${i}" tabindex="0" role="button" aria-label="Zwiad korytarza"><rect x="${mx - 24}" y="${my - 11}" width="48" height="22" rx="11"/><text x="${mx}" y="${my + 4}" text-anchor="middle">zwiad</text></g>`;
  }).join('') : '');
  const rooms = w.rooms.map(r => {
    const known = r.visited || r.seen; const reach = near.includes(r.id); const isAt = r.id === w.at;
    if (!known && !reach && !adj(r.id).some(x => byId[x].visited)) return '';
    const [x, y] = pos(r);
    const label = !known ? '?' : r.c === 'wejście' ? 'wejście' : r.c === 'boss' ? 'BOSS' : r.c.replace('walka i osobliwość', 'walka + osobl.');
    return `<g class="room ${isAt ? 'at' : ''} ${reach ? 'reach' : ''} ${r.cleared ? 'clr' : ''} ${known ? '' : 'unk'} ${r.c === 'boss' && known ? 'boss' : ''}" ${reach && Store.canWrite() ? `data-act="goRoom" data-id="${r.id}" tabindex="0" role="button" aria-label="Idź do komnaty"` : `data-act="roomSel" data-id="${r.id}"`}>
      <rect x="${x - 34}" y="${y - 26}" width="68" height="52" rx="5"/>
      <text x="${x}" y="${y + 4}" text-anchor="middle">${esc(label)}</text>
      ${r.item && known && !r.itemTaken ? `<circle cx="${x + 28}" cy="${y - 20}" r="6" class="itm"/>` : ''}
      ${isAt ? `<circle cx="${x}" cy="${y + 34}" r="5" class="party"/>` : ''}
    </g>`;
  }).join('');
  return `<div class="tbl-wrap"><svg class="dungeon" viewBox="0 0 ${W} ${Hh}" width="${W}" height="${Hh}" role="img" aria-label="Mapa komnat">${edges}${rooms}</svg></div>`;
}

VIEWS.wyprawa = {
  render() {
    let sub = UI.wsub || (Store.S.wyprawa.quest ? 'loch' : 'mapa'); if (sub === 'prep' && (Store.S.wyprawa.quest || !UI.prep || !(Store.S.osada.board || []).some(q => q.id === UI.prep.qid))) sub = Store.S.wyprawa.quest ? 'loch' : 'tablica';
    return `<div class="seg subtabs">${[['mapa', 'Mapa posiadłości'], ['tablica', 'Tablica zadań'], ['loch', 'Mapa wyprawy']].map(([k, t]) => `<button class="btn ${sub === k ? 'gold' : 'ghost'}" data-act="wsub" data-v="${k}">${t}</button>`).join('')}</div>
      ${sub !== 'loch' ? lootCardHtml() : ''}
      ${sub === 'mapa' ? `<div class="mapgrid"><section class="panel mapbox">${estateSvg()}</section>${mapPanel()}</div>` : sub === 'tablica' ? this.board() : sub === 'prep' && !Store.S.wyprawa.quest ? prepView() : this.dungeon()}`;
  },
  board() {
    const o = Store.S.osada; const top = topLevel(); const W = Store.canWrite();
    const unlocked = [0].concat(top >= 3 ? [1] : [], top >= 5 ? [2] : []);
    return `<section class="panel"><h2>Tablica zadań <span class="hint">tydzień ${o.week} · najwyższy Poziom w rejestrze: ${top}</span></h2>
      <p class="dim">Poziomy na tablicy: ${unlocked.map(i => DL[i]).join(', ')}. ${top < 2 ? 'Bossowie pojawią się, gdy któryś bohater osiągnie Poziom 2.' : 'Bossowie mogą pojawić się na tablicy.'}</p>
      ${Store.isGM() ? `<div class="row"><button class="btn primary" data-act="rollBoard">Losuj tablicę na ten tydzień</button><span class="muted small">3 zadania, w miarę możliwości w różnych otwartych regionach; długość k10 (1–4 krótka, 5–8 średnia, 9–10 długa), cel k10 (1–3 eksploracja, 4–6 oczyszczenie, 7–8 zbiórka, 9 aktywacja, 10 boss).</span></div>` : ''}
      <div class="quests">${(o.board || []).map(q => questCard(q)).join('') || '<p class="muted">Tablica jest pusta. MG losuje zadania na początku tygodnia.</p>'}</div></section>`;
  },
  dungeon() {
    const w = Store.S.wyprawa; const W = Store.canWrite();
    if (!w.quest) return `<section class="panel"><h2>Mapa wyprawy</h2><p class="muted">Drużyna jest w Osadzie. Wybierzcie zadanie z tablicy, spakujcie plecak i ruszajcie.</p></section>`;
    const q = w.quest; const isDD = q.dd != null; const R = isDD ? null : REGIONS[q.region];
    const at = w.rooms.find(r => r.id === w.at); const sup = w.sup || {};
    const L = w.loot || {};
    const visited = w.rooms.filter(r => r.visited).length;
    return `<div class="dgrid"><div class="stack">
      <section class="panel"><h2>${esc(isDD ? DD_FLOORS[q.dd].name : R.locs[q.dl].name)} <span class="hint">${isDD ? 'piętro ' + (q.dd + 1) : esc(R.name) + ' · ' + DL[q.dl]} · ${esc(goalText(q))}</span></h2>
        ${(() => { const g = goalProgress(w); return `<div class="goalbar ${g.ok ? 'ok' : ''}"><span class="lbl">Cel</span> ${esc(goalText(q))}${g.txt ? ` — <b>${esc(g.txt)}</b>` : ''} ${g.ok ? '<span class="chip sm gold">wykonany — możecie wracać</span>' : ''}</div>`; })()}
        ${eventBanner()}
        ${lootCardHtml()}
        ${Store.S.wyprawa.pending ? '' : scoutBar()}
        ${dungeonSvg()}
        <p class="small muted">Kliknij sąsiednią komnatę, żeby przejść korytarzem: Pochodnia −1, zwiad, zdarzenie, co czwarty korytarz głód. Odwiedzone: ${visited} z ${w.rooms.length}. Korytarzy za wami: ${w.crossed}.</p>
      </section>
      ${campPanel()}</div>
      <div class="stack">
        <section class="panel"><h2>Komnata <span class="hint">${at ? esc(at.c) : ''}</span></h2>${this.roomPanel(at)}</section>
        <section class="panel"><h2>Plecak <span class="hint ${packSlots(sup, L) > 16 ? 'bad' : ''}">${packSlots(sup, L)} z 16 miejsc</span></h2>
          ${packSlots(sup, L) > 16 ? `<p class="warn small">Plecak jest przepełniony. Wyrzućcie coś, zanim pójdziecie dalej — łup się nie mieści.${W ? ' <button class="btn sm gold" data-act="freeSlot">Zwolnij miejsce</button>' : ''}</p>` : ''}
          <div class="supgrid">${SUPPLY.map(([k]) => `<div class="sup"><span>${k}</span><span class="row">${W ? `<button class="btn sm ghost" data-act="supAdj" data-k="${k}" data-v="-1" title="Wyrzuć jedną sztukę">−</button>` : ''}<b class="num">${sup[k] || 0}</b>${Store.isGM() ? `<button class="btn sm ghost" data-act="supAdj" data-k="${k}" data-v="1" title="Poprawka MG">+</button>` : ''}</span></div>`).join('')}
            <div class="sup"><span>Drewno</span><b class="num">${w.campsLeft || 0}</b></div></div>
          ${lootStrip()}
          <div class="row"><input type="number" id="scoutB" value="${UI.scoutB || 0}" min="-3" max="6" style="width:4.5em" aria-label="Premia do zwiadu"><span class="small muted">premia do najbliższego zwiadu (Tropienie +2, Rozpoznanie +3…)</span></div>
        </section>
        ${this.scoutPanel()}
        ${W ? `<section class="panel"><h2>Koniec wyprawy</h2><div class="row"><button class="btn primary" data-act="endQuest" data-v="done" ${goalProgress(w).ok || Store.isGM() ? '' : 'disabled title="Cel jeszcze niespełniony"'}>Zadanie wykonane</button><button class="btn" data-act="endQuest" data-v="leave">Wyjście bez zadania (+3 Stres)</button></div><p class="small muted">${goalProgress(w).ok ? 'Cel wykonany.' : 'Cel: ' + esc(goalProgress(w).txt) + '.'} Wyjść bez zadania można z pustej albo oczyszczonej komnaty.</p></section>` : ''}
      </div></div>`;
  },
  scoutPanel() {
    const w = Store.S.wyprawa; const W = Store.canWrite(); if (!w.at) return '';
    const byId = Object.fromEntries(w.rooms.map(r => [r.id, r]));
    const adj = w.edges.map((e, i) => [e, i]).filter(([e]) => e.a === w.at || e.b === w.at);
    const pt = party(); const sc = scoutChance(Store.S.stol, pt);
    const rows = adj.map(([e, i]) => {
      const to = byId[e.a === w.at ? e.b : e.a];
      const lbl = to.visited || to.seen ? to.c : 'nieznana komnata';
      const st = e.crossed ? 'przebyty' : e.scout ? (e.scout.ok ? 'zwiad udany (k10 = ' + e.scout.r + ' ≤ ' + e.scout.chance + '): ' + e.scout.ev.text : 'zwiad nieudany (k10 = ' + e.scout.r + ' przy Szansie ' + e.scout.chance + ')') : '';
      return `<div class="scout-row"><span>→ <b>${esc(lbl)}</b>${st ? ` <span class="muted small">(${esc(st)})</span>` : ''}</span>${W && !e.crossed && !e.scout ? `<button class="btn sm gold" data-act="scout" data-i="${i}" ${sc.chance ? '' : 'disabled'}>Zwiad</button>` : ''}</div>`;
    }).join('');
    return `<section class="panel"><h2>Korytarze <span class="hint">Szansa zwiadu ${sc.chance}${sc.bonus ? ' (w tym premia ' + sc.bonus + ')' : ''} · ${sc.name}</span></h2>
      <p class="small muted">Każdy korytarz można zwiadować raz: przed wejściem albo samo przejście zrobi to za was. Udany zwiad zdradza komnatę za korytarzem i to, co czeka w nim samym (pułapkę da się wtedy rozbroić). Przy Pochodni 0 zwiad jest niemożliwy.</p>
      ${rows || '<p class="muted">Stąd nie prowadzi żaden korytarz.</p>'}</section>`;
  },
  roomPanel(r) {
    if (!r) return '';
    const W = Store.canWrite(); const w = Store.S.wyprawa;
    const bits = [];
    if (r.desc) bits.push(`<p class="rdesc">${esc(r.desc)}</p>`);
    if (r.feature && !r.featureDone) bits.push(featureBox(r));
    if (r.item && !r.itemTaken) bits.push(`<p>Leży tu: <b>${esc(r.item)}</b>. ${W ? `<button class="btn sm gold" data-act="takeItem">Zabierz</button>` : ''}</p>`);
    if (/walka|boss/.test(r.c) && !r.cleared) bits.push(`<p>${r.c === 'boss' ? 'Tu czeka boss.' : 'W komnacie czają się wrogowie.'} ${W ? `<button class="btn sm primary" data-act="roomFight">${r.c === 'boss' ? 'Boss!' : 'Do walki'}</button>` : ''}</p>`);
    const fightHere = /walka|boss/.test(r.c) && !r.cleared;
    [['curio', !r.curioDone], ['ccurio', !r.ccurioDone]].forEach(([f, open]) => {
      if (!r[f] || !open) return;
      bits.push(`<div class="curiobox"><p>Osobliwość${f === 'ccurio' ? ' z korytarza' : ''}: <b>${esc(r[f])}</b>${f === 'curio' && r.goal ? ' (cel zadania)' : ''}.</p>
        ${fightHere ? '<p class="muted small">Najpierw walka — osobliwość poczeka.</p>' : `<button class="btn sm gold" data-act="sceneShow" data-k="${r.id}:${f}">Podejdź do osobliwości</button>`}</div>`);
    });
    if (r.c === 'skrzynia' && !r.opened) bits.push(`<p>Skrzynia. ${W ? `<button class="btn sm gold" data-act="chest">Otwórz</button>` : ''}</p>`);
    if (/pusta|wejście/.test(r.c) && !r.desc) bits.push('<p class="muted">Pusto. Cisza i kurz.</p>');
    if (W) bits.push(`<div class="row">${Store.isGM() ? `<label class="chk" title="Poprawka MG — po wygranej walce komnata oczyszcza się sama"><input type="checkbox" data-act-change="roomClear" ${r.cleared ? 'checked' : ''}> oczyszczona</label>` : r.cleared ? '<span class="chip sm">oczyszczona</span>' : ''}
      ${(w.campsLeft || 0) > 0 && (r.cleared || !/walka|boss/.test(r.c)) ? `<button class="btn sm" data-act="camp">Rozbij obóz</button>` : ''}
      ${Store.isGM() ? `<button class="btn sm ghost" data-act="roomLoot" title="Dodatkowy rzut na łup — decyzja MG">Rzut na łup (MG)</button>` : ''}</div>`);
    return bits.join('');
  }
};


/* ---------- wydarzenia wyprawy: głód i wydarzenia w drodze (decyzje o zasobach) ---------- */
const ROAD_EVENTS = [
  { key: 'ranny', title: 'Ranny nieznajomy', text: 'W ciemności ktoś jęczy — obcy z rozprutym bokiem, ostatni z innej drużyny.',
    opts: [{ id: 'opatrz', label: 'Opatrzcie go', cost: { 'Bandaże': 1 } }, { id: 'zostaw', label: 'Zostawcie go', note: 'każdy +1 Stres' }] },
  { key: 'wilgoc', title: 'Wilgoć w plecaku', text: 'Woda kapie ze stropu prosto na zapasy. Prowiant zaczyna gnić.',
    opts: [{ id: 'susz', label: 'Osuszcie przy ogniu', cost: { 'Pochodnie': 1 }, note: 'pochodnia idzie na suszenie' }, { id: 'strac', label: 'Trudno', note: 'tracicie k4 prowiantu' }] },
  { key: 'szepty', title: 'Szepty w ścianach', text: 'Ze ścian dochodzą głosy. Każdy słyszy swoje imię.',
    opts: [{ id: 'laud', label: 'Laudanum dla wszystkich', cost: { 'Laudanum': 1 } }, { id: 'znies', label: 'Znieście to', note: 'każdy +1 Stres' }] },
  { key: 'strop', title: 'Osuwający się strop', text: 'Belki trzeszczą, sypie się żwir. Zaraz runie.',
    opts: [{ id: 'lopata', label: 'Podeprzyjcie łopatą', cost: { 'Łopaty': 1 } }, { id: 'biegiem', label: 'Biegiem!', note: 'każdy −2 Zdrowia, Pochodnia −1' }] },
  { key: 'szczury', title: 'Szczury w zapasach', text: 'Stado szczurów rzuca się na plecak.',
    opts: [{ id: 'oddaj', label: 'Oddajcie im prowiant', cost: { 'Prowiant': 2 } }, { id: 'bron', label: 'Brońcie zapasów', note: 'losowy bohater −2 Zdrowia, ugryzienie: rzut Odporności przeciw chorobie' }] },
  { key: 'oboz', title: 'Porzucony obóz', text: 'Wygasłe ognisko, porwane sakwy. Ktoś tu nocował i nie wrócił.',
    opts: [{ id: 'szukaj', label: 'Przeszukajcie', note: 'k10: 1–4 zapasy, 5–7 nic, 8–10 pułapka' }, { id: 'mijaj', label: 'Mińcie go' }] }
];
const pendingTitle = p => p.type === 'glod' ? 'Głód' : (ROAD_EVENTS.find(e => e.key === p.key) || {}).title || 'wydarzenie';
function eventBanner() {
  const w = Store.S.wyprawa; const p = w.pending; if (!p || !w.quest) return '';
  const W = Store.canWrite(); const sup = w.sup || {};
  if (p.type === 'glod') {
    const need = p.eaters.reduce((a, x) => a + x.need, 0); const food = sup.Prowiant || 0;
    return `<div class="eventbox"><div class="ev-h"><span class="lbl">Wydarzenie</span> <b>Głód</b></div>
      <p>Minęły kolejne cztery korytarze. Każdy bohater potrzebuje prowiantu, a kto nie zje, dostaje <b>+2 Stres i −2 Zdrowia</b> (nie poniżej 1).</p>
      <p>Potrzeba <b class="num">${need}</b> prowiantu, w plecaku <b class="num">${food}</b>.</p>
      ${W ? `<div class="ev-eat">${p.eaters.map(x => { const h = H(x.id); return `<label class="chk"><input type="checkbox" data-eat="${x.id}" checked> ${esc(heroLabel(h))} <span class="muted small">${x.need} prowiant${x.need > 1 ? 'y' : ''}${x.why ? ' (' + esc(x.why) + ')' : ''} · Zdr ${h.hp}, Stres ${h.stress}</span></label>`; }).join('')}</div>
      <div class="row"><button class="btn primary" data-act="evHunger">Jedzą zaznaczeni</button><span class="muted small">Odznacz tych, którzy oddadzą swoją porcję.</span></div>` : '<p class="muted">Drużyna decyduje…</p>'}</div>`;
  }
  const E = ROAD_EVENTS.find(e => e.key === p.key); if (!E) return '';
  return `<div class="eventbox"><div class="ev-h"><span class="lbl">Wydarzenie w drodze</span> <b>${esc(E.title)}</b></div><p>${esc(E.text)}</p>
    ${W ? voteRow('road:' + p.id, E.opts.map(o => { const lack = o.cost && Object.entries(o.cost).some(([k, v]) => (sup[k] || 0) < v); const c = o.cost ? Object.entries(o.cost).map(([k, v]) => '−' + v + ' ' + k.toLowerCase()).join(', ') : ''; return { id: o.id, label: o.label + (lack ? ' (brak w plecaku)' : ''), note: [c, o.note].filter(Boolean).join('; '), dis: lack }; }), 'road') : '<p class="muted">Drużyna decyduje…</p>'}</div>`;
}
function resolveRoad(optId) {
  const s = Store.S; const w = clone(s.wyprawa); const st = clone(s.stol); const p = w.pending; const E = ROAD_EVENTS.find(e => e.key === p.key);
  const o = E.opts.find(x => x.id === optId); const lines = ['**' + E.title + '** — drużyna wybiera: **' + o.label + '**.']; const touched = {};
  const pt = st.heroes.map(id => s.heroes[id]).filter(h => h && !h.dead); const T = id => touched[id] || (touched[id] = clone(s.heroes[id]));
  if (o.cost) Object.entries(o.cost).forEach(([k, v]) => { w.sup[k] = Math.max(0, (w.sup[k] || 0) - v); lines.push('Zużyto: ' + v + ' × ' + k.toLowerCase() + '.'); });
  const allStress = n => pt.forEach(h => heroStress(T(h.id), n, lines));
  if (optId === 'opatrz') { const r = d(10); if (r <= 5) { const g = d(6) + 2; w.loot.zloto = (w.loot.zloto || 0) + g; lines.push('k10 = **' + r + '** → nieznajomy wciska wam sakiewkę: **' + g + ' Złota** (k6+2) i szepcze o ukrytym przejściu — następny zwiad +2.'); UI.scoutB = (UI.scoutB || 0) + 2; } else lines.push('k10 = **' + r + '** → umiera wam na rękach. Przynajmniej nie sam.'); }
  if (optId === 'zostaw') { allStress(1); lines.push('Jęki niosą się za wami: każdy +1 Stres.'); }
  if (optId === 'strac') { const r = d(4); w.sup.Prowiant = Math.max(0, (w.sup.Prowiant || 0) - r); lines.push('Gnije k4 = **' + r + '** prowiantu (zostało ' + w.sup.Prowiant + ').'); }
  if (optId === 'znies') { allStress(1); lines.push('Każdy +1 Stres.'); }
  if (optId === 'laud') lines.push('Laudanum krąży z rąk do rąk. Głosy cichną.');
  if (optId === 'biegiem') { pt.forEach(h => { const t = T(h.id); t.hp = Math.max(1, t.hp - 2); }); st.torch = Math.max(0, st.torch - 1); lines.push('Każdy −2 Zdrowia, Pochodnia −1.'); }
  if (optId === 'oddaj') lines.push('Szczury zajmują się prowiantem, wy idziecie dalej.');
  if (optId === 'bron') { const pv = pickD(pt); const t = T(pv.v.id); t.hp = Math.max(1, t.hp - 2); const st2 = heroStats(t); const r = d(10); const ok = r === 1 || (r !== 10 && r <= st2.odp); lines.push('Ugryziony (' + pv.t + '): **' + heroLabel(t) + '**, −2 Zdrowia. Odporność: k10 = **' + r + '** przy ' + st2.odp + ' → ' + (ok ? 'bez choroby.' : '**choroba**!')); if (!ok) { const pz = pickD(DATA.diseases); t.diseases = (t.diseases || []).concat([pz.v]); lines.push('Choroba (' + pz.t + '): ' + pz.v + '.'); } }
  if (optId === 'szukaj') { const r = d(10); if (r <= 4) { const a = pickD(SUP_KEYS), b = pickD(SUP_KEYS); [a, b].forEach(x => { w.sup[x.v] = (w.sup[x.v] || 0) + (x.v === 'Prowiant' ? 2 : 1); }); lines.push('k10 = **' + r + '** → zapasy: ' + a.v.toLowerCase() + ' (' + a.t + ') i ' + b.v.toLowerCase() + ' (' + b.t + ').'); } else if (r <= 7) lines.push('k10 = **' + r + '** → nic, prócz cudzych kości.'); else { const pv = pickD(pt); const dmg = d(4); lines.push('k10 = **' + r + '** → pułapka! Trafia ' + heroLabel(pv.v) + ' (' + pv.t + '): k4 = **' + dmg + '**.'); heroDamage(T(pv.v.id), dmg, lines, 'pułapka'); } }
  if (optId === 'mijaj') lines.push('Lepiej nie wiedzieć, co ich spotkało.');
  w.pending = null;
  Store.act([opSet('wyprawa', w)], { quiet: true });
  commit({ lines, stol: st, touched }, '');
}
function resolveHunger() {
  const s = Store.S; const w = clone(s.wyprawa); const p = w.pending; const lines = ['**Głód.**']; const touched = {};
  const eat = new Set($$('[data-eat]').filter(i => i.checked).map(i => i.dataset.eat));
  const need = p.eaters.filter(x => eat.has(x.id)).reduce((a, x) => a + x.need, 0);
  if (need > (w.sup.Prowiant || 0)) return toast('Za mało prowiantu dla zaznaczonych (' + need + ' z ' + (w.sup.Prowiant || 0) + '). Odznacz kogoś.');
  w.sup.Prowiant = (w.sup.Prowiant || 0) - need;
  p.eaters.forEach(x => { const t = touched[x.id] = clone(s.heroes[x.id]); if (eat.has(x.id)) lines.push(heroLabel(t) + ' je (' + x.need + ').'); else { lines.push(heroLabel(t) + ' oddaje porcję: +2 Stres, −2 Zdrowia.'); heroStress(t, 2, lines); t.hp = Math.max(1, t.hp - 2); } });
  lines.push('W plecaku zostało ' + w.sup.Prowiant + ' prowiantu.');
  w.pending = null;
  Store.act([opSet('wyprawa', w)], { quiet: true });
  commit({ lines, stol: null, touched }, '');
}

/* ---------- akcje wyprawy ---------- */
function setW(fn, text, cls) { const w = clone(Store.S.wyprawa); fn(w); const ops = [opSet('wyprawa', w)]; if (text) ops.push({ log: { id: uid(), t: Date.now(), by: byName(), uid: Store.me.id, kind: 'roll', cls: cls || '', text } }); Store.act(ops); }
function party() { return Store.S.stol.heroes.map(H).filter(h => h && !h.dead); }
Object.assign(ACT, {
  wsub: el => { UI.wsub = el.dataset.v; renderView(); },
  mapSel: el => {
    UI.mapSel = { r: el.dataset.r, l: el.dataset.l === 'lair' ? 'lair' : el.dataset.l != null ? +el.dataset.l : null };
    const sel = UI.mapSel; const here = (Store.S.osada.board || []).filter(q => q.region === sel.r && (sel.l === 'lair' ? q.goal === 'boss' : q.dl === sel.l && q.goal !== 'boss'));
    if (here.length === 1 && Store.canWrite() && !Store.S.wyprawa.quest) return ACT.takeQuest({ dataset: { id: here[0].id } });
    renderView(); const pn = document.querySelector('.mapgrid > .panel:last-child'); if (pn && window.innerWidth < 900) pn.scrollIntoView({ behavior: 'smooth', block: 'start' });
  },
  ddSet: el => Store.act([opSet('osada.dd', +el.dataset.v)]),
  rollBoard: () => rollBoard(),
  evPick: el => resolveRoad(el.dataset.o),
  evHunger: () => resolveHunger(),
  goRoom: el => {
    const w = Store.S.wyprawa; if (w.pending) return toast('Najpierw rozstrzygnijcie wydarzenie: ' + pendingTitle(w.pending) + '.');
    if (w.camp) return toast('Najpierw zakończcie obóz (noc).');
    if (Store.S.stol.fight && !Store.S.stol.enemies.some(e => !e.corpse)) ACT.fightEnd();
    if (Store.S.stol.enemies.some(e => !e.corpse)) { toast('Na Stole czekają wrogowie — najpierw walka.'); return goFight(); }
    const at = w.rooms.find(r => r.id === w.at); if (at && /walka|boss/.test(at.c) && !at.cleared && at.id !== 'r0' && w.prev !== el.dataset.id) return toast('W tej komnacie czekają wrogowie — walczcie albo wycofajcie się tam, skąd przyszliście.');
    if (packSlots(w.sup, w.loot) > 16) return toast('Plecak jest przepełniony (' + packSlots(w.sup, w.loot) + ' z 16) — wyrzućcie coś.');
    crossTo(el.dataset.id);
  },
  scoutAny: () => {
    const list = scoutable(); if (!list.length) return toast('Wszystkie korytarze stąd są już zwiadowane albo przebyte.');
    if (list.length === 1) return ACT.scout({ dataset: { i: list[0].i } });
    modal(`<h3>Zwiad</h3><p class="dim">Który korytarz zwiadować? Szansa ${scoutChance(Store.S.stol, party()).chance}.</p><div class="flist">${list.map(x => `<button class="btn scoutbtn" data-mb-scout="${x.i}">Zwiad → ${esc(x.to.visited || x.to.seen ? x.to.c : 'nieznana komnata')}</button>`).join('')}</div>`, [{ t: 'Anuluj' }]);
    $$('[data-mb-scout]').forEach(b => b.addEventListener('click', () => { closeModal(); ACT.scout({ dataset: { i: b.dataset.mbScout } }); }));
  },
  scout: el => {
    if (Store.S.wyprawa.pending) return toast('Najpierw rozstrzygnijcie wydarzenie: ' + pendingTitle(Store.S.wyprawa.pending) + '.');
    const w = clone(Store.S.wyprawa); const e = w.edges[+el.dataset.i]; if (!e || e.crossed || e.scout) return;
    const destId = e.a === w.at ? e.b : e.a; const dest = w.rooms.find(r => r.id === destId); const lines = [];
    const sv = $('#scoutB'); if (sv) UI.scoutB = +sv.value || 0;
    UI._hiddenFind = null; scoutCorridor(w, Store.S.stol, e, dest, party(), lines);
    const hf = UI._hiddenFind; UI._hiddenFind = null;
    Store.act([opSet('wyprawa', w)].concat(hf ? [opSet('stol.lastLoot', { id: uid(), t: Date.now(), why: hf.why, items: hf.items, tot: lootTotals(hf.x, DL_INFO[w.quest.dl].mult), dest: 'plecak wyprawy' })] : []).concat([ { log: { id: uid(), t: Date.now(), by: byName(), uid: Store.me.id, kind: 'roll', cls: e.scout.ok ? 'good' : '', text: lines.join(' ') } }]));
  },
  roomSel: () => { },
  supAdj: el => { if (+el.dataset.v > 0 && !Store.isGM()) return toast('Zapasy kupuje się przed wyprawą albo zdobywa w lochu.'); const k = el.dataset.k; const v = Math.max(0, ((Store.S.wyprawa.sup || {})[k] || 0) + +el.dataset.v); Store.act([opSet('wyprawa.sup.' + k, v)]); },
  takeItem: () => setW(w => { const r = w.rooms.find(x => x.id === w.at); r.itemTaken = true; w.found = (w.found || 0) + 1; }, 'Drużyna zabiera: **' + Store.S.wyprawa.rooms.find(x => x.id === Store.S.wyprawa.at).item + '** (' + ((Store.S.wyprawa.found || 0) + 1) + ' z 3).', 'good'),
  roomFight: () => {
    const w = Store.S.wyprawa; const q = w.quest; const r = w.rooms.find(x => x.id === w.at);
    const region = q.dd != null ? 'DD' : REGIONS[q.region].key;
    const st = clone(Store.S.stol); st.region = region; st.dl = q.dl; st.floor = q.dd || 0;
    st.enemies = r.c === 'boss' ? bossSetup(region, q.dl, q.dd || 0) : rollEncounter(region, q.dl).list.filter(Boolean);
    st.roomId = r.id; st.looted = false; st.lootBonus = 0;
    Store.act([opSet('stol', st), { log: { id: uid(), t: Date.now(), by: byName(), uid: Store.me.id, kind: 'roll', cls: 'bad', text: (r.c === 'boss' ? '**Boss!** ' : 'Wrogowie w komnacie: ') + st.enemies.map(e => e.name).join(', ') + '. Przejdźcie na Stół.' } }]);
    if (r.c === 'boss') ancestorSay('boss');
    goFight();
  },
  curio: el => { const f = el.dataset.f || 'curio'; const it = $('#citem-' + f); resolveCurio(f, el.dataset.m, it ? it.value : null); },
  chest: () => {
    setW(w => { w.rooms.find(x => x.id === w.at).opened = true; });
    const klep = party().find(h => h.qn.some(q => qname(q.t) === 'Kleptoman'));
    if (klep) { const r = d(10); if (r <= 3) return rollLog('Skrzynia: k10 = ' + r + ' → łup znika w kieszeni **' + heroLabel(klep) + '** (Kleptoman).', 'bad'); }
    rollLoot(2 + (party().some(h => CLS[h.cls].name === 'Antykwariuszka') ? 1 : 0), 'skrzynia');
  },
  roomLoot: () => { if (!Store.isGM()) return; const ti = torchInfo(Store.S.stol.torch); const extra = { 'Jasno': -1, 'Półmrok': 0, 'Cienie': 1, 'Mrok': 1, 'Ciemność': 2 }[ti.name]; rollLoot(Math.max(0, 1 + extra), 'komnata, Pochodnia ' + ti.name); },
  camp: () => {
    if (Store.S.wyprawa.camp) return toast('Obóz już trwa.');
    if (Store.S.stol.enemies.some(e => !e.corpse)) return toast('Najpierw rozstrzygnijcie walkę.');
    modal(`<h3>Obóz</h3><p>Posiłek dla ${party().length} bohaterów:</p>
      <div class="flist"><label class="chk"><input type="radio" name="meal" value="1" checked> Skromny (po 1 prowiancie): +2 Zdrowia każdemu</label>
      <label class="chk"><input type="radio" name="meal" value="2"> Uczta (po 2): +4 Zdrowia i −1 Stres</label>
      <label class="chk"><input type="radio" name="meal" value="0"> Bez jedzenia: +2 Stres każdemu</label></div>
      <label class="chk"><input type="checkbox" id="fireout"> Zgaście ognisko na noc (zasadzka przy 1–4, ale to wrogowie są zaskoczeni i +2 rzuty na łup)</label>
      <p class="dim small">Po posiłku rozdacie 12 Punktów Odpoczynku na umiejętności obozowe — każdy bohater użyje każdej najwyżej raz.</p>`,
      [{ t: 'Anuluj' }, { t: 'Rozbij obóz', cls: 'primary', fn: () => {
        const meal = +$('input[name=meal]:checked').value; const out = $('#fireout').checked;
        const pt = party(); const w = clone(Store.S.wyprawa); const lines = ['**Obóz.**']; const touched = {};
        const need = meal * pt.length; const have = (w.sup.Prowiant || 0);
        const m = need > have ? 0 : meal; if (need > have) lines.push('Za mało prowiantu na ten posiłek.');
        w.sup.Prowiant = have - (m * pt.length); w.campsLeft = (w.campsLeft || 1) - 1;
        pt.forEach(h0 => {
          const h = touched[h0.id] = clone(h0); const l = [];
          const racje = pt.some(x => x.camp.includes('Racje')) ? 1 : 0;
          if (m === 1) heroHeal(h, 2 + racje, l); if (m === 2) { heroHeal(h, 4 + racje, l); heroStress(h, -1, l); } if (m === 0) heroStress(h, 2, l);
          l.forEach(x => lines.push(x));
        });
        lines.push(m === 1 ? 'Skromny posiłek: +2 Zdrowia.' : m === 2 ? 'Uczta: +4 Zdrowia, −1 Stres.' : 'Bez jedzenia: +2 Stres.');
        pt.filter(x => x.state && x.state.kind === 'affliction' && x.state.name === 'Agresja').forEach(ag => { lines.push(heroLabel(ag) + ' (Agresja) wszczyna kłótnię przy ognisku: pozostali +1 Stres.'); pt.filter(x => x.id !== ag.id).forEach(x => { const t = touched[x.id] || (touched[x.id] = clone(x)); heroStress(t, 1, lines); }); });
        w.camp = { pts: 12, used: {}, fireOut: out };
        lines.push('Drużyna ma **12 Punktów Odpoczynku** na umiejętności obozowe (panel Obóz), potem noc' + (out ? ' przy zgaszonym ognisku' : '') + '.');
        Store.act([opSet('wyprawa', w)], { quiet: true });
        commit({ lines, stol: null, touched }, 'good');
      } }]);
  },
  endQuest: el => {
    const done = el.dataset.v === 'done'; const w = Store.S.wyprawa; const q = w.quest; const rw = questReward(q);
    const at = w.rooms.find(r => r.id === w.at);
    if (!done && at && /walka|boss/.test(at.c) && !at.cleared) return toast('Z lochu wychodzi się z pustej albo oczyszczonej komnaty — tu czekają wrogowie. Cofnijcie się korytarzem do poprzedniej komnaty i wtedy wyjdźcie.');
    if (Store.S.stol.fight) return toast('Najpierw zakończcie walkę.');
    if (done) {
      const g = goalProgress(w);
      if (!g.ok && !Store.isGM()) return toast('Cel jeszcze niespełniony: ' + g.txt + '.');
      if (!g.ok) return confirmBox('Cel niespełniony', 'Postęp: ' + g.txt + '. Zakończyć jako wykonane mimo to (decyzja MG)?', 'Tak, wykonane', () => finishQuest(true));
    }
    confirmBox(done ? 'Zadanie wykonane?' : 'Wyjść bez wykonania zadania?', done ? 'Drużyna wraca z nagrodą: ' + rw.gold + ' Złota, ' + rw.mem + ' pamiątki i +' + rw.xp + ' doświadczenia dla każdego. Niewykorzystane zapasy przepadają.' : 'Drużyna zatrzymuje łupy, ale traci nagrodę, a każdy bohater dostaje +3 Stresu.', done ? 'Wracamy' : 'Wychodzimy', () => finishQuest(done));
  }
});
document.addEventListener('change', ev => {
  const el = ev.target; const a = el.dataset && el.dataset.actChange;
  if (a === 'regionOpen') { const o = Store.S.osada; const list = (o.regions || []).filter(x => x !== el.value).concat(el.checked ? [el.value] : []); Store.act([opSet('osada.regions', list)]); }
  if (a === 'roomClear' && Store.isGM()) setW(w => { w.rooms.find(x => x.id === w.at).cleared = el.checked; });
});
function startQuest(q, sup, cost) {
  const g = genDungeon(q);
  const o0 = Store.S.osada;
  const w = { quest: q, rooms: g.rooms, edges: g.edges, at: 'r0', crossed: 0, sup, loot: { zloto: 0, klejnoty: 0, pamiatki: 0, inne: [] }, campsLeft: QUEST_LEN[q.len].camps, found: 0, activated: 0, cultists: !!o0.cultists, rumor: !!o0.rumor };
  const st = clone(Store.S.stol); st.torch = 10; st.region = q.dd != null ? 'DD' : REGIONS[q.region].key; st.dl = q.dl; st.floor = q.dd || 0;
  Object.assign(st, { enemies: [], fight: false, init: [], turn: -1, round: 0, acted: null, last: null, roomId: null, looted: false });
  const ops = [opSet('wyprawa', w), opSet('stol', st), opSet('osada.gold', Store.S.osada.gold - cost), opSet('osada.board', (Store.S.osada.board || []).filter(x => x.id !== q.id)), opSet('osada.cultists', false), opSet('osada.rumor', false)];
  if (w.cultists) ops.push({ log: { id: uid(), t: Date.now(), by: byName(), uid: Store.me.id, kind: 'sys', text: 'Kultyści na trakcie: w pierwszym korytarzu czeka dodatkowa walka.' } });
  if (w.rumor) ops.push({ log: { id: uid(), t: Date.now(), by: byName(), uid: Store.me.id, kind: 'sys', text: 'Plotka z Osady: pierwszy rzut na łup tej wyprawy dostaje +1 rzut.' } });
  party().forEach(h => { const h2 = clone(h); h2.status = 'wyprawa'; ops.push(opSet('heroes.' + h.id, h2)); });
  ops.push({ log: { id: uid(), t: Date.now(), by: byName(), uid: Store.me.id, kind: 'sys', text: '**Wyprawa:** ' + (q.dd != null ? DD_FLOORS[q.dd].name : REGIONS[q.region].locs[q.dl].name) + ' (' + goalText(q) + '). Zaopatrzenie za ' + cost + ' Złota. Pochodnia 10.' } });
  UI.wsub = 'loch'; Store.act(ops);
}
function scoutable() {
  const w = Store.S.wyprawa; if (!w.quest || !w.at) return [];
  const byId = Object.fromEntries(w.rooms.map(r => [r.id, r]));
  return w.edges.map((e, i) => ({ e, i, to: byId[e.a === w.at ? e.b : e.a] })).filter(x => (x.e.a === w.at || x.e.b === w.at) && !x.e.crossed && !x.e.scout);
}
function scoutBar() {
  const list = scoutable(); const W = Store.canWrite(); if (!W || !list.length) return '';
  const sc = scoutChance(Store.S.stol, party());
  return `<div class="scoutbar"><div><span class="lbl">Zwiad</span> <b class="sc-ch">Szansa ${sc.chance}</b> <span class="muted small">${esc(sc.name)}${sc.bonus ? ', premia ' + sc.bonus : ''} · każdy korytarz raz</span></div>
    <div class="row">${list.map(x => `<button class="btn scoutbtn" data-act="scout" data-i="${x.i}" ${sc.chance ? '' : 'disabled title="W Ciemności zwiad jest niemożliwy"'}>Zwiad → ${esc(x.to.visited || x.to.seen ? x.to.c : 'nieznana komnata')}</button>`).join('')}</div></div>`;
}
/* zwiad korytarza: rzut na Szansę Zwiadu z Pochodni, zdarzenie losowane od razu, ukryta komnata po sukcesie */
function scoutChance(st, pt) {
  const ti = torchInfo(st.torch); const bonus = (+UI.scoutB || 0) + ((Store.S.wyprawa || {}).scoutBonus || 0) + (pt.some(h => h.trinkets.some(t => t.name === 'Kompas ślepca')) ? 2 : 0);
  return { chance: ti.scout ? ti.scout + bonus : 0, base: ti.scout, bonus, name: ti.name };
}
function scoutCorridor(w, st, e, dest, pt, lines) {
  const sc = scoutChance(st, pt);
  const r = d(10); const ok = sc.chance > 0 && (r === 1 || (r !== 10 && r <= sc.chance));
  const ev = rollTable('korytarz');
  e.scout = { ok, r, chance: sc.chance, ev: { r: ev.r, text: ev.text } };
  lines.push('**Zwiad** (' + sc.name + ', Szansa ' + sc.chance + (sc.bonus ? ', w tym premia ' + sc.bonus : '') + '): k10 = **' + r + '** → ' + (ok ? '**udany**' : (sc.chance ? 'nieudany' : 'niemożliwy w Ciemności')) + '.');
  if (ok) {
    dest.seen = true; lines.push('Za korytarzem: **' + dest.c + '**. ' + (ev.text === 'pułapka' ? 'W korytarzu jest **pułapka** — da się ją rozbroić.' : ev.text === 'zasadzka' ? 'W korytarzu czai się **zasadzka**.' : ev.text === 'przeszkoda' ? 'Korytarz blokuje **przeszkoda**.' : ev.text === 'osobliwość' ? 'W korytarzu stoi **osobliwość**.' : 'Korytarz wygląda na pusty.'));
    const hr = d(10); const lim = w.dig ? 3 : 1;
    if (hr <= lim) {
      const t = rollTable('ukryta'); let find = t.text; const mult = DL_INFO[w.quest.dl].mult; const x = { gold: 0, gems: 0, mem: {}, trinkets: [] };
      if (t.r <= 2) { const g = d(6); x.gold = Math.ceil((g + 4) * mult); find = 'drobiazg wart ' + (g + 4) + ' Złota (k6 = **' + g + '**)'; }
      else if (t.r <= 4) { const g = d(6); x.gems = 1; x.gold = Math.ceil(g * mult); find = 'klejnot i ' + g + ' Złota (k6 = **' + g + '**)'; }
      else if (t.r <= 6) { const pm = pickD(MEM_TYPES); x.gems = 2; x.mem[pm.v] = 1; find = '2 klejnoty i pamiątka: ' + pm.v + ' (k4 = **' + pm.r + '**)'; }
      else {
        const k = rollTable('blyskotka');
        if (k.r <= 9) { const kind = k.r <= 5 ? 'common' : 'rare'; const r6 = d(6); const tr = Object.assign({ kind, value: kind === 'rare' ? 15 : 10 }, DATA.trinkets[kind][r6 - 1]); x.trinkets.push(tr); find = 'błyskotka ' + (kind === 'rare' ? 'rzadka' : 'zwykła') + ' (k10 = **' + k.r + '**, k6 = **' + r6 + '**): ' + tr.name; }
        else { const p4 = d(4); const hid = st.heroes[p4 - 1]; const hh = hid && Store.S.heroes[hid]; const cls = hh ? hh.cls : pick(CLS.map((c, i) => i)); x.trinkets.push({ kind: 'class', cls, skill: null, name: 'Pamiątka mistrza: ' + CLS[cls].name, value: 20 }); find = 'błyskotka klasowa (k10 = **10**, k4 = **' + p4 + '** → ' + CLS[cls].name + '); umiejętność wybierzecie w Osadzie'; }
      }
      addLootTo(w.loot, x);
      lines.push('**Ukryta komnata!** (k10 = **' + hr + '**) Znalezisko: k10 = **' + t.r + '** → ' + find + '. Trafia do plecaka.');
      UI._hiddenFind = { why: 'ukryta komnata', items: ['k10 = **' + t.r + '** → ' + find], x };
      w.dig = false;
    }
  }
  UI.scoutB = 0; w.scoutBonus = 0;
  return ok;
}
function crossTo(id) {
  const s = Store.S; const w = clone(s.wyprawa); const st = clone(s.stol);
  const e = w.edges.find(x => (x.a === w.at && x.b === id) || (x.b === w.at && x.a === id)); if (!e) return;
  const dest = w.rooms.find(r => r.id === id); const lines = []; const touched = {};
  const pt = st.heroes.map(x => s.heroes[x]).filter(h => h && !h.dead);
  const T = hid => touched[hid] || (touched[hid] = clone(s.heroes[hid]));
  st.torch = Math.max(0, st.torch - 1); w.crossed++;
  lines.push('Korytarz: Pochodnia → **' + st.torch + '**.');
  if (st.torch <= 2) pt.forEach(h => { const t = T(h.id); heroStress(t, 1, lines); });
  if (st.torch <= 2) lines.push('Mrok: każdy +1 Stres.');
  pt.forEach(h => { if (st.torch <= 3 && h.qn.some(q => qname(q.t) === 'Strach przed ciemnością')) { heroStress(T(h.id), 1, lines); lines.push(heroLabel(h) + ': Strach przed ciemnością +1 Stres.'); } });
  if (!e.crossed) {
    e.crossed = true;
    if (!e.scout) scoutCorridor(w, st, e, dest, pt, lines);
    else lines.push('Korytarz był już zwiadowany' + (e.scout.ok ? '.' : ' (bez powodzenia).'));
    const ok = e.scout.ok; const ev = e.scout.ev;
    lines.push('Zdarzenie: k10 = ' + ev.r + ' → **' + ev.text + '**.');
    if (ev.text === 'pułapka') {
      const thief = pt.some(h => /Rozbójnik|Rabuś/.test(CLS[h.cls].name));
      let hit = true;
      if (ok) { const r2 = d(10); const ch = 5 + (thief ? 2 : 0); hit = !(r2 === 1 || (r2 !== 10 && r2 <= ch)); lines.push('Rozbrojenie: k10 = ' + r2 + ' przy Szansie ' + ch + ' → ' + (hit ? 'nieudane' : 'udane') + '.'); }
      if (hit) { const pv = pickD(pt); trapHit(T(pv.v.id), lines, 'Pułapka (ofiara ' + pv.t + ') trafia'); }
    }
    if (ev.text === 'przeszkoda') {
      if ((w.sup['Łopaty'] || 0) > 0) { w.sup['Łopaty']--; lines.push('Łopata usuwa przeszkodę.'); }
      else { pt.forEach(h => { const t = T(h.id); t.hp = Math.max(1, t.hp - 1); heroStress(t, 1, lines); }); st.torch = Math.max(0, st.torch - 1); lines.push('Bez łopaty: każdy −1 Zdrowia i +1 Stres, Pochodnia −1.'); }
    }
    if (ev.text === 'zasadzka') { const region = w.quest.dd != null ? 'DD' : REGIONS[w.quest.region].key; st.region = region; st.dl = w.quest.dl; st.enemies = rollEncounter(region, w.quest.dl).list.filter(Boolean); lines.push('Zasadzka w korytarzu: ' + st.enemies.map(x => x.name).join(', ') + '. Przejdźcie na Stół.'); }
    if (ev.text === 'cisza' && !w.pending) {
      const r3 = d(10);
      if (r3 <= 3) { const e6 = pickD(ROAD_EVENTS); w.pending = { id: uid(), type: 'droga', key: e6.v.key }; lines.push('Cisza nie trwa długo: k10 = **' + r3 + '** → **wydarzenie w drodze** (' + e6.t + '): **' + e6.v.title + '**.'); }
    }
    if (ev.text === 'osobliwość') { const R = w.quest.dd != null ? null : REGIONS[w.quest.region]; const pool = DATA.curios.filter(c => !R || c.region === R.key || c.region === 'wszędzie'); const pc = pickD(pool); dest.ccurio = pc.v.name; dest.ccurioDone = false; lines.push('W korytarzu stoi osobliwość (' + pc.t + '): **' + pc.v.name + '** — możecie jej dotknąć albo ją ominąć (panel komnaty).'); }
  }
  if (w.crossed % 4 === 0) {
    const eaters = [];
    pt.forEach(h => {
      const t = T(h.id); const qp = t.qp.map(q => qname(q.t));
      if (qp.includes('Twardy żołądek') && (w.crossed / 4) % 2 === 1) { lines.push(heroLabel(t) + ' (Twardy żołądek) tym razem nie musi jeść.'); return; }
      const aff = t.state && t.state.kind === 'affliction' ? t.state.name : '';
      if (aff === 'Beznadzieja') { lines.push(heroLabel(t) + ' (Beznadzieja) odmawia jedzenia: +2 Stres, −2 Zdrowia.'); heroStress(t, 2, lines); t.hp = Math.max(1, t.hp - 2); return; }
      const need = (t.diseases.some(x => /Tasiemiec/.test(x)) ? 2 : 1) + (aff === 'Egoizm' ? 1 : 0);
      eaters.push({ id: t.id, need, why: [t.diseases.some(x => /Tasiemiec/.test(x)) ? 'Tasiemiec' : '', aff === 'Egoizm' ? 'Egoizm' : ''].filter(Boolean).join(', ') });
    });
    if (eaters.length) { w.pending = { id: uid(), type: 'glod', eaters }; lines.push('**Głód!** Drużyna musi zdecydować, kto je (potrzeba ' + eaters.reduce((a, x) => a + x.need, 0) + ' prowiantu, w plecaku ' + (w.sup.Prowiant || 0) + ').'); }
  }
  if (w.cultists && !st.enemies.some(x => !x.corpse)) { w.cultists = false; const region = w.quest.dd != null ? 'DD' : REGIONS[w.quest.region].key; st.region = region; st.dl = w.quest.dl; st.enemies = rollEncounter(region, w.quest.dl).list.filter(Boolean); st.roomId = null; st.looted = false; lines.push('**Kultyści na trakcie** (wydarzenie z Osady): w pierwszym korytarzu czeka walka — ' + st.enemies.map(x => x.name).join(', ') + '. Przejdźcie na Stół.'); }
  if (st.enemies.some(x => !x.corpse) && !s.stol.enemies.some(x => !x.corpse)) { st.roomId = null; st.looted = false; }
  w.prev = w.at; w.at = id; dest.visited = true; dest.seen = true;
  const ambush = st.enemies.some(x => !x.corpse) && !s.stol.enemies.some(x => !x.corpse);
  if (UI._hiddenFind) { const hf = UI._hiddenFind; UI._hiddenFind = null; st.lastLoot = { id: uid(), t: Date.now(), why: hf.why, items: hf.items, tot: lootTotals(hf.x, DL_INFO[w.quest.dl].mult), dest: 'plecak wyprawy' }; }
  lines.push('Drużyna wchodzi do komnaty: **' + dest.c + '**.' + (dest.desc && !dest.descShown ? ' *' + dest.desc + '*' : ''));
  dest.descShown = true;
  Store.act([opSet('wyprawa', w)], { quiet: true });
  commit({ lines, stol: st, touched });
  if (ambush && !w.pending) goFight();
}
function finishQuest(done) {
  const s = Store.S; const w = s.wyprawa; const q = w.quest; const rw = questReward(q); const o = clone(s.osada);
  const mult = DL_INFO[q.dl].mult; const lines = [];
  const L = w.loot || {};
  const gemsGold = Math.ceil((L.klejnoty || 0) * 10 * mult);
  o.gold += (L.zloto || 0) + gemsGold;
  const memTypes = ['Popiersie', 'Portret', 'Akt', 'Herb'];
  const addMem = n => { const got = []; for (let i = 0; i < n; i++) { const k = memTypes[d(4) - 1]; o.mem[k] = (o.mem[k] || 0) + 1; got.push(k); } return got; };
  const lootMem = []; if (L.mem) Object.entries(L.mem).forEach(([k, v]) => { o.mem[k] = (o.mem[k] || 0) + v; for (let i = 0; i < v; i++) lootMem.push(k); }); else lootMem.push(...addMem(L.pamiatki || 0));
  if ((L.trinkets || []).length) { o.trinkets = (o.trinkets || []).concat(L.trinkets); lines.push('Do magazynu błyskotek: ' + L.trinkets.map(t => t.name).join(', ') + '.'); }
  (L.inne || []).forEach(x => { if (/błyskotka/.test(x)) lines.push('Do rozpatrzenia w Osadzie: ' + x + ' (dodaj do magazynu).'); });
  lines.push('**Powrót do Osady.** Łupy: ' + (L.zloto || 0) + ' Złota, klejnoty za ' + gemsGold + ' Złota' + (lootMem.length ? ', pamiątki: ' + lootMem.join(', ') : '') + '.');
  const touched = {}; const pt = party(); o.lastQuestWeek = o.week;
  if (done) {
    o.gold += rw.gold; const rm = addMem(rw.mem);
    lines.push('Nagroda za zadanie: ' + rw.gold + ' Złota, pamiątki: ' + rm.join(', ') + '; doświadczenie +' + rw.xp + '.');
    pt.forEach(h => {
      const t = touched[h.id] = clone(h); if (t.level < 6) t.xp = (t.xp || 0) + rw.xp;
      if (canLevel(t)) lines.push('**' + heroLabel(t) + '** ma dość doświadczenia (' + t.xp + ' z ' + xpNeed(t.level) + ') — gracz klika „Awansuj” na karcie bohatera.');
    });
    if (q.goal === 'boss' && q.dd == null) o.bosses = Object.assign({}, o.bosses, { [q.region + q.dl]: true });
    if (q.dd != null) { o.dd = Math.max(o.dd || 0, q.dd + 1); pt.forEach(h => { const t = touched[h.id]; if (t && !t.dead) t.restUntil = o.week + 2; }); lines.push('Ocaleni z Najmroczniejszego Lochu przez 2 tygodnie nie zejdą do żadnego lochu.'); }
    o.questsDone = (o.questsDone || 0) + 1; o.lastQuestWeek = o.week;
    { const drop = (q.goal === 'boss' ? 3 : 0) + ({ krotka: 0, srednia: 1, dluga: 2 })[q.len]; if (drop) { o.threat = Math.max(0, (o.threat || 0) - drop); lines.push('Ciemność cofa się o ' + drop + ' (' + o.threat + '/10).'); } }
    if (q.dd == null) { o.regionDone = Object.assign({}, o.regionDone); o.regionDone[q.region] = q.goal === 'boss' ? 0 : (o.regionDone[q.region] || 0) + 1; }
    { const alive = pt.map(h => touched[h.id] || h).filter(h => !h.dead); if (alive.length >= 2 && d(2) === 1) { const a = pickD(alive); const b = pickD(alive.filter(x => x.id !== a.v.id)); const A = touched[a.v.id] || (touched[a.v.id] = clone(a.v)); const B = touched[b.v.id] || (touched[b.v.id] = clone(b.v)); bondAdd(A, B, 1, lines); lines.push(heroLabel(A) + ' i ' + heroLabel(B) + ' wracają razem — coś ich połączyło w lochu (więź +1).'); } }
    pt.forEach(h => { const t = touched[h.id]; if (t && !t.dead) { t.tally = Object.assign({ quests: 0, bosses: 0, ddSurvived: 0 }, t.tally); t.tally.quests++; } });
    const nextReg = ['ruiny', 'nory', 'knieja', 'zatoka'].find(r => !(o.regions || []).includes(r));
    if (nextReg) { o.regions = (o.regions || ['ruiny']).concat([nextReg]); lines.push('**Otwiera się nowy region: ' + REGIONS[nextReg].name + '.**'); }
  } else { pt.forEach(h => { const t = touched[h.id] = clone(h); heroStress(t, 3, lines); lines.push(heroLabel(t) + ' +3 Stres (porzucona wyprawa).'); }); o.threat = Math.min(10, (o.threat || 0) + 1); lines.push('Porzucona wyprawa — Ciemność rośnie (' + o.threat + '/10).'); }
  pt.forEach(h => { const t = touched[h.id] || (touched[h.id] = clone(h)); t.status = 'osada'; t.fx = {}; t.dd = t.dd && t.hp === 0; });
  lines.push('Niewykorzystane zapasy przepadają.');
  const qlines = pt.filter(h => !(touched[h.id] || h).dead).map(h => { const t = touched[h.id]; const q = rollQuirkFor(t); return q.txt; });
  if (qlines.length) lines.push('**Dziwactwa po wyprawie:** ' + qlines.join(' '));
  /* tydzień w Osadzie: rany się goją (Stres, Przypadłości, choroby i dziwactwa zostają) */
  pt.forEach(h => { const t = touched[h.id]; if (!t || t.dead) return; dreamCheck(t, lines, 'return'); t.hp = heroStats(t).maxhp; t.dd = false; t.exhausted = false; t.exh = 0; t.qbuff = []; });
  if (pt.some(h => !(touched[h.id] || h).dead)) lines.push('Przez tydzień w Osadzie rany się goją: ocaleni wracają do pełnego Zdrowia. Stres, Przypadłości, choroby i dziwactwa zostają.');
  o.lastReturn = Date.now();
  const card = { id: uid(), t: Date.now(), why: done ? 'Powrót z wykonanym zadaniem' : 'Powrót bez wykonania zadania', items: qlines, tot: [], dest: 'skarbiec Osady i karty bohaterów' };
  const rwTot = []; if ((L.zloto || 0) + gemsGold) rwTot.push(((L.zloto || 0) + gemsGold) + ' Złota z łupów'); if (lootMem.length) rwTot.push('pamiątki: ' + lootMem.join(', ')); if (done) { rwTot.push(rw.gold + ' Złota nagrody', rw.mem + ' pamiątki nagrody', '+' + rw.xp + ' doświadczenia'); }
  card.tot = rwTot;
  const ops = [opSet('osada', o), opSet('wyprawa', DEFAULT_S().wyprawa), opSet('stol.lastLoot', card), opSet('stol.enemies', []), opSet('stol.fight', false), opSet('stol.init', []), opSet('stol.turn', -1), opSet('stol.round', 0)];
  UI.wsub = 'mapa';
  Store.act(ops, { quiet: true });
  commit({ lines, stol: null, touched }, done ? 'good' : 'bad');
  ancestorSay('powrot');
}

/* ---------- osobliwości: skutki działają naprawdę ---------- */
const curioKnow = name => ((Store.S.osada.curioKnow || {})[name] || {});
const CURIO_ITEM = { 'Klucz': 'Klucze', 'Woda święcona': 'Woda święcona', 'Łopata': 'Łopaty', 'Antidotum': 'Antidota', 'Laudanum': 'Laudanum', 'Bandaż': 'Bandaże', 'Zioła': 'Zioła', 'Pochodnia': 'Pochodnie', 'Prowiant': 'Prowiant' };
/* pułapka trafia bohatera: k4 na skutek */
function trapHit(t, lines, pre) {
  const ef = rollTable('pulapka'); lines.push((pre || 'Pułapka trafia') + ' **' + heroLabel(t) + '**, skutek k4 = **' + ef.r + '**: ' + ef.text + '.');
  t.fx = Object.assign({}, t.fx);
  if (ef.r === 1) heroDamage(t, d(4), lines, 'pułapka'); if (ef.r === 2) addFx(t.fx, 'bleed', 2); if (ef.r === 3) addFx(t.fx, 'blight', 2); if (ef.r === 4) heroStress(t, 2, lines);
  if (ef.r === 2 || ef.r === 3) lines.push('(Krwawienie i zaraza zadziałają w najbliższej walce, chyba że użyjecie ' + (ef.r === 2 ? 'bandaża' : 'antidotum') + '.)');
}
/* choroba: rzut Odporności, porażka = losowa choroba k6 */
function diseaseCheck(t, lines) {
  const st = heroStats(t); const r = d(10); const ok = r === 1 || (r !== 10 && r <= st.odp);
  lines.push('Odporność ' + heroLabel(t) + ': k10 = **' + r + '** przy ' + st.odp + ' → ' + (ok ? 'bez choroby.' : '**choroba**!'));
  if (!ok) { const pz = pickD(DATA.diseases); if (!(t.diseases || []).includes(pz.v)) t.diseases = (t.diseases || []).concat([pz.v]); lines.push('Choroba (' + pz.t + '): **' + pz.v + '**.'); }
}
function curioEffect(name, good, hid, w, lines, touched) {
  const s = Store.S; const T = id => touched[id] || (touched[id] = clone(s.heroes[id]));
  const pt = party(); const who = T(hid); const res = {};
  const mult = DL_INFO[w.quest.dl].mult;
  if (name === 'Zamknięty sarkofag') { if (good) res.loot = 2; else res.fight = 'zasadzka szkieletów'; }
  else if (name === 'Plugawy ołtarz') {
    if (good) { pt.forEach(h => heroStress(T(h.id), -3, lines)); lines.push('Drużyna −3 Stres.'); }
    else { heroStress(who, 2, lines); who.fx = Object.assign({}, who.fx); addFx(who.fx, 'horror', 1); lines.push(heroLabel(who) + ': +2 Stres i groza 1 (zadziała w najbliższej walce, laudanum ją zdejmie).'); }
  }
  else if (name === 'Stos gnijącego mięsa') { if (good) res.loot = 2; else diseaseCheck(who, lines); }
  else if (name === 'Wysyp grzybów') {
    if (good) { heroHeal(who, 4, lines); who.qbuff = (who.qbuff || []).concat(['Odporność +2']); lines.push(heroLabel(who) + ': leczenie 4 i Odporność +2 do końca wyprawy.'); }
    else { who.fx = Object.assign({}, who.fx); addFx(who.fx, 'blight', 2); lines.push(heroLabel(who) + ': zaraza 2 (zadziała w najbliższej walce, antidotum ją zdejmie).'); }
  }
  else if (name === 'Opuszczony wóz') {
    if (good) { const a = pickD(SUP_KEYS), b = pickD(SUP_KEYS); [a, b].forEach(x => { w.sup[x.v] = (w.sup[x.v] || 0) + (x.v === 'Prowiant' ? 2 : 1); }); const g = d(6); w.loot = addLootTo(w.loot || {}, { gold: Math.ceil(g * mult) }); lines.push('Zapasy: ' + a.v.toLowerCase() + ' (' + a.t + ') i ' + b.v.toLowerCase() + ' (' + b.t + '); Złoto k6 = **' + g + '**' + (mult > 1 ? ' ×' + String(mult).replace('.', ',') : '') + '.'); }
    else trapHit(who, lines, 'Wóz był pułapką. Trafia');
  }
  else if (name === 'Muszla szepcząca') lines.push(gainQuirk(who, good ? 'qp' : 'qn'));
  else if (name === 'Zakazana księga') {
    if (good) { who.qbuff = (who.qbuff || []).concat(['Kryt +1']); lines.push(heroLabel(who) + ': Kryt +1 do końca wyprawy.'); }
    else { heroStress(who, 3, lines); lines.push(heroLabel(who) + ': +3 Stres.'); }
  }
  return res;
}
function resolveCurio(f, m, itemName, heroId) {
  const s = Store.S; const w = clone(s.wyprawa); const r = w.rooms.find(x => x.id === w.at); const name = r[f]; if (!name) return;
  const cu = DATA.curios.find(c => c.name === name) || { item: 'brak', good: '?', bad: '?' };
  if (/walka|boss/.test(r.c) && !r.cleared) return toast('Najpierw walka — osobliwość poczeka.');
  const sel = $('#cwho-' + f); let hid = heroId || (sel ? sel.value : (party()[0] || {}).id); if (!hid) return toast('Drużyna jest pusta.');
  const stamp = (outcome, extra) => { w.curioLast = Object.assign({ id: uid(), t: Date.now(), name, f, outcome, who: hid }, extra || {}); return w.curioLast; };
  const lines = []; const touched = {}; let outcome = null;
  if (m === 'skip') {
    const pt = party(); const obl = pt.find(h => h.state && h.state.kind === 'affliction' && h.state.name === 'Obłęd');
    if (obl) { hid = obl.id; lines.push('Drużyna chce ominąć: ' + name + ', ale **' + heroLabel(obl) + '** (Obłęd) dotyka jej bez pytania.'); m = 'roll'; }
    else {
      for (const h of pt.filter(x => x.qn.some(q => qname(q.t) === 'Ciekawski'))) { const rr = d(10); lines.push(heroLabel(h) + ' (Ciekawski): k10 = **' + rr + '**' + (rr <= 5 ? ' → **musi dotknąć**.' : ' → wytrzymuje.')); if (rr <= 5) { hid = h.id; m = 'roll'; break; } }
      if (m === 'skip') lines.push('Drużyna omija: ' + name + '.');
    }
  }
  const know = clone(s.osada.curioKnow || {}); const kn = know[name] = know[name] || {};
  if (m === 'item') {
    const it = itemName || kn.item; const key = CURIO_ITEM[it];
    if (!key || !((w.sup || {})[key] > 0)) return toast('W plecaku nie ma: ' + String(it || 'przedmiotu').toLowerCase() + '.');
    w.sup[key]--;
    if (it !== cu.item) {
      kn.no = Array.from(new Set((kn.no || []).concat(it)));
      lines.push('**' + name + '** + ' + it.toLowerCase() + ' (' + heroLabel(H(hid)) + ') → nic się nie dzieje. Przedmiot przepada, osobliwość czeka dalej.');
      stamp('przepada', { item: it, text: lines.join(' ') });
      Store.act([opSet('wyprawa', w), opSet('osada.curioKnow', know)], { quiet: true });
      return commit({ lines, touched }, '');
    }
    kn.item = it; kn.good = true;
    outcome = 'dobrze'; lines.push('**' + name + '** + ' + it.toLowerCase() + ' (' + heroLabel(H(hid)) + ') → **dobrze:** ' + cu.good + '. Ród zapamięta, co tu działa.');
  } else if (m === 'roll') {
    let t = rollTable('osobliwosc'); let extra = '';
    if (w.lucky) { const t2 = rollTable('osobliwosc'); extra = ' i drugi rzut k10 = **' + t2.r + '** (Złodziejski nos — wybieracie lepszy)'; if (t2.r < t.r) t = t2; w.lucky = false; }
    outcome = t.text; lines.push('**' + name + '** — dotyka ' + heroLabel(H(hid)) + ': k10 = **' + t.r + '**' + extra + ' → **' + t.text + '**' + (t.text === 'dobrze' ? ': ' + cu.good : t.text === 'źle' ? ': ' + cu.bad : '') + '.');
  }
  if (outcome === 'dobrze') kn.good = true; if (outcome === 'źle') kn.bad = true;
  let res = {};
  if (outcome === 'dobrze' || outcome === 'źle') res = curioEffect(name, outcome === 'dobrze', hid, w, lines, touched);
  r[f + 'Done'] = true; if (f === 'curio' && r.goal && outcome) w.activated = (w.activated || 0) + 1;
  if (f === 'curio' && r.goal && outcome) lines.push('Aktywacja: ' + w.activated + ' z 3.');
  let st = null;
  if (res.fight) { st = clone(s.stol); const region = w.quest.dd != null ? 'DD' : REGIONS[w.quest.region].key; st.region = region; st.dl = w.quest.dl; st.enemies = rollEncounter(region, w.quest.dl).list.filter(Boolean); st.roomId = null; st.looted = false; lines.push('**Zasadzka!** ' + st.enemies.map(e => e.name).join(', ') + '. Przejdźcie na Stół.'); }
  const last = stamp(outcome || 'omin', { item: m === 'item' ? (itemName || kn.item) : null, text: lines.join(' '), fight: !!res.fight, loot: !!res.loot, roll: m === 'roll' });
  if (!outcome) UI.sceneSeen = last.id;
  Store.act([opSet('wyprawa', w), opSet('osada.curioKnow', know)], { quiet: true });
  commit({ lines, stol: st, touched }, outcome === 'dobrze' ? 'good' : outcome === 'źle' ? 'bad' : '');
  if (res.loot) rollLoot(res.loot + (party().some(h => CLS[h.cls].name === 'Antykwariuszka') ? 1 : 0), 'osobliwość');
  /* zasadzkę uruchamia przycisk „Do walki!” w oknie wyniku */
}

/* ---------- cel zadania: postęp i sprawdzenie ---------- */
function goalProgress(w) {
  const q = w.quest; const rooms = w.rooms || [];
  if (q.dd != null || q.goal === 'boss') { const b = rooms.find(r => r.c === 'boss'); const ok = !!(b && b.cleared); return { ok, txt: ok ? 'boss pokonany' : 'boss jeszcze żyje' }; }
  if (q.goal === 'eksploracja') { const need = Math.ceil(rooms.length * 0.9); const v = rooms.filter(r => r.visited).length; return { ok: v >= need, txt: 'odwiedzone ' + v + ' z ' + need + ' wymaganych (komnat: ' + rooms.length + ')' }; }
  if (q.goal === 'oczyszczenie') { const f = rooms.filter(r => /walka|boss/.test(r.c)); const c = f.filter(r => r.cleared).length; return { ok: c >= f.length, txt: 'oczyszczone walki ' + c + ' z ' + f.length }; }
  if (q.goal === 'zbiorka') { const n = w.found || 0; return { ok: n >= 3, txt: 'znalezione ' + n + ' z 3' }; }
  if (q.goal === 'aktywacja') { const n = w.activated || 0; return { ok: n >= 3, txt: 'aktywowane ' + n + ' z 3' }; }
  return { ok: true, txt: '' };
}

/* ---------- plecak: 16 miejsc ---------- */
function packSlots(sup, loot) {
  sup = sup || {}; loot = loot || {};
  let n = 0; SUP_KEYS.forEach(k => { n += Math.ceil((sup[k] || 0) / 4); });
  n += Math.ceil((loot.zloto || 0) / 10) + (loot.klejnoty || 0) + Math.ceil((loot.pamiatki || 0) / 2) + (loot.trinkets || []).length;
  return n;
}

/* ---------- obóz: Punkty Odpoczynku i umiejętności obozowe ---------- */
const campSkillsOf = h => (CLS[h.cls].camp || []).concat(COMMON_CAMP);
const campTarget = eff => /sojusznik/.test(eff) ? 'ally' : /^(sam|sama)\b/.test(eff) ? 'self' : 'party';
function campPanel() {
  const w = Store.S.wyprawa; const c = w.camp; if (!c) return '';
  const W = Store.canWrite(); const pt = party();
  return `<section class="panel campp"><h2>Obóz <span class="hint">Punkty Odpoczynku: <b class="num">${c.pts}</b> z 12</span></h2>
    <p class="small muted">Każdy bohater użyje każdej swojej umiejętności najwyżej raz. Gdy skończycie, kliknijcie „Noc”.</p>
    ${pt.map(h => { const used = c.used[h.id] || []; const can = canHero(h) && W; return `<div class="camph"><div class="ch-h"><b>${esc(heroLabel(h))}</b> <span class="muted small">Zdr ${h.hp}/${heroStats(h).maxhp} · Stres ${h.stress}</span>
      ${campSkillsOf(h).some(x => campTarget(x.eff) === 'ally') ? `<label class="small">cel: <select id="ctgt-${h.id}">${pt.map(x => `<option value="${x.id}">${esc(heroLabel(x))}</option>`).join('')}</select></label>` : ''}</div>
      <div class="row">${campSkillsOf(h).map(x => `<button class="btn sm ${used.includes(x.name) ? 'ghost' : ''}" data-act="campSkill" data-h="${h.id}" data-n="${esc(x.name)}" ${!can || used.includes(x.name) || x.pts > c.pts ? 'disabled' : ''} title="${esc(x.eff)}">${esc(x.name)} <span class="num">${x.pts}</span></button>`).join('')}</div>
      <div class="small dim">${campSkillsOf(h).map(x => '<b>' + esc(x.name) + '</b>: ' + esc(x.eff)).join(' · ')}</div></div>`; }).join('')}
    ${campTalkBox()}
    ${W ? `<div class="row"><button class="btn primary" data-act="campNight">Noc${c.fireOut ? ' (ognisko zgaszone)' : ''}</button><span class="small muted">zasadzka przy k10 ${w.noAmbush ? '— niemożliwa (warta)' : c.fireOut ? '1–4' : pt.some(x => x.camp.includes('Czujność')) ? '1 (Czujność)' : '1–2'}</span></div>` : ''}
  </section>`;
}
function campApply(h0, sk, tid, w, lines, touched) {
  const s = Store.S; const T = id => touched[id] || (touched[id] = clone(s.heroes[id]));
  const me = T(h0.id); const pt = party().map(h => T(h.id)); const tg = tid ? T(tid) : me;
  const nf = (h, buffs, extra) => { h.nextFight = Object.assign({ buffs: [] }, h.nextFight); h.nextFight.buffs = h.nextFight.buffs.concat(buffs.map(b => Array.isArray(b) ? b : [b, 99])); Object.assign(h.nextFight, extra || {}); };
  const stress = (h, n) => heroStress(h, n, lines);
  const hpLoss = (h, n) => { h.hp = Math.max(1, h.hp - n); };
  const sup2 = () => { const a = pickD(SUP_KEYS), b = pickD(SUP_KEYS); [a, b].forEach(x => { w.sup[x.v] = (w.sup[x.v] || 0) + (x.v === 'Prowiant' ? 2 : 1); }); lines.push('Zapasy: ' + a.v.toLowerCase() + ' (' + a.t + ') i ' + b.v.toLowerCase() + ' (' + b.t + ').'); };
  const H2 = heroLabel;
  const fx = {
    'Żarliwe kazanie': () => pt.forEach(h => stress(h, -2)),
    'Ślub rycerski': () => nf(tg, ['Śmierć +1', 'Krzepa +2']),
    'Czyszczenie broni': () => nf(me, ['Celność +1', 'Kryt +1']),
    'Czujny bandyta': () => { w.noAmbush = true; },
    'Pijawki': () => { heroHeal(tg, 3, lines); if ((tg.diseases || []).length) { const r = d(10); lines.push('Pijawki na chorobę: k10 = **' + r + '**' + (r <= 5 ? ' → usuwają: ' + tg.diseases[0] + '.' : ' → bez skutku.')); if (r <= 5) tg.diseases = tg.diseases.slice(1); } },
    'Eksperymentalne opary': () => pt.forEach(h => nf(h, ['Odporność +3'])),
    'Modlitwa': () => { if (tg.qn.some(q => qname(q.t) === 'Bezbożnik')) lines.push(H2(tg) + ' (Bezbożnik) nie przyjmuje modlitwy.'); else stress(tg, -3); },
    'Sanktuarium': () => pt.forEach(h => { heroHeal(h, 3, lines); h.exhausted = false; h.exh = 0; }),
    'Ofiara krwi': () => { hpLoss(me, 2); pt.forEach(h => stress(h, -1)); },
    'Ostrzenie': () => nf(me, ['Kryt +1']),
    'Mroczny rytuał': () => { const r = d(10); lines.push('Mroczny rytuał: k10 = **' + r + '**' + (r <= 2 ? ' → rytuał się odwraca, +2 Stres.' : ' → −3 Stres.')); stress(tg, r <= 2 ? 2 : -3); },
    'Zakazana wiedza': () => { w.scoutBonus = (w.scoutBonus || 0) + 3; },
    'Złodziejski nos': () => { w.lucky = true; },
    'Wisielczy humor': () => pt.forEach(h => stress(h, -1)),
    'Taktyka': () => pt.forEach(h => nf(h, ['Unik +1'])),
    'Opowieści weterana': () => { stress(tg, -2); tg.nextVirtue = 1; },
    'Zdjęcie maski': () => { pt.forEach(h => stress(h, -2)); stress(me, 1); },
    'Zaduma': () => stress(me, -4),
    'Wieczorny występ': () => pt.forEach(h => stress(h, -2)),
    'Kpina z ciemności': () => nf(tg, [], { noFirst: 1 }),
    'Psia warta': () => { w.noAmbush = true; },
    'Pies terapeutyczny': () => stress(tg, -3),
    'Rozpoznanie': () => { w.scoutBonus = (w.scoutBonus || 0) + 3; },
    'Plan zasadzki': () => pt.forEach(h => nf(h, [['Celność +2', 1]])),
    'Plan marszu': () => { w.noSurprise = true; },
    'Nowa cięciwa': () => nf(me, ['Kryt +1']),
    'Zapasy z sakwy': () => sup2(),
    'Grzebanie w znaleziskach': () => { w.dig = true; },
    'Łańcuchy na noc': () => stress(me, -3),
    'Ostrzeżenie': () => nf(me, [], { noTransformStress: 1 }),
    'Pokuta': () => { stress(me, -3); hpLoss(me, 2); },
    'Kazanie o cierpieniu': () => nf(tg, ['Odporność +2', 'Śmierć +1']),
    'Wężowa skóra': () => nf(me, [], { block: 1 }),
    'Opowieść z piasków': () => pt.forEach(h => stress(h, -1)),
    'Zachęta': () => stress(tg, -2),
    'Pierwsza pomoc': () => { heroHeal(tg, 3, lines); tg.fx = Object.assign({}, tg.fx, { bleed: [], blight: [] }); },
    'Pogadanka': () => nf(tg, ['Krzepa i Odporność +2'])
  };
  (fx[sk.name] || (() => lines.push('(Efekt rozstrzyga MG.)')))();
}
Object.assign(ACT, {
  campSkill: el => {
    const w = clone(Store.S.wyprawa); const c = w.camp; if (!c) return;
    const h = H(el.dataset.h); if (!h || !canHero(h)) return toast('To bohater innego gracza.');
    const sk = campSkillsOf(h).find(x => x.name === el.dataset.n); if (!sk) return;
    if ((c.used[h.id] || []).includes(sk.name)) return toast(heroLabel(h) + ' użył już: ' + sk.name + '.');
    if (sk.pts > c.pts) return toast('Za mało Punktów Odpoczynku.');
    const tt = campTarget(sk.eff); const sel = $('#ctgt-' + h.id); const tid = tt === 'ally' ? (sel ? sel.value : h.id) : null;
    const lines = ['**Obóz** — ' + heroLabel(h) + ': **' + sk.name + '** (' + sk.pts + ' pkt' + (tid ? ', cel: ' + heroLabel(H(tid)) : '') + ') — ' + sk.eff + '.']; const touched = {};
    campApply(h, sk, tid, w, lines, touched);
    c.pts -= sk.pts; c.used[h.id] = (c.used[h.id] || []).concat(sk.name);
    lines.push('Zostało ' + c.pts + ' Punktów Odpoczynku.');
    Store.act([opSet('wyprawa', w)], { quiet: true });
    commit({ lines, stol: null, touched }, 'good');
  },
  campNight: () => {
    const s = Store.S; const w = clone(s.wyprawa); const c = w.camp; if (!c) return;
    const pt = party(); const lines = ['**Noc w obozie.**'];
    const czuj = pt.some(x => x.camp.includes('Czujność'));
    let ambush = false;
    if (w.noAmbush) lines.push('Warta czuwa — nocna zasadzka jest niemożliwa.');
    else { const r = d(10); const lim = c.fireOut ? 4 : (czuj ? 1 : 2); ambush = r <= lim; lines.push('k10 = **' + r + '** (zasadzka przy ' + (lim === 1 ? '1' : '1–' + lim) + (czuj && !c.fireOut ? ', Czujność' : '') + ') → ' + (ambush ? '**nocna zasadzka!**' + (c.fireOut ? ' Ognisko było zgaszone: wrogowie są zaskoczeni, walka daje +2 rzuty na łup.' : '') : 'spokojna noc.')); }
    if (pt.some(x => x.camp.includes('Tropienie'))) { w.scoutBonus = (w.scoutBonus || 0) + 2; lines.push('Tropienie: następny zwiad +2.'); }
    w.camp = null; w.noAmbush = false;
    let st = null;
    if (ambush) { st = clone(s.stol); const region = w.quest.dd != null ? 'DD' : REGIONS[w.quest.region].key; st.region = region; st.dl = w.quest.dl; st.enemies = rollEncounter(region, w.quest.dl).list.filter(Boolean); st.forceSurprise = c.fireOut ? 'wrogowie' : null; st.lootBonus = c.fireOut ? 2 : 0; st.roomId = null; st.looted = false; lines.push('Z ciemności wychodzą: ' + st.enemies.map(e => e.name).join(', ') + '. Przejdźcie na Stół.'); }
    Store.act([opSet('wyprawa', w)], { quiet: true });
    commit({ lines, stol: st, touched: {} }, ambush ? 'bad' : 'good');
    if (ambush) goFight();
  }
});

/* ---------- przygotowanie wyprawy: zadanie → drużyna → plecak → Wyrusz (jeden ekran) ---------- */
function questCard(q, compact) {
  const W = Store.canWrite(); const isDD = q.dd != null; const R = isDD ? null : REGIONS[q.region]; const L = QUEST_LEN[q.len]; const rw = questReward(q);
  const loc = isDD ? DD_FLOORS[q.dd].name : R.locs[q.dl].name;
  return `<article class="quest ${compact ? 'compact' : ''}">
    <div class="qh"><span class="ldot lv${q.dl}">${isDD ? '☩' : DL_ROMAN[q.dl]}</span> <b>${esc(loc)}</b></div>
    <div class="dim small">${isDD ? 'Najmroczniejszy Loch, piętro ' + (q.dd + 1) : esc(R.name) + ' · ' + DL[q.dl]} · ${esc(L.name)} (${L.rooms} komnat, obozy: ${L.camps})</div>
    <p>${esc(goalText(q))}</p>
    <p class="small"><b>Nagroda:</b> ${rw.gold} Złota, ${rw.mem} pamiątki, +${rw.xp} doświadczenia dla każdego. <b>Kto zejdzie:</b> ${DL_INFO[q.dl].who}. <b>W skarbcu:</b> ${Store.S.osada.gold} Z.</p>
    ${W ? `<button class="btn primary" data-act="takeQuest" data-id="${q.id}" ${Store.S.wyprawa.quest ? 'disabled title="Najpierw zakończ obecną wyprawę"' : ''}>Przygotuj wyprawę →</button>` : ''}
  </article>`;
}
const refuses = (h, q) => (q.dl === 0 && h.level >= 3) ? 'Poz. ' + h.level + ' — nie zejdzie do lochu Uczniowskiego' : (q.dl === 1 && h.level >= 5) ? 'Poz. ' + h.level + ' — nie zejdzie do lochu Weterańskiego' : '';
const prepQuest = () => UI.prep && (Store.S.osada.board || []).find(q => q.id === UI.prep.qid);
function prepView() {
  const q = prepQuest(); if (!q) return '';
  const st = Store.S.stol; const o = Store.S.osada; const W = Store.canWrite();
  const sup = UI.prep.sup; const cost = packCost(sup); const slots = packSlots(sup, {});
  const pt = st.heroes.map(H).filter(Boolean);
  const problems = [];
  if (!pt.length) problems.push('Drużyna jest pusta.');
  pt.forEach(h => { const a = heroAway(h); const r = refuses(h, q); if (a) problems.push(heroLabel(h) + ': ' + a + '.'); if (r) problems.push(heroLabel(h) + ': ' + r + '.'); if (h.dead) problems.push(heroLabel(h) + ' nie żyje.'); });
  if (cost > o.gold) problems.push('Zestaw kosztuje ' + cost + ' Złota, a w skarbcu jest ' + o.gold + '.');
  if (slots > 16) problems.push('Plecak ma 16 miejsc, a ten zestaw zajmuje ' + slots + '.');
  const slotHtml = [4, 3, 2, 1].map(p => { const h = pt[p - 1]; return `<div class="pslot ${h ? '' : 'empty'}"><div class="pos">${p}${p === 1 ? ' · przód' : p === 4 ? ' · tył' : ''}</div>${h ? `<div class="pn">${esc(heroLabel(h))}</div><div class="small dim">${esc(CLS[h.cls].name)} · Poz. ${h.level}</div><div class="small dim">gra najlepiej na ${esc(CLS[h.cls].pos || '?')}</div><div class="small">Zdr ${h.hp}/${heroStats(h).maxhp} · Stres ${h.stress}</div>
    ${W ? `<div class="row">${p < pt.length ? `<button class="btn sm ghost" data-act="prepMove" data-id="${h.id}" data-d="1" title="Do tyłu">◀</button>` : ''}${p > 1 ? `<button class="btn sm ghost" data-act="prepMove" data-id="${h.id}" data-d="-1" title="Do przodu">▶</button>` : ''}<button class="btn sm ghost" data-act="prepDel" data-id="${h.id}" title="Zostaje w Osadzie">✕</button></div>` : ''}` : '<div class="muted small">wolne miejsce</div>'}</div>`; }).join('');
  const bench = liveHeroes().filter(h => !st.heroes.includes(h.id));
  const benchHtml = bench.map(h => { const why = heroAway(h) || refuses(h, q) || (h.status === 'wyprawa' ? 'na wyprawie' : ''); return `<button class="bench ${why ? 'off' : ''}" data-act="prepAdd" data-id="${h.id}" ${why || pt.length >= 4 || !W ? 'disabled' : ''} title="${esc(why || 'Dodaj do drużyny')}"><b>${esc(heroLabel(h))}</b> <span class="small dim">${esc(CLS[h.cls].name)} · Poz. ${h.level} · Stres ${h.stress} · najlepiej ${esc(CLS[h.cls].pos || '?')}</span>${why ? `<span class="small warn">${esc(why)}</span>` : ''}</button>`; }).join('') || '<p class="muted small">Wszyscy dostępni bohaterowie są już w drużynie.</p>';
  return `<div class="prep">
    <section class="panel"><h2>Przygotowanie wyprawy</h2>${questCard(Object.assign({}, q), true).replace(/<button[^>]*takeQuest[^>]*>[^<]*<\/button>/, '')}</section>
    <section class="panel"><h2>Drużyna <span class="hint">${pt.length} z 4 · ustawienie jak na Stole (1 = przód)</span></h2>
      <div class="pslots">${slotHtml}</div>
      <div class="ph">Dostępni w Osadzie</div><div class="benchlist">${benchHtml}</div></section>
    <section class="panel"><h2>Plecak <span class="hint">${slots} z 16 miejsc · koszt ${cost} Z · w skarbcu ${o.gold} Z</span></h2>
      <p class="small dim">Plecak jest pusty — sami zdecydujcie, co i ile zabrać. Cztery sztuki zapasów mieszczą się na jednym miejscu.</p>
      <div class="supgrid">${SUPPLY.map(([k, c]) => `<div class="sup"><span>${k} <span class="muted small">${c === 0.5 ? '1 Z / 2 szt.' : c + ' Z'}</span></span><span class="row">${W ? `<button class="btn sm ghost" data-act="prepSup" data-k="${k}" data-v="${k === 'Prowiant' ? -2 : -1}">−</button>` : ''}<b class="num">${sup[k] || 0}</b>${W ? `<button class="btn sm ghost" data-act="prepSup" data-k="${k}" data-v="${k === 'Prowiant' ? 2 : 1}">+</button>` : ''}</span></div>`).join('')}</div>
      ${W && Object.values(sup).some(v => v > 0) ? `<div class="row"><button class="btn sm ghost" data-act="prepClear">Opróżnij plecak</button></div>` : ''}</section>
    <section class="panel go"><h2>Gotowi?</h2>${problems.length ? `<ul class="warn small">${problems.map(p => `<li>${esc(p)}</li>`).join('')}</ul>` : '<p class="small">Wszystko gotowe. Pochodnia startuje z 10.</p>'}
      ${W ? `<div class="row"><button class="btn primary big" data-act="depart" ${problems.length ? 'disabled' : ''}>Wyrusz</button><button class="btn ghost" data-act="wsub" data-v="mapa">Wróć do mapy</button></div>` : '<p class="muted">MG i gracze z prawem edycji składają drużynę.</p>'}</section>
  </div>`;
}
Object.assign(ACT, {
  takeQuest: el => {
    const q = (Store.S.osada.board || []).find(x => x.id === el.dataset.id); if (!q) return;
    UI.prep = { qid: q.id, sup: {} }; UI.wsub = 'prep';
    const st = Store.S.stol; if (st.heroes.some(id => { const h = H(id); return !h || h.dead; })) setStol(s => { s.heroes = s.heroes.filter(id => { const h = H(id); return h && !h.dead; }); });
    if (location.hash !== '#wyprawa') location.hash = '#wyprawa'; else renderView();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  },
  prepAdd: el => { const st = Store.S.stol; if (st.heroes.length >= 4) return toast('W drużynie są już cztery osoby.'); setStol(s => { s.heroes = s.heroes.concat(el.dataset.id); }); },
  prepDel: el => setStol(s => { s.heroes = s.heroes.filter(x => x !== el.dataset.id); }),
  prepMove: el => setStol(s => { const i = s.heroes.indexOf(el.dataset.id); moveInList(s.heroes, i, +el.dataset.d); }),
  prepSup: el => { const k = el.dataset.k; UI.prep.sup[k] = Math.max(0, (UI.prep.sup[k] || 0) + +el.dataset.v); renderView(); },
  prepClear: () => { UI.prep.sup = {}; renderView(); },
  depart: () => {
    const q = prepQuest(); if (!q) return; const sup = UI.prep.sup; const cost = packCost(sup); const pt = party();
    if (!pt.length) return toast('Drużyna jest pusta.');
    if (pt.some(h => heroAway(h) || refuses(h, q))) return toast('Ktoś w drużynie nie może iść na tę wyprawę.');
    if (cost > Store.S.osada.gold) return toast('Za mało Złota na ten zestaw.');
    if (packSlots(sup, {}) > 16) return toast('Plecak ma tylko 16 miejsc.');
    UI.prep = null; startQuest(q, Object.assign({}, sup), cost);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
});

/* do walki bez szukania przycisków: przejście na Stół i start walki */
function goFight() {
  if (location.hash !== '#stol') location.hash = '#stol';
  setTimeout(() => { const st = Store.S.stol; if (!st.fight && st.enemies.some(e => !e.corpse) && st.heroes.length && Store.canWrite()) ACT.fightStart(); }, 120);
}
/* przepełniony plecak: wyrzuca najmniej potrzebne zapasy, a gdy to nie wystarcza — najtańszy łup */
Object.assign(ACT, {
  freeSlot: () => {
    const w = clone(Store.S.wyprawa); const lines = [];
    const order = ['Klucze', 'Woda święcona', 'Zioła', 'Laudanum', 'Łopaty', 'Antidota', 'Bandaże', 'Pochodnie', 'Prowiant'];
    let guard = 0;
    while (packSlots(w.sup, w.loot) > 16 && guard++ < 60) {
      const before = packSlots(w.sup, w.loot);
      const k = order.find(x => (w.sup[x] || 0) > 0 && Math.ceil((w.sup[x] - 1) / 4) < Math.ceil(w.sup[x] / 4));
      if (k) { w.sup[k]--; lines.push(k.toLowerCase()); continue; }
      const k2 = order.find(x => (w.sup[x] || 0) > 0);
      if (k2) { const drop = ((w.sup[k2] - 1) % 4) + 1; w.sup[k2] -= drop; lines.push(drop + ' × ' + k2.toLowerCase()); continue; }
      if ((w.loot.zloto || 0) > 0) { const g = ((w.loot.zloto - 1) % 10) + 1; w.loot.zloto -= g; lines.push(g + ' Złota'); continue; }
      if (packSlots(w.sup, w.loot) === before) break;
    }
    Store.act([opSet('wyprawa', w)], { quiet: true });
    rollLog('Drużyna wyrzuca z plecaka: ' + (lines.join(', ') || 'nic') + '. Plecak: ' + packSlots(w.sup, w.loot) + ' z 16.', '', 'sys');
  }
});

/* ======================= okno osobliwości: scena, wybór, wynik ======================= */
function sceneCurio() {
  const s = Store.S; const w = s.wyprawa; if (!w.quest || w.pending || w.camp || s.stol.fight) return null;
  if ((s.stol.enemies || []).some(e => !e.corpse)) return null;
  const r = (w.rooms || []).find(x => x.id === w.at); if (!r) return null;
  if (/walka|boss/.test(r.c) && !r.cleared) return null; /* walka zawsze przed osobliwością */
  for (const f of ['curio', 'ccurio']) if (r[f] && !r[f + 'Done']) return { r, f, name: r[f], key: r.id + ':' + f };
  return null;
}
function sceneChoice(c) {
  const s = Store.S; const w = s.wyprawa; const S = CURIO_SCENES[c.name] || { text: '' }; const cu = DATA.curios.find(x => x.name === c.name) || {};
  const kn = curioKnow(c.name); const W = Store.canWrite(); const pt = party();
  if (!UI.scene || UI.scene.key !== c.key) UI.scene = { key: c.key, who: (pt.slice().sort((a, b) => a.stress - b.stress)[0] || {}).id, item: null };
  if (!pt.some(h => h.id === UI.scene.who)) UI.scene.who = (pt[0] || {}).id;
  const have = SUP_ITEMS.filter(([n, k]) => ((w.sup || {})[k] || 0) > 0);
  if (UI.scene.item && !have.some(([n]) => n === UI.scene.item)) UI.scene.item = null;
  const ciek = pt.filter(h => h.qn.some(q => qname(q.t) === 'Ciekawski')); const obl = pt.filter(h => h.state && h.state.kind === 'affliction' && h.state.name === 'Obłęd');
  const seen = [kn.good ? 'dobrze — ' + cu.good : '', kn.bad ? 'źle — ' + cu.bad : ''].filter(Boolean);
  const tiles = have.map(([n, k]) => { const mark = kn.item === n ? '<span class="imark ok">działa</span>' : (kn.no || []).includes(n) ? '<span class="imark no">nie działa</span>' : ''; return `<button class="itile ${UI.scene.item === n ? 'on' : ''} ${(kn.no || []).includes(n) ? 'dim' : ''}" data-act="sceneItem" data-v="${esc(n)}" ${W ? '' : 'disabled'} aria-pressed="${UI.scene.item === n}">${itemIcon(n)}<span class="iname">${esc(n)}</span><span class="icount num">×${w.sup[k]}</span>${mark}</button>`; }).join('');
  return `<div class="scene" role="dialog" aria-modal="true" aria-label="Osobliwość: ${esc(c.name)}">
    <button class="scene-x" data-act="sceneHide" title="Zamknij — wrócę później" aria-label="Zamknij">×</button>
    <div class="scene-pic">${curioArt(c.name, null, s.stol.torch)}<div class="scene-cap"><span class="lbl">Osobliwość${c.f === 'ccurio' ? ' w korytarzu' : ''}${c.f === 'curio' && c.r.goal ? ' · cel zadania' : ''}</span><h2>${esc(c.name)}</h2></div></div>
    <div class="scene-body">
      <p class="scene-text">${esc(S.text)}</p>
      ${seen.length ? `<p class="small dim">Ród pamięta: ${esc(seen.join('; '))}.</p>` : ''}
      ${ciek.length || obl.length ? `<p class="small warn">${obl.map(h => esc(heroLabel(h)) + ' (Obłęd) dotknie jej bez pytania, jeśli ją ominiecie.').concat(ciek.map(h => esc(heroLabel(h)) + ' (Ciekawski) przy k10 1–5 dotknie jej sam, jeśli ją ominiecie.')).join(' ')}</p>` : ''}
      <div class="ph">Kto podchodzi</div>
      <div class="scene-who">${pt.map(h => `<button class="swho ${UI.scene.who === h.id ? 'on' : ''}" data-act="sceneWho" data-id="${h.id}" ${W ? '' : 'disabled'} aria-pressed="${UI.scene.who === h.id}">${portraitHtml(h, 'sw-pt')}<b>${esc(heroLabel(h))}</b><span class="small dim">Stres ${h.stress} · Zdr ${h.hp}</span></button>`).join('')}</div>
      <div class="ph">Plecak <span class="hint">właściwy przedmiot daje pewny dobry wynik, niewłaściwy przepada</span></div>
      <div class="itiles">${tiles || '<p class="muted small">W plecaku nie ma nic, co dałoby się przyłożyć.</p>'}</div>
      ${W ? `<div class="scene-act"><button class="btn gold" data-act="sceneUse" ${UI.scene.item ? '' : 'disabled'}>${UI.scene.item ? 'Użyj: ' + esc(UI.scene.item.toLowerCase()) : 'Wybierz przedmiot z plecaka'}</button>
        <button class="btn primary" data-act="sceneTouch">Dotknij gołą ręką (k10)</button><button class="btn ghost" data-act="sceneSkip">Omiń</button></div>
        <p class="small muted">Gołą ręką: k10 1–4 dobrze, 5–7 nic, 8–10 źle.</p>` : '<p class="muted">Decyduje drużyna.</p>'}
    </div></div>`;
}
function sceneResult(last) {
  const s = Store.S; const S = CURIO_SCENES[last.name] || {}; const o = last.outcome;
  const head = { dobrze: 'Dobrze', 'źle': 'Źle', nic: 'Nic się nie dzieje', przepada: 'Nie pasuje', omin: 'Drużyna odchodzi' }[o] || '';
  const flav = o === 'dobrze' ? S.good : o === 'źle' ? S.bad : o === 'nic' ? S.nic : o === 'przepada' ? (last.item || 'Przedmiot') + ' nic tu nie zdziała i przepada. Osobliwość czeka dalej.' : 'Osobliwość zostaje w ciemności.';
  const L = s.stol.lastLoot; const loot = last.loot && L && L.t >= last.t - 200 ? `<p class="scene-loot"><b>Łup:</b> ${esc((L.tot || []).join(', ') || 'nic cennego')}</p>` : '';
  const who = H(last.who);
  return `<div class="scene res-${o === 'źle' ? 'bad' : o === 'dobrze' ? 'good' : 'none'}" role="dialog" aria-modal="true" aria-label="Wynik: ${esc(last.name)}">
    <div class="scene-pic">${curioArt(last.name, o === 'przepada' ? 'nic' : o === 'omin' ? null : o, s.stol.torch)}<div class="scene-cap"><span class="lbl">${esc(last.name)}${who ? ' · ' + esc(heroLabel(who)) : ''}</span><h2>${esc(head)}</h2></div></div>
    <div class="scene-body"><p class="scene-text">${esc(flav || '')}</p>
      <div class="scene-log">${diceBadges(md(last.text || ''))}</div>${loot}
      <div class="scene-act"><button class="btn ${last.fight ? 'primary' : 'gold'}" data-act="sceneNext">${last.fight ? 'Do walki!' : o === 'przepada' ? 'Wróć do osobliwości' : 'Dalej'}</button></div>
    </div></div>`;
}
function renderScene() {
  if (!Store.S) return;
  let el = document.getElementById('scene'); const s = Store.S; const last = s.wyprawa.curioLast; let html = '';
  if (last && last.id !== UI.sceneSeen && Date.now() - last.t < 15 * 60000 && !s.stol.fight) html = sceneResult(last);
  else { const c = sceneCurio(); if (c && !(UI.sceneHide || {})[c.key]) html = sceneChoice(c); }
  if (!html) { if (el) el.remove(); document.body.classList.remove('scene-on'); return; }
  if (!el) { el = document.createElement('div'); el.id = 'scene'; el.className = 'scene-bg'; document.body.appendChild(el); el.addEventListener('click', e => { if (e.target !== el) return; const L = Store.S.wyprawa.curioLast; if (!(L && L.id !== UI.sceneSeen)) ACT.sceneHide(); }); }
  document.body.classList.add('scene-on');
  if (el._html !== html) { const sc = el.querySelector('.scene'); const top = sc ? sc.scrollTop : 0; el.innerHTML = html; el._html = html; const n = el.querySelector('.scene'); if (n) n.scrollTop = top; }
}
Object.assign(ACT, {
  sceneWho: el => { UI.scene.who = el.dataset.id; renderScene(); },
  sceneItem: el => { UI.scene.item = UI.scene.item === el.dataset.v ? null : el.dataset.v; renderScene(); },
  sceneUse: () => { const c = sceneCurio(); if (!c || !UI.scene.item) return; const it = UI.scene.item; UI.scene.item = null; resolveCurio(c.f, 'item', it, UI.scene.who); },
  sceneTouch: () => { const c = sceneCurio(); if (c) resolveCurio(c.f, 'roll', null, UI.scene.who); },
  sceneSkip: () => { const c = sceneCurio(); if (c) resolveCurio(c.f, 'skip', null, UI.scene.who); },
  sceneHide: () => { const c = sceneCurio(); if (c) { UI.sceneHide = Object.assign({}, UI.sceneHide, { [c.key]: 1 }); } renderScene(); },
  sceneShow: el => { UI.sceneHide = Object.assign({}, UI.sceneHide); delete UI.sceneHide[el.dataset.k]; renderScene(); },
  sceneNext: () => {
    const last = Store.S.wyprawa.curioLast; if (last) UI.sceneSeen = last.id; renderScene();
    if (last && last.fight && Store.S.stol.enemies.some(e => !e.corpse) && !Store.S.stol.fight) goFight();
  }
});
document.addEventListener('keydown', e => { if (e.key === 'Escape' && document.getElementById('scene')) { const last = Store.S && Store.S.wyprawa.curioLast; if (last && last.id !== UI.sceneSeen) ACT.sceneNext(); else ACT.sceneHide(); } });
