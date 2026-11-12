/* Świat: regiony, lokacje na mapie posiadłości, tabele MG. Współrzędne w układzie mapy 1000×640. */
const REGIONS = {
  ruiny: {
    name: 'Ruiny', key: 'Ruiny', at: [96, 236], color: '#b9a98c',
    desc: 'Dawne skrzydła posiadłości, zapadnięte w ziemię razem z kaplicą rodu. Kości wstają tu same, a kultyści płacą za nie krwią.',
    gather: 'Rodowe relikwie', activate: 'Plugawy ołtarz', activateItem: 'woda święcona',
    locs: [
      { name: 'Zapadłe Krużganki', at: [318, 238], desc: 'Zawalone krużganki tuż za murem Osady. Szkielety wciąż stoją na straży, jakby nikt im nie powiedział, że ród upadł.' },
      { name: 'Krypty Rodowe', at: [208, 168], desc: 'Krypty przodków, w których każde wieko było kiedyś zamknięte. Teraz są otwarte od środka.' },
      { name: 'Kaplica Bez Imienia', at: [118, 110], desc: 'Kaplica, z której zdarto imię świętego. Kultyści odprawiają tu nabożeństwa dla czegoś, co im odpowiada.' }
    ],
    lair: { name: 'Pracownia Nekromanty', at: [292, 118], desc: 'Uczeń Nekromanty zszywa tu kości w żołnierzy i czeka, aż ktoś przyniesie mu świeże.' }
  },
  nory: {
    name: 'Nory', key: 'Nory', at: [205, 478], color: '#a58f6b',
    desc: 'Kanały i komory pod rzeźnią rodu, które ludzie-świnie zamienili w swoje królestwo.',
    gather: 'Świńskie totemy', activate: 'Stos gnijącego mięsa', activateItem: 'łopata',
    locs: [
      { name: 'Ściek pod Rzeźnią', at: [340, 452], desc: 'Wejście do kanałów pod starą rzeźnią. Przy każdym deszczu smród dochodzi aż do Osady.' },
      { name: 'Zalane Komory', at: [222, 520], desc: 'Komory po pas w wodzie i nieczystościach. Ścierwojady wyczuwają rany z daleka.' },
      { name: 'Gniazdo Wieprza', at: [110, 575], desc: 'Najgłębsze komory, wyłożone kośćmi tych, którzy przyszli tu przed wami.' }
    ],
    lair: { name: 'Dwór Świńskiego Księcia', at: [300, 590], desc: 'Tron z beczek i padliny, na którym Świński Książę przyjmuje hołdy i ofiary.' }
  },
  knieja: {
    name: 'Knieja', key: 'Knieja', at: [790, 205], color: '#8f9a72',
    desc: 'Las na wschód od Osady. Kiedyś łowiska rodu, dziś bandyci na traktach i grzyby, które wyrastają z ludzi.',
    gather: 'Zaginione dzienniki', activate: 'Opuszczony wóz', activateItem: 'klucz',
    locs: [
      { name: 'Wisielczy Trakt', at: [640, 298], desc: 'Stary trakt kupiecki. Na gałęziach wiszą ci, którzy nie zapłacili bandytom myta.' },
      { name: 'Grzybowa Polana', at: [770, 250], desc: 'Polana, na której grzybnia przerosła dawny obóz drwali. Niektóre grzyby mają twarze.' },
      { name: 'Uroczysko Czarownic', at: [895, 130], desc: 'Krąg kamieni w najstarszej części lasu. Ognie płoną tu bez drewna.' }
    ],
    lair: { name: 'Chata z Kotłem', at: [905, 268], desc: 'Chata wiedźmy, w której kocioł nigdy nie stygnie. Bandyci znoszą jej wszystko, co złapią.' }
  },
  zatoka: {
    name: 'Zatoka', key: 'Zatoka', at: [800, 470], color: '#7f97a0',
    desc: 'Kamienista zatoka z grotami, do której przodek sprowadzał przemyt. Morze oddało mu za to swoich mieszkańców.',
    gather: 'Perły otchłani', activate: 'Muszla szepcząca', activateItem: 'laudanum',
    locs: [
      { name: 'Słone Groty', at: [655, 470], desc: 'Groty przemytników pod klifem. Przy odpływie da się przejść, przy przypływie wracają topielcy.' },
      { name: 'Wraki u Przylądka', at: [790, 545], desc: 'Wraki statków rodu, rozbite na skałach. W ładowniach wciąż coś się rusza.' },
      { name: 'Zatopiona Kaplica', at: [915, 600], desc: 'Kaplica, którą morze zabrało razem z wiernymi. Śpiewają tam do dziś.' }
    ],
    lair: { name: 'Skała Syreny', at: [925, 470], desc: 'Skała na końcu zatoki, z której Syrena wabi rybaków. Bohaterów też.' }
  }
};
const REGION_IDS = ['ruiny', 'nory', 'knieja', 'zatoka'];
const OSADA_AT = [478, 392];
const MANOR_AT = [505, 112];
const DD_FLOORS = [
  { name: 'Kaplica Kultu', boss: 'Arcykapłan', desc: 'Pierwsze piętro pod posiadłością. Kult odprawia tu msze od dnia, w którym przodek otworzył drzwi.' },
  { name: 'Koszary Templariuszy', boss: 'Templariusz-Wódz', desc: 'Sale, w których Plugawi wyhodowali sobie żołnierzy z ludzi przodka.' },
  { name: 'Trzewia', boss: 'Matka Mięsa', desc: 'Korytarze, które oddychają. Ściany są ciepłe i rosną.' },
  { name: 'Serce', boss: 'Serce Ciemności', desc: 'Na samym dnie bije to, co przodek odkopał. Zna wasze imiona.' }
];
/* Poziom lochu: kto zejdzie (Odmowy) i zalecenie z symulacji */
const DL_INFO = [
  { who: 'Poziom 0–2', rec: 'Poziom 0–2, rangi 0–1', mult: 1, scale: 'wartości z tabel' },
  { who: 'Poziom 0–4', rec: 'Poziom 3–4, rangi 2+', mult: 1.5, scale: 'Zdrowie +5, Celność +1, Unik +1, obrażenia +1' },
  { who: 'Poziom 0–6', rec: 'Poziom 5–6, rangi 3–4', mult: 2, scale: 'Zdrowie +10, Celność +2, Unik +2, obrażenia +2, Szybkość +1, Stres +1' }
];
const QUEST_LEN = {
  krotka: { name: 'Krótka', rooms: '4–6', camps: 0, gold: 25, mem: 2, xp: 1, pack: '8 prowiantu, 2 pochodnie, 1 łopata, 2 bandaże, 1 antidotum (11 Z)' },
  srednia: { name: 'Średnia', rooms: '8–10', camps: 1, gold: 40, mem: 3, xp: 2, pack: '18 prowiantu, 4 pochodnie, 2 łopaty, 3 bandaże, 2 antidota (22 Z)' },
  dluga: { name: 'Długa', rooms: '12–16', camps: 2, gold: 60, mem: 4, xp: 3, pack: '32 prowianty, 6 pochodni, 2 łopaty, 4 bandaże, 2 antidota (32 Z)' }
};
const TORCH = [
  { min: 9, name: 'Jasno', surprise: '1–3 wrogowie zaskoczeni, 10 drużyna', enemy: 'Celność −1', loot: '−1 rzut na łup (zawsze co najmniej 1 — wtedy gorszy z dwóch k10)', stress: '—', scout: 4, accMod: -1, dmgMod: 0, critMod: 0 },
  { min: 6, name: 'Półmrok', surprise: '1–2 wrogowie, 9–10 drużyna', enemy: '—', loot: 'normalnie', stress: '—', scout: 3, accMod: 0, dmgMod: 0, critMod: 0 },
  { min: 3, name: 'Cienie', surprise: '1 wrogowie, 8–10 drużyna', enemy: 'Celność +1', loot: '+1 rzut na łup', stress: '—', scout: 2, accMod: 1, dmgMod: 0, critMod: 0 },
  { min: 1, name: 'Mrok', surprise: '7–10 drużyna', enemy: 'Celność +1, obrażenia +1', loot: '+1 rzut na łup', stress: '+1 za korytarz', scout: 1, accMod: 1, dmgMod: 1, critMod: 0 },
  { min: 0, name: 'Ciemność', surprise: '6–10 drużyna', enemy: 'Celność +2, obrażenia +1, Kryt +1', loot: '+2 rzuty na łup', stress: '+1 za korytarz, +1 na początku walki', scout: 0, accMod: 2, dmgMod: 1, critMod: 1 }
];
const torchInfo = t => TORCH.find(x => t >= x.min);

