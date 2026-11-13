/* Płynna walka, „Co teraz?”, Przodek, kwestie i więzi bohaterów, wybory w komnatach, rozmowy przy ognisku,
   decyzje Osady, marzenia bohaterów, zegar Ciemności i głosowanie drużyny. */

/* ======================= płynna walka ======================= */
/* Ruchy automatyczne wykonuje tylko klient MG, żeby w grze sieciowej nikt nie działał podwójnie. */
let _autoKey = null;
const autoOn = () => Store.S.stol.autoFight !== false;
function autoDriver() {
  if (!Store.ready || !Store.isGM() || !autoOn()) return;
  const s = Store.S.stol; if (!s.fight || !(s.init || []).length) return;
  if (!s.enemies.some(e => !e.corpse)) return;
  const ce = curEntry(); if (!ce) return;
  const key = turnKey();
  if (s.acted === key) {
    const k2 = key + ':next'; if (_autoKey === k2) return; _autoKey = k2;
    setTimeout(() => { const s2 = Store.S.stol; if (s2.fight && turnKey() === key && s2.acted === key) ACT.nextTurn(); }, 1300);
    return;
  }
  if (ce.k === 'e') {
    const e = s.enemies.find(x => x.id === ce.id); if (!e || e.corpse) return;
    if (e.fx && e.fx.lostTurn === (s.round || 0)) return; /* ogłuszony — przejdzie sam */
    const k2 = key + ':enemy'; if (_autoKey === k2) return; _autoKey = k2;
    setTimeout(() => {
      const s2 = Store.S.stol; if (!s2.fight || turnKey() !== key || s2.acted === key || !autoOn()) return;
      const e2 = s2.enemies.find(x => x.id === ce.id); if (!e2 || e2.corpse) return;
      const res = enemyAuto(e2, curEntry()); if (res) actedCommit(res); else ACT.nextTurn();
    }, 1400);
  }
}

