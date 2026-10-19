# Noob Survivors — Alpha 0.8

Play: https://masterjimo.github.io/Noob-Survivors/

Browser-based gothic survival game (HTML, CSS, Canvas 2D, vanilla JavaScript).

## Alpha 0.8 changes
- Simplified start screen: hunter portrait, large title, start button, larger controls; removed promotional text and feature chips.
- Restored slow auto-targeted **projectile attacks** (142 world pixels/second) instead of the whip sweep, with actual projectile collision.
- Updated damage, fire-rate, multishot and piercing upgrades to match the projectile weapon.
- Kept hunter sprite, six standard enemies, Crimson Warden mini-boss, blood effects, XP, pause and upgrades.
- Ancient Caverns is the only music track (OpenGameArt CC0 by congusbongus). Default MUSIC 10% and SFX 5%; user preferences persist.

## Controls
- WASD / arrow keys — move
- P / Escape — pause
- 1, 2, 3 — choose upgrade
- Mobile — on-screen joystick
- Attacks are automatic

## Credits
- Original procedural sprites and art effects created for Noob Survivors.
- Music: [Ancient Caverns — congusbongus (CC0)](https://opengameart.org/content/ancient-caverns-horror-ambient-loop). Audio loads from OpenGameArt and requires network availability.

## Run & deploy
Open `index.html` locally, or host these files from the repository root using GitHub Pages (`main` branch, `/`). There is no build step.

## Arena background (0.9.1)

Replaced the procedural floor with the supplied **Seamless Gothic Courtyard of Ruins** (`assets/gothic-courtyard.png`). The map follows the camera and repeats with mirrored edges; the previous procedural drawing is retained as a loading fallback. Enemy sprites, perks, projectiles and balance are unchanged.


## v0.9.2 Crimson Heir deployment

- Playable hero uses user-provided reference sheet (idle, two walking frames, casting and attack).
- New files: `assets/crimson-heir-v092.png`, `assets/crimson-heir-portrait-v092.png`.
- Existing enemy art and mechanics unchanged.

## v0.10.0 — The Veilwarden
- Playable character replaced with The Veilwarden (idle, walking, casting and arcane slash frames).
- New hero sprites and menu portrait: `assets/veilwarden-v101.png` and `assets/veilwarden-portrait-v101.png`.
- No changes to enemy models, combat balance or arena.


## v0.10.3 — Opaque Veilwarden / projectile-only attacks
- Fixed missing character textures caused by an overly aggressive removal of dark colours from the sheet.
- Opaque HD atlas with idle and 3 walking poses is used in the game.
- Projectiles launch automatically; no attack animation is played.
- The menu uses the Veilwarden portrait.
