/* Słownik pojęć: podpowiedzi na znacznikach i okno „Słownik”. */
const GLOSS = [
  ['bleed', 'Krwawienie X', 'X obrażeń na początku tury przez 2 tury; kilka krwawień się sumuje. Usuwa je bandaż i niektóre leczenia. Szkielety są na nie odporne.'],
  ['blight', 'Zaraza X', 'Jak krwawienie: X obrażeń na początku tury przez 2 tury. Usuwa ją antidotum.'],
  ['horror', 'Groza X', '+X Stresu na początku tury przez 2 tury. Usuwa ją laudanum.'],
  ['stun', 'Ogłuszenie', 'Postać traci najbliższą turę. W kolejnej rundzie nie można jej ogłuszyć ponownie.'],
  ['mark', 'Znak', 'Wrogowie wybierają ten cel, gdy mogą; niektóre umiejętności zadają mu więcej. Trwa 3 tury.'],
  ['guard', 'Ochrona', 'Ataki w chronionego trafiają obrońcę. Trwa 2 tury.'],
  ['push', 'Odrzut / Przyciągnięcie X', 'Przesuwa cel o X pozycji w tył albo w przód. Odpiera się Krzepą.'],
  ['debuff', 'Osłabienie', 'Kara do wskazanej statystyki (np. Celność −1) na kilka tur. Usuwają je zioła. Odpiera się Krzepą.'],
  ['buff', 'Wzmocnienie', 'Premia do wskazanej statystyki (np. Celność +1) na kilka tur. Strona dolicza ją do rzutów sama.'],
  ['dd', 'Próg Śmierci', 'Bohater ma 0 Zdrowia. Każde kolejne obrażenia wymagają Rzutu Śmierci: k10 ≤ Śmierć, porażka oznacza śmierć. Dowolne leczenie zdejmuje z Progu, ale daje Wyczerpanie.'],
  ['exh', 'Wyczerpanie', '−1 Celności, −1 obrażeń i −1 Szybkości do końca następnej walki. Dostaje je bohater zdjęty z Progu Śmierci.'],
  ['fatigue', 'Zmęczenie', 'Po najsilniejszych ciosach: Piekielnica −1 Celności i −1 obrażeń, Błazen −2 i −2, do końca walki; sumuje się.'],
  ['block', 'Blok', 'Żeton Łamaczki Tarcz anuluje jedno trafienie, ale nie krytyk. Najwyżej 3, przepadają po walce.'],
  ['riposte', 'Odwet', 'Do końca rundy każdy wróg, który zaatakuje tego bohatera, dostaje k4 obrażeń (minus Pancerz).'],
  ['corpse', 'Zwłoki', '3 Zdrowia, Unik 0, nic nie robią, ale trzymają pozycję. Krytyk, krwawienie i zaraza nie zostawiają zwłok.'],
  ['miss', 'Pudło i unik', 'Pudło: rzut wyższy niż sama Celność (albo 10). Unik: rzut trafiłby, gdyby nie Unik celu. W obu przypadkach atak chybia.'],
  ['test', 'Próba Charakteru', 'Przy Stresie 10: k10 ≤ Szansa Cnoty. Sukces daje Cnotę i Stres spada do 4, porażka — Przypadłość.'],
  ['heart', 'Zawał', 'Przy Stresie 20 Zdrowie spada do 0 i bohater staje na Progu Śmierci; jeśli już na nim stał — umiera. Kto przeżyje, ma Stres 17.'],
  ['refuse', 'Odmawia leczenia', 'Przypadłość: do swojej następnej tury bohater odrzuca leczenie od sojuszników.'],
  ['noswap', 'Odmawia zamiany', 'Przypadłość: do swojej następnej tury nikt nie zamieni się z nim miejscami.'],
  ['lost', 'Tura stracona', 'Przypadłość przejęła tę turę — gracz nie wykonuje akcji.']
];
const AFFL_APP = {
  'Paranoja': 'Przy 1–3 strona losuje: sam zmienia pozycję, oskarża sojusznika (+1 Stres) albo odmawia leczenia do swojej następnej tury.',
  'Egoizm': 'Przy 1–3 strona losuje: pomija turę, leczy tylko siebie (jeśli ma czym) albo odmawia zamiany pozycji. Przy głodzie zjada 2 prowianty.',
  'Obłęd': 'Przy 1–3 używa losowej umiejętności w losowy cel.',
  'Lęk': 'Przy 1–3 cofa się o 1 pozycję i pomija turę.',
  'Beznadzieja': 'Przy 1–3 strona losuje: pomija turę, załamuje innych (+1 Stres sojusznikom) albo odmawia leczenia. Przy głodzie nie je.',
  'Agresja': 'Przy 1–3 strona losuje: szydzi z sojusznika (+2 Stres) albo atakuje bez rozkazu. W obozie +1 Stres każdemu.',
  'Masochizm': 'Przy 1–3 strona losuje: wysuwa się na przód, rani się (k4) albo odmawia leczenia.'
};
function glossKey(t) {
  t = String(t).toLowerCase();
  if (/^krwaw/.test(t)) return 'bleed'; if (/^zaraz/.test(t)) return 'blight'; if (/^groza/.test(t)) return 'horror';
  if (/ogłusz/.test(t)) return 'stun'; if (/^znak/.test(t)) return 'mark'; if (/^ochrona/.test(t)) return 'guard';
  if (/próg/.test(t)) return 'dd'; if (/wyczerp/.test(t)) return 'exh'; if (/zmęcz/.test(t)) return 'fatigue'; if (/^blok/.test(t)) return 'block';
  if (/odwet/.test(t)) return 'riposte'; if (/odmawia lecz/.test(t)) return 'refuse'; if (/odmawia zam/.test(t)) return 'noswap'; if (/tura stracona/.test(t)) return 'lost';
  if (/−\d/.test(t)) return 'debuff'; if (/\+\d/.test(t)) return 'buff';
  return null;
}
function glossText(key, label) {
  const v = DATA.virtues.find(x => x.name === label); if (v) return 'Cnota ' + v.name + ': ' + v.perm + '. Przy 1–3 na początku tury: ' + v.proc + '.';
  const a = DATA.afflictions.find(x => x.name === label); if (a) return 'Przypadłość ' + a.name + ': ' + (AFFL_APP[a.name] || a.combat) + ' Poza walką: ' + a.out + '. Mija, gdy Stres spadnie do 0, albo po leczeniu w Osadzie.';
  if (label === 'Ekstaza bólu') return 'Ekstaza bólu (Biczownik): co turę musi atakować, nie leczy innych, traci 1 Zdrowia na początku tury; Stres z ataków wrogów go nie dotyczy.';
  const g = GLOSS.find(x => x[0] === key); return g ? g[1] + ': ' + g[2] : '';
}
function glossaryModal() {
  modal(`<h3>Słownik</h3><div class="gloss">${GLOSS.map(g => `<p><b>${esc(g[1])}</b> — ${esc(g[2])}</p>`).join('')}
    <div class="ph">Przypadłości i jak działają na stole</div>${DATA.afflictions.map(a => `<p><b>${esc(a.name)}</b> — ${esc(AFFL_APP[a.name] || a.combat)} <span class="dim">Poza walką: ${esc(a.out)}.</span></p>`).join('')}
    <div class="ph">Cnoty</div>${DATA.virtues.map(v => `<p><b>${esc(v.name)}</b> — ${esc(v.perm)}; przy 1–3 na początku tury: ${esc(v.proc)}.</p>`).join('')}</div>`, [{ t: 'Zamknij', cls: 'primary' }]);
}
/* Rozstrzyganie walki: obrażenia, Stres, Próg Śmierci, efekty, ruch w szyku. Funkcje działają na kopiach i zwracają opisy do dziennika. */
const FX_NAMES = { bleed: 'krwawienie', blight: 'zaraza', horror: 'groza', stun: 'ogłuszenie', mark: 'Znak', guard: 'Ochrona' };
const sumDot = list => (list || []).reduce((a, x) => a + x[0], 0);