/* ======================= „Co teraz?” ======================= */
function nextStep() {
  const S = Store.S; const o = S.osada; const w = S.wyprawa; const st = S.stol; const live = liveHeroes();
  const first = !(o.questsDone || 0);
  const P = t => first ? ' <span class="prz">Przodek: ' + t + '</span>' : '';
  if (live.length < 4 && !w.quest) return { tab: 'bohaterowie', sel: '[data-act=pickClass]', txt: 'Zbierzcie drużynę: w zakładce <b>Bohaterowie</b> przyjmijcie ' + (4 - live.length === 1 ? '1 bohatera' : (4 - live.length) + ' bohaterów') + ' (każdy gracz wybiera klasę).', prz: P('Najmij ludzi, których nie będziesz opłakiwał.') };
  if (!o.started && o.week <= 1) return { tab: 'osada', sel: '[data-act=newWeek]', txt: 'Zacznijcie tydzień: <b>Osada → Nowy tydzień</b>. Przyjedzie dyliżans, a MG wylosuje zadania.', prz: P('Każdy tydzień zaczyna się tak samo: od rachunku strat.') };
  if (st.fight) {
    const living = st.enemies.filter(e => !e.corpse);
    if (!living.length) return { tab: 'stol', sel: '.won [data-act=fightEnd]', txt: 'Wrogowie pokonani — <b>Zakończ walkę</b> (łup rzuci się sam, jeśli zapomnicie).' };
    const ce = curEntry();
    if (ce && ce.k === 'h') { const h = H(ce.id); const g = heroTurn(h); return { tab: 'stol', sel: '.slot.hero[data-id="' + ce.id + '"]', txt: g.lost ? esc(g.why) + ' Tura przejdzie sama.' : st.acted === turnKey() ? heroLabel(h) + ' już działał' + (autoOn() ? ' — tura przejdzie sama.' : ' — kliknijcie <b>Następna tura</b>.') : 'Tura: <b>' + esc(heroLabel(h)) + '</b> (' + esc(ownerName(h)) + '). Kliknij bohatera, potem umiejętność i cel. Złote kropki: skąd, czerwone: kogo trafia.', prz: P('Ostrożnie dobieraj cele. Martwy wróg nie oddaje ciosu.') }; }
    if (ce && ce.k === 'e') { const e = st.enemies.find(x => x.id === ce.id); return { tab: 'stol', txt: 'Tura wroga: <b>' + esc(e ? e.name : '?') + '</b>. ' + (autoOn() ? 'Wróg działa sam według zasad.' : 'MG klika wroga i „Tura wroga — według zasad”.') }; }
    return { tab: 'stol', txt: 'Walka trwa — <b>Następna tura</b>.' };
  }
  if (st.enemies.some(e => !e.corpse)) return { tab: 'stol', sel: '[data-act=fightStart]', txt: 'Na stole stoją wrogowie: <b>Stół → Rozpocznij walkę</b>. Najpierw ustawcie szyk.', prz: P('Pozycja znaczy więcej niż siła. Kto stoi z przodu, ten krwawi pierwszy.') };
  if (!w.quest && UI.wsub === 'prep' && typeof prepQuest === 'function' && prepQuest()) return { tab: 'wyprawa', sel: '[data-act=depart]', txt: 'Skompletujcie drużynę (do czterech, 1 = przód) i sami spakujcie plecak, potem <b>Wyrusz</b>.', prz: P('Wybieraj tych, których stać na jeszcze jedno zejście.') };
  if (w.quest) {
    if (w.pending) return { tab: 'wyprawa', sel: '.eventbox', txt: 'Zdecydujcie: <b>' + esc(pendingTitle(w.pending)) + '</b> (na mapie wyprawy).' };
    if (w.camp) return { tab: 'wyprawa', sel: '.campp', txt: 'Obóz: rozdajcie <b>Punkty Odpoczynku</b> (zostało ' + w.camp.pts + '), potem <b>Noc</b>.', prz: P('Ogień trzyma ciemność na dystans. Na krótko.') };
    const r = w.rooms.find(x => x.id === w.at);
    if (r && /walka|boss/.test(r.c) && !r.cleared) return { tab: 'wyprawa', sel: '[data-act=roomFight]', txt: r.c === 'boss' ? 'Komnata bossa. <b>Boss!</b> — a potem Stół.' : 'W komnacie czekają wrogowie: <b>Do walki</b>.' };
    if (r && ((r.curio && !r.curioDone) || (r.ccurio && !r.ccurioDone))) return { tab: 'wyprawa', sel: '.curiobox', txt: 'Osobliwość: dotknijcie jej, użyjcie przedmiotu albo ominiecie.', prz: P('Ciekawość zabiła więcej moich ludzi niż miecze.') };
    if (r && r.feature && !r.featureDone) return { tab: 'wyprawa', sel: '.featbox', txt: 'W komnacie jest coś do zrobienia: <b>' + esc((ROOM_FEATURES.find(f => f.key === r.feature) || {}).name || '') + '</b>.' };
    if (r && r.c === 'skrzynia' && !r.opened) return { tab: 'wyprawa', sel: '[data-act=chest]', txt: 'Skrzynia: <b>Otwórz</b>.' };
    if (r && r.item && !r.itemTaken) return { tab: 'wyprawa', sel: '[data-act=takeItem]', txt: 'Leży tu przedmiot zadania: <b>Zabierz</b>.' };
    const g = goalProgress(w); if (g.ok) return { tab: 'wyprawa', sel: '[data-act=endQuest][data-v=done]', txt: 'Cel wykonany (' + esc(g.txt) + '). Możecie wracać: <b>Zadanie wykonane</b> — albo szukać łupów dalej.', prz: P('Wiedz, kiedy odejść. Chciwość to też pułapka.') };
    return { tab: 'wyprawa', sel: '.scoutbar .scoutbtn, .room.reach', txt: 'Wybierzcie sąsiednią komnatę na mapie. <b>Zwiad</b> przed wejściem zdradza, co czeka. Cel: ' + esc(g.txt) + '.', prz: P('Każdy korytarz kosztuje światło. Światło to życie.') };
  }
  const ready = live.filter(h => canLevel(h) && h.status !== 'wyprawa');
  if (!w.quest && ready.length) return { tab: 'bohaterowie', hero: ready[0].id, sel: '[data-act=levelUp]', txt: 'Awans! ' + ready.map(h => '<b>' + esc(heroLabel(h)) + '</b>').join(', ') + ' ' + (ready.length > 1 ? 'mają' : 'ma') + ' dość doświadczenia — gracz klika „Awansuj” na karcie bohatera.', prz: P('Każdy Poziom to jedno zejście więcej, które przeżyli.') };
  const sick = live.filter(h => h.stress >= 8 && h.status === 'osada');
  if (o.decision) return { tab: 'osada', sel: '.hamdec', txt: 'W Osadzie czeka decyzja: <b>' + esc((HAMLET_DECISIONS.find(x => x.key === o.decision.key) || {}).title || '') + '</b>.' };
  if (!(o.board || []).length) return { tab: 'osada', sel: '[data-act=newWeek]', txt: 'Tablica zadań jest pusta: <b>Osada → Nowy tydzień</b> (albo MG losuje tablicę).' };
  return { tab: 'wyprawa', sel: '.estate .hasq', txt: 'Wybierzcie zadanie: na <b>mapie posiadłości</b> świecą miejsca z zadaniem — kliknijcie jedno, złóżcie drużynę i <b>Wyrusz</b>.', prz: P('Ród czeka na wieści. Ciemność też.') };
}
function renderGuide() {
  const el = $('#guide'); if (!el) return;
  if (!Store.ready || UI.guideOff) { el.innerHTML = UI.guideOff ? `<button class="btn sm ghost" data-act="guideToggle">Pokaż „Co teraz?”</button>` : ''; return; }
  const n = nextStep();
  el.innerHTML = `<div class="guidebar ${UI.guideMore ? 'more' : ''}"><span class="lbl">Co teraz?</span> <span class="gtxt" data-act="guideMore" title="Dotknij, by rozwinąć albo zwinąć">${n.txt}${n.prz || ''}</span>
    <span class="sp"></span>${n.tab ? `<button class="btn sm gold" data-act="guideGo">Pokaż</button>` : ''}<button class="btn sm ghost" data-act="guideToggle" title="Ukryj podpowiedzi">×</button></div>`;
  UI._guide = n;
}
Object.assign(ACT, {
  guideMore: () => { UI.guideMore = !UI.guideMore; renderGuide(); },
  guideToggle: () => { UI.guideOff = !UI.guideOff; LS.set('pio:guideOff', UI.guideOff); renderGuide(); },
  guideGo: () => {
    const n = UI._guide; if (!n) return;
    if (n.tab === 'wyprawa' && Store.S.wyprawa.quest) UI.wsub = 'loch';
    if (n.hero) UI.heroSel = n.hero;
    if (n.tab === 'osada') UI.hbSel = /newWeek/.test(n.sel || '') ? 'Ratusz' : /hamdec/.test(n.sel || '') ? UI.hbSel : UI.hbSel;
    if (n.tab === 'wyprawa' && !Store.S.wyprawa.quest && /hasq/.test(n.sel || '')) UI.wsub = 'mapa';
    if (n.tab && UI.view !== n.tab) location.hash = '#' + n.tab;
    setTimeout(() => { const t = n.sel && $(n.sel); if (t) { t.scrollIntoView({ behavior: 'smooth', block: 'center' }); t.classList.add('pulse'); setTimeout(() => t.classList.remove('pulse'), 2400); } }, 120);
  },
  autoToggle: () => setStol(st => { st.autoFight = !(st.autoFight !== false); }, 'Walka ' + (autoOn() ? 'ręczna: MG prowadzi wrogów i przełącza tury.' : 'płynna: tury przechodzą same, wrogowie działają według zasad.'))
});

