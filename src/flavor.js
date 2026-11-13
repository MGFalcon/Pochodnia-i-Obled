/* Treści klimatyczne: opisy komnat, zapowiedzi bossów, kwestie bohaterów, imiona i historie, wybory w komnatach, rozmowy, decyzje Osady. */

/* ---------- opisy komnat ---------- */
const ROOM_DESC = {
  Ruiny: {
    'wejście': ['Schody kończą się pod sklepieniem, z którego zwisają korzenie. Za plecami jeszcze widać dzień.', 'Brama krużganków stoi otworem. Ktoś wyrwał z niej zawiasy — od środka.'],
    walka: ['Kości na posadzce leżą w zbyt równym rzędzie. Jedna czaszka powoli obraca się w waszą stronę.', 'Z nisz w ścianach dobiega chrobot, jakby coś ostrzyło klingę o kamień.', 'W kręgu wypalonych świec klęczą zakapturzone postacie. Śpiew urywa się w pół słowa.'],
    pusta: ['Komnata pełna połamanych ławek. Na ołtarzu ktoś zostawił zgaszoną świecę i odcisk dłoni w wosku.', 'Pusta krypta. Wieka sarkofagów leżą na podłodze, a w środku nie ma nic — nawet kurzu.', 'Kurz, pajęczyny i cisza tak gęsta, że słychać własne serce.'],
    'osobliwość': ['Pod ścianą stoi coś, co nie pasuje do tego miejsca — i doskonale o tym wie.', 'Na środku sali coś czeka w kręgu świeżo wydrapanych znaków.', 'W bocznej kaplicy coś odbija światło pochodni, choć nie powinno.'],
    skrzynia: ['Skrzynia okuta żelazem, z herbem rodu. Zamek wygląda na nietknięty od stu lat.', 'Pod zwalonym posągiem widać róg kufra.'],
    boss: ['Sala pełna ksiąg i słoików. Ktoś przy stole podnosi głowę znad otwartego trupa — i uśmiecha się.', 'Pentagram na podłodze jeszcze dymi. Uczeń zmarłego mistrza czekał na was.']
  },
  Nory: {
    'wejście': ['Kanał zaczyna się kratą wyrwaną ze ściany. Smród wbija się w gardło jak hak.', 'Zejście pod rzeźnię. Woda po kostki, ciepła — za ciepła.'],
    walka: ['W ciemności coś chrumka i mlaszcze. Potem cichnie, bo was zwęszyło.', 'Na hakach wiszą połcie mięsa. Niektóre nie są wieprzowe. Spod nich wychodzą rzeźnicy.', 'Zalana komora, a w wodzie coś pływa — na plecach, z otwartymi oczami. Wstaje.'],
    pusta: ['Opuszczone legowisko z kości i szmat. Ktoś tu spał niedawno.', 'Pusta komora, tylko echo kapiącej wody i szczury, które się was nie boją.', 'Ściany pokrywa gruby nalot, który lekko pulsuje, gdy się na niego patrzy.'],
    'osobliwość': ['Na środku stoi coś, wokół czego krążą muchy, ale żadna nie siada.', 'W niszy coś leży — szczury omijają to szerokim łukiem.', 'Woda wokół tego jest dziwnie czysta.'],
    skrzynia: ['Pod stertą odpadków stoi beczka z pieczęcią rzeźni.', 'Zardzewiała skrzynia przykuta łańcuchem do rury.'],
    boss: ['Ogromna komora pełna ryków. Na tronie z beczek siedzi coś, co kiedyś było człowiekiem — teraz jest głównie apetytem.', 'Dwór Świńskiego Księcia: dywan z flaków, a giermek trzyma proporzec z wołowej skóry.']
  },
  Knieja: {
    'wejście': ['Trakt urywa się przy szubienicy. Sznury kołyszą się, choć nie ma wiatru.', 'Wchodzicie między drzewa. Ptaki milkną jeden po drugim.'],
    walka: ['Ognisko jeszcze się tli. Wokół niego ktoś szybko chowa noże za plecy.', 'Z grzybni pod korzeniami wynurza się coś na czworakach, porośnięte kapeluszami.', 'Strzała wbija się w pień tuż obok was. Z krzaków słychać śmiech.'],
    pusta: ['Polana pełna mgły. Na pniu ktoś wyrył datę — jutrzejszą.', 'Opuszczony obóz bandytów: porwany namiot, pusta butelka, jeden but.', 'Krąg kamieni. W środku trawa nie rośnie od lat.'],
    'osobliwość': ['Między drzewami coś stoi, jakby czekało właśnie na was.', 'W wykrocie coś połyskuje wilgocią.', 'Na rozstaju dróg coś leży, zostawione dla podróżnych.'],
    skrzynia: ['Zakopany kuferek, ledwo przykryty liśćmi. Ktoś bardzo się spieszył.', 'Wóz bez koni, a na nim skrzynia z łupem bandytów.'],
    boss: ['Chata na kurzej nóżce, a przed nią kocioł, w którym coś bulgocze i woła po imieniu.', 'Wiedźma miesza w kotle i nie podnosi wzroku. „Akurat na kolację” — mówi.']
  },
  Zatoka: {
    'wejście': ['Grota otwiera się na morze. Fale bez przerwy szepczą coś niezrozumiałego.', 'Ścieżka między skałami, śliska od wodorostów. Sól szczypie w oczy.'],
    walka: ['Z wody wychodzą postacie z łuską zamiast skóry, z harpunami w błoniastych dłoniach.', 'Topielcy siedzą przy ścianie, jakby czekali na odpływ. Na wasz widok wstają.', 'W kałużach coś śpiewa. Pieśń urywa się, gdy wchodzicie.'],
    pusta: ['Wrak łodzi wbity w skałę. W środku tylko muszle i czyjś pamiętnik, rozmyty od wody.', 'Pusta grota. Na ścianach odciski dłoni — zbyt długich palców.', 'Woda sięga kolan i jest lodowata. Nic się nie rusza. Na razie.'],
    'osobliwość': ['Na skale coś lśni perłowo i cicho szumi jak morze w muszli.', 'Fale wyrzuciły coś na brzeg i cofnęły się, jakby się bały.', 'Pośrodku groty coś pulsuje w rytm przypływu.'],
    skrzynia: ['Kufer z wraku, oblepiony skorupiakami.', 'Skrzynia przemytników wciśnięta w szczelinę skalną.'],
    boss: ['Na skale siedzi kobieta o włosach z wodorostów. Gdy otwiera usta, morze milknie.', 'Skała Syreny. Wokół niej pływają ciała tych, którzy wysłuchali pieśni do końca.']
  },
  DD: {
    'wejście': ['Schody pod posiadłością. Każdy stopień jest cieplejszy od poprzedniego.', 'Drzwi do lochu stoją otworem. Z dołu dochodzi coś na kształt bicia serca.'],
    walka: ['Kultyści w czerwonych szatach kłaniają się wam, jakby was oczekiwali.', 'Ściany są tu z mięsa. Coś w nich przesuwa się pod skórą — i wychodzi.', 'Templariusz w zbroi zrośniętej z ciałem zagradza przejście.'],
    pusta: ['Komnata bez kątów — ściany przechodzą łukiem w sufit jak wnętrze żołądka.', 'Pusta kaplica. Na ołtarzu leży list w waszym charakterze pisma.', 'Cisza. Tylko daleko, daleko w dole coś bije: raz, dwa, raz, dwa.'],
    'osobliwość': ['Coś tu leży — i pamięta was z innego życia.', 'Na środku stoi rzecz, której kształt zmienia się, gdy odwracacie wzrok.', 'Coś szepcze imię waszego przodka.'],
    skrzynia: ['Relikwiarz rodu, uchylony, jakby ktoś właśnie z niego coś wyjął.', 'Szkatuła oblepiona woskiem z kultowych świec.'],
    boss: ['Koniec drogi. To, co tu czeka, było tu przed rodem i będzie po nim.', 'Sala bije jak serce. Każdy oddech przybliża was do odpowiedzi.']
  }
};
ROOM_DESC.Shambler = ROOM_DESC.Ruiny;
function roomDesc(region, type) {
  const R = ROOM_DESC[region] || ROOM_DESC.Ruiny;
  const key = type === 'walka i osobliwość' ? 'walka' : type;
  const list = R[key] || R.pusta; let t = pick(list);
  if (type === 'walka i osobliwość') t += ' W kącie stoi coś, czego lepiej nie dotykać przed walką.';
  return t;
}

