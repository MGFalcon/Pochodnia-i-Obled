/* Stan gry i połączenie. Jeden stan S dla wszystkich, prywatne G tylko dla MG.
   Tryby: local (jedno urządzenie), host/client (pokój: przeglądarki łączą się bezpośrednio, MG przechowuje stan),
   db (strona Claude: zapis w bazie artefaktu). Zmiany zawsze idą przez act([...op]). */
const DEFAULT_S = () => ({
  v: 1,
  stol: { torch: 10, round: 0, heroes: [], enemies: [], init: [], turn: -1, fight: false, region: 'Ruiny', dl: 0 },
  wyprawa: { quest: null, rooms: [], edges: [], at: null, crossed: 0, sup: {}, loot: { zloto: 0, klejnoty: 0, pamiatki: 0, inne: [] }, campsLeft: 0 },
  osada: {
    week: 1, gold: 20, mem: { Popiersie: 0, Portret: 0, Akt: 0, Herb: 0 },
    b: { Opactwo: 0, Gospoda: 0, Sanatorium: 0, Gildia: 0, 'Kuźnia': 0, Obozownik: 0, 'Dyliżans': 0, 'Wóz Nomadów': 0 },
    slots: 9, trinkets: [], board: [], regions: ['ruiny'], bosses: {}, dd: 0, cemetery: [], recruits: [], event: null
  },
  heroes: {},
  log: []
});
const DEFAULT_G = () => ({ npc: {}, foes: {}, rooms: {}, notes: '' });
const LOG_MAX = 160;

function applyOp(S, op) {
  if (op.log) { S.log.push(op.log); if (S.log.length > LOG_MAX) S.log.splice(0, S.log.length - LOG_MAX); return; }
  const parts = op.p.split('.');
  let o = S;
  for (let i = 0; i < parts.length - 1; i++) {
    if (o[parts[i]] == null || typeof o[parts[i]] !== 'object') o[parts[i]] = {};
    o = o[parts[i]];
  }
  const k = parts[parts.length - 1];
  if (op.del) { if (Array.isArray(o)) o.splice(+k, 1); else delete o[k]; }
  else o[k] = op.v;
}
const opSet = (p, v) => ({ p, v: clone(v) });
const opDel = p => ({ p, del: true });

const TAB = (() => { try { let t = sessionStorage.getItem('pio:tab'); if (!t) { t = 't' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); sessionStorage.setItem('pio:tab', t); } return t; } catch (e) { return 't' + Math.random().toString(36).slice(2); } })();
const byName = () => Store.mode === 'local' ? '' : Store.me.name;
const Store = {
  S: DEFAULT_S(), G: DEFAULT_G(),
  mode: 'local', role: 'mg', me: { id: 'lokalny', name: 'Ty' },
  room: null, peers: [], status: 'local', listeners: [],
  onChange(fn) { this.listeners.push(fn); },
  changed(what) { this.listeners.forEach(f => { try { f(what); } catch (e) { console.error(e); } }); },
  canWrite() { return this.role !== 'widz'; },
  isGM() { return this.role === 'mg'; },
  setStatus(s, txt) { this.status = s; this.statusText = txt; $$('.sync').forEach(el => { el.dataset.s = s; el.textContent = txt; }); },

  /* zmiana stanu: lokalnie od razu, potem wysyłka zależnie od trybu */
  act(ops, opts = {}) {
    if (!Array.isArray(ops)) ops = [ops];
    if (!this.canWrite()) { toast('Oglądasz stół — zmiany robią MG i gracze z prawem edycji.'); return; }
    ops.forEach(op => applyOp(this.S, op));
    T.send(ops);
    if (!opts.quiet) this.changed('local');
  },
  actG(fn) { fn(this.G); T.saveG(); },
  log(entry) {
    const e = Object.assign({ id: uid(), t: Date.now(), by: byName(), uid: this.me.id }, entry);
    this.act([{ log: e }], { quiet: false });
    return e;
  }
};

/* ---------- transport ---------- */
const T = {
  kind: 'local', key: 'pio:stol',
  saveLocal() { LS.set(this.key + ':S', Store.S); },
  saveG() { LS.set(this.key + ':G', Store.G); if (this.kind === 'db') DbT.saveG(); },
  send(ops) {
    if (this.kind === 'local') return this.saveLocal();
    if (this.kind === 'host') { this.saveLocal(); return Room.broadcast({ t: 'ops', ops, from: TAB }); }
    if (this.kind === 'client') return Room.toHost({ t: 'ops', ops, from: TAB });
    if (this.kind === 'db') return DbT.push(ops);
  },
  startLocal() {
    this.kind = 'local'; Store.mode = 'local'; Store.role = 'mg';
    const s = LS.get(this.key + ':S'); if (s) Store.S = Object.assign(DEFAULT_S(), s);
    const g = LS.get(this.key + ':G'); if (g) Store.G = Object.assign(DEFAULT_G(), g);
    Store.setStatus('local', 'gra na jednym urządzeniu');
  }
};