/* ======================= Przodek komentuje sam ======================= */
let _przT = 0;
const przAuto = () => Store.S.osada.przAuto !== false;
function ancestorSay(kind, extra) {
  if (!przAuto() || !Store.isGM()) return;
  const now = Date.now(); if (now - _przT < 15000 && kind !== 'smierc') return; _przT = now;
  const pool = { krytyk: ['Jeden cios — i porządek rzeczy przywrócony.', 'Tak się kończy każda pycha.', 'Ostrze nie pyta o imię.'], krytykw: ['Ciało pamięta każdą ranę. Dusza — jeszcze dłużej.', 'Ból jest nauczycielem. Okrutnym i dokładnym.'], prog: ['Stoi na krawędzi. Krawędź jest cierpliwa.', 'Jeszcze oddycha. Na razie.'], smierc: ['Kolejne imię na cmentarzu. Ziemia nie narzeka.', 'Odszedł tak, jak żył: w ciemności.'], przypadlosc: ['Umysł pękł cicho, jak lód pod butem.', 'Strach znalazł szczelinę. Zawsze znajduje.'], cnota: ['W tym jednym człowieku ciemność trafiła na mur.', 'Są jeszcze tacy, których nie da się złamać.'], ciemnosc: ['Teraz widzą to, co zawsze tu było.', 'Światło zgasło. Zaczyna się prawdziwa gra.'], powrot: ['Wrócili. Nie wszyscy w całości.', 'Osada przyjmuje ich z powrotem — i liczy braki.'], boss: ['To, co tu mieszka, czekało dłużej, niż wy żyjecie.', 'Oto serce tego miejsca. Uderzcie, póki bije.'] }[kind];
  if (!pool) return;
  const text = pick(pool);
  Store.log({ kind: 'przodek', text });
  try { if (Store.S.osada.przVoice) speak(text); } catch (e) { }
}
/* przegląd wyniku akcji: najważniejsze wydarzenie dostaje jedno zdanie Przodka */
function ancestorScan(text) {
  if (!text) return;
  if (/nie żyje/.test(text)) return ancestorSay('smierc');
  if (/Progu Śmierci/.test(text) && /staje na/.test(text)) return ancestorSay('prog');
  if (/→ Przypadłość/.test(text)) return ancestorSay('przypadlosc');
  if (/→ Cnota/.test(text)) return ancestorSay('cnota');
  if (/używa:.*KRYTYK/.test(text)) return ancestorSay('krytyk');
  if (/KRYTYK/.test(text) && !/używa:/.test(text)) return ancestorSay('krytykw');
}