/* ---------- elementy w pustych komnatach (decyzje) ---------- */
const ROOM_FEATURES = [
  { key: 'gruz', name: 'Sterta gruzu', text: 'Pod ścianą leży gruz, a spod niego wystaje coś metalowego.', opts: [{ id: 'szukaj', label: 'Przeszukajcie gruz', note: 'k10: 1–4 rzut na łup, 5–8 nic, 9–10 hałas budzi wrogów' }, { id: 'zostaw', label: 'Zostawcie' }] },
  { key: 'drzwi', name: 'Drzwi bez klamki', text: 'Ciężkie drzwi, zza których dobiegają odgłosy z dalszych korytarzy.', opts: [{ id: 'sluchaj', label: 'Podsłuchajcie', note: 'Pochodnia −1, za to poznacie wszystkie komnaty sąsiednie' }, { id: 'idz', label: 'Idźcie dalej' }] },
  { key: 'oltarzyk', name: 'Ołtarzyk przodków', text: 'Mały ołtarzyk z kośćmi i monetami. Ktoś wciąż tu przychodzi.', opts: [{ id: 'ofiara', label: 'Zostawcie ofiarę', note: '5 Złota z łupów albo 1 prowiant: drużyna −2 Stres' }, { id: 'zabierz', label: 'Zabierzcie monety', note: 'k6 Złota, ale każdy +1 Stres' }, { id: 'nic', label: 'Nie ruszajcie' }] },
  { key: 'studnia', name: 'Stara studnia', text: 'Studnia z czarną wodą. Z dołu ciągnie chłodem.', opts: [{ id: 'pij', label: 'Zaczerpnijcie wody', note: 'k10: 1–5 każdy +2 Zdrowia, 6–8 nic, 9–10 zaraza 1 dla losowej osoby' }, { id: 'nie', label: 'Lepiej nie' }] },
  { key: 'zapiski', name: 'Zapiski poprzednika', text: 'Notatnik kogoś, kto szedł tędy przed wami. Ostatnie strony są zalane krwią.', opts: [{ id: 'czytaj', label: 'Przeczytajcie', note: 'czytający k10: 1–5 następny zwiad +2, 6–10 +2 Stresu' }, { id: 'spal', label: 'Spalcie dla światła', note: 'Pochodnia +1' }] },
  { key: 'lustro', name: 'Pęknięte lustro', text: 'W ramie wisi pęknięte lustro. Odbicie porusza się z lekkim opóźnieniem.', opts: [{ id: 'patrz', label: 'Niech ktoś spojrzy', note: 'k10: 1–3 −3 Stresu, 4–7 nic, 8–10 +3 Stresu' }, { id: 'zaslon', label: 'Zasłońcie je' }] }
];