/* ---------- pokój: MG przechowuje stan, gracze łączą się bezpośrednio (PeerJS albo karty jednej przeglądarki) ---------- */
const ICE = { config: { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }, { urls: 'stun:stun1.l.google.com:19302' }, { urls: ['turn:openrelay.metered.ca:80', 'turn:openrelay.metered.ca:443', 'turn:openrelay.metered.ca:443?transport=tcp'], username: 'openrelayproject', credential: 'openrelayproject' }] } };
const Room = {
  conns: [], peer: null, bc: null, hostConn: null, code: null, names: {},
  newCode() { const a = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; let s = ''; for (let i = 0; i < 5; i++) s += a[d(a.length) - 1]; return s; },
  loadPeerJs() {
    return new Promise((res, rej) => {
      if (window.Peer) return res();
      const sc = document.createElement('script');
      sc.src = 'https://unpkg.com/peerjs@1.5.4/dist/peerjs.min.js';
      sc.onload = () => res(); sc.onerror = () => rej(new Error('peerjs'));
      document.head.appendChild(sc);
    });
  },
  /* via: 'peer' (internet) albo 'bc' (karty tej samej przeglądarki — test i drugi ekran) */
  async host(code, via) {
    this.code = code; T.kind = 'host'; Store.mode = 'host'; Store.role = 'mg';
    T.key = 'pio:pokoj:' + code;
    const s = LS.get(T.key + ':S'); if (s) Store.S = Object.assign(DEFAULT_S(), s);
    const g = LS.get(T.key + ':G'); if (g) Store.G = Object.assign(DEFAULT_G(), g);
    LS.set('pio:ostatni', { code, via, role: 'mg' });
    if (via === 'bc') {
      this.bc = new BroadcastChannel('pio-' + code);
      this.bc.onmessage = ev => this.hostHandle(ev.data, m => this.bc.postMessage(m));
      Store.setStatus('db', 'pokój ' + code + ' (ta przeglądarka)');
      return;
    }
    Store.setStatus('slow', 'otwieram pokój ' + code + '…');
    await this.loadPeerJs();
    const open = () => {
      this.peer = new Peer('pochodnia-' + code.toLowerCase(), Object.assign({ debug: 0 }, ICE));
      this.peer.on('open', () => Store.setStatus('db', 'pokój ' + code + ' otwarty'));
      this.peer.on('connection', conn => {
        conn.on('data', m => this.hostHandle(m, x => { try { conn.send(x); } catch (e) { } }, conn));
        conn.on('close', () => { this.conns = this.conns.filter(c => c !== conn); this.peerList(); });
        conn.on('error', () => { });
      });
      this.peer.on('disconnected', () => { Store.setStatus('slow', 'łączę ponownie…'); try { this.peer.reconnect(); } catch (e) { } });
      this.peer.on('error', e => {
        if (e && e.type === 'unavailable-id') Store.setStatus('error', 'kod ' + code + ' jest zajęty — otwórz pokój z nowym kodem');
        else Store.setStatus('error', 'kłopot z połączeniem: ' + (e && e.type || 'nieznany'));
      });
    };
    open();
  },
  hostHandle(m, reply, conn) {
    if (!m || typeof m !== 'object') return;
    if (m.t === 'hello') {
      if (conn) { conn._pid = m.id; conn._name = m.name; if (!this.conns.includes(conn)) this.conns.push(conn); }
      else this.names[m.id] = m.name;
      reply({ t: 'state', S: Store.S, to: m.id });
      this.peerList();
    } else if (m.t === 'ops' && Array.isArray(m.ops)) {
      m.ops.forEach(op => applyOp(Store.S, op));
      T.saveLocal();
      this.broadcast({ t: 'ops', ops: m.ops, from: m.from });
      Store.changed('remote');
    } else if (m.t === 'bye' && !conn) { delete this.names[m.id]; this.peerList(); }
  },
  peerList() {
    const list = [{ id: Store.me.id, name: Store.me.name + ' (MG)' }].concat(this.conns.map(c => ({ id: c._pid, name: c._name }))).concat(Object.entries(this.names).map(([id, name]) => ({ id, name })));
    Store.peers = list; this.broadcast({ t: 'peers', list }); Store.changed('peers');
  },
  broadcast(m) {
    if (this.bc) this.bc.postMessage(m);
    this.conns.forEach(c => { try { c.send(m); } catch (e) { } });
  },
  async join(code, name, via) {
    this.code = code; T.kind = 'client'; Store.mode = 'client'; Store.role = 'gracz';
    Store.me.name = name || 'Gracz';
    LS.set('pio:ostatni', { code, via, role: 'gracz', name });
    const handle = m => {
      if (!m || typeof m !== 'object') return;
      if (m.t === 'state' && (!m.to || m.to === Store.me.id)) { Store.S = Object.assign(DEFAULT_S(), m.S); Store.setStatus('db', 'w pokoju ' + code); Store.changed('remote'); }
      else if (m.t === 'ops') { if (m.from === TAB) return; m.ops.forEach(op => applyOp(Store.S, op)); Store.changed('remote'); }
      else if (m.t === 'peers') { Store.peers = m.list; Store.changed('peers'); }
    };
    if (via === 'bc') {
      this.bc = new BroadcastChannel('pio-' + code);
      this.bc.onmessage = ev => handle(ev.data);
      this.toHost = m => this.bc.postMessage(m);
      this.toHost({ t: 'hello', id: Store.me.id, name: Store.me.name });
      window.addEventListener('beforeunload', () => this.toHost({ t: 'bye', id: Store.me.id }));
      Store.setStatus('slow', 'szukam pokoju ' + code + '…');
      return;
    }
    Store.setStatus('slow', 'łączę z pokojem ' + code + '…');
    await this.loadPeerJs();
    const connect = () => {
      if (!this.peer || this.peer.destroyed) this.peer = new Peer(Object.assign({ debug: 0 }, ICE));
      const go = () => {
        const conn = this.peer.connect('pochodnia-' + code.toLowerCase(), { reliable: true });
        this.hostConn = conn;
        conn.on('open', () => { conn.send({ t: 'hello', id: Store.me.id, name: Store.me.name }); });
        conn.on('data', handle);
        conn.on('close', () => { Store.setStatus('slow', 'rozłączono — łączę ponownie…'); setTimeout(go, 3000); });
        conn.on('error', () => { });
      };
      if (this.peer.open) go(); else this.peer.on('open', go);
      this.peer.on('error', e => {
        if (e && e.type === 'peer-unavailable') { Store.setStatus('error', 'nie ma pokoju ' + code + ' — sprawdź kod albo poczekaj na MG'); setTimeout(go, 4000); }
        else Store.setStatus('error', 'kłopot z połączeniem: ' + (e && e.type || 'nieznany'));
      });
    };
    connect();
    this.toHost = m => { try { this.hostConn && this.hostConn.open && this.hostConn.send(m); } catch (e) { } };
  },
  toHost() { }
};

