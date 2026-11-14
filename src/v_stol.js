/* Widok Stół: szyk 4 na 4, inicjatywa, akcje bohaterów i wrogów. */
const REG_OPTS = [['Ruiny', 'Ruiny'], ['Nory', 'Nory'], ['Knieja', 'Knieja'], ['Zatoka', 'Zatoka'], ['DD', 'Najmroczniejszy Loch']];
function bar(cls, v, max, label) {
  const p = max ? clamp(v / max, 0, 1) * 100 : 0;
  return `<div class="bar ${cls}"><i style="width:${p}%"></i><span>${label}</span></div>`;
}
function posDots(list, cls, side, label) {
  /* side: 'hero' = szyk bohaterów (rysowany 4 3 2 1, jak na polu), 'enemy' = szyk wrogów (1 2 3 4) */
  side = side || (/from/.test(cls) ? 'hero' : 'enemy');
  const order = side === 'hero' ? [4, 3, 2, 1] : [1, 2, 3, 4];
  label = label || (/from/.test(cls) ? 'Używa z pozycji bohatera' : side === 'hero' ? 'Trafia bohaterów na pozycjach' : 'Trafia wrogów na pozycjach');
  const tip = label + ': ' + (list && list.length ? list.join(', ') : '—');
  return `<span class="pdots ${cls} side-${side}" title="${tip}">${order.map(i => `<i class="${list && list.includes(i) ? 'on' : ''}"></i>`).join('')}</span>`;
}
function skillPosTxt(v) { return 'z ' + v.s.z + (v.inf.to ? ' → w ' + v.s.w : ' · ' + v.s.w); }
function gchip(c, t, label) { const k = glossKey(t); const g = glossText(k, label || t); return `<span class="chip sm ${c}" ${g ? `title="${esc(g)}" data-gloss="${esc(g)}" tabindex="0"` : ''}>${esc(t)}</span>`; }
function chipsHtml(list) { return list.map(([c, t]) => gchip(c, t)).join(''); }
function stateChip(h) {
  if (!h.state) return '';
  const c = h.state.kind === 'virtue' ? 'virtue' : 'affl';
  return gchip(c, h.state.name, h.state.name);
}
/* kto nie może iść na wyprawę: leczenie, przepadł, odpoczynek po Najmroczniejszym Lochu */
function heroAway(h) {
  const wk = Store.S.osada.week;
  if (h.status === 'leczenie') return 'w leczeniu do następnego tygodnia';
  if (h.status === 'przepadł') return 'przepadł — wróci w tygodniu ' + (h.awayUntil || wk + 1);
  if ((h.restUntil || 0) > wk) return 'odpoczywa po Najmroczniejszym Lochu do tygodnia ' + h.restUntil;
  return '';
}
function curEntry() { const s = Store.S.stol; return s.init && s.init[s.turn]; }
/* kolejka w walce: działa się tylko w swojej turze, jedna akcja na turę; ogłuszony traci turę */
const turnKey = () => { const s = Store.S.stol; return (s.round || 0) + ':' + s.turn; };
const inTurns = () => { const s = Store.S.stol; return !!(s.fight && (s.init || []).length && curEntry()); };
function entryName(x) { if (!x) return '—'; return x.k === 'h' ? (H(x.id) ? heroLabel(H(x.id)) : '—') : ((Store.S.stol.enemies.find(e => e.id === x.id) || {}).name || '—'); }
function heroTurn(h) {
  if (!inTurns()) return { ok: true, mine: true };
  const s = Store.S.stol; const ce = curEntry();
  if (!(ce.k === 'h' && ce.id === h.id)) return { ok: false, mine: false, why: 'Teraz tura: ' + entryName(ce) + '. ' + heroLabel(h) + ' działa w swojej kolejce.', short: 'nie jego tura' };
  if (h.fx && h.fx.lostTurn === (s.round || 0)) return { ok: false, mine: true, lost: true, why: h.fx.lostWhy === 'stun' ? heroLabel(h) + ' jest ogłuszony i traci tę turę.' : 'Tę turę przejęła Przypadłość (' + (h.state ? h.state.name : '') + ').', short: h.fx.lostWhy === 'stun' ? 'ogłuszony' : 'tura przejęta' };
  if (s.acted === turnKey()) return { ok: false, mine: true, why: heroLabel(h) + ' już działał w tej turze. Kliknij „Następna tura”.', short: 'już działał' };
  return { ok: true, mine: true };
}
function enemyTurn(e) {
  if (!inTurns()) return { ok: true };
  const s = Store.S.stol; const ce = curEntry();
  if (!(ce.k === 'e' && ce.id === e.id)) return { ok: false, why: 'Teraz tura: ' + entryName(ce) + '.' };
  if (e.fx && e.fx.lostTurn === (s.round || 0)) return { ok: false, lost: true, why: e.name + ' jest ogłuszony i traci tę turę.' };
  if (s.acted === turnKey()) return { ok: false, why: e.name + ' już działał w tej turze. Kliknij „Następna tura”.' };
  return { ok: true };
}
function actedCommit(res, cls) { if (res && inTurns()) { res.stol = res.stol || clone(Store.S.stol); res.stol.acted = (res.stol.round || 0) + ':' + res.stol.turn; } commit(res, cls); }
/* ogłuszony albo martwy na początku tury: po chwili tura sama przechodzi dalej */
function autoSkip(res) {
  if (!res || !res.skip) return; const key = turnKey();
  setTimeout(() => { const s = Store.S.stol; if (s.fight && turnKey() === key) ACT.nextTurn(); }, res.quiet ? 300 : 1600);
}

function heroSlot(id, pos) {
  const h = H(id); if (!h) return `<div class="slot empty"><div class="pos">${pos}</div></div>`;
  const st = heroStats(h); const s = Store.S.stol; const ce = curEntry();
  const isCur = ce && ce.k === 'h' && ce.id === id;
  const P = UI.pend; const tgt = P && P.need === 'ally' && Store.S.stol.heroes.includes(id);
  const tgtE = UI.epend && UI.epend.valid.includes(id);
  const sel = UI.sel.k === 'h' && UI.sel.id === id;
  const mv = canHero(h) && !tgt && !tgtE; const n = s.heroes.length;
  return `<div class="slot hero ${sel ? 'sel' : ''} ${isCur ? 'cur' : ''} ${tgt || tgtE ? 'tgt' : ''} ${h.dd ? 'dd' : ''}" data-act="${tgt ? 'pickAlly' : tgtE ? 'pickHeroT' : 'selH'}" data-id="${id}" tabindex="0" ${mv ? 'draggable="true"' : ''}>
    ${mv && n > 1 ? `<div class="mvbtns"><button class="mv" data-act="slotMove" data-id="${id}" data-d="1" ${pos < n ? '' : 'disabled'} title="Do tyłu (zamiana z pozycją ${pos + 1})" aria-label="Do tyłu">◀</button><button class="mv" data-act="slotMove" data-id="${id}" data-d="-1" ${pos > 1 ? '' : 'disabled'} title="Do przodu (zamiana z pozycją ${pos - 1})" aria-label="Do przodu">▶</button></div>` : ''}
    <div class="pos">${pos}</div>
    <div class="pt">${portraitHtml(h, 'pt-img')}</div>
    <div class="nm">${esc(heroLabel(h))}</div>
    <div class="cl">${h.name ? esc(CLS[h.cls].name) + ' · ' : ''}Poz. ${h.level}${CLS[h.cls].name === 'Ohyda' && h.form === 'beast' ? ' · bestia' : ''}</div>
    ${bar('hp', h.hp, st.maxhp, h.hp + ' / ' + st.maxhp)}
    ${bar('st', h.stress, 20, 'Stres ' + h.stress)}
    <div class="chips">${h.dd ? gchip('red', 'Próg Śmierci') : ''}${stateChip(h)}${h.exhausted ? gchip('', 'Wyczerpanie') : ''}${h.block ? gchip('gold', 'Blok ' + h.block) : ''}${h.fatigue ? gchip('', 'Zmęczenie ' + h.fatigue) : ''}${chipsHtml(fxChips(h.fx))}</div>
    <div class="own">${esc(ownerName(h))}</div>
  </div>`;
}
function enemySlot(x) {
  const e = x.e; const ce = curEntry();
  const isCur = ce && ce.k === 'e' && ce.id === e.id;
  const P = UI.pend; const tgt = P && P.need === 'enemy' && P.valid.includes(e.id);
  const sel = UI.sel.k === 'e' && UI.sel.id === e.id;
  return `<div class="slot enemy ${e.boss ? 'boss' : ''} ${e.corpse ? 'corpse' : ''} ${sel ? 'sel' : ''} ${isCur ? 'cur' : ''} ${tgt ? 'tgt' : ''} ${e.size === 2 ? 'wide' : ''}" data-act="${tgt ? 'pickEnemy' : 'selE'}" data-id="${e.id}" tabindex="0">
    <div class="pos">${x.pos}${x.last !== x.pos ? '–' + x.last : ''}</div>
    <div class="nm">${esc(e.name)}</div>
    <div class="cl">${e.corpse ? 'trzyma pozycję' : esc(e.type || '') + (e.dl ? ' · ' + DL_SHORT[e.dl] : '')}</div>
    ${bar('hp', e.hp, e.maxhp, e.hp + ' / ' + e.maxhp)}
    <div class="est num">Unik ${enemyDodge(e)} · Panc. ${enemyProt(e)} · Szyb. ${e.speed}</div>
    <div class="chips">${chipsHtml(fxChips(e.fx))}${e.nextMove && e.nextMove.round === (Store.S.stol.round || 0) && Store.S.stol.fight ? `<span class="chip sm gold tell" tabindex="0" title="${esc('Szykuje na drugą turę: ' + e.nextMove.name + '. ' + (BOSS_TELL[e.nextMove.name] || ''))}" data-gloss="${esc('Szykuje na drugą turę: ' + e.nextMove.name + '. ' + (BOSS_TELL[e.nextMove.name] || ''))}">⚠ ${esc(e.nextMove.name)}</span>` : ''}</div>
  </div>`;
}