/* ======================= kwestie i więzi bohaterów ======================= */
function bark(h, kind, lines, sub) {
  let list = BARKS[kind]; if (sub && list && !Array.isArray(list)) list = list[sub]; if (!Array.isArray(list) || !list.length) return;
  lines.push('*„' + pick(list) + '”* — ' + heroLabel(h) + '.');
}
const bondOf = (h, id) => ((h.bonds || {})[id] || 0);
function bondAdd(a, b, n, lines) {
  if (!a || !b || a.id === b.id) return;
  const before = bondOf(a, b.id);
  a.bonds = Object.assign({}, a.bonds, { [b.id]: clamp(before + n, -3, 3) }); b.bonds = Object.assign({}, b.bonds, { [a.id]: clamp(bondOf(b, a.id) + n, -3, 3) });
  const after = a.bonds[b.id];
  if (before < 2 && after >= 2) lines.push('**' + heroLabel(a) + '** i **' + heroLabel(b) + '** zostają przyjaciółmi: leczenie między nimi +1, a śmierć jednego boli drugiego bardziej.');
  if (before > -2 && after <= -2) lines.push('**' + heroLabel(a) + '** i **' + heroLabel(b) + '** nie znoszą się: nie zamienią się miejscami, leczenie między nimi −1.');
}
const bondName = n => n >= 2 ? 'przyjaźń' : n <= -2 ? 'niechęć' : n > 0 ? 'sympatia' : n < 0 ? 'chłód' : '';

/* ======================= wybory w komnatach ======================= */
function featureBox(r) {
  const F = ROOM_FEATURES.find(f => f.key === r.feature); if (!F || r.featureDone) return '';
  const W = Store.canWrite(); const pt = party();
  return `<div class="featbox"><p><b>${esc(F.name)}.</b> ${esc(F.text)}</p>
    ${W ? `<div class="row"><label class="lbl" for="fwho">Kto</label><select id="fwho">${pt.map(h => `<option value="${h.id}">${esc(heroLabel(h))}</option>`).join('')}</select></div>
    ${voteRow('feat:' + r.id, F.opts, 'feature')}` : ''}</div>`;
}
function resolveFeature(optId) {
  const s = Store.S; const w = clone(s.wyprawa); const st = clone(s.stol); const r = w.rooms.find(x => x.id === w.at); const F = ROOM_FEATURES.find(f => f.key === r.feature); if (!F) return;
  const o = F.opts.find(x => x.id === optId); const lines = ['**' + F.name + '** — drużyna wybiera: **' + o.label + '**.']; const touched = {};
  const T = id => touched[id] || (touched[id] = clone(s.heroes[id])); const pt = party();
  const sel = $('#fwho'); const who = T(sel ? sel.value : pt[0].id);
  let fight = false, loot = 0;
  if (optId === 'szukaj') { const r1 = d(10); lines.push('k10 = **' + r1 + '** → ' + (r1 <= 4 ? 'coś cennego!' : r1 <= 8 ? 'tylko kamienie.' : '**hałas budzi wrogów!**')); if (r1 <= 4) loot = 1; if (r1 >= 9) fight = true; }
  if (optId === 'sluchaj') { st.torch = Math.max(0, st.torch - 1); const adj = w.edges.filter(e => e.a === w.at || e.b === w.at).map(e => w.rooms.find(x => x.id === (e.a === w.at ? e.b : e.a))); adj.forEach(x => { x.seen = true; }); lines.push('Pochodnia −1. Za drzwiami: ' + adj.map(x => x.c).join(', ') + '.'); }
  if (optId === 'ofiara') { if ((w.loot.zloto || 0) >= 5) { w.loot.zloto -= 5; lines.push('Zostawiacie 5 Złota z łupów.'); } else if ((w.sup.Prowiant || 0) > 0) { w.sup.Prowiant--; lines.push('Zostawiacie prowiant.'); } else { lines.push('Nie macie czego zostawić — przodkowie milczą.'); r.featureDone = true; Store.act([opSet('wyprawa', w)], { quiet: true }); return commit({ lines, stol: null, touched }); } pt.forEach(h => heroStress(T(h.id), -2, lines)); lines.push('Drużyna −2 Stres.'); }
  if (optId === 'zabierz') { const g = d(6); w.loot = addLootTo(w.loot || {}, { gold: Math.ceil(g * DL_INFO[w.quest.dl].mult) }); pt.forEach(h => heroStress(T(h.id), 1, lines)); lines.push('k6 = **' + g + '** Złota do plecaka. Każdy +1 Stres — ktoś na was patrzy.'); }
  if (optId === 'pij') { const r1 = d(10); lines.push('k10 = **' + r1 + '**.'); if (r1 <= 5) { pt.forEach(h => heroHeal(T(h.id), 2, lines)); lines.push('Woda jest czysta: każdy +2 Zdrowia.'); } else if (r1 >= 9) { const pv = pickD(pt); const t = T(pv.v.id); t.fx = Object.assign({}, t.fx); addFx(t.fx, 'blight', 1); lines.push('Woda była zatruta: ' + heroLabel(t) + ' (' + pv.t + ') — zaraza 1 w najbliższej walce.'); } else lines.push('Zwykła woda. Nic.'); }
  if (optId === 'czytaj') { const r1 = d(10); lines.push(heroLabel(who) + ' czyta: k10 = **' + r1 + '**.'); if (r1 <= 5) { w.scoutBonus = (w.scoutBonus || 0) + 2; lines.push('Mapa w notatkach: następny zwiad +2.'); } else { heroStress(who, 2, lines); lines.push('Ostatnie strony opisują, jak umierał autor. ' + heroLabel(who) + ' +2 Stresu.'); } }
  if (optId === 'spal') { st.torch = Math.min(10, st.torch + 1); lines.push('Pochodnia +1.'); }
  if (optId === 'patrz') { const r1 = d(10); lines.push(heroLabel(who) + ' patrzy: k10 = **' + r1 + '**.'); if (r1 <= 3) { heroStress(who, -3, lines); lines.push('Widzi siebie sprzed lat. −3 Stresu.'); } else if (r1 >= 8) { heroStress(who, 3, lines); lines.push('Odbicie się uśmiecha. +3 Stresu.'); } else lines.push('Tylko zmęczona twarz.'); }
  r.featureDone = true;
  if (fight) { const region = w.quest.dd != null ? 'DD' : REGIONS[w.quest.region].key; st.region = region; st.dl = w.quest.dl; st.enemies = rollEncounter(region, w.quest.dl).list.filter(Boolean); st.roomId = null; st.looted = false; lines.push('Wrogowie: ' + st.enemies.map(e => e.name).join(', ') + '. Przejdźcie na Stół.'); }
  Store.act([opSet('wyprawa', w)], { quiet: true });
  commit({ lines, stol: st, touched }, fight ? 'bad' : '');
  if (loot) rollLoot(loot, 'gruz');
  if (fight) goFight();
}

