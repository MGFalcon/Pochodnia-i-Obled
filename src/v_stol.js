/* Widok Stół: szyk 4 na 4, inicjatywa, akcje bohaterów i wrogów. */
const REG_OPTS = [['Ruiny', 'Ruiny'], ['Nory', 'Nory'], ['Knieja', 'Knieja'], ['Zatoka', 'Zatoka'], ['DD', 'Najmroczniejszy Loch']];
function bar(cls, v, max, label) {
  const p = max ? clamp(v / max, 0, 1) * 100 : 0;
  return `<div class="bar ${cls}"><i style="width:${p}%"></i><span>${label}</span></div>`;
}
function posDots(list, cls) { return `<span class="pdots ${cls}">${[1, 2, 3, 4].map(i => `<i class="${list && list.includes(i) ? 'on' : ''}"></i>`).join('')}</span>`; }
function gchip(c, t, label) { const k = glossKey(t); const g = glossText(k, label || t); return `<span class="chip sm ${c}" ${g ? `title="${esc(g)}" data-gloss="${esc(g)}" tabindex="0"` : ''}>${esc(t)}</span>`; }
function chipsHtml(list) { return list.map(([c, t]) => gchip(c, t)).join(''); }
function stateChip(h) {
  if (!h.state) return '';
  const c = h.state.kind === 'virtue' ? 'virtue' : 'affl';
  return gchip(c, h.state.name, h.state.name);
}
function curEntry() { const s = Store.S.stol; return s.init && s.init[s.turn]; }

function heroSlot(id, pos) {
  const h = H(id); if (!h) return `<div class="slot empty"><div class="pos">${pos}</div></div>`;
  const st = heroStats(h); const s = Store.S.stol; const ce = curEntry();
  const isCur = ce && ce.k === 'h' && ce.id === id;
  const P = UI.pend; const tgt = P && P.need === 'ally' && Store.S.stol.heroes.includes(id);
  const tgtE = UI.epend && UI.epend.valid.includes(id);
  const sel = UI.sel.k === 'h' && UI.sel.id === id;
  return `<div class="slot hero ${sel ? 'sel' : ''} ${isCur ? 'cur' : ''} ${tgt || tgtE ? 'tgt' : ''} ${h.dd ? 'dd' : ''}" data-act="${tgt ? 'pickAlly' : tgtE ? 'pickHeroT' : 'selH'}" data-id="${id}" tabindex="0">
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
    <div class="chips">${chipsHtml(fxChips(e.fx))}</div>
  </div>`;
}

