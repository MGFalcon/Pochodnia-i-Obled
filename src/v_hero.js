/* Widok Bohaterowie: rejestr i karta bohatera w układzie z Darkest Dungeon. */
const COMMON_CAMP = [{ name: 'Zachęta', pts: 2, eff: 'sojusznik −2 Stres' }, { name: 'Pierwsza pomoc', pts: 3, eff: 'sojusznik +3 Zdrowia, usuwa krwawienie i zarazę' }, { name: 'Pogadanka', pts: 2, eff: 'sojusznik Krzepa i Odporność +2 na następną walkę' }];
const LEARN_CAMP = [{ name: 'Czujność', eff: 'zasadzka nocna tylko przy 1' }, { name: 'Racje', eff: 'każdy posiłek +1 Zdrowia' }, { name: 'Tropienie', eff: 'następny Zwiad +2' }];
const ALL_TRINKETS = () => DATA.trinkets.common.map(t => Object.assign({ kind: 'common', value: 10 }, t)).concat(DATA.trinkets.rare.map(t => Object.assign({ kind: 'rare', value: 15 }, t)), [{ kind: 'kiel', name: 'Kieł spoza gwiazd', plus: 'Kryt +1 i obrażenia +1', minus: 'Szansa Cnoty −1, +1 Stres na początku walki', value: 0 }]);
const trinketDesc = t => t.kind === 'class' ? 'błyskotka klasowa: ' + CLS[t.cls].name + ', ' + (t.skill == null ? 'umiejętność do wybrania' : CLS[t.cls].skills[t.skill].name + ' +1') : (t.plus + (t.minus ? ' · ' + t.minus : ''));

function emblem(c) {
  const initials = c.name.split(' ').map(w => w[0]).join('').slice(0, 2);
  return `<svg class="emblem" viewBox="0 0 120 140" role="img" aria-label="Herb klasy ${esc(c.name)}">
    <path d="M10 8 H110 V62 C110 100 84 122 60 134 C36 122 10 100 10 62 Z" fill="var(--stone3)" stroke="var(--gold2)" stroke-width="3"/>
    <path d="M20 18 H100 V62 C100 94 79 112 60 122 C41 112 20 94 20 62 Z" fill="none" stroke="var(--rule2)" stroke-width="1.5"/>
    <text x="60" y="80" text-anchor="middle" font-family="Grenze Gotisch, Georgia, serif" font-size="46" font-weight="700" fill="var(--bone)">${esc(initials)}</text>
    <g fill="var(--bone3)">${[1, 2, 3, 4].map(i => `<circle cx="${30 + (i - 1) * 20}" cy="104" r="4.5" fill="${posList(c.pos) && posList(c.pos).includes(i) ? 'var(--gold)' : 'var(--rule)'}"/>`).join('')}</g>
  </svg>`;
}
function pips(kind, n, max, bind, marks, opts = {}) {
  let html = '';
  for (let i = 1; i <= max; i++) html += `<button class="pip ${kind} ${i <= n ? 'on' : ''} ${marks && marks.includes(i) ? 'mark' : ''} ${opts.hi && i >= opts.hi ? 'hi' : ''}" data-act="pip" data-k="${bind}" data-v="${i}" aria-label="${i}" ${opts.dis ? 'disabled' : ''}>${marks && marks.includes(i) ? i : ''}</button>`;
  return `<div class="pips">${html}</div>`;
}
function rankRow(h, key, label, building, cost) {
  const r = h.gear[key]; const mx = maxRank(h, Store.S.osada.b[building]); const can = canHero(h);
  return `<div class="rank"><span class="rl">${label}</span><span class="rp">${[1, 2, 3, 4].map(i => `<button class="rk ${i <= r ? 'on' : ''} ${i > mx ? 'lock' : ''}" data-act="rankSet" data-k="${key}" data-v="${i}" ${can ? '' : 'disabled'} title="${i > mx ? 'Zablokowane: ranga najwyżej Poziom + 1 i stopień budynku + 1' : 'Ranga ' + i}">${i}</button>`).join('')}</span>
    ${can && r < 4 ? `<button class="btn sm ghost" data-act="rankBuy" data-k="${key}" data-b="${building}" data-c="${cost}" ${r + 1 > mx ? 'disabled' : ''}>${building}: ${cost * (r + 1)} Z</button>` : ''}</div>`;
}
function statCell(st, k, label, v) {
  return `<div class="stat" title="${esc(whyText(st, k))}"><span class="sl">${label}</span><b class="sv num">${v}</b><span class="sw">${esc(whyText(st, k))}</span></div>`;
}

