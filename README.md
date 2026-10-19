# Noob Survivors — Hunter's Nocturne (Alpha 0.6)

An original gothic dark-fantasy survivor playable in a browser. Fight with an animated chain whip, gather souls, choose upgrades, and survive a three-minute hunt. The game features stylized blood, bones, and fallen enemies; it is intended for mature audiences. This is a descriptive 18+ positioning, not an official age rating or age-verification system.

## Play

https://masterjimo.github.io/Noob-Survivors/

- **WASD / arrows:** move the hunter
- **Auto attack:** short-range whip strike, automatically aimed at nearby foes
- **P / Esc:** pause/resume
- **1, 2, 3:** choose a power
- **Touchscreens:** use the virtual movement joystick
- **Audio:** Music volume, SFX volume, and MUTE ON/OFF. Settings persist in your browser when localStorage is enabled.

## Alpha 0.6 — hunter polish

The game keeps the six original enemy types (Skeleton, Bat, Flesh Slime, Ghoul, Cultist, Wraith) and the crimson/ash pixel-HD look. Changes:

1. New original gothic vampire-hunter sprite: auburn flowing hair, leather armor, crimson scarf, whip bracer, and separate idle, walking, and striking frames.
2. Player attacks now use **real, short-range chain-whip melee sweeps**, instead of ranged magical bullets. Visual lash animation, sweep/cone collision, and hit effects; weapon upgrades now improve multiple lashes, speed, damage, or cleave. Cultist enemy projectiles are unchanged.
3. Matching dark-gothic menu and end-of-run screen, rank and best-kills record, and a new hunter-themed introduction.
4. Removed the top-left project title/version banner and soundtrack picker. **Ancient Caverns** is the only soundtrack.

## Music license

"Ancient caverns (horror ambient loop)" by **congusbongus**, CC0, via OpenGameArt:
https://opengameart.org/content/ancient-caverns-horror-ambient-loop

The current game links directly to the author's hosted `.ogg` file. It is not bundled into the repository. Playing background music requires browser permission after interaction and accessibility of the OpenGameArt server; its availability is not guaranteed when offline or if hotlinking is blocked.

## Tech & publishing

Simple HTML, CSS and JavaScript Canvas 2D. Sprite art is procedural/hand-designed code with no borrowed franchise characters or art. No build step or frontend framework required.

For local development, open `index.html` directly, or run `python3 -m http.server 8000` and visit http://localhost:8000.

For GitHub Pages: **Settings → Pages → Deploy from a branch → main → /(root)**.