/* --- bohater: obrażenia, leczenie, Stres --- */
function heroDamage(h, dmg, lines, src) {
  if (dmg <= 0 || h.dead) return;
  if (h.hp > 0) {
    h.hp -= dmg;
    if (h.hp <= 0) { h.hp = 0; h.dd = true; lines.push('**' + heroLabel(h) + '** staje na **Progu Śmierci**.'); }
    return;
  }
  const st = heroStats(h); const r = d(10); const ok = r === 1 || (r !== 10 && r <= st.death);
  lines.push('Rzut Śmierci ' + heroLabel(h) + ': k10 = **' + r + '** przy Śmierci ' + st.death + ' → **' + (ok ? 'przeżywa' : 'ginie') + '**.');
  if (!ok) heroDies(h, src || 'obrażenia', lines);
}
function heroDies(h, cause, lines) {
  h.dead = true; h.hp = 0; h.dd = false; h.deathCause = cause; h.deathWeek = Store.S.osada.week;
  lines.push('☩ **' + heroLabel(h) + '** nie żyje (' + cause + ').');
  lines._deaths = (lines._deaths || []).concat(h.id);
}
function heroHeal(h, n, lines, crit) {
  if (h.dead) return 0;
  const st = heroStats(h);
  n = Math.max(1, n + st.healIn);
  const before = h.hp; h.hp = Math.min(st.maxhp, h.hp + n);
  if (before === 0 && h.dd) { h.tally = Object.assign({ quests: 0, bosses: 0, ddSurvived: 0 }, h.tally); h.tally.ddSurvived++; h.dd = false; h.exh = Store.S.stol.fight ? 2 : 1; h.exhausted = true; lines.push(heroLabel(h) + ' schodzi z Progu Śmierci, ale ma **Wyczerpanie**.'); }
  if (crit) heroStress(h, -1, lines);
  return h.hp - before;
}
/* n > 0 dodaje Stres (z Próbą Charakteru i zawałem), n < 0 zdejmuje */
function heroStress(h, n, lines, opts = {}) {
  if (h.dead || !n) return;
  const st = heroStats(h);
  if (n > 0) {
    if (opts.enemy && h.state && h.state.kind === 'ekstaza') { lines.push(heroLabel(h) + ' w Ekstazie bólu nie czuje Stresu.'); return; }
    if (h.state && h.state.kind === 'virtue' && h.state.name === 'Odważny') n = Math.max(0, n - 1);
    if (Store.S.stol.fight && h.fx && h.fx.noFirst) { h.fx = Object.assign({}, h.fx, { noFirst: 0, optUsed: 1 }); lines.push(heroLabel(h) + ' nie czuje pierwszego Stresu w tej walce (Kpina z ciemności).'); return; }
    if (Store.S.stol.fight && !(h.fx && h.fx.optUsed) && h.qp.some(q => qname(q.t) === 'Optymista')) { h.fx = Object.assign({}, h.fx, { optUsed: 1 }); n -= 1; lines.push(heroLabel(h) + ' (Optymista): pierwszy Stres w walce −1.'); if (n <= 0) return; }
    const before = h.stress; h.stress = Math.min(st.heart, h.stress + n);
    if (before < 5 && h.stress >= 5 && h.stress < 10) bark(h, 'stress5', lines);
    if (before < 15 && h.stress >= 15 && h.stress < st.heart) bark(h, 'stress15', lines);
    if (before < 10 && h.stress >= 10 && (!h.state || h.state.kind === 'virtue' || h.state.temp)) resolveTest(h, lines);
    else if (before < 10 && h.stress >= 10 && h.state && h.state.kind === 'virtue') resolveTest(h, lines);
    if (h.stress >= st.heart) {
      lines.push('**Zawał!** ' + heroLabel(h) + ' pęka pod ciężarem Stresu.');
      if (h.dd || h.hp === 0) heroDies(h, 'zawał', lines);
      else { h.hp = 0; h.dd = true; h.stress = 17; lines.push(heroLabel(h) + ' staje na Progu Śmierci, Stres spada do 17.'); }
    }
  } else {
    h.stress = Math.max(0, h.stress + n);
    if (h.stress === 0 && h.state && (h.state.kind === 'affliction' || h.state.kind === 'ekstaza')) { lines.push(heroLabel(h) + ' otrząsa się z Przypadłości.'); h.state = null; }
  }
}
function resolveTest(h, lines) {
  const st = heroStats(h); const vb = h.nextVirtue || 0; h.nextVirtue = 0; st.virtue = Math.min(5, st.virtue + vb); const r = d(10); const ok = r === 1 || (r !== 10 && r <= st.virtue);
  if (vb) lines.push(heroLabel(h) + ': Szansa Cnoty +' + vb + ' (Opowieści weterana).');
  if (h.state && h.state.kind === 'virtue') lines.push(heroLabel(h) + ' traci Cnotę ' + h.state.name + '.');
  if (ok) {
    const pv = pickD(DATA.virtues); const v = pv.v; h.state = { kind: 'virtue', name: v.name }; h.stress = 4;
    lines.push('**Próba Charakteru** ' + heroLabel(h) + ': k10 = **' + r + '** przy Szansie ' + st.virtue + ' → Cnota, rodzaj: ' + pv.t + ' → **' + v.name + '** (' + v.perm + '). Stres spada do 4.');
    bark(h, 'virtue', lines, v.name);
    lines._cls = 'crit';
  } else if (CLS[h.cls].name === 'Biczownik') {
    h.state = { kind: 'ekstaza', name: 'Ekstaza bólu' };
    lines.push('**Próba Charakteru** ' + heroLabel(h) + ': k10 = **' + r + '** → **Ekstaza bólu**: co turę atakuje, nie leczy innych, traci 1 Zdrowia na początku tury.');
  } else {
    const pa = pickD(DATA.afflictions); const a = pa.v; h.state = { kind: 'affliction', name: a.name };
    lines.push('**Próba Charakteru** ' + heroLabel(h) + ': k10 = **' + r + '** przy Szansie ' + st.virtue + ' → Przypadłość, rodzaj: ' + pa.t + ' → **' + a.name + '**. W walce: ' + a.combat + '.');
    bark(h, 'affliction', lines, a.name);
    lines._cls = 'bad';
  }
}
function addFx(fx, k, x, turns) {
  if (k === 'bleed' || k === 'blight' || k === 'horror') { fx[k] = (fx[k] || []).concat([[x, 2]]); return; }
  if (k === 'stun') { fx.stun = 1; return; }
  if (k === 'mark') { fx.mark = 3; return; }
  if (k === 'guard') { fx.guard = turns || 2; return; }
}
function fxChips(fx, h) {
  fx = fx || {};
  const out = [];
  if (sumDot(fx.bleed)) out.push(['red', 'krwawienie ' + sumDot(fx.bleed)]);
  if (sumDot(fx.blight)) out.push(['green', 'zaraza ' + sumDot(fx.blight)]);
  if (sumDot(fx.horror)) out.push(['violet', 'groza ' + sumDot(fx.horror)]);
  if (fx.stun) out.push(['gold', 'ogłuszony']);
  if (fx.mark) out.push(['red', 'Znak ' + fx.mark]);
  if (fx.guard) out.push(['', 'Ochrona ' + fx.guard]);
  if (fx.cauldron) out.push(['red', 'w kotle (' + fx.cauldron + ')']);
  if (fx.charm) out.push(['affl', 'zauroczony (' + fx.charm + ')']);
  if (fx.riposte != null && fx.riposte === (Store.S.stol.round || 0) && Store.S.stol.fight) out.push(['gold', 'Odwet']);
  const rd = Store.S.stol.round || 0;
  if (fx.refuseHeal != null && fx.refuseHeal >= rd && Store.S.stol.fight) out.push(['affl', 'odmawia leczenia']);
  if (fx.noSwap != null && fx.noSwap >= rd && Store.S.stol.fight) out.push(['affl', 'odmawia zamiany']);
  if (fx.lostTurn != null && fx.lostTurn === rd && Store.S.stol.fight) out.push(['affl', 'tura stracona']);
  if (fx.dodgeDown) out.push(['', 'Unik −' + fx.dodgeDown]);
  if (fx.protDown) out.push(['', 'Pancerz −' + fx.protDown]);
  (fx.buffs || []).forEach(b => out.push(['', b[0] + (b[1] ? ' (' + b[1] + ')' : '')]));
  return out;
}

/* --- szyk --- */
const enemyPositions = list => { let p = 1; return list.map(e => { const pos = p; p += e.size || 1; return { e, pos, last: pos + (e.size || 1) - 1 }; }); };
const enemyAt = (list, pos) => enemyPositions(list).find(x => pos >= x.pos && pos <= x.last);
function moveInList(list, idx, delta) {
  const ni = clamp(idx + delta, 0, list.length - 1);
  if (ni === idx) return false;
  const [x] = list.splice(idx, 1); list.splice(ni, 0, x); return true;
}