/* ---------- scena walki: tło regionu i całe postacie (klikane jak karty) ---------- */
/* krótka nazwa na wąskim ekranie: „Kościany obrońca” → „obrońca” (przymiotnik na początku odpada) */
function shortFoe(n) { const w = String(n || '').split(' '); return w.length > 1 && /[yi]$/.test(w[0]) ? w.slice(1).join(' ') : n; }
function figTag(full, short) { return `<span class="fig-tag" title="${esc(full)}"><span class="tl">${esc(full)}</span>${short && short !== full ? `<span class="ts">${esc(short)}</span>` : ''}</span>`; }
/* stany pod postacią: na komputerze krótkie napisy, na telefonie kolorowe kropki (pełny opis w pasku akcji) */
function figFx(list) {
  if (!list.length) return '';
  const col = c => ({ red: 'r', green: 'g', violet: 'v', gold: 'y', affl: 'a', virtue: 'y' }[c] || 'n');
  return `<span class="fig-fx">${list.slice(0, 3).map(([c, t]) => `<span class="ff f-${col(c)}" title="${esc(t)}"><i></i><em>${esc(t)}</em></span>`).join('')}${list.length > 3 ? `<span class="ff f-n" title="${esc(list.slice(3).map(x => x[1]).join(', '))}"><i></i><em>+${list.length - 3}</em></span>` : ''}</span>`;
}
function figHero(id, pos) {
  const h = H(id); if (!h) return '<div class="fig empty" aria-hidden="true"></div>';
  const ce = curEntry(); const isCur = ce && ce.k === 'h' && ce.id === id; const st = heroStats(h);
  const P = UI.pend; const tgt = P && P.need === 'ally' && Store.S.stol.heroes.includes(id); const tgtE = UI.epend && UI.epend.valid.includes(id);
  const sel = UI.sel.k === 'h' && UI.sel.id === id;
  return `<button class="fig hero ${sel ? 'sel' : ''} ${isCur ? 'cur' : ''} ${tgt || tgtE ? 'tgt' : ''} ${h.dd ? 'dd' : ''}" data-act="${tgt ? 'pickAlly' : tgtE ? 'pickHeroT' : 'selH'}" data-id="${id}" aria-label="${esc(heroLabel(h))}, pozycja ${pos}, Zdrowie ${h.hp} z ${st.maxhp}, Stres ${h.stress}">
    <svg viewBox="0 0 100 200" class="fig-svg" aria-hidden="true">${heroFigure(h)}</svg>
    ${figTag(heroLabel(h))}<span class="fig-bar"><i class="hp" style="width:${Math.round(100 * h.hp / Math.max(1, st.maxhp))}%"></i></span><span class="fig-bar st"><i style="width:${Math.min(100, h.stress * 5)}%"></i></span>
    ${figFx([].concat(h.dd ? [['red', 'Próg Śmierci']] : [], h.state ? [[h.state.kind === 'virtue' ? 'virtue' : 'affl', h.state.name]] : [], h.block ? [['gold', 'Blok ' + h.block]] : [], fxChips(h.fx)))}</button>`;
}
function figEnemy(x) {
  const e = x.e; const ce = curEntry(); const isCur = ce && ce.k === 'e' && ce.id === e.id; const wide = (e.size || 1) === 2;
  const P = UI.pend; const tgt = P && P.need === 'enemy' && P.valid.includes(e.id); const sel = UI.sel.k === 'e' && UI.sel.id === e.id;
  const vw = wide ? 200 : 100; const vh = wide && !e.corpse && FIG_ELITE[e.name] ? 220 : 200;
  return `<button class="fig enemy ${wide ? 'wide' : ''} ${e.boss ? 'boss' : ''} ${e.elite ? 'elite' : ''} ${e.corpse ? 'corpse' : ''} ${sel ? 'sel' : ''} ${isCur ? 'cur' : ''} ${tgt ? 'tgt' : ''}" data-act="${tgt ? 'pickEnemy' : 'selE'}" data-id="${e.id}" aria-label="${esc(e.name)}, pozycja ${x.pos}, Zdrowie ${e.hp} z ${e.maxhp}, Unik ${enemyDodge(e)}, Pancerz ${enemyProt(e)}" title="${esc(e.name + ' · Zdrowie ' + e.hp + '/' + e.maxhp + ' · Unik ' + enemyDodge(e) + ' · Pancerz ' + enemyProt(e) + ' · Szybkość ' + e.speed)}">
    <svg viewBox="0 0 ${vw} ${vh}" class="fig-svg" aria-hidden="true"><g transform="translate(${vw} 0) scale(-1 1)">${enemyFigure(e)}</g></svg>
    ${figTag(e.name, shortFoe(e.name))}${e.corpse ? '' : `<span class="fig-bar"><i class="hp" style="width:${Math.round(100 * e.hp / Math.max(1, e.maxhp))}%"></i></span>`}
    ${e.corpse ? '' : figFx([].concat(e.nextMove && e.nextMove.round === (Store.S.stol.round || 0) && Store.S.stol.fight ? [['gold', '⚠ ' + e.nextMove.name]] : [], fxChips(e.fx)))}</button>`;
}
Object.assign(ACT, {
  fightMenu: () => { UI.fightMenu = !UI.fightMenu; renderView(); },
  gmTools: () => { const s = Store.S.stol; const open = UI.gmTools != null ? UI.gmTools : !s.enemies.length; UI.gmTools = !open; renderView(); },
  cineToggle: () => { try { localStorage.setItem('pio:cine', cineOn() ? 'off' : 'on'); } catch (e) { } cineClear(); renderView(); } });
document.addEventListener('click', e => { if (UI.cine && e.target.closest && e.target.closest('.stage') && !e.target.closest('[data-act]')) cineClear(); }, true);
function stageHtml(s, enemies) {
  const w = Store.S.wyprawa; const region = s.region || (w.quest ? (w.quest.dd != null ? 'DD' : REGIONS[w.quest.region].key) : 'Ruiny');
  const empties = Math.max(0, 4 - enemies.reduce((a, x) => a + (x.e.size || 1), 0));
  return `<div class="stage-wrap"><div class="stage">${battleBg(region, s.torch)}<svg class="fig-defs" width="0" height="0" aria-hidden="true"><defs><filter id="fg-glow" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs></svg>
    <div class="stage-field"><div class="stage-h">${[3, 2, 1, 0].map(i => figHero(s.heroes[i], i + 1)).join('')}</div><div></div><div class="stage-e">${enemies.map(figEnemy).join('')}${'<div class="fig empty" aria-hidden="true"></div>'.repeat(empties)}</div></div></div></div>`;
}
function lastActHtml(L) {
  const col = h => h.replace(/<b>(PUDŁO|UNIK|BLOK)<\/b>/g, '<b class="k-miss">$1</b>').replace(/<b>(TRAFIENIE)<\/b>/g, '<b class="k-hit">$1</b>').replace(/<b>(KRYTYK)<\/b>/g, '<b class="k-crit">$1</b>');
  return `<div class="lastact" aria-live="polite"><span class="lbl">Ostatnia akcja</span> <b class="la-head">${esc(L.head)}</b>${(L.sum || []).length ? `<ul>${L.sum.map(x => `<li>${col(md(x))}</li>`).join('')}</ul>` : ''}</div>`;
}
/* ---------- zbliżenia w stylu Darkest Dungeon 2: kamera najeżdża na atakującego i cel,
   zamach, cios, krótkie zatrzymanie, wstrząs, krew i iskry, unik z cieniami, kamera wraca ---------- */
