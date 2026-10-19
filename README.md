# Crimson Ruin: Age of Torment

A dark-fantasy desktop arena-survival game, formerly **Noob Survivors**. Built in HTML, CSS, Canvas 2D and JavaScript.

[![▶ PLAY CRIMSON RUIN](https://img.shields.io/badge/%E2%96%B6_PLAY-Crimson_Ruin_%3A_Age_of_Torment-8b243b?style=for-the-badge)](https://masterjimo.github.io/Crimson-Ruin-Age-of-Torment/)

**[▶ PLAY THE GAME](https://masterjimo.github.io/Crimson-Ruin-Age-of-Torment/)** · [GitHub repository](https://github.com/MasterJimo/Crimson-Ruin-Age-of-Torment)

## Current gameplay — v0.17

Survive a three-minute run. Collect blue XP crystals, level up and choose perks. Before combat, pick one of four elements; attacks automatically target enemies.

| Element | Starting direct damage | DoT / special behavior |
|---|---:|---|
| **Blood** | **20** | Every hit applies Bleed equal to **50% of its hit** over 8 seconds. **8-stack cap** on each enemy; excess hits refresh the oldest stack. |
| **Fire** | **40** | **One Burn** only: **20 extra damage over 2 seconds** (10 DPS), refreshed by further hits, never stacked. |
| **Lightning** | **Random 10–100** per projectile | **50%** Shock chance for **4 seconds**. Direct hits against shocked enemies deal **×2** damage; a Chain Lightning proc can damage another nearby target. |
| **Poison** | **0** | Every hit adds a **permanent, unlimited 13 DPS stack** (= 104 damage every 8 seconds). Each hit adds another stack; they never expire while the enemy lives. |

### Hemorrhagic Burst — legendary Blood perk (5%)

**Hemorrhagic Burst appears with an independent 5% chance per complete level-up offer (three cards), including Rerolls.** Only Blood players can roll it, and the perk appears at most once per run after acquisition. When selected, **every subsequent Blood hit instantly produces eight Bleed stacks and detonates all eight** in a short-range explosion for their full combined base damage. A 20-damage Blood hit therefore also causes an **80-damage AoE burst** (eight stacks × 50% of 20) before crits or other damage modifiers. The stacks are consumed immediately and do not keep ticking. Existing Bleed stacks on that target are replaced; the burst does not apply new Bleed to nearby targets.

Power upgrades remain useful: **Blood Power** increases the direct hit and resulting Bleed damage by 25% per rank; **Fire Power** boosts its direct hit by 25% and Burn potency by 20%; **Lightning Power** boosts its random hit range by 25% and chain chance by 10 percentage points; **Poison Power** boosts the DPS of future Poison stacks by 35% per rank. Normal global perks, projectile modifiers and critical hits still work as documented in game.

### Blood Fountains

Two separated Blood Fountains spawn at the start, with more appearing during exploration. Enter a fountain's **red interaction circle** to consume it automatically. It restores **20 flat HP**, up to maximum HP, and gives **10 seconds of Fountain Regeneration**: +1 HP at the 3rd, 6th and 9th second. A buff timer appears beside the HP bar. Picking up another fountain refreshes (rather than stacks) the buff. A fountain is still usable at full HP for its regen. Filling the XP bar and leveling up also grants 20 HP.

## Desktop controls

- **WASD / arrow keys** — movement; attacks fire automatically.
- **P / Escape** — pause/resume.
- **O** — open/close the Power-Up Grimoire; Escape closes it too.
- **1–4** — initial element; **1–3** — level-up upgrade; **R** — reroll; **B** — banish.
- Click the small **chest at the lower-left of the arena** to access the grimoire. The redundant on-screen Pause button was removed.

## Run and deploy

Open `index.html` in a browser or serve the repository root from `main` using GitHub Pages. No build step. This is a desktop-only game.

## Credits

Art includes the supplied Veilwarden, arena, fountain and RPG icons. Music: [Ancient Caverns — congusbongus (CC0)](https://opengameart.org/content/ancient-caverns-horror-ambient-loop), loaded from OpenGameArt over the network.

---

## Patch notes — newest first

### v0.17 — Rebalance, legendary Hemorrhagic Burst and Blood Fountain buffs
- **Blood:** 20 direct damage, guaranteed 8-second Bleed and eight permanent maximum *slots* (individual Bleed stacks still expire after eight seconds).
- **Hemorrhagic Burst:** legendary Blood-only perk, **5% chance per full level-up draw / Reroll**. After acquisition every Blood hit creates and instantly detonates eight stacks, dealing their full combined damage in an AoE.
- **Fire:** 40 direct; one Burn worth 20 damage over two seconds, refreshed on hit.
- **Lightning:** randomized 10–100 direct damage; Shock remains 50% chance, lasts four seconds and doubles direct damage taken while active.
- **Poison:** no direct damage; each unlimited permanent stack adds **13 DPS** (104 damage per eight seconds).
- **Blood Fountains:** +20 HP and 10s of regeneration (+1 HP at 3, 6 and 9 seconds), automatic interaction inside a red circle and a status indicator beside HP.
- Replaced the grimoire star with a lower-left **chest**; removed the on-screen Pause button.
- Updated Play button and links for the renamed GitHub repository.

### v0.16 — Desktop-only controls
- Removed mobile joystick, touch controls, mobile HTML and mobile CSS.
- Changed inventory shortcut from Tab to **O**; P remains Pause.
- Renamed repository to `MasterJimo/Crimson-Ruin-Age-of-Torment`.

### v0.15 — Title and Power-Up Grimoire
- Renamed game to **Crimson Ruin: Age of Torment** across menu, page title and docs.
- Blood-droplet and upgraded Blood icons replaced earlier heart artwork.
- Added a paused grimoire with acquired upgrades, ranks and live combat stats.

### v0.14.1 — Bleed and early Hemorrhagic Burst
- Added Blood Bleed stacks and the original eight-stack explosion upgrade (reworked in v0.17).
- Blood Power began scaling both direct hit and Bleed; stack counters became visible.

### v0.14 — Healing fountains and level-up HP
- XP level-ups began healing 20 HP.
- Added two initial healing fountains, subsequent spawns and off-screen direction arrows.
- Removed the unexplained Warden-death heal.

### v0.13.1 — Permanent Poison and single Fire Burn
- Introduced unlimited Poison stacks and a green stack counter.
- Fire's Burn became single-stack and refreshable.

### v0.13 — Sixteen curated perks
- Introduced element-dependent upgrades, Forward Shot, Spread Shot, Knowledge, Soul Magnet and other core perks.
- Standardized the skill icons inside one golden frame; colored Bleed, Burn, Shock and Poison effects.

### v0.12.1 — Lightning Shock
- Replaced freezing with 50% Shock chance lasting four seconds. Targets under Shock take ×2 subsequent direct damage.

### v0.12 — Element selection and DoT
- Added Blood / Fire / Lightning / Poison selection before combat, each with distinct status mechanics.
- Simplified audio and HUD controls.

### v0.11 — Elemental Progression
- Added blue XP crystals, icon atlas and themed elemental projectile visuals.
- Introduced elemental upgrade paths, Reroll and Banish.

### v0.10.3 — Opaque Veilwarden
- Fixed transparent clothing, added opaque idle/walk sprites and preserved attack-free auto-fire.

### v0.10.0 — The Veilwarden
- Introduced Veilwarden sprite set, walking and portrait.

### v0.9.2 — Crimson Heir
- Added Crimson Heir character art and portrait.

### v0.9.1 — Gothic Courtyard
- Replaced the procedural floor with the user-supplied repeatable Gothic Courtyard image.

### v0.8 — Survival and projectiles
- Simplified the start screen, restored slow auto-targeting projectiles and actual projectile collisions.
- Retained the Crimson Warden, enemies, XP, perk progression, music and blood effects.
- Set Ancient Caverns as soundtrack with MUSIC 10% and SFX 5%.

*Older notes describe the game as it existed then. For current damage numbers, use the v0.17 table above.*
