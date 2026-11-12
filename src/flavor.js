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
