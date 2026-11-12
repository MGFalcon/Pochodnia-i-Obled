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