/* Tabele do rzutów MG: [od, do, wynik] */
const TABLES = {
  komnata: { name: 'Komnata', die: 10, rows: [[1, 4, 'walka'], [5, 6, 'osobliwość'], [7, 7, 'skrzynia'], [8, 8, 'walka i osobliwość'], [9, 10, 'pusta']] },
  korytarz: { name: 'Zdarzenie w korytarzu', die: 10, rows: [[1, 1, 'zasadzka'], [2, 2, 'pułapka'], [3, 3, 'przeszkoda'], [4, 5, 'osobliwość'], [6, 10, 'cisza']] },
  lup: { name: 'Łup', die: 10, rows: [[1, 4, 'k6 Złota'], [5, 6, 'pamiątka (k4: Popiersie, Portret, Akt własności, Herb)'], [7, 7, '2 losowe zapasy'], [8, 10, 'klejnot wart 10 Złota']] },
  ukryta: { name: 'Ukryta komnata', die: 10, rows: [[1, 2, 'drobiazg: przedmiot wart k6+4 Złota'], [3, 4, 'kosztowność: klejnot (10 Złota) i k6 Złota'], [5, 6, 'skarb: 2 klejnoty i pamiątka'], [7, 10, 'błyskotka (rzuć na rodzaj)']] },
  blyskotka: { name: 'Rodzaj błyskotki', die: 10, rows: [[1, 5, 'zwykła (10 Z)'], [6, 9, 'rzadka (15 Z)'], [10, 10, 'klasowa (20 Z)']] },
  osobliwosc: { name: 'Osobliwość bez przedmiotu', die: 10, rows: [[1, 4, 'dobrze'], [5, 7, 'nic'], [8, 10, 'źle']] },
  pulapka: { name: 'Skutek pułapki', die: 4, rows: [[1, 1, 'k4 obrażeń'], [2, 2, 'krwawienie 2'], [3, 3, 'zaraza 2'], [4, 4, '+2 Stresu']] },
  noc: { name: 'Noc w obozie', die: 10, rows: [[1, 2, 'nocna zasadzka'], [3, 10, 'spokojna noc']] },
  osada: { name: 'Wydarzenie w Osadzie', die: 10, rows: [[1, 1, 'Procesja pokutników: Opactwo o 2 Z tańsze'], [2, 2, 'Jarmark: Wóz Nomadów skupuje błyskotki po pełnej wartości'], [3, 3, 'Zaraza w osadzie: Sanatorium zamknięte'], [4, 4, 'Weteran w dyliżansie: jeden rekrut ma Poziom 2'], [5, 5, 'Pożar w gospodzie: Gospoda zamknięta'], [6, 6, 'Hojny mecenas: +10 Złota'], [7, 7, 'Niespokojne sny: każdy bohater w osadzie +1 Stres'], [8, 8, 'Pijany kowal: Kuźnia o połowę tańsza, ale przy k10 1–3 ulepszenie się nie udaje'], [9, 9, 'Kultyści na trakcie: dodatkowa walka w pierwszym korytarzu'], [10, 10, 'Cichy tydzień']] },
  skutek: { name: 'Skutek uboczny usługi (przy 1 na k10)', die: 6, rows: [[1, 1, 'Bohater przepadł: niedostępny także w kolejnym tygodniu'], [2, 2, 'Przegrał albo przepił: osada traci k6 Złota'], [3, 3, 'Zginęła losowa błyskotka z magazynu'], [4, 4, 'Awantura: zakaz wstępu do budynku na 2 tygodnie'], [5, 5, 'Nałóg: dziwactwo pasujące do usługi'], [6, 6, 'Plotka: następna wyprawa ma +1 rzut na łup']] },
  dziwactwo: { name: 'Dziwactwo po wyprawie', die: 10, rows: [[1, 2, 'nowe pozytywne'], [3, 5, 'nowe negatywne'], [6, 10, 'nic']] }
};
function rollTable(id) {
  const t = TABLES[id]; const r = d(t.die);
  const row = t.rows.find(x => r >= x[0] && r <= x[1]);
  return { r, text: row[2], name: t.name, die: t.die };
}

