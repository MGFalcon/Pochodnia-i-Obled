/* Zasady: statystyki bohatera, umiejętności, rozstrzyganie ataków, Stres i Próg Śmierci. */
const CLS = DATA.classes;
const MOD = {
  quirk: { 'Twardziel': { hp: 2 }, 'Zwinny': { dodge: 1 }, 'Szybki': { speed: 1 }, 'Niezłomny duch': { virtue: 1 } },
  disease: { 'Pełzający kaszel': { speed: -1 }, 'Febra': { acc: -1 }, 'Letarg': { hp: -2 }, 'Wścieklizna': { dmg: 1, dodge: -1, virtue: -1 } },
  trinket: {
    'Krwawy amulet': { dmg: 1, hp: -2 }, 'Medalik pokutnika': { virtue: 1, speed: -1 }, 'Kamień strażnika': { krzepa: 2, virtue: -1 },
    'Sakiewka z ziołami': { odp: 2, krzepa: -1 }, 'Podkute buty': { speed: 2, krzepa: -1 }, 'Kolczuga pod koszulą': { hp: 3, speed: -2 },
    'Pierścień z kości': { crit: 1, critStress: 1 }, 'Róża z cierni': { death: 1, hp: -1 }, 'Kompas ślepca': { scout: 2, accBright: -1 },
    'Oko wisielca': { acc: 1, krzepa: -2, odp: -2 }, 'Płaszcz z całunu': { dodge: 1, healIn: -1 }, 'Fiolka święconej krwi': { healIn: 1, odp: -2 },
    'Kieł spoza gwiazd': { crit: 1, dmg: 1, virtue: -1, fightStress: 1 }
  },
  virtue: { 'Niezłomny': { death: 2, krzepa: 2 }, 'Skupiony': { acc: 1, crit: 1 }, 'Potężny': { dmg: 1 }, 'Witalny': { odp: 2 } }
};
const STAT_NAMES = { hp: 'Zdrowie maks.', dodge: 'Unik', speed: 'Szybkość', prot: 'Pancerz', crit: 'Kryt', krzepa: 'Krzepa', odp: 'Odporność', death: 'Śmierć', virtue: 'Szansa Cnoty', acc: 'Celność', dmg: 'Obrażenia' };
const qname = s => String(s || '').split(':')[0].trim();

/* "Celność +1 i Kryt +1", "Celność i Szybkość −1", "Unik −2" -> {acc:1, crit:1, ...} */
const MOD_KEY = { 'Celność': 'acc', 'Kryt': 'crit', 'obrażenia': 'dmg', 'Szybkość': 'speed', 'Unik': 'dodge', 'Pancerz': 'prot', 'Krzepa': 'krzepa', 'Odporność': 'odp', 'Śmierć': 'death' };
function parseMods(txt) {
  const out = {}; const W = '(Celność|Kryt|obrażenia|Szybkość|Unik|Pancerz|Krzepa|Odporność|Śmierć)';
  const num = s => +s.replace('−', '-').replace('+', '');
  let m; const rx2 = new RegExp(W + ' i ' + W + ' ([+−]\\d)', 'g');
  let rest = txt;
  while ((m = rx2.exec(txt))) { out[MOD_KEY[m[1]]] = (out[MOD_KEY[m[1]]] || 0) + num(m[3]); out[MOD_KEY[m[2]]] = (out[MOD_KEY[m[2]]] || 0) + num(m[3]); rest = rest.replace(m[0], ''); }
  const rx = new RegExp(W + ' ([+−]\\d)', 'g');
  while ((m = rx.exec(rest))) out[MOD_KEY[m[1]]] = (out[MOD_KEY[m[1]]] || 0) + num(m[2]);
  return out;
}
function fxMods(fx) { const t = {}; ((fx && fx.buffs) || []).forEach(b => Object.entries(parseMods(b[0])).forEach(([k, v]) => { t[k] = (t[k] || 0) + v; })); return t; }
function newHero(clsIdx, opts = {}) {
  const c = CLS[clsIdx];
  const h = {
    id: uid(), name: opts.name || '', cls: clsIdx, level: opts.level || 0, xp: 0,
    hp: c.stats.hp + (opts.level || 0), stress: 0,
    gear: { weapon: 0, armor: 0, guild: 0 },
    skills: [0, 1, 2, 3], camp: [],
    qp: [], qn: [], diseases: [], trinkets: [],
    dd: false, exhausted: false, state: null, form: 'human', fatigue: 0, block: 0,
    fx: {}, notes: '', status: 'osada', dead: false, owner: null, created: Date.now()
  };
  if (!opts.noStory && typeof rollStory === 'function') rollStory(h);
  if (opts.quirks) { const a = pickD(DATA.quirks_pos), b = pickD(DATA.quirks_neg); h.qp.push({ t: a.v, lock: false }); h.qn.push({ t: b.v, lock: false }); h._qroll = 'dziwactwa: ' + a.t + ', ' + b.t; }
  h.hp = heroStats(h).maxhp;
  return h;
}

