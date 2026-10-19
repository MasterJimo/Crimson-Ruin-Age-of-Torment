# Crimson Ruin: Age of Torment

A dark fantasy arena survival game (formerly Noob Survivors).


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
- Poison: **5 hit**, then **100 damage every 8 seconds forever**, until enemy death (unlimited permanent stacks; each hit adds 12.5 DPS).
- The soundtrack **name is no longer displayed**, but Music 10% / SFX 5% sliders and mute remain.
- Footer controls are condensed into compact MOVE/PAUSE groups.
- Perk icons appear inside the provided **golden transparent frame** without cropped edges.
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

## v0.13.1 — Infinite Poison stacks / single Fire burn
- Every Poison projectile hit adds **one permanent stack**: +12.5 DPS per stack at base power (100 damage per 8 seconds). No expiration or stack cap; 200 base stacks = 2,500 DPS.
- Poison Power strengthens stacks applied **after** that upgrade. Existing stacks keep their potency.
- A green `×N` counter above poisoned enemies shows accumulated stacks.
- Fire remains single-stack: each hit refreshes the two-second burn and retains the strongest current DPS.
- Other status rules remain unchanged.


## v0.14 — Blood Fountains & predictable healing
- Every genuine experience **level-up instantly heals up to 20 HP** (never above max HP).
- The first starting-element selection is **not** a level-up and grants no healing.
- The hidden **+22 HP on Crimson Warden death** has been removed; the boss still drops bonus XP.
- Unused hidden on-hit lifesteal code is removed. HP may still recover through explicitly chosen **Vitality** or **Regeneration** perks.
- Two Blood Fountains spawn around the starting area at separated locations. Further fountains appear during exploration every **42–64 seconds** (first after ~44–60 seconds), with up to four active at once and a minimum spacing of **720 world units**.
- Walk within **34 world units** to consume one for up to **40 HP**, but a full-health player will not consume it.
- A small ruby pointer near the edge of the screen leads to the nearest off-screen fountain when within **1,760 world units** (around two to three screen widths).
- The visual uses the supplied *HP Pool* PNG, resampled to a compact transparent PNG in `assets/blood-fountain-v014.png`.
## v0.14.1 — Blood Bleed stacks & Hemorrhagic Burst
- Blood stacks Bleed independently, up to **4** stacks per enemy (8 seconds per stack; 50% of the applying hit over the duration). More Blood hits refresh the oldest stack at the normal cap.
- **Hemorrhagic Burst** (Blood-only perk with a heart-up icon) upgrades the stack limit to 8, then consumes all eight in a close-range explosion. Damage = sum of all eight stacks' full original Bleed totals, delivered immediately to enemies around the target.
- **Blood Power** continues to scale the hit and therefore its associated Bleed stack proportionally.
- A crimson ×N indicator shows current Bleed stacks. Poison and Fire stacking rules remain unchanged.


## v0.15 — Title, Blood icons and O grimoire
- Game renamed to **Crimson Ruin: Age of Torment** (UI, browser tab and documentation).
- Blood's original heart icon is replaced by an original crimson droplet; Blood Power and Hemorrhagic Burst show a droplet with an upward gold arrow.
- During a run press **O** or use the small **✧** button near Pause to open a read-only grimoire. Gameplay pauses until O, ESC, or Close.
- The grimoire lists the selected element, each acquired power-up and its rank, effect descriptions, and live stats (hit, fire rate, move speed, projectile count, pierce, crit, armor, XP bonus, pickup range, regen, health, Bleed cap).
- Power-up ranks are tracked per run and reset correctly on restart. Perks you banish do not appear as acquired.
- Game repository remains at its previous GitHub address until renamed manually in Settings; a repository rename also changes the GitHub Pages URL.

## v0.16 — Desktop-only controls
- Removed the touch joystick, touch/pointer controller, mobile markup, and mobile-specific CSS breakpoints. Crimson Ruin is now intentionally desktop-only.
- **WASD / arrow keys**: movement. **P**: pause. **O**: toggle the power-up grimoire. **ESC**: close grimoire. Mouse buttons support menu, upgrades, and optional overlay controls.
- The previous grimoire binding has been removed and Tab is available for normal browser keyboard focus.
- Repository was renamed to `MasterJimo/Crimson-Ruin-Age-of-Torment` externally. Changes are committed to the renamed repository.
