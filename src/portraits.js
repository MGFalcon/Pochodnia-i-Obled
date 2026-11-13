/* Portrety klas: własne, proste ryciny archetypów (popiersie + nakrycie głowy i rekwizyt). Własny portret gracza ma pierwszeństwo. */
const PC = { skin: '#c9b393', skin2: '#a8936f', cloth: '#2b2420', cloth2: '#3a302a', metal: '#8d8a84', metal2: '#b5b1a8', red: '#9a2218', gold: '#c9a24a', ink: '#0e0c0b', bone: '#e3d6bb' };
const P_EYES = `<ellipse cx="44.5" cy="56" rx="1.9" ry="1.3" fill="${PC.ink}"/><ellipse cx="55.5" cy="56" rx="1.9" ry="1.3" fill="${PC.ink}"/>`;
const P_HEAD = (cy = 56, rx = 14, ry = 17) => `<path d="M50 ${74} L57 74 L58 88 L42 88 L43 74 Z" fill="${PC.skin2}"/><ellipse cx="50" cy="${cy}" rx="${rx}" ry="${ry}" fill="${PC.skin}"/><path d="M50 ${cy - ry} A${rx} ${ry} 0 0 1 50 ${cy + ry} Z" fill="#000" opacity=".16"/>`;
const P_BODY = (fill) => `<path d="M6 120 C8 94 28 86 50 86 C72 86 92 94 94 120 Z" fill="${fill}"/>`;
const PORTRAIT_ART = [
  /* Krzyżowiec */ () => P_BODY('#5c5a56') + `<path d="M30 120 L32 92 Q50 86 68 92 L70 120 Z" fill="${PC.bone}"/><rect x="46" y="94" width="8" height="26" fill="${PC.red}"/><rect x="37" y="101" width="26" height="7" fill="${PC.red}"/>` +
    `<path d="M34 41 Q50 29 66 41 L67 73 Q50 80 33 73 Z" fill="${PC.metal}" stroke="${PC.ink}" stroke-width="1.5"/><path d="M50 30 Q66 41 67 73 Q58 77 50 78 Z" fill="#000" opacity=".15"/><rect x="36" y="52" width="28" height="3.2" fill="${PC.ink}"/><rect x="48.6" y="57" width="2.8" height="16" fill="${PC.ink}" opacity=".55"/>` +
    [62, 66, 70].map(y => `<circle cx="42" cy="${y}" r=".9" fill="${PC.ink}"/><circle cx="58" cy="${y}" r=".9" fill="${PC.ink}"/>`).join(''),
  /* Rozbójnik */ () => P_BODY(PC.cloth2) + `<path d="M38 88 L50 104 L62 88 Z" fill="${PC.bone}" opacity=".85"/>` + P_HEAD() + P_EYES +
    `<path d="M40 52 L48 53 M52 53 L60 52" stroke="${PC.ink}" stroke-width="1.4"/><path d="M36 60 Q50 66 64 60 L63 72 Q50 79 37 72 Z" fill="#7a1d16"/>` +
    `<path d="M24 45 Q50 24 76 45 Q63 39 50 40 Q37 39 24 45 Z" fill="${PC.cloth}" stroke="${PC.ink}" stroke-width="1.2"/><path d="M35 42 Q50 26 65 42 Z" fill="#1a1512"/>`,
  /* Doktor Plagi */ () => P_BODY('#16120f') + P_HEAD() + `<ellipse cx="50" cy="56" rx="14.5" ry="17" fill="#5a4630"/>` +
    `<path d="M46 58 Q62 63 82 80 Q61 73 46 67 Z" fill="#6b5236" stroke="${PC.ink}" stroke-width="1.2"/><circle cx="44.5" cy="52" r="4.2" fill="${PC.gold}" stroke="${PC.ink}" stroke-width="1.6"/><circle cx="55.5" cy="52" r="4.2" fill="${PC.gold}" stroke="${PC.ink}" stroke-width="1.6"/><circle cx="44.5" cy="52" r="2" fill="#2a2116"/><circle cx="55.5" cy="52" r="2" fill="#2a2116"/>` +
    `<ellipse cx="50" cy="41" rx="31" ry="6" fill="#1a1512"/><path d="M37 41 L39 23 L61 23 L63 41 Z" fill="#1a1512"/><rect x="39" y="34" width="22" height="3" fill="${PC.red}" opacity=".7"/>`,
  /* Westalka */ () => `<path d="M26 120 L28 62 Q28 32 50 31 Q72 32 72 62 L74 120 Z" fill="#1a1512"/>` + P_BODY('#1f1a17') + `<path d="M35 46 Q50 35 65 46 L65 71 Q50 82 35 71 Z" fill="${PC.bone}"/>` + P_HEAD(58, 11, 13) +
    `<ellipse cx="45.5" cy="57" rx="1.6" ry="1.1" fill="${PC.ink}"/><ellipse cx="54.5" cy="57" rx="1.6" ry="1.1" fill="${PC.ink}"/><path d="M47 65 Q50 66.5 53 65" stroke="${PC.ink}" stroke-width="1" fill="none"/><circle cx="50" cy="102" r="5" fill="${PC.gold}"/>` +
    [0, 45, 90, 135, 180, 225, 270, 315].map(a => `<line x1="${50 + 6 * Math.cos(a * Math.PI / 180)}" y1="${102 + 6 * Math.sin(a * Math.PI / 180)}" x2="${50 + 9 * Math.cos(a * Math.PI / 180)}" y2="${102 + 9 * Math.sin(a * Math.PI / 180)}" stroke="${PC.gold}" stroke-width="1.4"/>`).join(''),
  /* Piekielnica */ () => `<path d="M30 64 Q24 30 50 30 Q76 30 70 64 L78 82 L66 72 L64 88 L56 70 L46 88 L42 72 L30 86 L34 70 Z" fill="#7a3a1a"/>` + P_BODY(PC.skin2) + `<path d="M14 104 Q30 88 50 92 Q70 88 86 104 Q70 98 50 100 Q30 98 14 104 Z" fill="#5c4632"/>` + P_HEAD() + P_EYES +
    `<rect x="35" y="53" width="30" height="4" fill="${PC.red}" opacity=".85"/><path d="M40 51 L48 53 M52 53 L60 51" stroke="${PC.ink}" stroke-width="1.6"/><path d="M45 67 L55 67" stroke="${PC.ink}" stroke-width="1.2"/><path d="M36 42 Q44 34 50 40 Q56 34 64 42 Q58 38 50 44 Q42 38 36 42 Z" fill="#8a4420"/>`,
  /* Okultysta */ () => `<path d="M28 120 L31 70 Q29 38 50 24 Q71 38 69 70 L72 120 Z" fill="#3a1830"/>` + P_BODY('#2a1224') + `<ellipse cx="50" cy="58" rx="12" ry="15" fill="#100b0b"/>` +
    `<circle cx="45.5" cy="56" r="1.9" fill="#e3c15c"/><circle cx="54.5" cy="56" r="1.9" fill="#e3c15c"/><circle cx="50" cy="104" r="8" fill="none" stroke="${PC.gold}" stroke-width="1.3"/><path d="M50 96 L57 108 L43 108 Z" fill="none" stroke="${PC.gold}" stroke-width="1.3"/>`,
  /* Rabuś Grobów */ () => `<path d="M30 120 L32 70 Q30 40 50 30 Q70 40 68 70 L70 120 Z" fill="#4a3a2a"/>` + P_BODY('#3a2e22') + P_HEAD(57, 12, 15) + P_EYES +
    `<path d="M37 59 Q50 63 63 59 L62 71 Q50 77 38 71 Z" fill="${PC.cloth}"/><path d="M40 51 L48 53 M52 53 L60 51" stroke="${PC.ink}" stroke-width="1.3"/><path d="M72 92 L84 80 M74 96 L86 84" stroke="${PC.metal2}" stroke-width="2.2"/><path d="M70 94 L76 98" stroke="${PC.gold}" stroke-width="3"/>`,
  /* Zbrojny */ () => P_BODY('#4a463f') + P_HEAD() + P_EYES + `<path d="M40 52 L48 53 M52 53 L60 52" stroke="${PC.ink}" stroke-width="1.6"/><path d="M37 61 Q50 84 63 61 Q61 76 50 78 Q39 76 37 61 Z" fill="#6b6359"/>` +
    `<path d="M28 46 Q50 41 72 46 L68 49 Q50 46 32 49 Z" fill="${PC.metal}" stroke="${PC.ink}"/><path d="M37 46 Q38 29 50 29 Q62 29 63 46 Z" fill="${PC.metal2}" stroke="${PC.ink}" stroke-width="1.2"/>` +
    `<path d="M4 120 L6 92 Q18 85 30 92 L28 120 Z" fill="#6b2a1f" stroke="${PC.gold}" stroke-width="1.5"/>`,
  /* Trędowaty */ () => `<path d="M24 120 L28 68 Q28 34 50 30 Q72 34 72 68 L76 120 Z" fill="#8a7d66"/>` + P_BODY('#6f6450') + P_HEAD(57, 13, 16) + `<ellipse cx="50" cy="57" rx="13" ry="16" fill="#8f7b5c"/>` +
    `<path d="M37 49 L63 52 M36 58 L64 60 M37 66 L63 64" stroke="${PC.bone}" stroke-width="4.2" opacity=".95"/><rect x="40" y="53.5" width="20" height="2.6" fill="${PC.ink}"/><path d="M80 120 L80 60 M74 66 L86 66" stroke="${PC.metal2}" stroke-width="3"/>`,
  /* Błazen */ () => P_BODY('#2b4a5a') + `<path d="M28 92 L34 86 L40 92 L46 86 L52 92 L58 86 L64 92 L70 86 L74 92 L70 96 L30 96 Z" fill="${PC.bone}"/>` + P_HEAD() + P_EYES +
    `<path d="M42 66 Q50 72 58 66" stroke="${PC.ink}" stroke-width="1.3" fill="none"/><path d="M36 45 Q30 24 16 28 Q30 33 34 47 Z" fill="#7a1d16" stroke="${PC.ink}"/><path d="M64 45 Q70 24 84 28 Q70 33 66 47 Z" fill="#2b4a5a" stroke="${PC.ink}"/><path d="M35 47 Q50 33 65 47 Z" fill="${PC.cloth2}"/>` +
    `<circle cx="16" cy="28" r="3" fill="${PC.gold}"/><circle cx="84" cy="28" r="3" fill="${PC.gold}"/>`,
  /* Psiarz */ () => P_BODY('#2a3340') + P_HEAD() + P_EYES + `<path d="M40 52 L48 53 M52 53 L60 52" stroke="${PC.ink}" stroke-width="1.5"/><path d="M42 64 Q46 61 50 63 Q54 61 58 64 Q54 66 50 65 Q46 66 42 64 Z" fill="#4a3a2a"/>` +
    `<path d="M35 45 Q50 33 65 45 L66 48 L34 48 Z" fill="#2a3340" stroke="${PC.ink}"/><path d="M34 48 L22 51 L35 51 Z" fill="#1a1f26"/>` +
    `<path d="M68 120 L70 99 Q72 88 81 86 L86 78 L89 87 Q96 91 95 100 L93 120 Z" fill="#5c4632" stroke="${PC.ink}"/><circle cx="85" cy="93" r="1.4" fill="${PC.ink}"/><path d="M93 99 L97 101" stroke="${PC.ink}" stroke-width="2"/>`,
  /* Łowca Nagród */ () => P_BODY('#3a2e22') + P_HEAD() + `<path d="M37 47 L63 47 L62 70 Q50 77 38 70 Z" fill="#6b6a66" stroke="${PC.ink}" stroke-width="1.2"/><rect x="41" y="54" width="7" height="3" fill="${PC.ink}"/><rect x="52" y="54" width="7" height="3" fill="${PC.ink}"/><path d="M44 63 L56 63 M44 66 L56 66" stroke="${PC.ink}" stroke-width=".8"/>` +
    `<path d="M22 47 Q50 38 78 47 Q50 44 22 47 Z" fill="#1a1512" stroke="${PC.ink}"/><path d="M37 45 Q39 29 50 29 Q61 29 63 45 Z" fill="${PC.cloth}"/><path d="M76 120 Q84 100 78 92 Q74 88 80 84" stroke="${PC.metal2}" stroke-width="2.5" fill="none"/>`,
  /* Kuszniczka */ () => P_BODY('#3d3a33') + `<path d="M62 70 Q70 86 66 104" stroke="#7a5a3a" stroke-width="4" fill="none"/>` + P_HEAD(58, 13, 16) + `<ellipse cx="45" cy="58" rx="1.8" ry="1.2" fill="${PC.ink}"/><ellipse cx="55" cy="58" rx="1.8" ry="1.2" fill="${PC.ink}"/><path d="M41 54 L48 55 M52 55 L59 54" stroke="${PC.ink}" stroke-width="1.3"/>` +
    `<path d="M35 53 Q33 33 50 31 Q67 33 65 53 L73 57 L64 55 L36 55 Z" fill="${PC.metal}" stroke="${PC.ink}" stroke-width="1.2"/><path d="M8 66 Q30 50 48 30" stroke="#6b4a2a" stroke-width="3.5" fill="none"/><path d="M8 66 L48 30" stroke="${PC.bone}" stroke-width=".8"/>`,
  /* Antykwariuszka */ () => P_BODY('#3a3a2a') + P_HEAD() + P_EYES + `<circle cx="44.5" cy="56" r="4" fill="none" stroke="${PC.gold}" stroke-width="1.3"/><circle cx="55.5" cy="56" r="4" fill="none" stroke="${PC.gold}" stroke-width="1.3"/><path d="M48.5 56 L51.5 56" stroke="${PC.gold}"/>` +
    `<path d="M33 56 Q31 34 50 33 Q69 34 67 56 L70 76 Q62 62 63 50 Q50 42 37 50 Q38 62 30 76 Z" fill="#4a5a3a"/>` +
    `<rect x="76" y="92" width="14" height="18" rx="2" fill="#2b2420" stroke="${PC.gold}" stroke-width="1.2"/><circle cx="83" cy="101" r="5" fill="#f0c060" opacity=".9"/><circle cx="83" cy="101" r="10" fill="#f0c060" opacity=".15"/>`,
  /* Ohyda */ () => `<path d="M32 66 Q26 36 50 32 Q74 36 68 66 L72 80 L62 70 L56 82 L50 70 L44 82 L38 70 L28 80 Z" fill="#241c18"/>` + P_BODY('#3b2f26') + P_HEAD() + `<ellipse cx="44.5" cy="56" rx="1.9" ry="1.3" fill="${PC.ink}"/><circle cx="55.5" cy="56" r="2.3" fill="#d14432"/><circle cx="55.5" cy="56" r="4.5" fill="#d14432" opacity=".2"/>` +
    `<path d="M57 46 L61 66" stroke="#7a1d16" stroke-width="1.2"/><path d="M42 66 L58 66" stroke="${PC.ink}" stroke-width="1.4"/>` +
    [0, 1, 2, 3, 4, 5, 6].map(i => `<ellipse cx="${18 + i * 11}" cy="${96 + i * 3}" rx="5" ry="3" fill="none" stroke="${PC.metal2}" stroke-width="2" transform="rotate(${15 + i * 2} ${18 + i * 11} ${96 + i * 3})"/>`).join(''),
  /* Biczownik */ () => `<path d="M28 120 L31 70 Q29 36 50 26 Q71 36 69 70 L72 120 Z" fill="#5a1410"/>` + P_BODY('#3a0e0b') + `<ellipse cx="44.5" cy="55" rx="2.6" ry="2" fill="${PC.ink}"/><ellipse cx="55.5" cy="55" rx="2.6" ry="2" fill="${PC.ink}"/><circle cx="44.5" cy="55" r=".8" fill="${PC.bone}"/><circle cx="55.5" cy="55" r=".8" fill="${PC.bone}"/>` +
    `<path d="M76 84 L80 116 M80 84 L88 114 M84 84 L94 110" stroke="#7a5a3a" stroke-width="1.6"/><circle cx="80" cy="116" r="1.8" fill="${PC.metal2}"/><circle cx="88" cy="114" r="1.8" fill="${PC.metal2}"/><circle cx="94" cy="110" r="1.8" fill="${PC.metal2}"/><rect x="74" y="78" width="12" height="7" rx="2" fill="#4a3a2a"/>`,
  /* Łamaczka Tarcz */ () => P_BODY('#7a5a3a') + P_HEAD() + `<ellipse cx="44.5" cy="55" rx="2.4" ry="1.4" fill="${PC.ink}"/><ellipse cx="55.5" cy="55" rx="2.4" ry="1.4" fill="${PC.ink}"/>` +
    `<path d="M37 59 Q50 63 63 59 L62 74 Q50 81 38 74 Z" fill="#2e3550"/><path d="M39 64 L61 64 M40 69 L60 69" stroke="#c9a24a" stroke-width=".7" opacity=".7"/><path d="M33 52 Q33 33 50 33 Q67 33 67 52 L64 50 Q50 44 36 50 Z" fill="#b8925a" stroke="${PC.ink}"/>` +
    `<path d="M84 120 L84 26" stroke="#6b4a2a" stroke-width="2.4"/><path d="M84 12 L89 26 L84 30 L79 26 Z" fill="${PC.metal2}" stroke="${PC.ink}"/><path d="M78 40 Q84 46 90 40" stroke="#5a7a4a" stroke-width="1.5" fill="none"/>`
];
/* domyślnie: herbowa tablica z inicjałami klasy (do czasu wgrania prawdziwych portretów) */
const CLASS_ART = {};
function classPortraitSvg(clsIdx, cls) {
  if (CLASS_ART[clsIdx]) return `<img class="${cls || 'portrait'}" src="${CLASS_ART[clsIdx]}" alt="Portret: ${esc(CLS[clsIdx].name)}">`;
  const c = CLS[clsIdx] || { name: '?' }; const ini = c.name.split(' ').map(w => w[0]).join('').slice(0, 2);
  return `<svg class="${cls || 'portrait'}" viewBox="0 0 100 120" preserveAspectRatio="xMidYMid slice" role="img" aria-label="${esc(c.name)} — bez portretu"><rect width="100" height="120" fill="url(#pbg)"/>
    <rect x="7" y="7" width="86" height="106" fill="none" stroke="#5e4b3f" stroke-width="1"/><rect x="10" y="10" width="80" height="100" fill="none" stroke="#8c6f2e" stroke-width=".6" opacity=".7"/>
    <path d="M50 18 L54 24 L50 30 L46 24 Z" fill="#8c6f2e" opacity=".8"/><path d="M50 90 L54 96 L50 102 L46 96 Z" fill="#8c6f2e" opacity=".8"/>
    <text x="50" y="71" text-anchor="middle" font-family="Grenze Gotisch, Georgia, serif" font-weight="700" font-size="40" fill="#e3d6bb">${esc(ini)}</text>
    <rect width="100" height="120" fill="url(#pvig)"/></svg>`;
}
function portraitHtml(h, cls) {
  if (h && h.portrait && /^data:image\//.test(h.portrait)) return `<img class="${cls || 'portrait'}" src="${h.portrait}" alt="Portret: ${esc(heroLabel(h))}">`;
  return classPortraitSvg(h ? h.cls : 0, cls);
}
/* wczytanie własnego portretu: kadr 4:5, zmniejszenie do 200×250, JPEG — żeby karta zostawała lekka */
function loadPortrait(file, done) {
  if (!file || !/^image\//.test(file.type)) return toast('Wybierz plik graficzny (JPG, PNG, WebP).');
  const r = new FileReader();
  r.onload = () => {
    const img = new Image();
    img.onload = () => {
      const W = 200, Hh = 250; const c = document.createElement('canvas'); c.width = W; c.height = Hh; const g = c.getContext('2d');
      const sr = img.width / img.height, tr = W / Hh; let sw, sh, sx, sy;
      if (sr > tr) { sh = img.height; sw = sh * tr; sx = (img.width - sw) / 2; sy = 0; } else { sw = img.width; sh = sw / tr; sx = 0; sy = Math.max(0, (img.height - sh) * 0.25); }
      g.fillStyle = '#0e0c0b'; g.fillRect(0, 0, W, Hh); g.drawImage(img, sx, sy, sw, sh, 0, 0, W, Hh);
      let q = 0.82, url = c.toDataURL('image/jpeg', q);
      while (url.length > 60000 && q > 0.4) { q -= 0.1; url = c.toDataURL('image/jpeg', q); }
      done(url);
    };
    img.onerror = () => toast('Nie udało się odczytać tego obrazu.');
    img.src = r.result;
  };
  r.readAsDataURL(file);
}

/* ======================= postacie na scenie walki (SVG, 100×200, stopy na y=192) ======================= */
const FIG_OUT = '#16120f';
const figShadow = (rx = 26) => `<ellipse cx="50" cy="193" rx="${rx}" ry="5" fill="#000" opacity=".55"/>`;
function figSkeleton(o = {}) {
  const B = '#dad1bf', L = '#5a5246';
  const limb = (d, w) => `<path d="${d}" stroke="${L}" stroke-width="${w + 2}" stroke-linecap="round" fill="none"/><path d="${d}" stroke="${B}" stroke-width="${w}" stroke-linecap="round" fill="none"/>`;
  return `${limb('M44 124L41 156L44 188', 5)}${limb('M56 124L59 156L57 188', 5)}<path d="M38 188h10M52 188h10" stroke="${B}" stroke-width="4" stroke-linecap="round"/>
    <path d="M40 117Q50 128 60 117L58 127Q50 133 42 127Z" fill="${B}" stroke="${L}" stroke-width="1.5"/>${limb('M50 52V118', 4)}
    <g fill="none" stroke="${B}" stroke-width="3">${[62, 71, 80, 89].map((y, i) => `<path d="M${38 + i} ${y}Q50 ${y - 7} ${62 - i} ${y}"/>`).join('')}</g>
    ${o.cloth || ''}${limb(o.armBack || 'M39 62L33 90L35 114', 4)}${o.headBack || ''}
    <circle cx="50" cy="38" r="11.5" fill="${B}" stroke="${L}" stroke-width="1.5"/><rect x="44" y="46" width="12" height="7" rx="2" fill="${B}" stroke="${L}" stroke-width="1.2"/>
    <circle cx="46" cy="36" r="3.2" fill="#140f0c"/><circle cx="55" cy="36" r="3.2" fill="#140f0c"/><circle cx="46" cy="36" r="1.1" fill="${o.eye || '#ff5a3a'}"/><circle cx="55" cy="36" r="1.1" fill="${o.eye || '#ff5a3a'}"/><path d="M50 40l-2 4h4z" fill="#140f0c"/>
    ${o.head || ''}${o.gear || ''}${limb(o.armFront || 'M61 62L68 88L74 104', 4)}${o.hand || ''}`;
}
const FIG_ENEMY = {
  'Kościany żołdak': () => figShadow() + figSkeleton({ head: '<path d="M38 34Q38 20 50 20Q62 20 62 34Z" fill="#6b5a44" stroke="#2a2016" stroke-width="2"/><path d="M38 33h24" stroke="#2a2016" stroke-width="2"/>',
    gear: '<path d="M72 106L94 52 98 55 77 108Z" fill="#9a8a72" stroke="#3a2e22" stroke-width="1.5"/><path d="M68 102l14 8" stroke="#5a4a36" stroke-width="4"/>', cloth: '<path d="M42 112h16l3 14H39z" fill="#4a3a2a" opacity=".85"/>' }),
  'Kościany obrońca': () => figShadow(30) + figSkeleton({ head: '<path d="M37 36Q37 18 50 18Q63 18 63 36V42H37Z" fill="#5a5048" stroke="#2a2420" stroke-width="2"/><rect x="40" y="31" width="20" height="3" fill="#140f0c"/>',
    gear: '<path d="M28 40V150" stroke="#5a4a36" stroke-width="4"/><path d="M24 40l4-12 4 12z" fill="#8a8a86"/>', armFront: 'M61 62L70 84L72 100',
    hand: '<rect x="60" y="70" width="32" height="94" rx="5" fill="#4e3f2e" stroke="#22190f" stroke-width="2.5"/><rect x="60" y="70" width="32" height="94" rx="5" fill="none" stroke="#7a7066" stroke-width="2" stroke-dasharray="0" transform="scale(1)"/><circle cx="76" cy="116" r="7" fill="#7a7066" stroke="#2a2420" stroke-width="2"/><path d="M60 92h32M60 140h32" stroke="#2a2016" stroke-width="2"/>' }),
  'Kościany kusznik': () => figShadow() + figSkeleton({ headBack: '<path d="M34 50Q32 16 50 14Q68 16 66 50L70 66Q50 60 30 66Z" fill="#2e2a26" stroke="#141210" stroke-width="2"/>', head: '<path d="M37 34Q40 22 50 22Q60 22 63 34Q56 26 50 26Q44 26 37 34Z" fill="#2e2a26"/>', armBack: 'M39 62L42 80L54 88', armFront: 'M61 62L64 80L72 86',
    hand: '<path d="M30 88h56" stroke="#5a4028" stroke-width="5" stroke-linecap="round"/><path d="M84 72Q92 88 84 104" stroke="#4a3624" stroke-width="4" fill="none"/><path d="M84 72L74 88 84 104" stroke="#cfc4ad" stroke-width="1"/><path d="M76 86h18" stroke="#9a9a96" stroke-width="2"/>' }),
  'Kościany dworzanin': () => figShadow() + figSkeleton({ eye: '#c08aff', cloth: '<path d="M34 60Q50 52 66 60L70 128L58 134 50 120 42 134 30 128Z" fill="#46284a" stroke="#1e1020" stroke-width="2"/><path d="M50 60V120" stroke="#c9a24e" stroke-width="1.5" stroke-dasharray="3 3"/>',
    head: '<path d="M36 52Q50 60 64 52L62 58Q50 64 38 58Z" fill="#e8e0d0" stroke="#6b6558" stroke-width="1"/>', armFront: 'M61 62L72 76L80 70',
    hand: '<path d="M78 58h10l-2 10h-6z" fill="#c9a24e" stroke="#6b5420" stroke-width="1.5"/><path d="M83 68v8M79 76h8" stroke="#c9a24e" stroke-width="2"/><path d="M34 112L24 176" stroke="#b8bcc0" stroke-width="2"/>' }),
  'Kultysta akolita': () => figShadow() + `<path d="M32 64Q50 54 68 64L74 188H26Z" fill="#4e1414" stroke="${FIG_OUT}" stroke-width="2"/><path d="M50 64V188" stroke="#2a0a0a" stroke-width="2"/><path d="M40 118h20" stroke="#c9a24e" stroke-width="2"/>
    <path d="M34 50Q32 18 50 16Q68 18 66 50L68 68Q50 76 32 68Z" fill="#3a0e0e" stroke="${FIG_OUT}" stroke-width="2"/><ellipse cx="50" cy="44" rx="10" ry="12" fill="#0d0606"/><circle cx="46" cy="42" r="1.8" fill="#ffb85a"/><circle cx="55" cy="42" r="1.8" fill="#ffb85a"/>
    <path d="M64 72L76 96" stroke="#4e1414" stroke-width="9" stroke-linecap="round"/><g filter="url(#fg-glow)"><circle cx="80" cy="98" r="7" fill="none" stroke="#c070ff" stroke-width="2"/><path d="M80 91v14M73 98h14" stroke="#c070ff" stroke-width="1.5"/></g>
    <path d="M36 72L28 110" stroke="#4e1414" stroke-width="8" stroke-linecap="round"/><path d="M27 110l-6 18" stroke="#b8bcc0" stroke-width="3"/>`,
  'Uczeń Nekromanty': () => figShadow(18) + `<g transform="translate(0 -10)"><g filter="url(#fg-glow)" opacity=".7"><path d="M30 190Q40 170 36 150M64 192Q58 172 66 152" stroke="#7fe0a0" stroke-width="2" fill="none"/></g>
    <path d="M28 64Q50 52 72 64L80 180Q50 196 20 180Z" fill="#1f2a22" stroke="${FIG_OUT}" stroke-width="2"/><path d="M50 64V184" stroke="#121a14" stroke-width="2"/><path d="M34 100h32" stroke="#6b8a5a" stroke-width="2" stroke-dasharray="4 3"/>
    <path d="M32 50Q30 14 50 12Q70 14 68 50L72 70Q50 80 28 70Z" fill="#16201a" stroke="${FIG_OUT}" stroke-width="2"/><ellipse cx="50" cy="42" rx="10" ry="12" fill="#dad1bf"/><circle cx="46" cy="40" r="3" fill="#0d1a10"/><circle cx="55" cy="40" r="3" fill="#0d1a10"/><circle cx="46" cy="40" r="1.2" fill="#7fe0a0"/><circle cx="55" cy="40" r="1.2" fill="#7fe0a0"/><path d="M45 50h10" stroke="#5a5246" stroke-width="2"/>
    <path d="M30 74L22 106" stroke="#1f2a22" stroke-width="9" stroke-linecap="round"/><path d="M86 26V190" stroke="#4a3624" stroke-width="4"/><path d="M68 74L84 96" stroke="#1f2a22" stroke-width="9" stroke-linecap="round"/>
    <g filter="url(#fg-glow)"><circle cx="86" cy="22" r="8" fill="#7fe0a0" opacity=".85"/><circle cx="86" cy="22" r="4" fill="#e6ffe9"/></g><path d="M80 30q6 4 12 0" stroke="#dad1bf" stroke-width="2" fill="none"/></g>`
};
const FIG_ELITE = {
  'Kościany rycerz': () => `<ellipse cx="100" cy="213" rx="58" ry="7" fill="#000" opacity=".55"/><g transform="translate(18 -8) scale(1.3)">${figSkeleton({ eye: '#ff8a3a',
    cloth: '<path d="M34 58Q50 50 66 58L64 112H36Z" fill="#5a4636" stroke="#22190f" stroke-width="2"/><path d="M36 74h28M36 90h28" stroke="#3a2e22" stroke-width="2"/><ellipse cx="34" cy="60" rx="9" ry="7" fill="#6a5442" stroke="#22190f" stroke-width="1.5"/><ellipse cx="66" cy="60" rx="9" ry="7" fill="#6a5442" stroke="#22190f" stroke-width="1.5"/>',
    head: '<path d="M37 40Q37 20 50 20Q63 20 63 40V50H37Z" fill="#5e4c3c" stroke="#22190f" stroke-width="2"/><rect x="40" y="33" width="20" height="3.5" fill="#140f0c"/><path d="M38 24l-8-10M62 24l8-10" stroke="#cfc4ad" stroke-width="3" stroke-linecap="round"/>',
    armFront: 'M61 62L70 84L76 96', hand: '<path d="M74 100L104 8 109 10 80 102Z" fill="#a69a86" stroke="#3a2e22" stroke-width="1.5"/><path d="M66 96l22 10" stroke="#6a5442" stroke-width="5" stroke-linecap="round"/>' })}</g>`
};
const FIG_HERO = {
  0: () => figShadow() + `<path d="M36 62Q26 122 30 186H58Q52 122 56 62Z" fill="#6e1a16" stroke="${FIG_OUT}" stroke-width="1.5"/>
    <rect x="38" y="128" width="10" height="58" fill="#7b8088" stroke="${FIG_OUT}" stroke-width="1.5"/><rect x="52" y="128" width="10" height="58" fill="#868b93" stroke="${FIG_OUT}" stroke-width="1.5"/><rect x="36" y="178" width="13" height="10" rx="2" fill="#3a3d42"/><rect x="51" y="178" width="14" height="10" rx="2" fill="#3a3d42"/>
    <path d="M34 62Q50 54 66 62L64 132H36Z" fill="#8a8f96" stroke="${FIG_OUT}" stroke-width="2"/><path d="M40 70H60L62 142 50 148 38 142Z" fill="#dcd4c3" stroke="#6b6558" stroke-width="1.5"/><rect x="47" y="78" width="6" height="44" fill="#9a2218"/><rect x="41" y="90" width="18" height="6" fill="#9a2218"/><rect x="36" y="112" width="28" height="5" fill="#4a3524"/>
    <path d="M34 66L30 112" stroke="#7b8088" stroke-width="9" stroke-linecap="round"/><ellipse cx="36" cy="64" rx="9" ry="7" fill="#9aa0a8" stroke="${FIG_OUT}" stroke-width="1.5"/>
    <path d="M40 30Q50 16 60 30L61 54Q50 61 39 54Z" fill="#9aa0a8" stroke="${FIG_OUT}" stroke-width="2"/><rect x="43" y="37" width="18" height="3" fill="#111"/><path d="M52 44v8M56 44v8" stroke="#555" stroke-width="1.2"/><path d="M50 20q-2-10 10-12" stroke="#9a2218" stroke-width="4" fill="none" stroke-linecap="round"/>
    <path d="M73 98L77 20 82 98Z" fill="#cfd4da" stroke="#5a5f66" stroke-width="1.5"/><path d="M65 100l20-2" stroke="#c9a24e" stroke-width="4" stroke-linecap="round"/><path d="M75 100v16" stroke="#4a3524" stroke-width="4"/>
    <path d="M64 66L74 104" stroke="#868b93" stroke-width="9" stroke-linecap="round"/><ellipse cx="64" cy="64" rx="9" ry="7" fill="#a3a9b1" stroke="${FIG_OUT}" stroke-width="1.5"/>`,
  1: () => figShadow() + `<rect x="40" y="166" width="8" height="22" fill="#2e2a26"/><rect x="53" y="166" width="8" height="22" fill="#2e2a26"/><path d="M38 182h11v7H36zM52 182h11v7H51z" fill="#1e1a16"/>
    <path d="M34 64Q50 56 66 64L72 176H28Z" fill="#5a3b25" stroke="${FIG_OUT}" stroke-width="2"/><path d="M44 66H56L54 112H46Z" fill="#b8a88a"/><path d="M50 112V176" stroke="#3a2416" stroke-width="2"/><rect x="34" y="110" width="32" height="5" fill="#2a1d14"/><rect x="47" y="109" width="6" height="7" fill="#c9a24e"/>
    <path d="M35 70L30 112" stroke="#5a3b25" stroke-width="9" stroke-linecap="round"/><path d="M29 112l-3 14" stroke="#b8bcc0" stroke-width="3"/>
    <circle cx="50" cy="44" r="11" fill="#c9a587" stroke="${FIG_OUT}" stroke-width="1.5"/><path d="M39 46H61L60 56Q50 61 40 56Z" fill="#7a2a22"/><circle cx="46" cy="42" r="1.4" fill="#111"/><circle cx="55" cy="42" r="1.4" fill="#111"/>
    <ellipse cx="50" cy="34" rx="22" ry="5" fill="#2a1d14" stroke="${FIG_OUT}" stroke-width="1.5"/><path d="M40 34Q42 18 50 18Q58 18 60 34Z" fill="#33241a" stroke="${FIG_OUT}" stroke-width="1.5"/>
    <path d="M64 70L80 90" stroke="#5a3b25" stroke-width="9" stroke-linecap="round"/><circle cx="82" cy="92" r="4" fill="#c9a587"/><path d="M80 87h18v5H80z" fill="#555"/><path d="M78 90l7 0-2 11-5 0z" fill="#3a2a1e"/>`,
  2: () => figShadow() + `<rect x="40" y="172" width="8" height="16" fill="#1a1718"/><rect x="53" y="172" width="8" height="16" fill="#1a1718"/>
    <path d="M32 66Q50 58 68 66L72 182H28Z" fill="#1f1c1e" stroke="${FIG_OUT}" stroke-width="2"/><path d="M50 70V182" stroke="#121012" stroke-width="2"/><rect x="34" y="118" width="32" height="5" fill="#4a3524"/><rect x="38" y="112" width="5" height="9" rx="1" fill="#6fcf7a"/><rect x="45" y="112" width="5" height="9" rx="1" fill="#c94a3a"/>
    <path d="M30 64Q50 52 70 64L68 88Q50 81 32 88Z" fill="#2a2628" stroke="${FIG_OUT}" stroke-width="1.5"/><path d="M34 72L28 112" stroke="#1f1c1e" stroke-width="9" stroke-linecap="round"/>
    <circle cx="48" cy="42" r="10" fill="#3a302a" stroke="${FIG_OUT}" stroke-width="1.5"/><path d="M55 38L85 52 55 50Z" fill="#d8ccb0" stroke="#6b5d48" stroke-width="1.5"/><circle cx="52" cy="39" r="4" fill="#9ad0d8" stroke="#2a2a2a" stroke-width="1.5"/><circle cx="53.5" cy="37.5" r="1.2" fill="#fff"/>
    <ellipse cx="48" cy="31" rx="24" ry="5" fill="#151314" stroke="${FIG_OUT}" stroke-width="1.5"/><path d="M38 31L40 14H58L60 31Z" fill="#1c1a1b" stroke="${FIG_OUT}" stroke-width="1.5"/>
    <path d="M64 72L78 88" stroke="#1f1c1e" stroke-width="9" stroke-linecap="round"/><g filter="url(#fg-glow)"><circle cx="82" cy="86" r="6" fill="#6fcf7a"/></g><rect x="80" y="76" width="4" height="5" fill="#8a6440"/>`,
  3: () => figShadow() + `<path d="M34 40Q34 16 50 16Q66 16 66 40L72 70H28Z" fill="#2a2a36" stroke="${FIG_OUT}" stroke-width="1.5"/><circle cx="50" cy="40" r="22" fill="none" stroke="#e8c76a" stroke-width="1.5" opacity=".45"/>
    <path d="M34 62Q50 54 66 62L72 188H28Z" fill="#2a2a36" stroke="${FIG_OUT}" stroke-width="2"/><path d="M44 66H56L58 186H42Z" fill="#cfc6b4" stroke="#6b6558" stroke-width="1"/><path d="M47 80h6M50 76v10" stroke="#9a2218" stroke-width="2"/><path d="M36 116h28" stroke="#c9a24e" stroke-width="2"/>
    <path d="M38 44Q38 24 50 24Q62 24 62 44L62 60Q50 68 38 60Z" fill="#e8e0d0" stroke="#6b6558" stroke-width="1.2"/><ellipse cx="50" cy="44" rx="7.5" ry="9.5" fill="#d8b89a"/><circle cx="47" cy="43" r="1.2" fill="#111"/><circle cx="54" cy="43" r="1.2" fill="#111"/>
    <path d="M35 70L32 100" stroke="#2a2a36" stroke-width="9" stroke-linecap="round"/><rect x="22" y="96" width="18" height="22" rx="2" fill="#5a2a1a" stroke="#2a140c" stroke-width="1.5"/><path d="M31 100v14M26 105h10" stroke="#c9a24e" stroke-width="1.5"/>
    <path d="M64 70L74 92" stroke="#2a2a36" stroke-width="9" stroke-linecap="round"/><path d="M74 94L86 66" stroke="#5a4028" stroke-width="4"/><circle cx="88" cy="62" r="7" fill="#a89a7a" stroke="#4a4030" stroke-width="2"/><path d="M88 52v20M78 62h20" stroke="#4a4030" stroke-width="2"/>`
};
function figGenericHero(h) {
  const c = CLS[h.cls] || {}; const ini = (c.name || '?').split(' ').map(x => x[0]).join('').slice(0, 2);
  const hue = (h.cls * 47) % 360;
  return figShadow() + `<path d="M32 64Q50 54 68 64L74 188H26Z" fill="hsl(${hue} 25% 24%)" stroke="${FIG_OUT}" stroke-width="2"/><path d="M34 48Q32 16 50 14Q68 16 66 48L70 70Q50 78 30 70Z" fill="hsl(${hue} 22% 18%)" stroke="${FIG_OUT}" stroke-width="2"/>
    <ellipse cx="50" cy="44" rx="9" ry="11" fill="#c9a587"/><circle cx="46" cy="43" r="1.3" fill="#111"/><circle cx="54" cy="43" r="1.3" fill="#111"/><circle cx="50" cy="106" r="13" fill="rgba(0,0,0,.35)" stroke="#c9a24e" stroke-width="1.5"/><text x="50" y="111" text-anchor="middle" font-size="13" fill="#e8dcc0" font-family="Georgia,serif">${esc(ini)}</text>
    <path d="M34 72L28 112M66 72L74 108" stroke="hsl(${hue} 25% 24%)" stroke-width="9" stroke-linecap="round"/>`;
}
function figGenericEnemy(e) {
  const t = e.type || ''; const col = /Nieumar/.test(t) ? '#bdb4a2' : /Plugaw/.test(t) ? '#3f5a3a' : /Bestia/.test(t) ? '#5a3a2a' : '#4e1a1a';
  return figShadow() + `<path d="M24 188Q22 120 40 90Q50 70 64 78Q82 92 78 188Z" fill="${col}" stroke="${FIG_OUT}" stroke-width="2"/><path d="M34 96Q38 56 56 54Q72 58 70 88Q56 100 34 96Z" fill="${col}" stroke="${FIG_OUT}" stroke-width="2" filter="brightness(.85)"/>
    <circle cx="46" cy="76" r="2.6" fill="#ff4a2a"/><circle cx="58" cy="76" r="2.6" fill="#ff4a2a"/><path d="M30 120l-12 30M74 120l12 26" stroke="${col}" stroke-width="8" stroke-linecap="round"/>`;
}
function figCorpse(wide) {
  const B = '#cfc6b2';
  return `<g transform="translate(${wide ? 50 : 0} 0)"><ellipse cx="50" cy="190" rx="30" ry="6" fill="#000" opacity=".5"/><path d="M26 188l40-10M34 178l36 12" stroke="${B}" stroke-width="5" stroke-linecap="round"/><path d="M30 186q10-14 24-6" stroke="#4a3a2a" stroke-width="6" fill="none"/><circle cx="66" cy="180" r="8" fill="${B}" stroke="#5a5246" stroke-width="1.5"/><circle cx="63" cy="179" r="1.8" fill="#140f0c"/><circle cx="69" cy="179" r="1.8" fill="#140f0c"/></g>`;
}
/* tło sceny: krypta Ruin; pozostałe regiony na razie jako wariant kolorystyczny */
function battleBg(region, torch) {
  const t = Math.max(0, Math.min(10, torch == null ? 7 : +torch));
  const P = { Ruiny: ['#1a1612', '#2b231c', '#0d0b09', '#2e2620'], Nory: ['#1c120d', '#2e1d14', '#0e0806', '#33221a'], Knieja: ['#0f1610', '#1a261b', '#070b07', '#1e2a1e'], Zatoka: ['#0d1418', '#16232a', '#060a0c', '#1a2a30'], DD: ['#140e14', '#241626', '#0a060a', '#2a1a2a'] }[region] || ['#1a1612', '#2b231c', '#0d0b09', '#2e2620'];
  const glowA = (0.18 + t * 0.045).toFixed(2); const dark = ((10 - t) * 0.05).toFixed(2);
  const arch = x => `<path d="M${x - 62} 250V120Q${x - 62} 52 ${x} 52Q${x + 62} 52 ${x + 62} 120V250Z" fill="${P[2]}"/><path d="M${x - 62} 120Q${x - 62} 52 ${x} 52Q${x + 62} 52 ${x + 62} 120" fill="none" stroke="#3a3028" stroke-width="5"/>`;
  const pillar = x => `<rect x="${x - 22}" y="30" width="44" height="225" fill="${P[3]}" stroke="#120e0b" stroke-width="2"/><rect x="${x - 28}" y="24" width="56" height="14" fill="#352c24"/><rect x="${x - 28}" y="240" width="56" height="14" fill="#352c24"/><path d="M${x - 10} 60v170" stroke="#3e342b" stroke-width="3"/>`;
  const torchAt = x => `<path d="M${x} 150v-24" stroke="#4a3220" stroke-width="5"/><path d="M${x - 8} 128h16" stroke="#3a2a1e" stroke-width="4"/><circle cx="${x}" cy="118" r="${70 + t * 9}" fill="url(#bg-glow)"/><g class="flick"><path d="M${x} 126c-7-8-5-17 1-25 1 8 8 10 5 21-1 3-3 4-6 4z" fill="#f08a2c"/><path d="M${x + 1} 124c-2-4-1-8 2-12 1 4 3 6 1 11z" fill="#ffd27a"/></g>`;
  const forest = region === 'Knieja' ? Array.from({ length: 9 }, (_, i) => `<path d="M${i * 120 - 20} 250L${i * 120 + 40} ${70 + (i % 3) * 20}L${i * 120 + 100} 250Z" fill="#0b120c" opacity=".9"/>`).join('') : '';
  const water = region === 'Zatoka' ? '<path d="M0 262Q120 254 250 262T500 262T750 262T1000 262V300H0Z" fill="#12303a" opacity=".55"/>' : '';
  return `<svg viewBox="0 0 1000 360" preserveAspectRatio="xMidYMax slice" class="stage-bg" aria-hidden="true"><defs>
    <linearGradient id="bg-wall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${P[0]}"/><stop offset="1" stop-color="${P[1]}"/></linearGradient>
    <linearGradient id="bg-floor" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2a221b"/><stop offset="1" stop-color="#0f0c0a"/></linearGradient>
    <radialGradient id="bg-glow" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#ffb862" stop-opacity="${glowA}"/><stop offset="1" stop-color="#ffb862" stop-opacity="0"/></radialGradient>
    <radialGradient id="bg-vig" cx=".5" cy=".6" r=".75"><stop offset=".55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".85"/></radialGradient></defs>
    <rect width="1000" height="360" fill="url(#bg-wall)"/>${region === 'Knieja' ? forest : [140, 380, 620, 860].map(arch).join('') + [20, 260, 500, 740, 980].map(pillar).join('')}${region === 'Knieja' ? '' : [260, 740].map(torchAt).join('')}
    <path d="M0 252H1000V360H0Z" fill="url(#bg-floor)"/>${water}<g stroke="#1a1410" stroke-width="2" opacity=".8"><path d="M0 280H1000M0 312H1000"/>${[-300, -100, 100, 300, 500, 700, 900, 1100, 1300].map(x => `<path d="M500 252L${x} 360"/>`).join('')}</g>
    ${region === 'Ruiny' ? '<g fill="#bfb6a3" opacity=".55"><circle cx="70" cy="300" r="6"/><path d="M80 304l26-6" stroke="#bfb6a3" stroke-width="4"/><circle cx="930" cy="296" r="5"/><path d="M900 300l20 4" stroke="#bfb6a3" stroke-width="4"/></g><g stroke="#8a8278" stroke-width="1" opacity=".35" fill="none"><path d="M0 0l70 60M0 30l60 30M30 0l40 60M0 0q40 20 70 60"/><path d="M1000 0l-70 60M1000 30l-60 30M970 0l-40 60"/></g>' : ''}
    <rect width="1000" height="360" fill="#000" opacity="${dark}"/><rect width="1000" height="360" fill="url(#bg-vig)"/></svg>`;
}
function heroFigure(h) { const f = FIG_HERO[h.cls]; return f ? f() : figGenericHero(h); }
function enemyFigure(e) {
  if (e.corpse) return figCorpse((e.size || 1) === 2);
  if (FIG_ELITE[e.name]) return FIG_ELITE[e.name]();
  const f = FIG_ENEMY[e.name]; return f ? f() : figGenericEnemy(e);
}