/* pudło (chybił nawet bez uniku) albo unik (uratował go Unik celu) */
function missKind(r, cel) { return (r === 10 || r > cel) ? 'miss' : 'dodge'; }
function needTxt(r, cel, dodge, tmod, deb) {
  const ch = cel - dodge; const base = cel - (tmod || 0) - (deb || 0);
  const t = (tmod ? (tmod > 0 ? ' + ' + tmod + ' za mrok' : ' − ' + (-tmod) + ' za światło') : '') + (deb ? (deb > 0 ? ' + ' + deb : ' − ' + (-deb)) + ' z efektów' : '');
  return 'rzut **' + r + '**, trafia ≤ ' + ch + ' (Celność ' + base + t + ' − Unik ' + dodge + ')';
}
/* --- atak bohatera --- */
function heroUse(h0, idx, targetIds) {
  const s = Store.S; const stol = clone(s.stol); const lines = []; const touched = {};
  const h = clone(h0); touched[h.id] = h;
  const getH = id => touched[id] || (touched[id] = clone(s.heroes[id]));
  const st = heroStats(h); const v = skillView(h, idx, st); const sk = v.s; const inf = v.inf;
  let crits = 0; const ev = [{ id: h.id, k: 'act', txt: sk.name }]; const sum = [];
  lines.push('**' + heroLabel(h) + '** używa: **' + sk.name + '**.');
  if (inf.attack) {
    const tlist = stol.enemies;
    stol.atk = { r: stol.round || 0, ids: ((stol.atk && stol.atk.r === (stol.round || 0)) ? stol.atk.ids : []).concat(targetIds) };
    const eps = enemyPositions(tlist);
    targetIds.forEach(tid => {
      let e = tlist.find(x => x.id === tid); if (!e) return;
      if (e.fx && e.fx.guard && e.fx.guardBy) { const gd = tlist.find(x => x.id === e.fx.guardBy && !x.corpse); if (gd) { lines.push('Ochrona: atak w ' + e.name + ' przejmuje ' + gd.name + '.'); e = gd; } }
      /* Celność zależna od sytuacji: Nocny marek, Celne oko, Kompas ślepca */
      const ep = eps.find(x => x.e.id === tid); let sit = 0; const sitWhy = [];
      if (stol.torch <= 2 && h.qp.some(q => qname(q.t) === 'Nocny marek')) { sit++; sitWhy.push('Nocny marek +1'); }
      if (ep && ep.last >= 3 && h.qp.some(q => qname(q.t) === 'Celne oko')) { sit++; sitWhy.push('Celne oko +1'); }
      if (stol.torch >= 9 && st.accBright) { sit += st.accBright; sitWhy.push('Kompas ślepca ' + st.accBright); }
      const cel = v.cel + sit;
      const dg = enemyDodge(e); const chance = cel - dg;
      const roll = hitRoll(chance, v.crit);
      let txt = '→ ' + e.name + ': ' + needTxt(roll.r, cel, dg) + (sitWhy.length ? ' [' + sitWhy.join(', ') + ']' : '');
      if (roll.res === 'miss') {
        const mk = missKind(roll.r, v.cel);
        const w = mk === 'miss' ? 'PUDŁO' : 'UNIK';
        lines.push(txt + ' → **' + (mk === 'miss' ? 'pudło' : 'unik: ' + e.name + ' uchyla się') + '**.');
        ev.push({ id: e.id, k: mk, txt: w }); sum.push(e.name + ': **' + w + '** — ' + needTxt(roll.r, cel, dg) + (mk === 'miss' ? ', chybienie nawet bez uniku.' : ', uratował go Unik.'));
        return;
      }
      const crit = roll.res === 'crit'; if (crit) crits++;
      let dmg = 0;
      if (inf.dice) {
        const tb = typeBonus(sk.eff, e, h);
        if (crit) dmg = Math.ceil(diceMax(inf.dice, v.dmgBonus) * 1.5) + tb;
        else dmg = rollDice(inf.dice, v.dmgBonus).total + tb;
        const ign = /ignoruje Pancerz/.test(sk.eff);
        const prot = ign ? 0 : enemyProt(e);
        dmg = Math.max(1, dmg - prot);
        e.hp -= dmg; witchDamage(stol, e, dmg, lines, getH);
        txt += ' → **' + (crit ? 'KRYTYK' : 'trafienie') + '**, ' + obrN(dmg) + (prot ? ' (po Pancerzu ' + prot + ')' : '') + (tb ? ' (w tym +' + tb + ' premii)' : '');
      } else txt += ' → **' + (crit ? 'KRYTYK' : 'trafienie') + '**';
      ev.push({ id: e.id, k: crit ? 'crit' : 'hit', txt: (crit ? 'KRYTYK ' : '') + (dmg ? '−' + dmg : 'TRAFIENIE') });
      let s1 = e.name + ': **' + (crit ? 'KRYTYK' : 'TRAFIENIE') + '**' + (dmg ? ', ' + obrN(dmg) : '') + ' — ' + needTxt(roll.r, cel, dg) + (crit ? ', a kryt przy ≤ ' + v.crit : '') + '.';
      if (e.hp <= 0) {
        txt += '. **' + e.name + ' pada.**'; s1 += ' **Pada.**';
        ev.push({ id: e.id, k: 'kill', txt: 'PADA' });
        killEnemy(stol, e, (crit || /zwłoki rozpadają się/.test(sk.eff)) ? 'crit' : 'hit');
      } else {
        parseEffects(sk.eff).forEach(ef => { const t = applyEnemyFx(stol, e, ef, crit); txt += t; s1 += t; if (/odpiera/.test(t)) ev.push({ id: e.id, k: 'resist', txt: 'odpiera' }); else if (/\*\*/.test(t)) ev.push({ id: e.id, k: 'fx', txt: t.replace(/\*\*|\(.*?\)|\./g, '').trim() }); });
      }
      sum.push(s1);
      lines.push(txt);
      if (/leczy się o połowę zadanych/.test(sk.eff) && dmg) { const n = heroHeal(h, Math.ceil(dmg / 2), lines); lines.push(heroLabel(h) + ' leczy się o ' + n + '.'); }
      if (/Westalka leczy się o 1/.test(sk.eff)) heroHeal(h, 1, lines);
      if (/Ohyda −1 Stres/.test(sk.eff)) heroStress(h, -1, lines);
    });
    if (crits) { heroStress(h, -1, lines); lines.push(heroLabel(h) + ' po krytyku: −1 Stres.'); if (d(3) === 1) bark(h, 'crit', lines); }
    const pb = sk.eff.match(/drużyna ((?:Celność|Szybkość|obrażenia|Unik|Kryt)[^;]*?) na (\d) tury/);
    if (pb) { stol.heroes.forEach(id => { const t = id === h.id ? h : getH(id); if (!t || t.dead) return; t.fx = Object.assign({}, t.fx); t.fx.buffs = (t.fx.buffs || []).filter(b => b[0] !== pb[1]).concat([[pb[1], +pb[2]]]); }); lines.push('Drużyna: ' + pb[1] + ' na ' + pb[2] + ' tury.'); sum.push('Drużyna: **' + pb[1] + '** na ' + pb[2] + ' tury.'); }
  } else {
    const r = d(10); const crit = r <= v.crit;
    let targets = [];
    if (inf.target === 'self') targets = [h.id];
    else if (inf.target === 'party') targets = stol.heroes.slice();
    else targets = targetIds;
    if (/tylko przy Zdrowiu 4 lub mniej/.test(sk.eff) && h.hp > 4) { lines.push('Nie działa: ' + heroLabel(h) + ' ma więcej niż 4 Zdrowia.'); return { lines, stol: null, touched: {}, ev: [], sum: [], head: '' }; }
    if (/Dar bicza/.test(sk.name)) targets = targets.filter(id => id !== h.id);
    if (v.inf.heal || v.stress) lines.push('k10 na krytyk = **' + r + '**' + (crit ? ' → **KRYTYK**' : '') + '.');
    targets.forEach(id => {
      const t = id === h.id ? h : getH(id); if (!t || t.dead) return;
      const bits = [];
      if (t.id !== h.id && t.fx && t.fx.refuseHeal != null && t.fx.refuseHeal >= (stol.round || 0) && stol.fight && (v.inf.heal || v.stress)) { lines.push('→ ' + heroLabel(t) + ' **odmawia leczenia** (' + (t.state ? t.state.name : 'Przypadłość') + ').'); sum.push(heroLabel(t) + ': **odmawia leczenia** — umiejętność przepada.'); ev.push({ id: t.id, k: 'resist', txt: 'ODMAWIA' }); return; }
      if (v.inf.heal) {
        const hr = crit ? null : rollDice(inf.heal, v.healBonus);
        const bnd = t.id === h.id ? 0 : bondOf(h, t.id); const bb = bnd >= 2 ? 1 : bnd <= -2 ? -1 : 0;
        const low = t.hp * 3 <= heroStats(t).maxhp;
        const amt = Math.max(1, (crit ? Math.ceil(diceMax(inf.heal, v.healBonus) * 1.5) : hr.total) + bb);
        if (bb) lines.push(bb > 0 ? '(przyjaźń: leczenie +1)' : '(niechęć: leczenie −1)');
        const got = heroHeal(t, amt, lines, crit);
        if (low && t.id !== h.id && stol.fight) bondAdd(h, t, 1, lines); bits.push('+' + got + ' Zdrowia' + (hr && inf.heal.n ? ' (k' + inf.heal.n + ' = ' + hr.roll + ')' : ''));
        const bl = sk.eff.match(/przy wyniku 1–(\d) leczony zaczyna krwawić \((\d)\)/);
        if (bl && hr && hr.roll <= +bl[1] && !t.dead) {
          t.fx = Object.assign({}, t.fx); addFx(t.fx, 'bleed', +bl[2] + (t.qn.some(q => qname(q.t) === 'Hemofilik') ? 1 : 0));
          bits.push('**zaczyna krwawić (' + bl[2] + ')**, bo na kości wypadło ' + hr.roll);
          ev.push({ id: t.id, k: 'hit', txt: 'KRWAWIENIE ' + bl[2] });
        }
      }
      if (v.stress) { heroStress(t, -v.stress, lines); bits.push('−' + v.stress + ' Stres'); }
      if (/usuwa krwawienie i zarazę/.test(sk.eff)) { t.fx = Object.assign({}, t.fx, { bleed: [], blight: [] }); bits.push('bez krwawienia i zarazy'); }
      else if (/usuwa krwawienie/.test(sk.eff)) { t.fx = Object.assign({}, t.fx, { bleed: [] }); bits.push('bez krwawienia'); }
      if (/\+1 Zdrowia/.test(sk.eff) && !v.inf.heal) { const got = heroHeal(t, 1, lines); bits.push('+' + got + ' Zdrowia'); }
      if (/przejmuje ataki w nią/.test(sk.eff) && inf.target === 'ally') { h.fx = Object.assign({}, h.fx, { guard: 2, guardBy: t.id }); h.fx.buffs = (h.fx.buffs || []).concat([['Unik +2', 2]]); bits.push('osłania ' + heroLabel(h)); }
      else if (/Ochrona/.test(sk.eff) && inf.target === 'ally') { t.fx = Object.assign({}, t.fx); addFx(t.fx, 'guard', 0, 2); t.fx.guardBy = h.id; bits.push('pod Ochroną ' + heroLabel(h)); }
      const buff = sk.eff.match(/((?:Celność|Szybkość|obrażenia|Unik|Pancerz|Kryt|Odporność|Krzepa)[^;]*?) na (\d) tury/);
      if (buff) { t.fx = Object.assign({}, t.fx); const bt = buff[1].replace(/^.*?(Celność|Szybkość|obrażenia|Unik|Pancerz|Kryt|Odporność|Krzepa)/, '$1'); t.fx.buffs = (t.fx.buffs || []).filter(b => b[0] !== bt).concat([[bt, +buff[2]]]); bits.push(bt + ' na ' + buff[2] + ' tury'); }
      if (/Unik \+3 do końca rundy/.test(sk.eff)) { t.fx = Object.assign({}, t.fx); t.fx.buffs = (t.fx.buffs || []).filter(b => b[0] !== 'Unik +3').concat([['Unik +3', 0]]); bits.push('Unik +3 do końca rundy'); }
      if (bits.length) { lines.push('→ ' + heroLabel(t) + ': ' + bits.join(', ') + '.'); sum.push(heroLabel(t) + ': ' + bits.join(', ') + (crit ? ' (krytyk)' : '') + '.'); ev.push({ id: t.id, k: 'heal', txt: bits[0] }); }
    });
    if (/Biczownik traci 2 Zdrowia/.test(sk.eff)) { const b0 = h.hp; h.hp = Math.max(1, h.hp - 2); lines.push(heroLabel(h) + ' płaci krwią: −' + (b0 - h.hp) + ' Zdrowia.'); sum.push(heroLabel(h) + ': −' + (b0 - h.hp) + ' Zdrowia (cena leczenia).'); }
    if (/Biczownik \+2 Stres/.test(sk.eff)) { heroStress(h, 2, lines); lines.push(heroLabel(h) + ' +2 Stres.'); ev.push({ id: h.id, k: 'stress', txt: '+2 Stres' }); }
    if (/sam Pancerz \+1/.test(sk.eff)) { h.fx = Object.assign({}, h.fx); h.fx.buffs = (h.fx.buffs || []).concat([['Pancerz +1', 2]]); }
    if (/Taniec węża/.test(sk.name)) { h.block = Math.min(3, (h.block || 0) + 2); lines.push(heroLabel(h) + ' ma ' + h.block + ' żetony Bloku.'); }
    if (/Wytrwałość/.test(sk.name)) { h.fx = Object.assign({}, h.fx, { mark: 3 }); }
    if (/Solo/.test(sk.name)) { h.fx = Object.assign({}, h.fx, { mark: 3 }); }
    if (/Raca/.test(sk.name)) { stol.torch = Math.min(10, stol.torch + 2); lines.push('Pochodnia +2.'); stol.heroes.forEach(id => { const t = id === h.id ? h : getH(id); if (t && t.fx && t.fx.stun) { t.fx = Object.assign({}, t.fx, { stun: 0 }); lines.push(heroLabel(t) + ' otrząsa się z ogłuszenia.'); } }); }
    if (/Oślepiające światło/.test(sk.name)) { stol.torch = Math.min(10, stol.torch + 1); }
  }
  if (/Oślepiające światło/.test(sk.name) && inf.attack) stol.torch = Math.min(10, stol.torch + 1);
  /* ruch samego bohatera */
  const order = stol.heroes; const i0 = order.indexOf(h.id);
  let m;
  if (i0 >= 0) {
    if ((m = sk.eff.match(/przesuwa się o (\d) do przodu/))) moveInList(order, i0, -+m[1]);
    else if ((m = sk.eff.match(/cofa się o (\d)/))) moveInList(order, i0, +m[1]);
    else if (/przesuwa się na pozycję 1/.test(sk.eff)) moveInList(order, i0, -9);
    else if (/cofa się na pozycję 4/.test(sk.eff)) moveInList(order, i0, 9);
  }
  const lim = /2 razy na walkę/.test(sk.eff) ? 2 : /raz na walkę/.test(sk.eff) ? 1 : 0;
  if (lim) { h.fx = Object.assign({}, h.fx); h.fx.used = Object.assign({}, h.fx.used, { [idx]: ((h.fx.used || {})[idx] || 0) + 1 }); lines.push('(' + sk.name + ': użyto ' + h.fx.used[idx] + ' z ' + lim + ' w tej walce.)'); }
  if (/oddaje k4 każdemu, kto go zaatakuje/.test(sk.eff)) {
    h.fx = Object.assign({}, h.fx, { riposte: stol.round || 0 });
    lines.push(heroLabel(h) + ' szykuje **odwet**: do końca rundy każdy, kto go zaatakuje, dostaje k4.');
    ev.push({ id: h.id, k: 'fx', txt: 'ODWET' }); sum.push(heroLabel(h) + ': **odwet** do końca rundy — każdy atakujący dostaje k4 obrażeń.');
  }
  if (/potem Zmęczenie/.test(sk.eff)) { h.fatigue = (h.fatigue || 0) + 1; lines.push(heroLabel(h) + ': Zmęczenie (' + h.fatigue + ').'); }
  const rest = sk.eff.replace(/krwawienie \d|zaraza \d|ogłuszenie|odrzut \d|przyciągnięcie \d/g, '').trim();
  if (rest && /raz na walkę|2 razy na walkę/.test(sk.eff)) lines.push('Pamiętaj: ' + sk.eff + '.');
  heartCheck(stol, lines, getH);
  return { lines, stol, touched, ev, sum, head: heroLabel(h) + ' — ' + sk.name };
}
function applyEnemyFx(stol, e, ef, crit) {
  if (ef.k === 'mark') { e.fx.mark = 3; return ' Znak.'; }
  if (ef.k === 'bleed' && e.noBleed) return ' (szkielet: krwawienie nie działa)';
  if (ef.k === 'stun' && (e.fx.stun || (e.fx.stunImm || 0) >= (stol.round || 0))) return ' (' + e.name + ' nie może być teraz ogłuszony)';
  const val = ef.res === 'krzepa' ? e.krzepa : e.odp;
  const rs = resist(val, crit);
  const name = { bleed: 'krwawienie ' + ef.x, blight: 'zaraza ' + ef.x, stun: 'ogłuszenie', push: 'odrzut ' + ef.x, pull: 'przyciągnięcie ' + ef.x, debuff: ef.txt }[ef.k];
  if (rs.ok) return ' ' + e.name + ' odpiera ' + name + ' (k10 = ' + rs.r + ' ≤ ' + val + ').';
  if (ef.k === 'bleed' || ef.k === 'blight') addFx(e.fx, ef.k, ef.x);
  if (ef.k === 'stun') e.fx.stun = 1;
  if (ef.k === 'debuff') {
    const t = ef.txt.replace(/ celu| celów/g, ''); e.fx.buffs = (e.fx.buffs || []).filter(b => b[0] !== t).concat([[t, ef.turns || 3]]);
  }
  if (ef.k === 'push' || ef.k === 'pull') {
    const i = stol.enemies.indexOf(e); moveInList(stol.enemies, i, ef.k === 'push' ? ef.x : -ef.x);
  }
  return ' **' + name + '**' + (crit ? ' (krytyk — bez rzutu)' : ' (k10 = ' + rs.r + ')') + '.';
}
function killEnemy(stol, e, how) {
  const i = stol.enemies.indexOf(e);
  if (i < 0) return;
  if (e.name === 'Giermek') { const p = stol.enemies.find(x => x.name === 'Świński Książę' && !x.corpse); if (p) { p.fx = Object.assign({}, p.fx); p.fx.buffs = (p.fx.buffs || []).concat([['obrażenia +2 (szał)', 999]]); stol.notes = (stol.notes || []).concat('**Giermek ginie — Świński Książę wpada w szał:** obrażenia +2 do końca walki.'); } }
  if (e.name === 'Wiedźma z kotłem' && stol.cauldron) stol.notes = (stol.notes || []).concat('Wiedźma pada, kocioł się przewraca — uwięziony bohater wychodzi na początku swojej tury.');
  stol.init = (stol.init || []).filter(x => x.id !== e.id);
  if (how === 'hit' && !e.boss && !e.corpse && e.name !== 'Macka') stol.enemies[i] = { id: e.id, name: 'Zwłoki', corpse: true, hp: 3, maxhp: 3, dodge: 0, prot: 0, speed: 0, attacks: [], fx: {}, size: e.size || 1, type: '', krzepa: 0, odp: 0 };
  else stol.enemies.splice(i, 1);
  stol.init = (stol.init || []).filter(x => x.id !== e.id);
}

