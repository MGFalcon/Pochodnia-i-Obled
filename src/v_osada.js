/* Widok Osada: tydzień, skarbiec, budynki, dyliżans, magazyn błyskotek, cmentarz, kopia gry. */
const BUILD = [
  ['Opactwo', ['Popiersie', 'Portret'], '+1 miejsce i +1 do ulgi w Stresie'], ['Gospoda', ['Popiersie', 'Portret'], '+1 miejsce i +1 do ulgi w Stresie'],
  ['Kuźnia', ['Akt', 'Herb'], 'maks. ranga +1 (bez rozbudowy: ranga 1)'], ['Gildia', ['Akt', 'Herb'], 'maks. ranga +1 (bez rozbudowy: ranga 1)'],
  ['Sanatorium', ['Portret', 'Herb'], 'usługi o 1 Z tańsze'], ['Obozownik', ['Portret', 'Herb'], 'usługi o 1 Z tańsze'],
  ['Dyliżans', ['Akt', 'Popiersie'], '+1 rekrut; na stopniu 3 rekruci z Poziomem 1'], ['Wóz Nomadów', ['Akt', 'Popiersie'], 'skup błyskotek za 3/4 wartości']
];
const STEP_COST = [3, 5, 8];
const MEM_PL = { Popiersie: 'Popiersia', Portret: 'Portrety', Akt: 'Akty', Herb: 'Herby' };
function sellValue(t) { const o = Store.S.osada; const base = t.kind === 'class' ? 20 : t.kind === 'rare' ? 15 : t.kind === 'kiel' ? 0 : 10; if (o.event && /Jarmark/.test(o.event)) return base; return Math.floor(base * (o.b['Wóz Nomadów'] >= 1 ? 0.75 : 0.5)); }