/* ======================= rozmowy przy ognisku ======================= */
function campTalkBox() {
  const w = Store.S.wyprawa; const c = w.camp; if (!c) return '';
  if (!c.talk) return Store.canWrite() && party().length >= 2 && !c.talked ? `<div class="row"><button class="btn sm" data-act="campTalk">Rozmowa przy ognisku</button><span class="small muted">raz na obóz, bez kosztu</span></div>` : '';
  const T = CAMP_TALKS.find(x => x.key === c.talk.key); const A = H(c.talk.a), B = H(c.talk.b); if (!T || !A || !B) return '';
  const f = t => t.replace(/\{A\}/g, heroLabel(A)).replace(/\{B\}/g, heroLabel(B));
  return `<div class="talkbox"><p><b>Przy ognisku:</b> ${esc(f(T.text))}</p>${voteRow('talk:' + c.talk.id, T.opts.map(o => Object.assign({}, o, { label: f(o.label), note: o.note ? f(o.note) : '' })), 'talk')}</div>`;
}
function resolveTalk(optId) {
  const s = Store.S; const w = clone(s.wyprawa); const c = w.camp; if (!c || !c.talk) return;
  const T = CAMP_TALKS.find(x => x.key === c.talk.key); const touched = {}; const G = id => touched[id] || (touched[id] = clone(s.heroes[id]));
  const A = G(c.talk.a), B = G(c.talk.b); const o = T.opts.find(x => x.id === optId);
  const lines = ['**Przy ognisku:** ' + T.text.replace(/\{A\}/g, heroLabel(A)).replace(/\{B\}/g, heroLabel(B)) + ' Wybór: **' + o.label.replace(/\{A\}/g, heroLabel(A)).replace(/\{B\}/g, heroLabel(B)) + '**.'];
  const nf = (h, b) => { h.nextFight = Object.assign({ buffs: [] }, h.nextFight); h.nextFight.buffs = h.nextFight.buffs.concat([[b, 99]]); };
  ({
    pogodz: () => { heroStress(A, -1, lines); heroStress(B, -1, lines); bondAdd(A, B, 1, lines); },
    niech: () => { heroStress(A, -2, lines); heroStress(B, 2, lines); bondAdd(A, B, -1, lines); },
    sluchaj: () => { heroStress(A, -2, lines); heroStress(B, -2, lines); bondAdd(A, B, 1, lines); },
    spac: () => { heroHeal(A, 1, lines); heroHeal(B, 1, lines); },
    kara: () => { heroStress(B, 2, lines); party().filter(h => h.id !== B.id).forEach(h => heroStress(G(h.id), -1, lines)); },
    odpusc: () => { heroStress(A, 1, lines); bondAdd(A, B, -1, lines); },
    opatrz: () => { heroHeal(B, 3, lines); bondAdd(A, B, 1, lines); },
    przemilcz: () => { B.hp = Math.max(1, B.hp - 1); },
    przyjmij: () => { nf(A, 'obrażenia +1'); nf(B, 'obrażenia +1'); bondAdd(A, B, 1, lines); },
    zabron: () => { heroStress(A, -1, lines); heroStress(B, -1, lines); }
  }[optId] || (() => { }))();
  c.talk = null; c.talked = true;
  Store.act([opSet('wyprawa', w)], { quiet: true });
  commit({ lines, stol: null, touched }, 'good');
}