/* ---------- zapowiedzi ruchów bossów ---------- */
const BOSS_TELL = {
  'Pocisk duszy': 'Uczeń wyciąga dłoń — między palcami zbiera się blade światło.',
  'Wezwanie kości': 'Uczeń szepcze do posadzki. Kości pod waszymi stopami drżą.',
  'Klątwa grobu': 'Uczeń unosi księgę nad głowę. Świece gasną jedna po drugiej.',
  'Zgniecenie': 'Książę unosi pięści nad głowę i wbija wzrok w pierwszy szereg.',
  'Zamach cielskiem': 'Książę pochyla się i zapiera racicami — szykuje się do szarży.',
  'Rzut ochłapem': 'Książę sięga do koryta po coś gnijącego i celuje w tył szyku.',
  'Ryk świni': 'Książę nabiera powietrza w ogromne płuca.',
  'Do kotła!': 'Wiedźma zerka na kocioł i oblizuje wargi, wybierając składnik.',
  'Chochla': 'Wiedźma unosi chochlę jak maczugę.',
  'Złe oko': 'Wiedźma mruży jedno oko i szuka kogoś wzrokiem.',
  'Pieśń syreny': 'Syrena przechyla głowę i nuci pierwsze takty.',
  'Fala': 'Morze cofa się od skały. Zaraz wróci.',
  'Szept otchłani': 'Syrena pochyla się do ucha, którego tu nie ma.',
  'Uderzenie zewsząd': 'Macki wycofują się w ciemność, żeby uderzyć ze wszystkich stron.',
  'Przyzwanie macek': 'Ciemność wokół Shamblera gęstnieje i wybrzusza się.',
  'Spojrzenie spoza gwiazd': 'Coś w Shamblerze otwiera oko, którego nie powinno mieć.',
  'Ofiara krwi': 'Arcykapłan obnaża sztylet i szuka ofiary.',
  'Litania': 'Arcykapłan zaczyna litanię — kultyści podejmują ją szeptem.',
  'Mroczne zszycie': 'Arcykapłan sięga po igłę z kości i czarną nić.',
  'Miażdżący cios': 'Templariusz unosi młot nad pierwszy szereg.',
  'Przygwożdżenie': 'Templariusz rozwija łańcuch z hakiem i celuje w tył.',
  'Okrzyk wojenny': 'Templariusz nabiera tchu pod hełmem.',
  'Porodzenie': 'Matka Mięsa kurczy się i pęcznieje. Coś się w niej rusza.',
  'Wymiot': 'Matka Mięsa wzdyma się jak bukłak przed pęknięciem.',
  'Wyrzut ochłapu': 'Matka Mięsa odrywa od siebie kawał mięsa i bierze zamach.',
  'Puls': 'Serce przyspiesza. Ściany drżą w tym samym rytmie.',
  'Spojrzenie pustki': 'Serce na chwilę zamiera — i patrzy.'
};

/* ---------- kwestie bohaterów ---------- */
const BARKS = {
  stress5: ['Coś tu jest nie tak. Czujecie to?', 'Nie podoba mi się ta cisza.', 'Trzymajmy się razem.', 'Ile jeszcze tych korytarzy?'],
  stress15: ['Ja tam nie wchodzę.', 'Słyszę je… słyszę je w ścianach.', 'Zginiemy tu wszyscy. Wszyscy!', 'Dość. Mam dość.', 'Ręce mi się trzęsą. Nie patrzcie tak.'],
  affliction: {
    'Paranoja': ['Wiem, co knujecie. Wiem!', 'Nie dotykaj mnie. Nikomu nie ufam.'],
    'Egoizm': ['Każdy dba o siebie. Ja też.', 'Moje. Wszystko to moje.'],
    'Obłęd': ['Kolory! Słyszycie kolory?', 'Ha… ha, ha. Wszystko jest takie zabawne.'],
    'Lęk': ['Wracajmy. Proszę, wracajmy.', 'Nie, nie, nie, nie…'],
    'Beznadzieja': ['Po co walczyć? I tak nas zabiorą.', 'To koniec. Pogódźcie się z tym.'],
    'Agresja': ['Z drogi, bo cię potnę razem z nimi!', 'Wszyscy jesteście bezużyteczni!'],
    'Masochizm': ['Jeszcze. Jeszcze mocniej.', 'Ból to jedyne, co jest prawdziwe.']
  },
  virtue: {
    'Niezłomny': ['Stoimy. Nikt nie cofa się ani o krok.'], 'Odważny': ['Strach? Strach to tylko słowo.'],
    'Skupiony': ['Widzę każdy ich ruch.'], 'Potężny': ['Chodźcie. Wszyscy naraz.'], 'Witalny': ['To jeszcze nie koniec. Daleko do końca.']
  },
  crit: ['Tak się to robi!', 'Za ród!', 'Jeden mniej.', 'Padnij i nie wstawaj.'],
  allyDeath: ['Nie… tylko nie to…', 'Zapłacą za to.', 'Następny będę ja.', 'Zostawcie go. Nie ma już czego ratować.']
};

/* ---------- imiona, pochodzenie, marzenia, epitafia ---------- */
const FEMALE_CLASSES = ['Westalka', 'Piekielnica', 'Kuszniczka', 'Antykwariuszka', 'Łamaczka Tarcz'];
const NAMES_M = ['Bogusław', 'Radomir', 'Wit', 'Dobiesław', 'Mszczuj', 'Sobiesław', 'Jarogniew', 'Czcibor', 'Zbylut', 'Przecław', 'Wszebor', 'Bolko', 'Racibor', 'Siemowit', 'Gniewko', 'Lubomir', 'Mirosław', 'Ostoja', 'Sławoj', 'Teodor', 'Ignacy', 'Kazimierz', 'Wojsław', 'Dzierżko'];
const NAMES_F = ['Dobrosława', 'Radosława', 'Wiesna', 'Bogna', 'Jaromira', 'Mścisława', 'Zbysława', 'Dziwisława', 'Lubomira', 'Sława', 'Gniewomira', 'Wszebora', 'Rościsława', 'Milena', 'Jadwiga', 'Agnieszka', 'Ludmiła', 'Bożena', 'Witosława'];
const ORIGINS = [['syn młynarza z Doliny Wron', 'córka młynarza z Doliny Wron'], ['dezerter z królewskiej chorągwi', 'dezerterka z królewskiej chorągwi'], ['dawny sługa w posiadłości', 'była służąca w posiadłości'], ['najmłodszy z dziewięciorga dzieci rybaka', 'najmłodsza z dziewięciorga dzieci rybaka'], ['wygnany z klasztoru za herezję', 'wygnana z klasztoru za herezję'], ['jedyny ocalały z zarazy we wsi Kruki', 'jedyna ocalała z zarazy we wsi Kruki'], ['dawny kat miejski', 'córka miejskiego kata'], ['syn przemytnika z Zatoki', 'córka przemytnika z Zatoki'], ['czeladnik kowalski bez mistrza', 'uczennica kowala, która przerosła mistrza'], ['wędrowny kuglarz, któremu zabrano trupę', 'wędrowna kuglarka, której zabrano trupę'], ['dłużnik lichwiarza z Osady', 'dłużniczka lichwiarza z Osady'], ['bękart zubożałego szlachcica', 'nieślubna córka zubożałego szlachcica'], ['grabarz, który widział za dużo', 'grabarka, która widziała za dużo'], ['żołnierz, który wrócił z wojny sam', 'markietanka, która wróciła z wojny sama'], ['zielarz wypędzony za śmierć pacjenta', 'zielarka wypędzona za śmierć pacjenta']];
const DREAMS = [
  { key: 'boss', text: 'chce zabić potwora, o którym śpiewają w karczmie', goal: 'pokonać bossa' },
  { key: 'lvl3', text: 'chce zostać kimś, o kim się mówi', goal: 'dojść do Poziomu 3' },
  { key: 'quests3', text: 'chce odpracować dług wobec rodu', goal: 'wrócić z 3 wykonanych wypraw' },
  { key: 'dd', text: 'chce zajrzeć śmierci w oczy i przeżyć', goal: 'przeżyć Próg Śmierci' },
  { key: 'trinket', text: 'chce mieć coś, co przetrwa po nim', goal: 'nosić błyskotkę' },
  { key: 'calm', text: 'chce znów spokojnie spać', goal: 'wrócić z wyprawy ze Stresem 0' }
];
const EPITAPHS = ['Zawsze w pierwszym szeregu.', 'Bez czasu na strach.', 'Ciemność przerwała w pół zdania.', 'Długi spłacone. Wszystkie.', '„Wrócę przed zmrokiem.”', 'Ziemia nie pyta o imiona.', 'Za ród. Za nic. Za resztę z nas.'];
function rollStory(h) {
  const c = CLS[h.cls]; const fem = FEMALE_CLASSES.includes(c.name);
  const others = Object.values((Store.S || {}).heroes || {}).filter(x => x.id !== h.id && !x.dead);
  const fresh = (list, used) => { const f = list.filter(x => !used.includes(x)); return pick(f.length ? f : list); };
  if (!h.name) h.name = fresh(fem ? NAMES_F : NAMES_M, others.map(x => x.name));
  const dr = fresh(DREAMS, others.map(x => x.story && DREAMS.find(d => d.key === x.story.dream)).filter(Boolean));
  const og = fresh(ORIGINS, others.map(x => x.story && ORIGINS.find(o => o.includes(x.story.origin))).filter(Boolean));
  h.story = { origin: og[fem ? 1 : 0], dream: dr.key, dreamText: dr.text, goal: dr.goal, done: false };
  h.tally = h.tally || { quests: 0, bosses: 0, ddSurvived: 0 };
  return h;
}