VIEWS.osada = {
  render() {
    const o = Store.S.osada; const sel = UI.hbSel || 'Ratusz';
    return `${threatBar()}${hamletDecisionBox()}
      <section class="panel hamlet"><div class="hamlet-pic">${hamletArt(o, sel)}</div>
        <div class="hb-chips" role="group" aria-label="Budynki Osady">${HB_LIST.map(([k, t]) => `<button class="btn sm ${sel === k ? 'gold' : 'ghost'}" data-act="hbSel" data-b="${k}" aria-pressed="${sel === k}">${esc(t)}</button>`).join('')}</div></section>
      ${hbPanel(sel)}`;
  }
};
/* panele budynków: wszystko, co dawniej było listą, teraz pod klikniętym budynkiem */
const HB_DESC = {
  Ratusz: 'Tablica ogłoszeń na placu. Tu wisi wydarzenie tygodnia i rejestr rodu.',
  'Dyliżans': 'Co tydzień przywozi nowych najemników. Za darmo — płaci się później, krwią.',
  Opactwo: 'Kamienne mury, zimne ławy, cisza. Modlitwa i pokuta zdejmują Stres i Przypadłości.',
  Gospoda: 'Ciepło, piwo i karty. Zapomina się tu o lochu — czasem razem ze złotem.',
  Sanatorium: 'Medyk z piłą i słoikami. Leczy choroby, wycina złe dziwactwa, utrwala dobre.',
  'Kuźnia': 'Kowal podnosi rangę broni i pancerza. Ranga najwyżej Poziom + 1 i stopień Kuźni + 1.',
  Gildia: 'Mistrzowie szkolą umiejętności. Ranga najwyżej Poziom + 1 i stopień Gildii + 1.',
  Obozownik: 'Stary traper uczy umiejętności obozowych — za drobną opłatą.',
  'Wóz Nomadów': 'Kupcy skupują i wymieniają błyskotki. Tu leży też magazyn rodu.',
  Cmentarz: 'Tu leżą ci, którzy nie wrócili. MG odczytuje ich imiona na początku sesji.',
  'Posiadłość': 'Ruina na wzgórzu, którą ród próbuje odzyskać. W jej piwnicy jest skarbiec.'
};
function hbUpgrade(n) {
  const o = Store.S.osada; const W = Store.canWrite(); const def = BUILD.find(b => b[0] === n); if (!def) return '';
  const [, types, eff] = def; const l = o.b[n] || 0;
  return `<div class="hb-up"><div class="bh"><b>Rozbudowa</b><span class="steps">${[1, 2, 3].map(i => `<i class="${i <= l ? 'on' : ''}"></i>`).join('')}</span></div>
    <div class="small dim">Każdy stopień: ${esc(eff)}. Płacisz pamiątkami: ${types.map(t => MEM_PL[t]).join(' i ')} (masz ${types.map(t => (o.mem[t] || 0) + ' ' + MEM_PL[t].toLowerCase()).join(', ')}).</div>
    ${W && l < 3 ? `<button class="btn sm" data-act="build" data-n="${n}">Rozbuduj: ${STEP_COST[l]} pamiątek</button>` : l >= 3 ? '<span class="chip sm gold">pełna rozbudowa</span>' : ''}</div>`;
}
const townHeroes = () => liveHeroes().filter(h => h.status !== 'wyprawa').sort((a, b) => b.stress - a.stress);
function hbHeroRow(h, inner) {
  const busy = heroBusy(h);
  return `<div class="hb-hero"><div class="hb-hn">${portraitHtml(h, 'sw-pt')}<div><b>${esc(heroLabel(h))}</b><div class="small dim">${esc(CLS[h.cls].name)} · Poz. ${h.level} · Stres <b class="${h.stress >= 10 ? 'warn' : ''}">${h.stress}</b>${h.state && h.state.kind !== 'virtue' ? ' · ' + esc(h.state.name) : ''}</div>${busy ? `<div class="small muted">${esc(busy)}</div>` : ''}</div></div><div class="hb-ha">${canHero(h) ? inner : '<span class="small muted">bohater innego gracza</span>'}</div></div>`;
}
function hbPanel(n) {
  const o = Store.S.osada; const gm = Store.isGM(); const W = Store.canWrite(); const b = o.b;
  const head = (t, hint) => `<h2>${esc(t)}${hint ? ` <span class="hint">${hint}</span>` : ''}</h2><p class="hb-desc">${esc(HB_DESC[n] || '')}</p>`;
  let body = '';
  if (n === 'Ratusz') {
    body = `${head('Tablica ogłoszeń', 'tydzień ' + o.week)}
      ${o.event ? `<p><b>Wydarzenie:</b> ${esc(o.event)}</p>` : '<p class="muted">Wydarzenie tygodnia jeszcze nie wylosowane.</p>'}
      ${o.cultists ? '<p class="small warn">Kultyści na trakcie: następna wyprawa ma dodatkową walkę w pierwszym korytarzu.</p>' : ''}${o.rumor ? '<p class="small">Plotka: następna wyprawa ma +1 rzut na łup.</p>' : ''}
      ${gm ? `<div class="row"><button class="btn primary" data-act="newWeek">Nowy tydzień</button><span class="small muted">wydarzenie k10, dyliżans, koniec leczenia, nowa tablica zadań</span></div>` : ''}
      <p class="small">Zadania na tablicy: <b>${(o.board || []).length}</b> — świecą na mapie posiadłości w zakładce Wyprawa.</p>
      <div class="hb-up"><div class="bh"><b>Rejestr rodu</b><span class="num">${liveHeroes().length} / ${o.slots} miejsc</span></div><div class="small dim">+3 miejsca za 4 pamiątki dowolnego typu</div>${W ? `<button class="btn sm" data-act="slots">Powiększ</button>` : ''}</div>`;
  } else if (n === 'Dyliżans') {
    body = `${head('Dyliżans', 'rejestr ' + liveHeroes().length + '/' + o.slots)}
      ${(o.recruits || []).map((r, i) => `<div class="recruit">${classPortraitSvg(r.cls, 'sw-pt')}<div><b>${esc(CLS[r.cls].name)}</b> <span class="muted">Poz. ${r.level} · k20 = ${r.roll}</span><div class="small dim">${esc(CLS[r.cls].role || '')} · ${esc(r.qp)}; ${esc(r.qn)}</div></div>${W ? ` <button class="btn sm" data-act="hire" data-i="${i}">Przyjmij</button>` : ''}</div>`).join('') || '<p class="muted small">Dyliżans przyjedzie z nowym tygodniem.</p>'}
      ${hbUpgrade('Dyliżans')}`;
  } else if (n === 'Opactwo' || n === 'Gospoda') {
    const closedTxt = n === 'Gospoda' && o.eventR === 5 ? 'Gospoda zamknięta w tym tygodniu (pożar).' : o.raidClosed && o.raidClosed.week === o.week && o.raidClosed.b === n ? n + ' spalone w napadzie — zamknięte do końca tygodnia.' : '';
    body = `${head(n, 'Stres −(k6+' + (4 + (b[n] || 0)) + '), usuwa Przypadłość · bohater opuszcza najbliższą wyprawę')}
      ${closedTxt ? `<p class="warn">${esc(closedTxt)}</p>` : ''}${n === 'Opactwo' && o.eventR === 1 ? '<p class="small">Procesja pokutników: usługi o 2 Z tańsze.</p>' : ''}
      <p class="small dim">Wolne miejsca w tym tygodniu: ${SVC[n].map(sub => { const sl = 2 + (b[n] || 0); return sub + ' ' + Math.max(0, sl - ((o.svc || {})[sub] || 0)) + '/' + sl; }).join(' · ')}. Przy każdej usłudze k10 = 1 oznacza skutek uboczny. Skarbiec: ${o.gold} Z.</p>
      <div class="hb-heroes">${townHeroes().map(h => hbHeroRow(h, SVC[n].map(sub => { const v = svcState(h, n, sub); return `<button class="btn sm" data-act="hbAct" data-a="service" data-hid="${h.id}" data-b="${n}" data-s="${sub}" ${v.ok && W ? '' : 'disabled'} title="${esc(v.ok ? 'Wyślij: ' + sub : v.why)}">${sub} <span class="num">${v.cost} Z</span></button>`; }).join(''))).join('') || '<p class="muted small">W Osadzie nie ma bohaterów.</p>'}</div>
      ${hbUpgrade(n)}`;
  } else if (n === 'Sanatorium') {
    const sanCost = x => Math.max(1, x - (b.Sanatorium || 0)); const closed = o.eventR === 3;
    body = `${head('Sanatorium', 'choroba ' + sanCost(5) + ' Z · złe dziwactwo ' + sanCost(8) + ' Z · utrwalenie ' + sanCost(6) + ' Z')}
      ${closed ? '<p class="warn">Zaraza w osadzie — Sanatorium zamknięte w tym tygodniu.</p>' : ''}
      <div class="hb-heroes">${townHeroes().map(h => { const busy = heroBusy(h); const dis = closed || busy || !W; return hbHeroRow(h, `<div class="small dim hb-q">${h.diseases.length ? 'choroby: ' + esc(h.diseases.join(', ')) : 'zdrowy'}${h.qn.length ? ' · złe: ' + esc(h.qn.map(q => q.t + (q.lock ? ' (utrwalone)' : '')).join(', ')) : ''}</div>
        <button class="btn sm ghost" data-act="hbAct" data-a="sanat" data-hid="${h.id}" data-w="disease" ${h.diseases.length && !dis ? '' : 'disabled'}>lecz chorobę</button><button class="btn sm ghost" data-act="hbAct" data-a="sanat" data-hid="${h.id}" data-w="quirk" ${h.qn.some(q => !q.lock) && !dis ? '' : 'disabled'}>usuń złe dziwactwo</button><button class="btn sm ghost" data-act="hbAct" data-a="sanat" data-hid="${h.id}" data-w="lock" ${h.qp.some(q => !q.lock) && !dis ? '' : 'disabled'}>utrwal dobre</button>`); }).join('') || '<p class="muted small">W Osadzie nie ma bohaterów.</p>'}</div>
      ${hbUpgrade('Sanatorium')}`;
  } else if (n === 'Kuźnia' || n === 'Gildia') {
    const keys = n === 'Kuźnia' ? [['weapon', 'Broń'], ['armor', 'Pancerz']] : [['guild', 'Umiejętności']]; const c0 = n === 'Kuźnia' ? 6 : 8; const drunk = n === 'Kuźnia' && o.eventR === 8;
    body = `${head(n, n === 'Kuźnia' ? 'Broń: obrażenia +1 na randze 2 i 4 · Pancerz: Zdrowie +1 za rangę' : 'ranga 1 i 3: Celność +1 · 2: Kryt +1 · 4: główna liczba +1')}
      ${drunk ? '<p class="small warn">Pijany kowal: o połowę taniej, ale przy k10 1–3 złoto przepada.</p>' : ''}
      <div class="hb-heroes">${townHeroes().map(h => { const mx = maxRank(h, b[n]); return hbHeroRow(h, keys.map(([k, t]) => { const r = h.gear[k] || 0; const cost = drunk ? Math.ceil(c0 * (r + 1) / 2) : c0 * (r + 1); return `<span class="hb-rank"><span class="lbl">${t}</span><span class="steps">${[1, 2, 3, 4].map(i => `<i class="${i <= r ? 'on' : ''} ${i > mx ? 'lock' : ''}"></i>`).join('')}</span>${r < 4 ? `<button class="btn sm" data-act="hbAct" data-a="rankBuy" data-hid="${h.id}" data-k="${k}" data-b="${n}" data-c="${c0}" ${r + 1 <= mx && W ? '' : 'disabled'} title="${r + 1 > mx ? 'Zablokowane: najwyżej Poziom + 1 i stopień budynku + 1' : ''}">ranga ${r + 1}: ${cost} Z</button>` : '<span class="chip sm gold">ranga 4</span>'}</span>`; }).join('')); }).join('') || '<p class="muted small">W Osadzie nie ma bohaterów.</p>'}</div>
      ${hbUpgrade(n)}`;
  } else if (n === 'Obozownik') {
    body = `${head('Obozownik', 'nauka: ' + Math.max(1, 4 - (b.Obozownik || 0)) + ' Z za umiejętność')}
      <p class="small dim">${LEARN_CAMP.map(x => '<b>' + esc(x.name) + '</b> — ' + esc(x.eff)).join(' · ')}</p>
      <div class="hb-heroes">${townHeroes().map(h => { const cost = Math.max(1, 4 - (b.Obozownik || 0)); const busy = heroBusy(h); return hbHeroRow(h, LEARN_CAMP.map(x => h.camp.includes(x.name) ? `<span class="chip sm gold" title="${esc(x.eff)}">✓ ${esc(x.name)}</span>` : `<button class="btn sm" data-act="campLearn" data-hid="${h.id}" data-n="${esc(x.name)}" ${W && !busy ? '' : 'disabled'} title="${esc(busy || x.eff)}">${esc(x.name)} <span class="num">${cost} Z</span></button>`).join('')); }).join('') || '<p class="muted small">W Osadzie nie ma bohaterów.</p>'}</div>
      ${hbUpgrade('Obozownik')}`;
  } else if (n === 'Wóz Nomadów') {
    body = `${head('Wóz Nomadów', 'magazyn błyskotek rodu')}
      ${(o.trinkets || []).map((t, i) => `<div class="trk"><b>${esc(t.name)}</b> <span class="dim small">${esc(trinketDesc(t))}</span>${W ? ` <span class="row">${t.kind === 'class' && t.skill == null ? `<button class="btn sm gold" data-act="trkSkill" data-i="${i}">Wybierz umiejętność</button>` : `<button class="btn sm ghost" data-act="trkGive" data-i="${i}">Przekaż</button>`}${t.kind !== 'kiel' ? `<button class="btn sm ghost" data-act="trkSell" data-i="${i}">Sprzedaj za ${sellValue(t)} Z</button>` : ''}</span>` : ''}</div>`).join('') || '<p class="muted">Pusto. Błyskotki znajdziecie tylko w ukrytych komnatach.</p>'}
      ${W ? `<div class="row"><button class="btn sm ghost" data-act="trkSwap">Wymień 2 → 1</button>${gm ? '<button class="btn sm ghost" data-act="trkRoll">Losuj błyskotkę (MG)</button><button class="btn sm ghost" data-act="trkAdd">Dodaj ręcznie (MG)</button>' : ''}</div>` : ''}
      ${hbUpgrade('Wóz Nomadów')}`;
  } else if (n === 'Cmentarz') {
    body = `${head('Cmentarz', (o.cemetery || []).length + ' grobów')}
      ${(o.cemetery || []).length ? `<ul class="cem">${o.cemetery.map(c => `<li><b>${esc(c.name)}</b> <span class="dim">${esc(c.cls)}, Poziom ${c.level}</span> <span class="muted small">— ${esc(c.cause || '')}${c.week ? ', tydzień ' + c.week : ''}</span>${c.origin ? `<br><span class="small dim">${esc(c.origin)}${c.dream ? '; nie zdążył(a) spełnić marzenia: ' + esc(c.dream.replace(/^chce /, '')) : ''}.</span>` : ''}${c.epitaph ? `<br><i class="small">${esc(c.epitaph)}</i>` : ''}</li>`).join('')}</ul>` : '<p class="muted">Nikt jeszcze nie spoczął. Jeszcze.</p>'}`;
  } else if (n === 'Posiadłość') {
    body = `${head('Posiadłość — skarbiec')}
      <div class="treasury"><div class="gold"><span class="lbl">Złoto</span>${gm ? `<input type="number" id="ogold" data-bind="osada.gold" data-num value="${o.gold}" style="width:6em">` : `<b class="num">${o.gold}</b>`}</div>
        ${Object.keys(MEM_PL).map(k => `<div class="memo"><span class="lbl">${MEM_PL[k]}</span><span class="row">${gm ? `<button class="btn sm ghost" data-act="memAdj" data-k="${k}" data-v="-1">−</button>` : ''}<b class="num">${o.mem[k] || 0}</b>${gm ? `<button class="btn sm ghost" data-act="memAdj" data-k="${k}" data-v="1">+</button>` : ''}</span></div>`).join('')}</div>
      <p class="small muted">Złoto i pamiątki są wspólne — to kasa rodu, nie bohaterów.</p>
      ${gm ? `<div class="ph">Kopia gry <span class="hint">dla MG</span></div><p class="dim small">Zapisz kopię całej kampanii do pliku (bohaterowie, osada, wyprawa, dziennik). Wczytaniem przeniesiesz kampanię między stołem Claude a Twoją stroną.</p>
        <div class="row"><button class="btn" data-act="exportAll">Zapisz kopię do pliku</button><button class="btn ghost" data-act="copyAll">Kopiuj jako tekst</button><button class="btn ghost" data-act="importAll">Wczytaj kopię</button><span class="sp"></span><button class="btn ghost" data-act="resetAll">Nowa kampania</button></div>` : ''}`;
  }
  return `<section class="panel hb-panel">${body}</section>`;
}
Object.assign(ACT, {
  hbSel: el => { UI.hbSel = el.dataset.b; renderView(); const p = document.querySelector('.hb-panel'); if (p && window.innerWidth < 900) p.scrollIntoView({ behavior: 'smooth', block: 'start' }); },
  hbAct: el => { UI.heroSel = el.dataset.hid; const fn = ACT[el.dataset.a]; if (fn) fn(el); },
  hbHero: el => { UI.heroSel = el.dataset.hid; location.hash = '#bohaterowie'; }
});