const CINE_MS = 1800;
function cineOn() { try { return localStorage.getItem('pio:cine') !== 'off' && !window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { return true; } }
function cineLeft() { return UI.cine ? Math.max(0, CINE_MS - (Date.now() - UI.cine.t)) : 0; }
function cineRand(seed) { let x = 2166136261; for (const ch of String(seed)) x = Math.imul(x ^ ch.charCodeAt(0), 16777619) >>> 0; return () => { x = (Math.imul(x, 1664525) + 1013904223) >>> 0; return x / 4294967296; }; }
function startCine(L) {
  if (!cineOn()) return false;
  const act = (L.ev || []).find(e => e.k === 'act'); if (!act) return false;
  const kinds = {}, txts = {};
  (L.ev || []).forEach(e => { if (e.k === 'act') return; const k = e.k === 'dodge' && e.txt === 'BLOK' ? 'block' : e.k; (kinds[e.id] = kinds[e.id] || []).push(k); (txts[e.id] = txts[e.id] || []).push([k, e.txt]); });
  if (!Object.keys(kinds).length) kinds[act.id] = ['fx'];
  const all = [].concat(...Object.values(kinds));
  const fx = all.includes('heal') ? 'heal' : all.every(k => k === 'stress' || k === 'fx' || k === 'resist') ? 'wave' : null;
  UI.cine = { id: L.id, t: Date.now(), actor: act.id, name: act.txt, kinds, txts, fx, geo: null };
  applyCine(); return true;
}
function cineClear() {
  const st = document.querySelector('.stage'); UI.cine = null; clearTimeout(UI.cineT);
  if (!st) return; st.classList.remove('cine', 'c-shake');
  st.querySelectorAll('.c-actor, .c-target').forEach(el => { el.className = el.className.replace(/\b(c|k)-[a-z]+\b/g, '').replace(/\s+/g, ' ').trim(); el.style.animationDelay = ''; });
  const f = st.querySelector('.stage-field'); if (f) f.style.animationDelay = ''; const bg = st.querySelector('.stage-bg'); if (bg) bg.style.animationDelay = '';
  st.querySelectorAll('.cine-fx, .cine-ui').forEach(x => x.remove());
}
/* geometria liczona raz, na świeżej scenie: kto, dokąd się zbliża, jak mocno najeżdża kamera */
function cineGeo(stage, field, a, others, C) {
  const fw = field.offsetWidth, fh = field.offsetHeight; const fr = field.getBoundingClientRect();
  const cx = el => el.offsetLeft + el.offsetWidth / 2;
  const hero = a.classList.contains('hero'); const ax = cx(a);
  let dir = hero ? 1 : -1, pull = 0, tpull = 0, lunge = 0, melee = false;
  const opp = others.some(el => el.classList.contains('hero') !== hero);
  if (others.length) {
    const txs = others.map(cx); const near = txs.reduce((m, x) => Math.abs(x - ax) < Math.abs(m - ax) ? x : m, txs[0]);
    dir = Math.sign(near - ax) || dir; const g = Math.abs(near - ax);
    melee = opp && !C.fx && g < fw * 0.5;
    const want = fw * (opp ? (melee ? 0.16 : 0.3) : 0.13);
    const shift = Math.max(0, g - want);
    pull = dir * shift * (opp ? 0.6 : 0.5); tpull = -dir * shift * (opp ? 0.4 : 0.5);
    lunge = melee ? dir * Math.min(want * 0.5, 44) : -dir * 10;
  }
  const xs = [ax + pull].concat(others.map(el => cx(el) + tpull));
  const half = Math.max(a.offsetWidth * 0.8, 40);
  const minX = Math.min(...xs) - half, maxX = Math.max(...xs) + half;
  const span = Math.max(maxX - minX, fw * 0.28);
  const narrow = window.innerWidth < 700;
  const s = Math.max(1.15, Math.min(narrow ? 1.9 : 1.7, fw * 0.94 / span));
  const M = (minX + maxX) / 2; const tx = fw / 2 - M * s;
  const box = el => { const sv = el.querySelector('.fig-svg') || el; const r = sv.getBoundingClientRect(); return { x: r.left - fr.left, y: r.top - fr.top, w: r.width, h: r.height }; };
  const boxes = {}; others.concat([a]).forEach(el => { boxes[el.dataset.id] = box(el); });
  /* kadr jak w grze: głowy tuż pod górnym pasem, nogi mogą wyjść poza dół kadru */
  const sw = stage.offsetWidth, sh = stage.offsetHeight;
  const tops = Object.values(boxes).map(b => b.y); const minTop = Math.min(...tops);
  const topLine = sh * 0.115 + 34 - field.offsetTop; const ty = Math.min(0, topLine - minTop * s); /* miejsce na liczby nad głowami */
  /* punkt uderzenia: tam kamera robi krótki dodatkowy najazd */
  const ix = others.length ? xs.slice(1).reduce((p, x) => p + x, 0) / others.length : ax; const hh = Math.max(...Object.values(boxes).map(b => b.h)); const iy = minTop + hh * 0.35; const s2 = s * 1.045;
  const bs = 1 + (s - 1) * 0.35;
  const btx = Math.min(0, Math.max(sw - sw * bs, sw / 2 - (field.offsetLeft + M) * bs)); const bty = Math.min(0, Math.max(sh - sh * bs, sh * (1 - bs) * 0.6));
  return { s, tx, ty, s2, cpx: ix * (s2 - s), cpy: iy * (s2 - s), bs, btx, bty, pull, tpull, lunge, dir, melee, boxes, fw, fh };
}
function applyCine() {
  const C = UI.cine; if (!C) return; const el0 = Date.now() - C.t;
  const stage = document.querySelector('.stage'); if (!stage || el0 >= CINE_MS) return cineClear();
  const field = stage.querySelector('.stage-field'); const a = stage.querySelector('.fig[data-id="' + C.actor + '"]'); if (!field || !a) return cineClear();
  const ids = Object.keys(C.kinds); const selfOnly = ids.every(id => id === C.actor);
  const tEls = ids.filter(id => id !== C.actor || selfOnly).map(id => [id, stage.querySelector('.fig[data-id="' + id + '"]')]).filter(x => x[1]);
  const others = tEls.filter(([id]) => id !== C.actor).map(x => x[1]);
  if (!C.geo) C.geo = cineGeo(stage, field, a, others, C);
  const G = C.geo; const delay = -el0 + 'ms';
  const V = { '--cs': G.s, '--ctx': G.tx + 'px', '--cty': G.ty + 'px', '--cs2': G.s2, '--cpx': G.cpx + 'px', '--cpy': G.cpy + 'px', '--bs': G.bs, '--btx': G.btx + 'px', '--bty': G.bty + 'px' };
  Object.entries(V).forEach(([k, v]) => stage.style.setProperty(k, v));
  stage.style.setProperty('--cd', delay); stage.classList.add('cine'); field.style.animationDelay = delay; const bg = stage.querySelector('.stage-bg'); if (bg) bg.style.animationDelay = delay;
  a.classList.add('c-actor', G.melee ? 'c-melee' : others.length && !C.fx ? 'c-ranged' : 'c-cast');
  a.style.setProperty('--pull', G.pull + 'px'); a.style.setProperty('--lunge', G.lunge + 'px'); a.style.setProperty('--dir', G.dir); a.style.animationDelay = delay;
  const all = [].concat(...Object.values(C.kinds));
  const kindOf = k => k.includes('kill') ? 'kill' : k.includes('crit') ? 'crit' : k.includes('hit') ? 'hit' : k.includes('block') ? 'block' : k.includes('dodge') ? 'dodge' : k.includes('miss') ? 'miss' : k.includes('heal') ? 'heal' : k.includes('stress') ? 'stress' : 'fx';
  tEls.forEach(([id, el]) => {
    if (id === C.actor) return;
    el.classList.add('c-target', 'k-' + kindOf(C.kinds[id]));
    el.style.setProperty('--tpull', G.tpull + 'px'); el.style.setProperty('--away', G.dir * 18 + 'px'); el.style.setProperty('--dir', G.dir); el.style.animationDelay = delay;
  });
  if (all.includes('crit') || all.includes('kill')) { stage.classList.add('c-shake'); stage.style.setProperty('--shd', delay); }
  /* warstwa efektów w przestrzeni sceny (przybliża się razem z kamerą) */
  let fxl = field.querySelector('.cine-fx'); if (!fxl) { fxl = document.createElement('div'); fxl.className = 'cine-fx'; fxl.setAttribute('aria-hidden', 'true'); field.appendChild(fxl); }
  const rnd = cineRand(C.id); const ab = G.boxes[C.actor] || { x: 0, y: 0, w: 60, h: 120 };
  const ax = ab.x + ab.w / 2 + G.pull + G.lunge * 0.6, ay = ab.y + ab.h * 0.4;
  let html = ''; let tj = 0;
  tEls.forEach(([id, el]) => {
    const b = G.boxes[id]; if (!b) return; const k = kindOf(C.kinds[id]);
    const self = id === C.actor; const x = b.x + b.w / 2 + (self ? G.pull : G.tpull), y = b.y + b.h * 0.38;
    const st = `animation-delay:${delay}`;
    if (C.fx === 'heal' || k === 'heal') {
      html += `<i class="fx-glow g-heal" style="left:${x}px;top:${y + b.h * 0.2}px;${st}"></i>`;
      for (let i = 0; i < 9; i++) html += `<i class="fx-mote" style="left:${x + (rnd() - .5) * b.w * .9}px;top:${y + b.h * (.1 + rnd() * .45)}px;--d:${(rnd() * .25).toFixed(2)}s;${st}"></i>`;
    } else if (C.fx === 'wave' || k === 'stress' || k === 'fx') {
      html += `<i class="fx-wave" style="left:${x}px;top:${y}px;${st}"></i><i class="fx-wave b" style="left:${x}px;top:${y}px;${st}"></i>`;
    } else {
      if (!G.melee) { const ang = Math.atan2(y - ay, x - ax) * 180 / Math.PI; html += `<i class="fx-bolt" style="left:${ax}px;top:${ay}px;--tx:${x - ax}px;--ty:${y - ay}px;--ang:${ang}deg;${st}"></i>`; }
      if (k === 'hit' || k === 'crit' || k === 'kill') {
        const ix = x + G.dir * 18 * (k === 'hit' ? 1 : 2);
        html += `<svg class="fx-slash ${k === 'hit' ? 'hit' : 'crit'}" style="left:${x}px;top:${y}px;${st}" viewBox="-50 -50 100 100"><path d="${G.dir > 0 ? 'M-36-30Q0-6 34 32' : 'M36-30Q0-6-34 32'}"/>${k !== 'hit' ? `<path d="${G.dir > 0 ? 'M34-28Q2-2-32 30' : 'M-34-28Q-2-2 32 30'}"/>` : ''}</svg><i class="fx-burst ${k === 'hit' ? 'hit' : 'crit'}" style="left:${x}px;top:${y}px;${st}"></i>`;
        const n = k === 'hit' ? 9 : 16;
        for (let i = 0; i < n; i++) { const vx = G.dir * (14 + rnd() * (k === 'hit' ? 60 : 95)); const vy = -(8 + rnd() * 55); html += `<i class="fx-drop" style="left:${ix}px;top:${y + (rnd() - .5) * 20}px;--vx:${vx.toFixed(0)}px;--vy:${vy.toFixed(0)}px;--sz:${(3 + rnd() * 5).toFixed(1)}px;${st}"></i>`; }
        if (k !== 'hit') for (let i = 0; i < 8; i++) { const ang = (G.dir > 0 ? -60 : 120) + rnd() * 120; html += `<i class="fx-spark" style="left:${x}px;top:${y}px;--ang:${ang.toFixed(0)}deg;--len:${(26 + rnd() * 40).toFixed(0)}px;${st}"></i>`; }
      } else if (k === 'block') {
        html += `<i class="fx-block" style="left:${x}px;top:${y}px;${st}"></i>`;
        for (let i = 0; i < 7; i++) { const ang = (G.dir > 0 ? 120 : -60) + rnd() * 120; html += `<i class="fx-spark s-blue" style="left:${x - G.dir * 14}px;top:${y}px;--ang:${ang.toFixed(0)}deg;--len:${(20 + rnd() * 30).toFixed(0)}px;${st}"></i>`; }
      } else if (k === 'dodge' || k === 'miss') {
        html += `<svg class="fx-slash miss" style="left:${x - G.dir * 10}px;top:${y}px;${st}" viewBox="-50 -50 100 100"><path d="${G.dir > 0 ? 'M-34-30Q0-6 32 32' : 'M34-30Q0-6-32 32'}"/></svg>`;
        if (k === 'dodge') { const svg = (el.querySelector('.fig-svg') || {}).outerHTML || ''; [1, 2].forEach(i => { html += `<div class="fx-ghost g${i}" style="left:${b.x + G.tpull}px;top:${b.y}px;width:${b.w}px;height:${b.h}px;--gx:${(G.dir * 18 * 1.2 * i).toFixed(0)}px;${st}">${svg}</div>`; }); }
      }
    }
    /* liczby i napisy przy celu, w przybliżeniu (jak w grze) */
    /* nad głową celu (jak w grze); przy krawędzi kadru przesunięte do środka, sąsiednie cele na różnych wysokościach */
    const X = Math.max(G.fw * 0.16, Math.min(G.fw * 0.84, x * G.s + G.tx)); const nx = (X - G.tx) / G.s; const drop = (tj++ % 2) * 16;
    (C.txts[id] || []).forEach(([kk, t], i) => { html += `<i class="fx-num n-${kk}" style="left:${nx}px;top:${b.y - 16 + drop + i * 17}px;${st}">${esc(t)}</i>`; });
  });
  if (fxl._html !== html) { fxl.innerHTML = html; fxl._html = html; }
  /* warstwa kinowa: czarne pasy, winieta, nazwa umiejętności, błysk przy krytyku */
  let ui = stage.querySelector('.cine-ui'); if (!ui) { ui = document.createElement('div'); ui.className = 'cine-ui'; ui.setAttribute('aria-hidden', 'true'); stage.appendChild(ui); }
  const who = (a.querySelector('.fig-tag .tl') || a.querySelector('.fig-tag') || {}).textContent || '';
  const uh = `<i class="cbar t" style="animation-delay:${delay}"></i><i class="cbar b" style="animation-delay:${delay}"></i><i class="cvig" style="animation-delay:${delay}"></i><div class="cname" style="animation-delay:${delay}"><small>${esc(who)}</small><b>${esc(C.name || '')}</b></div>${all.includes('crit') ? `<i class="cflash" style="animation-delay:${delay}"></i>` : ''}`;
  if (ui._html !== uh) { ui.innerHTML = uh; ui._html = uh; }
  clearTimeout(UI.cineT); UI.cineT = setTimeout(cineClear, CINE_MS - el0 + 30);
}
/* napisy nad postaciami po każdej akcji: PUDŁO, UNIK, −5, KRYTYK… (jak w grze) */
function showPops() {
  const L = Store.S.stol.last; if (UI.cine && (!L || L.id === UI.cine.id)) applyCine();
  if (!L || L.id === UI.lastShown) return;
  UI.lastShown = L.id; if (Date.now() - L.t > 10000) return;
  const cine = startCine(L);
  if (cine) return; /* liczby i napisy pokazuje samo zbliżenie */
  let layer = document.getElementById('pops');
  if (!layer) { layer = document.createElement('div'); layer.id = 'pops'; layer.setAttribute('aria-hidden', 'true'); document.body.appendChild(layer); }
  const count = {};
  (L.ev || []).forEach(ev => {
    let el = document.querySelector('.fig[data-id="' + ev.id + '"]') || document.querySelector('.slot[data-id="' + ev.id + '"]');
    if (ev.k === 'act' && el && el.classList.contains('fig') && !cine) { el.classList.remove('act-h', 'act-e'); void el.offsetWidth; el.classList.add(el.classList.contains('hero') ? 'act-h' : 'act-e'); }
    if (!el) el = document.querySelector(ev.k === 'act' ? '.side-h' : '.side-e'); if (!el) return;
    const r = el.getBoundingClientRect(); const n = count[ev.id] = (count[ev.id] || 0) + 1;
    const p = document.createElement('div'); p.className = 'pop pop-' + ev.k; p.textContent = ev.txt;
    p.style.left = (r.left + r.width / 2) + 'px'; p.style.top = (r.top + (ev.k === 'act' ? -6 : 18) + (n - 1) * 26) + 'px';
    p.style.animationDelay = ((n - 1) * 0.25 + (ev.k === 'act' ? 0 : cine ? 0.5 : 0.2)) + 's';
    layer.appendChild(p); setTimeout(() => p.remove(), 3400 + n * 250);
    if (ev.k !== 'act' && !(cine && el.classList.contains('fig'))) { el.classList.add('flash-' + (ev.k === 'miss' || ev.k === 'dodge' ? 'miss' : ev.k === 'heal' ? 'heal' : 'hit')); }
  });
}
VIEWS.stol = {
  after(el) { showPops(); const n = el.querySelector('.init .ini.now'); if (n && n.parentNode.scrollWidth > n.parentNode.clientWidth) n.parentNode.scrollLeft = Math.max(0, n.offsetLeft - n.parentNode.offsetLeft - 40); },
  render() {
    const s = Store.S.stol; const gm = Store.isGM(); const W = Store.canWrite();
    const enemies = enemyPositions(s.enemies);
    const living = s.enemies.filter(e => !e.corpse).length;
    const ce = curEntry();
    /* nowa tura: od razu zaznacz tego, kto działa (jak w grze) — bez szukania i klikania */
    if (s.fight && ce && !UI.pend && !UI.epend && UI.autoSelKey !== turnKey() + ce.k + ce.id) { UI.autoSelKey = turnKey() + ce.k + ce.id; if (ce.k === 'h' || gm) UI.sel = { k: ce.k, id: ce.id }; }
    const curName = ce ? entryName(ce) : null;
    const curNote = ce ? (() => { const x = ce.k === 'h' ? H(ce.id) : s.enemies.find(e => e.id === ce.id); return x && x.fx && x.fx.lostTurn === (s.round || 0) ? (x.fx.lostWhy === 'stun' ? ' · ogłuszony, tura przepada' : ' · tura przejęta') : s.acted === turnKey() ? ' · już działał' : ''; })() : '';
    return `
    ${UI.pend ? `<div class="pendbar">Wybierz cel: <b>${esc(UI.pend.label)}</b> <button class="btn sm" data-act="cancelPend">Anuluj</button>${UI.pend.multi ? ` <button class="btn sm primary" data-act="fireMulti">Użyj na wszystkich</button>` : ''}</div>` : ''}
    ${UI.epend ? `<div class="pendbar">Wybierz bohatera, w którego ${esc(UI.epend.label)} <button class="btn sm" data-act="cancelPend">Anuluj</button></div>` : ''}
    <section class="panel fieldp has-stage">
      <div class="fhead">
        <div><span class="lbl">${s.fight ? 'Walka' : 'Spokój'}</span> <b class="round">${s.fight ? 'Runda ' + s.round : 'Drużyna w szyku'}</b>${curName ? ` <span class="chip gold">tura: ${esc(curName)}${curNote}</span>` : ''}</div>
        <div class="row">
          ${W && !s.fight ? `<button class="btn sm" data-act="formation">Ustaw drużynę</button><button class="btn sm primary" data-act="fightStart" ${s.enemies.length && s.heroes.length ? '' : 'disabled'}>Rozpocznij walkę</button>` : ''}
          ${W && s.fight ? `<button class="btn sm primary" data-act="nextTurn" ${s.init.length ? '' : 'disabled'}>Następna tura</button><button class="btn sm ghost" data-act="fightEnd">Zakończ walkę</button>` : ''}
          <button class="btn sm ghost gear ${UI.fightMenu ? 'on' : ''}" data-act="fightMenu" aria-expanded="${!!UI.fightMenu}" title="Ustawienia walki" aria-label="Ustawienia walki">⚙</button>
        </div>
      </div>
      ${UI.fightMenu ? `<div class="fmenu"><span class="lbl">Ustawienia</span>
        ${W && s.fight ? `<button class="btn sm" data-act="formation">Ustaw drużynę</button><button class="btn sm" data-act="newRound" title="Ręcznie: zacznij nową rundę i rzuć na inicjatywę">Nowa runda</button>` : ''}
        <button class="btn sm ${cineOn() ? 'gold' : 'ghost'}" data-act="cineToggle" title="Krótkie zbliżenia ataków, uników i obrony (tylko na tym urządzeniu)">Zbliżenia: ${cineOn() ? 'wł.' : 'wył.'}</button>
        ${gm ? `<button class="btn sm ${s.autoFight !== false ? 'gold' : 'ghost'}" data-act="autoToggle" title="Płynna walka: tura przechodzi sama po akcji, wrogowie działają według zasad">Płynna walka: ${s.autoFight !== false ? 'wł.' : 'wył.'}</button>` : ''}</div>` : ''}
      ${s.fight && s.init.length ? `<div class="init">${s.init.map((x, i) => `<span class="ini ${x.k} ${i === s.turn ? 'now' : ''} ${i < s.turn ? 'done' : ''}">${esc(entryName(x))} <b class="num">${x.tot}</b></span>`).join('')}</div>` : ''}
      ${s.fight && !living ? `<div class="won"><b>Wrogowie pokonani.</b> ${s.looted ? '<span class="muted small">łup wylosowany</span>' : W ? `<button class="btn sm gold" data-act="lootFight">Rzuć na łup</button>` : ''} ${W ? `<button class="btn sm primary" data-act="fightEnd">Zakończ walkę</button>` : ''}</div>` : ''}
      ${eventBanner()}
      ${lootCardHtml()}
      ${lootStrip(true)}
      ${s.heroes.length || s.enemies.length ? stageHtml(s, enemies) : ''}
      ${s.heroes.length ? this.actionBar() : `<p class="muted">Drużyna jest pusta. ${W ? 'Kliknij „Ustaw drużynę” i wybierz do czterech bohaterów z rejestru.' : ''}</p>`}
      ${s.last ? lastActHtml(s.last) : ''}
    </section>
    ${gm ? this.gmPanel() : ''}`;
  },
  actionBar() {
    const sel = UI.sel;
    if (sel.k === 'e') return this.enemyPanel();
    const h = sel.k === 'h' ? H(sel.id) : null;
    if (!h) return `<div class="actbar"><p class="muted">Kliknij bohatera na scenie, żeby użyć umiejętności, przesunąć się albo sięgnąć do plecaka.${Store.isGM() ? ' Kliknij wroga, żeby nim zagrać.' : ' Kliknij wroga, żeby zobaczyć, co potrafi.'}</p></div>`;
    const can = canHero(h); const c = CLS[h.cls]; const st = heroStats(h); const s = Store.S.stol;
    const pos = s.heroes.indexOf(h.id) + 1;
    const ohyda = c.name === 'Ohyda';
    const skills = h.skills.filter(i => !ohyda || (c.skills[i].form === (h.form === 'beast' ? 'bestia' : 'człowiek')));
    const w = Store.S.wyprawa; const sup = w.sup || {};
    const g = heroTurn(h); const lost = !!g.lost; const busy = !g.ok;
    const ekst = h.state && h.state.kind === 'ekstaza';
    const bossNoRun = s.enemies.some(e => e.boss && !e.corpse && e.name !== 'Shambler');
    const items = [['Bandaże', 'bandaż', 'bleed'], ['Antidota', 'antidotum', 'blight'], ['Laudanum', 'laudanum', 'horror'], ['Zioła', 'zioła', 'debuff'], ['Woda święcona', 'woda święcona', 'holy'], ['Prowiant', 'prowiant', 'food']].filter(([k]) => !w.quest || sup[k] > 0);
    const legend = 'Złote kropki: z której pozycji bohatera można użyć (ułożone jak na scenie: 4 3 2 1, pozycja 1 najbliżej wrogów). Czerwone: które pozycje wroga trafia (1 2 3 4 od przodu). Połączone kreską: trafia wszystkie naraz.';
    return `<div class="actbar act">
      <div class="ab-head">
        <b class="ab-name">${esc(heroLabel(h))}</b> <span class="hint">${pos ? 'pozycja ' + pos : 'poza szykiem'} · ${esc(ownerName(h))}</span>
        ${bar('hp ab-bar', h.hp, st.maxhp, 'Zdrowie ' + h.hp + ' / ' + st.maxhp)}${bar('st ab-bar', h.stress, 20, 'Stres ' + h.stress + ' / 20')}
        <span class="ab-chips">${h.dd ? gchip('red', 'Próg Śmierci') : ''}${stateChip(h)}${h.exhausted ? gchip('', 'Wyczerpanie') : ''}${h.block ? gchip('gold', 'Blok ' + h.block) : ''}${h.fatigue ? gchip('', 'Zmęczenie ' + h.fatigue) : ''}${chipsHtml(fxChips(h.fx))}</span>
        ${h.dd && can ? `<button class="btn sm primary" data-act="deathRoll">Rzut Śmierci</button>` : ''}
        <span class="sp"></span><span class="hint help" tabindex="0" data-gloss="${esc(legend)}" title="${esc(legend)}">jak czytać kropki?</span>
      </div>
      ${busy && can ? `<p class="ab-msg ${lost ? 'warn' : 'muted'}">${esc(g.why)}</p>` : ''}
      ${ekst ? `<p class="ab-msg warn">Ekstaza bólu: musi atakować i nie leczy innych.</p>` : ''}
      ${!can ? `<p class="ab-msg muted">To bohater innego gracza — możesz go obejrzeć, ale działa nim jego gracz albo MG.</p>` : ''}
      <div class="skills">${skills.map(i => {
        const v = skillView(h, i, st); const okPos = pos && v.inf.from.includes(pos);
        const lim = /2 razy na walkę/.test(v.s.eff) ? 2 : /raz na walkę/.test(v.s.eff) ? 1 : 0; const used = ((h.fx || {}).used || {})[i] || 0; const spent = (lim && used >= lim) || busy || (ekst && !v.inf.attack);
        return `<button class="skill" data-act="useSkill" data-i="${i}" ${can && okPos && !spent && s.heroes.includes(h.id) ? '' : 'disabled'} title="${esc((busy ? g.why : spent ? 'Wykorzystane w tej walce' : !okPos ? 'Nie z tej pozycji' : v.s.eff || '') + ' · ' + skillPosTxt(v))}">
          <span class="sn">${esc(v.s.name)}${!okPos && pos ? ' <span class="nopos">nie z poz. ' + pos + '</span>' : ''}</span>
          <span class="sp2">${posDots(v.inf.from, 'from')}<span class="sep">▸</span>${v.inf.to ? posDots(v.inf.to, v.inf.target === 'multi' ? 'to multi' : 'to') : `<span class="tw">${esc(v.s.w)}</span>`}</span>
          <span class="sv num">${v.cel != null ? 'Cel. ' + v.cel : ''}${v.dmg ? ' · ' + v.dmg : ''}${v.heal ? ' · leczy ' + v.heal : ''}${v.stress ? ' · −' + v.stress + ' Stres' : ''}${lim ? ' · ' + (lim - used) + '/' + lim + ' w walce' : ''}</span>
        </button>`;
      }).join('')}</div>
      ${can ? `<div class="ab-row">
        <button class="btn sm" data-act="heroMove" data-d="1" ${pos && pos < s.heroes.length && !busy ? '' : 'disabled'} title="Zamiana z sąsiadem z tyłu (dalej od wrogów)">◀ do tyłu</button><button class="btn sm" data-act="heroMove" data-d="-1" ${pos > 1 && !busy ? '' : 'disabled'} title="Zamiana z sąsiadem z przodu (bliżej wrogów)">do przodu ▶</button>
        <button class="btn sm" data-act="heroPass" ${busy ? 'disabled' : ''}>Pas</button>
        ${ohyda ? `<button class="btn sm gold" data-act="transform" ${busy ? 'disabled' : ''}>${h.form === 'beast' ? 'Wróć do ludzkiej postaci' : 'Przemiana w bestię'}</button>` : ''}
        <button class="btn sm" data-act="retreat" ${busy || !s.fight || bossNoRun ? 'disabled' : ''} ${bossNoRun ? 'title="Z walki z bossem nie ma odwrotu"' : ''}>Odwrót</button>
        <span class="ab-sep" aria-hidden="true"></span>
        <span class="lbl">Plecak</span>${items.map(([k, n, wk]) => `<button class="btn sm ghost" data-act="useItem" data-k="${k}" data-w="${wk}" ${busy && (!g.mine || lost) ? 'disabled' : ''}>${n}${w.quest ? ` <span class="muted num">${sup[k]}</span>` : ''}</button>`).join('') || '<span class="muted small">pusto</span>'}
      </div>
      ${Store.isGM() ? `<div class="ab-row ab-gm"><span class="lbl">Poprawki MG</span>
        <button class="btn sm ghost" data-act="adjH" data-f="hp" data-v="-1">Zdr −1</button><button class="btn sm ghost" data-act="adjH" data-f="hp" data-v="1">Zdr +1</button>
        <button class="btn sm ghost" data-act="adjH" data-f="stress" data-v="1">Stres +1</button><button class="btn sm ghost" data-act="adjH" data-f="stress" data-v="-1">Stres −1</button></div>` : ''}` : ''}
    </div>`;
  },
  enemyPanel() {
    const e = Store.S.stol.enemies.find(x => x.id === UI.sel.id);
    if (!e) return `<div class="actbar"><p class="muted">Ten wróg już nie stoi w szyku.</p></div>`;
    const gm = Store.isGM(); const eg = enemyTurn(e); const eoff = !eg.ok;
    return `<div class="actbar act">
      ${eoff && gm ? `<p class="${eg.lost ? 'warn' : 'muted'}">${esc(eg.why)}</p>` : ''}
      <div class="ab-head"><b class="ab-name">${esc(e.name)}</b> <span class="hint">${e.boss ? 'boss · 2 tury na rundę' : e.elite ? 'mini-boss' : esc(e.type || '')}</span>${bar('hp ab-bar', e.hp, e.maxhp, 'Zdrowie ' + e.hp + ' / ' + e.maxhp)}<span class="ab-chips">${chipsHtml(fxChips(e.fx))}</span></div>
      <p class="dim num small">Unik ${enemyDodge(e)} · Pancerz ${enemyProt(e)} · Szybkość ${e.speed} · Krzepa ${e.krzepa} · Odporność ${e.odp}${e.noBleed ? ' · niewrażliwy na krwawienie' : ''}</p>
      ${gm && !e.corpse ? `<div class="row eauto"><button class="btn primary" data-act="eAuto" ${eoff ? 'disabled' : ''} title="Wróg działa według zasad: wybór ataku kością${e.boss ? ', wzór ruchów bossa' : ''}, cel losowany (Znak ma pierwszeństwo)">Tura wroga — według zasad</button>${enemySpecials(e).map(n => `<button class="btn sm gold" data-act="eSpec" data-n="${esc(n)}" ${eoff ? 'disabled' : ''}>${esc(n)}</button>`).join('')}</div>
        ${e.boss && BOSS_AI[e.name] ? `<p class="small dim">Wzór ruchów: pierwsza tura w rundzie — ${esc(BOSS_AI[e.name].first)}; druga — k6: ${BOSS_AI[e.name].table.map(([a, b, n]) => (a === b ? a : a + '–' + b) + ' ' + esc(n)).join(', ')}.${(curEntry() || {}).id === e.id ? ' Teraz: <b>' + ((Store.S.stol.init || []).slice(0, Math.max(0, Store.S.stol.turn)).some(x => x.id === e.id) ? 'druga tura (k6)' : 'pierwsza tura (sygnatura)') + '</b>.' : ''}</p>` : ''}` : ''}
      <div class="atks">${(e.attacks || []).map((a, i) => `<div class="atk"><div>${a.w ? `<span class="sp2">${posDots(posList(a.w), a.aoe ? 'to multi' : 'to', 'hero')}<span class="ptxt">w bohaterów ${esc(a.w)}</span></span> ` : ''}${attackText(a)}</div>${gm && a.w ? `<div class="row">
        ${a.aoe ? `<button class="btn sm" data-act="eAtk" data-i="${i}" data-m="all" ${eoff ? 'disabled' : ''}>Atakuj pozycje ${esc(a.w)}</button>` : `<button class="btn sm" data-act="eAtk" data-i="${i}" data-m="rand" ${eoff ? 'disabled' : ''}>Losowy cel</button><button class="btn sm" data-act="eAtk" data-i="${i}" data-m="pick" ${eoff ? 'disabled' : ''}>Wybierz cel</button>`}
      </div>` : gm ? `<div class="row"><button class="btn sm" data-act="eSay" data-i="${i}">Ogłoś</button></div>` : ''}</div>`).join('') || '<p class="muted">Zwłoki nic nie robią.</p>'}</div>
      ${e.notes && e.notes.length ? `<div class="bnotes">${e.notes.map(n => `<p>${md(n.replace(/^([^:]+):/, '**$1:**'))}</p>`).join('')}</div>` : ''}
      ${gm ? `<div class="row acts">
        <button class="btn sm ghost" data-act="adjE" data-v="-1">Zdr −1</button><button class="btn sm ghost" data-act="adjE" data-v="-5">−5</button><button class="btn sm ghost" data-act="adjE" data-v="1">+1</button>
        <button class="btn sm ghost" data-act="eMove" data-d="-1">◀</button><button class="btn sm ghost" data-act="eMove" data-d="1">▶</button>
        <button class="btn sm ghost" data-act="eRemove">Usuń</button>
      </div>` : ''}
    </div>`;
  },
  gmPanel() {
    const s = Store.S.stol; const reg = s.region || 'Ruiny';
    const refs = foeRefs().filter(r => r.group === 'Twoi wrogowie' || r.group === (reg === 'DD' ? 'Najmroczniejszy Loch' : reg) || (r.group === 'Ciemność'));
    const open = UI.gmTools != null ? UI.gmTools : !s.enemies.length;
    return `<section class="panel gmtools"><button class="gm-h" data-act="gmTools" aria-expanded="${open}"><span class="lbl">Narzędzia MG</span> <b>Wrogowie na stole</b> <span class="hint">${s.enemies.length ? s.enemies.length + ' w szyku' : 'pusto'} · ${open ? 'zwiń ▴' : 'rozwiń ▾'}</span></button>${open ? `
      <div class="row">
        <label class="lbl" for="sreg">Region</label><select id="sreg" data-bind="stol.region">${REG_OPTS.map(([k, n]) => `<option value="${k}" ${reg === k ? 'selected' : ''}>${n}</option>`).join('')}</select>
        ${reg !== 'DD' ? `<label class="lbl" for="sdl">Loch</label><select id="sdl" data-bind="stol.dl" data-num>${DL.map((n, i) => `<option value="${i}" ${+s.dl === i ? 'selected' : ''}>${n}</option>`).join('')}</select>`
        : `<label class="lbl" for="sfl">Piętro</label><select id="sfl" data-bind="stol.floor" data-num>${DD_FLOORS.map((f, i) => `<option value="${i}" ${+(s.floor || 0) === i ? 'selected' : ''}>${i + 1}. ${f.boss}</option>`).join('')}</select>`}
      </div>
      <div class="row">
        <button class="btn sm" data-act="encounter">Losuj spotkanie</button>
        <button class="btn sm gold" data-act="bossSet">Boss${reg === 'DD' ? ' piętra' : ' regionu'}</button>
        <button class="btn sm" data-act="shambler">Shambler</button>
        <button class="btn sm ghost" data-act="clearE">Wyczyść</button>
      </div>
      <div class="row"><select id="addE">${[...new Set(refs.map(r => r.group))].map(g => `<optgroup label="${esc(g)}">${refs.filter(r => r.group === g).map(r => `<option value="${esc(r.ref)}">${esc(r.name)}${r.boss ? ' (boss)' : ''}</option>`).join('')}</optgroup>`).join('')}</select><button class="btn sm" data-act="addE">Dodaj wroga</button></div>
      <p class="muted small">Wrogowie dostają premie poziomu lochu automatycznie (Weterański: Zdrowie +5, Celność, Unik i obrażenia +1; Mistrzowski: +10 i +2, Szybkość +1, Stres +1). Najmroczniejszy Loch ma wartości ostateczne.</p>` : ''}
    </section>`;
  }
};

/* ---------- akcje stołu ---------- */
/* przeciąganie bohaterów w szyku: poza walką dowolna zamiana, w walce tylko z sąsiadem */
let _dragId = null;
document.addEventListener('dragstart', ev => { const sl = ev.target.closest && ev.target.closest('.slot.hero[draggable]'); if (!sl) return; _dragId = sl.dataset.id; try { ev.dataTransfer.setData('text/plain', _dragId); ev.dataTransfer.effectAllowed = 'move'; } catch (e) { } sl.classList.add('dragging'); });
document.addEventListener('dragend', () => { _dragId = null; $$('.slot.dragover, .slot.dragging').forEach(x => x.classList.remove('dragover', 'dragging')); });
document.addEventListener('dragover', ev => { const sl = ev.target.closest && ev.target.closest('.side-h .slot'); if (!sl || !_dragId) return; ev.preventDefault(); $$('.slot.dragover').forEach(x => x !== sl && x.classList.remove('dragover')); sl.classList.add('dragover'); });
document.addEventListener('drop', ev => {
  const sl = ev.target.closest && ev.target.closest('.side-h .slot'); if (!sl || !_dragId) return; ev.preventDefault();
  const st0 = Store.S.stol; const from = st0.heroes.indexOf(_dragId); const toId = sl.dataset.id; let to = toId ? st0.heroes.indexOf(toId) : -1;
  if (to < 0) { const p = +((sl.querySelector('.pos') || {}).textContent || 0); to = Math.min(st0.heroes.length - 1, Math.max(0, p - 1)); }
  if (from < 0 || to < 0 || from === to) return;
  if (st0.fight && Math.abs(from - to) > 1) return toast('W walce zamieniasz się tylko z sąsiadem.');
  if (st0.fight) { const g = heroTurn(H(_dragId)); if (!g.ok) return toast(g.why); if (st0.heroes[to] && bondOf(H(_dragId), st0.heroes[to]) <= -2) return toast('Ci dwaj nie znoszą się — w walce nie zamienią się miejscami.'); }
  const other = st0.heroes[to] && H(st0.heroes[to]); const rd = st0.round || 0;
  const blk = [H(_dragId), other].find(x => x && x.fx && x.fx.noSwap != null && x.fx.noSwap >= rd && st0.fight);
  if (blk) return toast(heroLabel(blk) + ' odmawia zamiany pozycji.');
  const id = _dragId;
  const mark = inTurns() ? turnKey() : null;
  setStol(st => { const a = st.heroes.indexOf(id), b = to; [st.heroes[a], st.heroes[b]] = [st.heroes[b], st.heroes[a]]; if (mark) st.acted = mark; }, heroLabel(H(id)) + ' zamienia się miejscami' + (other ? ' z: ' + heroLabel(other) : '') + '.');
});
function runFollow(res) { if (!res || !res.followUp) return; const fu = res.followUp; setTimeout(() => { const hh = H(fu.hid); if (hh && !hh.dead) commit(heroUse(hh, fu.idx, fu.targets || [])); }, 700); }
function setStol(fn, logText, cls) { const st = clone(Store.S.stol); fn(st); const ops = [opSet('stol', st)]; if (logText) ops.push({ log: { id: uid(), t: Date.now(), by: byName(), uid: Store.me.id, kind: 'roll', cls: cls || '', text: logText } }); Store.act(ops); }
function validEnemyTargets(v) {
  const list = enemyPositions(Store.S.stol.enemies);
  return list.filter(x => v.inf.to && v.inf.to.some(p => p >= x.pos && p <= x.last)).map(x => x.e.id);
}
Object.assign(ACT, {
  lootSeen: () => { UI.lootSeen = (Store.S.stol.lastLoot || {}).id; renderView(); },
  selH: el => { UI.sel = { k: 'h', id: el.dataset.id }; renderView(); },
  selE: el => { UI.sel = { k: 'e', id: el.dataset.id }; renderView(); },
  cancelPend: () => { UI.pend = null; UI.epend = null; renderView(); },
  formation: () => {
    const cur = Store.S.stol.heroes.slice();
    const list = liveHeroes();
    modal(`<h3>Drużyna</h3><p class="dim">Zaznacz do czterech bohaterów w kolejności od pozycji 1 (przód) do 4 (tył).</p>
      <div class="flist">${list.map(h => { const why = heroAway(h); const sick = !!why; return `<label class="chk ${sick ? 'sick' : ''}" ${sick ? `title="${esc(why)}"` : ''}><input type="checkbox" value="${h.id}" ${cur.includes(h.id) && !sick ? 'checked' : ''} ${sick ? 'disabled' : ''}> ${esc(heroLabel(h))} <span class="muted">${esc(CLS[h.cls].name)} · Poz. ${h.level}${sick ? ' · ' + esc(why) : ''}</span></label>`; }).join('') || '<p class="muted">Rejestr jest pusty — dodaj bohaterów w zakładce Bohaterowie.</p>'}</div>`,
      [{ t: 'Anuluj' }, { t: 'Ustaw', cls: 'primary', fn: () => {
        const picked = $$('.flist input:checked').map(i => i.value).filter(id => H(id) && !heroAway(H(id)));
        if (picked.length > 4) { toast('Najwyżej czterech bohaterów.'); return false; }
        const order = cur.filter(id => picked.includes(id)).concat(picked.filter(id => !cur.includes(id)));
        setStol(st => { st.heroes = order; });
      } }]);
  },
  useSkill: el => {
    const h = H(UI.sel.id); const i = +el.dataset.i; const v = skillView(h, i);
    const st0 = Store.S.stol; const pos = st0.heroes.indexOf(h.id) + 1;
    if (!canHero(h)) return toast('To bohater innego gracza.');
    if (!pos) return toast(heroLabel(h) + ' nie stoi w szyku.');
    if (!v.inf.from.includes(pos)) return toast(v.s.name + ' działa tylko z pozycji ' + v.s.z + ', a ' + heroLabel(h) + ' stoi na ' + pos + '. Najpierw zmień pozycję.');
    const lim = /2 razy na walkę/.test(v.s.eff) ? 2 : /raz na walkę/.test(v.s.eff) ? 1 : 0;
    if (lim && (((h.fx || {}).used || {})[i] || 0) >= lim) return toast(v.s.name + ' jest już wykorzystana w tej walce.');
    { const g = heroTurn(h); if (!g.ok) return toast(g.why); }
    if (h.state && h.state.kind === 'ekstaza' && !v.inf.attack) return toast('W Ekstazie bólu ' + heroLabel(h) + ' może tylko atakować.');
    if (CLS[h.cls].name === 'Ohyda' && v.s.form !== (h.form === 'beast' ? 'bestia' : 'człowiek')) return toast('Ta umiejętność należy do drugiej postaci Ohydy.');
    if (v.inf.target === 'self' || v.inf.target === 'party') { UI.pend = null; return actedCommit(heroUse(h, i, [])); }
    if (v.inf.target === 'ally') { UI.pend = { hid: h.id, idx: i, need: 'ally', label: v.s.name + ' — kliknij sojusznika' }; return renderView(); }
    const valid = validEnemyTargets(v);
    if (!valid.length) return toast('Nikt nie stoi na pozycjach ' + v.s.w + '.');
    if (v.inf.target === 'multi') { UI.pend = { hid: h.id, idx: i, need: 'enemy', valid, multi: true, label: v.s.name + ' (pozycje ' + v.s.w + ')' }; return renderView(); }
    UI.pend = { hid: h.id, idx: i, need: 'enemy', valid, label: v.s.name + ' (pozycje ' + v.s.w + ')' }; renderView();
  },
  pickEnemy: el => { const P = UI.pend; UI.pend = null; if (P.multi) return actedCommit(heroUse(H(P.hid), P.idx, P.valid)); actedCommit(heroUse(H(P.hid), P.idx, [el.dataset.id])); },
  fireMulti: () => { const P = UI.pend; UI.pend = null; actedCommit(heroUse(H(P.hid), P.idx, P.valid)); },
  pickAlly: el => { const P = UI.pend; UI.pend = null; actedCommit(heroUse(H(P.hid), P.idx, [el.dataset.id])); },
  slotMove: el => { UI.sel = { k: 'h', id: el.dataset.id }; ACT.heroMove(el); },
  heroMove: el => {
    const id = el.dataset.id || UI.sel.id; const st0 = Store.S.stol; const i = st0.heroes.indexOf(id); const j = i + +el.dataset.d; const rd = st0.round || 0;
    const blk = [id, st0.heroes[j]].map(H).find(x => x && x.fx && x.fx.noSwap != null && x.fx.noSwap >= rd && st0.fight);
    if (blk) return toast(heroLabel(blk) + ' odmawia zamiany pozycji (' + (blk.state ? blk.state.name : 'Przypadłość') + ').');
    if (st0.fight && H(st0.heroes[j]) && bondOf(H(id), st0.heroes[j]) <= -2) return toast(heroLabel(H(id)) + ' i ' + heroLabel(H(st0.heroes[j])) + ' nie znoszą się — w walce nie zamienią się miejscami.');
    if (st0.fight) { const g = heroTurn(H(id)); if (!g.ok) return toast(g.why); }
    const mark = inTurns() ? turnKey() : null;
    setStol(st => { moveInList(st.heroes, i, +el.dataset.d); if (mark) st.acted = mark; }, heroLabel(H(id)) + ' zmienia pozycję.');
  },
  heroPass: () => { const h = H(UI.sel.id); const g = heroTurn(h); if (!g.ok) return toast(g.why); const mark = inTurns() ? turnKey() : null; setStol(st => { if (mark) st.acted = mark; }, heroLabel(h) + ' pasuje.'); },
  transform: () => {
    { const g = heroTurn(H(UI.sel.id)); if (!g.ok) return toast(g.why); }
    const h = clone(H(UI.sel.id)); const lines = [];
    if (h.form === 'beast') { h.form = 'human'; lines.push(heroLabel(h) + ' wraca do ludzkiej postaci.'); }
    else {
      h.form = 'beast'; const r = d(4); heroHeal(h, r, lines); lines.push(heroLabel(h) + ' przemienia się w bestię i leczy ' + r + '.');
      if ((!Store.S.stol.transformed || !Store.S.stol.transformed.includes(h.id)) && h.fx && h.fx.noTransformStress) { const st = clone(Store.S.stol); st.transformed = (st.transformed || []).concat(h.id); lines.push('Ostrzeżenie z obozu: drużyna nie dostaje Stresu z tej przemiany.'); return actedCommit({ lines, stol: st, touched: { [h.id]: h } }); }
      if (!Store.S.stol.transformed || !Store.S.stol.transformed.includes(h.id)) {
        const st = clone(Store.S.stol); st.transformed = (st.transformed || []).concat(h.id);
        const touched = { [h.id]: h };
        st.heroes.filter(id => id !== h.id).forEach(id => { const t = clone(H(id)); heroStress(t, 1, lines); touched[id] = t; });
        lines.push('Pierwsza przemiana w tej walce: sojusznicy +1 Stres.');
        return actedCommit({ lines, stol: st, touched });
      }
    }
    actedCommit({ lines, stol: null, touched: { [h.id]: h } });
  },
  retreat: () => {
    if (Store.S.stol.enemies.some(e => e.boss && !e.corpse && e.name !== 'Shambler')) return toast('Z walki z bossem nie ma odwrotu.');
    { const g = heroTurn(H(UI.sel.id)); if (!g.ok) return toast(g.why); }
    const r = d(10); const ok = r <= 7 && r !== 10;
    const lines = ['Odwrót: k10 = **' + r + '** przy Szansie 7 → **' + (ok ? 'udany' : 'nieudany, tura stracona') + '**.'];
    const touched = {};
    if (ok) Store.S.stol.heroes.forEach(id => { const t = clone(H(id)); heroStress(t, 1, lines); touched[id] = t; });
    if (ok) lines.push('Każdy bohater +1 Stres. Drużyna wraca do poprzedniej komnaty.');
    if (ok) {
      const w = Store.S.wyprawa; const st = Object.assign(clone(Store.S.stol), { fight: false, init: [], turn: -1, round: 0, enemies: [], roomId: null, acted: null, fallen: [] });
      if (w.quest && w.prev) { const w2 = clone(w); const back = w2.rooms.find(r => r.id === w2.prev); w2.at = w2.prev; Store.act([opSet('wyprawa', w2)], { quiet: true }); lines.push('Drużyna cofa się do komnaty: **' + (back ? back.c : '?') + '**. Wrogowie zostają na miejscu.'); }
      st.heroes.forEach(id => { const t = touched[id]; if (t) { t.fx = {}; t.fatigue = 0; t.block = 0; t.form = 'human'; } });
      commit({ lines, stol: st, touched });
    } else actedCommit({ lines, stol: null, touched }, 'bad');
  },
  useItem: el => {
    { const g = heroTurn(H(UI.sel.id)); if (!g.ok && (!g.mine || g.lost)) return toast(g.mine ? g.why : 'Przedmioty z plecaka bierze się w swojej turze. ' + g.why); }
    const h = clone(H(UI.sel.id)); const k = el.dataset.k; const w = el.dataset.w;
    const sup = Store.S.wyprawa.sup || {}; const lines = [];
    if (Store.S.wyprawa.quest && !(sup[k] > 0)) return toast('W plecaku nie ma już: ' + k.toLowerCase() + '.');
    h.fx = Object.assign({}, h.fx);
    if (w === 'bleed') { h.fx.bleed = []; lines.push(heroLabel(h) + ' zakłada bandaż: krwawienie ustaje.'); }
    if (w === 'blight') { h.fx.blight = []; lines.push(heroLabel(h) + ' pije antidotum: zaraza ustępuje.'); }
    if (w === 'horror') { h.fx.horror = []; lines.push(heroLabel(h) + ' bierze laudanum: groza mija.'); }
    if (w === 'debuff') { h.fx.buffs = (h.fx.buffs || []).filter(b => !/−/.test(b[0])); lines.push(heroLabel(h) + ' żuje zioła: osłabienia znikają.'); }
    if (w === 'food') { heroHeal(h, 1, lines); lines.push(heroLabel(h) + ' je prowiant: +1 Zdrowia.'); }
    if (w === 'holy') { h.fx.buffs = (h.fx.buffs || []).concat([['Krzepa i Odporność +2', 3]]); lines.push(heroLabel(h) + ' pije wodę święconą: Krzepa i Odporność +2 na 3 tury.'); }
    const res = { lines, stol: null, touched: { [h.id]: h } };
    if (Store.S.wyprawa.quest) Store.act([opSet('wyprawa.sup.' + k, sup[k] - 1)], { quiet: true });
    commit(res);
  },
  adjH: el => {
    const h = clone(H(UI.sel.id)); const f = el.dataset.f; const v = +el.dataset.v; const lines = [];
    if (f === 'hp') { if (v < 0) heroDamage(h, -v, lines, 'rana'); else heroHeal(h, v, lines); lines.unshift(heroLabel(h) + ': Zdrowie ' + (v > 0 ? '+' : '') + v + ' → ' + h.hp + '.'); }
    else { heroStress(h, v, lines); lines.unshift(heroLabel(h) + ': Stres ' + (v > 0 ? '+' : '') + v + ' → ' + h.stress + '.'); }
    commit({ lines, stol: null, touched: { [h.id]: h } }, 'sys');
  },
  deathRoll: () => { const h = clone(H(UI.sel.id)); const lines = []; heroDamage(h, 1, lines, 'Rzut Śmierci'); commit({ lines, stol: null, touched: { [h.id]: h } }); },
  /* wrogowie */
  encounter: () => {
    const s = Store.S.stol; const r = rollEncounter(s.region || 'Ruiny', +s.dl || 0);
    setStol(st => { st.enemies = r.list.filter(Boolean); }, 'MG losuje spotkanie (' + (s.region === 'DD' ? 'Najmroczniejszy Loch' : s.region + ', ' + DL[+s.dl || 0]) + '): k10 = ' + r.r + ' → ' + r.list.filter(Boolean).map(e => e.name).join(', ') + '.');
  },
  bossSet: () => { const s = Store.S.stol; const list = bossSetup(s.region || 'Ruiny', +s.dl || 0, +(s.floor || 0)); setStol(st => { st.enemies = list; }, 'Boss: **' + list.find(e => e.boss).name + '**.', 'crit'); },
  shambler: () => { const list = bossSetup('Shambler', 0); setStol(st => { st.enemies = list; }, 'Z ciemności wychodzi **Shambler**. Wolno uciec, ale nagroda przepada.', 'bad'); },
  clearE: () => setStol(st => { st.enemies = []; dropInit(st, x => x.k === 'e'); }),
  addE: () => {
    const ref = $('#addE').value; const s = Store.S.stol;
    const e = buildFoe(ref, foeFlat(ref) ? 0 : +s.dl || 0); if (!e) return;
    const used = s.enemies.reduce((a, x) => a + (x.size || 1), 0);
    if (used + (e.size || 1) > 4) return toast('Szyk wrogów jest pełny.');
    setStol(st => { st.enemies.push(e); });
  },
  summon: el => {
    const s = Store.S.stol; const e = el.dataset.n === 'Macka' ? makeSummon('Macka') : makeSummon(el.dataset.n, +s.dl || 0);
    const used = s.enemies.reduce((a, x) => a + (x.size || 1), 0);
    if (used + (e.size || 1) > 4) return toast('Szyk jest pełny — przyzwanie nie ma miejsca.');
    setStol(st => { if (el.dataset.n === 'Kościany żołdak' || el.dataset.n === 'Ochłap') st.enemies.unshift(e); else st.enemies.push(e); }, 'Przyzwanie: **' + e.name + '**.');
  },
  adjE: el => setStol(st => { const e = st.enemies.find(x => x.id === UI.sel.id); if (!e) return; e.hp = Math.min(e.maxhp, e.hp + +el.dataset.v); if (e.hp <= 0) killEnemy(st, e, 'hit'); }),
  eMove: el => setStol(st => { const i = st.enemies.findIndex(x => x.id === UI.sel.id); moveInList(st.enemies, i, +el.dataset.d); }),
  eRemove: () => setStol(st => { st.enemies = st.enemies.filter(x => x.id !== UI.sel.id); dropInit(st, x => x.id === UI.sel.id); }),
  eSay: el => { const e = Store.S.stol.enemies.find(x => x.id === UI.sel.id); rollLog('**' + e.name + '**: ' + attackText(e.attacks[+el.dataset.i]).replace(/<\/?b>/g, ''), '', 'roll'); },
  bossMove: () => {
    const e = Store.S.stol.enemies.find(x => x.id === UI.sel.id); const r = d(6);
    const pat = (e.notes || []).find(n => /Wzór ruchów/.test(n)) || '';
    rollLog('**' + e.name + '** — druga tura: k6 = **' + r + '**. ' + pat.replace(/^Wzór ruchów:\s*/, 'Wzór: '), 'crit');
  },
  eAtk: el => {
    const e = Store.S.stol.enemies.find(x => x.id === UI.sel.id); const i = +el.dataset.i; const a = e.attacks[i]; const m = el.dataset.m;
    { const g = enemyTurn(e); if (!g.ok) return toast(g.why); }
    const order = Store.S.stol.heroes; const allowed = posList(a.w) || [1, 2, 3, 4];
    const inRange = order.map((id, k) => ({ id, pos: k + 1 })).filter(x => allowed.includes(x.pos) && H(x.id) && !H(x.id).dead && !((H(x.id).fx || {}).cauldron)).map(x => x.id);
    if (!inRange.length) return toast('Na pozycjach ' + a.w + ' nikogo nie ma.');
    if (m === 'all') return actedCommit(enemyAttack(e, i, inRange));
    if (m === 'pick') { UI.epend = { eid: e.id, idx: i, valid: inRange, label: 'uderza ' + a.name }; return renderView(); }
    const marked = inRange.filter(id => (H(id).fx || {}).mark);
    const pool = marked.length ? marked : inRange; const pt = pickD(pool); let t = pt.v;
    let note = pool.length > 1 ? 'Cel losowany spośród ' + pool.map(x => heroLabel(H(x))).join(', ') + ': ' + pt.t + ' → ' + heroLabel(H(t)) + '.' : marked.length ? 'Cel: ' + heroLabel(H(t)) + ' (Znak).' : '';
    const g = (H(t).fx || {}); if (g.guard && g.guardBy && order.includes(g.guardBy) && !H(g.guardBy).dead) { t = g.guardBy; note += ' Ochrona: atak przejmuje ' + heroLabel(H(t)) + '.'; }
    const res = enemyAttack(e, i, [t]); if (note && res) { res.lines.splice(1, 0, note); res.sum && res.sum.unshift(note); } actedCommit(res);
  },
  eAuto: () => {
    const e = Store.S.stol.enemies.find(x => x.id === UI.sel.id); if (!e) return;
    { const g = enemyTurn(e); if (!g.ok) return toast(g.why); }
    const res = enemyAuto(e, inTurns() ? curEntry() : null); if (!res) return toast('Ten wróg nie może teraz działać.');
    actedCommit(res);
  },
  eSpec: el => {
    const e = Store.S.stol.enemies.find(x => x.id === UI.sel.id); if (!e) return;
    { const g = enemyTurn(e); if (!g.ok) return toast(g.why); }
    const res = enemySpecial(e, el.dataset.n); if (!res) return toast(el.dataset.n + ': teraz bez skutku (brak miejsca albo nikt nie jest ranny).');
    actedCommit(res);
  },
  pickHeroT: el => {
    const P = UI.epend; UI.epend = null; const e = Store.S.stol.enemies.find(x => x.id === P.eid);
    let t = el.dataset.id; const g = (H(t).fx || {}); if (g.guard && g.guardBy && Store.S.stol.heroes.includes(g.guardBy)) t = g.guardBy;
    actedCommit(enemyAttack(e, P.idx, [t]));
  },
  /* przebieg walki */
  fightStart: () => {
    const s = Store.S.stol; const ti = torchInfo(s.torch); const lines = []; const w = Store.S.wyprawa;
    const sur = ti.surprise; let who = 'nikt';
    if (s.forceSurprise) { who = s.forceSurprise; lines.push('**Walka!** ' + (who === 'wrogowie' ? 'Zgaszone ognisko: **wrogowie zaskoczeni** — drużyna ma całą pierwszą rundę.' : '**Drużyna zaskoczona** — wrogowie mają całą pierwszą rundę, pozycje bohaterów losuje się od nowa, każdy +1 Stres.')); }
    else {
      const r = d(10);
      const m = { 'Jasno': [r <= 3, r === 10], 'Półmrok': [r <= 2, r >= 9], 'Cienie': [r === 1, r >= 8], 'Mrok': [false, r >= 7], 'Ciemność': [false, r >= 6] }[ti.name];
      if (m[0]) who = 'wrogowie'; if (m[1]) who = 'drużyna';
      let note = '';
      if (who === 'drużyna' && w.quest && w.noSurprise) { who = 'nikt'; note = ' Plan marszu: drużyna nie daje się zaskoczyć.'; }
      lines.push('**Walka!** Zaskoczenie (' + ti.name + ', ' + sur + '): k10 = **' + r + '** → ' + (who === 'nikt' ? 'nikt nie jest zaskoczony.' : who === 'wrogowie' ? '**wrogowie zaskoczeni** — drużyna ma całą pierwszą rundę.' : '**drużyna zaskoczona** — wrogowie mają całą pierwszą rundę, pozycje bohaterów losuje się od nowa, każdy +1 Stres.') + note);
    }
    if (w.quest && w.noSurprise) Store.act([opSet('wyprawa.noSurprise', false)], { quiet: true });
    const st = clone(s); st.fight = true; st.round = 0; st.init = []; st.turn = -1; st.transformed = []; st.looted = false; st.acted = null; st.atk = null; st.fallen = []; st.forceSurprise = null; st.eliteKills = 0; st.bossFight = s.enemies.some(e => e.boss); st.bossName = (s.enemies.find(e => e.boss) || {}).name || null; st.cauldron = null; st.witchDmg = null; st.heartTaken = false; st.notes = [];
    const touched = {};
    const hasUndead = s.enemies.some(e => /Nieumar/.test(e.type || ''));
    s.enemies.filter(e => e.elite && !e.corpse).forEach(e => lines.push('**Mini-boss: ' + e.name + '**' + (e.eliteRoll ? ' (spotkanie z mini-bossem, ' + e.eliteRoll + ')' : '') + ' — zajmuje 2 pola. ' + (((findEnemyDef(e.name) || {}).e || {}).trait || '')));
    st.heroes.forEach(id => {
      const h = touched[id] = clone(H(id)); const hs = heroStats(h); let add = 0; const why = [];
      if (who === 'drużyna') { add++; why.push('zaskoczenie'); }
      if (s.torch === 0) { add++; why.push('Ciemność'); }
      if (hs.fightStress) { add += hs.fightStress; why.push('Kieł spoza gwiazd'); }
      if (h.qn.some(q => qname(q.t) === 'Klaustrofobia') && /Ruiny|Nory/.test(s.region)) { add++; why.push('Klaustrofobia'); }
      if (h.qn.some(q => qname(q.t) === 'Lęk przed nieumarłymi') && hasUndead) { add++; why.push('Lęk przed nieumarłymi'); }
      if (add) { lines.push(heroLabel(h) + ' +' + add + ' Stresu (' + why.join(', ') + ').'); heroStress(h, add, lines); }
      /* przygotowania z obozu na tę walkę */
      const nf = h.nextFight || {};
      if ((nf.buffs || []).length || nf.noFirst || nf.block || nf.noTransformStress) {
        h.fx = Object.assign({}, h.fx);
        if ((nf.buffs || []).length) { h.fx.buffs = (h.fx.buffs || []).concat(nf.buffs.map(b => [b[0], b[1] || 99])); lines.push(heroLabel(h) + ' z obozu: ' + nf.buffs.map(b => b[0] + (b[1] === 1 ? ' (pierwsza runda)' : '')).join(', ') + '.'); }
        if (nf.noFirst) h.fx.noFirst = 1;
        if (nf.block) { h.block = (h.block || 0) + nf.block; lines.push(heroLabel(h) + ' zaczyna z żetonem Bloku.'); }
        if (nf.noTransformStress) h.fx.noTransformStress = 1;
      }
      h.nextFight = null;
    });
    if (who === 'drużyna') { for (let i = st.heroes.length - 1; i > 0; i--) { const j = d(i + 1) - 1; [st.heroes[i], st.heroes[j]] = [st.heroes[j], st.heroes[i]]; } }
    st.surprise = who;
    commit({ lines, stol: st, touched }, who === 'drużyna' ? 'bad' : '');
    setTimeout(() => ACT.newRound(), 50);
  },
  newRound: () => {
    { /* przeciąganie walki: został jeden wróg i w zeszłej rundzie nikt go nie zaatakował */
      const s0 = Store.S.stol; const living = s0.enemies.filter(e => !e.corpse);
      if ((s0.round || 0) >= 1 && living.length === 1 && !(s0.atk && s0.atk.r === s0.round && s0.atk.ids.includes(living[0].id))) {
        const lines = ['**Przeciąganie walki:** został tylko ' + living[0].name + ', a w rundzie ' + s0.round + ' nikt go nie zaatakował — każdy bohater +1 Stres.']; const touched = {};
        s0.heroes.forEach(id => { const h = H(id); if (h && !h.dead) { const t = touched[id] = clone(h); heroStress(t, 1, lines); } });
        commit({ lines, stol: null, touched }, 'bad');
      }
    }
    const s = clone(Store.S.stol); s.round = (s.round || 0) + 1; const init = [];
    const sur = s.round === 1 ? s.surprise : null;
    s.heroes.forEach(id => { const h = H(id); if (!h || h.dead) return; const r = d(10); init.push({ k: 'h', id, roll: r, tot: r + heroStats(h).speed, late: sur === 'drużyna' }); });
    s.enemies.forEach(e => { if (e.corpse) return; const turns = e.boss ? 2 : 1; for (let t = 0; t < turns; t++) { const r = d(10); init.push({ k: 'e', id: e.id, roll: r, tot: r + e.speed + (fxMods(e.fx).speed || 0), second: t === 1, late: sur === 'wrogowie' }); } });
    init.sort((a, b) => (a.late - b.late) || (b.tot - a.tot) || (a.k === 'h' ? -1 : 1));
    s.init = init; s.turn = 0;
    const nm = x => x.k === 'h' ? heroLabel(H(x.id)) : (s.enemies.find(e => e.id === x.id) || {}).name;
    const tl = []; bossTelegraph(s, tl);
    const txt = '**Runda ' + s.round + '.** Inicjatywa (k10 + Szybkość): ' + init.map(x => nm(x) + ' ' + x.tot).join(', ') + (sur && sur !== 'nikt' ? ' — zaskoczeni działają na końcu.' : '.') + (tl.length ? ' ' + tl.join(' ') : '');
    Store.act([opSet('stol', s), { log: { id: uid(), t: Date.now(), by: byName(), uid: Store.me.id, kind: 'roll', text: txt } }]);
    const first = init[0]; if (first) { const res = startTurn(first); if (res && !res.quiet) commit(res); runFollow(res); autoSkip(res); }
  },
  nextTurn: () => {
    const s = Store.S.stol;
    if (s.turn + 1 >= s.init.length) return ACT.newRound();
    setStol(st => { st.turn++; });
    const e = Store.S.stol.init[Store.S.stol.turn];
    const res = startTurn(e); if (res && !res.quiet) commit(res); runFollow(res); autoSkip(res);
  },
  fightEnd: () => {
    { const s0 = Store.S.stol; if (s0.fight && (s0.round || 0) >= 1 && !s0.enemies.some(e => !e.corpse) && !s0.looted) ACT.lootFight(); }
    const s = clone(Store.S.stol); const touched = {}; const lines = ['**Koniec walki.** Efekty wygasają.'];
    s.heroes.forEach(id => {
      const h = touched[id] = clone(H(id)); h.fx = {}; h.fatigue = 0; h.block = 0; h.form = 'human';
      if (h.exhausted) { h.exh = (h.exh || 1) - 1; if (h.exh <= 0) { h.exhausted = false; h.exh = 0; } }
    });
    const won = s.fight && (s.round || 0) >= 1 && !s.enemies.some(e => !e.corpse);
    const ops = [];
    if ((s.fallen || []).length) {
      if (won) { ops.push(opSet('osada.trinkets', (Store.S.osada.trinkets || []).concat(s.fallen))); lines.push('Wygrana: błyskotki poległych wracają do magazynu (' + s.fallen.map(t => t.name).join(', ') + ').'); }
      else lines.push('Błyskotki poległych przepadają: ' + s.fallen.map(t => t.name).join(', ') + '.');
    }
    if (won && s.bossName && s.bossName !== 'Shambler') s.heroes.forEach(id => { const t = touched[id]; if (t && !t.dead) { t.tally = Object.assign({ quests: 0, bosses: 0, ddSurvived: 0 }, t.tally); t.tally.bosses++; } });
    s.heroes.forEach(id => { const t = touched[id]; if (t) dreamCheck(t, lines, 'fight'); });
    if (s.siege) {
      const o = clone(Store.S.osada); o.siege = false;
      if (won) { o.threat = 5; lines.push('**Oblężenie odparte.** Ciemność cofa się do lochów (5/10).'); }
      else { const bl = Object.keys(o.b).filter(k => o.b[k] > 0); if (bl.length) { const pb = pickD(bl); o.b[pb.v]--; lines.push('**Oblężenie przegrane.** ' + pb.v + ' traci stopień (' + pb.t + ').'); } else lines.push('**Oblężenie przegrane.** Osada płonie, ale nie ma już czego burzyć.'); o.threat = 7; }
      ops.push(opSet('osada', Object.assign(o, { trinkets: ((ops.find(x => x.p === 'osada.trinkets') || {}).v) || o.trinkets }))); s.siege = false;
    }
    if (won && s.bossName === 'Shambler') { const kiel = ALL_TRINKETS().find(t => t.kind === 'kiel'); if (kiel) { ops.push(opSet('osada.trinkets', ((ops.find(o => o.p === 'osada.trinkets') || {}).v || Store.S.osada.trinkets || []).concat([kiel]))); lines.push('**Shambler pokonany.** Nagroda: **Kieł spoza gwiazd** trafia do magazynu błyskotek.'); } }
    const w = Store.S.wyprawa;
    if (won && w.quest && s.roomId) {
      const w2 = clone(w); const r = w2.rooms.find(x => x.id === s.roomId);
      if (r && !r.cleared) { r.cleared = true; lines.push('Komnata oczyszczona' + (r.c === 'boss' ? ' — **boss pokonany**' : '') + '.'); const g = goalProgress(w2); if (g.ok) lines.push('**Cel zadania wykonany** (' + g.txt + ').'); }
      ops.push(opSet('wyprawa', w2));
    }
    s.fight = false; s.init = []; s.turn = -1; s.round = 0; s.last = null; s.enemies = s.enemies.filter(e => !e.corpse); s.fallen = []; s.roomId = null; s.forceSurprise = null; s.lootBonus = 0; s.eliteKills = 0; s.acted = null; s.cauldron = null; s.witchDmg = null; s.bossName = null; s.bossFight = false;
    if (ops.length) Store.act(ops, { quiet: true });
    commit({ lines, stol: s, touched }, 'sys');
    if (Store.S.wyprawa.quest && won && !s.siege) { UI.wsub = 'loch'; setTimeout(() => { if (location.hash === '#stol' && !Store.S.stol.fight) location.hash = '#wyprawa'; }, 1800); }
  },
  lootFight: () => {
    const s = Store.S.stol; if (s.looted) return toast('Łup za tę walkę został już wylosowany.');
    if (s.enemies.some(e => !e.corpse)) return toast('Najpierw pokonajcie wszystkich wrogów.');
    const boss = s.bossFight || s.enemies.some(e => e.boss);
    const ti = torchInfo(s.torch); const extra = { 'Jasno': -1, 'Półmrok': 0, 'Cienie': 1, 'Mrok': 1, 'Ciemność': 2 }[ti.name];
    const bonus = (s.lootBonus || 0) + 2 * (s.eliteKills || 0);
    Store.act([opSet('stol.looted', true)], { quiet: true });
    const raw = (boss ? 4 : 1) + extra + bonus; const n = Math.max(1, raw);
    rollLoot(n, 'wygrana walka' + (boss ? ', boss' : '') + ', Pochodnia ' + ti.name + (s.lootBonus ? ', +' + s.lootBonus + ' za zgaszone ognisko' : '') + (s.eliteKills ? ', +' + 2 * s.eliteKills + ' za mini-bossa' : '') + (raw < 1 ? ', w jasnym świetle gorszy z dwóch k10' : ''), raw < 1);
  }
});
const MEM_TYPES = ['Popiersie', 'Portret', 'Akt', 'Herb'];
const SUP_KEYS = ['Prowiant', 'Pochodnie', 'Łopaty', 'Bandaże', 'Antidota', 'Laudanum', 'Zioła', 'Woda święcona', 'Klucze'];
const lootMult = () => [1, 1.5, 2][+(Store.S.wyprawa.quest ? Store.S.wyprawa.quest.dl : Store.S.stol.dl) || 0];
/* łup trafia do plecaka wyprawy (albo prosto do skarbca, gdy nie ma wyprawy) i jest pokazywany wszystkim jako karta */
function rollLoot(n, why, worse) {
  if (Store.S.wyprawa.quest && Store.S.wyprawa.rumor) { n += 1; why += ', +1 za plotkę z Osady'; Store.act([opSet('wyprawa.rumor', false)], { quiet: true }); }
  const items = []; let gold = 0, gems = 0; const mem = {}; const sup = {}; const mult = lootMult();
  for (let i = 0; i < n; i++) {
    let r = rollTable('lup'); let pre = '';
    if (worse) { const r2 = rollTable('lup'); pre = 'k10 = **' + r.r + '** i k10 = **' + r2.r + '**, gorszy: '; if (r2.r < r.r) r = r2; }
    if (r.r <= 4) { const g = d(6); gold += g; items.push(pre + 'k10 = **' + r.r + '** → ' + g + ' Złota (k6 = **' + g + '**)'); }
    else if (r.r <= 6) { const pm = pickD(MEM_TYPES); mem[pm.v] = (mem[pm.v] || 0) + 1; items.push(pre + 'k10 = **' + r.r + '** → pamiątka: ' + pm.v + ' (k4 = **' + pm.r + '**)'); }
    else if (r.r === 7) { const a = pickD(SUP_KEYS), b2 = pickD(SUP_KEYS); [a, b2].forEach(x => { sup[x.v] = (sup[x.v] || 0) + (x.v === 'Prowiant' ? 2 : 1); }); items.push(pre + 'k10 = **' + r.r + '** → zapasy: ' + a.v.toLowerCase() + ' (k9 = **' + a.r + '**) i ' + b2.v.toLowerCase() + ' (k9 = **' + b2.r + '**)'); }
    else { gems++; items.push(pre + 'k10 = **' + r.r + '** → klejnot (10 Złota)'); }
  }
  giveLoot({ gold: Math.ceil(gold * mult), gems, mem, sup, trinkets: [] }, why, items, n);
}
function lootTotals(x, mult) {
  const parts = [];
  if (x.gold) parts.push(x.gold + ' Złota' + (mult > 1 ? ' (×' + String(mult).replace('.', ',') + ')' : ''));
  if (x.gems) parts.push(x.gems + ' × klejnot (' + Math.ceil(x.gems * 10 * mult) + ' Złota)');
  Object.entries(x.mem || {}).forEach(([k, v]) => parts.push(k + (v > 1 ? ' ×' + v : '')));
  Object.entries(x.sup || {}).forEach(([k, v]) => parts.push(k.toLowerCase() + ' +' + v));
  (x.trinkets || []).forEach(t => parts.push('błyskotka: ' + t.name));
  return parts;
}
function addLootTo(L, x) {
  L.zloto = (L.zloto || 0) + (x.gold || 0); L.klejnoty = (L.klejnoty || 0) + (x.gems || 0);
  L.mem = Object.assign({}, L.mem); Object.entries(x.mem || {}).forEach(([k, v]) => { L.mem[k] = (L.mem[k] || 0) + v; });
  L.pamiatki = Object.values(L.mem).reduce((a, b) => a + b, 0);
  L.trinkets = (L.trinkets || []).concat(x.trinkets || []);
  return L;
}
function giveLoot(x, why, items, n) {
  const mult = lootMult(); const q = Store.S.wyprawa.quest; const ops = [];
  const tot = lootTotals(x, mult);
  if (q) {
    ops.push(opSet('wyprawa.loot', addLootTo(clone(Store.S.wyprawa.loot || {}), x)));
    Object.entries(x.sup || {}).forEach(([k, v]) => ops.push(opSet('wyprawa.sup.' + k, ((Store.S.wyprawa.sup || {})[k] || 0) + v)));
  } else {
    const o = clone(Store.S.osada); o.gold += (x.gold || 0) + Math.ceil((x.gems || 0) * 10 * mult);
    Object.entries(x.mem || {}).forEach(([k, v]) => { o.mem[k] = (o.mem[k] || 0) + v; });
    o.trinkets = (o.trinkets || []).concat(x.trinkets || []);
    ops.push(opSet('osada', o));
  }
  const card = { id: uid(), t: Date.now(), why, items, tot, dest: q ? 'plecak wyprawy' : 'skarbiec Osady' };
  ops.push(opSet('stol.lastLoot', card));
  ops.push({ log: { id: uid(), t: Date.now(), by: byName(), uid: Store.me.id, kind: 'roll', cls: 'good', text: '**Łupy** (' + why + (n != null ? ', rzutów: ' + n : '') + '): ' + (items.join('; ') || 'nic') + '. ' + (tot.length ? 'Zdobyto: **' + tot.join(', ') + '** → ' + card.dest + '.' : 'Nic cennego.') } });
  Store.act(ops);
}
function lootCardHtml() {
  const c = Store.S.stol.lastLoot; if (!c || UI.lootSeen === c.id || Date.now() - c.t > 30 * 60000) return '';
  return `<div class="lootcard"><div class="lc-h"><span class="lbl">${/^Powrót/.test(c.why) ? 'Powrót do Osady' : 'Zdobyte łupy'}</span> <b>${esc(c.why)}</b><button class="btn sm ghost" data-act="lootSeen">Zamknij</button></div>
    ${c.tot.length ? `<div class="lc-tot">${c.tot.map(t => `<span class="chip gold">${esc(t)}</span>`).join('')}</div>` : '<p class="muted">Nic cennego.</p>'}
    ${(c.items || []).length ? `<ul class="lc-items">${c.items.map(x => `<li>${diceBadges(md(x))}</li>`).join('')}</ul>` : ''}
    <p class="small muted">Trafia do: ${esc(c.dest)}.</p></div>`;
}
function lootStrip(hideEmpty) {
  const w = Store.S.wyprawa; if (!w.quest) return '';
  const L = w.loot || {}; const mult = DL_INFO[w.quest.dl].mult;
  const parts = lootTotals({ gold: L.zloto, gems: L.klejnoty, mem: L.mem, trinkets: L.trinkets }, 1).map(p => p.replace(/ \(×.*?\)/, ''));
  if (hideEmpty && !parts.length) return '';
  return `<div class="lootstrip"><span class="lbl">Łupy wyprawy</span> ${parts.length ? parts.map(p => `<span class="chip">${esc(p)}</span>`).join('') : '<span class="muted small">jeszcze nic</span>'}${L.klejnoty ? `<span class="muted small">klejnoty liczone ×${String(mult).replace('.', ',')} przy powrocie</span>` : ''}</div>`;
}