/* ---------- strona Claude: baza artefaktu ---------- */
const DbT = {
  db: null, timers: {}, chains: {}, gmPath: null,
  docOf(op) {
    if (op.log) return null;
    const [top, id] = op.p.split('.');
    if (top === 'heroes') return id ? 'bohaterowie/' + id : null;
    if (top === 'stol' || top === 'wyprawa' || top === 'osada') return 'stan/' + top;
    return null;
  },
  push(ops) {
    ops.forEach(op => {
      if (op.log) { this.queue('log', () => this.db.collection('dziennik').doc(op.log.id).set(clone(op.log))); return; }
      const path = this.docOf(op); if (!path) return;
      clearTimeout(this.timers[path]);
      this.timers[path] = setTimeout(() => { delete this.timers[path]; this.write(path); }, 250);
    });
  },
  write(path) {
    const [col, id] = path.split('/');
    let val;
    if (col === 'bohaterowie') val = Store.S.heroes[id];
    else val = Store.S[id];
    this.queue(path, () => val ? this.db.doc(path).set(Object.assign(clone(val), { _t: Date.now() })) : this.db.doc(path).delete());
  },
  queue(k, fn) {
    this.chains[k] = (this.chains[k] || Promise.resolve()).then(fn).catch(e => {
      if (e && e.code === 'invalid_argument' && Store.role !== 'mg') { Store.role = 'widz'; Store.changed('role'); }
      Store.setStatus('error', 'nie udało się zapisać zmiany');
    });
  },
  saveG() {
    if (!this.db || !this.gmPath) return;
    clearTimeout(this.timers.G);
    this.timers.G = setTimeout(() => this.queue('G', () => this.db.doc(this.gmPath).set(clone(Store.G))), 500);
  },
  async start(db, user) {
    this.db = db; T.kind = 'db'; Store.mode = 'db'; T.key = 'pio:claude';
    const s = LS.get(T.key + ':S'); if (s) Store.S = Object.assign(DEFAULT_S(), s);
    let owner = false, canW = null, id = null, name = 'Gracz';
    if (user) {
      try { owner = await user.isOwner(); } catch (e) { }
      try { canW = await user.can('data.write'); } catch (e) { }
      try { id = await user.id(); } catch (e) { }
      try { const me = await user.me(); name = (me && me.name) || name; } catch (e) { }
    }
    Store.me = { id: id || 'anon-' + uid(), name: owner ? 'MG' : name };
    Store.role = owner ? 'mg' : (canW === false ? 'widz' : 'gracz');
    Store.setStatus('slow', 'łączę z zapisem…');
    const tm = setTimeout(() => Store.setStatus('slow', 'zapis nie odpowiada — pracujesz na kopii z tej przeglądarki'), 10000);
    const ok = () => { clearTimeout(tm); Store.setStatus('db', Store.role === 'widz' ? 'oglądasz na żywo' : 'zapis na żywo'); };
    const save = () => LS.set(T.key + ':S', Store.S);
    ['stol', 'wyprawa', 'osada'].forEach(k => {
      db.doc('stan/' + k).onSnapshot(sn => {
        if (!sn.metadata.fromCache) ok();
        if (this.timers['stan/' + k] || (sn.metadata && sn.metadata.hasPendingWrites)) return;
        if (!sn.exists) { if (!sn.metadata.fromCache && Store.role === 'mg') this.write('stan/' + k); return; }
        const v = clone(sn.data()); delete v._t; Store.S[k] = Object.assign(DEFAULT_S()[k], v); save(); Store.changed('remote');
      }, () => Store.setStatus('error', 'brak dostępu do zapisu'));
    });
    db.collection('bohaterowie').onSnapshot(sn => {
      if (!sn.metadata.fromCache) ok();
      let ch = false;
      sn.docChanges().forEach(c => {
        const id = c.doc.id;
        if (this.timers['bohaterowie/' + id] || (c.doc.metadata && c.doc.metadata.hasPendingWrites)) return;
        if (c.type === 'removed') { delete Store.S.heroes[id]; ch = true; return; }
        const v = clone(c.doc.data()); delete v._t; Store.S.heroes[id] = v; ch = true;
      });
      if (ch) { save(); Store.changed('remote'); }
    }, () => { });
    db.collection('dziennik').orderBy('t', 'desc').limit(LOG_MAX).onSnapshot(sn => {
      Store.S.log = sn.docs.map(x => x.data()).filter(Boolean).reverse();
      Store.changed('log');
      if (Store.role === 'mg' && !sn.metadata.fromCache && sn.size >= LOG_MAX) this.prune();
    }, () => { });
    if (owner && id) {
      this.gmPath = 'data/users/' + id + '/mg';
      try {
        const g = await db.doc(this.gmPath).get();
        if (g.exists) Store.G = Object.assign(DEFAULT_G(), g.data());
        else { const lg = LS.get(T.key + ':G'); if (lg) Store.G = Object.assign(DEFAULT_G(), lg); }
      } catch (e) { }
    }
  },
  async prune() {
    try {
      const old = await this.db.collection('dziennik').orderBy('t', 'desc').limit(LOG_MAX + 60).get();
      old.docs.slice(LOG_MAX).forEach(x => this.queue('prune', () => this.db.collection('dziennik').doc(x.id).delete()));
    } catch (e) { }
  }
};
/* obecność przy stole na stronie Claude */
async function startPresence() {
  if (!window.claude || !window.claude.use) return;
  let room = null, user = null;
  try { room = await window.claude.use('room'); user = await window.claude.use('user'); } catch (e) { }
  if (!room) return;
  room.onPeers(async ch => {
    const ids = ch.peers.map(p => p.by).filter(Boolean);
    let prof = {};
    try { prof = user ? await user.profiles(ids) : {}; } catch (e) { }
    Store.peers = ch.peers.map(p => ({ id: p.by || p.peer, name: (p.by && prof[p.by] && prof[p.by].name) || (p.presence && p.presence.nick) || 'Ktoś', me: p.isMe }));
    Store.changed('peers');
  });
  try { room.presence({ nick: Store.me.name, view: location.hash || '#stol' }); } catch (e) { }
  window.addEventListener('hashchange', () => { try { room.presence({ view: location.hash }); } catch (e) { } });
}