VIEWS.bohaterowie = {
  render() {
    const all = heroes(); const filt = UI.hfilter || 'all';
    const list = all.filter(h => filt === 'dead' ? h.dead : !h.dead).filter(h => filt !== 'mine' || h.owner === Store.me.id);
    if (UI.heroSel && !H(UI.heroSel)) UI.heroSel = null;
    if (!UI.heroSel && list.length) UI.heroSel = (list.find(h => h.owner === Store.me.id) || list[0]).id;
    const sel = UI.heroSel && H(UI.heroSel);
    const W = Store.canWrite();
    const regCount = all.filter(h => !h.dead).length;
    return `${lootCardHtml()}<section class="panel roster">
      <h2>Rejestr <span class="hint">${regCount} / ${Store.S.osada.slots} miejsc</span></h2>
      <div class="row">
        <div class="seg">${[['all', 'Wszyscy'], ['mine', 'Moi'], ['dead', 'Cmentarz']].map(([k, t]) => `<button class="btn sm ${filt === k ? 'gold' : 'ghost'}" data-act="hfilter" data-v="${k}">${t}</button>`).join('')}</div>
        <span class="sp"></span>
        ${W ? `<button class="btn sm primary" data-act="recruit">Rekrut z dyliżansu (k20)</button><button class="btn sm" data-act="pickClass">Wybierz klasę</button>` : ''}
      </div>
      <div class="rlist">${list.map(h => {
        const st = heroStats(h);
        return `<button class="rcard ${UI.heroSel === h.id ? 'on' : ''} ${h.dead ? 'dead' : ''} ${!h.dead && heroAway(h) ? 'sick' : ''}" data-act="heroSel" data-id="${h.id}" ${!h.dead && heroAway(h) ? `title="${esc(heroAway(h))}"` : ''}>
          <span class="rp2">${portraitHtml(h, 'rp-img')}</span><span class="rn">${esc(heroLabel(h))}</span><span class="rc">${h.name ? esc(CLS[h.cls].name) + ' · ' : ''}Poz. ${h.level}</span>
          ${h.dead ? `<span class="rc">☩ ${esc(h.deathCause || '')}</span>` : bar('hp', h.hp, st.maxhp, h.hp + '/' + st.maxhp) + bar('st', h.stress, 20, 'Stres ' + h.stress)}
          <span class="ro">${esc(ownerName(h))}${h.status && h.status !== 'osada' ? ' · ' + esc(h.status) : ''}</span></button>`;
      }).join('') || `<div class="empty-state"><p>${filt === 'dead' ? 'Cmentarz jest jeszcze pusty.' : 'W rejestrze nie ma jeszcze bohaterów.'}</p>${W && filt !== 'dead' ? '<p class="dim">Każdy gracz wybiera na start klasę jednego bohatera, resztę losujecie z dyliżansu (k20).</p>' : ''}</div>`}</div>
    </section>
    ${sel ? this.sheet(sel) : ''}`;
  },
  sheet(h) {
    const c = CLS[h.cls]; const st = heroStats(h); const can = canHero(h); const P = 'heroes.' + h.id;
    const dis = can ? '' : 'disabled';
    const nChosen = h.skills.length;
    const affl = h.state ? h.state.kind + ':' + h.state.name : '';
    return `<section class="sheet panel" aria-label="Karta bohatera">
      <div class="sh-head">
        <div class="pframe">${portraitHtml(h, 'portrait')}
          ${can ? `<label class="btn sm ghost pbtn" for="pf-${h.id}">Zmień portret</label><input type="file" id="pf-${h.id}" accept="image/*" data-portrait="${h.id}" hidden>${h.portrait ? `<button class="btn sm ghost pbtn" data-act="portraitReset">Domyślny</button>` : ''}` : ''}</div>
        <div class="sh-id">
          <input type="text" class="hname" id="hn-${h.id}" data-bind="${P}.name" value="${esc(h.name)}" placeholder="Imię bohatera" ${dis} aria-label="Imię bohatera">
          <div class="hcls">${esc(c.name)} <span class="muted">· ${esc(c.role || '')}</span></div>
          ${h.story ? `<div class="hstory small"><span class="muted">${esc(h.story.origin)}.</span> Marzenie: ${esc(h.story.dreamText)} <span class="muted">(${h.story.done ? '<b>spełnione</b>' : 'cel: ' + esc(h.story.goal) + ' → pozytywne dziwactwo'})</span></div>` : can ? `<button class="btn sm ghost" data-act="storyRoll">Nadaj historię (pochodzenie i marzenie)</button>` : ''}
          ${Object.entries(h.bonds || {}).filter(([id, n]) => n && H(id) && !H(id).dead).length ? `<div class="hbonds small">${Object.entries(h.bonds).filter(([id, n]) => n && H(id) && !H(id).dead).map(([id, n]) => `<span class="chip sm ${n >= 2 ? 'gold' : n <= -2 ? 'red' : ''}">${esc(heroLabel(H(id)))}: ${bondName(n)}</span>`).join('')}</div>` : ''}
          <div class="row lvl"><span class="lbl">Poziom</span>${[0, 1, 2, 3, 4, 5, 6].map(i => `<button class="lv ${i === h.level ? 'on' : ''}" data-act="setLevel" data-v="${i}" ${dis}>${i}</button>`).join('')}
            <span class="lbl">znaczniki</span>${[1, 2].map(i => `<i class="xp ${i <= h.xp ? 'on' : ''}"></i>`).join('')}
            ${can ? `<button class="btn sm ghost" data-act="addXp" data-v="1">+1</button><button class="btn sm ghost" data-act="addXp" data-v="2">+2</button><button class="btn sm ghost" data-act="addXp" data-v="3">+3</button>` : ''}</div>
          <div class="row"><span class="chip">${esc(ownerName(h))}</span>
            ${Store.canWrite() && h.owner !== Store.me.id && (Store.isGM() || !h.owner) ? `<button class="btn sm ghost" data-act="claim">Przypisz do mnie</button>` : ''}
            ${Store.isGM() && h.owner ? `<button class="btn sm ghost" data-act="unclaim">Zwolnij</button>` : ''}
            <label class="lbl" for="hs-${h.id}">gdzie</label><select id="hs-${h.id}" data-bind="${P}.status" ${dis}>${['osada', 'wyprawa', 'leczenie'].map(s => `<option ${h.status === s ? 'selected' : ''}>${s}</option>`).join('')}</select>
          </div>
        </div>
        <div class="sh-desc dim">${esc(c.desc)}</div>
      </div>
      ${h.dead ? `<p class="deadnote">☩ Poległ: ${esc(h.deathCause || '')}${h.deathWeek ? ', tydzień ' + h.deathWeek : ''}.</p>` : ''}
      <div class="sh-grid">
        <div class="col">
          <div class="box"><div class="ph">Zdrowie <span class="hint num">${h.hp} / ${st.maxhp}</span></div>${pips('hp', h.hp, st.maxhp, 'hp', null, { dis: !can })}
            <div class="row"><label class="chk"><input type="checkbox" data-bind="${P}.dd" ${h.dd ? 'checked' : ''} ${dis}> Próg Śmierci</label><label class="chk"><input type="checkbox" data-bind="${P}.exhausted" ${h.exhausted ? 'checked' : ''} ${dis}> Wyczerpanie</label>${h.dd && can ? `<button class="btn sm primary" data-act="sheetDeath">Rzut Śmierci (≤ ${st.death})</button>` : ''}</div></div>
          <div class="box"><div class="ph">Stres <span class="hint num">${h.stress} / 20${st.heart < 20 ? ' · zawał przy ' + st.heart : ''}</span></div>${pips('st', h.stress, 20, 'stress', [10, 20], { hi: 10, dis: !can })}
            <div class="row"><select data-act-change="state" id="hst-${h.id}" ${dis} aria-label="Cnota albo Przypadłość">
              <option value="">— bez Cnoty i Przypadłości —</option>
              <optgroup label="Cnoty">${DATA.virtues.map(v => `<option value="virtue:${v.name}" ${affl === 'virtue:' + v.name ? 'selected' : ''}>${v.name}</option>`).join('')}</optgroup>
              <optgroup label="Przypadłości">${DATA.afflictions.map(v => `<option value="affliction:${v.name}" ${affl === 'affliction:' + v.name ? 'selected' : ''}>${v.name}</option>`).join('')}${c.name === 'Biczownik' ? `<option value="ekstaza:Ekstaza bólu" ${affl === 'ekstaza:Ekstaza bólu' ? 'selected' : ''}>Ekstaza bólu</option>` : ''}</optgroup></select>
              ${can ? `<button class="btn sm" data-act="sheetTest">Próba Charakteru (≤ ${st.virtue})</button>` : ''}</div>
            ${h.state ? `<p class="small ${h.state.kind === 'virtue' ? 'virtue-t' : 'affl-t'}">${esc(h.state.kind === 'virtue' ? (DATA.virtues.find(v => v.name === h.state.name) || {}).perm + '; przy 1–3 na początku tury: ' + (DATA.virtues.find(v => v.name === h.state.name) || {}).proc : h.state.kind === 'ekstaza' ? 'Co turę musi atakować, nie leczy innych, traci 1 Zdrowia na początku tury; Stres z ataków wrogów go nie dotyczy.' : 'Przy 1–3 na początku tury: ' + ((DATA.afflictions.find(v => v.name === h.state.name) || {}).combat || ''))}</p>` : ''}
          </div>
          <div class="box"><div class="ph">Statystyki <span class="hint">najedź albo dotknij, by zobaczyć skąd</span></div>
            <div class="stats">
              ${statCell(st, 'hp', 'Zdrowie', st.maxhp)}${statCell(st, 'dodge', 'Unik', st.dodge)}${statCell(st, 'prot', 'Pancerz', st.prot)}${statCell(st, 'speed', 'Szybkość', st.speed)}
              ${statCell(st, 'crit', 'Kryt', st.crit)}${statCell(st, 'acc', 'Celność', sgn(st.acc))}${statCell(st, 'dmg', 'Obrażenia', sgn(st.dmg))}
            </div>
            <div class="ph">Odporności</div>
            <div class="stats">${statCell(st, 'krzepa', 'Krzepa', st.krzepa)}${statCell(st, 'odp', 'Odporność', st.odp)}${statCell(st, 'death', 'Śmierć', st.death)}${statCell(st, 'virtue', 'Szansa Cnoty', st.virtue)}</div>
          </div>
          <div class="box"><div class="ph">Ekwipunek <span class="hint">ranga najwyżej Poziom + 1</span></div>
            ${rankRow(h, 'weapon', 'Broń', 'Kuźnia', 6)}${rankRow(h, 'armor', 'Pancerz', 'Kuźnia', 6)}${rankRow(h, 'guild', 'Umiejętności', 'Gildia', 8)}
            <p class="small muted">Broń: obrażenia +1 na randze 2 i 4. Pancerz: Zdrowie +1 za rangę. Gildia: Celność +1 na randze 1 i 3, Kryt +1 na 2, główna liczba +1 na 4.</p>
          </div>
          <div class="box"><div class="ph">Błyskotki <span class="hint">najwyżej 2, bez powtórzeń</span></div>
            ${[0, 1].map(i => { const t = h.trinkets[i]; return `<div class="trk">${t ? `<b>${esc(t.name)}</b> <span class="dim small">${esc(trinketDesc(t))}</span>${can ? ` <button class="btn sm ghost" data-act="trkOff" data-i="${i}">Do magazynu</button>` : ''}` : `<span class="muted">puste miejsce</span>${can ? ` <button class="btn sm ghost" data-act="trkOn">Załóż z magazynu</button>` : ''}`}</div>`; }).join('')}
          </div>
        </div>
        <div class="col">
          <div class="box"><div class="ph">Umiejętności bojowe <span class="hint">zabierasz ${nChosen} z 4</span></div><p class="legend-pos"><span class="pdots from"><i class="on"></i></span> złote — z której pozycji bohatera (4 3 2 1, jak na polu) · <span class="pdots to"><i class="on"></i></span> czerwone — które pozycje wroga trafia (1 2 3 4)</p>
            <div class="sk-list">${c.skills.map((s, i) => {
              const v = skillView(h, i, st); const on = h.skills.includes(i);
              return `<div class="sk ${on ? 'on' : ''}">
                <button class="sk-t" data-act="skillToggle" data-i="${i}" ${dis} aria-pressed="${on}" title="${on ? 'Zabrana na wyprawę' : 'Zostaje w Osadzie'}"></button>
                <div class="sk-b"><div class="sk-n">${esc(s.name)}${s.form ? ` <span class="chip sm">${esc(s.form)}</span>` : ''}${v.tb ? ' <span class="chip sm gold">błyskotka +1</span>' : ''}</div>
                <div class="sk-m">${posDots(v.inf.from, 'from')}<span class="sep">▸</span>${v.inf.to ? posDots(v.inf.to, v.inf.target === 'multi' ? 'to multi' : 'to') : `<span class="tw">${esc(s.w)}</span>`}<span class="ptxt">${esc(skillPosTxt(v))}</span>
                  <span class="num">${v.cel != null ? 'Cel. ' + v.cel : ''}${v.dmg ? ' · ' + v.dmg : ''}${v.heal && !v.dmg ? ' · leczy ' + v.heal : ''}${v.stress && !v.dmg ? ' · −' + v.stress + ' Stres' : ''} · kryt ≤ ${v.crit}</span></div>
                <div class="sk-e dim">${esc(effectText(v)) || '—'}</div></div></div>`;
            }).join('')}</div>
            ${c.notes.length ? `<div class="cnotes small">${c.notes.map(n => `<p>${md(n)}</p>`).join('')}</div>` : ''}
          </div>
          <div class="box"><div class="ph">Obóz <span class="hint">12 Punktów Odpoczynku na drużynę</span></div>
            <ul class="camp">${c.camp.map(x => `<li><b>${esc(x.name)}</b> <span class="num muted">${x.pts} pkt</span> — ${esc(x.eff)}</li>`).join('')}
            ${COMMON_CAMP.map(x => `<li><b>${esc(x.name)}</b> <span class="num muted">${x.pts} pkt</span> — ${esc(x.eff)}</li>`).join('')}</ul>
            <div class="row"><span class="lbl">Obozownik ${Math.max(1, 4 - ((Store.S.osada.b || {}).Obozownik || 0))} Z</span>${LEARN_CAMP.map(x => `<label class="chk" title="${esc(x.eff)}"><input type="checkbox" data-act-change="camp" value="${x.name}" ${h.camp.includes(x.name) ? 'checked' : ''} ${dis}> ${x.name}</label>`).join('')}</div>
          </div>
          <div class="box qbox">
            <div class="ph">Dziwactwa <span class="hint">do 5 pozytywnych i 5 negatywnych</span></div>
            ${['qp', 'qn'].map(k => `<div class="qcol ${k}"><span class="lbl">${k === 'qp' ? 'Pozytywne' : 'Negatywne'}</span>
              ${h[k].map((q, i) => `<div class="q"><span>${esc(q.t)}</span><label class="chk small" title="Utrwalone w Sanatorium — nowe go nie wyprze"><input type="checkbox" data-act-change="qlock" data-k="${k}" data-i="${i}" ${q.lock ? 'checked' : ''} ${dis}> utrwalone</label>${can ? `<button class="x" data-act="qdel" data-k="${k}" data-i="${i}" aria-label="Usuń">×</button>` : ''}</div>`).join('') || '<p class="muted small">brak</p>'}
              ${can && h[k].length < 5 ? `<select data-act-change="qadd" data-k="${k}" aria-label="Dodaj dziwactwo"><option value="">+ dodaj…</option>${(k === 'qp' ? DATA.quirks_pos : DATA.quirks_neg).map(q => `<option>${esc(q)}</option>`).join('')}</select>` : ''}</div>`).join('')}
            ${can ? `<button class="btn sm" data-act="quirkRoll">Rzut po wyprawie (k10)</button>` : ''}
            <div class="ph">Choroby</div>
            ${h.diseases.map((x, i) => `<div class="q"><span>${esc(x)}</span>${can ? `<button class="x" data-act="ddel" data-i="${i}" aria-label="Usuń">×</button>` : ''}</div>`).join('') || '<p class="muted small">zdrowy</p>'}
            ${can ? `<select data-act-change="dadd" aria-label="Dodaj chorobę"><option value="">+ choroba…</option>${DATA.diseases.map(q => `<option>${esc(q)}</option>`).join('')}</select>` : ''}
          </div>
          ${can && !h.dead ? this.services(h) : ''}
          <div class="box"><div class="ph">Notatki</div><textarea id="hnote-${h.id}" data-bind="${P}.notes" ${dis} placeholder="Historia, blizny, długi, komu ufa…">${esc(h.notes || '')}</textarea></div>
          ${can ? `<div class="row"><span class="sp"></span><button class="btn sm ghost" data-act="heroDelete">Usuń z rejestru</button></div>` : ''}
        </div>
      </div>
    </section>`;
  },
  services(h) {
    const o = Store.S.osada; const b = o.b;
    const sanCost = n => Math.max(1, n - (b.Sanatorium || 0));
    const sanClosed = o.eventR === 3; const busy = heroBusy(h);
    const btn = (bd, sub) => { const v = svcState(h, bd, sub); return `<button class="btn sm" data-act="service" data-b="${bd}" data-s="${sub}" ${v.ok ? '' : 'disabled'} title="${esc(v.ok ? '−(k6+' + (4 + (b[bd] || 0)) + ') Stres, usuwa Przypadłość' : v.why)}">${sub} <span class="num">${v.cost} Z</span> <span class="muted small">${v.left}/${v.slots}</span></button>`; };
    return `<div class="box"><div class="ph">Osada <span class="hint">usługa = bohater opuszcza najbliższą wyprawę · skarbiec ${o.gold} Z</span></div>
      ${busy ? `<p class="small muted">${esc(busy)}</p>` : ''}
      <div class="row"><span class="lbl">Opactwo${o.eventR === 1 ? ' (Procesja: −2 Z)' : ''}</span>${SVC.Opactwo.map(x => btn('Opactwo', x)).join('')}</div>
      <div class="row"><span class="lbl">Gospoda${o.eventR === 5 ? ' — zamknięta (pożar)' : ''}</span>${SVC.Gospoda.map(x => btn('Gospoda', x)).join('')}</div>
      <p class="small dim">Stres: −(k6+${4 + (b.Opactwo || 0)}) w Opactwie, −(k6+${4 + (b.Gospoda || 0)}) w Gospodzie. Liczby przy usłudze to wolne miejsca w tym tygodniu. Przy każdej usłudze k10 = 1 oznacza skutek uboczny.</p>
      <div class="row"><span class="lbl">Sanatorium${sanClosed ? ' — zamknięte (zaraza)' : ''}</span>
        <button class="btn sm ghost" data-act="sanat" data-w="disease" ${h.diseases.length && !sanClosed && !busy ? '' : 'disabled'}>choroba ${sanCost(5)} Z</button>
        <button class="btn sm ghost" data-act="sanat" data-w="quirk" ${h.qn.some(q => !q.lock) && !sanClosed && !busy ? '' : 'disabled'}>negatywne dziwactwo ${sanCost(8)} Z</button>
        <button class="btn sm ghost" data-act="sanat" data-w="lock" ${h.qp.some(q => !q.lock) && !sanClosed && !busy ? '' : 'disabled'}>utrwal pozytywne ${sanCost(6)} Z</button>
      </div></div>`;
  }
};

