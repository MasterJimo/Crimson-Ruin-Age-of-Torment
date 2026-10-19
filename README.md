# Noob Survivors — Alpha 0.12

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


## v0.10.0 notes
- Replaced the playable hero with **The Veilwarden** using the supplied reference sheet.
- Added dedicated gameplay frames for idle, walk, casting, and arcane slash attack.
- Replaced the menu portrait to match the new hero.


## v0.10.3 — Opaque playable Veilwarden
- Fixed transparent/patchy hero textures caused by erroneously removing dark clothes during mask extraction.
- Built a new opaque idle + three-frame walk atlas from the original beige-background model poses.
- Projectile auto-fire is unchanged and **does not trigger any casting/attack animation**.
- Updated on-screen portrait to the existing Veilwarden portrait and cache-busted scripts.

## v0.11.0 — Elemental Progression
- Added **blue crystal XP** and a blue XP progress strip.
- Added ability icons from the user's RPG icon sheet.
- Added the user's **Blood / Fire / Lightning / Poison** spell artwork.
- Choose your starting elemental projectile **before the run starts**: Blood, Fire, Lightning or Poison. The world starts only after selection.
- Introduced Blood Lance, slow Sanguine Orb, Hemorrhage, Cinder Veins, Volt Cascade and Venom Heart.
- The usual 3-card Reroll/Banish upgrade loop continues from the next level-up.
- See [Implementation plan](IMPLEMENTATION_PLAN.md) for the complete progression specification.

## v0.12 — Starting element, precise DOT rules, and interface cleanup
- **Choose Blood / Fire / Lightning / Poison immediately after Begin the Hunt, before combat**.
- Blood: **16 hit**, bleeding equal to **50% of hit** over **8 seconds**.
- Fire: **20 hit**, burns for an additional **100% of hit** over **2 seconds**.
- Lightning: **20 hit**, **50% chance to shock** for 4 seconds; follow-up direct hits deal **+100% damage (2×)**. Shock does not immobilize or amplify damage-over-time.
- Poison: **5 hit**, then **100 damage every 8 seconds forever**, until enemy death (does not stack; reapplied poison retains strongest DPS).
- The soundtrack **name is no longer displayed**, but Music 10% / SFX 5% sliders and mute remain.
- Footer controls are condensed into compact MOVE/PAUSE groups.
- Perk icons appear inside the provided **golden transparent frame** without cropped edges, including on phones.
- Existing elemental projectile sprites and blue XP shards remain.

[Exact status formulas and implementation order](ELEMENT_BALANCE.md)

## v0.12.1 — Lightning Shock correction
- Lightning now applies **Shock** for 4 seconds on a 50% proc, rather than Freeze.
- Hits against a shocked enemy are multiplied by 2 while the effect is active. The hit that first applies Shock does not receive the bonus. Shock refreshes on reapplication.
- Shock does not slow enemies, and does not amplify ticking damage-over-time.


## v0.13 — Curated 16 perks
- Exactly 12 universal perks + 4 school-specific Power perks. Only the selected element Power can roll.
- Forward Shot fires parallel bullets, Spread Shot fires a fan. Both stack.
- Single gold frame with uniform frameless icons.
- Status overlays: crimson Bleed, orange Burn, blue Shock, green Poison.
- See [16 perk descriptions](PERKS_V013.md).