function lastActHtml(L) {
  const col = h => h.replace(/<b>(PUDŁO|UNIK|BLOK)<\/b>/g, '<b class="k-miss">$1</b>').replace(/<b>(TRAFIENIE)<\/b>/g, '<b class="k-hit">$1</b>').replace(/<b>(KRYTYK)<\/b>/g, '<b class="k-crit">$1</b>');
  return `<div class="lastact" aria-live="polite"><span class="lbl">Ostatnia akcja</span> <b class="la-head">${esc(L.head)}</b>${(L.sum || []).length ? `<ul>${L.sum.map(x => `<li>${col(md(x))}</li>`).join('')}</ul>` : ''}</div>`;
}
/* napisy nad postaciami po każdej akcji: PUDŁO, UNIK, −5, KRYTYK… (jak w grze) */
function showPops() {
  const L = Store.S.stol.last; if (!L || L.id === UI.lastShown) return;
  UI.lastShown = L.id; if (Date.now() - L.t > 10000) return;
  let layer = document.getElementById('pops');
  if (!layer) { layer = document.createElement('div'); layer.id = 'pops'; layer.setAttribute('aria-hidden', 'true'); document.body.appendChild(layer); }
  const count = {};
  (L.ev || []).forEach(ev => {
    let el = document.querySelector('.slot[data-id="' + ev.id + '"]');
    if (!el) el = document.querySelector(ev.k === 'act' ? '.side-h' : '.side-e'); if (!el) return;
    const r = el.getBoundingClientRect(); const n = count[ev.id] = (count[ev.id] || 0) + 1;
    const p = document.createElement('div'); p.className = 'pop pop-' + ev.k; p.textContent = ev.txt;
    p.style.left = (r.left + r.width / 2) + 'px'; p.style.top = (r.top + (ev.k === 'act' ? -6 : 18) + (n - 1) * 26) + 'px';
    p.style.animationDelay = ((n - 1) * 0.25 + (ev.k === 'act' ? 0 : 0.2)) + 's';
    layer.appendChild(p); setTimeout(() => p.remove(), 3400 + n * 250);
    if (ev.k !== 'act') { el.classList.add('flash-' + (ev.k === 'miss' || ev.k === 'dodge' ? 'miss' : ev.k === 'heal' ? 'heal' : 'hit')); }
  });
}
VIEWS.stol = {
  after() { showPops(); },
  render() {
    const s = Store.S.stol; const gm = Store.isGM(); const W = Store.canWrite();
    const enemies = enemyPositions(s.enemies);
    const heroesRev = [3, 2, 1, 0].map(i => heroSlot(s.heroes[i], i + 1)).join('');
    const enemyHtml = enemies.map(enemySlot).join('') + Array.from({ length: Math.max(0, 4 - enemies.reduce((a, x) => a + (x.e.size || 1), 0)) }, () => `<div class="slot empty"></div>`).join('');
    const living = s.enemies.filter(e => !e.corpse).length;
    const ce = curEntry();
    const curName = ce ? (ce.k === 'h' ? (H(ce.id) ? heroLabel(H(ce.id)) : '?') : ((s.enemies.find(e => e.id === ce.id) || {}).name || '?')) : null;
    return `
    ${UI.pend ? `<div class="pendbar">Wybierz cel: <b>${esc(UI.pend.label)}</b> <button class="btn sm" data-act="cancelPend">Anuluj</button>${UI.pend.multi ? ` <button class="btn sm primary" data-act="fireMulti">Użyj na wszystkich</button>` : ''}</div>` : ''}
    ${UI.epend ? `<div class="pendbar">Wybierz bohatera, w którego ${esc(UI.epend.label)} <button class="btn sm" data-act="cancelPend">Anuluj</button></div>` : ''}
    <section class="panel fieldp">
      <div class="fhead">
        <div><span class="lbl">${s.fight ? 'Walka' : 'Spokój'}</span> <b class="round">${s.fight ? 'Runda ' + s.round : 'Drużyna w szyku'}</b>${curName ? ` <span class="chip gold">tura: ${esc(curName)}</span>` : ''}</div>
        <div class="row">
          ${W ? `<button class="btn sm" data-act="formation">Ustaw drużynę</button>` : ''}
          ${W && !s.fight ? `<button class="btn sm primary" data-act="fightStart" ${s.enemies.length && s.heroes.length ? '' : 'disabled'}>Rozpocznij walkę</button>` : ''}
          ${W && s.fight ? `<button class="btn sm" data-act="newRound">Nowa runda</button><button class="btn sm primary" data-act="nextTurn" ${s.init.length ? '' : 'disabled'}>Następna tura</button><button class="btn sm ghost" data-act="fightEnd">Zakończ walkę</button>` : ''}
        </div>
      </div>
      ${s.fight && s.init.length ? `<div class="init">${s.init.map((x, i) => {
        const nm = x.k === 'h' ? (H(x.id) ? heroLabel(H(x.id)) : '—') : ((s.enemies.find(e => e.id === x.id) || {}).name || '—');
        return `<span class="ini ${x.k} ${i === s.turn ? 'now' : ''} ${i < s.turn ? 'done' : ''}">${esc(nm)} <b class="num">${x.tot}</b></span>`;
      }).join('')}</div>` : ''}
      ${s.fight && !living ? `<div class="won"><b>Wrogowie pokonani.</b> <button class="btn sm gold" data-act="lootFight">Rzuć na łup</button> <button class="btn sm primary" data-act="fightEnd">Zakończ walkę</button></div>` : ''}
      ${eventBanner()}
      ${lootCardHtml()}
      ${lootStrip()}
      ${s.last ? lastActHtml(s.last) : ''}
      <div class="field">
        <div class="side-h">${heroesRev}</div>
        <div class="vs" aria-hidden="true"><span>⟷</span></div>
        <div class="side-e">${enemyHtml}</div>
      </div>
      ${!s.heroes.length ? `<p class="muted">Drużyna jest pusta. ${W ? 'Kliknij „Ustaw drużynę” i wybierz do czterech bohaterów z rejestru.' : ''}</p>` : ''}
    </section>
    <div class="grid2">
      ${this.actionPanel()}
      ${gm ? this.gmPanel() : this.enemyInfo()}
    </div>`;
  },
  actionPanel() {
    const sel = UI.sel;
    if (sel.k === 'e') return this.enemyPanel();
    const h = sel.k === 'h' ? H(sel.id) : null;
    if (!h) return `<section class="panel"><h2>Akcja</h2><p class="muted">Kliknij swojego bohatera w szyku, żeby użyć umiejętności, przesunąć się albo sięgnąć do plecaka.${Store.isGM() ? ' Kliknij wroga, żeby nim zaatakować.' : ''}</p></section>`;
    const can = canHero(h); const c = CLS[h.cls]; const st = heroStats(h);
    const pos = Store.S.stol.heroes.indexOf(h.id) + 1;
    const ohyda = c.name === 'Ohyda';
    const skills = h.skills.filter(i => !ohyda || (c.skills[i].form === (h.form === 'beast' ? 'bestia' : 'człowiek')));
    const sup = Store.S.wyprawa.sup || {};
    const rd = Store.S.stol.round || 0; const lost = Store.S.stol.fight && h.fx && h.fx.lostTurn === rd && (curEntry() || {}).id === h.id;
    const ekst = h.state && h.state.kind === 'ekstaza';
    return `<section class="panel act">
      ${lost ? `<p class="warn">Tę turę przejęła Przypadłość (${esc(h.state ? h.state.name : '')}). Kliknij „Następna tura”.</p>` : ''}
      ${ekst ? `<p class="warn">Ekstaza bólu: musi atakować i nie leczy innych.</p>` : ''}
      <h2>${esc(heroLabel(h))} <span class="hint">${pos ? 'pozycja ' + pos : 'poza szykiem'} · ${esc(ownerName(h))}</span></h2>
      ${!can ? `<p class="muted">To bohater innego gracza — możesz go obejrzeć, ale działa nim jego gracz albo MG.</p>` : ''}
      <div class="skills">${skills.map(i => {
        const v = skillView(h, i, st); const okPos = pos && v.inf.from.includes(pos);
        const lim = /2 razy na walkę/.test(v.s.eff) ? 2 : /raz na walkę/.test(v.s.eff) ? 1 : 0; const used = ((h.fx || {}).used || {})[i] || 0; const spent = (lim && used >= lim) || lost || (ekst && !v.inf.attack);
        return `<button class="skill" data-act="useSkill" data-i="${i}" ${can && okPos && !spent && Store.S.stol.heroes.includes(h.id) ? '' : 'disabled'} title="${esc(spent ? 'Wykorzystane w tej walce' : !okPos ? 'Nie z tej pozycji' : v.s.eff || '')}">
          <span class="sn">${esc(v.s.name)}${!okPos && pos ? ' <span class="nopos">nie z poz. ' + pos + '</span>' : ''}</span>
          <span class="sp2">${posDots(v.inf.from, 'from')}${v.inf.to ? posDots(v.inf.to, v.inf.target === 'multi' ? 'to multi' : 'to') : `<span class="tw">${esc(v.s.w)}</span>`}</span>
          <span class="sv num">${v.cel != null ? 'Cel. ' + v.cel : ''}${v.dmg ? ' · ' + v.dmg : ''}${v.heal ? ' · leczy ' + v.heal : ''}${v.stress ? ' · −' + v.stress + ' Stres' : ''}${lim ? ' · ' + (lim - used) + '/' + lim + ' w walce' : ''}</span>
        </button>`;
      }).join('')}</div>
      ${can ? `<div class="row acts">
        <button class="btn sm" data-act="heroMove" data-d="-1" ${pos > 1 ? '' : 'disabled'}>◀ do przodu</button>
        <button class="btn sm" data-act="heroMove" data-d="1" ${pos && pos < Store.S.stol.heroes.length ? '' : 'disabled'}>do tyłu ▶</button>
        <button class="btn sm" data-act="heroPass">Pas</button>
        ${ohyda ? `<button class="btn sm gold" data-act="transform">${h.form === 'beast' ? 'Wróć do ludzkiej postaci' : 'Przemiana w bestię'}</button>` : ''}
        <button class="btn sm" data-act="retreat">Odwrót</button>
      </div>
      <div class="row acts items">
        <span class="lbl">Plecak</span>
        ${[['Bandaże', 'bandaż', 'bleed'], ['Antidota', 'antidotum', 'blight'], ['Laudanum', 'laudanum', 'horror'], ['Zioła', 'zioła', 'debuff'], ['Prowiant', 'prowiant', 'food']].map(([k, n, w]) => `<button class="btn sm ghost" data-act="useItem" data-k="${k}" data-w="${w}">${n} <span class="muted num">${sup[k] != null ? sup[k] : '–'}</span></button>`).join('')}
      </div>
      <div class="row acts">
        <span class="lbl">Popraw</span>
        <button class="btn sm ghost" data-act="adjH" data-f="hp" data-v="-1">Zdr −1</button><button class="btn sm ghost" data-act="adjH" data-f="hp" data-v="1">Zdr +1</button>
        <button class="btn sm ghost" data-act="adjH" data-f="stress" data-v="1">Stres +1</button><button class="btn sm ghost" data-act="adjH" data-f="stress" data-v="-1">Stres −1</button>
        ${h.dd ? `<button class="btn sm primary" data-act="deathRoll">Rzut Śmierci</button>` : ''}
      </div>` : ''}
    </section>`;
  },
  enemyPanel() {
    const e = Store.S.stol.enemies.find(x => x.id === UI.sel.id);
    if (!e) return `<section class="panel"><h2>Wróg</h2><p class="muted">Ten wróg już nie stoi w szyku.</p></section>`;
    const gm = Store.isGM();
    return `<section class="panel act">
      <h2>${esc(e.name)} <span class="hint">${e.boss ? 'boss · 2 tury na rundę' : esc(e.pos ? 'pozycje ' + e.pos : '')}</span></h2>
      <p class="dim num">Zdrowie ${e.hp}/${e.maxhp} · Unik ${enemyDodge(e)} · Pancerz ${enemyProt(e)} · Szybkość ${e.speed} · Krzepa ${e.krzepa} · Odporność ${e.odp}${e.noBleed ? ' · niewrażliwy na krwawienie' : ''}</p>
      <div class="atks">${(e.attacks || []).map((a, i) => `<div class="atk"><div>${attackText(a)}</div>${gm && a.w ? `<div class="row">
        ${a.aoe ? `<button class="btn sm primary" data-act="eAtk" data-i="${i}" data-m="all">Atakuj pozycje ${esc(a.w)}</button>` : `<button class="btn sm primary" data-act="eAtk" data-i="${i}" data-m="rand">Losowy cel</button><button class="btn sm" data-act="eAtk" data-i="${i}" data-m="pick">Wybierz cel</button>`}
      </div>` : gm ? `<div class="row"><button class="btn sm" data-act="eSay" data-i="${i}">Ogłoś</button></div>` : ''}</div>`).join('') || '<p class="muted">Zwłoki nic nie robią.</p>'}</div>
      ${e.notes && e.notes.length ? `<div class="bnotes">${e.notes.map(n => `<p>${md(n.replace(/^([^:]+):/, '**$1:**'))}</p>`).join('')}</div>` : ''}
      ${gm ? `<div class="row acts">
        ${e.boss ? `<button class="btn sm gold" data-act="bossMove">Druga tura: rzuć k6</button>` : ''}
        ${/Wezwanie kości/.test((e.notes || []).join()) ? `<button class="btn sm" data-act="summon" data-n="Kościany żołdak">Przyzwij żołdaka</button>` : ''}
        ${e.name === 'Shambler' ? `<button class="btn sm" data-act="summon" data-n="Macka">Przyzwij mackę</button>` : ''}
        ${e.name === 'Matka Mięsa' ? `<button class="btn sm" data-act="summon" data-n="Ochłap">Porodzenie</button>` : ''}
        <button class="btn sm ghost" data-act="adjE" data-v="-1">Zdr −1</button><button class="btn sm ghost" data-act="adjE" data-v="-5">−5</button><button class="btn sm ghost" data-act="adjE" data-v="1">+1</button>
        <button class="btn sm ghost" data-act="eMove" data-d="-1">◀</button><button class="btn sm ghost" data-act="eMove" data-d="1">▶</button>
        <button class="btn sm ghost" data-act="eRemove">Usuń</button>
      </div>` : ''}
    </section>`;
  },
  enemyInfo() {
    const s = Store.S.stol;
    return `<section class="panel"><h2>Wrogowie</h2>${s.enemies.length ? s.enemies.map(e => `<p><b>${esc(e.name)}</b> <span class="muted">${esc(e.type || '')}</span><br><span class="dim">${(e.attacks || []).map(a => attackText(a)).join('<br>')}</span></p>`).join('') : '<p class="muted">Na razie nikogo. MG ustawia wrogów, gdy zaczyna się walka.</p>'}</section>`;
  },
  gmPanel() {
    const s = Store.S.stol; const reg = s.region || 'Ruiny';
    const refs = foeRefs().filter(r => r.group === 'Twoi wrogowie' || r.group === (reg === 'DD' ? 'Najmroczniejszy Loch' : reg) || (r.group === 'Ciemność'));
    return `<section class="panel"><h2>Wrogowie <span class="hint">dla MG</span></h2>
      <div class="row">
        <label class="lbl" for="sreg">Region</label><select id="sreg" data-bind="stol.region">${REG_OPTS.map(([k, n]) => `<option value="${k}" ${reg === k ? 'selected' : ''}>${n}</option>`).join('')}</select>
        ${reg !== 'DD' ? `<label class="lbl" for="sdl">Loch</label><select id="sdl" data-bind="stol.dl" data-num>${DL.map((n, i) => `<option value="${i}" ${+s.dl === i ? 'selected' : ''}>${n}</option>`).join('')}</select>`
        : `<label class="lbl" for="sfl">Piętro</label><select id="sfl" data-bind="stol.floor" data-num>${DD_FLOORS.map((f, i) => `<option value="${i}" ${+(s.floor || 0) === i ? 'selected' : ''}>${i + 1}. ${f.boss}</option>`).join('')}</select>`}
      </div>
      <div class="row">
        <button class="btn sm primary" data-act="encounter">Losuj spotkanie</button>
        <button class="btn sm gold" data-act="bossSet">Boss${reg === 'DD' ? ' piętra' : ' regionu'}</button>
        <button class="btn sm" data-act="shambler">Shambler</button>
        <button class="btn sm ghost" data-act="clearE">Wyczyść</button>
      </div>
      <div class="row"><select id="addE">${[...new Set(refs.map(r => r.group))].map(g => `<optgroup label="${esc(g)}">${refs.filter(r => r.group === g).map(r => `<option value="${esc(r.ref)}">${esc(r.name)}${r.boss ? ' (boss)' : ''}</option>`).join('')}</optgroup>`).join('')}</select><button class="btn sm" data-act="addE">Dodaj wroga</button></div>
      <p class="muted small">Wrogowie dostają premie poziomu lochu automatycznie (Weterański: Zdrowie +5, Celność, Unik i obrażenia +1; Mistrzowski: +10 i +2, Szybkość +1, Stres +1). Najmroczniejszy Loch ma wartości ostateczne.</p>
    </section>`;
  }
};