/* --- atak wroga --- */
function enemyAttack(e0, aIdx, heroIds) {
  const s = Store.S; const stol = clone(s.stol); const lines = []; const touched = {};
  const e = stol.enemies.find(x => x.id === e0.id); if (!e) return null;
  const a = e.attacks[aIdx]; const ti = torchInfo(stol.torch);
  lines.push('**' + e.name + '**: **' + a.name + '**.');
  const ev = [{ id: e.id, k: 'act', txt: a.name }]; const sum = [];
  if (!a.w) { lines.push(attackText(a).replace(/<\/?b>/g, '**')); return { lines, stol, touched, ev, sum: [attackText(a).replace(/<\/?b>/g, '**')], head: e.name + ' — ' + a.name }; }
  const rip = [];
  heroIds.forEach(id => {
    const h = touched[id] || (touched[id] = clone(s.heroes[id])); if (!h || h.dead) return;
    if (h.fx && h.fx.riposte != null && h.fx.riposte === (stol.round || 0) && stol.fight) rip.push(h);
    const st = heroStats(h);
    const em = fxMods(e.fx); const cel = a.celS + ti.accMod + (em.acc || 0); const chance = cel - st.dodge;
    const tmod = ti.accMod;
    const roll = hitRoll(chance, 1 + ti.critMod);
    let txt = '→ ' + heroLabel(h) + ': ' + needTxt(roll.r, cel, st.dodge, tmod, em.acc || 0);
    if (roll.res === 'miss') {
      const mk = missKind(roll.r, cel); const w = mk === 'miss' ? 'PUDŁO' : 'UNIK';
      lines.push(txt + ' → **' + (mk === 'miss' ? 'pudło' : 'unik: ' + heroLabel(h) + ' uchyla się') + '**.');
      ev.push({ id: h.id, k: mk, txt: w }); sum.push(heroLabel(h) + ': **' + w + '** — ' + needTxt(roll.r, cel, st.dodge, tmod, em.acc || 0) + (mk === 'miss' ? ', wróg chybił nawet bez uniku.' : ', uratował go Unik.'));
      return;
    }
    if (h.block && roll.res !== 'crit') { h.block--; lines.push(txt + ' → trafienie, ale **Blok** je anuluje (zostało ' + h.block + ').'); ev.push({ id: h.id, k: 'dodge', txt: 'BLOK' }); sum.push(heroLabel(h) + ': **BLOK** — trafienie anulowane żetonem Bloku.'); return; }
    const crit = roll.res === 'crit';
    let dmg = 0;
    const p = parseDice(a.dmgS);
    if (p) {
      dmg = (crit ? diceMax(p) : rollDice(p).total) + ti.dmgMod + (em.dmg || 0);
      const prot = Math.max(0, st.prot);
      dmg = Math.max(1, dmg - prot);
    }
    txt += ' → **' + (crit ? 'KRYTYK' : 'trafienie') + '**' + (dmg ? ', ' + obrN(dmg) : '') + '.';
    lines.push(txt);
    ev.push({ id: h.id, k: crit ? 'crit' : 'hit', txt: (crit ? 'KRYTYK ' : '') + (dmg ? '−' + dmg : 'TRAFIENIE') });
    const sumIdx = sum.push(heroLabel(h) + ': **' + (crit ? 'KRYTYK' : 'TRAFIENIE') + '**' + (dmg ? ', ' + obrN(dmg) : '') + ' — ' + needTxt(roll.r, cel, st.dodge, tmod, em.acc || 0) + '.') - 1;
    const sub = [];
    if (dmg) heroDamage(h, dmg, sub, e.name);
    let stress = a.stressS || 0;
    if (crit) stress += 2 + (st.critStress || 0);
    if (stress && !h.dead) { heroStress(h, stress, sub, { enemy: true }); sub.unshift(heroLabel(h) + ' +' + stress + ' Stresu' + (crit ? ' (krytyk)' : '') + '.'); }
    if (!h.dead && a.name === 'Do kotła!') {
      if (!stol.cauldron || !s.heroes[stol.cauldron] || s.heroes[stol.cauldron].dead || !((touched[stol.cauldron] || s.heroes[stol.cauldron]).fx || {}).cauldron) {
        h.fx = Object.assign({}, h.fx, { cauldron: 3 }); stol.cauldron = h.id; stol.witchDmg = { r: stol.round || 0, n: 0 };
        sub.push('**' + heroLabel(h) + ' ląduje w kotle**: nie działa, wrogowie nie mogą go atakować, a na początku każdej swojej tury traci k4+1 Zdrowia. Wyjdzie po 3 swoich turach albo gdy drużyna zada Wiedźmie 12 obrażeń w jednej rundzie.');
        ev.push({ id: h.id, k: 'fx', txt: 'DO KOTŁA' });
      }
    }
    if (!h.dead && a.name === 'Pieśń syreny') {
      const rs = resist(st.krzepa, crit);
      if (rs.ok) sub.push(heroLabel(h) + ' odpiera urok Krzepą (k10 = ' + rs.r + ' ≤ ' + st.krzepa + ').');
      else { h.fx = Object.assign({}, h.fx, { charm: 2 }); sub.push('**' + heroLabel(h) + ' jest zauroczony** ' + (crit ? '(krytyk — bez rzutu)' : '(k10 = ' + rs.r + ' > Krzepa ' + st.krzepa + ')') + ': przez 2 swoje tury atakuje losowego sojusznika swoją najmocniejszą umiejętnością.'); ev.push({ id: h.id, k: 'fx', txt: 'ZAUROCZONY' }); }
    }
    if (!h.dead) {
      const rest = a.rest || '';
      const effs = parseEffects(rest);
      const gm = rest.match(/groza (\d)/); if (gm) { h.fx = Object.assign({}, h.fx); addFx(h.fx, 'horror', +gm[1]); sub.push('groza ' + gm[1] + '.'); }
      effs.forEach(ef => {
        if (ef.k === 'mark' || ef.k === 'debuff') { if (ef.k === 'mark') { h.fx = Object.assign({}, h.fx, { mark: 3 }); sub.push('Znak na ' + heroLabel(h) + '.'); } return; }
        if (ef.k === 'stun' && ((h.fx || {}).stun || ((h.fx || {}).stunImm || 0) >= (stol.round || 0))) { sub.push(heroLabel(h) + ' nie może być teraz ogłuszony.'); return; }
        const val = ef.res === 'krzepa' ? st.krzepa : st.odp;
        const rs = resist(val, crit);
        const nm = { bleed: 'krwawienie ' + ef.x, blight: 'zaraza ' + ef.x, stun: 'ogłuszenie', push: 'odrzut ' + ef.x, pull: 'przyciągnięcie ' + ef.x }[ef.k];
        if (rs.ok) { sub.push(heroLabel(h) + ' odpiera ' + nm + ' (k10 = ' + rs.r + ' ≤ ' + val + ').'); return; }
        h.fx = Object.assign({}, h.fx);
        if (ef.k === 'bleed') addFx(h.fx, 'bleed', ef.x + (h.qn.some(q => qname(q.t) === 'Hemofilik') ? 1 : 0));
        if (ef.k === 'blight') addFx(h.fx, 'blight', ef.x);
        if (ef.k === 'stun') h.fx.stun = 1;
        if (ef.k === 'push' || ef.k === 'pull') { const i = stol.heroes.indexOf(h.id); moveInList(stol.heroes, i, ef.k === 'push' ? ef.x : -ef.x); }
        sub.push('**' + nm + '** na ' + heroLabel(h) + (crit ? ' (krytyk — bez rzutu)' : ' (k10 = ' + rs.r + ')') + '.');
      });
      if (/choroba/.test(rest)) {
        const rs = resist(st.odp, crit);
        if (rs.ok) sub.push(heroLabel(h) + ' odpiera chorobę (k10 = ' + rs.r + ').');
        else { const pz = pickD(DATA.diseases); const dz = pz.v; h.diseases = (h.diseases || []).concat([dz]); sub.push('**Choroba** (k10 = ' + rs.r + ' > Odporność ' + st.odp + '; rodzaj ' + pz.t + '): ' + heroLabel(h) + ' — ' + dz + '.'); }
      }
    }
    sub.forEach(x => lines.push(x));
    if (stress && !h.dead) ev.push({ id: h.id, k: 'stress', txt: '+' + stress + ' Stres' });
    if (h.dead) ev.push({ id: h.id, k: 'kill', txt: 'ŚMIERĆ' }); else if (h.dd && h.hp === 0) ev.push({ id: h.id, k: 'kill', txt: 'PRÓG ŚMIERCI' });
    if (sub.length) sum[sumIdx] += ' ' + sub.filter(x => !/^\S+ \+\d+ Stresu/.test(x) || true).join(' ');
    if (sub._deaths) lines._deaths = (lines._deaths || []).concat(sub._deaths);
  });
  rip.forEach(h => {
    if (h.dead || e.hp <= 0 || !stol.enemies.includes(e)) return;
    const r = d(4); const prot = enemyProt(e); const dmg = Math.max(1, r - prot);
    e.hp -= dmg; witchDamage(stol, e, dmg, lines, id => touched[id] || (touched[id] = clone(s.heroes[id])));
    let t = '**Odwet** ' + heroLabel(h) + ': k4 = ' + r + (prot ? ' − Pancerz ' + prot : '') + ' → ' + e.name + ' traci ' + dmg + '.';
    ev.push({ id: e.id, k: 'hit', txt: 'ODWET −' + dmg });
    if (e.hp <= 0) { t += ' **' + e.name + ' pada.**'; ev.push({ id: e.id, k: 'kill', txt: 'PADA' }); killEnemy(stol, e, 'hit'); }
    lines.push(t); sum.push(t);
  });
  heartCheck(stol, lines, id => touched[id] || (touched[id] = clone(s.heroes[id])));
  return { lines, stol, touched, ev, sum, head: e.name + ' — ' + a.name };
}
/* po śmierci bohatera: wypada z szyku, reszta +3 Stres, cmentarz */
function afterDeaths(res) {
  const ids = res.lines._deaths || []; if (!ids.length) return [];
  const ops = []; const st = res.stol || clone(Store.S.stol);
  const rk = () => (st.round || 0) + ':' + st.turn; const wasActed = st.acted === rk();
  ids.forEach(id => {
    st.heroes = st.heroes.filter(x => x !== id);
    /* zgon wypada z kolejki; indeks bieżącej tury przesuwa się, żeby nikt nie został pominięty ani nie działał dwa razy */
    const init = st.init || []; const idx = init.findIndex(x => x.id === id);
    if (idx >= 0) { const cur = idx === st.turn; init.splice(idx, 1); if (idx <= st.turn) st.turn--; if (cur) st.acted = rk(); }
    st.init = init;
    const h = res.touched[id];
    /* błyskotki poległego: wracają do magazynu, jeśli drużyna wygra tę walkę; inaczej przepadają */
    if ((h.trinkets || []).length) {
      if (st.fight) { st.fallen = (st.fallen || []).concat(h.trinkets); res.lines.push('Błyskotki poległego (' + h.trinkets.map(t => t.name).join(', ') + ') wrócą do magazynu, jeśli drużyna wygra tę walkę.'); }
      else res.lines.push('Błyskotki poległego przepadają: ' + h.trinkets.map(t => t.name).join(', ') + '.');
      h.trinkets = [];
    }
    const epit = pick(EPITAPHS);
    ops.push(opSet('osada.cemetery', (Store.S.osada.cemetery || []).concat([{ name: heroLabel(h), cls: CLS[h.cls].name, level: h.level, cause: h.deathCause, week: Store.S.osada.week, origin: h.story ? h.story.origin : '', dream: h.story && !h.story.done ? h.story.dreamText : '', epitaph: epit }])));
  });
  st.heroes.forEach(id => {
    const h = res.touched[id] || (res.touched[id] = clone(Store.S.heroes[id]));
    const friends = ids.filter(id => bondOf(h, id) >= 2).length; const add = 3 * ids.length + 2 * friends;
    const l = []; heroStress(h, add, l); res.lines.push(heroLabel(h) + ' +' + add + ' Stresu (śmierć towarzysza' + (friends ? ', w tym +2 za przyjaciela' : '') + ').'); l.forEach(x => res.lines.push(x));
  });
  if (st.heroes.length) { const sv = res.touched[pick(st.heroes)]; if (sv && !sv.dead) bark(sv, 'allyDeath', res.lines); }
  if (wasActed) st.acted = rk();
  res.stol = st;
  return ops;
}
function commit(res, cls) {
  if (!res) return;
  if (res.stol && res.stol.notes && res.stol.notes.length) { res.stol.notes.forEach(n => res.lines.push(n)); res.sum = (res.sum || []).concat(res.stol.notes); res.stol.notes = []; }
  const ops = afterDeaths(res);
  if (res.ev && res.ev.length) {
    res.stol = res.stol || clone(Store.S.stol);
    res.stol.last = { id: uid(), t: Date.now(), head: res.head || '', sum: res.sum || [], ev: res.ev };
  }
  if (res.stol) ops.push(opSet('stol', res.stol));
  Object.values(res.touched).forEach(h => { if (h) ops.push(opSet('heroes.' + h.id, h)); });
  ops.push({ log: { id: uid(), t: Date.now(), by: byName(), uid: Store.me.id, kind: 'roll', cls: cls || res.lines._cls || '', text: res.lines.join(' ') } });
  Store.act(ops);
  ancestorScan(res.lines.join(' '));
}