/* ---------- rozmowy przy ognisku ---------- */
const CAMP_TALKS = [
  { key: 'tchorz', text: '{A} rzuca przy ognisku oskarżenie o tchórzostwo w ostatniej walce. Wszyscy patrzą na: {B}.', opts: [{ id: 'pogodz', label: 'Pogódźcie ich', note: 'obaj −1 Stres, więź +1' }, { id: 'niech', label: 'Niech się kłócą', note: '{A} −2 Stres, {B} +2 Stres, więź −1' }] },
  { key: 'wspomnienie', text: '{A} opowiada o domu. {B} słucha w milczeniu, a potem opowiada swoje.', opts: [{ id: 'sluchaj', label: 'Posłuchajcie do końca', note: 'obaj −2 Stres, więź +1' }, { id: 'spac', label: 'Każcie im iść spać', note: 'obaj +1 Zdrowia' }] },
  { key: 'jedzenie', text: 'Nocą znika prowiant. {A} wskazuje winnego: {B}.', opts: [{ id: 'kara', label: 'Ukarzcie winnego', note: '{B} +2 Stres, reszta −1 Stres' }, { id: 'odpusc', label: 'Odpuśćcie', note: '{A} +1 Stres, więź −1' }] },
  { key: 'rana', text: '{B} ukrywa ranę. {A} to zauważa.', opts: [{ id: 'opatrz', label: 'Niech {A} ją opatrzy', note: '{B} +3 Zdrowia, więź +1' }, { id: 'przemilcz', label: 'Przemilczcie', note: '{B} −1 Zdrowia, ale nikt się nie martwi' }] },
  { key: 'zaklad', text: '{A} i {B} zakładają się, kto zabije więcej wrogów w następnej walce.', opts: [{ id: 'przyjmij', label: 'Niech się zakładają', note: 'obaj: obrażenia +1 w następnej walce, więź +1' }, { id: 'zabron', label: 'Zabrońcie głupot', note: 'obaj −1 Stres' }] }
];

/* ---------- decyzje w Osadzie ---------- */
const HAMLET_DECISIONS = [
  { key: 'kaznodzieja', title: 'Wędrowny kaznodzieja', text: 'Na placu staje kaznodzieja i grzmi o grzechach rodu. Ludzie słuchają.', opts: [{ id: 'przyjmij', label: 'Przyjmijcie go', note: 'Opactwo o 1 Z tańsze w tym tygodniu, ale losowy bohater może zostać Fanatykiem (k10 1–3)' }, { id: 'wygon', label: 'Wygońcie go', note: 'każdy bohater w Osadzie +1 Stres' }] },
  { key: 'lichwiarz', title: 'Lichwiarz', text: 'Do bramy puka lichwiarz z sakwą pełną monet. Proponuje pożyczkę.', opts: [{ id: 'pozycz', label: 'Weźcie 20 Złota', note: 'za 2 tygodnie oddacie 30 — jeśli nie, będzie gorzej' }, { id: 'odmow', label: 'Odmówcie' }] },
  { key: 'medyk', title: 'Wędrowny medyk', text: 'Medyk z wozem pełnym słoików oferuje leczenie.', opts: [{ id: 'zaplac', label: 'Zapłaćcie 6 Złota', note: 'losowy chory bohater traci jedną chorobę' }, { id: 'odpraw', label: 'Odprawcie go' }] },
  { key: 'zlodziej', title: 'Złodziej w magazynie', text: 'Ktoś kręci się nocą przy magazynie błyskotek.', opts: [{ id: 'straz', label: 'Opłaćcie straż (5 Złota)', note: 'nic nie zginie' }, { id: 'ryzyko', label: 'Zaryzykujcie', note: 'k10 1–4: znika błyskotka albo k6×2 Złota' }] },
  { key: 'wdowa', title: 'Wdowa po poległym', text: 'Pod bramą stoi wdowa po jednym z waszych ludzi. Prosi o zapomogę.', opts: [{ id: 'daj', label: 'Dajcie 10 Złota', note: 'każdy bohater −2 Stres' }, { id: 'odmow', label: 'Odmówcie', note: 'każdy bohater +1 Stres' }] },
  { key: 'kuglarz', title: 'Trupa kuglarzy', text: 'Do Osady zajeżdża trupa kuglarzy i proponuje występ.', opts: [{ id: 'zapros', label: 'Zaproście ich (3 Złota)', note: 'każdy bohater −1 Stres' }, { id: 'odpraw', label: 'Odprawcie' }] }
];