function addToMag(t, why) {
  Store.act([opSet('osada.trinkets', (Store.S.osada.trinkets || []).concat([t]))]);
  rollLog((why ? why + ' ' : '') + 'Do magazynu trafia: **' + t.name + '** (' + trinketDesc(t) + ').', 'good', 'sys');
}
function classTrinketDialog(clsIdx, why) {
  const c = CLS[clsIdx];
  const ok = c.skills.map((s, i) => [s, i]).filter(([s]) => skillInfo(c, s).main);
  modal(`<h3>Błyskotka klasowa: ${esc(c.name)}</h3><p class="dim">Wybierzcie umiejętność, która zadaje obrażenia, leczy albo zdejmuje Stres. Dostanie +1 do swojej liczby.</p>
    <div class="flist">${ok.map(([s, i]) => `<label class="chk"><input type="radio" name="cts" value="${i}"> <b>${esc(s.name)}</b> <span class="dim small">${esc(s.obr || '')} ${esc(s.eff)}</span></label>`).join('')}</div>`,
    [{ t: 'Anuluj' }, { t: 'Zapisz', cls: 'primary', fn: () => {
      const r = $('input[name=cts]:checked'); if (!r) { toast('Wybierz umiejętność.'); return false; }
      addToMag({ kind: 'class', cls: clsIdx, skill: +r.value, name: 'Pamiątka mistrza: ' + c.name, value: 20 }, why);
    } }]);
}
Object.assign(ACT, {
  newWeek: () => {
    const o = clone(Store.S.osada); if (o.started || o.week > 1) o.week++; o.started = true;
    const ev = rollTable('osada'); o.event = ev.text; o.eventR = ev.r; o.svc = {};
    if (ev.r === 6) o.gold += 10;
    if (ev.r === 9) o.cultists = true;
    const n = 3 + (o.b['Dyliżans'] || 0); const lvl = (o.b['Dyliżans'] || 0) >= 3 ? 1 : 0;
    o.recruits = Array.from({ length: n }, () => { let r; do { r = d(20); } while (r > 17); return { cls: r - 1, roll: r, level: lvl, qp: pick(DATA.quirks_pos), qn: pick(DATA.quirks_neg) }; });
    if (ev.r === 4) o.recruits[0].level = 2;
    const tl = [];
    if (o.debt && o.week >= o.debt.week) { if (o.gold >= o.debt.amount) { o.gold -= o.debt.amount; tl.push('Lichwiarz odbiera ' + o.debt.amount + ' Złota.'); } else { tl.push('**Lichwiarz** przychodzi po ' + o.debt.amount + ' Złota, a w skarbcu jest ' + o.gold + '. Zabiera wszystko, a jego ludzie straszą bohaterów: każdy +2 Stres.'); o.gold = 0; o.debtStress = true; } o.debt = null; }
    threatTick(o, tl);
    { const live = liveHeroes(); const okD = HAMLET_DECISIONS.filter(D => D.key === 'wdowa' ? (o.cemetery || []).length > 0 : D.key === 'medyk' ? live.some(h => (h.diseases || []).length) : D.key === 'zlodziej' ? (o.trinkets || []).length > 0 : D.key === 'lichwiarz' ? !o.debt : true);
      o.decision = (o.questsDone || 0) >= 1 && okD.length && d(10) <= 7 ? { id: uid(), key: pick(okD).key } : null; }
    const ops = [opSet('osada', o)]; const notes = tl.slice();
    /* tydzień w Osadzie: koniec leczenia, powroty, pełne Zdrowie, Niespokojne sny */
    liveHeroes().filter(h => h.status !== 'wyprawa').forEach(h => {
      const h2 = clone(h); let ch = false;
      if (h2.status === 'leczenie') { h2.status = 'osada'; ch = true; }
      if (h2.status === 'przepadł' && (h2.awayUntil || 0) <= o.week) { h2.status = 'osada'; h2.awayUntil = 0; ch = true; notes.push(heroLabel(h2) + ' wraca do Osady.'); }
      if (h2.ban && h2.ban.until <= o.week) { h2.ban = null; ch = true; }
      const mx = heroStats(h2).maxhp; if (h2.hp < mx || h2.dd || h2.exhausted) { h2.hp = mx; h2.dd = false; h2.exhausted = false; h2.exh = 0; ch = true; }
      if (ev.r === 7) { const l = []; heroStress(h2, 1, l); ch = true; }
      if (o.debtStress) { const l = []; heroStress(h2, 2, l); ch = true; }
      if (ch) ops.push(opSet('heroes.' + h.id, h2));
    });
    o.debtStress = false;
    if (o.decision) notes.push('Decyzja tygodnia: **' + HAMLET_DECISIONS.find(x => x.key === o.decision.key).title + '** (zakładka Osada).');
    ops.push({ log: { id: uid(), t: Date.now(), by: byName(), uid: Store.me.id, kind: 'sys', text: '**Tydzień ' + o.week + '.** Wydarzenie: k10 = ' + ev.r + ' → ' + ev.text + '. Dyliżans przywozi ' + n + ' rekrutów. Bohaterowie w Osadzie wracają do pełnego Zdrowia.' + (notes.length ? ' ' + notes.join(' ') : '') } });
    Store.act(ops);
    rollBoard();
  },
  hire: el => {
    const o = Store.S.osada; if (liveHeroes().length >= o.slots) return toast('Rejestr jest pełny — powiększ go albo zwolnij miejsce.');
    const r = o.recruits[+el.dataset.i]; const h = newHero(r.cls, { level: r.level }); h.qp = [{ t: r.qp, lock: false }]; h.qn = [{ t: r.qn, lock: false }];
    h.hp = heroStats(h).maxhp; h.owner = Store.isGM() ? null : Store.me.id; h.ownerName = Store.me.name;
    const rec = o.recruits.slice(); rec.splice(+el.dataset.i, 1);
    Store.act([opSet('heroes.' + h.id, h), opSet('osada.recruits', rec), { log: { id: uid(), t: Date.now(), by: byName(), uid: Store.me.id, kind: 'sys', text: 'Do rejestru dołącza: **' + CLS[r.cls].name + '** (Poziom ' + r.level + ').' } }]);
  },
  memAdj: el => { if (!Store.isGM()) return; const k = el.dataset.k; Store.act([opSet('osada.mem.' + k, Math.max(0, (Store.S.osada.mem[k] || 0) + +el.dataset.v))]); },
  build: el => {
    const n = el.dataset.n; const B = BUILD.find(x => x[0] === n); const o = Store.S.osada; const lv = o.b[n] || 0; const cost = STEP_COST[lv];
    const [a, b] = B[1]; const ha = o.mem[a] || 0, hb = o.mem[b] || 0;
    if (ha + hb < cost) return toast('Potrzeba ' + cost + ' pamiątek (' + MEM_PL[a] + ' i ' + MEM_PL[b] + '), a jest ' + (ha + hb) + '.');
    const ua = Math.min(ha, Math.max(cost - hb, Math.ceil(cost / 2))), ub = cost - ua;
    modal(`<h3>${n}: stopień ${lv + 1}</h3><p>Koszt: ${cost} pamiątek. Ile każdego typu?</p>
      <div class="row"><label>${MEM_PL[a]} <input type="number" id="ba" min="0" max="${ha}" value="${Math.min(ua, ha)}" style="width:4.5em"></label><label>${MEM_PL[b]} <input type="number" id="bb" min="0" max="${hb}" value="${Math.min(ub, hb)}" style="width:4.5em"></label></div>`,
      [{ t: 'Anuluj' }, { t: 'Rozbuduj', cls: 'primary', fn: () => {
        const x = +$('#ba').value, y = +$('#bb').value;
        if (x + y !== cost || x > ha || y > hb || x < 0 || y < 0) { toast('Razem musi być dokładnie ' + cost + ', w granicach tego, co macie.'); return false; }
        const o2 = clone(Store.S.osada); o2.mem[a] -= x; o2.mem[b] -= y; o2.b[n] = lv + 1;
        Store.act([opSet('osada', o2), { log: { id: uid(), t: Date.now(), by: byName(), uid: Store.me.id, kind: 'sys', text: '**' + n + '** rozbudowany do stopnia ' + (lv + 1) + '.' } }]);
      } }]);
  },
  slots: () => {
    const o = clone(Store.S.osada); let need = 4; const tot = Object.values(o.mem).reduce((a, b) => a + b, 0);
    if (tot < 4) return toast('Potrzeba 4 pamiątek dowolnego typu.');
    Object.keys(o.mem).sort((a, b) => o.mem[b] - o.mem[a]).forEach(k => { const t = Math.min(o.mem[k], need); o.mem[k] -= t; need -= t; });
    o.slots += 3; Store.act([opSet('osada', o)]); rollLog('Rejestr powiększony do ' + o.slots + ' miejsc.', '', 'sys');
  },
  trkSkill: el => {
    const i = +el.dataset.i; const t = Store.S.osada.trinkets[i]; const c = CLS[t.cls];
    const ok = c.skills.map((s, k) => [s, k]).filter(([s]) => skillInfo(c, s).main);
    modal(`<h3>${esc(t.name)}</h3><p class="dim">Wybierzcie umiejętność, która dostanie +1 do swojej liczby.</p><div class="flist">${ok.map(([s, k]) => `<label class="chk"><input type="radio" name="cts2" value="${k}"> <b>${esc(s.name)}</b> <span class="dim small">${esc(s.obr || '')} ${esc(s.eff)}</span></label>`).join('')}</div>`,
      [{ t: 'Anuluj' }, { t: 'Zapisz', cls: 'primary', fn: () => { const r = $('input[name=cts2]:checked'); if (!r) { toast('Wybierz umiejętność.'); return false; } const m = clone(Store.S.osada.trinkets); m[i].skill = +r.value; Store.act([opSet('osada.trinkets', m)]); } }]);
  },
  trkRoll: () => {
    const k = rollTable('blyskotka');
    if (k.r <= 5) { const r = d(6); const t = DATA.trinkets.common[r - 1]; return addToMag(Object.assign({ kind: 'common', value: 10 }, t), 'Rodzaj k10 = ' + k.r + ' (zwykła), k6 = ' + r + '.'); }
    if (k.r <= 9) { const r = d(6); const t = DATA.trinkets.rare[r - 1]; return addToMag(Object.assign({ kind: 'rare', value: 15 }, t), 'Rodzaj k10 = ' + k.r + ' (rzadka), k6 = ' + r + '.'); }
    const p = d(4); const hid = Store.S.stol.heroes[p - 1]; const h = hid && H(hid);
    rollLog('Rodzaj k10 = 10: **błyskotka klasowa**. k4 = ' + p + (h ? ' → ' + heroLabel(h) + ' (' + CLS[h.cls].name + ')' : ' → na tej pozycji nikt nie stoi, wybierzcie klasę'), 'crit', 'sys');
    if (h) classTrinketDialog(h.cls, 'Klasowa:');
    else modal(`<h3>Klasa błyskotki</h3><select id="ctc">${CLS.map((c, i) => `<option value="${i}">${esc(c.name)}</option>`).join('')}</select>`, [{ t: 'Dalej', cls: 'primary', fn: () => { const v = +$('#ctc').value; setTimeout(() => classTrinketDialog(v, 'Klasowa:'), 0); } }]);
  },
  trkAdd: () => {
    const all = ALL_TRINKETS();
    modal(`<h3>Dodaj błyskotkę</h3><select id="tadd">${all.map((t, i) => `<option value="${i}">${esc(t.name)} — ${esc(t.plus)}</option>`).join('')}<option value="class">błyskotka klasowa…</option></select>`,
      [{ t: 'Anuluj' }, { t: 'Dodaj', cls: 'primary', fn: () => {
        const v = $('#tadd').value;
        if (v === 'class') { setTimeout(() => modal(`<h3>Klasa błyskotki</h3><select id="ctc">${CLS.map((c, i) => `<option value="${i}">${esc(c.name)}</option>`).join('')}</select>`, [{ t: 'Dalej', cls: 'primary', fn: () => { const c = +$('#ctc').value; setTimeout(() => classTrinketDialog(c), 0); } }]), 0); return; }
        addToMag(all[+v]);
      } }]);
  },
  trkGive: el => {
    const t = Store.S.osada.trinkets[+el.dataset.i];
    const ok = liveHeroes().filter(h => h.trinkets.length < 2 && !h.trinkets.some(x => x.name === t.name) && (t.kind !== 'class' || t.cls === h.cls));
    if (!ok.length) return toast('Nikt nie może teraz założyć tej błyskotki (limit 2, bez powtórzeń' + (t.kind === 'class' ? ', tylko ' + CLS[t.cls].name : '') + ').');
    modal(`<h3>${esc(t.name)}</h3><select id="tgh">${ok.map(h => `<option value="${h.id}">${esc(heroLabel(h))} — ${esc(CLS[h.cls].name)}</option>`).join('')}</select>`,
      [{ t: 'Anuluj' }, { t: 'Przekaż', cls: 'primary', fn: () => {
        const h = clone(H($('#tgh').value)); h.trinkets.push(t); const m = Store.S.osada.trinkets.slice(); m.splice(+el.dataset.i, 1);
        const dl = []; dreamCheck(h, dl, 'trinket');
        Store.act([opSet('heroes.' + h.id, h), opSet('osada.trinkets', m)]); if (dl.length) rollLog(dl.join(' '), 'good', 'sys');
      } }]);
  },
  trkSell: el => {
    const i = +el.dataset.i; const t = Store.S.osada.trinkets[i]; const v = sellValue(t);
    confirmBox('Sprzedać ' + t.name + '?', 'Wóz Nomadów płaci ' + v + ' Złota.', 'Sprzedaj', () => {
      const m = Store.S.osada.trinkets.slice(); m.splice(i, 1);
      Store.act([opSet('osada.trinkets', m), opSet('osada.gold', Store.S.osada.gold + v)]); rollLog('Wóz Nomadów kupuje ' + t.name + ' za ' + v + ' Złota.', '', 'sys');
    });
  },
  trkSwap: () => {
    const m = Store.S.osada.trinkets || [];
    modal(`<h3>Wymiana na Wozie</h3><p class="dim">Zaznacz dwie błyskotki tej samej rzadkości. Dostaniecie jedną losową tej rzadkości.</p>
      <div class="flist">${m.map((t, i) => t.kind === 'common' || t.kind === 'rare' ? `<label class="chk"><input type="checkbox" value="${i}"> ${esc(t.name)} <span class="muted small">${t.kind === 'rare' ? 'rzadka' : 'zwykła'}</span></label>` : '').join('')}</div>`,
      [{ t: 'Anuluj' }, { t: 'Wymień', cls: 'primary', fn: () => {
        const ids = $$('.flist input:checked').map(x => +x.value);
        if (ids.length !== 2 || m[ids[0]].kind !== m[ids[1]].kind) { toast('Zaznacz dokładnie dwie błyskotki tej samej rzadkości.'); return false; }
        const kind = m[ids[0]].kind; const r = d(6); const t = Object.assign({ kind, value: kind === 'rare' ? 15 : 10 }, DATA.trinkets[kind][r - 1]);
        const m2 = m.filter((x, i) => !ids.includes(i)).concat([t]);
        Store.act([opSet('osada.trinkets', m2)]); rollLog('Wymiana na Wozie: ' + m[ids[0]].name + ' i ' + m[ids[1]].name + ' → k6 = ' + r + ': **' + t.name + '**.', 'good', 'sys');
      } }]);
  },
  exportAll: () => saveFile('pochodnia-kampania-tydzien-' + Store.S.osada.week + '.json', JSON.stringify({ gra: 'Pochodnia i Obłęd', wersja: 1, S: Store.S, G: Store.G }, null, 1)),
  copyAll: () => copyText(JSON.stringify({ gra: 'Pochodnia i Obłęd', wersja: 1, S: Store.S, G: Store.G })),
  importAll: () => importDialog(data => {
    if (!data || !data.S) throw new Error('zły plik');
    const S = Object.assign(DEFAULT_S(), data.S);
    const ops = [opSet('stol', S.stol), opSet('wyprawa', S.wyprawa), opSet('osada', S.osada)];
    Object.keys(Store.S.heroes).forEach(id => { if (!S.heroes[id]) ops.push(opDel('heroes.' + id)); });
    Object.values(S.heroes).forEach(h => ops.push(opSet('heroes.' + h.id, h)));
    Store.act(ops);
    if (data.G) Store.actG(G => Object.assign(G, data.G));
    renderAll();
  }),
  resetAll: () => confirmBox('Zacząć nową kampanię?', 'Bohaterowie, osada, wyprawa i tablica zostaną wyczyszczone. Najpierw zapisz kopię, jeśli chcesz ją zachować.', 'Wyczyść wszystko', () => {
    const S = DEFAULT_S(); const ops = [opSet('stol', S.stol), opSet('wyprawa', S.wyprawa), opSet('osada', S.osada)];
    Object.keys(Store.S.heroes).forEach(id => ops.push(opDel('heroes.' + id)));
    Store.act(ops); rollLog('**Nowa kampania.** Osada śpi. Posiadłość nie. Zapalcie pochodnie — dopóki jest czym.', '', 'przodek');
  })
});