/* ---------- Przypadłość przejmuje turę (wynik 1–3) ---------- */
function usableSkills(h, stol, filter) {
  const c = CLS[h.cls]; const pos = stol.heroes.indexOf(h.id) + 1; if (!pos) return [];
  return h.skills.filter(i => {
    const sk = c.skills[i]; if (c.name === 'Ohyda' && sk.form !== (h.form === 'beast' ? 'bestia' : 'człowiek')) return false;
    const inf = skillInfo(c, sk); if (!inf.from.includes(pos)) return false;
    const lim = /2 razy na walkę/.test(sk.eff) ? 2 : /raz na walkę/.test(sk.eff) ? 1 : 0; if (lim && (((h.fx || {}).used || {})[i] || 0) >= lim) return false;
    if (/tylko przy Zdrowiu 4 lub mniej/.test(sk.eff) && h.hp > 4) return false;
    return !filter || filter(inf, sk);
  });
}
function targetsFor(h, idx, stol) {
  const v = skillView(h, idx); const inf = v.inf;
  if (inf.target === 'self' || inf.target === 'party') return [];
  if (inf.target === 'ally') { const al = stol.heroes.filter(id => Store.S.heroes[id] && !Store.S.heroes[id].dead); return [pick(al)]; }
  const list = enemyPositions(stol.enemies).filter(x => !x.e.corpse || true).filter(x => inf.to && inf.to.some(p => p >= x.pos && p <= x.last)).map(x => x.e.id);
  if (!list.length) return null;
  return inf.target === 'multi' ? list : [pick(list)];
}
function afflictionAct(h, stol, touched, lines, ev, sum) {
  const s = Store.S; const name = h.state.name; const rd = stol.round || 0;
  const T = id => id === h.id ? h : (touched[id] || (touched[id] = clone(s.heroes[id])));
  const allies = stol.heroes.filter(id => id !== h.id && s.heroes[id] && !s.heroes[id].dead);
  const opts = { 'Paranoja': ['move', 'accuse', 'refuse'], 'Egoizm': ['skip', 'selfheal', 'noswap'], 'Obłęd': ['random'], 'Lęk': ['retreat'], 'Beznadzieja': ['skip', 'despair', 'refuse'], 'Agresja': ['taunt', 'attack'], 'Masochizm': ['forward', 'selfharm', 'refuse'] }[name] || ['skip'];
  const pa = pickD(opts); let act = pa.v; let follow = null; let say = ''; const pick0 = opts.length > 1 ? ' (zachowanie: ' + pa.t + ')' : '';
  const i0 = stol.heroes.indexOf(h.id);
  if (act === 'selfheal') {
    const hs = usableSkills(h, stol, (inf) => inf.heal && (inf.target === 'self' || inf.target === 'ally'));
    if (hs.length) { follow = { hid: h.id, idx: hs[0], targets: [h.id] }; say = 'leczy tylko siebie: ' + CLS[h.cls].skills[hs[0]].name + '.'; } else act = 'skip';
  }
  if (act === 'random') {
    const us = usableSkills(h, stol); const cand = us.map(i => [i, targetsFor(h, i, stol)]).filter(x => x[1] !== null);
    if (cand.length) { const [i, t] = pick(cand); follow = { hid: h.id, idx: i, targets: t }; say = 'w obłędzie używa losowej umiejętności: ' + CLS[h.cls].skills[i].name + '.'; } else act = 'skip';
  }
  if (act === 'attack') {
    const us = usableSkills(h, stol, inf => inf.attack); const cand = us.map(i => [i, targetsFor(h, i, stol)]).filter(x => x[1] && x[1].length);
    if (cand.length) { const [i, t] = pick(cand); follow = { hid: h.id, idx: i, targets: t }; say = 'atakuje bez rozkazu: ' + CLS[h.cls].skills[i].name + '.'; } else act = 'taunt';
  }
  if (act === 'move') { const n = allies.length ? (i0 > 0 && (i0 === stol.heroes.length - 1 || d(2) === 1) ? -1 : 1) : 0; if (n) moveInList(stol.heroes, i0, n); say = 'nikomu nie ufa i sam zmienia pozycję.'; }
  if (act === 'accuse') { if (allies.length) { const pt = pickD(allies); const t = T(pt.v); heroStress(t, 1, lines); bondAdd(h, t, -1, lines); say = 'rzuca oskarżenia o zdradę — ofiara ' + pt.t + ': ' + heroLabel(t) + ' dostaje +1 Stres.'; ev.push({ id: t.id, k: 'stress', txt: '+1 Stres' }); } else { act = 'skip'; } }
  if (act === 'refuse') { h.fx = Object.assign({}, h.fx, { refuseHeal: rd + 1 }); say = 'odtrąca pomoc: do swojej następnej tury odmawia leczenia.'; }
  if (act === 'noswap') { h.fx = Object.assign({}, h.fx, { noSwap: rd + 1 }); say = 'nie ruszy się dla nikogo: do swojej następnej tury odmawia zamiany pozycji.'; }
  if (act === 'retreat') { moveInList(stol.heroes, i0, 1); say = 'w panice cofa się o pozycję i pomija turę.'; }
  if (act === 'despair') { allies.forEach(id => { const t = T(id); heroStress(t, 1, lines); ev.push({ id, k: 'stress', txt: '+1 Stres' }); }); say = 'mówi, że wszyscy tu zginą — sojusznicy +1 Stres.'; }
  if (act === 'taunt') { if (allies.length) { const pt = pickD(allies); const t = T(pt.v); heroStress(t, 2, lines); bondAdd(h, t, -1, lines); say = 'szydzi z sojusznika — ofiara ' + pt.t + ': ' + heroLabel(t) + ' dostaje +2 Stres.'; ev.push({ id: t.id, k: 'stress', txt: '+2 Stres' }); } else act = 'skip'; }
  if (act === 'forward') { moveInList(stol.heroes, i0, -9); say = 'wysuwa się na sam przód szyku.'; }
  if (act === 'selfharm') { const r = d(4); heroDamage(h, r, lines, 'samookaleczenie'); say = 'rani się sam: ' + obrN(r) + ' (k4 = ' + r + ').'; ev.push({ id: h.id, k: 'hit', txt: '−' + r }); }
  if (act === 'skip') say = 'pomija turę.';
  h.fx = Object.assign({}, h.fx, { lostTurn: rd, lostWhy: 'affl' });
  ev.push({ id: h.id, k: 'fx', txt: name.toUpperCase() });
  const line = '**' + name + '**' + pick0 + ': ' + heroLabel(h) + ' ' + say;
  lines.push(line); sum.push(line + (follow ? '' : ' Gracz nie wykonuje akcji w tej turze.'));
  return follow;
}

