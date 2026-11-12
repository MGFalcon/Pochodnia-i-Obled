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
    const o = Store.S.osada; const gm = Store.isGM(); const W = Store.canWrite();
    return `${threatBar()}${hamletDecisionBox()}<div class="grid2">
      <section class="panel"><h2>Tydzień ${o.week}</h2>
        ${o.event ? `<p><b>Wydarzenie:</b> ${esc(o.event)}</p>` : '<p class="muted">Wydarzenie tygodnia jeszcze nie wylosowane.</p>'}
        ${o.cultists ? '<p class="small warn">Kultyści na trakcie: następna wyprawa ma dodatkową walkę w pierwszym korytarzu.</p>' : ''}${o.rumor ? '<p class="small">Plotka: następna wyprawa ma +1 rzut na łup.</p>' : ''}
        ${gm ? `<div class="row"><button class="btn primary" data-act="newWeek">Nowy tydzień</button><span class="small muted">wydarzenie k10, dyliżans, koniec leczenia, nowa tablica zadań</span></div>` : ''}
        <div class="ph">Dyliżans <span class="hint">rekruci za darmo, rejestr ${liveHeroes().length}/${o.slots}</span></div>
        ${(o.recruits || []).map((r, i) => `<div class="recruit"><b>${esc(CLS[r.cls].name)}</b> <span class="muted">Poz. ${r.level} · k20 = ${r.roll}</span> <span class="small dim">${esc(r.qp)}; ${esc(r.qn)}</span>${W ? ` <button class="btn sm" data-act="hire" data-i="${i}">Przyjmij</button>` : ''}</div>`).join('') || '<p class="muted small">Dyliżans przyjedzie z nowym tygodniem.</p>'}
      </section>
      <section class="panel"><h2>Skarbiec</h2>
        <div class="treasury"><div class="gold"><span class="lbl">Złoto</span>${gm ? `<input type="number" id="ogold" data-bind="osada.gold" data-num value="${o.gold}" style="width:6em">` : `<b class="num">${o.gold}</b>`}</div>
          ${Object.keys(MEM_PL).map(k => `<div class="memo"><span class="lbl">${MEM_PL[k]}</span><span class="row">${gm ? `<button class="btn sm ghost" data-act="memAdj" data-k="${k}" data-v="-1">−</button>` : ''}<b class="num">${o.mem[k] || 0}</b>${gm ? `<button class="btn sm ghost" data-act="memAdj" data-k="${k}" data-v="1">+</button>` : ''}</span></div>`).join('')}</div>
        <p class="small muted">Złoto i pamiątki są wspólne — to kasa posiadłości, nie bohaterów.</p>
      </section>
    </div>
    <section class="panel"><h2>Budynki <span class="hint">stopień 1, 2, 3 kosztuje 3, 5, 8 pamiątek dwóch przypisanych typów</span></h2>
      <div class="bgrid">${BUILD.map(([n, types, eff]) => { const lv = o.b[n] || 0; return `<div class="bld"><div class="bh"><b>${n}</b><span class="steps">${[1, 2, 3].map(i => `<i class="${i <= lv ? 'on' : ''}"></i>`).join('')}</span></div>
        <div class="small dim">${eff} · ${types.map(t => MEM_PL[t]).join(' i ')}</div>
        ${W && lv < 3 ? `<button class="btn sm" data-act="build" data-n="${n}">Rozbuduj: ${STEP_COST[lv]} pamiątek</button>` : lv >= 3 ? '<span class="chip sm gold">pełna rozbudowa</span>' : ''}</div>`; }).join('')}
        <div class="bld"><div class="bh"><b>Rejestr</b><span class="num">${o.slots} miejsc</span></div><div class="small dim">+3 miejsca za 4 pamiątki dowolnego typu</div>${W ? `<button class="btn sm" data-act="slots">Powiększ</button>` : ''}</div>
      </div></section>
    <div class="grid2">
      <section class="panel"><h2>Magazyn błyskotek</h2>
        ${(o.trinkets || []).map((t, i) => `<div class="trk"><b>${esc(t.name)}</b> <span class="dim small">${esc(trinketDesc(t))}</span>${W ? ` <span class="row">${t.kind === 'class' && t.skill == null ? `<button class="btn sm gold" data-act="trkSkill" data-i="${i}">Wybierz umiejętność</button>` : `<button class="btn sm ghost" data-act="trkGive" data-i="${i}">Przekaż</button>`}${t.kind !== 'kiel' ? `<button class="btn sm ghost" data-act="trkSell" data-i="${i}">Sprzedaj za ${sellValue(t)} Z</button>` : ''}</span>` : ''}</div>`).join('') || '<p class="muted">Pusto. Błyskotki znajdziecie tylko w ukrytych komnatach.</p>'}
        ${W ? `<div class="row"><button class="btn sm primary" data-act="trkRoll">Losuj błyskotkę</button><button class="btn sm" data-act="trkAdd">Dodaj ręcznie</button><button class="btn sm ghost" data-act="trkSwap">Wóz: wymień 2 → 1</button></div>` : ''}
      </section>
      <section class="panel"><h2>Cmentarz</h2>
        ${(o.cemetery || []).length ? `<ul class="cem">${o.cemetery.map(c => `<li><b>${esc(c.name)}</b> <span class="dim">${esc(c.cls)}, Poziom ${c.level}</span> <span class="muted small">— ${esc(c.cause || '')}${c.week ? ', tydzień ' + c.week : ''}</span>${c.origin ? `<br><span class="small dim">${esc(c.origin)}${c.dream ? '; nie zdążył(a) spełnić marzenia: ' + esc(c.dream.replace(/^chce /, '')) : ''}.</span>` : ''}${c.epitaph ? `<br><i class="small">${esc(c.epitaph)}</i>` : ''}</li>`).join('')}</ul><p class="small muted">MG odczytuje te imiona na początku sesji.</p>` : '<p class="muted">Nikt jeszcze nie spoczął. Jeszcze.</p>'}
      </section>
    </div>
    ${gm ? `<section class="panel"><h2>Kopia gry <span class="hint">dla MG</span></h2>
      <p class="dim small">Zapisz kopię całej kampanii do pliku (bohaterowie, osada, wyprawa, dziennik). Wczytaniem przeniesiesz kampanię między stołem Claude a Twoją stroną.</p>
      <div class="row"><button class="btn" data-act="exportAll">Zapisz kopię do pliku</button><button class="btn ghost" data-act="copyAll">Kopiuj jako tekst</button><button class="btn ghost" data-act="importAll">Wczytaj kopię</button><span class="sp"></span><button class="btn ghost" data-act="resetAll">Nowa kampania</button></div></section>` : ''}`;
  }
};

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