/* ---------- akcje stołu ---------- */
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
      <div class="flist">${list.map(h => { const sick = h.status === 'leczenie'; return `<label class="chk ${sick ? 'sick' : ''}" ${sick ? 'title="W leczeniu — wraca do gry od następnego tygodnia"' : ''}><input type="checkbox" value="${h.id}" ${cur.includes(h.id) && !sick ? 'checked' : ''} ${sick ? 'disabled' : ''}> ${esc(heroLabel(h))} <span class="muted">${esc(CLS[h.cls].name)} · Poz. ${h.level}${sick ? ' · w leczeniu do następnego tygodnia' : ''}</span></label>`; }).join('') || '<p class="muted">Rejestr jest pusty — dodaj bohaterów w zakładce Bohaterowie.</p>'}</div>`,
      [{ t: 'Anuluj' }, { t: 'Ustaw', cls: 'primary', fn: () => {
        const picked = $$('.flist input:checked').map(i => i.value).filter(id => H(id) && H(id).status !== 'leczenie');
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
    if (st0.fight && h.fx && h.fx.lostTurn === (st0.round || 0) && (curEntry() || {}).id === h.id) return toast('Tę turę przejęła Przypadłość.');
    if (h.state && h.state.kind === 'ekstaza' && !v.inf.attack) return toast('W Ekstazie bólu ' + heroLabel(h) + ' może tylko atakować.');
    if (CLS[h.cls].name === 'Ohyda' && v.s.form !== (h.form === 'beast' ? 'bestia' : 'człowiek')) return toast('Ta umiejętność należy do drugiej postaci Ohydy.');
    if (v.inf.target === 'self' || v.inf.target === 'party') { UI.pend = null; return commit(heroUse(h, i, [])); }
    if (v.inf.target === 'ally') { UI.pend = { hid: h.id, idx: i, need: 'ally', label: v.s.name + ' — kliknij sojusznika' }; return renderView(); }
    const valid = validEnemyTargets(v);
    if (!valid.length) return toast('Nikt nie stoi na pozycjach ' + v.s.w + '.');
    if (v.inf.target === 'multi') { UI.pend = { hid: h.id, idx: i, need: 'enemy', valid, multi: true, label: v.s.name + ' (pozycje ' + v.s.w + ')' }; return renderView(); }
    UI.pend = { hid: h.id, idx: i, need: 'enemy', valid, label: v.s.name + ' (pozycje ' + v.s.w + ')' }; renderView();
  },
  pickEnemy: el => { const P = UI.pend; UI.pend = null; if (P.multi) return commit(heroUse(H(P.hid), P.idx, P.valid)); commit(heroUse(H(P.hid), P.idx, [el.dataset.id])); },
  fireMulti: () => { const P = UI.pend; UI.pend = null; commit(heroUse(H(P.hid), P.idx, P.valid)); },
  pickAlly: el => { const P = UI.pend; UI.pend = null; commit(heroUse(H(P.hid), P.idx, [el.dataset.id])); },
  heroMove: el => {
    const id = UI.sel.id; const st0 = Store.S.stol; const i = st0.heroes.indexOf(id); const j = i + +el.dataset.d; const rd = st0.round || 0;
    const blk = [id, st0.heroes[j]].map(H).find(x => x && x.fx && x.fx.noSwap != null && x.fx.noSwap >= rd && st0.fight);
    if (blk) return toast(heroLabel(blk) + ' odmawia zamiany pozycji (' + (blk.state ? blk.state.name : 'Przypadłość') + ').');
    setStol(st => { moveInList(st.heroes, i, +el.dataset.d); }, heroLabel(H(id)) + ' zmienia pozycję.');
  },
  heroPass: () => rollLog(heroLabel(H(UI.sel.id)) + ' pasuje.', '', 'sys'),
  transform: () => {
    const h = clone(H(UI.sel.id)); const lines = [];
    if (h.form === 'beast') { h.form = 'human'; lines.push(heroLabel(h) + ' wraca do ludzkiej postaci.'); }
    else {
      h.form = 'beast'; const r = d(4); heroHeal(h, r, lines); lines.push(heroLabel(h) + ' przemienia się w bestię i leczy ' + r + '.');
      if (!Store.S.stol.transformed || !Store.S.stol.transformed.includes(h.id)) {
        const st = clone(Store.S.stol); st.transformed = (st.transformed || []).concat(h.id);
        const touched = { [h.id]: h };
        st.heroes.filter(id => id !== h.id).forEach(id => { const t = clone(H(id)); heroStress(t, 1, lines); touched[id] = t; });
        lines.push('Pierwsza przemiana w tej walce: sojusznicy +1 Stres.');
        return commit({ lines, stol: st, touched });
      }
    }
    commit({ lines, stol: null, touched: { [h.id]: h } });
  },
  retreat: () => {
    const r = d(10); const ok = r <= 7 && r !== 10;
    const lines = ['Odwrót: k10 = **' + r + '** przy Szansie 7 → **' + (ok ? 'udany' : 'nieudany, tura stracona') + '**.'];
    const touched = {};
    if (ok) Store.S.stol.heroes.forEach(id => { const t = clone(H(id)); heroStress(t, 1, lines); touched[id] = t; });
    if (ok) lines.push('Każdy bohater +1 Stres. Drużyna wraca do poprzedniej komnaty.');
    commit({ lines, stol: ok ? Object.assign(clone(Store.S.stol), { fight: false, init: [], turn: -1 }) : null, touched }, ok ? '' : 'bad');
  },
  useItem: el => {
    const h = clone(H(UI.sel.id)); const k = el.dataset.k; const w = el.dataset.w;
    const sup = Store.S.wyprawa.sup || {}; const lines = [];
    if (Store.S.wyprawa.quest && !(sup[k] > 0)) return toast('W plecaku nie ma już: ' + k.toLowerCase() + '.');
    h.fx = Object.assign({}, h.fx);
    if (w === 'bleed') { h.fx.bleed = []; lines.push(heroLabel(h) + ' zakłada bandaż: krwawienie ustaje.'); }
    if (w === 'blight') { h.fx.blight = []; lines.push(heroLabel(h) + ' pije antidotum: zaraza ustępuje.'); }
    if (w === 'horror') { h.fx.horror = []; lines.push(heroLabel(h) + ' bierze laudanum: groza mija.'); }
    if (w === 'debuff') { h.fx.buffs = (h.fx.buffs || []).filter(b => !/−/.test(b[0])); lines.push(heroLabel(h) + ' żuje zioła: osłabienia znikają.'); }
    if (w === 'food') { heroHeal(h, 1, lines); lines.push(heroLabel(h) + ' je prowiant: +1 Zdrowia.'); }
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
  clearE: () => setStol(st => { st.enemies = []; st.init = st.init.filter(x => x.k === 'h'); }),
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
  eRemove: () => setStol(st => { st.enemies = st.enemies.filter(x => x.id !== UI.sel.id); st.init = st.init.filter(x => x.id !== UI.sel.id); }),
  eSay: el => { const e = Store.S.stol.enemies.find(x => x.id === UI.sel.id); rollLog('**' + e.name + '**: ' + attackText(e.attacks[+el.dataset.i]).replace(/<\/?b>/g, ''), '', 'roll'); },
  bossMove: () => {
    const e = Store.S.stol.enemies.find(x => x.id === UI.sel.id); const r = d(6);
    const pat = (e.notes || []).find(n => /Wzór ruchów/.test(n)) || '';
    rollLog('**' + e.name + '** — druga tura: k6 = **' + r + '**. ' + pat.replace(/^Wzór ruchów:\s*/, 'Wzór: '), 'crit');
  },
  eAtk: el => {
    const e = Store.S.stol.enemies.find(x => x.id === UI.sel.id); const i = +el.dataset.i; const a = e.attacks[i]; const m = el.dataset.m;
    const order = Store.S.stol.heroes; const allowed = posList(a.w) || [1, 2, 3, 4];
    const inRange = order.map((id, k) => ({ id, pos: k + 1 })).filter(x => allowed.includes(x.pos) && H(x.id) && !H(x.id).dead).map(x => x.id);
    if (!inRange.length) return toast('Na pozycjach ' + a.w + ' nikogo nie ma.');
    if (m === 'all') return commit(enemyAttack(e, i, inRange));
    if (m === 'pick') { UI.epend = { eid: e.id, idx: i, valid: inRange, label: 'uderza ' + a.name }; return renderView(); }
    const marked = inRange.filter(id => (H(id).fx || {}).mark);
    const pool = marked.length ? marked : inRange; const pt = pickD(pool); let t = pt.v;
    let note = pool.length > 1 ? 'Cel losowany spośród ' + pool.map(x => heroLabel(H(x))).join(', ') + ': ' + pt.t + ' → ' + heroLabel(H(t)) + '.' : marked.length ? 'Cel: ' + heroLabel(H(t)) + ' (Znak).' : '';
    const g = (H(t).fx || {}); if (g.guard && g.guardBy && order.includes(g.guardBy) && !H(g.guardBy).dead) { t = g.guardBy; note += ' Ochrona: atak przejmuje ' + heroLabel(H(t)) + '.'; }
    const res = enemyAttack(e, i, [t]); if (note && res) { res.lines.splice(1, 0, note); res.sum && res.sum.unshift(note); } commit(res);
  },
  pickHeroT: el => {
    const P = UI.epend; UI.epend = null; const e = Store.S.stol.enemies.find(x => x.id === P.eid);
    let t = el.dataset.id; const g = (H(t).fx || {}); if (g.guard && g.guardBy && Store.S.stol.heroes.includes(g.guardBy)) t = g.guardBy;
    commit(enemyAttack(e, P.idx, [t]));
  },
  /* przebieg walki */
  fightStart: () => {
    const s = Store.S.stol; const ti = torchInfo(s.torch); const r = d(10); const lines = [];
    const sur = ti.surprise; let who = 'nikt';
    const m = { 'Jasno': [r <= 3, r === 10], 'Półmrok': [r <= 2, r >= 9], 'Cienie': [r === 1, r >= 8], 'Mrok': [false, r >= 7], 'Ciemność': [false, r >= 6] }[ti.name];
    if (m[0]) who = 'wrogowie'; if (m[1]) who = 'drużyna';
    lines.push('**Walka!** Zaskoczenie (' + ti.name + ', ' + sur + '): k10 = **' + r + '** → ' + (who === 'nikt' ? 'nikt nie jest zaskoczony.' : who === 'wrogowie' ? '**wrogowie zaskoczeni** — drużyna ma całą pierwszą rundę.' : '**drużyna zaskoczona** — wrogowie mają całą pierwszą rundę, pozycje bohaterów losuje się od nowa, każdy +1 Stres.'));
    const st = clone(s); st.fight = true; st.round = 0; st.init = []; st.turn = -1; st.transformed = [];
    const touched = {};
    const hasUndead = s.enemies.some(e => /Nieumar/.test(e.type || ''));
    st.heroes.forEach(id => {
      const h = touched[id] = clone(H(id)); const hs = heroStats(h); let add = 0; const why = [];
      if (who === 'drużyna') { add++; why.push('zaskoczenie'); }
      if (s.torch === 0) { add++; why.push('Ciemność'); }
      if (hs.fightStress) { add += hs.fightStress; why.push('Kieł spoza gwiazd'); }
      if (h.qn.some(q => qname(q.t) === 'Klaustrofobia') && /Ruiny|Nory/.test(s.region)) { add++; why.push('Klaustrofobia'); }
      if (h.qn.some(q => qname(q.t) === 'Lęk przed nieumarłymi') && hasUndead) { add++; why.push('Lęk przed nieumarłymi'); }
      if (add) { lines.push(heroLabel(h) + ' +' + add + ' Stresu (' + why.join(', ') + ').'); heroStress(h, add, lines); }
    });
    if (who === 'drużyna') { for (let i = st.heroes.length - 1; i > 0; i--) { const j = d(i + 1) - 1; [st.heroes[i], st.heroes[j]] = [st.heroes[j], st.heroes[i]]; } }
    st.surprise = who;
    commit({ lines, stol: st, touched }, who === 'drużyna' ? 'bad' : '');
    setTimeout(() => ACT.newRound(), 50);
  },
  newRound: () => {
    const s = clone(Store.S.stol); s.round = (s.round || 0) + 1; const init = [];
    const sur = s.round === 1 ? s.surprise : null;
    s.heroes.forEach(id => { const h = H(id); if (!h || h.dead) return; const r = d(10); init.push({ k: 'h', id, roll: r, tot: r + heroStats(h).speed, late: sur === 'drużyna' }); });
    s.enemies.forEach(e => { if (e.corpse) return; const turns = e.boss ? 2 : 1; for (let t = 0; t < turns; t++) { const r = d(10); init.push({ k: 'e', id: e.id, roll: r, tot: r + e.speed + (fxMods(e.fx).speed || 0), second: t === 1, late: sur === 'wrogowie' }); } });
    init.sort((a, b) => (a.late - b.late) || (b.tot - a.tot) || (a.k === 'h' ? -1 : 1));
    s.init = init; s.turn = 0;
    const nm = x => x.k === 'h' ? heroLabel(H(x.id)) : (s.enemies.find(e => e.id === x.id) || {}).name;
    const txt = '**Runda ' + s.round + '.** Inicjatywa (k10 + Szybkość): ' + init.map(x => nm(x) + ' ' + x.tot).join(', ') + (sur && sur !== 'nikt' ? ' — zaskoczeni działają na końcu.' : '.');
    Store.act([opSet('stol', s), { log: { id: uid(), t: Date.now(), by: byName(), uid: Store.me.id, kind: 'roll', text: txt } }]);
    const first = init[0]; if (first) { const res = startTurn(first); if (res && !res.quiet) commit(res); runFollow(res); }
  },
  nextTurn: () => {
    const s = Store.S.stol;
    if (s.turn + 1 >= s.init.length) return ACT.newRound();
    setStol(st => { st.turn++; });
    const e = Store.S.stol.init[Store.S.stol.turn];
    const res = startTurn(e); if (res && !res.quiet) commit(res); runFollow(res);
  },
  fightEnd: () => {
    const s = clone(Store.S.stol); const touched = {}; const lines = ['**Koniec walki.** Efekty wygasają.'];
    s.heroes.forEach(id => {
      const h = touched[id] = clone(H(id)); h.fx = {}; h.fatigue = 0; h.block = 0; h.form = 'human';
      if (h.exhausted) { h.exh = (h.exh || 1) - 1; if (h.exh <= 0) { h.exhausted = false; h.exh = 0; } }
    });
    s.fight = false; s.init = []; s.turn = -1; s.round = 0; s.last = null; s.enemies = s.enemies.filter(e => !e.corpse);
    commit({ lines, stol: s, touched }, 'sys');
  },
  lootFight: () => {
    const s = Store.S.stol; const boss = s.enemies.some(e => e.boss) || (Store.S.stol.lastBoss);
    const ti = torchInfo(s.torch); const extra = { 'Jasno': -1, 'Półmrok': 0, 'Cienie': 1, 'Mrok': 1, 'Ciemność': 2 }[ti.name];
    const n = Math.max(0, (boss ? 4 : 1) + extra); rollLoot(n, 'wygrana walka');
  }
});
const MEM_TYPES = ['Popiersie', 'Portret', 'Akt', 'Herb'];
const SUP_KEYS = ['Prowiant', 'Pochodnie', 'Łopaty', 'Bandaże', 'Antidota', 'Laudanum', 'Zioła', 'Woda święcona', 'Klucze'];
const lootMult = () => [1, 1.5, 2][+(Store.S.wyprawa.quest ? Store.S.wyprawa.quest.dl : Store.S.stol.dl) || 0];
/* łup trafia do plecaka wyprawy (albo prosto do skarbca, gdy nie ma wyprawy) i jest pokazywany wszystkim jako karta */
function rollLoot(n, why) {
  const items = []; let gold = 0, gems = 0; const mem = {}; const sup = {}; const mult = lootMult();
  for (let i = 0; i < n; i++) {
    const r = rollTable('lup');
    if (r.r <= 4) { const g = d(6); gold += g; items.push('k10 = **' + r.r + '** → ' + g + ' Złota (k6 = **' + g + '**)'); }
    else if (r.r <= 6) { const pm = pickD(MEM_TYPES); mem[pm.v] = (mem[pm.v] || 0) + 1; items.push('k10 = **' + r.r + '** → pamiątka: ' + pm.v + ' (k4 = **' + pm.r + '**)'); }
    else if (r.r === 7) { const a = pickD(SUP_KEYS), b2 = pickD(SUP_KEYS); [a, b2].forEach(x => { sup[x.v] = (sup[x.v] || 0) + (x.v === 'Prowiant' ? 2 : 1); }); items.push('k10 = **' + r.r + '** → zapasy: ' + a.v.toLowerCase() + ' (k9 = **' + a.r + '**) i ' + b2.v.toLowerCase() + ' (k9 = **' + b2.r + '**)'); }
    else { gems++; items.push('k10 = **' + r.r + '** → klejnot (10 Złota)'); }
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
function lootStrip() {
  const w = Store.S.wyprawa; if (!w.quest) return '';
  const L = w.loot || {}; const mult = DL_INFO[w.quest.dl].mult;
  const parts = lootTotals({ gold: L.zloto, gems: L.klejnoty, mem: L.mem, trinkets: L.trinkets }, 1).map(p => p.replace(/ \(×.*?\)/, ''));
  return `<div class="lootstrip"><span class="lbl">Łupy wyprawy</span> ${parts.length ? parts.map(p => `<span class="chip">${esc(p)}</span>`).join('') : '<span class="muted small">jeszcze nic</span>'}${L.klejnoty ? `<span class="muted small">klejnoty liczone ×${String(mult).replace('.', ',')} przy powrocie</span>` : ''}</div>`;
}