/* --- początek tury: krwawienie, zaraza, groza, ogłuszenie, Przypadłość i Cnota --- */
function startTurn(entry) {
  const s = Store.S; const stol = clone(s.stol); const lines = []; const touched = {};
  const tick = fx => {
    let dot = 0, hor = 0;
    ['bleed', 'blight'].forEach(k => { dot += sumDot(fx[k]); fx[k] = (fx[k] || []).map(x => [x[0], x[1] - 1]).filter(x => x[1] > 0); });
    hor = sumDot(fx.horror); fx.horror = (fx.horror || []).map(x => [x[0], x[1] - 1]).filter(x => x[1] > 0);
    ['mark', 'guard'].forEach(k => { if (fx[k]) fx[k]--; });
    fx.buffs = (fx.buffs || []).map(b => [b[0], b[1] - 1]).filter(b => b[1] >= 0);
    if (!fx.buffs.some(b => /^Unik −/.test(b[0]))) delete fx.dodgeDown;
    if (!fx.buffs.some(b => /^Pancerz −/.test(b[0]))) delete fx.protDown;
    return { dot, hor };
  };
  if (entry.k === 'e') {
    const e = stol.enemies.find(x => x.id === entry.id); if (!e) return null;
    e.fx = e.fx || {};
    const { dot } = tick(e.fx);
    if (dot) { e.hp -= dot; lines.push(e.name + ': ' + obrN(dot) + ' od krwawienia i zarazy.'); witchDamage(stol, e, dot, lines, id => touched[id] || (touched[id] = clone(s.heroes[id]))); heartCheck(stol, lines, id => touched[id] || (touched[id] = clone(s.heroes[id]))); if (e.hp <= 0) { lines.push('**' + e.name + ' pada.**'); killEnemy(stol, e, 'dot'); } }
    if (e.fx.stun && !e.corpse && e.hp > 0) {
      e.fx.stun = 0; e.fx.stunImm = (stol.round || 0) + 1; e.fx.lostTurn = stol.round || 0; e.fx.lostWhy = 'stun';
      lines.push('**' + e.name + ' jest ogłuszony i traci turę.**');
      return { lines, stol, touched, ev: [{ id: e.id, k: 'fx', txt: 'OGŁUSZONY' }], sum: [e.name + ' jest ogłuszony i traci turę.'], head: e.name + ' — ogłuszenie', skip: true };
    }
    if (e.corpse || e.hp <= 0) return lines.length ? { lines, stol, touched, skip: true } : { lines: [], stol, touched, quiet: true, skip: true };
    if (!lines.length) return { lines: [], stol, touched, quiet: true };
    return { lines, stol, touched };
  }
  const h = touched[entry.id] = clone(s.heroes[entry.id]); if (!h || h.dead) return null;
  h.fx = h.fx || {};
  /* Klątwa bestii: przy Pochodni 0 działa jak Przypadłość Obłęd */
  const cursed = !h.state && stol.torch === 0 && (h.diseases || []).some(x => /Klątwa bestii/.test(x));
  if (cursed) { h.state = { kind: 'affliction', name: 'Obłęd', temp: true }; lines.push(heroLabel(h) + ': Klątwa bestii w Ciemności działa jak **Obłęd**.'); }
  const res = heroTurnStart(h, entry, stol, lines, touched);
  if (cursed && h.state && h.state.temp) h.state = null;
  return res;
}
function heroTurnStart(h, entry, stol, lines, touched) {
  const s = Store.S;
  const tick = fx => {
    let dot = 0, hor = 0;
    ['bleed', 'blight'].forEach(k => { dot += sumDot(fx[k]); fx[k] = (fx[k] || []).map(x => [x[0], x[1] - 1]).filter(x => x[1] > 0); });
    hor = sumDot(fx.horror); fx.horror = (fx.horror || []).map(x => [x[0], x[1] - 1]).filter(x => x[1] > 0);
    ['mark', 'guard'].forEach(k => { if (fx[k]) fx[k]--; });
    fx.buffs = (fx.buffs || []).map(b => [b[0], b[1] - 1]).filter(b => b[1] >= 0);
    if (!fx.buffs.some(b => /^Unik −/.test(b[0]))) delete fx.dodgeDown;
    if (!fx.buffs.some(b => /^Pancerz −/.test(b[0]))) delete fx.protDown;
    return { dot, hor };
  };
  const { dot, hor } = tick(h.fx);
  if (dot) { lines.push(heroLabel(h) + ': ' + obrN(dot) + ' od krwawienia i zarazy.'); heroDamage(h, dot, lines, 'krwawienie/zaraza'); }
  if (hor && !h.dead) { lines.push(heroLabel(h) + ': groza +' + hor + ' Stresu.'); heroStress(h, hor, lines); }
  if (h.state && h.state.kind === 'ekstaza' && !h.dead && h.hp > 1) { h.hp -= 1; lines.push(heroLabel(h) + ' traci 1 Zdrowia (Ekstaza bólu).'); }
  if (h.fx.cauldron && !h.dead) {
    if (!stol.enemies.some(x => x.name === 'Wiedźma z kotłem' && !x.corpse)) { delete h.fx.cauldron; stol.cauldron = null; lines.push(heroLabel(h) + ' wychodzi z przewróconego kotła.'); }
    else {
      const r = d(4); lines.push('**' + heroLabel(h) + ' w kotle:** k4+1 = **' + (r + 1) + '** (k4 = ' + r + ').'); heroDamage(h, r + 1, lines, 'kocioł Wiedźmy');
      h.fx.cauldron--; h.fx.lostTurn = stol.round || 0; h.fx.lostWhy = 'kocioł';
      if (h.fx.cauldron <= 0 && !h.dead) { delete h.fx.cauldron; stol.cauldron = null; lines.push(heroLabel(h) + ' po 3 turach wydostaje się z kotła (ta tura i tak przepada).'); }
      if (h.dead) stol.cauldron = null;
      return { lines, stol, touched, ev: [{ id: h.id, k: 'fx', txt: 'KOCIOŁ' }], sum: lines.slice(), head: heroLabel(h) + ' — kocioł', skip: true };
    }
  }
  if (h.fx.charm && !h.dead && !h.fx.stun) {
    const ev = [{ id: h.id, k: 'fx', txt: 'ZAUROCZONY' }]; charmAct(h, stol, touched, lines, ev);
    h.fx.charm--; h.fx.lostTurn = stol.round || 0; h.fx.lostWhy = 'urok';
    if (!h.fx.charm) { delete h.fx.charm; lines.push('Urok Syreny mija — ' + heroLabel(h) + ' odzyskuje wolę.'); }
    return { lines, stol, touched, ev, sum: lines.slice(), head: heroLabel(h) + ' — urok Syreny', skip: true };
  }
  if (h.fx.stun && !h.dead) { h.fx.stun = 0; h.fx.stunImm = (stol.round || 0) + 1; h.fx.lostTurn = stol.round || 0; h.fx.lostWhy = 'stun'; lines.push('**' + heroLabel(h) + ' jest ogłuszony i traci turę.**'); return { lines, stol, touched, ev: [{ id: h.id, k: 'fx', txt: 'OGŁUSZONY' }], sum: [heroLabel(h) + ' jest ogłuszony i traci turę.'], head: heroLabel(h) + ' — ogłuszenie', skip: true }; }
  else if (h.state && !h.dead && (h.state.kind === 'affliction' || h.state.kind === 'virtue')) {
    const r = d(10);
    if (h.state.kind === 'affliction') {
      lines.push(heroLabel(h) + ' — Przypadłość ' + h.state.name + ': k10 = **' + r + '**' + (r <= 3 ? ' → **przejmuje turę**.' : ' → gracz działa normalnie, ale odgrywa Przypadłość.'));
      if (r <= 3) { const ev = [], sum = []; const fu = afflictionAct(h, stol, touched, lines, ev, sum); return { lines, stol, touched, ev, sum, head: heroLabel(h) + ' — ' + h.state.name, followUp: fu }; }
    } else {
      const v = DATA.virtues.find(x => x.name === h.state.name);
      lines.push(heroLabel(h) + ' — Cnota ' + h.state.name + ': k10 = **' + r + '**' + (r <= 3 ? ' → **' + (v ? v.proc : '') + '** za darmo.' : ' → nic dodatkowego.'));
      if (r <= 3 && v && /drużyna −1 Stres/.test(v.proc)) stol.heroes.forEach(id => { const t = touched[id] || (touched[id] = clone(s.heroes[id])); heroStress(t, -1, lines); });
      if (r <= 3 && v && /leczy 2 Zdrowia/.test(v.proc)) { heroHeal(h, 2, lines); h.fx.bleed = []; h.fx.blight = []; }
      if (r <= 3 && v && /(Kryt|obrażenia) \+1 do końca rundy/.test(v.proc)) {
        const al = stol.heroes.filter(id => s.heroes[id] && !s.heroes[id].dead); const pq = pickD(al); const tid = pq.v; const t = tid === h.id ? h : (touched[tid] || (touched[tid] = clone(s.heroes[tid])));
        const bt = /Kryt/.test(v.proc) ? 'Kryt +1' : 'obrażenia +1'; t.fx = Object.assign({}, t.fx); t.fx.buffs = (t.fx.buffs || []).concat([[bt, 0]]); lines.push('→ sojusznik ' + pq.t + ': ' + heroLabel(t) + ': ' + bt + ' do końca rundy.');
      }
    }
  }
  if (!lines.length) return { lines: [], stol, touched, quiet: true };
  return { lines, stol, touched };
}