/* Wszystkie wartości bohatera z rozbiciem, skąd się wzięły. */
function heroStats(h) {
  const c = CLS[h.cls]; const s = c.stats;
  const st = { hp: s.hp, dodge: s.dodge, speed: s.speed, prot: s.prot || 0, crit: s.crit, krzepa: s.krzepa, odp: s.odp, death: s.death, virtue: 2, acc: 0, dmg: 0, healIn: 0, scout: 0, critStress: 0, fightStress: 0, accBright: 0 };
  const why = {}; Object.keys(st).forEach(k => why[k] = [['klasa', st[k]]]);
  why.virtue = [['bazowo', 2]]; why.acc = []; why.dmg = [];
  const add = (k, v, src) => { if (!v) return; st[k] = (st[k] || 0) + v; (why[k] = why[k] || []).push([src, v]); };
  const addAll = (m, src) => { if (m) Object.entries(m).forEach(([k, v]) => add(k, v, src)); };
  add('hp', h.level, 'poziom ' + h.level);
  add('dodge', (h.level >= 1) + (h.level >= 3) + (h.level >= 5), 'poziom');
  add('hp', h.gear.armor, 'pancerz r' + h.gear.armor);
  add('dmg', (h.gear.weapon >= 2) + (h.gear.weapon >= 4), 'broń r' + h.gear.weapon);
  add('acc', (h.gear.guild >= 1) + (h.gear.guild >= 3), 'Gildia r' + h.gear.guild);
  add('crit', h.gear.guild >= 2 ? 1 : 0, 'Gildia r' + h.gear.guild);
  h.qp.forEach(q => addAll(MOD.quirk[qname(q.t)], qname(q.t)));
  h.qn.forEach(q => addAll(MOD.quirk[qname(q.t)], qname(q.t)));
  h.diseases.forEach(x => addAll(MOD.disease[qname(x)], qname(x)));
  h.trinkets.forEach(t => { if (t.kind !== 'class') addAll(MOD.trinket[t.name], t.name); });
  if (h.state && h.state.kind === 'virtue') addAll(MOD.virtue[h.state.name], 'Cnota: ' + h.state.name);
  if (c.name === 'Ohyda' && h.form === 'beast') { add('dmg', 1, 'bestia'); add('speed', 2, 'bestia'); add('dodge', 1, 'bestia'); }
  if (h.fatigue) { const k = c.name === 'Błazen' ? 2 : 1; add('acc', -k * h.fatigue, 'Zmęczenie'); add('dmg', -k * h.fatigue, 'Zmęczenie'); }
  ((h.fx && h.fx.buffs) || []).forEach(b => Object.entries(parseMods(b[0])).forEach(([k, v]) => add(k, v, b[0])));
  (h.qbuff || []).forEach(b => Object.entries(parseMods(b)).forEach(([k, v]) => add(k, v, b + ' (do końca wyprawy)')));
  if (h.exhausted) { add('acc', -1, 'Wyczerpanie'); add('dmg', -1, 'Wyczerpanie'); add('speed', -1, 'Wyczerpanie'); }
  const vRaw = st.virtue; st.virtue = clamp(st.virtue, 1, 5);
  if (vRaw !== st.virtue) why.virtue.push(['granice 1–5', st.virtue - vRaw]);
  st.maxhp = Math.max(1, st.hp);
  st.heart = 20 - (h.qn.some(q => qname(q.t) === 'Słabe serce') ? 2 : 0);
  st.mainBonus = h.gear.guild >= 4 ? 1 : 0;
  st.why = why;
  return st;
}
const whyText = (st, k) => (st.why[k] || []).map(([s, v]) => s + ' ' + (k === 'virtue' && s === 'bazowo' ? v : (st.why[k][0] && st.why[k][0][0] === s && (s === 'klasa' || s === 'bazowo') ? v : sgn(v)))).join(', ');
/* doświadczenie: próg rośnie z Poziomem (0→1: 2, 1→2: 3 … 5→6: 7); awans klika gracz, zawsze o jeden Poziom */
const xpNeed = lvl => 2 + (lvl || 0);
const canLevel = h => !h.dead && h.level < 6 && (h.xp || 0) >= xpNeed(h.level);
const maxRank = (h, building) => Math.min(h.level + 1, 1 + (building || 0), 4);

