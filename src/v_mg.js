/* Ekran MG: NPC, bestiariusz, Przodek (AI i głos), tabele, notatki. Widzi go tylko MG. */
const PRZODEK_MOMENTS = [
  ['start', 'Początek sesji'], ['krytyk', 'Krytyk bohatera'], ['krytykw', 'Krytyk wroga'], ['prog', 'Próg Śmierci'], ['smierc', 'Śmierć bohatera'],
  ['przypadlosc', 'Przypadłość'], ['cnota', 'Cnota'], ['ciemnosc', 'Pochodnia 0'], ['boss', 'Wejście bossa'], ['powrot', 'Powrót do Osady'], ['komnata', 'Opis komnaty']
];
const PRZODEK_PRESET = {
  start: 'Osada śpi. Posiadłość nie. Zapalcie pochodnie — dopóki jest czym.',
  krytyk: 'Jeden cios — i porządek rzeczy przywrócony.', krytykw: 'Ciało pamięta każdą ranę. Dusza — jeszcze dłużej.',
  prog: 'Stoi na krawędzi. Krawędź jest cierpliwa.', smierc: 'Kolejne imię na cmentarzu. Ziemia nie narzeka.',
  przypadlosc: 'Umysł pękł cicho, jak lód pod butem.', cnota: 'W tym jednym człowieku ciemność trafiła na mur.',
  ciemnosc: 'Teraz widzą to, co zawsze tu było.', powrot: 'Wrócili. Nie wszyscy w całości.',
  boss: 'To, co tu mieszka, czekało dłużej, niż wy żyjecie.', komnata: 'Kurz, kości i cisza, która wcale nie jest pusta.'
};
const npcList = () => Object.values(Store.G.npc || {}).sort((a, b) => (a.created || 0) - (b.created || 0));
let _sample = null, _tts = null, _capsAsked = false;
async function caps() {
  if (_capsAsked) return; _capsAsked = true;
  if (!inClaude()) return;
  try { _sample = await window.claude.use('sample'); } catch (e) { }
  try { _tts = await window.claude.use('tts'); } catch (e) { }
  if (UI.view === 'mg') renderView();
}
/* Głos Przodka: najpierw męski polski głos z urządzenia, potem inny polski z obniżonym tonem, na końcu głos Claude. */
const MALE_RX = /\b(marek|krzysztof|jacek|jakub|jan|maciej|adam|piotr|tomasz|male|mężczyzna|man)\b|x-pld|x-plc|-bmg|-jmk/i;
const FEMALE_RX = /\b(paulina|zosia|zofia|agnieszka|maja|ewa|ola|aleksandra|female|kobieta|woman)\b|google polski/i;
const VOICE_KEY = 'pio:glos';
const voiceCfg = () => Object.assign({ id: '', pitch: 0.65, rate: 0.82 }, LS.get(VOICE_KEY) || {});
function browserVoices() { try { return speechSynthesis.getVoices() || []; } catch (e) { return []; } }
function voiceOptions(all) {
  const bv = browserVoices().filter(v => all || /^pl/i.test(v.lang));
  const tag = v => MALE_RX.test(v.name) ? ' — męski' : FEMALE_RX.test(v.name) ? ' — żeński' : '';
  const opts = bv.map(v => ({ id: 'web:' + v.name, label: v.name + ' (' + v.lang + ')' + tag(v), male: MALE_RX.test(v.name) && !FEMALE_RX.test(v.name) }));
  opts.sort((a, b) => (b.male - a.male));
  if (_tts) ['rounded', 'buttery', 'glassy', 'airy'].forEach(n => opts.push({ id: 'claude:' + n, label: 'Głos Claude „' + n + '” (po polsku może brzmieć obco)', male: false }));
  return opts;
}
function pickVoiceId() {
  const c = voiceCfg(); const opts = voiceOptions(true);
  if (c.id && opts.some(o => o.id === c.id)) return c.id;
  const pl = voiceOptions(false);
  return (pl.find(o => o.male) || pl.find(o => o.id.startsWith('web:')) || opts[0] || { id: '' }).id;
}
function speak(text) {
  const c = voiceCfg(); const id = pickVoiceId();
  if (id.startsWith('claude:') && _tts) { _tts.speak(text, { voice: id.slice(7), rate: c.rate, language: 'pl' }).catch(() => toast('Nie udało się odczytać na głos.')); return; }
  try {
    const u = new SpeechSynthesisUtterance(text); u.lang = 'pl-PL'; u.rate = c.rate; u.pitch = c.pitch;
    const v = browserVoices().find(v => 'web:' + v.name === id); if (v) { try { u.voice = v; } catch (e) { } u.lang = v.lang; }
    speechSynthesis.cancel(); speechSynthesis.speak(u);
    if (!v) toast('Na tym urządzeniu nie ma polskiego głosu — zobacz wskazówkę pod wyborem głosu.');
  } catch (e) { toast('Ta przeglądarka nie czyta na głos.'); }
}
try { speechSynthesis.addEventListener('voiceschanged', () => { if (UI.view === 'mg' && UI.msub === 'przodek') renderView(); }); } catch (e) { }
function voicePanel() {
  const c = voiceCfg(); const id = pickVoiceId(); const opts = voiceOptions(!!UI.allVoices);
  const hasMale = voiceOptions(false).some(o => o.male);
  return `<div class="box"><div class="ph">Głos Przodka <span class="hint">ustawienie tylko na tym urządzeniu</span></div>
    <label class="fld"><span class="lbl">Głos</span><select id="vsel" data-act-change="voice">${opts.map(o => `<option value="${esc(o.id)}" ${o.id === id ? 'selected' : ''}>${esc(o.label)}</option>`).join('') || '<option value="">brak głosów w tej przeglądarce</option>'}</select></label>
    <label class="chk small"><input type="checkbox" data-act-change="allVoices" ${UI.allVoices ? 'checked' : ''}> pokaż głosy we wszystkich językach</label>
    <div class="row"><label class="lbl" for="vpitch">Ton</label><input type="range" id="vpitch" min="0.1" max="1.2" step="0.05" value="${c.pitch}" data-act-change="vpitch"><span class="num small">${c.pitch}</span>
      <label class="lbl" for="vrate">Tempo</label><input type="range" id="vrate" min="0.6" max="1.2" step="0.02" value="${c.rate}" data-act-change="vrate"><span class="num small">${c.rate}</span></div>
    <div class="row"><button class="btn sm" data-act="voiceTest">Posłuchaj próbki</button></div>
    <p class="small ${hasMale ? 'muted' : 'warn'}">${hasMale ? 'Ton działa na głosy z urządzenia: niższy brzmi mroczniej. Część nowoczesnych głosów ignoruje zmianę tonu.' : 'Na tym urządzeniu nie ma męskiego polskiego głosu. Najprościej: otwórz stół w przeglądarce Microsoft Edge i wybierz „Microsoft Marek Online (Natural) — Polish”. To darmowy, naturalny męski głos. Na Androidzie: Ustawienia → Zamiana tekstu na mowę → Google → polski → zainstaluj i wybierz głos męski.'}</p></div>`;
}
const PRZODEK_SYS = 'Jesteś Przodkiem: zmarłym dziedzicem upadłego rodu w mrocznej grze fabularnej „Pochodnia i Obłęd” (gotycki horror: posiadłość, loch pod nią, osada, najemni bohaterowie, którzy giną). Przodek kopał zbyt głęboko i obudził coś pod domem; teraz zza grobu komentuje upadek rodu — z goryczą, pychą i czarnym humorem. Mówisz po polsku, poważnym, lekko archaicznym językiem, zwięźle, obrazowo. Piszesz wyłącznie własne, oryginalne zdania — nie cytujesz ani nie parafrazujesz żadnych gier, filmów ani książek. Nie używasz mechaniki gry (liczb, kości) w tekście.';