/* ======================= bossowie i tura wroga ======================= */
/* wzór ruchów: pierwsza tura w rundzie — atak sygnaturowy, druga — k6 z wpisu */
const BOSS_AI = {
  'Uczeń Nekromanty': { first: 'Pocisk duszy', table: [[1, 2, 'Wezwanie kości'], [3, 4, 'Pocisk duszy'], [5, 6, 'Klątwa grobu']] },
  'Świński Książę': { first: 'Zgniecenie', table: [[1, 3, 'Zamach cielskiem'], [4, 5, 'Rzut ochłapem'], [6, 6, 'Ryk świni']] },
  'Wiedźma z kotłem': { first: 'Do kotła!', table: [[1, 3, 'Chochla'], [4, 5, 'Złe oko'], [6, 6, 'Chochla']] },
  'Syrena': { first: 'Pieśń syreny', table: [[1, 3, 'Fala'], [4, 5, 'Szept otchłani'], [6, 6, 'Fala']] },
  'Shambler': { first: 'Uderzenie zewsząd', table: [[1, 2, 'Przyzwanie macek'], [3, 4, 'Uderzenie zewsząd'], [5, 6, 'Spojrzenie spoza gwiazd']] },
  'Arcykapłan': { first: 'Ofiara krwi', table: [[1, 2, 'Litania'], [3, 4, 'Ofiara krwi'], [5, 6, 'Mroczne zszycie']] },
  'Templariusz-Wódz': { first: 'Miażdżący cios', table: [[1, 3, 'Przygwożdżenie'], [4, 5, 'Miażdżący cios'], [6, 6, 'Okrzyk wojenny']] },
  'Matka Mięsa': { first: 'Wyrzut ochłapu', table: [[1, 1, 'Porodzenie'], [2, 3, 'Wymiot'], [4, 6, 'Wyrzut ochłapu']] },
  'Serce Ciemności': { first: 'Puls', table: [[1, 2, 'Puls'], [3, 4, 'Spojrzenie pustki'], [5, 5, 'Puls'], [6, 6, 'Spojrzenie pustki']] }
};
/* ruchy bez rzutu na trafienie, które wykonuje się automatycznie */
const SPECIAL_MOVES = ['Wezwanie kości', 'Przyzwanie macek', 'Mroczne zszycie', 'Porodzenie', 'Proporzec', 'Osłona'];
const specialName = n => SPECIAL_MOVES.find(x => n && n.indexOf(x) === 0) || null;
function enemySpecials(e) {
  const out = [];
  (e.attacks || []).forEach(a => { const n = specialName(a.name); if (n && !a.w) out.push(n); });
  (e.notes || []).forEach(t => { const n = specialName(String(t).replace(/\*\*/g, '')); if (n && !out.includes(n)) out.push(n); });
  return out;
}
/* bohaterowie, w których wróg może uderzyć tym atakiem */
function enemyTargets(stol, a) {
  const allowed = posList(a.w) || [1, 2, 3, 4];
  return stol.heroes.map((id, k) => ({ id, pos: k + 1 })).filter(x => allowed.includes(x.pos) && Store.S.heroes[x.id] && !Store.S.heroes[x.id].dead && !((Store.S.heroes[x.id].fx || {}).cauldron)).map(x => x.id);
}
const freeEnemySlots = stol => 4 - stol.enemies.reduce((a, x) => a + (x.size || 1), 0);
/* ruch specjalny wroga: przyzwania, leczenie, Proporzec, Osłona */
function enemySpecial(e0, name) {
  const s = Store.S; const stol = clone(s.stol); const e = stol.enemies.find(x => x.id === e0.id); if (!e) return null;
  const lines = ['**' + e.name + '**: **' + name + '**.']; const ev = [{ id: e.id, k: 'act', txt: name }]; const sum = [];
  const dl = +stol.dl || 0;
  if (name === 'Wezwanie kości') {
    if (freeEnemySlots(stol) <= 0 || (e.summoned || 0) >= 2) return null;
    e.summoned = (e.summoned || 0) + 1;
    const z = makeSummon('Kościany żołdak', dl); stol.enemies.unshift(z); sum.push('Na przód szyku wstaje Kościany żołdak.'); ev.push({ id: z.id, k: 'fx', txt: 'PRZYZWANY' });
  }
  if (name === 'Przyzwanie macek') {
    const n = freeEnemySlots(stol); if (n <= 0) return null;
    for (let i = 0; i < n; i++) stol.enemies.push(makeSummon('Macka'));
    sum.push('Wolne pozycje zajmują Macki (' + n + ').');
  }
  if (name === 'Porodzenie') {
    if (freeEnemySlots(stol) <= 0) return null;
    const o = makeEnemy('Ochłap', 0, { summon: true }); stol.enemies.unshift(o); sum.push('Z przodu staje nowy Ochłap.'); ev.push({ id: o.id, k: 'fx', txt: 'PRZYZWANY' });
  }
  if (name === 'Mroczne zszycie') {
    const living = stol.enemies.filter(x => !x.corpse && x.hp < x.maxhp);
    if (!living.length) return null;
    const t = living.sort((a, b) => (b.maxhp - b.hp) - (a.maxhp - a.hp))[0];
    const big = e.boss; const r = d(big ? 6 : 4); const heal = Math.min(t.maxhp - t.hp, r + (big ? 3 : 2));
    t.hp += heal; sum.push('Najbardziej ranny: ' + t.name + ' odzyskuje ' + heal + ' Zdrowia (k' + (big ? 6 : 4) + ' = **' + r + '** + ' + (big ? 3 : 2) + ').'); ev.push({ id: t.id, k: 'heal', txt: '+' + heal });
  }
  if (name === 'Proporzec') {
    const p = stol.enemies.find(x => x.boss && !x.corpse); if (!p) return null;
    p.fx = Object.assign({}, p.fx); p.fx.buffs = (p.fx.buffs || []).filter(b => !/Proporzec/.test(b[0])).concat([['Celność +1, obrażenia +1 (Proporzec)', 2]]);
    sum.push(p.name + ': Celność +1 i obrażenia +1 na 2 tury.'); ev.push({ id: p.id, k: 'fx', txt: 'PROPORZEC' });
  }
  if (name === 'Osłona') {
    const i = stol.enemies.indexOf(e); const back = stol.enemies.slice(i + 1).filter(x => !x.corpse);
    if (!back.length) return null;
    const t = back[0]; t.fx = Object.assign({}, t.fx, { guard: 2, guardBy: e.id }); sum.push(t.name + ' pod Ochroną (' + e.name + ') przez 2 rundy.'); ev.push({ id: t.id, k: 'fx', txt: 'OCHRONA' });
  }
  sum.forEach(x => lines.push(x));
  return { lines, stol, touched: {}, ev, sum, head: e.name + ' — ' + name };
}
/* cała tura wroga według zasad: wybór ataku kością (boss: wzór ruchów), cel, ruchy specjalne */
function enemyAuto(e0, entry) {
  const s = Store.S; const stol = s.stol; const e = stol.enemies.find(x => x.id === e0.id); if (!e || e.corpse) return null;
  const pre = []; const eps = enemyPositions(stol.enemies); const me = eps.find(x => x.e.id === e.id);
  const atkByName = n => e.attacks.findIndex(a => a.name === n && a.w);
  const usable = idx => idx >= 0 && enemyTargets(stol, e.attacks[idx]).length > 0;
  /* Ucieczka w mrok */
  if (e.name === 'Uczeń Nekromanty' && me && me.pos <= 2 && stol.enemies.indexOf(e) < stol.enemies.length - 1) {
    const st = clone(stol); const i = st.enemies.findIndex(x => x.id === e.id); const [b] = st.enemies.splice(i, 1); st.enemies.push(b);
    return { lines: ['**' + e.name + '**: **Ucieczka w mrok** — zaczyna turę z przodu, więc cofa się na tył zamiast ataku.'], stol: st, touched: {}, ev: [{ id: e.id, k: 'act', txt: 'Ucieczka w mrok' }], sum: ['Cofa się na tył szyku.'], head: e.name + ' — Ucieczka w mrok' };
  }
  /* wróg wypchnięty poza swoje pozycje wraca o 1 */
  const okPos = posList(e.pos);
  if (!e.boss && okPos && me && !okPos.includes(me.pos)) {
    const dir = me.pos > Math.max(...okPos) ? -1 : 1; const i = stol.enemies.indexOf(e); const j = i + dir;
    if (j >= 0 && j < stol.enemies.length) { const st = clone(stol); moveInList(st.enemies, i, dir); return { lines: ['**' + e.name + '** stoi poza swoimi pozycjami (' + e.pos + ') — wraca o 1 miejsce zamiast ataku.'], stol: st, touched: {}, ev: [{ id: e.id, k: 'act', txt: 'powrót na pozycję' }], sum: ['Wraca na swoją pozycję.'], head: e.name + ' — ruch' }; }
  }
  let choice = null; /* {special} albo {idx} */
  if (e.boss && BOSS_AI[e.name]) {
    const ai = BOSS_AI[e.name]; let want;
    const firstNow = !(stol.init || []).slice(0, Math.max(0, stol.turn)).some(x => x.id === e.id);
    if (!entry || firstNow) { want = ai.first; pre.push('Pierwsza tura w rundzie: atak sygnaturowy — **' + want + '**.'); }
    else if (e.nextMove && e.nextMove.round === (stol.round || 0)) { want = e.nextMove.name; pre.push('Druga tura: zapowiedziany ruch (k6 = **' + e.nextMove.r + '**) → **' + want + '**.'); }
    else { const r = d(6); const row = ai.table.find(([a, b]) => r >= a && r <= b); want = row[2]; pre.push('Druga tura: k6 = **' + r + '** → **' + want + '**.'); }
    if (want === 'Do kotła!' && stol.cauldron && s.heroes[stol.cauldron] && !s.heroes[stol.cauldron].dead) { want = 'Chochla'; pre.push('Kocioł jest zajęty — Chochla.'); }
    if (want === 'Pieśń syreny' && stol.heroes.some(id => ((s.heroes[id] || {}).fx || {}).charm)) { want = 'Fala'; pre.push('Ktoś już jest zauroczony — Fala.'); }
    if (want === 'Wezwanie kości' && (e.summoned || 0) >= 2) { want = 'Pocisk duszy'; pre.push('Wezwał już dwa razy w tej walce — Pocisk duszy.'); }
    if (want === 'Wezwanie kości' && freeEnemySlots(stol) <= 0) { want = 'Pocisk duszy'; pre.push('Szyk pełny — Pocisk duszy.'); }
    if (want === 'Przyzwanie macek' && freeEnemySlots(stol) <= 0) { want = 'Uderzenie zewsząd'; pre.push('Nie ma wolnych pozycji — Uderzenie zewsząd.'); }
    if (want === 'Porodzenie' && freeEnemySlots(stol) <= 0) { want = 'Wyrzut ochłapu'; pre.push('Nie ma wolnej pozycji — Wyrzut ochłapu.'); }
    if (want === 'Mroczne zszycie' && !stol.enemies.some(x => !x.corpse && x.hp < x.maxhp)) { want = 'Ofiara krwi'; pre.push('Nikt nie jest ranny — Ofiara krwi.'); }
    if (SPECIAL_MOVES.includes(want)) choice = { special: want };
    else {
      let idx = atkByName(want);
      if (!usable(idx)) { const f = atkByName(ai.first); const alt = usable(f) ? f : e.attacks.findIndex((a, k) => a.w && usable(k)); if (alt >= 0) pre.push(want + ' nie ma kogo dosięgnąć — ' + e.attacks[alt].name + '.'); idx = alt; }
      if (idx >= 0) choice = { idx };
    }
  } else {
    const opts = [];
    e.attacks.forEach((a, k) => { if (a.w && usable(k)) opts.push({ idx: k, name: a.name }); });
    enemySpecials(e).forEach(n => {
      if (n === 'Osłona' && !stol.enemies.slice(stol.enemies.indexOf(e) + 1).some(x => !x.corpse && !(x.fx || {}).guard)) return;
      if (n === 'Mroczne zszycie' && !stol.enemies.some(x => !x.corpse && x.hp < x.maxhp)) return;
      if (n === 'Proporzec' && !stol.enemies.some(x => x.boss && !x.corpse)) return;
      opts.push({ special: n, name: n });
    });
    if (!opts.length) return { lines: ['**' + e.name + '** nie ma kogo zaatakować — pasuje.'], stol: clone(stol), touched: {}, ev: [], sum: [], head: e.name };
    if (opts.length === 1) choice = opts[0];
    else { const pk = pickD(opts); choice = pk.v; pre.push('Wybór ataku: ' + pk.t + ' → **' + pk.v.name + '**.'); }
  }
  if (!choice) return { lines: ['**' + e.name + '** nie ma czego użyć — pasuje.'], stol: clone(stol), touched: {}, ev: [], sum: [], head: e.name };
  let res;
  if (choice.special) { res = enemySpecial(e, choice.special); if (!res) return { lines: pre.concat(['**' + e.name + '**: ' + choice.special + ' nie ma skutku.']), stol: clone(stol), touched: {}, ev: [], sum: [], head: e.name }; }
  else {
    const a = e.attacks[choice.idx]; const inRange = enemyTargets(stol, a);
    let targets, note = '';
    if (a.aoe) targets = inRange;
    else {
      const marked = inRange.filter(id => (s.heroes[id].fx || {}).mark);
      let pool = marked.length ? marked : inRange;
      if (!marked.length && /woli cele z tyłu/.test(a.rest || '')) { const back = pool.filter(id => stol.heroes.indexOf(id) >= 2); if (back.length) pool = back; }
      const pt = pickD(pool); let t = pt.v;
      note = pool.length > 1 ? 'Cel losowany spośród ' + pool.map(x => heroLabel(s.heroes[x])).join(', ') + ': ' + pt.t + ' → ' + heroLabel(s.heroes[t]) + '.' : marked.length ? 'Cel: ' + heroLabel(s.heroes[t]) + ' (Znak).' : '';
      const g = (s.heroes[t].fx || {}); if (g.guard && g.guardBy && stol.heroes.includes(g.guardBy) && s.heroes[g.guardBy] && !s.heroes[g.guardBy].dead) { t = g.guardBy; note += ' Ochrona: atak przejmuje ' + heroLabel(s.heroes[t]) + '.'; }
      targets = [t];
    }
    res = enemyAttack(e, choice.idx, targets);
    if (res && note) { res.lines.splice(1, 0, note); res.sum && res.sum.unshift(note); }
  }
  if (res && pre.length) { res.lines.splice(1, 0, ...pre); res.sum = pre.concat(res.sum || []); }
  return res;
}
/* Wiedźma: 12 obrażeń w jednej rundzie uwalnia z kotła */
function witchDamage(stol, e, dmg, lines, getH) {
  if (e.name !== 'Wiedźma z kotłem' || dmg <= 0) return;
  const r = stol.round || 0; if (!stol.witchDmg || stol.witchDmg.r !== r) stol.witchDmg = { r, n: 0 };
  stol.witchDmg.n += dmg;
  if (stol.cauldron && stol.witchDmg.n >= 12) { const h = getH(stol.cauldron); if (h && h.fx && h.fx.cauldron) { h.fx = Object.assign({}, h.fx); delete h.fx.cauldron; lines.push('Drużyna zadała Wiedźmie ' + stol.witchDmg.n + ' obrażeń w tej rundzie — **' + heroLabel(h) + ' wyrywa się z kotła**.'); } stol.cauldron = null; }
}
/* Serce Ciemności: przy pierwszym spadku do połowy Zdrowia zabiera bohatera */
function heartCheck(stol, lines, getH) {
  const heart = stol.enemies.find(x => x.name === 'Serce Ciemności' && !x.corpse);
  if (!heart || stol.heartTaken || heart.hp > heart.maxhp / 2) return;
  stol.heartTaken = true;
  const alive = stol.heroes.map(id => getH(id)).filter(h => h && !h.dead);
  if (!alive.length) return;
  alive.sort((a, b) => (a.level - b.level) || (a.hp - b.hp));
  const v = alive[0];
  lines.push('**Przyjdź do mnie.** Serce Ciemności spada do połowy Zdrowia i woła — drużyna oddaje mu bohatera z najniższym Poziomem' + (alive[1] && alive[1].level === v.level ? ' (przy remisie: najmniej Zdrowia)' : '') + ': **' + heroLabel(v) + '**.');
  heroDies(v, 'Serce Ciemności', lines);
}