/* NPC: tabele do szybkiego wymyślania postaci */
const NPC_GEN = {
  names: ['Agnieszka', 'Barnaba', 'Celestyna', 'Dobrosław', 'Eustachy', 'Felicja', 'Gerwazy', 'Halszka', 'Ignacy', 'Jadwiga', 'Kasper', 'Ludmiła', 'Marcjan', 'Nikodem', 'Odyla', 'Prokop', 'Róża', 'Sobiesław', 'Tekla', 'Urban', 'Wawrzyniec', 'Zofia', 'Zbylut', 'Bronisława', 'Teodor', 'Walenty', 'Eufemia', 'Hieronim'],
  surn: ['Kruk', 'z Moczarów', 'Wilczek', 'Szarywron', 'z Podgrodzia', 'Grobelny', 'Pustelnik', 'Bez Palców', 'Siwy', 'Ślepiec', 'z Zatoki', 'Kostucha', 'Sowa', 'Czarnoręki'],
  roles: ['karczmarz z Gospody', 'brat z Opactwa', 'kowal', 'woźnica dyliżansu', 'handlarka z Wozu Nomadów', 'grabarz', 'zielarka', 'zubożały szlachcic', 'przemytnik', 'ocalały z wyprawy', 'kapłan wędrowny', 'łowca nagród', 'dziecko z Osady', 'medyk z Sanatorium', 'stary sługa przodka', 'rybak z Zatoki'],
  looks: ['blizna przez całą twarz', 'brak dwóch palców', 'oczy zbyt jasne jak na człowieka', 'pachnie kadzidłem i zgnilizną', 'nosi zbroję o kilka numerów za dużą', 'ciągle kaszle', 'ręce czyste aż do przesady', 'chodzi o kulach', 'przetarty płaszcz z herbem rodu', 'wiecznie mokre ubranie'],
  voice: ['szepcze, jakby ktoś podsłuchiwał', 'mówi o sobie w trzeciej osobie', 'śmieje się w złych momentach', 'cytuje modlitwy', 'targuje się o wszystko', 'nie patrzy w oczy', 'przerywa w pół zdania', 'mówi powoli i bardzo grzecznie'],
  wants: ['odzyskać syna, który zszedł do Ruin', 'spłacić dług u przodka', 'zdobyć klejnot z Zatopionej Kaplicy', 'żeby ktoś wreszcie zabił Świńskiego Księcia', 'wyjechać z Osady na zawsze', 'nawrócić bohaterów', 'kupić tanio to, co przynosicie z lochu', 'zostać pochowanym w poświęconej ziemi'],
  fears: ['ciemności', 'wody', 'własnych snów', 'Opactwa', 'tego, co słyszy w ścianach', 'powrotu przodka', 'bandytów z Kniei', 'że ktoś odkryje jego sekret'],
  secrets: ['handluje z kultystami', 'był na wyprawie, z której nikt inny nie wrócił', 'jest spokrewniony z rodem', 'zjada mięso z Nor', 'ma w piwnicy Zakazaną księgę', 'zdradził poprzednią drużynę', 'słyszy głos przodka', 'ukrywa chorobę bestii']
};