/* ---------- umiejętności ---------- */
function posList(s) {
  s = String(s);
  const m = s.match(/^(\d)[–-](\d)$/); if (m) { const a = []; for (let i = +m[1]; i <= +m[2]; i++) a.push(i); return a; }
  if (/^\d(\+\d)*$/.test(s)) return s.split('+').map(Number);
  return null;
}
function skillInfo(c, s) {
  const target = /^\d/.test(s.w) ? (s.w.includes('+') ? 'multi' : 'enemy') : (/sojusznik/.test(s.w) ? 'ally' : /drużyna/.test(s.w) ? 'party' : 'self');
  const dice = parseDice(s.obr);
  const heal = s.eff.match(/leczy (?:się o )?(k\d+(?:\+\d+)?|\d+)/);
  const stress = s.eff.match(/−(\d+) Stres/);
  let main = null;
  if (s.cel != null && dice) main = 'dmg'; else if (heal && target !== 'enemy') main = 'heal'; else if (stress) main = 'stress';
  return { target, from: posList(s.z) || [1, 2, 3, 4], to: posList(s.w), dice, heal: heal ? parseDice(heal[1]) : null, stress: stress ? +stress[1] : 0, main, attack: s.cel != null };
}
function classTrinketFor(h, idx) { return h.trinkets.some(t => t.kind === 'class' && t.cls === h.cls && t.skill === idx) ? 1 : 0; }
/* Wartości umiejętności dla karty: celność, obrażenia, leczenie, Stres, kryt */
function skillView(h, idx, st) {
  st = st || heroStats(h);
  const c = CLS[h.cls]; const s = c.skills[idx]; const inf = skillInfo(c, s);
  const tb = classTrinketFor(h, idx); const mb = st.mainBonus;
  const out = { s, inf, cel: null, dmg: null, heal: null, stress: null, crit: st.crit + (/Kryt \+1 przy tym ataku/.test(s.eff) ? 1 : 0), tb };
  if (inf.attack) out.cel = s.cel + st.acc;
  if (inf.dice) out.dmgBonus = st.dmg + (inf.main === 'dmg' ? mb + tb : 0), out.dmg = diceStr(inf.dice, out.dmgBonus);
  if (inf.heal) out.healBonus = inf.main === 'heal' ? mb + tb : 0, out.heal = diceStr(inf.heal, out.healBonus);
  if (inf.stress) out.stress = inf.stress + (inf.main === 'stress' ? mb + tb : 0);
  return out;
}
function effectText(v) {
  let e = v.s.eff;
  if (v.heal && v.inf.heal && v.healBonus) e = e.replace(/leczy (się o )?(k\d+(?:\+\d+)?|\d+)/, (m, a) => 'leczy ' + (a || '') + v.heal);
  if (v.stress && v.stress !== v.inf.stress) e = e.replace(/−\d+ Stres/, '−' + v.stress + ' Stres');
  return e;
}