/* usługi Osady: pod-usługi, miejsca w tygodniu, zamknięcia, zakazy, dziwactwa */
const SVC = { Opactwo: ['Medytacja', 'Modlitwa', 'Biczowanie'], Gospoda: ['Bar', 'Hazard', 'Dom Uciech'] };
function heroBusy(h) {
  const wk = Store.S.osada.week;
  if (h.dead) return 'Poległ.';
  if (h.status === 'wyprawa') return 'Jest na wyprawie.';
  if (h.status === 'leczenie') return 'Leczy się w tym tygodniu — wraca do gry od następnego.';
  if (h.status === 'przepadł') return 'Przepadł gdzieś w Osadzie — wróci w tygodniu ' + (h.awayUntil || wk + 1) + '.';
  return '';
}
function svcState(h, b, sub) {
  const o = Store.S.osada; const qn = h.qn.map(q => qname(q.t)); const cn = CLS[h.cls].name;
  const cost = Math.max(1, 4 - (b === 'Opactwo' && o.eventR === 1 ? 2 : 0) - (b === 'Opactwo' && o.abbeyDisc === o.week ? 1 : 0)); const slots = 2 + ((o.b || {})[b] || 0); const left = Math.max(0, slots - ((o.svc || {})[sub] || 0));
  const r = (why) => ({ ok: false, why, cost, slots, left });
  const busy = heroBusy(h); if (busy) return r(busy);
  if (b === 'Gospoda' && o.eventR === 5) return r('Gospoda zamknięta w tym tygodniu (pożar).');
  if (h.ban && h.ban.b === b && h.ban.until > o.week) return r('Zakaz wstępu do: ' + b + ' do tygodnia ' + h.ban.until + ' (awantura).');
  if (b === 'Opactwo' && (qn.includes('Bezbożnik') || cn === 'Ohyda')) return r(qn.includes('Bezbożnik') ? 'Bezbożnik nie wejdzie do Opactwa.' : 'Ohyda nie wejdzie do Opactwa.');
  if (b === 'Gospoda' && (qn.includes('Fanatyk') || cn === 'Biczownik')) return r(qn.includes('Fanatyk') ? 'Fanatyk leczy Stres tylko w Opactwie.' : 'Biczownik nie leczy się w Gospodzie.');
  if (qn.some(q => /Pijak/.test(q)) && !['Bar', 'Hazard'].includes(sub)) return r('Pijak albo Hazardzista leczy Stres tylko w Barze albo przy Hazardzie.');
  if (!left) return r('Brak wolnych miejsc w tym tygodniu.');
  return { ok: true, cost, slots, left };
}
/* nowe dziwactwo (k10 w tabeli); limit 5, nowe wypiera losowe nieutrwalone */
function gainQuirk(h, k, fixed) {
  const list = k === 'qp' ? DATA.quirks_pos : DATA.quirks_neg;
  let q, die = '';
  if (fixed) q = list.find(x => qname(x) === fixed) || fixed; else { const pq = pickD(list); q = pq.v; die = ' (' + pq.t + ')'; }
  let txt = heroLabel(h) + ' — ' + (k === 'qp' ? 'pozytywne' : 'negatywne') + ' dziwactwo' + die + ': ';
  if (h[k].some(x => x.t === q)) return txt + q + ' — już je ma, bez zmian.';
  if (h[k].length >= 5) {
    const free = h[k].map((x, i) => i).filter(i => !h[k][i].lock);
    if (!free.length) return txt + q + ' nie mieści się (wszystkie utrwalone).';
    const pf = pickD(free); const i = pf.v; const old = h[k][i].t; h[k][i] = { t: q, lock: false }; return txt + '**' + q + '** wypiera ' + old + ' (' + pf.t + ').';
  }
  h[k].push({ t: q, lock: false }); const st = heroStats(h); h.hp = Math.min(h.hp, st.maxhp);
  return txt + '**' + q + '**.';
}
/* dziwactwo po wyprawie: k10 1–2 pozytywne, 3–5 negatywne, 6–10 nic; limit 5, nowe wypiera losowe nieutrwalone */
function rollQuirkFor(h) {
  const r = d(10); let txt = heroLabel(h) + ' — dziwactwo po wyprawie: k10 = **' + r + '** → ';
  const add = (k, list) => {
    const pq = pickD(list); const q = pq.v; txt += '(' + pq.t + ') ';
    if (h[k].some(x => x.t === q)) { txt += 'wypada ' + q + ', które już ma — bez zmian.'; return; }
    if (h[k].length >= 5) {
      const free = h[k].map((x, i) => i).filter(i => !h[k][i].lock);
      if (!free.length) { txt += q + ' nie mieści się (wszystkie utrwalone).'; return; }
      const pf = pickD(free); const i = pf.v; txt += '**' + q + '** wypiera ' + h[k][i].t + ' (' + pf.t + ').'; h[k][i] = { t: q, lock: false }; return;
    }
    h[k].push({ t: q, lock: false }); txt += '**' + q + '**.';
  };
  if (r <= 2) { txt += 'nowe pozytywne: '; add('qp', DATA.quirks_pos); } else if (r <= 5) { txt += 'nowe negatywne: '; add('qn', DATA.quirks_neg); } else txt += 'nic się nie zmienia.';
  const st = heroStats(h); h.hp = Math.min(h.hp, st.maxhp);
  return { txt, cls: r <= 2 ? 'good' : r <= 5 ? 'bad' : '', r };
}
/* ---------- akcje karty ---------- */
const curHero = () => clone(H(UI.heroSel));
function dropFromParty(id) { const st = Store.S.stol; if (st.heroes.includes(id) && !Store.S.wyprawa.quest) Store.act([opSet('stol.heroes', st.heroes.filter(x => x !== id))], { quiet: true }); }
function payGold(n, what) {
  const o = Store.S.osada; if (o.gold < n) { toast('W skarbcu jest ' + o.gold + ' Złota, a potrzeba ' + n + '.'); return false; }
  Store.act([opSet('osada.gold', o.gold - n)], { quiet: true }); return true;
}
Object.assign(ACT, {
  hfilter: el => { UI.hfilter = el.dataset.v; UI.heroSel = null; renderView(); },
  heroSel: el => { UI.heroSel = el.dataset.id; renderView(); },
  recruit: () => {
    let r; do { r = d(20); } while (r > 17);
    const h = newHero(r - 1, { quirks: true }); h.owner = Store.isGM() ? null : Store.me.id; h.ownerName = Store.me.name;
    saveHero(h); UI.heroSel = h.id; UI.hfilter = 'all';
    rollLog('Dyliżans przywozi rekruta: k20 = **' + r + '** → **' + CLS[r - 1].name + '**; ' + (h._qroll || '') + ' → ' + h.qp[0].t + '; ' + h.qn[0].t + '.', '', 'sys'); delete h._qroll;
  },
  pickClass: () => {
    modal(`<h3>Wybierz klasę</h3><p class="dim">Na start kampanii każdy gracz wybiera klasę jednego bohatera, bez powtórzeń.</p>
      <div class="cgrid">${CLS.map((c, i) => `<button class="ctile" data-mb-cls="${i}">${classPortraitSvg(i, 'ct-img')}<b>${esc(c.name)}</b><span class="small dim">${esc(c.role || '')}</span><span class="small muted">poz. ${esc(c.pos || '')} · Zdr ${c.stats.hp}</span></button>`).join('')}</div>`, [{ t: 'Anuluj' }]);
    $$('[data-mb-cls]').forEach(b => b.addEventListener('click', () => {
      const h = newHero(+b.dataset.mbCls, { quirks: true }); h.owner = Store.isGM() ? null : Store.me.id; h.ownerName = Store.me.name;
      closeModal(); saveHero(h); UI.heroSel = h.id; UI.hfilter = 'all'; renderView();
    }));
  },
  portraitReset: () => { const h = curHero(); delete h.portrait; saveHero(h); },
  claim: () => { const h = curHero(); h.owner = Store.me.id; h.ownerName = Store.me.name; saveHero(h); },
  unclaim: () => { const h = curHero(); h.owner = null; saveHero(h); },
  setLevel: el => { const h = curHero(); const st0 = heroStats(h); h.level = +el.dataset.v; const st1 = heroStats(h); h.hp = clamp(h.hp + (st1.maxhp - st0.maxhp), 0, st1.maxhp); saveHero(h); },
  addXp: el => {
    const h = curHero(); const st0 = heroStats(h); h.xp += +el.dataset.v; let up = 0;
    while (h.xp >= 3 && h.level < 6) { h.xp -= 3; h.level++; up++; }
    if (h.level >= 6) h.xp = Math.min(h.xp, 2);
    const st1 = heroStats(h); h.hp = Math.min(st1.maxhp, h.hp + (st1.maxhp - st0.maxhp));
    saveHero(h); if (up) rollLog('**' + heroLabel(h) + '** awansuje na Poziom ' + h.level + '.', 'good', 'sys');
  },
  pip: el => {
    if (el.dataset.k === 'npchp') { const n = clone(Store.G.npc[UI.npcSel]); let v = +el.dataset.v; if (n.enemy.hp === v) v--; n.enemy.hp = v; npcSave(n); return renderView(); }
    const h = curHero(); if (!canHero(h)) return; const k = el.dataset.k; let v = +el.dataset.v;
    if (h[k] === v) v = v - 1;
    const lines = [];
    if (k === 'hp') { if (v < h.hp) { h.hp = v; if (v === 0) h.dd = true; } else heroHeal(h, v - h.hp, lines); }
    else { if (v > h.stress) heroStress(h, v - h.stress, lines); else heroStress(h, v - h.stress, lines); }
    if (lines.length) commit({ lines, stol: null, touched: { [h.id]: h } }); else saveHero(h);
  },
  sheetDeath: () => { const h = curHero(); const lines = []; heroDamage(h, 1, lines, 'Rzut Śmierci'); commit({ lines, stol: null, touched: { [h.id]: h } }); },
  sheetTest: () => { const h = curHero(); const lines = []; resolveTest(h, lines); commit({ lines, stol: null, touched: { [h.id]: h } }); },
  rankSet: el => { const h = curHero(); const k = el.dataset.k; let v = +el.dataset.v; if (h.gear[k] === v) v--; const st0 = heroStats(h); h.gear[k] = v; const st1 = heroStats(h); h.hp = clamp(h.hp + st1.maxhp - st0.maxhp, 0, st1.maxhp); saveHero(h); },
  rankBuy: el => {
    const h = curHero(); const k = el.dataset.k; const drunk = el.dataset.b === 'Kuźnia' && Store.S.osada.eventR === 8;
    const cost = drunk ? Math.ceil(+el.dataset.c * (h.gear[k] + 1) / 2) : +el.dataset.c * (h.gear[k] + 1);
    if (h.gear[k] + 1 > maxRank(h, Store.S.osada.b[el.dataset.b])) return toast('Ta ranga jest jeszcze zablokowana.');
    if (!payGold(cost)) return;
    if (drunk) { const r = d(10); if (r <= 3) return rollLog(heroLabel(h) + ': Pijany kowal (' + cost + ' Z) — k10 = **' + r + '** → ulepszenie się nie udaje, złoto przepada.', 'bad', 'sys'); rollLog('Pijany kowal: k10 = **' + r + '** → tym razem się udało.', 'good', 'sys'); }
    const st0 = heroStats(h); h.gear[k]++; const st1 = heroStats(h); h.hp = Math.min(st1.maxhp, h.hp + st1.maxhp - st0.maxhp);
    saveHero(h); rollLog(heroLabel(h) + ': ' + el.dataset.b + ' podnosi rangę (' + ({ weapon: 'broń', armor: 'pancerz', guild: 'umiejętności' }[k]) + ' ' + h.gear[k] + ') za ' + cost + ' Złota.', '', 'sys');
  },
  skillToggle: el => {
    const h = curHero(); const i = +el.dataset.i;
    if (h.skills.includes(i)) h.skills = h.skills.filter(x => x !== i);
    else { if (h.skills.length >= 4) return toast('Bohater zabiera najwyżej 4 umiejętności. Najpierw odznacz którąś.'); h.skills.push(i); h.skills.sort(); }
    saveHero(h);
  },
  qdel: el => { const h = curHero(); h[el.dataset.k].splice(+el.dataset.i, 1); saveHero(h); },
  ddel: el => { const h = curHero(); h.diseases.splice(+el.dataset.i, 1); saveHero(h); },
  quirkRoll: () => {
    const h = curHero(); const q = rollQuirkFor(h);
    saveHero(h, true); rollLog(q.txt, q.cls, 'sys');
  },
  trkOff: el => {
    const h = curHero(); const t = h.trinkets.splice(+el.dataset.i, 1)[0];
    Store.act([opSet('heroes.' + h.id, h), opSet('osada.trinkets', (Store.S.osada.trinkets || []).concat([t]))]);
  },
  trkOn: () => {
    const h = curHero(); const mag = Store.S.osada.trinkets || [];
    const ok = mag.map((t, i) => [t, i]).filter(([t]) => !h.trinkets.some(x => x.name === t.name) && (t.kind !== 'class' || t.cls === h.cls));
    if (!ok.length) return toast('W magazynie nie ma błyskotki, którą ten bohater może założyć. Błyskotki dodaje się w zakładce Osada.');
    modal(`<h3>Załóż błyskotkę</h3><div class="flist">${ok.map(([t, i]) => `<label class="chk"><input type="radio" name="trk" value="${i}"> <b>${esc(t.name)}</b> <span class="dim small">${esc(trinketDesc(t))}</span></label>`).join('')}</div>`,
      [{ t: 'Anuluj' }, { t: 'Załóż', cls: 'primary', fn: () => {
        const r = $('input[name=trk]:checked'); if (!r) { toast('Wybierz błyskotkę.'); return false; }
        const m2 = mag.slice(); const t = m2.splice(+r.value, 1)[0]; h.trinkets.push(t);
        const dl = []; dreamCheck(h, dl, 'trinket');
        Store.act([opSet('heroes.' + h.id, h), opSet('osada.trinkets', m2)]); if (dl.length) rollLog(dl.join(' '), 'good', 'sys');
      } }]);
  },
  storyRoll: () => { const h = curHero(); rollStory(h); saveHero(h); rollLog(heroLabel(h) + ': ' + h.story.origin + '. Marzenie: ' + h.story.dreamText + '.', '', 'sys'); },
  heroDelete: () => {
    const h = curHero();
    confirmBox('Usunąć ' + heroLabel(h) + '?', 'Bohater zniknie z rejestru na zawsze. Poległych lepiej zostawić na Cmentarzu.', 'Usuń', () => {
      const st = clone(Store.S.stol); st.heroes = st.heroes.filter(x => x !== h.id);
      Store.act([opDel('heroes.' + h.id), opSet('stol', st)]); UI.heroSel = null;
    });
  },
  service: el => {
    const h = curHero(); const b = el.dataset.b; const sub = el.dataset.s || SVC[b][0]; const lvl = Store.S.osada.b[b] || 0;
    const v = svcState(h, b, sub); if (!v.ok) return toast(v.why);
    if (!payGold(v.cost)) return;
    const o = clone(Store.S.osada); o.svc = Object.assign({}, o.svc, { [sub]: ((o.svc || {})[sub] || 0) + 1 });
    const r = d(6); const relief = r + 4 + lvl; const lines = [];
    const before = h.stress; heroStress(h, -relief, lines); if (h.state && h.state.kind !== 'virtue') h.state = null;
    h.status = 'leczenie';
    let txt = heroLabel(h) + ' — ' + b + ', ' + sub + ' (' + v.cost + ' Z): k6 = **' + r + '** → Stres −' + relief + ' (' + before + ' → ' + h.stress + '), Przypadłość znika. Opuszcza najbliższą wyprawę.';
    const side = d(10); txt += ' Skutek uboczny: k10 = **' + side + '**' + (side === 1 ? '' : ' → nic.');
    if (side === 1) {
      const s2 = rollTable('skutek'); txt += ' → **' + s2.text + '** (k6 = **' + s2.r + '**).';
      if (s2.r === 1) { h.status = 'przepadł'; h.awayUntil = o.week + 2; txt += ' ' + heroLabel(h) + ' wróci w tygodniu ' + h.awayUntil + '.'; }
      if (s2.r === 2) { const g = d(6); const lost = Math.min(o.gold, g); o.gold -= lost; txt += ' Osada traci k6 = **' + g + '** Złota (' + lost + ').'; }
      if (s2.r === 3) { if ((o.trinkets || []).length) { const pt = pickD(o.trinkets.map((t, i) => i)); const t = o.trinkets[pt.v]; o.trinkets = o.trinkets.filter((x, i) => i !== pt.v); txt += ' Z magazynu znika (' + pt.t + '): ' + t.name + '.'; } else txt += ' Magazyn był pusty — nic nie zginęło.'; }
      if (s2.r === 4) { h.ban = { b, until: o.week + 3 }; txt += ' Zakaz wstępu do: ' + b + ' przez 2 tygodnie.'; }
      if (s2.r === 5) txt += ' ' + gainQuirk(h, 'qn', b === 'Opactwo' ? 'Fanatyk' : 'Pijak albo Hazardzista');
      if (s2.r === 6) { o.rumor = true; txt += ' Następna wyprawa ma +1 rzut na łup.'; }
    }
    Store.act([opSet('osada', o)], { quiet: true });
    saveHero(h, true); dropFromParty(h.id); rollLog(txt + (lines.length ? ' ' + lines.join(' ') : ''), side === 1 ? 'bad' : 'good', 'sys');
  },
  sanat: el => {
    const h = curHero(); const w = el.dataset.w; const lvl = Store.S.osada.b.Sanatorium || 0;
    if (Store.S.osada.eventR === 3) return toast('Sanatorium jest zamknięte w tym tygodniu (zaraza).');
    { const busy = heroBusy(h); if (busy) return toast(busy); }
    const cost = Math.max(1, { disease: 5, quirk: 8, lock: 6 }[w] - lvl);
    const opts = w === 'disease' ? h.diseases.map((x, i) => [x, i]) : w === 'quirk' ? h.qn.map((q, i) => [q.t, i]).filter(([, i]) => !h.qn[i].lock) : h.qp.map((q, i) => [q.t, i]).filter(([, i]) => !h.qp[i].lock);
    modal(`<h3>Sanatorium — ${cost} Z</h3><div class="flist">${opts.map(([t, i]) => `<label class="chk"><input type="radio" name="san" value="${i}"> ${esc(t)}</label>`).join('')}</div>`,
      [{ t: 'Anuluj' }, { t: 'Zapłać i lecz', cls: 'primary', fn: () => {
        const r = $('input[name=san]:checked'); if (!r) { toast('Wybierz, co leczyć.'); return false; }
        if (!payGold(cost)) return false;
        const i = +r.value; let txt;
        if (w === 'disease') { txt = 'wyleczona choroba: ' + h.diseases[i]; h.diseases.splice(i, 1); }
        if (w === 'quirk') { txt = 'usunięte dziwactwo: ' + h.qn[i].t; h.qn.splice(i, 1); }
        if (w === 'lock') { txt = 'utrwalone dziwactwo: ' + h.qp[i].t; h.qp[i].lock = true; }
        h.status = 'leczenie'; saveHero(h, true); dropFromParty(h.id); rollLog(heroLabel(h) + ' — Sanatorium (' + cost + ' Z): ' + txt + '. Opuszcza najbliższą wyprawę.', 'good', 'sys');
      } }]);
  }
});
document.addEventListener('change', ev => {
  const el = ev.target; if (!el.dataset || !el.dataset.portrait) return;
  const f = el.files && el.files[0]; const id = el.dataset.portrait;
  loadPortrait(f, url => { const h = clone(H(id)); if (!h || !canHero(h)) return; h.portrait = url; saveHero(h); toast('Portret zapisany.'); });
});
/* zmiany selectów i checkboxów karty */
document.addEventListener('change', ev => {
  const el = ev.target; const a = el.dataset && el.dataset.actChange; if (!a || !UI.heroSel) return;
  const h = curHero(); if (!canHero(h)) return;
  if (a === 'state') { const v = el.value; h.state = v ? { kind: v.split(':')[0], name: v.split(':')[1] } : null; }
  if (a === 'camp') {
    if (el.checked) { const cost = Math.max(1, 4 - ((Store.S.osada.b || {}).Obozownik || 0)); if (!payGold(cost)) { el.checked = false; return; } rollLog(heroLabel(h) + ' uczy się w Obozowniku: ' + el.value + ' (' + cost + ' Z).', '', 'sys'); h.camp = h.camp.concat(el.value); }
    else h.camp = h.camp.filter(x => x !== el.value);
  }
  if (a === 'qlock') { h[el.dataset.k][+el.dataset.i].lock = el.checked; }
  if (a === 'qadd') { if (!el.value) return; h[el.dataset.k].push({ t: el.value, lock: false }); }
  if (a === 'dadd') { if (!el.value) return; h.diseases.push(el.value); }
  const st = heroStats(h); h.hp = Math.min(h.hp, st.maxhp);
  saveHero(h);
});