/* zauroczony bohater atakuje losowego sojusznika najmocniejszą umiejętnością */
function charmAct(h, stol, touched, lines, ev) {
  const s = Store.S; const c = CLS[h.cls]; const pos = stol.heroes.indexOf(h.id) + 1;
  const T = id => id === h.id ? h : (touched[id] || (touched[id] = clone(s.heroes[id])));
  const atk = h.skills.map(i => [i, skillView(h, i)]).filter(([i, v]) => v.inf.attack && v.inf.dice && (c.name !== 'Ohyda' || c.skills[i].form === (h.form === 'beast' ? 'bestia' : 'człowiek')));
  const from = atk.filter(([i, v]) => v.inf.from.includes(pos)); const pool = from.length ? from : atk;
  const allies = stol.heroes.filter(id => id !== h.id && s.heroes[id] && !s.heroes[id].dead && !((s.heroes[id].fx || {}).cauldron));
  if (!pool.length || !allies.length) { lines.push('**' + heroLabel(h) + '** (urok Syreny) błądzi wzrokiem i traci turę.'); return; }
  pool.sort((a, b) => diceMax(b[1].inf.dice, b[1].dmgBonus) - diceMax(a[1].inf.dice, a[1].dmgBonus));
  const [idx, v] = pool[0]; const pt = pickD(allies); const t = T(pt.v); const ts = heroStats(t);
  const roll = hitRoll(v.cel - ts.dodge, v.crit);
  let txt = '**' + heroLabel(h) + '** (urok Syreny) atakuje sojusznika — losowanie ' + pt.t + ' → **' + heroLabel(t) + '**, umiejętnością **' + v.s.name + '**: ' + needTxt(roll.r, v.cel, ts.dodge);
  if (roll.res === 'miss') { lines.push(txt + ' → **' + (missKind(roll.r, v.cel) === 'miss' ? 'pudło' : 'unik') + '**.'); ev.push({ id: t.id, k: 'miss', txt: 'PUDŁO' }); return; }
  const crit = roll.res === 'crit'; let dmg = crit ? Math.ceil(diceMax(v.inf.dice, v.dmgBonus) * 1.5) : rollDice(v.inf.dice, v.dmgBonus).total;
  dmg = Math.max(1, dmg - Math.max(0, ts.prot));
  lines.push(txt + ' → **' + (crit ? 'KRYTYK' : 'trafienie') + '**, ' + obrN(dmg) + '.'); ev.push({ id: t.id, k: crit ? 'crit' : 'hit', txt: '−' + dmg });
  heroDamage(t, dmg, lines, 'urok Syreny (' + heroLabel(h) + ')');
}
