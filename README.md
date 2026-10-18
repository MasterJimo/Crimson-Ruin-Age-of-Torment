# ✦ Noob Survivors — Blood Moon Build (Alpha 0.3)

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

## What changed in this build

- Full interface translated to **English**.
- Removed **"The Hollow Night"** label from the HUD center.
- Timer made **larger and more readable**.
- Reworked palette and UI toward a **crimson / black** dark-fantasy style.
- Added **stylized blood bursts**, **blood stains**, flattened **enemy corpses**, and type-specific scattered remains (bones, wings, cloth, spectral essence).
- Added **impact rings**, subtle camera shake on kills, cracked stone tiles and ritual sigils.
- Upgraded the overall rendering feel toward **cleaner pixel-HD presentation** by drawing smooth effects at twice the backing resolution while keeping the sprite artwork crisp.
- Added a **music selector** in the top bar.

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

- Music is currently **streamed from OpenGameArt URLs**, not packaged offline. Playback may fail if the source blocks hotlinking or the browser is offline. Choose a track and enable ♫ in the top bar.
- The **18+ indicator is a voluntary audience/content label** for fantasy gore, not a GitHub-enforced age gate or an official rating.
- All artwork is hand-drawn in code. The CC0 music files are third-party works; keep the source credits above when distributing.