/* ======================= decyzje w Osadzie ======================= */
function hamletDecisionBox() {
  const o = Store.S.osada; if (!o.decision) return '';
  const D = HAMLET_DECISIONS.find(x => x.key === o.decision.key); if (!D) return '';
  return `<div class="hamdec eventbox"><div class="ev-h"><span class="lbl">Decyzja tygodnia</span> <b>${esc(D.title)}</b></div><p>${esc(D.text)}</p>${Store.canWrite() ? voteRow('ham:' + o.decision.id, D.opts, 'hamlet') : '<p class="muted">Rada rodu decyduje…</p>'}</div>`;
}
function resolveHamlet(optId) {
  const s = Store.S; const o = clone(s.osada); const D = HAMLET_DECISIONS.find(x => x.key === o.decision.key); const op = D.opts.find(x => x.id === optId);
  const lines = ['**' + D.title + '** — rada rodu postanawia: **' + op.label + '**.']; const touched = {};
  const inTown = liveHeroes().filter(h => h.status !== 'wyprawa'); const T = id => touched[id] || (touched[id] = clone(s.heroes[id]));
  const pay = n => { if (o.gold < n) { lines.push('W skarbcu jest tylko ' + o.gold + ' Złota — nie stać was.'); return false; } o.gold -= n; return true; };
  if (optId === 'przyjmij') { o.abbeyDisc = o.week; if (inTown.length) { const r = d(10); lines.push('k10 = **' + r + '**' + (r <= 3 ? ' → kazania trafiają do serca…' : ' → nikt nie daje się porwać.')); if (r <= 3) { const pv = pickD(inTown); lines.push(gainQuirk(T(pv.v.id), 'qn', 'Fanatyk')); } } lines.push('Opactwo o 1 Złoto tańsze w tym tygodniu.'); }
  if (optId === 'wygon' || (optId === 'odmow' && D.key === 'wdowa')) { inTown.forEach(h => heroStress(T(h.id), 1, lines)); lines.push('Każdy bohater w Osadzie +1 Stres.'); }
  if (optId === 'pozycz') { o.gold += 20; o.debt = { amount: 30, week: o.week + 2 }; lines.push('+20 Złota. Lichwiarz wróci w tygodniu ' + o.debt.week + ' po 30.'); }
  if (optId === 'zaplac') { if (pay(6)) { const sick = inTown.filter(h => (h.diseases || []).length); if (sick.length) { const pv = pickD(sick); const t = T(pv.v.id); lines.push('Medyk leczy (' + pv.t + ') ' + heroLabel(t) + ': ' + t.diseases[0] + '.'); t.diseases = t.diseases.slice(1); } else lines.push('Nikt nie jest chory — medyk i tak bierze zapłatę.'); } }
  if (optId === 'straz') { if (pay(5)) lines.push('Straż czuwa. Nic nie ginie.'); }
  if (optId === 'ryzyko') { const r = d(10); lines.push('k10 = **' + r + '**.'); if (r <= 4) { if ((o.trinkets || []).length) { const pt = pickD(o.trinkets.map((t, i) => i)); lines.push('Znika błyskotka (' + pt.t + '): ' + o.trinkets[pt.v].name + '.'); o.trinkets = o.trinkets.filter((x, i) => i !== pt.v); } else { const g = d(6) * 2; o.gold = Math.max(0, o.gold - g); lines.push('Znika ' + g + ' Złota.'); } } else lines.push('Złodziej odchodzi z pustymi rękami.'); }
  if (optId === 'daj') { if (pay(10)) { inTown.forEach(h => heroStress(T(h.id), -2, lines)); lines.push('Każdy bohater w Osadzie −2 Stres.'); } }
  if (optId === 'zapros') { if (pay(3)) { inTown.forEach(h => heroStress(T(h.id), -1, lines)); lines.push('Każdy bohater w Osadzie −1 Stres.'); } }
  o.decision = null;
  Store.act([opSet('osada', o)], { quiet: true });
  commit({ lines, stol: null, touched }, 'sys');
}

