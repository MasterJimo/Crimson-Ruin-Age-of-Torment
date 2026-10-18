# ✦ Noob Survivors — The Hollow Night

Mroczny, pixel-artowy mini survivor, w który można grać bezpośrednio w przeglądarce. Zero instalacji, zero zależności, zero backendu.

## Jak zagrać?

**WASD / strzałki:** ruch · **P / Esc:** pauza · **1, 2, 3:** wybór ulepszenia · **Telefon:** wirtualny joystick (lewa strona ekranu). Ataki są automatyczne.

Przetrwaj **3 minuty**. Zbieraj zielone kryształy doświadczenia i rozwijaj postać. Na początku występują szkielety, a następnie nietoperze, slime'y, ghule, kultyści i zjawy. Każdy z sześciu typów ma własną sylwetkę i statystyki; kultyści potrafią także strzelać.

## Technologia i grafika

- HTML + CSS + JavaScript + Canvas 2D, bez frameworków, npm i CDN wymaganych do działania.
- Własne **pixel-artowe sprite'y rysowane w kodzie** (`sprites.js`). Żadnych zapożyczonych grafik ani zależności od zewnętrznych serwerów. Fonty Google mają lokalny fallback.
- Generowana proceduralnie, powtarzalna ciemna arena (nagrobki, kości, rośliny, grzyby, latarnie).
- Automatyczne celowanie, ulepszenia, XP, efekty cząsteczkowe, obrażenia, obsługa klawiatury i dotyku, dźwięk opcjonalny.

## Odpalenie lokalnie

Otwórz `index.html` w przeglądarce. Możesz też użyć prostego serwera, np. `python -m http.server 8000`, i wejść na `http://localhost:8000`.

## GitHub Pages — publikacja

Repozytorium powinno być **publiczne**. Wejdź w **Settings → Pages → Build and deployment**, ustaw **Deploy from a branch**, wybierz `main` i `/(root)` i zatwierdź **Save**.

Adres gry po włączeniu Pages: **https://masterjimo.github.io/Noob-Survivors/**

## Plan dalszego rozwoju

- Animacje klatkowe walki i ruchu; osobne sprite sheety PNG.
- Unikatowe ataki/bossowie oraz system ekwipunku.
- Menu wyboru postaci, zapis rekordów, muzyka i pełne efekty audio.

Projekt jest przygotowany jako mały, czytelny fundament do wspólnego iterowania.