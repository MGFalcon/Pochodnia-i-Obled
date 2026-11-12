# Stół Pochodni i Obłędu

Stół do gry online w autorski system RPG „Pochodnia i Obłęd”. Strona to jeden plik `index.html` (GitHub Pages z gałęzi `main`, katalog główny).

## Budowanie
- Źródła są w `src/`: `common.js`, `world.js`, `flavor.js` (teksty klimatyczne), `rules.js`, `portraits.js`, `net.js`, `combat.js`, `app.js`, `v_*.js`, `story.js` (płynna walka, „Co teraz?”, Przodek, więzi, decyzje, zegar Ciemności, głosowanie), style `common.css` i `app.css`, szablon `index.tpl.html`, dane klas i bestiariusza `data.json`.
- Przed każdym wdrożeniem zaktualizuj `src/version.txt` (data i godzina, np. `12.11 · 20:25`) — ten znacznik widać w nagłówku strony.
- `python3 build.py` składa `out/stol.html` (wersja do artefaktu Claude) i `out/index.html` (pełna strona). Po zbudowaniu skopiuj `out/index.html` do `index.html` w katalogu głównym.
- Tryby gry: lokalny, pokój przez PeerJS (MG hostuje, gracze dołączają kodem), baza artefaktu Claude.

## Zasady pracy
- Wszystkie teksty po polsku. Kości zawsze widoczne w dzienniku.
- Prawa zastrzeżone (patrz LICENSE) — nie dodawaj licencji otwartej.