/* ---------- premie przeciw typom ---------- */
function typeBonus(eff, enemy, hero) {
  let b = 0; const t = enemy.type || '';
  const has = w => t.includes(w);
  const rx = /\+(\d) obrażeń przeciw ([^,;]+)/g; let m;
  while ((m = rx.exec(eff))) {
    const what = m[2];
    if (/Nieumarł/.test(what) && has('Nieumar')) b += +m[1];
    if (/Plugaw/.test(what) && has('Plugaw')) b += +m[1];
    if (/Bestiom/.test(what) && (has('Besti') || (/Znakiem/.test(what) && enemy.fx && enemy.fx.mark))) b += +m[1];
    else if (/Ludziom/.test(what) && has('Człowiek')) b += +m[1];
    else if (/^celom ze Znakiem/.test(what) && enemy.fx && enemy.fx.mark) b += +m[1];
    if (/ogłuszonym/.test(what) && enemy.fx && enemy.fx.stun) b += +m[1];
  }
  const m2 = eff.match(/\+2 przeciw celom ze Znakiem/); if (m2 && enemy.fx && enemy.fx.mark) b += 2;
  if (/\+3 obrażeń, gdy Biczownik ma 4 Zdrowia lub mniej/.test(eff) && hero && hero.hp <= 4) b += 3;
  if (hero) {
    if (hero.qp.some(q => qname(q.t) === 'Pogromca nieumarłych') && has('Nieumar')) b += 1;
    if (hero.qp.some(q => qname(q.t) === 'Łowca bestii') && has('Besti')) b += 1;
  }
  return b;
}
/* efekty z opisu umiejętności, które da się rozstrzygnąć automatycznie */
function parseEffects(eff) {
  const out = [];
  let m;
  if ((m = eff.match(/krwawienie (\d)/))) out.push({ k: 'bleed', x: +m[1], res: 'odp' });
  if ((m = eff.match(/zaraza (\d)/))) out.push({ k: 'blight', x: +m[1], res: 'odp' });
  if (/ogłuszenie/.test(eff)) out.push({ k: 'stun', res: 'krzepa' });
  if (/Znak/.test(eff) && !/ze Znakiem/.test(eff.replace(/Znak,|Znak$/, ''))) { if (/(^|, )Znak(,|$| )/.test(eff)) out.push({ k: 'mark' }); }
  if ((m = eff.match(/odrzut (\d)/))) out.push({ k: 'push', x: +m[1], res: 'krzepa' });
  if ((m = eff.match(/przyciągnięcie (\d)/)) || (m = eff.match(/przyciąga o (\d)/))) out.push({ k: 'pull', x: +m[1], res: 'krzepa' });
  if ((m = eff.match(/[^,;:]*cel(?:u|ów) −\d[^,;]*/))) { const tm = m[0].match(/na (\d) tury/); out.push({ k: 'debuff', txt: m[0].trim().replace(/ na \d tury/, ''), turns: tm ? +tm[1] : 3, res: 'krzepa' }); }
  if (/^cel: obrażenia −1 i Celność −1/.test(eff)) out.push({ k: 'debuff', txt: 'obrażenia −1, Celność −1', turns: 3, res: 'krzepa' });
  return out;
}

