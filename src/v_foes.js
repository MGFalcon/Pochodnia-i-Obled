/* Karty wrogów: bestiariusz z premiami poziomu lochu i własni wrogowie MG. */
const foesG = () => Store.G.foes || {};
function foeRefs() {
  const out = [];
  Object.values(foesG()).sort((a, b) => (a.created || 0) - (b.created || 0)).forEach(f => out.push({ ref: 'c:' + f.id, name: f.name || 'Nowy wróg', group: 'Twoi wrogowie' }));
  ['Ruiny', 'Nory', 'Knieja', 'Zatoka'].forEach(r => {
    DATA.bestiary[r].enemies.forEach(e => out.push({ ref: 'b:' + e.name, name: e.name, group: r }));
    out.push({ ref: 'boss:' + r, name: DATA.bestiary[r].boss.name, group: r, boss: true });
  });
  out.push({ ref: 'shambler', name: 'Shambler', group: 'Ciemność', boss: true }, { ref: 'b:Macka', name: 'Macka', group: 'Ciemność' });
  DATA.bestiary.DD.enemies.forEach(e => out.push({ ref: 'b:' + e.name, name: e.name, group: 'Najmroczniejszy Loch' }));
  DATA.bestiary.DD.floors.forEach((f, i) => out.push({ ref: 'dd:' + i, name: f.name, group: 'Najmroczniejszy Loch', boss: true }));
  return out;
}
function makeCustom(f, dl) {
  const attacks = (f.attacks || []).filter(a => a.name).map(a => {
    const w = String(a.w || '1–4').replace(/-/g, '–');
    const str = a.name + ': W ' + w + ', Cel. ' + (+a.cel || 7) + (a.dmg ? ', ' + a.dmg : '') + (a.eff ? ', ' + a.eff : '');
    return scaleAttack(parseAttack(str), dl, false);
  });
  const num = (v, def) => (v === '' || v == null || isNaN(+v)) ? def : +v;
  const hp = Math.max(1, num(f.hp, 8)) + [0, 5, 10][dl];
  const notes = [].concat(f.boss && f.pattern ? ['Wzór ruchów: ' + f.pattern] : [], f.notes ? [f.notes] : []);
  return {
    id: uid(), name: f.name || 'Wróg', dl, flat: false, region: 'custom', hp, maxhp: hp, dodge: num(f.dodge, 1) + dl, prot: num(f.prot, 0), speed: num(f.speed, 3) + (dl === 2 ? 1 : 0),
    type: f.type || '', pos: String(f.pos || '1–4').replace(/-/g, '–'), attacks, notes, boss: !!f.boss, size: +f.size === 2 ? 2 : 1,
    krzepa: num(f.krzepa, f.boss ? 7 : 3 + dl), odp: num(f.odp, f.boss ? 5 : 3 + dl), noBleed: !!f.noBleed, fx: {}, corpse: false
  };
}
function buildFoe(ref, dl) {
  dl = +dl || 0;
  if (ref.startsWith('c:')) { const f = foesG()[ref.slice(2)]; return f ? makeCustom(f, dl) : null; }
  if (ref.startsWith('boss:')) return makeBoss(ref.slice(5), dl);
  if (ref.startsWith('dd:')) return makeBoss('DD', 0, +ref.slice(3));
  if (ref === 'shambler') return makeBoss('Shambler', 0);
  if (ref === 'b:Macka') return makeSummon('Macka');
  return makeEnemy(ref.slice(2), dl);
}
const foeFlat = ref => ref.startsWith('dd:') || ref === 'shambler' || ref === 'b:Macka' || (ref.startsWith('b:') && DATA.bestiary.DD.enemies.some(e => 'b:' + e.name === ref));
function foeToCustom(e, ref) {
  const atk = (e.attacks || []).filter(a => a.w).map(a => ({ name: a.name, w: a.w, cel: a.cel, dmg: a.dmg || '', eff: a.rest || '' }));
  const def = ref.startsWith('b:') ? findEnemyDef(ref.slice(2)) : null;
  return {
    id: uid(), created: Date.now(), name: e.name + ' (kopia)', type: e.type || '', pos: e.pos && e.pos !== '—' ? e.pos : '1–4', hp: def ? def.e.hp : e.maxhp,
    dodge: def ? def.e.dodge : e.dodge, prot: e.prot, speed: def ? def.e.speed : e.speed, krzepa: e.boss ? 7 : '', odp: e.boss ? 5 : '', boss: !!e.boss, size: e.size || 1,
    noBleed: !!e.noBleed, attacks: atk, pattern: ((e.notes || []).find(n => /Wzór ruchów/.test(n)) || '').replace(/^Wzór ruchów:\s*/, ''),
    notes: (e.notes || []).filter(n => !/Wzór ruchów/.test(n)).join(' '), desc: '', tactics: '', loot: ''
  };
}
function foeCard(ref) {
  const flat = foeFlat(ref); const dl = flat ? 0 : +(UI.foeDl || 0);
  const e = buildFoe(ref, dl); if (!e) return '<section class="panel"><p class="muted">Ten wróg już nie istnieje.</p></section>';
  const custom = ref.startsWith('c:'); const f = custom ? foesG()[ref.slice(2)] : null;
  const pos = posList(e.pos);
  if (custom && UI.foeEdit) return foeEditor(f);
  return `<section class="panel foecard">
    <div class="fc-head"><div><h3 class="fc-name">${esc(e.name)}</h3>
      <div class="chips">${e.type ? `<span class="chip">${esc(e.type)}</span>` : ''}${e.boss ? '<span class="chip red">boss · 2 tury na rundę</span>' : ''}${e.size === 2 ? '<span class="chip">zajmuje 2 pozycje</span>' : ''}${e.noBleed ? '<span class="chip">niewrażliwy na krwawienie</span>' : ''}${custom ? '<span class="chip gold">własny</span>' : ''}</div></div>
      ${pos ? `<div class="fc-pos"><span class="lbl">Pozycje</span>${posDots(pos, 'to')}</div>` : ''}</div>
    ${flat ? '<p class="small muted">Wartości ostateczne — bez premii poziomu lochu.</p>' : `<div class="seg">${DL.map((n, i) => `<button class="btn sm ${dl === i ? 'gold' : 'ghost'}" data-act="foeDl" data-v="${i}"><span class="ldot lv${i}">${DL_ROMAN[i]}</span> ${n}</button>`).join('')}</div>`}
    <div class="stats fc-stats">
      ${[['Zdrowie', e.maxhp], ['Unik', e.dodge], ['Pancerz', e.prot], ['Szybkość', e.speed], ['Krzepa', e.krzepa], ['Odporność', e.odp]].map(([l, v]) => `<div class="stat"><span class="sl">${l}</span><b class="sv num">${v}</b></div>`).join('')}
    </div>
    <div class="ph">Ataki</div>
    <div class="fc-atks">${(e.attacks || []).map(a => a.w ? `<div class="fc-atk"><b>${esc(a.name)}</b>${posDots(posList(a.w), a.aoe ? 'to multi' : 'to')}<span class="num">Cel. ${a.celS}${a.dmgS ? ' · ' + esc(a.dmgS) : ''}${a.stress ? ' · +' + a.stressS + ' Stres' : ''}</span>${(() => { const r = (a.rest || '').replace(/(^|,?\s*(i\s+)?)\+\d+ Stres(u)?/, '').replace(/^[,\s]+|[,\s]+$/g, ''); return r ? `<span class="dim small">${esc(r)}</span>` : ''; })()}</div>` : `<div class="fc-atk"><b>${esc(a.name)}</b><span class="dim small">${esc(a.text || '')}</span></div>`).join('') || '<p class="muted">Brak ataków.</p>'}</div>
    ${(e.notes || []).length ? `<div class="bnotes">${e.notes.map(n => `<p>${md(String(n).replace(/^([^:]{1,40}):/, '**$1:**'))}</p>`).join('')}</div>` : ''}
    ${e.where ? `<p class="small muted">Ustawienie: ${esc(e.where)}</p>` : ''}
    ${f && (f.desc || f.tactics || f.loot) ? `<div class="fc-lore">${f.desc ? `<p><span class="lbl">Wygląd</span> ${esc(f.desc)}</p>` : ''}${f.tactics ? `<p><span class="lbl">Taktyka</span> ${esc(f.tactics)}</p>` : ''}${f.loot ? `<p><span class="lbl">Łup</span> ${esc(f.loot)}</p>` : ''}</div>` : ''}
    <div class="row fc-act">
      <button class="btn primary" data-act="foeTable">Wystaw na Stół${flat ? '' : ' (' + DL[dl] + ')'}</button>
      ${custom ? `<button class="btn" data-act="foeEditOn">Edytuj</button><button class="btn ghost" data-act="foeDel">Usuń</button>` : `<button class="btn" data-act="foeCopy">Zrób własną wersję</button>`}
    </div>
  </section>`;
}
function foeEditor(f) {
  const inp = (k, label, w, type) => `<label class="fld" style="${w ? 'max-width:' + w : ''}"><span class="lbl">${label}</span><input type="${type || 'text'}" id="fe-${k}" data-foe="${k}" value="${esc(f[k] == null ? '' : f[k])}"></label>`;
  return `<section class="panel foecard"><h2>Edycja wroga <span class="hint">wartości dla lochu Uczniowskiego — wyższe poziomy liczą się same</span></h2>
    <div class="fgrid">${inp('name', 'Nazwa')}${inp('type', 'Typ (np. Nieumarły, Bestia, Człowiek, Plugawy)')}${inp('pos', 'Pozycje (np. 1–2)')}</div>
    <div class="fgrid small-f">${inp('hp', 'Zdrowie', '', 'number')}${inp('dodge', 'Unik', '', 'number')}${inp('prot', 'Pancerz', '', 'number')}${inp('speed', 'Szybkość', '', 'number')}${inp('krzepa', 'Krzepa (puste = 3/4/5)', '', 'number')}${inp('odp', 'Odporność (puste = 3/4/5)', '', 'number')}</div>
    <div class="row"><label class="chk"><input type="checkbox" data-foe-chk="boss" ${f.boss ? 'checked' : ''}> boss (2 tury na rundę)</label>
      <label class="chk"><input type="checkbox" data-foe-chk="size2" ${+f.size === 2 ? 'checked' : ''}> zajmuje 2 pozycje</label>
      <label class="chk"><input type="checkbox" data-foe-chk="noBleed" ${f.noBleed ? 'checked' : ''}> niewrażliwy na krwawienie</label></div>
    <div class="ph">Ataki <span class="hint">W 1+2 = obszarowy; efekty: krwawienie 2, zaraza 2, ogłuszenie, Znak, odrzut 1, +2 Stres, groza 1, choroba</span></div>
    <div class="fe-atks">${(f.attacks || []).map((a, i) => `<div class="fe-atk">
      <input type="text" id="fa-${i}-name" data-foea="${i}.name" value="${esc(a.name || '')}" placeholder="Nazwa ataku">
      <input type="text" id="fa-${i}-w" data-foea="${i}.w" value="${esc(a.w || '')}" placeholder="W: 1–2" style="width:6em">
      <input type="number" id="fa-${i}-cel" data-foea="${i}.cel" value="${esc(a.cel == null ? '' : a.cel)}" placeholder="Cel." style="width:5em">
      <input type="text" id="fa-${i}-dmg" data-foea="${i}.dmg" value="${esc(a.dmg || '')}" placeholder="k6+1" style="width:6em">
      <input type="text" id="fa-${i}-eff" data-foea="${i}.eff" value="${esc(a.eff || '')}" placeholder="efekt, np. krwawienie 2 albo +2 Stres">
      <button class="btn sm ghost" data-act="foeAtkDel" data-i="${i}" aria-label="Usuń atak">×</button></div>`).join('')}</div>
    <button class="btn sm" data-act="foeAtkAdd">+ atak</button>
    <label class="fld"><span class="lbl">Wzór ruchów bossa (druga tura, k6)</span><input type="text" id="fe-pattern" data-foe="pattern" value="${esc(f.pattern || '')}" placeholder="np. 1–3 Cios, 4–5 Ryk, 6 Wezwanie"></label>
    <label class="fld"><span class="lbl">Zasady specjalne</span><textarea id="fe-notes" data-foe="notes">${esc(f.notes || '')}</textarea></label>
    <div class="fgrid">${inp('desc', 'Wygląd')}${inp('tactics', 'Taktyka')}${inp('loot', 'Łup')}</div>
    <div class="row"><span class="sp"></span><button class="btn primary" data-act="foeEditOff">Gotowe</button></div>
  </section>`;
}
function foesView() {
  const refs = foeRefs(); const groups = [...new Set(refs.map(r => r.group))];
  if (!UI.foeSel || !refs.some(r => r.ref === UI.foeSel)) UI.foeSel = refs[0] && refs[0].ref;
  const q = (UI.foeQ || '').toLowerCase();
  return `<div class="npcgrid">
    <section class="panel"><h2>Wrogowie <span class="hint">${refs.length} kart</span></h2>
      <div class="row"><button class="btn sm primary" data-act="foeNew">Nowy wróg</button><input type="text" id="foeQ" data-foeq="1" value="${esc(UI.foeQ || '')}" placeholder="Szukaj…" style="flex:1;min-width:8em"></div>
      <div class="foelist">${groups.map(g => {
        const items = refs.filter(r => r.group === g && (!q || r.name.toLowerCase().includes(q)));
        if (!items.length) return g === 'Twoi wrogowie' ? '' : '';
        return `<div class="fg"><span class="lbl">${esc(g)}</span>${items.map(r => `<button class="fitem ${r.ref === UI.foeSel ? 'on' : ''} ${r.boss ? 'boss' : ''}" data-act="foeSel" data-ref="${esc(r.ref)}">${esc(r.name)}</button>`).join('')}</div>`;
      }).join('')}${!Object.keys(foesG()).length && !q ? '<p class="small muted">Własnych wrogów tworzysz przyciskiem „Nowy wróg” albo z karty dowolnego wroga („Zrób własną wersję”).</p>' : ''}</div>
    </section>
    ${UI.foeSel ? foeCard(UI.foeSel) : ''}
  </div>`;
}
function saveFoe(f, rerender) { Store.actG(G => { G.foes = Object.assign({}, G.foes, { [f.id]: f }); }); if (rerender) renderView(); }
Object.assign(ACT, {
  foeSel: el => { UI.foeSel = el.dataset.ref; UI.foeEdit = false; renderView(); },
  foeDl: el => { UI.foeDl = +el.dataset.v; renderView(); },
  foeNew: () => {
    const f = { id: uid(), created: Date.now(), name: 'Nowy wróg', type: 'Plugawy', pos: '1–2', hp: 8, dodge: 1, prot: 0, speed: 3, krzepa: '', odp: '', boss: false, size: 1, noBleed: false, attacks: [{ name: 'Cios', w: '1–2', cel: 8, dmg: 'k6', eff: '' }], pattern: '', notes: '', desc: '', tactics: '', loot: '' };
    UI.foeSel = 'c:' + f.id; UI.foeEdit = true; saveFoe(f, true);
  },
  foeCopy: () => { const e = buildFoe(UI.foeSel, 0); const f = foeToCustom(e, UI.foeSel); UI.foeSel = 'c:' + f.id; UI.foeEdit = true; saveFoe(f, true); },
  foeEditOn: () => { UI.foeEdit = true; renderView(); },
  foeEditOff: () => { UI.foeEdit = false; T.saveG(); renderView(); },
  foeDel: () => confirmBox('Usunąć tego wroga?', 'Karta zniknie z listy. Wrogowie już stojący na Stole zostają.', 'Usuń', () => { Store.actG(G => { delete G.foes[UI.foeSel.slice(2)]; }); UI.foeSel = null; renderView(); }),
  foeAtkAdd: () => { const f = clone(foesG()[UI.foeSel.slice(2)]); f.attacks = (f.attacks || []).concat([{ name: '', w: '1–4', cel: 8, dmg: 'k4', eff: '' }]); saveFoe(f, true); },
  foeAtkDel: el => { const f = clone(foesG()[UI.foeSel.slice(2)]); f.attacks.splice(+el.dataset.i, 1); saveFoe(f, true); },
  foeTable: () => {
    const e = buildFoe(UI.foeSel, foeFlat(UI.foeSel) ? 0 : +(UI.foeDl || 0)); if (!e) return;
    const used = Store.S.stol.enemies.reduce((a, x) => a + (x.size || 1), 0);
    if (used + (e.size || 1) > 4) return toast('Szyk wrogów jest pełny — usuń kogoś na Stole.');
    setStol(st => { st.enemies.push(e); }, '**' + e.name + '** staje do walki.'); location.hash = '#stol';
  }
});
document.addEventListener('input', ev => {
  const el = ev.target; if (!el.dataset) return;
  if (el.dataset.foeq) { UI.foeQ = el.value; renderView(); return; }
  const id = UI.foeSel && UI.foeSel.startsWith('c:') ? UI.foeSel.slice(2) : null; if (!id || !Store.G.foes || !Store.G.foes[id]) return;
  const f = Store.G.foes[id];
  if (el.dataset.foe) { f[el.dataset.foe] = el.type === 'number' ? (el.value === '' ? '' : +el.value) : el.value; }
  else if (el.dataset.foea) { const [i, k] = el.dataset.foea.split('.'); f.attacks[+i][k] = el.type === 'number' ? (el.value === '' ? '' : +el.value) : el.value; }
  else return;
  clearTimeout(el._t); el._t = setTimeout(() => T.saveG(), 400);
});
document.addEventListener('change', ev => {
  const el = ev.target; if (!el.dataset || !el.dataset.foeChk) return;
  const f = clone(foesG()[UI.foeSel.slice(2)]); const k = el.dataset.foeChk;
  if (k === 'size2') f.size = el.checked ? 2 : 1; else f[k] = el.checked;
  saveFoe(f, false);
});