/* ======================= sceny osobliwości: opis, obraz, wynik ======================= */
const CURIO_SCENES = {
  'Zamknięty sarkofag': { text: 'Kamienny sarkofag z wiekiem okutym żelazem. Na płycie wyryto herb — ten sam, który nosi wasz ród. Zamek jest nienaruszony, a spod wieka ciągnie chłodem.', good: 'Wieko ustępuje. Między kośćmi leży złoto, którego nikt nie ruszał od stu lat.', bad: 'Coś odpycha wieko od środka. Kości wstają, a za nimi słychać kolejne.', nic: 'Wieko ani drgnie. Sarkofag milczy.' },
  'Plugawy ołtarz': { text: 'Ołtarz z czarnego kamienia, oblepiony zaschniętą krwią. Nad nim ktoś wydrapał w ścianie znak, od którego bolą oczy.', good: 'Światło spływa na kamień. Znak pęka i w komnacie od razu robi się lżej.', bad: 'Znak otwiera oko. Szept wchodzi pod skórę i zostaje tam na długo.', nic: 'Krew na kamieniu jest stara i sucha. Nic się nie dzieje.' },
  'Stos gnijącego mięsa': { text: 'Sterta ochłapów, kości i czegoś, co kiedyś było świnią. Brzęczą muchy, a spod zgnilizny coś błyska.', good: 'W zgniliźnie leżą monety i klejnot — ktoś tu kiedyś zginął bogaty.', bad: 'Ze rozgrzebanej sterty bucha zielony smród. Choroba wchodzi w płuca.', nic: 'Tylko kości i smród. Nic cennego.' },
  'Wysyp grzybów': { text: 'Krąg bladych grzybów świeci słabo w ciemności. Pachną wilgotną ziemią i czymś zbyt słodkim.', good: 'Zarodniki opadają jak ciepły pył. Rany przestają piec, oddech się uspokaja.', bad: 'Kapelusze pękają i wypluwają chmurę trujących zarodników.', nic: 'Grzyby gasną jeden po drugim. Zostaje zapach ziemi.' },
  'Opuszczony wóz': { text: 'Wóz kupiecki z pękniętym dyszlem. Plandeka podarta, na skrzyni wisi kłódka. Konia nigdzie nie widać — ani woźnicy.', good: 'W skrzyni są zapasy i sakiewka z monetami. Woźnica już ich nie potrzebuje.', bad: 'Szczęk żelaza. Ktoś zastawił tu pułapkę na łupieżców — i doczekał się.', nic: 'Skrzynia jest pusta. Ktoś był tu przed wami.' },
  'Muszla szepcząca': { text: 'Ogromna muszla wyrzucona na kamienie. Gdy podchodzicie, słychać z niej szept — głos, który zna wasze imiona.', good: 'Szept mówi coś, co bohater zapamięta na zawsze. Coś dobrego.', bad: 'Szept nie milknie. Zostaje w głowie, gdy wszyscy już odeszli.', nic: 'Słychać tylko morze.' },
  'Zakazana księga': { text: 'Na pulpicie leży otwarta księga przykuta łańcuchem. Atrament na stronach wciąż jest mokry.', good: 'Litery układają się w wiedzę o słabych punktach każdego stworzenia.', bad: 'Strony szepczą. Czytający nie może przestać, aż z nosa cieknie mu krew.', nic: 'Litery rozmazują się w nic. Księga zamyka się sama.' }
};
/* przedmioty, które da się przyłożyć do osobliwości: nazwa → klucz w plecaku */
const SUP_ITEMS = [['Klucz', 'Klucze'], ['Łopata', 'Łopaty'], ['Woda święcona', 'Woda święcona'], ['Antidotum', 'Antidota'], ['Laudanum', 'Laudanum'], ['Bandaż', 'Bandaże'], ['Zioła', 'Zioła'], ['Pochodnia', 'Pochodnie'], ['Prowiant', 'Prowiant']];
function itemIcon(name) {
  const g = {
    'Klucz': '<circle cx="12" cy="20" r="6" fill="none" stroke="#c9a55c" stroke-width="3"/><path d="M18 20h16M29 20v6M33 20v5" stroke="#c9a55c" stroke-width="3" stroke-linecap="round"/>',
    'Łopata': '<path d="M7 7l15 15" stroke="#8a6440" stroke-width="3.5" stroke-linecap="round"/><path d="M5 5l5 0M5 5l0 5" stroke="#8a6440" stroke-width="3" stroke-linecap="round"/><path d="M19 25l6-6 9 9c1 4-2 7-6 6z" fill="#a7a7a2" stroke="#55534f" stroke-width="1.5"/>',
    'Woda święcona': '<path d="M16 6h8v6c6 2 9 7 9 12a13 13 0 0 1-26 0c0-5 3-10 9-12z" fill="#5f97c9" stroke="#c9d8e8" stroke-width="1.5"/><path d="M20 18v12M15 23h10" stroke="#f3efe6" stroke-width="2.5" stroke-linecap="round"/>',
    'Antidotum': '<rect x="13" y="10" width="14" height="24" rx="4" fill="#5fb06c" stroke="#cfe8d2" stroke-width="1.5"/><rect x="15" y="5" width="10" height="6" rx="1" fill="#8a6440"/><path d="M15 22h10" stroke="#e9f5ea" stroke-width="2"/>',
    'Laudanum': '<path d="M15 6h10v5l3 4v18a3 3 0 0 1-3 3H15a3 3 0 0 1-3-3V15l3-4z" fill="#7b3f22" stroke="#d9b89a" stroke-width="1.5"/><rect x="13" y="19" width="14" height="9" fill="#e8dcc4"/>',
    'Bandaż': '<circle cx="17" cy="20" r="10" fill="#ece5d6" stroke="#9b917f" stroke-width="1.5"/><path d="M17 14a6 6 0 1 1-6 6M17 17a3 3 0 1 1-3 3" fill="none" stroke="#b5ab98" stroke-width="1.5"/><path d="M26 22l9 6-3 4-9-6z" fill="#ece5d6" stroke="#9b917f" stroke-width="1.2"/>',
    'Zioła': '<path d="M20 35V14" stroke="#5b7a3a" stroke-width="2"/><ellipse cx="14" cy="15" rx="4" ry="8" transform="rotate(-30 14 15)" fill="#6f9a4a"/><ellipse cx="26" cy="15" rx="4" ry="8" transform="rotate(30 26 15)" fill="#7fae55"/><ellipse cx="20" cy="9" rx="3.5" ry="7" fill="#88b85e"/><path d="M15 28h10" stroke="#c9a55c" stroke-width="3"/>',
    'Pochodnia': '<path d="M20 36V18" stroke="#6b4a2a" stroke-width="4" stroke-linecap="round"/><path d="M20 4c5 5 7 9 5 13-1 2-3 3-5 3s-4-1-5-3c-2-4 0-8 5-13z" fill="#f08a2c"/><path d="M20 10c2 3 3 5 2 7-1 1-3 1-4 0-1-2 0-4 2-7z" fill="#ffd27a"/>',
    'Prowiant': '<ellipse cx="20" cy="22" rx="15" ry="10" fill="#b9813f" stroke="#6b4520" stroke-width="1.5"/><path d="M12 18l4 6M19 16l4 7M26 17l3 6" stroke="#e2b77a" stroke-width="2" stroke-linecap="round"/>'
  }[name] || '<circle cx="20" cy="20" r="10" fill="#555"/>';
  return '<svg viewBox="0 0 40 40" class="iicon" aria-hidden="true">' + g + '</svg>';
}
function curioArt(name, outcome, torch) {
  const t = Math.max(0, Math.min(10, torch == null ? 6 : +torch)); const a = (0.14 + t * 0.05).toFixed(2); const a2 = (0.05 + t * 0.018).toFixed(3);
  const open = outcome === 'dobrze' || outcome === 'źle'; const good = outcome === 'dobrze', bad = outcome === 'źle';
  let stones = '';
  for (let row = 0, y = 6; y < 232; row++, y += 38) for (let x = -40 + (row % 2) * 40; x < 640; x += 80) stones += `<rect x="${x}" y="${y}" width="80" height="38" rx="2"/>`;
  const coins = pts => pts.map(([x, y, r]) => `<ellipse cx="${x}" cy="${y}" rx="${r || 7}" ry="${(r || 7) * 0.6}" fill="#d9b45a" stroke="#7a5a22" stroke-width="1.5"/>`).join('');
  const sparks = pts => pts.map(([x, y, s]) => `<path d="M${x} ${y - s}L${x + s * 0.25} ${y - s * 0.25}L${x + s} ${y}L${x + s * 0.25} ${y + s * 0.25}L${x} ${y + s}L${x - s * 0.25} ${y + s * 0.25}L${x - s} ${y}L${x - s * 0.25} ${y - s * 0.25}Z" fill="#ffe7a8"/>`).join('');
  const cloud = (col, op, list) => `<g filter="url(#cs-blur)" opacity="${op}">${list.map(([x, y, rx, ry]) => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${col}"/>`).join('')}</g>`;
  const eyes = (col, list) => `<g filter="url(#cs-glow)">${list.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3.2" fill="${col}"/><circle cx="${x + 13}" cy="${y}" r="3.2" fill="${col}"/>`).join('')}</g>`;
  let obj = '';
  if (name === 'Zamknięty sarkofag') {
    obj = `<path d="M200 182L440 182 428 262 212 262Z" fill="#3a332c" stroke="#120f0c" stroke-width="3"/><path d="M226 200h188M222 246h196" stroke="#4d453c" stroke-width="2"/>
      <circle cx="320" cy="223" r="13" fill="none" stroke="#6a5e50" stroke-width="2.5"/><path d="M320 212v22M311 221h18" stroke="#6a5e50" stroke-width="2.5"/>
      ${open ? '<path d="M204 182L436 182 431 193 209 193Z" fill="#050403"/>' : ''}
      ${good ? `<ellipse cx="320" cy="186" rx="130" ry="26" fill="#ffcf6a" opacity=".45" filter="url(#cs-blur)"/>${coins([[268, 190], [290, 186, 6], [345, 189], [372, 186, 6], [300, 268], [352, 272, 6], [395, 266]])}` : ''}
      ${bad ? `<g stroke="#ddd3c0" stroke-width="5" stroke-linecap="round"><path d="M262 188l-8-30M272 188l-3-36M282 188l3-33M292 188l9-26M260 160l-6-4M269 152l-3-6"/></g>${eyes('#ff3b22', [[352, 188]])}` : ''}
      <g ${open ? 'transform="translate(-10 -22) rotate(-10 200 184)"' : ''}><path d="M190 164L450 164 440 184 200 184Z" fill="#4a4239" stroke="#120f0c" stroke-width="3"/><rect x="238" y="164" width="11" height="20" fill="#26221e"/><rect x="391" y="164" width="11" height="20" fill="#26221e"/>${open ? '' : '<rect x="312" y="168" width="16" height="14" rx="2" fill="#6b5b3e" stroke="#2a2218" stroke-width="2"/>'}</g>`;
  } else if (name === 'Plugawy ołtarz') {
    obj = `<g stroke="${good ? '#9a8a7a' : '#7a1f1a'}" stroke-width="5" fill="none" opacity=".95"><path d="M320 34L366 114H274Z"/><circle cx="320" cy="88" r="11"/>${good ? '<path d="M300 40l12 34-8 12 14 30" stroke="#f3e6c4" stroke-width="3"/>' : '<circle cx="320" cy="88" r="3" fill="#7a1f1a"/>'}</g>
      ${good ? '<path d="M286 0h68l70 258H216Z" fill="url(#cs-holy)"/>' : ''}
      <rect x="226" y="166" width="188" height="17" fill="#2d2622" stroke="#0d0a08" stroke-width="2"/><rect x="240" y="183" width="160" height="76" fill="#211b18" stroke="#0d0a08" stroke-width="3"/>
      <path d="M262 183v18M300 183v32M352 183v14M388 183v24" stroke="${good ? '#4a2a22' : '#6e1a13'}" stroke-width="4" stroke-linecap="round"/>
      <rect x="244" y="148" width="9" height="18" fill="#d9cfbd"/><rect x="387" y="148" width="9" height="18" fill="#d9cfbd"/>
      <ellipse cx="248.5" cy="143" rx="4" ry="7" fill="${good ? '#fff2c2' : '#b05cff'}"/><ellipse cx="391.5" cy="143" rx="4" ry="7" fill="${good ? '#fff2c2' : '#b05cff'}"/>
      ${bad ? cloud('#4b1c63', .65, [[320, 120, 120, 50], [250, 160, 70, 40], [395, 150, 80, 45], [320, 70, 90, 35]]) + eyes('#d9a8ff', [[262, 120], [360, 98], [300, 160], [395, 150]]) : ''}`;
  } else if (name === 'Stos gnijącego mięsa') {
    obj = `<path d="M186 264C206 204 252 172 300 180 332 150 386 160 404 192 434 204 454 238 456 264Z" fill="#4a2620" stroke="#1e0f0c" stroke-width="3"/>
      <ellipse cx="290" cy="220" rx="40" ry="18" fill="#6b3229"/><ellipse cx="380" cy="230" rx="30" ry="14" fill="#2e1612"/><ellipse cx="240" cy="246" rx="26" ry="10" fill="#5c2b23"/>
      <g stroke="#d1c6af" stroke-width="7" stroke-linecap="round"><path d="M244 212l42-24M372 202l34 20"/></g><g fill="#d1c6af"><circle cx="242" cy="214" r="6"/><circle cx="288" cy="187" r="6"/><circle cx="370" cy="200" r="6"/><circle cx="408" cy="223" r="6"/></g>
      <path d="M318 196q14-17 28 0M322 207q12-13 22 0" stroke="#bfb39b" stroke-width="4" fill="none"/>
      ${outcome === 'nic' || !outcome ? '<g fill="#0d0d0d">' + [[262, 150], [280, 136], [300, 158], [338, 130], [362, 148], [386, 138], [316, 120], [350, 170]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="2.6"/>`).join('') + '</g>' : ''}
      ${good ? `<ellipse cx="330" cy="236" rx="80" ry="22" fill="#ffcf6a" opacity=".4" filter="url(#cs-blur)"/>${coins([[300, 240], [320, 248, 6], [362, 244]])}<path d="M338 222l10 10-10 12-10-12z" fill="#7fd0e6" stroke="#2c6f82" stroke-width="1.5"/>` : ''}
      ${bad ? cloud('#5c8a24', .6, [[320, 150, 130, 55], [250, 120, 70, 40], [400, 110, 80, 40], [320, 80, 90, 35]]) : ''}`;
  } else if (name === 'Wysyp grzybów') {
    const ms = [[230, 262, 34, 18, 34], [276, 262, 48, 26, 52], [330, 264, 62, 32, 70], [392, 262, 44, 24, 46], [432, 264, 28, 15, 28], [256, 266, 22, 12, 18], [362, 268, 24, 13, 20]];
    obj = `<ellipse cx="330" cy="262" rx="150" ry="18" fill="#9fe0bf" opacity="${bad ? .05 : .16}" filter="url(#cs-blur)"/>` + ms.map(([x, y, w, h, s]) => `<rect x="${x - w * 0.12}" y="${y - s}" width="${w * 0.24}" height="${s}" fill="#d9cdb4"/><path d="M${x - w / 2} ${y - s}a${w / 2} ${h} 0 0 1 ${w} 0z" fill="${bad ? '#8a8a3a' : '#b8a98d'}" stroke="#5e5342" stroke-width="2"/><circle cx="${x - w * 0.15}" cy="${y - s - h * 0.45}" r="${w * 0.06}" fill="#efe6d2"/>`).join('')
      + (good ? `<g filter="url(#cs-glow)">${[[250, 170], [290, 140], [330, 110], [360, 150], [400, 130], [310, 175], [270, 110], [420, 170], [345, 80]].map(([x, y], i) => `<circle cx="${x}" cy="${y}" r="${2 + (i % 3)}" fill="#b8ffe2"/>`).join('')}</g>` : '')
      + (bad ? cloud('#6d8f1c', .7, [[330, 170, 150, 60], [260, 140, 80, 45], [410, 130, 90, 45], [330, 100, 100, 40]]) : '');
  } else if (name === 'Opuszczony wóz') {
    obj = `<path d="M190 170C230 108 362 98 424 170Z" fill="#5a5146" stroke="#1d1914" stroke-width="3"/><path d="M300 120l18 30-14 16" stroke="#2a2520" stroke-width="5" fill="none"/>
      <path d="M180 170L432 170 422 230 190 230Z" fill="#3b2a1c" stroke="#120c07" stroke-width="3"/><path d="M186 190h240M188 210h236" stroke="#2a1d12" stroke-width="2"/>
      <path d="M432 214L520 240 548 230" stroke="#3b2a1c" stroke-width="8" stroke-linecap="round" fill="none"/>
      ${[228, 384].map(x => `<circle cx="${x}" cy="246" r="30" fill="none" stroke="#2a1d12" stroke-width="7"/><path d="M${x - 30} 246h60M${x} 216v60M${x - 21} 225l42 42M${x + 21} 225l-42 42" stroke="#2a1d12" stroke-width="3"/><circle cx="${x}" cy="246" r="6" fill="#2a1d12"/>`).join('')}
      ${open ? '' : '<path d="M298 196a8 8 0 0 1 16 0" stroke="#7d6a48" stroke-width="3" fill="none"/><rect x="295" y="196" width="22" height="18" rx="2" fill="#6b5b3e" stroke="#2a2218" stroke-width="2"/>'}
      ${good ? `<ellipse cx="470" cy="262" rx="80" ry="24" fill="#ffcf6a" opacity=".4" filter="url(#cs-blur)"/><path d="M430 238h84v34h-84z" fill="#4a3322" stroke="#120c07" stroke-width="3"/><path d="M430 238l10-26h84l-10 26z" fill="#5b3f2a" stroke="#120c07" stroke-width="3"/><rect x="444" y="226" width="12" height="18" rx="3" fill="#5fb06c"/><ellipse cx="478" cy="236" rx="16" ry="9" fill="#b9813f"/><rect x="496" y="224" width="10" height="20" rx="2" fill="#5f97c9"/>${coins([[452, 278, 6], [480, 282], [508, 278, 6]])}` : ''}
      ${bad ? '<path d="M262 270L272 250 282 270 292 250 302 270 312 250 322 270 332 250 342 270 352 250 362 270" stroke="#9a9a96" stroke-width="5" fill="none" stroke-linejoin="round"/><path d="M256 272h112" stroke="#4a4a46" stroke-width="6"/><g stroke="#c0281c" stroke-width="9" stroke-linecap="round" opacity=".85"><path d="M226 120l70 90M262 108l64 96M300 104l58 92"/></g><g fill="#8e1a12"><circle cx="300" cy="284" r="4"/><circle cx="330" cy="290" r="3"/><circle cx="350" cy="282" r="3.5"/></g>' : ''}`;
  } else if (name === 'Muszla szepcząca') {
    obj = `<ellipse cx="320" cy="276" rx="190" ry="17" fill="#18262f" opacity=".9"/><path d="M196 264C218 232 300 222 446 236 474 248 476 264 476 264Z" fill="#2a2724" stroke="#141210" stroke-width="2"/>
      ${good ? '<g fill="none" stroke="#a8d4f2" stroke-linecap="round">' + [40, 70, 100, 130].map((r, i) => `<path d="M${262 - r * 0.6} ${210 - r * 0.8}a${r} ${r} 0 0 0 0 ${r * 1.4}" stroke-width="${4 - i * 0.7}" opacity="${0.9 - i * 0.18}"/>`).join('') + '</g>' : ''}
      ${bad ? cloud('#5a1a3c', .7, [[230, 160, 90, 45], [190, 110, 60, 35], [280, 90, 70, 30]]) + '<g fill="none" stroke="#a03a6a" stroke-width="3" opacity=".9"><path d="M250 180c-30-10-40-40-10-50s40 20 10 30-30-20-5-18"/><path d="M200 130c-20-6-26-26-6-32s26 14 6 20"/></g>' : ''}
      <path d="M248 230C236 180 298 138 362 148 426 158 446 212 412 238 380 256 298 256 248 230Z" fill="#cdbca6" stroke="#5a4a3a" stroke-width="3"/>
      <path d="M392 204C382 182 350 176 334 192 320 206 340 224 358 213 368 206 360 194 350 198" stroke="#8b7a66" stroke-width="3" fill="none"/><path d="M300 160c10 30 6 60-10 84M340 154c8 34 4 66-8 92" stroke="#a8977f" stroke-width="2" fill="none"/>
      <ellipse cx="268" cy="222" rx="24" ry="15" fill="#2a1f1a"/>`;
  } else {
    obj = `<ellipse cx="320" cy="262" rx="60" ry="8" fill="#140f0b"/><rect x="311" y="196" width="18" height="64" fill="#2b1f16" stroke="#120c07" stroke-width="2"/><path d="M236 198L404 198 390 168 250 168Z" fill="#3a2a1d" stroke="#120c07" stroke-width="3"/>
      <path d="M256 172C280 158 306 160 320 168V194C306 186 280 186 256 196Z" fill="#dccfb3" stroke="#6b5d48" stroke-width="1.5"/><path d="M384 172C360 158 334 160 320 168V194C334 186 360 186 384 196Z" fill="#d4c6a8" stroke="#6b5d48" stroke-width="1.5"/>
      <g stroke="#6e5f49" stroke-width="1.6">${[0, 1, 2, 3].map(i => `<path d="M${266 + i * 2} ${176 + i * 4}h${40 - i * 3}M${330} ${170 + i * 4 + 2}h${42 - i * 3}"/>`).join('')}</g>
      <g fill="none" stroke="#5c5c58" stroke-width="3">${[0, 1, 2, 3].map(i => `<ellipse cx="${392 + i * 9}" cy="${190 + i * 13}" rx="5" ry="7"/>`).join('')}</g>
      ${good ? '<g filter="url(#cs-glow)" stroke="#f0cf72" stroke-width="2.5" fill="none"><circle cx="270" cy="120" r="9"/><path d="M270 111v18"/><path d="M316 70l12 20h-24z"/><path d="M364 112h18M373 103v18"/><circle cx="342" cy="130" r="5"/><path d="M292 94l8 8m0-8l-8 8"/></g>' : ''}
      ${bad ? cloud('#3a1450', .6, [[320, 140, 110, 45]]) + '<g fill="none" stroke="#150a1c" stroke-width="7" stroke-linecap="round"><path d="M300 172c-20-30 10-50-10-90"/><path d="M330 168c10-40 40-40 30-90"/><path d="M350 176c30-20 50-10 60-40"/><path d="M286 178c-30-10-50 0-62-30"/></g>' : ''}`;
  }
  const over = good ? '<rect width="640" height="320" fill="#d2ab52" opacity=".07"/>' + sparks([[150, 90, 7], [520, 70, 6], [470, 150, 5], [180, 190, 5], [560, 210, 6]]) : bad ? '<rect width="640" height="320" fill="#7a0f0a" opacity=".16"/>' : outcome === 'nic' ? '<rect width="640" height="320" fill="#000" opacity=".38"/>' : '';
  return `<svg viewBox="0 0 640 320" class="scene-art" role="img" aria-label="${esc(name)}"><defs>
    <linearGradient id="cs-wall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#14100d"/><stop offset="1" stop-color="#241c16"/></linearGradient>
    <radialGradient id="cs-torch" cx="0.5" cy="0.66" r="0.62"><stop offset="0" stop-color="#ffb862" stop-opacity="${a}"/><stop offset="0.55" stop-color="#c8702c" stop-opacity="${a2}"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient>
    <radialGradient id="cs-vig" cx="0.5" cy="0.55" r="0.78"><stop offset="0.5" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity="0.9"/></radialGradient>
    <linearGradient id="cs-holy" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff6d6" stop-opacity=".75"/><stop offset="1" stop-color="#ffd27a" stop-opacity="0"/></linearGradient>
    <filter id="cs-blur" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="14"/></filter>
    <filter id="cs-glow" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="2.4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
    <rect width="640" height="320" fill="url(#cs-wall)"/><g fill="none" stroke="#0a0806" stroke-opacity=".55" stroke-width="2">${stones}</g>
    <path d="M0 238H640V320H0Z" fill="#0f0b09"/><path d="M0 238H640" stroke="#2c231c" stroke-width="2"/>
    <rect width="640" height="320" fill="url(#cs-torch)"/>${obj}${over}<rect width="640" height="320" fill="url(#cs-vig)"/></svg>`;
}