/* ======================= marzenia bohaterów ======================= */
function dreamCheck(h, lines, ev) {
  if (!h.story || h.story.done || h.dead) return;
  const t = h.tally || {}; const k = h.story.dream;
  const ok = (k === 'boss' && t.bosses > 0) || (k === 'lvl3' && h.level >= 3) || (k === 'quests3' && t.quests >= 3) || (k === 'dd' && t.ddSurvived > 0) || (k === 'trinket' && (h.trinkets || []).length > 0) || (k === 'calm' && ev === 'return' && h.stress === 0);
  if (!ok) return;
  h.story.done = true;
  lines.push('**Marzenie spełnione:** ' + heroLabel(h) + ' ' + h.story.dreamText.replace(/^chce /, 'chciał(a) ') + ' — i dopiął swego. ' + gainQuirk(h, 'qp'));
}

/* ======================= zegar Ciemności ======================= */
function threatTick(o, lines, ops) {
  const before = o.threat || 0;
  if (o.week <= 1) return;
  const quested = (o.lastQuestWeek || 0) >= o.week - 1;
  o.threat = clamp(before + 1 + (quested ? 0 : 1), 0, 10);
  lines.push((quested ? 'Ciemność rośnie' : 'Nikt nie zszedł do lochu — **Ciemność rośnie podwójnie**') + ' (' + o.threat + '/10).');
  if (o.threat >= 4 && o.threat < 10) {
    const r = d(10); const lim = o.threat - 3;
    if (r <= lim) raid(o, lines, 'k10 = ' + r + ' ≤ ' + lim);
    else lines.push('Ciemność krąży wokół palisady (k10 = ' + r + ', napad przy ≤ ' + lim + ').');
  }
  if (o.threat >= 10) { o.siege = true; lines.push('**Oblężenie!** Ciemność wylewa się z lochów prosto na Osadę. MG wystawia walkę w zakładce Walka — przegrana kosztuje stopień budynku.'); }
}
/* napad: k4 na to, co stwory zabiorą */
function raid(o, lines, why) {
  const r = d(4); const head = '**Napad na Osadę** (' + why + '), k4 = **' + r + '**: ';
  const gold = () => { const g = d(6) * 2; o.gold = Math.max(0, o.gold - g); return 'stwory plądrują skarbiec — tracicie ' + g + ' Złota.'; };
  if (r === 1) return lines.push(head + gold());
  if (r === 2) { const b = d(2) === 1 ? 'Gospoda' : 'Opactwo'; o.raidClosed = { b, week: o.week }; return lines.push(head + b + ' w ogniu — w tym tygodniu nikt tam nie odpocznie.'); }
  if (r === 3) { if ((o.recruits || []).length) { o.recruits = o.recruits.slice(1); return lines.push(head + 'jeden z rekrutów z dyliżansu ucieka, zanim ktoś go najmie.'); } return lines.push(head + gold()); }
  if ((o.trinkets || []).length) { const i = d(o.trinkets.length) - 1; const t = o.trinkets[i]; o.trinkets = o.trinkets.filter((_, j) => j !== i); return lines.push(head + 'z magazynu znika błyskotka: ' + t.name + '.'); }
  return lines.push(head + gold());
}
function threatBar() {
  const o = Store.S.osada; const t = o.threat || 0;
  return `<div class="threat"><span class="lbl">Ciemność</span><span class="tbar">${Array.from({ length: 10 }, (_, i) => `<i class="${i < t ? 'on' : ''} ${i >= 5 ? 'hi' : ''}"></i>`).join('')}</span><b class="num">${t}/10</b>
    ${(() => { const why = 'Rośnie o 1 co tydzień (o 2 bez wyprawy); spada za wykonane średnie i długie zadania oraz pokonanych bossów; od 4 — napady na Osadę, przy 10 — oblężenie.'; return t >= 10 ? '<span class="small warn">oblężenie!</span>' : t >= 4 ? `<span class="small muted">napady na Osadę (k10 ≤ ${t - 3} co tydzień)</span>` : `<span class="small muted tdesc">${esc(why)}</span><span class="hint help tq" tabindex="0" data-gloss="${esc(why)}" title="${esc(why)}">co to?</span>`; })()}
    ${o.siege && Store.isGM() ? `<button class="btn sm primary" data-act="siege">Wystaw oblężenie do walki</button>` : ''}</div>`;
}
Object.assign(ACT, {
  siege: () => {
    const reg = pick(Store.S.osada.regions || ['ruiny']); const key = REGIONS[reg].key; const dl = Math.min(2, Math.floor((Store.S.osada.week || 1) / 8));
    setStol(st => { st.region = key; st.dl = dl; st.enemies = rollEncounter(key, dl).list.filter(Boolean); st.siege = true; st.roomId = null; st.looted = false; }, '**Oblężenie Osady!** Z ' + REGIONS[reg].name + ' nadchodzą wrogowie. Wygrana odpycha Ciemność, przegrana kosztuje stopień budynku.', 'bad');
    location.hash = '#stol';
  }
});

