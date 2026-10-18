# ✦ Noob Survivors — Alpha 0.4

A dark fantasy browser survivor with a cleaner pixel-HD look, heavier crimson/black mood, stylized blood effects, corpse remains, and English UI.

## Core direction

- **Tone:** darker, bloodier, more adult-facing fantasy action.
- **Audience positioning:** **18+ / mature stylized gore**.
- **Visual direction:** less swampy green, more black, crimson, ash, and moonlit violet.
- **Gameplay:** 3-minute survival run, auto-attacking hero, upgrade choices, escalating waves.

## Controls

- **WASD / Arrows:** move
- **P / Esc:** pause
- **1 / 2 / 3:** pick an upgrade
- **Mobile:** virtual joystick on the left side

## Alpha 0.4 — HUD and brightness pass

- Removed the "Blood Moon Build" and top-bar 18+ gore badge. The tone and art stay dark fantasy; content positioning remains described in the README.
- Moved the XP gauge into a slim strip **above the playfield**, so it no longer overlays enemies or the HUD.
- Enlarged readability: lighter gray-purple graveyard tiles, clearer tombstones, lighter cracks, gentler vignette; rich crimson blood remains.
- Replaced the old sound on/off glyph with **MUTE ON / MUTE OFF** (an actual global mute).
- Added **MUSIC** and **SFX** volume sliders, 0–100, with independent levels and remembered settings.
- Music selection still supports three CC0 tracks streamed from OpenGameArt; playback depends on that server allowing playback.

## Tech

- Plain **HTML + CSS + JavaScript + Canvas 2D**.
- No frameworks and no required build step.
- Sprites are still rendered directly in code via `sprites.js`.

## Music sources

This build currently points to CC0 tracks from OpenGameArt:

- **Creepy** — TokyoGeisha (CC0)
- **Battle Theme** — Wolfgang_ (CC0)
- **Ancient Caverns (horror ambient loop)** — congusbongus (CC0)

If you want, these can later be downloaded, bundled locally into the repo, and credited on a dedicated credits screen.

## Run locally

Open `index.html` directly in a browser, or run a small server:

```bash
python -m http.server 8000
```

Then open `http://localhost:8000`.

## GitHub Pages

The repository should be **public**. Go to:

**Settings → Pages → Build and deployment**

Then choose:

- **Source:** Deploy from a branch
- **Branch:** `main`
- **Folder:** `/(root)`

After GitHub Pages finishes building, the site address should be:

**https://masterjimo.github.io/Noob-Survivors/**

## Next suggested steps

- Add dedicated enemy death animations.
- Add a separate **credits / content warning** screen.
- Replace hotlinked music with bundled local files.
- Add stronger weapon variety and mini-bosses.

## Notes on audio and content rating

- Music is currently **streamed from OpenGameArt URLs**, not packaged offline. Playback may fail if the source blocks hotlinking or the browser is offline. Choose a track, ensure MUTE is OFF, and adjust the music slider. Audio starts after a user interaction.
- The **18+ audience description is a voluntary content label** for fantasy gore, not a GitHub-enforced age gate or an official rating.
- All artwork is hand-drawn in code. The CC0 music files are third-party works; keep the source credits above when distributing.