/* ---------- wrogowie ---------- */
function findEnemyDef(name) {
  for (const r of ['Ruiny', 'Nory', 'Knieja', 'Zatoka']) {
    const e = DATA.bestiary[r].enemies.find(x => x.name === name); if (e) return { e, region: r };
  }
  const e = DATA.bestiary.DD.enemies.find(x => x.name === name); if (e) return { e, region: 'DD' };
  return null;
}
function makeEnemy(name, dl, opts = {}) {
  const f = findEnemyDef(name); if (!f) return null;
  const e = f.e; const flat = f.region === 'DD'; dl = flat ? 0 : dl;
  const attacks = e.attacks.split(' · ').map(parseAttack).map(a => scaleAttack(a, dl, flat));
  const hp = e.hp + (flat || opts.summon ? 0 : 5 * dl);
  return {
    id: uid(), name, dl, flat, region: f.region, hp, maxhp: hp, dodge: e.dodge + (flat ? 0 : dl), prot: e.prot, speed: e.speed + (dl === 2 ? 1 : 0),
    type: e.type, pos: e.pos, attacks, boss: false, size: name === 'Templariusz' ? 2 : 1,
    krzepa: flat ? 5 : 3 + dl, odp: flat ? 5 : 3 + dl, noBleed: /^Kości/.test(name), fx: {}, corpse: false
  };
}
function makeBoss(region, dl, floorIdx) {
  let def, flat = false;
  if (region === 'DD') { def = DATA.bestiary.DD.floors[floorIdx]; flat = true; dl = 0; }
  else if (region === 'Shambler') { def = Object.assign({ name: 'Shambler' }, DATA.bestiary.Shambler); flat = true; dl = 0; }
  else def = DATA.bestiary[region].boss;
  const p = parseBossLine(def.line);
  const moves = def.moves.map(x => x.replace(/\*\*/g, ''));
  const isAtk = x => /^[^:]+:\s*W [0-9+–]+, Cel\./.test(x);
  const attacks = moves.filter(isAtk).map(parseAttack).map(a => scaleAttack(a, dl, flat));
  const notes = moves.filter(x => !isAtk(x));
  const hp = p.hp + (flat ? 0 : 10 * dl / 2 * 1);
  const hpS = p.hp + (flat ? 0 : [0, 5, 10][dl]);
  return {
    id: uid(), name: def.name, dl, flat, region, hp: hpS, maxhp: hpS, dodge: p.dodge + (flat ? 0 : dl), prot: p.prot, speed: p.speed + (dl === 2 ? 1 : 0),
    type: p.type, pos: '—', attacks, notes, where: p.where, boss: true, size: (/zajmuje pozycje|2 pozycje/.test(def.line)) ? 2 : 1,
    krzepa: def.name === 'Serce Ciemności' ? 9 : 7, odp: 5, noBleed: false, fx: {}, corpse: false
  };
}
function makeSummon(name, dl) {
  if (name === 'Macka') return { id: uid(), name: 'Macka', dl: 0, flat: true, hp: 6, maxhp: 6, dodge: 1, prot: 0, speed: 4, type: 'Plugawy', pos: '1–2', attacks: [scaleAttack(parseAttack('Macka: W 1–2, Cel. 7, k4'), 0, true)], boss: false, size: 1, krzepa: 5, odp: 5, noBleed: false, fx: {}, corpse: false };
  if (name === 'Giermek') return { id: uid(), name: 'Giermek', dl, flat: false, hp: 8, maxhp: 8, dodge: 3 + dl, prot: 0, speed: 6 + (dl === 2 ? 1 : 0), type: 'Człowiek', pos: '3', attacks: [scaleAttack(parseAttack('Ukłucie: W 1–4, Cel. 8, k2'), dl, false), { name: 'Proporzec', text: 'Książę: Celność +1 i obrażenia +1 na 2 tury' }], boss: false, size: 1, krzepa: 3 + dl, odp: 3 + dl, noBleed: false, fx: {}, corpse: false };
  const e = makeEnemy(name, dl, { summon: true }); return e;
}
/* Spotkanie: k10 1–4 trzech, 5–10 czterech; poz. 1–2 przodownicy, 3–4 tylni */
function rollEncounter(region, dl) {
  if (region === 'DD') {
    const r = d(10); const E = DATA.bestiary.DD.enemies;
    const fr = E.filter(e => /^1/.test(e.pos) && e.name !== 'Templariusz'), bk = E.filter(e => /3|4/.test(e.pos) && /^[23]/.test(e.pos));
    if (r === 10) return { r, list: [makeEnemy('Templariusz', 0), makeEnemy(pick(bk).name, 0), makeEnemy(pick(bk).name, 0)] };
    const n = r <= 3 ? 3 : 4; const list = [makeEnemy(pick(fr).name, 0), makeEnemy(pick(fr).name, 0)];
    for (let i = 2; i < n; i++) list.push(makeEnemy(pick(bk).name, 0));
    return { r, list };
  }
  const enc = DATA.encounters[region]; const r = d(10); const n = r <= 4 ? 3 : 4;
  const fr = enc.front.split(', '), bk = enc.back.split(', ');
  const list = [makeEnemy(pick(fr), dl), makeEnemy(pick(fr), dl)];
  for (let i = 2; i < n; i++) list.push(makeEnemy(pick(bk), dl));
  return { r, list };
}
function bossSetup(region, dl, floorIdx) {
  const b = makeBoss(region, dl, floorIdx);
  const sm = n => makeEnemy(n, region === 'DD' ? 0 : dl);
  if (region === 'Ruiny') return [sm('Kościany żołdak'), sm('Kościany żołdak'), b];
  if (region === 'Nory') return [b, makeSummon('Giermek', dl)];
  if (region === 'Knieja') return [b, sm('Grzybowy drapacz'), sm('Bandyta strzelec')];
  if (region === 'Zatoka') return [sm('Pelagiczny łowca'), sm('Pelagiczny łowca'), b];
  if (region === 'Shambler') return [b, makeSummon('Macka'), makeSummon('Macka')];
  if (region === 'DD') {
    if (floorIdx === 0) return [sm('Kultysta wojownik'), sm('Kultysta wojownik'), b];
    if (floorIdx === 1) return [b, sm('Kultysta kapłan'), sm('Polip')];
    if (floorIdx === 2) return [sm('Ochłap'), sm('Ochłap'), b];
    return [b, sm('Polip'), sm('Polip')];
  }
  return [b];
}
function enemyDodge(e) { return e.dodge + (fxMods(e.fx).dodge || 0); }
function enemyProt(e) { return Math.max(0, e.prot + (fxMods(e.fx).prot || 0)); }

/* ---------- rozstrzyganie ---------- */
function hitRoll(chance, critv) {
  const r = d(10);
  if (r === 1) return { r, res: 'crit' };
  if (r === 10) return { r, res: 'miss' };
  if (r > chance) return { r, res: 'miss' };
  return { r, res: r <= critv ? 'crit' : 'hit' };
}
function resist(val, crit) {
  if (crit) return { r: null, ok: false };
  const r = d(10); return { r, ok: r === 1 || (r !== 10 && r <= val) };
}