VIEWS.mg = {
  render() {
    if (!Store.isGM()) return '<section class="panel"><p class="muted">Ekran MG jest tylko dla prowadzącego.</p></section>';
    caps();
    const sub = UI.msub || 'wrogowie';
    return `<div class="seg subtabs">${[['wrogowie', 'Wrogowie'], ['przodek', 'Przodek'], ['npc', 'Postacie'], ['tab', 'Tabele'], ['not', 'Notatki']].map(([k, t]) => `<button class="btn ${sub === k ? 'gold' : 'ghost'}" data-act="msub" data-v="${k}">${t}</button>`).join('')}</div>
      ${sub === 'wrogowie' ? foesView() : sub === 'npc' ? this.npc() : sub === 'przodek' ? this.przodek() : sub === 'tab' ? this.tables() : this.notes()}`;
  },
  npc() {
    const list = npcList(); if (UI.npcSel && !Store.G.npc[UI.npcSel]) UI.npcSel = null;
    const n = UI.npcSel ? Store.G.npc[UI.npcSel] : list[0]; if (n) UI.npcSel = n.id;
    const f = (k, label, ph, ta) => `<label class="fld"><span class="lbl">${label}</span>${ta ? `<textarea id="np-${k}" data-npc="${k}" placeholder="${esc(ph || '')}">${esc(n[k] || '')}</textarea>` : `<input type="text" id="np-${k}" data-npc="${k}" value="${esc(n[k] || '')}" placeholder="${esc(ph || '')}">`}</label>`;
    let fight = '';
    if (n && n.enemy) {
      const e = n.enemy;
      fight = `<div class="box"><div class="ph">Jeśli walczy <span class="hint">${esc(e.name)} · ${e.boss ? 'boss' : DL[e.dl]}</span></div>
        <p class="num dim">Zdrowie ${e.hp}/${e.maxhp} · Unik ${e.dodge} · Pancerz ${e.prot} · Szybkość ${e.speed} · Krzepa ${e.krzepa} · Odporność ${e.odp} · ${esc(e.type || '')}</p>
        ${pips('hp', e.hp, e.maxhp, 'npchp')}
        ${(e.attacks || []).map(a => `<p class="small">${attackText(a)}</p>`).join('')}
        <div class="row"><button class="btn sm primary" data-act="npcToTable">Wystaw na Stół</button><button class="btn sm ghost" data-act="npcNoFight">Usuń blok walki</button></div></div>`;
    }
    const allE = REG_OPTS.map(([k, nm]) => `<optgroup label="${nm}">${(k === 'DD' ? DATA.bestiary.DD.enemies : DATA.bestiary[k].enemies).map(e => `<option value="${esc(e.name)}">${esc(e.name)}</option>`).join('')}</optgroup>`).join('');
    return `<div class="npcgrid">
      <section class="panel"><h2>Postacie poboczne <span class="hint">widzisz je tylko ty</span></h2>
        <div class="row"><button class="btn sm primary" data-act="npcRoll">Losuj NPC</button><button class="btn sm" data-act="npcNew">Nowy</button>${_sample ? `<button class="btn sm gold" data-act="npcAI">Przodek wymyśla NPC</button>` : ''}</div>
        <div class="nlist">${list.map(x => `<button class="rcard ${x.id === UI.npcSel ? 'on' : ''}" data-act="npcSel" data-id="${x.id}"><span class="rn">${esc(x.name || 'Bez imienia')}</span><span class="rc">${esc(x.role || '')}</span></button>`).join('') || '<p class="muted">Brak postaci. Wylosuj pierwszą — dostaniesz imię, rolę, wygląd, pragnienie, lęk i sekret.</p>'}</div>
      </section>
      ${n ? `<section class="panel"><h2>${esc(n.name || 'Bez imienia')}</h2>
        <div class="fgrid">${f('name', 'Imię')}${f('role', 'Rola', 'np. karczmarz z Gospody')}
          <label class="fld"><span class="lbl">Gdzie</span><select data-npc="where">${['Osada', 'Trakt', 'Loch'].map(x => `<option ${n.where === x ? 'selected' : ''}>${x}</option>`).join('')}</select></label>
          <label class="fld"><span class="lbl">Stosunek do rodu</span><span class="row">${[-2, -1, 0, 1, 2].map(v => `<button class="btn sm ${+(n.att || 0) === v ? 'gold' : 'ghost'}" data-act="npcAtt" data-v="${v}">${v > 0 ? '+' + v : v}</button>`).join('')}</span></label></div>
        ${f('look', 'Wygląd', '', true)}${f('voice', 'Głos i maniera')}${f('wants', 'Czego chce')}${f('fears', 'Czego się boi')}${f('secret', 'Sekret', 'tylko dla MG', true)}${f('trade', 'Usługi i ceny')}${f('notes', 'Notatki', '', true)}
        ${fight || `<div class="row"><select id="npcE">${allE}</select><select id="npcDl">${DL.map((x, i) => `<option value="${i}">${x}</option>`).join('')}</select><button class="btn sm" data-act="npcFight">Dodaj blok walki</button></div>`}
        <div class="row"><span class="sp"></span><button class="btn sm ghost" data-act="npcDel">Usuń postać</button></div>
      </section>` : ''}
    </div>`;
  },
  przodek() {
    const p = UI.prz || { moment: 'krytyk', text: '', ctx: '' };
    return `<div class="grid2">
      <section class="panel"><h2>Głos Przodka</h2>
        <p class="dim">Przodek odzywa się tylko w kluczowych chwilach, jednym zdaniem. Tekst wysłany do dziennika pojawi się wszystkim przy stole jako napis.</p>
        <div class="row"><label class="lbl" for="pm">Chwila</label><select id="pm">${PRZODEK_MOMENTS.map(([k, t]) => `<option value="${k}" ${p.moment === k ? 'selected' : ''}>${t}</option>`).join('')}</select></div>
        <label class="fld"><span class="lbl">Kontekst (dla Przodka AI)</span><input type="text" id="pctx" value="${esc(p.ctx)}" placeholder="np. Westalka Agata pada od ciosu Świńskiego Księcia"></label>
        <div class="row">${_sample ? `<button class="btn primary" data-act="przAI">Przodek mówi (AI)</button>` : ''}<button class="btn" data-act="przPreset">Kwestia z podręcznika</button></div>
        ${!_sample ? `<p class="small muted">${inClaude() ? 'Przodek AI działa na stronie Claude dla prowadzącego. Jeśli nie widzisz przycisku, odśwież stronę albo zezwól na funkcję, gdy przeglądarka zapyta.' : 'Przodek AI działa na stronie Claude. Tu możesz pisać kwestie samodzielnie albo brać je z podręcznika — przeglądarka odczyta je na głos.'}</p>` : ''}
        <label class="fld"><span class="lbl">Kwestia</span><textarea id="ptext" rows="4">${esc(p.text)}</textarea></label>
        <div class="row"><button class="btn gold" data-act="przSay">Odczytaj na głos</button><button class="btn primary" data-act="przLog">Wyślij do stołu</button></div>
        <p class="small muted">Głos słychać na twoim urządzeniu. Gracze przez internet usłyszą go, jeśli udostępnisz dźwięk na Discordzie.</p>
        ${voicePanel()}
      </section>
      <section class="panel"><h2>Ostatnie kwestie</h2><div class="log">${(Store.S.log || []).filter(e => e.kind === 'przodek').slice(-12).reverse().map(logLine).join('') || '<p class="muted">Przodek jeszcze milczy.</p>'}</div></section>
    </div>`;
  },
  best() {
    const reg = UI.breg || 'Ruiny'; const dl = +(UI.bdl || 0);
    const list = reg === 'DD' ? DATA.bestiary.DD.enemies : DATA.bestiary[reg].enemies;
    const enemies = list.map(e => makeEnemy(e.name, dl));
    const boss = reg === 'DD' ? null : makeBoss(reg, dl);
    return `<section class="panel"><h2>Bestiariusz</h2>
      <div class="row"><select id="breg" data-act-change="breg">${REG_OPTS.map(([k, n]) => `<option value="${k}" ${reg === k ? 'selected' : ''}>${n}</option>`).join('')}</select>
      ${reg !== 'DD' ? `<select id="bdl" data-act-change="bdl">${DL.map((n, i) => `<option value="${i}" ${dl === i ? 'selected' : ''}>${n}</option>`).join('')}</select>` : '<span class="muted small">wartości ostateczne, bez premii poziomu</span>'}</div>
      <div class="tbl-wrap"><table class="t"><tr><th>Wróg</th><th>Zdr.</th><th>Unik</th><th>Panc.</th><th>Szyb.</th><th>Typ</th><th>Poz.</th><th>Ataki</th></tr>
      ${enemies.map(e => `<tr><td><b>${esc(e.name)}</b></td><td class="num">${e.hp}</td><td class="num">${e.dodge}</td><td class="num">${e.prot}</td><td class="num">${e.speed}</td><td>${esc(e.type)}</td><td>${esc(e.pos)}</td><td>${e.attacks.map(attackText).join('<br>')}</td></tr>`).join('')}</table></div>
      ${boss ? `<div class="ph">Boss: ${esc(boss.name)}</div><p class="num">Zdrowie ${boss.hp} · Unik ${boss.dodge} · Pancerz ${boss.prot} · Szybkość ${boss.speed} · Krzepa ${boss.krzepa} · Odporność ${boss.odp}</p>${boss.attacks.map(a => `<p>${attackText(a)}</p>`).join('')}${boss.notes.map(n => `<p class="dim">${md(n.replace(/^([^:]+):/, '**$1:**'))}</p>`).join('')}` : DATA.bestiary.DD.floors.map(f => `<div class="ph">Piętro ${f.n}: ${esc(f.name)}</div><p class="dim">${esc(f.line)}</p>${f.moves.map(m => `<p class="small">${md(m)}</p>`).join('')}`).join('')}
    </section>`;
  },
  tables() {
    const ti = torchInfo(Store.S.stol.torch);
    return `<div class="grid2"><section class="panel"><h2>Rzuty MG <span class="hint">wynik idzie do dziennika</span></h2>
      <div class="tgrid">${Object.entries(TABLES).map(([k, t]) => `<button class="btn" data-act="tabRoll" data-k="${k}">${esc(t.name)} <span class="muted">k${t.die}</span></button>`).join('')}
      <button class="btn" data-act="tabSecret">Rzut ukryty k10</button></div>
      ${UI.secret ? `<p class="secret">Rzut ukryty: <b>${UI.secret}</b> (widzisz tylko ty)</p>` : ''}</section>
      <section class="panel"><h2>Pochodnia</h2><div class="tbl-wrap"><table class="t"><tr><th>Pochodnia</th><th>Zaskoczenie</th><th>Wrogowie</th><th>Łupy</th><th>Stres</th></tr>
      ${TORCH.map(t => `<tr class="${t === ti ? 'now' : ''}"><td>${t.name} (${t.min === 0 ? '0' : t.min + (t.min === 9 ? '–10' : t.min === 6 ? '–8' : t.min === 3 ? '–5' : '–2')})</td><td>${t.surprise}</td><td>${t.enemy}</td><td>${t.loot}</td><td>${t.stress}</td></tr>`).join('')}</table></div></section></div>`;
  },
  notes() {
    return `<section class="panel"><h2>Notatki MG <span class="hint">prywatne</span></h2><textarea id="gnotes" data-gnote="1" rows="18" placeholder="Wątki, plany, co gracze zrobili, czego się boją…">${esc(Store.G.notes || '')}</textarea></section>`;
  }
};
function npcSave(n) { Store.actG(G => { G.npc = Object.assign({}, G.npc, { [n.id]: n }); }); }
Object.assign(ACT, {
  msub: el => { UI.msub = el.dataset.v; renderView(); },
  npcSel: el => { UI.npcSel = el.dataset.id; renderView(); },
  npcNew: () => { const n = { id: uid(), created: Date.now(), name: '', where: 'Osada', att: 0 }; npcSave(n); UI.npcSel = n.id; renderView(); },
  npcRoll: () => {
    const G = NPC_GEN; const n = { id: uid(), created: Date.now(), name: pick(G.names) + ' ' + pick(G.surn), role: pick(G.roles), look: pick(G.looks), voice: pick(G.voice), wants: pick(G.wants), fears: pick(G.fears), secret: pick(G.secrets), where: 'Osada', att: d(5) - 3 };
    npcSave(n); UI.npcSel = n.id; renderView();
  },
  npcAI: async el => {
    el.disabled = true; el.textContent = 'Przodek myśli…';
    try {
      const v = await _sample.json(PRZODEK_SYS + '\n\nWymyśl jedną postać niezależną (NPC) z Osady pod posiadłością albo z okolicznych regionów (Ruiny, Nory, Knieja, Zatoka). Odpowiedz wyłącznie obiektem JSON z polami: name (imię i przydomek, polskie, staroświeckie), role, look (jedno zdanie), voice (jak mówi), wants, fears, secret (coś, co może zmienić bieg kampanii). Każde pole krótkie, po polsku.', { modelTier: 'quick' });
      const n = Object.assign({ id: uid(), created: Date.now(), where: 'Osada', att: 0 }, v || {}); npcSave(n); UI.npcSel = n.id;
    } catch (e) { toast(e && e.code === 'not_granted' ? 'Przodek AI jest wyłączony dla tej strony.' : 'Przodek milczy — spróbuj za chwilę.'); }
    renderView();
  },
  npcAtt: el => { const n = clone(Store.G.npc[UI.npcSel]); n.att = +el.dataset.v; npcSave(n); renderView(); },
  npcDel: () => confirmBox('Usunąć postać?', 'Tej operacji nie da się cofnąć.', 'Usuń', () => { Store.actG(G => { delete G.npc[UI.npcSel]; }); UI.npcSel = null; renderView(); }),
  npcFight: () => { const n = clone(Store.G.npc[UI.npcSel]); n.enemy = makeEnemy($('#npcE').value, +$('#npcDl').value); n.enemy.name = n.name || n.enemy.name; npcSave(n); renderView(); },
  npcNoFight: () => { const n = clone(Store.G.npc[UI.npcSel]); delete n.enemy; npcSave(n); renderView(); },
  npcToTable: () => {
    const n = Store.G.npc[UI.npcSel]; const e = clone(n.enemy); e.id = uid();
    const used = Store.S.stol.enemies.reduce((a, x) => a + (x.size || 1), 0); if (used + (e.size || 1) > 4) return toast('Szyk wrogów jest pełny.');
    setStol(st => { st.enemies.push(e); }, '**' + e.name + '** staje do walki.'); location.hash = '#stol';
  },
  przPreset: () => { UI.prz = { moment: $('#pm').value, ctx: $('#pctx').value, text: PRZODEK_PRESET[$('#pm').value] || '' }; renderView(); },
  przAI: async el => {
    const m = $('#pm').value; const ctx = $('#pctx').value; const mname = PRZODEK_MOMENTS.find(x => x[0] === m)[1];
    el.disabled = true; el.textContent = 'Przodek myśli…';
    const s = Store.S; const pt = s.stol.heroes.map(H).filter(Boolean).map(h => heroLabel(h) + ' (' + CLS[h.cls].name + ')').join(', ');
    const task = m === 'komnata'
      ? 'Opisz graczom komnatę, do której właśnie weszli, w 2–3 zdaniach do przeczytania na głos. Region: ' + (s.stol.region === 'DD' ? 'Najmroczniejszy Loch' : s.stol.region) + '. Pochodnia: ' + torchInfo(s.stol.torch).name + '. ' + (ctx ? 'Co tu jest: ' + ctx + '.' : '') + ' Nie zdradzaj zasad ani liczb.'
      : 'Chwila w grze: ' + mname + '. ' + (ctx ? 'Co się stało: ' + ctx + '. ' : '') + (pt ? 'Drużyna: ' + pt + '. ' : '') + 'Wypowiedz jedno zdanie Przodka (najwyżej 22 słowa), bez cudzysłowu.';
    UI.prz = { moment: m, ctx, text: '' };
    try {
      const r = await _sample(PRZODEK_SYS + '\n\n' + task, { modelTier: 'quick', onText: ({ text }) => { const t = $('#ptext'); if (t) t.value = text; } });
      UI.prz.text = (r.text || '').trim().replace(/^„|”$/g, '');
    } catch (e) { toast(e && e.code === 'not_granted' ? 'Przodek AI jest wyłączony dla tej strony.' : 'Przodek milczy — spróbuj za chwilę.'); }
    renderView();
  },
  voiceTest: () => speak('Mój ród kopał zbyt głęboko. Teraz wy zapłacicie za to, co odkopał.'),
  przSay: () => { const t = $('#ptext').value.trim(); if (t) speak(t); },
  przLog: () => { const t = $('#ptext').value.trim(); if (!t) return toast('Najpierw wpisz albo wygeneruj kwestię.'); UI.prz = Object.assign(UI.prz || {}, { text: t }); Store.log({ text: t, kind: 'przodek', by: 'Przodek' }); },
  tabRoll: el => { const r = rollTable(el.dataset.k); rollLog(r.name + ': k' + r.die + ' = **' + r.r + '** → ' + r.text + '.', '', 'roll'); },
  tabSecret: () => { UI.secret = d(10); renderView(); }
});
document.addEventListener('input', ev => {
  const el = ev.target;
  if (el.dataset && el.dataset.npc && UI.npcSel) { const k = el.dataset.npc; Store.G.npc[UI.npcSel][k] = el.value; clearTimeout(el._t); el._t = setTimeout(() => T.saveG(), 400); }
  if (el.dataset && el.dataset.gnote) { Store.G.notes = el.value; clearTimeout(el._t); el._t = setTimeout(() => T.saveG(), 400); }
});
document.addEventListener('change', ev => {
  const el = ev.target; const a = el.dataset && el.dataset.actChange;
  if (el.dataset && el.dataset.npc && el.tagName === 'SELECT' && UI.npcSel) { Store.G.npc[UI.npcSel][el.dataset.npc] = el.value; T.saveG(); }
  if (a === 'voice') { LS.set(VOICE_KEY, Object.assign(voiceCfg(), { id: el.value })); renderView(); }
  if (a === 'allVoices') { UI.allVoices = el.checked; renderView(); }
  if (a === 'vpitch') { LS.set(VOICE_KEY, Object.assign(voiceCfg(), { pitch: +el.value })); renderView(); }
  if (a === 'vrate') { LS.set(VOICE_KEY, Object.assign(voiceCfg(), { rate: +el.value })); renderView(); }
  if (a === 'breg') { UI.breg = el.value; renderView(); }
  if (a === 'bdl') { UI.bdl = el.value; renderView(); }
});