/* ======================= głosowanie drużyny ======================= */
const voterId = () => Store.me.id + (Store.mode === 'bc' || Store.mode === 'host' || Store.mode === 'client' ? ':' + TAB : '');
const votingOn = () => Store.mode === 'host' || Store.mode === 'client' || Store.mode === 'bc';
function voteRow(key, opts, kind) {
  if (!votingOn()) return `<div class="row">${opts.map(o => `<button class="btn ${o.note ? 'gold' : ''}" data-act="choose" data-k="${esc(key)}" data-kind="${kind}" data-o="${o.id}" ${o.dis ? 'disabled' : ''}>${esc(o.label)}${o.note ? `<span class="small"> (${esc(o.note)})</span>` : ''}</button>`).join('')}</div>`;
  const v = (Store.S.votes || {})[key] || {}; const me = voterId();
  const tally = o => Object.values(v).filter(x => x === o).length;
  return `<div class="votes">${opts.map(o => `<button class="btn ${v[me] === o.id ? 'gold' : ''}" data-act="vote" data-k="${esc(key)}" data-o="${o.id}">${esc(o.label)}${o.note ? `<span class="small"> (${esc(o.note)})</span>` : ''} <span class="vcount">${tally(o.id)}</span></button>`).join('')}
    <div class="row"><span class="small muted">Głosujcie — każdy klika swój wybór. Głosów: ${Object.keys(v).length}.</span><button class="btn sm primary" data-act="voteEnd" data-k="${esc(key)}" data-kind="${kind}" ${Object.keys(v).length ? '' : 'disabled'}>Rozstrzygnij głosowanie</button></div></div>`;
}
const CHOICE = { feature: resolveFeature, talk: resolveTalk, hamlet: resolveHamlet, road: o => resolveRoad(o) };
Object.assign(ACT, {
  choose: el => { const f = CHOICE[el.dataset.kind]; if (f) f(el.dataset.o); },
  vote: el => { const k = el.dataset.k; const v = Object.assign({}, (Store.S.votes || {})[k]); const me = voterId(); if (v[me] === el.dataset.o) delete v[me]; else v[me] = el.dataset.o; Store.act([opSet('votes', Object.assign({}, Store.S.votes, { [k]: v }))], {}); },
  voteEnd: el => {
    const k = el.dataset.k; const v = (Store.S.votes || {})[k] || {}; const counts = {};
    Object.values(v).forEach(o => counts[o] = (counts[o] || 0) + 1);
    const max = Math.max(...Object.values(counts)); const top = Object.keys(counts).filter(o => counts[o] === max);
    let win = top[0]; let note = 'Głosowanie: ' + Object.entries(counts).map(([o, n]) => o + ' ' + n).join(', ') + '.';
    if (top.length > 1) { const p = pickD(top); win = p.v; note += ' Remis — rozstrzyga kość: ' + p.t + '.'; }
    rollLog(note, '', 'sys');
    const vs = Object.assign({}, Store.S.votes); delete vs[k]; Store.act([opSet('votes', vs)], { quiet: true });
    const f = CHOICE[el.dataset.kind]; if (f) f(win);
  },
  campTalk: () => {
    const pt = party(); if (pt.length < 2) return;
    const w = clone(Store.S.wyprawa); if (!w.camp || w.camp.talk) return;
    const pa = pickD(pt); let rest = pt.filter(h => h.id !== pa.v.id); const pb = pickD(rest); const T = pick(CAMP_TALKS);
    w.camp.talk = { id: uid(), key: T.key, a: pa.v.id, b: pb.v.id };
    Store.act([opSet('wyprawa', w)]); rollLog('Przy ognisku zaczyna się rozmowa (' + pa.t + ', ' + pb.t + '): ' + T.text.replace(/\{A\}/g, heroLabel(pa.v)).replace(/\{B\}/g, heroLabel(pb.v)), '', 'sys');
  }
});

/* ======================= zapowiedzi bossów ======================= */
/* na początku rundy boss losuje drugi ruch i zdradza go jednym zdaniem — drużyna ma czas zareagować */
function bossTelegraph(st, lines) {
  st.enemies.filter(e => e.boss && !e.corpse && BOSS_AI[e.name]).forEach(e => {
    const ai = BOSS_AI[e.name]; const r = d(6); const row = ai.table.find(([a, b]) => r >= a && r <= b);
    e.nextMove = { r, name: row[2], round: st.round };
    lines.push('**Zapowiedź** — ' + e.name + ': pierwszy ruch to ' + ai.first + '; drugi (k6 = **' + r + '**): **' + row[2] + '**. *' + (BOSS_TELL[row[2]] || '') + '*');
  });
}