/* ======================= panorama Osady (SVG) ======================= */
const HB_LIST = [['Ratusz', 'Tablica ogłoszeń'], ['Dyliżans', 'Dyliżans'], ['Opactwo', 'Opactwo'], ['Gospoda', 'Gospoda'], ['Sanatorium', 'Sanatorium'], ['Kuźnia', 'Kuźnia'], ['Gildia', 'Gildia'], ['Obozownik', 'Obozownik'], ['Wóz Nomadów', 'Wóz Nomadów'], ['Cmentarz', 'Cmentarz'], ['Posiadłość', 'Posiadłość']];
function hamletArt(o, sel) {
  const lv = n => (o.b || {})[n] || 0; const thr = o.threat || 0;
  const closed = n => (n === 'Gospoda' && o.eventR === 5) || (n === 'Sanatorium' && o.eventR === 3) || (o.raidClosed && o.raidClosed.week === o.week && o.raidClosed.b === n);
  const win = (x, y, w, h, lit) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="1.5" fill="${lit ? '#f2b45c' : '#15110e'}" ${lit ? 'filter="url(#hm-glow)"' : ''} stroke="#0b0807" stroke-width="1.5"/>`;
  const wins = (list, n) => list.map(([x, y, w, h], i) => win(x, y, w || 10, h || 14, !closed(n) && i < 1 + lv(n) * 1.5)).join('');
  const fire = (x, y, s) => `<g filter="url(#hm-glow)"><path d="M${x} ${y}c${-6 * s} ${-8 * s} ${-4 * s} ${-16 * s} ${2 * s} ${-24 * s}c${1 * s} ${8 * s} ${8 * s} ${10 * s} ${5 * s} ${20 * s}c${-1 * s} ${3 * s} ${-4 * s} ${4 * s} ${-7 * s} ${4 * s}z" fill="#f0782a"/><path d="M${x + s} ${y - s}c${-2 * s} ${-4 * s} ${-1 * s} ${-8 * s} ${2 * s} ${-12 * s}c${1 * s} ${4 * s} ${3 * s} ${6 * s} ${1 * s} ${11 * s}z" fill="#ffd27a"/></g>`;
  const smoke = (x, y) => `<g opacity=".35" filter="url(#hm-blur)"><ellipse cx="${x + 6}" cy="${y - 18}" rx="10" ry="8" fill="#6b6460"/><ellipse cx="${x + 16}" cy="${y - 40}" rx="14" ry="10" fill="#5e5854"/><ellipse cx="${x + 30}" cy="${y - 66}" rx="18" ry="12" fill="#524c49"/></g>`;
  const trim = n => lv(n) >= 3 ? '#c9a24e' : '#0b0807';
  const banner = (x, y, col) => `<path d="M${x} ${y}h12v24l-6-6-6 6z" fill="${col}" stroke="#0b0807" stroke-width="1"/>`;
  const B = {
    'Opactwo': { lx: 150, ly: 112, art: `<path d="M74 252L140 214 206 252Z" fill="#241d19" stroke="${trim('Opactwo')}" stroke-width="2.5"/><rect x="80" y="250" width="120" height="72" fill="#2c2520" stroke="#0b0807" stroke-width="2"/>
      <rect x="178" y="168" width="44" height="154" fill="#2f2722" stroke="#0b0807" stroke-width="2"/><path d="M172 170L200 116 228 170Z" fill="#221b17" stroke="${trim('Opactwo')}" stroke-width="2.5"/><path d="M200 100v20M193 107h14" stroke="#7a6a52" stroke-width="3"/>
      <circle cx="140" cy="278" r="15" fill="${closed('Opactwo') ? '#15110e' : '#8a5ad0'}" opacity="${closed('Opactwo') ? 1 : 0.55 + lv('Opactwo') * 0.15}" filter="url(#hm-glow)" stroke="#0b0807" stroke-width="2"/><path d="M140 263v30M125 278h30" stroke="#0b0807" stroke-width="2"/>
      <path d="M190 322v-26a10 10 0 0 1 20 0v26" fill="#120e0c"/>${win(194, 190, 12, 18, !closed('Opactwo'))}${lv('Opactwo') >= 2 ? `<rect x="86" y="300" width="10" height="16" fill="${closed('Opactwo') ? '#15110e' : '#f2b45c'}"/><rect x="104" y="300" width="10" height="16" fill="${closed('Opactwo') ? '#15110e' : '#f2b45c'}"/>` : ''}` },
    'Gildia': { lx: 375, ly: 172, art: `<rect x="312" y="246" width="128" height="76" fill="#2a2420" stroke="#0b0807" stroke-width="2"/><path d="M302 248L376 196 450 248Z" fill="#221b17" stroke="${trim('Gildia')}" stroke-width="2.5"/>
      ${wins([[326, 262], [350, 262], [394, 262], [418, 262]], 'Gildia')}<path d="M366 322v-30h20v30" fill="#120e0c"/><path d="M362 218l28 22M390 218l-28 22" stroke="#9a8a6a" stroke-width="3"/>
      ${[0, 1, 2].slice(0, Math.max(1, lv('Gildia'))).map(i => banner(320 + i * 50, 288, ['#7a1f1a', '#2a4a7a', '#7a6a1a'][i])).join('')}` },
    'Sanatorium': { lx: 600, ly: 196, art: `<rect x="532" y="232" width="138" height="90" fill="#2e2824" stroke="#0b0807" stroke-width="2"/><path d="M524 234L601 206 678 234Z" fill="#231c18" stroke="${trim('Sanatorium')}" stroke-width="2.5"/>
      ${wins([[546, 248], [570, 248], [620, 248], [644, 248], [546, 284], [644, 284]], 'Sanatorium')}<circle cx="601" cy="258" r="13" fill="#e6dccb" stroke="#0b0807" stroke-width="2"/><path d="M601 250v16M593 258h16" stroke="#9a2218" stroke-width="4"/>
      <path d="M590 322v-28h22v28" fill="#120e0c"/>${closed('Sanatorium') ? '<ellipse cx="601" cy="270" rx="90" ry="40" fill="#5c8a24" opacity=".25" filter="url(#hm-blur)"/>' : ''}` },
    'Kuźnia': { lx: 1050, ly: 196, art: `<radialGradient id="hm-forge" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#ff8a2a" stop-opacity=".75"/><stop offset="1" stop-color="#ff8a2a" stop-opacity="0"/></radialGradient>
      <rect x="1088" y="214" width="22" height="52" fill="#2a2420" stroke="#0b0807" stroke-width="2"/>${smoke(1092, 214)}<path d="M980 262L1130 240V262Z" fill="#221b17" stroke="${trim('Kuźnia')}" stroke-width="2.5"/>
      <rect x="990" y="262" width="132" height="60" fill="#1c1714" stroke="#0b0807" stroke-width="2"/><ellipse cx="1040" cy="300" rx="${50 + lv('Kuźnia') * 10}" ry="30" fill="url(#hm-forge)"/>
      <path d="M1020 312h40l-6-10h-28z" fill="#3a3a3a" stroke="#0b0807" stroke-width="1.5"/><rect x="1032" y="312" width="16" height="10" fill="#2e2e2e"/>${fire(1080, 314, 0.9)}` },
    'Cmentarz': { lx: 105, ly: 360, art: `<path d="M24 430h176" stroke="#2c241d" stroke-width="3"/>${[34, 70, 106, 142, 178].map(x => `<path d="M${x} 430v-20" stroke="#2c241d" stroke-width="3"/>`).join('')}
      <path d="M46 430c4-30 8-50 2-74M48 380c-10-8-18-8-26-4M50 368c8-8 16-10 26-8" stroke="#1a1512" stroke-width="5" fill="none" stroke-linecap="round"/>
      ${Array.from({ length: Math.min(8, 3 + (o.cemetery || []).length) }, (_, i) => { const x = 70 + (i % 4) * 32, y = 418 - Math.floor(i / 4) * 22; return i % 2 ? `<path d="M${x} ${y}v-22M${x - 7} ${y - 15}h14" stroke="#58524c" stroke-width="4"/>` : `<path d="M${x - 8} ${y}v-14a8 8 0 0 1 16 0v14z" fill="#4a4540" stroke="#1a1714" stroke-width="1.5"/>`; }).join('')}` },
    'Gospoda': { lx: 330, ly: 270, art: `<rect x="392" y="282" width="18" height="40" fill="#2a2420" stroke="#0b0807" stroke-width="2"/>${smoke(396, 282)}
      <rect x="242" y="334" width="176" height="96" fill="#3a2a1e" stroke="#0b0807" stroke-width="2"/><path d="M232 336L330 290 428 336Z" fill="#2a1d16" stroke="${trim('Gospoda')}" stroke-width="2.5"/>
      <path d="M242 366h176M290 334v96M370 334v96" stroke="#24180f" stroke-width="3"/>${wins([[256, 344, 18, 14], [384, 344, 18, 14], [256, 384, 18, 16], [384, 384, 18, 16], [300, 344, 14, 14], [346, 344, 14, 14]], 'Gospoda')}
      <path d="M318 430v-36h24v36" fill="#120e0c"/><path d="M430 352h28M446 352v10" stroke="#3a2a1e" stroke-width="3"/><rect x="434" y="362" width="26" height="20" rx="2" fill="#5a3f26" stroke="#0b0807" stroke-width="1.5"/><path d="M441 366h10v10h-10zM451 368h3v6h-3" fill="#d9b45a"/>
      ${closed('Gospoda') ? fire(300, 334, 1.4) + fire(360, 330, 1.1) : ''}` },
    'Ratusz': { lx: 535, ly: 316, art: `<path d="M486 430v-78M584 430v-78" stroke="#3a2a1e" stroke-width="6"/><path d="M474 354L535 330 596 354Z" fill="#2a1d16" stroke="#0b0807" stroke-width="2"/>
      <rect x="490" y="358" width="90" height="50" fill="#4a3826" stroke="#0b0807" stroke-width="2"/>${(o.board || []).slice(0, 5).map((q, i) => `<rect x="${496 + i * 16}" y="${364 + (i % 2) * 6}" width="13" height="18" fill="#d8cbb0" transform="rotate(${(i % 3) - 1} ${502 + i * 16} 372)"/>`).join('')}
      <circle cx="626" cy="414" r="14" fill="#2a2420" stroke="#0b0807" stroke-width="2"/><path d="M612 400h28M616 400v-16M636 400v-16M612 384h28" stroke="#3a2a1e" stroke-width="3"/>` },
    'Obozownik': { lx: 700, ly: 330, art: `<path d="M640 430L700 352 760 430Z" fill="#5a4a36" stroke="#0b0807" stroke-width="2"/><path d="M700 352L688 430h24z" fill="#2a2016"/><path d="M700 352v-12" stroke="#3a2a1e" stroke-width="3"/>
      ${lv('Obozownik') >= 1 ? '<path d="M703 340h14l-4 5 4 5h-14z" fill="#7a1f1a"/>' : ''}<path d="M760 428l22-6M764 422l22 6" stroke="#4a3220" stroke-width="5" stroke-linecap="round"/>${fire(772, 424, 0.9)}
      <ellipse cx="772" cy="430" rx="40" ry="10" fill="#ff8a2a" opacity=".22" filter="url(#hm-blur)"/>` },
    'Wóz Nomadów': { lx: 875, ly: 328, art: `<path d="M812 380a63 34 0 0 1 126 0z" fill="#6b3a2a" stroke="#0b0807" stroke-width="2"/><path d="M830 368a45 22 0 0 1 90 0" stroke="#c9a24e" stroke-width="3" fill="none"/>
      <rect x="812" y="378" width="126" height="36" fill="#5a3322" stroke="#0b0807" stroke-width="2"/><path d="M812 390h126M812 402h126" stroke="#8a5a2a" stroke-width="2"/>${win(860, 384, 30, 16, true)}
      ${[842, 908].map(x => `<circle cx="${x}" cy="418" r="15" fill="none" stroke="#2a1d12" stroke-width="5"/><path d="M${x - 15} 418h30M${x} 403v30" stroke="#2a1d12" stroke-width="2"/>`).join('')}<path d="M938 400l26 18" stroke="#3b2a1c" stroke-width="5"/>
      <path d="M800 372v-14" stroke="#3a2a1e" stroke-width="2"/><circle cx="800" cy="376" r="5" fill="#f2b45c" filter="url(#hm-glow)"/>` },
    'Dyliżans': { lx: 1095, ly: 316, art: `<path d="M1176 430V318M1196 430V318" stroke="#3a2a1e" stroke-width="8"/><path d="M1168 320h36" stroke="#3a2a1e" stroke-width="6"/>
      <rect x="1036" y="350" width="112" height="52" rx="6" fill="#2e2a3a" stroke="#0b0807" stroke-width="2"/><rect x="1046" y="338" width="92" height="12" fill="#3a2a1e" stroke="#0b0807" stroke-width="1.5"/>
      <rect x="1056" y="326" width="22" height="12" fill="#5a4630"/><rect x="1084" y="328" width="18" height="10" fill="#4a3826"/>${win(1052, 360, 20, 18, true)}${win(1110, 360, 20, 18, true)}<path d="M1084 402v-38h18v38" fill="#1f1c28"/>
      ${[[1058, 22], [1130, 22]].map(([x, r]) => `<circle cx="${x}" cy="408" r="${r}" fill="none" stroke="#2a1d12" stroke-width="5"/><path d="M${x - r} 408h${2 * r}M${x} ${408 - r}v${2 * r}M${x - 15} 393l30 30M${x + 15} 393l-30 30" stroke="#2a1d12" stroke-width="2"/>`).join('')}
      ${(o.recruits || []).length ? '<circle cx="1036" cy="356" r="5" fill="#f2b45c" filter="url(#hm-glow)"/>' : ''}` },
    'Posiadłość': { lx: 850, ly: 94, art: `<path d="M700 262C740 200 800 180 860 182 930 184 980 220 1010 262Z" fill="#17121a"/>
      <rect x="790" y="160" width="120" height="70" fill="#0f0c10"/><rect x="768" y="132" width="30" height="98" fill="#0f0c10"/><rect x="902" y="146" width="28" height="84" fill="#0f0c10"/>
      <path d="M764 134L783 100 802 134ZM898 148L916 116 934 148ZM786 162L850 130 914 162" fill="#0c0a0d"/><path d="M870 160l12-14 6 10 10-8" stroke="#17121a" stroke-width="3" fill="none"/>
      ${win(840, 180, 10, 14, true)}${win(778, 150, 8, 12, thr < 10)}${win(912, 166, 8, 12, false)}` }
  };
  const lbl = (k, x, y) => { const name = (HB_LIST.find(z => z[0] === k) || [k, k])[1]; const n = BUILD.find(b => b[0] === k) ? lv(k) : null; const tw = name.length * 10.4; const w = tw + (n != null ? 54 : 22);
    return `<g class="hb-lbl ${sel === k ? 'on' : ''}" transform="translate(${x - w / 2} ${y})"><rect width="${w}" height="30" rx="5"/><text x="11" y="21" textLength="${tw}" lengthAdjust="spacingAndGlyphs">${esc(name)}</text>${n != null ? [1, 2, 3].map(i => `<circle cx="${w - 44 + i * 10}" cy="15" r="3.6" class="${i <= n ? 'on' : ''}"/>`).join('') : ''}${closed(k) ? `<text x="${w / 2}" y="46" text-anchor="middle" class="hb-closed">zamknięte</text>` : ''}</g>`; };
  let stars = ''; for (let i = 0; i < 40; i++) { const x = (i * 137) % 1200, y = (i * 61) % 170; stars += `<circle cx="${x}" cy="${y}" r="${i % 5 ? 0.8 : 1.4}"/>`; }
  let stakes = ''; for (let x = 0; x < 1200; x += 14) stakes += `<path d="M${x} 330V${296 + (x % 28 ? 4 : 0)}l6-8 6 8V330z"/>`;
  const order = ['Posiadłość', 'Opactwo', 'Gildia', 'Sanatorium', 'Kuźnia', 'Cmentarz', 'Gospoda', 'Ratusz', 'Obozownik', 'Wóz Nomadów', 'Dyliżans'];
  const sky = thr >= 10 ? ['#2a0d0a', '#4a1a12', '#7a2a18'] : thr >= 6 ? ['#1a1018', '#33171a', '#5e2a1e'] : ['#121320', '#251d2c', '#4e2e26'];
  return `<svg viewBox="0 0 1200 480" class="hamlet-art" role="img" aria-label="Osada — kliknij budynek"><defs>
    <linearGradient id="hm-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${sky[0]}"/><stop offset=".55" stop-color="${sky[1]}"/><stop offset="1" stop-color="${sky[2]}"/></linearGradient>
    <linearGradient id="hm-fog" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0c0a09" stop-opacity="0"/><stop offset="1" stop-color="#0c0a09" stop-opacity=".85"/></linearGradient>
    <radialGradient id="hm-sel" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#d2ab52" stop-opacity=".35"/><stop offset="1" stop-color="#d2ab52" stop-opacity="0"/></radialGradient>
    <radialGradient id="hm-dark" cx=".5" cy="1" r=".9"><stop offset="0" stop-color="#b3261e" stop-opacity="0"/><stop offset=".7" stop-color="#b3261e" stop-opacity="0"/><stop offset="1" stop-color="#b3261e" stop-opacity="${(Math.max(0, thr - 2) * 0.05).toFixed(2)}"/></radialGradient>
    <filter id="hm-glow" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="2.2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    <filter id="hm-blur" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="9"/></filter></defs>
    <rect width="1200" height="480" fill="url(#hm-sky)"/><g fill="#e8dcc0" opacity=".55">${stars}</g>
    <circle cx="1010" cy="70" r="24" fill="#e8dcc0" opacity="${thr >= 10 ? .5 : .85}" filter="url(#hm-glow)"/>${thr >= 6 ? '<circle cx="1010" cy="70" r="24" fill="#b3261e" opacity=".35"/>' : ''}
    <g fill="#1a1520" opacity=".75"><ellipse cx="300" cy="70" rx="170" ry="14"/><ellipse cx="760" cy="40" rx="210" ry="12"/><ellipse cx="1120" cy="120" rx="120" ry="10"/></g>
    <path d="M0 290C120 250 220 262 330 276S560 250 700 262 980 240 1200 268V480H0Z" fill="#1a1518"/>
    <g class="hb ${sel === 'Posiadłość' ? 'on' : ''}" data-act="hbSel" data-b="Posiadłość" tabindex="0" role="button" aria-label="Posiadłość">${B['Posiadłość'].art}</g>
    <g fill="#241a14" stroke="#120d0a" stroke-width="1">${stakes}</g>
    <path d="M0 326H1200V480H0Z" fill="#1d1712"/><path d="M560 480C590 450 640 440 700 436S900 428 1000 432 1150 430 1200 432V446C1100 446 1000 448 900 450S700 458 660 470 620 480 620 480Z" fill="#2a2119"/>
    <rect width="1200" height="480" fill="url(#hm-dark)"/>
    ${order.filter(k => k !== 'Posiadłość').map(k => `<g class="hb ${sel === k ? 'on' : ''}" data-act="hbSel" data-b="${k}" tabindex="0" role="button" aria-label="${esc((HB_LIST.find(z => z[0] === k) || [k, k])[1])}">${sel === k ? `<ellipse cx="${B[k].lx}" cy="${B[k].ly + 160 > 440 ? 430 : B[k].ly + 150}" rx="120" ry="40" fill="url(#hm-sel)"/>` : ''}<g class="hb-art">${B[k].art}</g></g>`).join('')}
    ${o.siege ? [80, 260, 520, 760, 980, 1140].map(x => fire(x, 330, 1.6)).join('') : ''}
    <rect y="400" width="1200" height="80" fill="url(#hm-fog)" pointer-events="none"/>
    <g class="hb-lbls">${order.map(k => `<g data-act="hbSel" data-b="${k}" class="hb-l">${lbl(k, B[k].lx, B[k].ly)}</g>`).join('')}</g></svg>`;
}
