# Crimson Ruin: Age of Torment

A dark-fantasy desktop **30-minute** arena-survival game, formerly **Noob Survivors**. Built in HTML, CSS, Canvas 2D and JavaScript.

[![▶ PLAY CRIMSON RUIN](https://img.shields.io/badge/%E2%96%B6_PLAY-Crimson_Ruin_%3A_Age_of_Torment-8b243b?style=for-the-badge)](https://masterjimo.github.io/Crimson-Ruin-Age-of-Torment/)

**[▶ PLAY THE GAME](https://masterjimo.github.io/Crimson-Ruin-Age-of-Torment/)** · [GitHub repository](https://github.com/MasterJimo/Crimson-Ruin-Age-of-Torment)

## Current gameplay — v0.22

Survive up to a **30-minute run** in the new hardcore difficulty; at 30:00 the Reaper inevitably claims the hunter. Collect blue XP crystals, level up and choose perks. Before combat, pick one of four elements; attacks automatically target enemies.

| Element | Starting direct damage | DoT / special behavior |
|---|---:|---|
| **Blood** | **20** | Every hit applies Bleed equal to **50% of its hit** over 8 seconds. **8-stack cap** on each enemy; excess hits refresh the oldest stack. |
| **Fire** | **40** | **One Burn** only: **20 extra damage over 2 seconds** (10 DPS), refreshed by further hits, never stacked. |
| **Lightning** | **Random 10–100** per projectile | **50%** Shock chance for **4 seconds**. Direct hits against shocked enemies deal **×2** damage; a Chain Lightning can damage another nearby target **only after an appropriate upgrade** (no free chain at level 1). |
| **Poison** | **0** | Every hit adds a **permanent, unlimited 13 DPS stack** (= 104 damage every 8 seconds). Each hit adds another stack; they never expire while the enemy lives. |

### Hemorrhagic Burst — unique Blood perk (5% appearance)

**Hemorrhagic Burst appears with an independent 5% chance per complete four-card level-up offer, including Rerolls.** Only Blood players can roll it, and the perk appears at most once per run after acquisition. When selected, **every subsequent Blood hit instantly produces eight Bleed stacks and detonates all eight** in a short-range explosion for their full combined base damage. A 20-damage Blood hit therefore causes an **80-damage base AoE burst** (eight stacks × 50% of 20); rarity upgrades its burst potency before other modifiers. The stacks are consumed immediately and do not keep ticking. Existing Bleed stacks on that target are replaced; the burst does not apply new Bleed to nearby targets.

**Element Power** perks scale according to the rarity of the specific card picked. At **Common / Magic / Rare / Legendary / Mythic** respectively: Blood and Fire increase their direct hit by **+10% / +20% / +40% / +80% / +160%**, Lightning similarly boosts its random hit range, and Poison increases its base stack DPS by **+5% / +10% / +20% / +40% / +80%** (additive across picks, updating existing and new stacks). Fire Power also scales Burn potency; Lightning Power increases chain chance. Element upgrade rank still controls special attack unlocks. Hemorrhagic Burst retains its separate 5% appearance chance but also receives a rolled rarity for its burst strength. Normal perks, projectile modifiers and critical hits continue to work as documented in game.

### Life Shrines and rare Magnet Shrines

Two separated **Life Shrines** spawn at the start, with more appearing roughly every 42–64 seconds. Enter a Life Shrine's **red interaction circle** to consume it automatically. There is **no instant healing** from the shrine; instead it grants **30 seconds of +1 HP per second**, capped by the player's max HP. Recollecting refreshes the duration rather than stacking. The remaining time is shown beside the HP bar. Leveling up still heals 20 HP.

**Magnet Shrines** are much rarer: no starting spawn, first possible after 4–6 minutes, and subsequent spawns roughly every 5–8 minutes; at most one is active at a time. Enter its **blue interaction circle** to activate. The shrine **immediately absorbs all currently uncollected XP crystals anywhere on the map** and gives **15 seconds of global XP collection**, automatically collecting any new crystal drops regardless of distance. The blue magnet buff timer displays next to HP. Enough XP to earn multiple levels queues their upgrade choices one by one, without wasting XP.

## Desktop controls

- **WASD / arrow keys** — movement; attacks fire automatically.
- **P / O** — pause the game and open the **Power-Up Grimoire**; P, O or Escape closes it and resumes. Clicking the chest does the same.
- **After your first death before 05:00**, the scoreboard offers **Easy Mode: YES / NO** beside **New Game**. YES immediately starts the next run in Easy Mode; NO immediately starts a normal run. New Game also starts normal mode. The choice applies **only to that next run**, not future runs.
- **1–4** — initial element and level-up upgrade (four cards: Attack, Defense, two Random); **R** — reroll; **B** — banish.
- Click the **chest in the upper-left toolbar**, opposite the MUSIC / SFX / MUTE audio controls, to pause and open the Grimoire.

## Run and deploy

Open `index.html` in a browser or serve the repository root from `main` using GitHub Pages. No build step. This is a desktop-only game.

## Credits

Art includes the supplied Veilwarden, arena, fountain, RPG icons, new Death boss artwork and magenta Easy Mode ribbon. Music: [Ancient Caverns — congusbongus (CC0)](https://opengameart.org/content/ancient-caverns-horror-ambient-loop), loaded from OpenGameArt over the network.

---

## Patch notes — newest first

### v0.22 — Five rarity variants, shared pause/Grimoire, speed cap
- Moved the inventory chest from the game arena's bottom-left to the **upper-left toolbar**, opposite audio controls.
- **P and O are equivalent:** either pauses the hunt and opens the Grimoire. P/O/Escape or closing the Grimoire resumes. Switching away from the game also pauses and opens it, without stealing focus.
- Each of the four level-up cards **independently rolls a rarity**, with color-coded borders: **Common** (white, 54%), **Magic** (light blue, 25%), **Rare** (yellow, 15%), **Legendary** (dark bronze, 5%), **Mythic** (bright glowing violet, **1%**). Rerolls use the same odds.
- Every regular power-up now has an effect that scales with its selected rarity (multipliers 1× / 2× / 4× / 8× / 16× for baseline effects), with separate calculations for projectile perks and capped stats. The four-slot guarantee (Attack, Defense, two Random) remains.
- **Shadow Stride** grants +5% / +10% / +20% / +40% / +80% of **base movement speed (100)** by rarity, **additively** and with a hard final cap of **200 speed**. Once capped, Shadow Stride is removed from the eligible level-up pool.
- **Hemorrhagic Burst** remains Blood-only, with an **independent 5% appearance chance per complete four-card roll**; when offered it also rolls a rarity, affecting burst damage.
- Inventory and final results now record the actual rarity of each power-up earned, including repeated selections of the same upgrade.


### v0.21 — Four upgrade choices, ribbon polish and one-screen end results
- Every level-up and reroll now offers **four unique powers**: guaranteed **ATTACK**, guaranteed **DEFENSE**, then **two RNG** choices. Reroll and Banish preserve the offensive and defensive categories. Blood's legendary Hemorrhagic Burst retains one 5% chance per whole offer.
- Repositioned the Easy Mode ribbon closer to the character's head. The final scoreboard explicitly identifies **EASY MODE USED** and displays the pink ribbon for an Easy run.
- Replaced the stone arena with the newly supplied cleaner `new.png` map.
- Cleaned the intro: removed duplicate text underneath Begin the Hunt and moved the WASD/P/O controls higher, with larger, bolder styling. Removed the redundant bottom keyboard footer.
- Redesigned the results as a compact three-column dashboard with score, hunter stats and acquired perk badges all on one screen; New Game and Easy Mode sit below the results header. XP bar hides at game over.
- Updated README and asset cache version.


### v0.20 — Visible scoreboard actions, Life Shrines and rare Magnet Shrines
- Moved **NEW GAME** to the upper-left and the **Easy Mode YES / NO** panel to the upper-right of the death screen. Controls stay visible at the top while scrolling the more compact results screen.
- Early defeat (before **05:00**) offers **Easy Mode** immediately; Yes starts the next run in Easy, No or New Game starts Hardcore. Choice never persists beyond that one run.
- **Life Shrine:** removed the old flat +20 HP reward. Grants **+1 HP every second for 30 seconds**, capped at full HP, with a visible timer beside the health bar. Shrine pickups refresh the 30s buff.
- Added the new rare **Magnet Shrine** using the supplied artwork. Appears much less often than Life Shrines. Pickup instantly collects all existing world XP, then grants **15 seconds of automatic map-wide XP collection**, including new enemy drops; buff visible beside HP.
- Fixed bulk XP collection to properly offer each earned level-up in sequence.
- No mobile controls added.


### v0.19.1 — Stable pause, New Game, one-run Easy Mode
- Fixed the endlessly shaking screen while paused: the draw loop no longer rolls random camera offsets without running physics, and gameplay animations freeze while paused, in the Grimoire and on the score screen.
- Added a **NEW GAME** button to the scoreboard for a fresh regular run.
- **Easy Mode is now offered right on the results screen after any first death before 05:00**. No three-failure streak, no separate pre-element modal and no save-data requirement.
- Results display an explicit choice beside New Game: **YES · EASY MODE** or **NO · HARDCORE**. Either choice immediately starts the **next** run at element selection, with the mode set for this run only.
- The offer explains all next-run consequences: enemies have 50% HP, damage and speed, reduced aggression and spawn pressure, and the hunter wears the pink ribbon; the 30-minute Reaper is still unavoidable.
- Easy Mode is reset on each other new game, including the regular **New Game** button.


### v0.19 — Hardcore escalation, Poison Power and optional Easy Mode
- **Poison:** Brutality is no longer offered. Poison Power is now +20% of the base 13 DPS per rank, additive (13 → 15.6 → 18.2 → 20.8 DPS per stack). Both existing and new stacks use the upgraded base value.
- Base hero movement speed reduced to **100**.
- First minute has roughly **double the original enemy pressure**. Each minute increases enemy HP by ×1.15, damage by ×1.12 and speed by ×1.06, with increasing spawn pressure. Chasers, flankers and interceptors now try to surround the hero.
- After **three consecutive deaths before 05:00**, the next start presents an optional **Easy Mode: YES / NO** prompt before element selection. Any run lasting at least 05:00 resets the streak; the streak survives refreshes in localStorage.
- Easy Mode uses 50% monster health, attack damage and movement speed, fewer spawns and reduced aggression. A **pink ribbon** appears on the player's main model. The 30:00 Reaper remains unavoidable.
- The supplied final **Death Reaper** and **Enchanted Magenta Gothic Ribbon Ornament** are now included as transparent, game-sized WebP sprites.


### v0.18.1 — Consistent damage types and elemental icons
- Fixed missing Blood, Fire, Lightning and Poison icons in the Grimoire's **Your Element** gold frame. The same unframed icon atlas is used for selection, power-ups and inventory.
- Standardized damage stats: **DIRECT HIT** for hit-only spells (Lightning), **DAMAGE OVER TIME** for DoT-only spells (Poison), and both fields for hybrid spells (Blood and Fire).
- Poison's selection and Grimoire text is now exactly **“13 Damage over time for 8s. Infinite scaling”** with **Infinite scaling** emphasized visually.
- Stats are derived from the character's currently selected element and upgrades: Blood Bleed = half the hit across 8s, Fire Burn = 20 × Burn multiplier across 2s, Poison = 13 × Poison multiplier DPS per permanent stack.
- No damage values, status rules, timers or enemy mechanics were changed.


### v0.18 — Thirty-minute Reaper finale and scoreboard
- Increased the run cap to **30:00**. At exactly 30 minutes the game clock stops; invulnerable Death rushes in at unavoidable speed and kills the hero.
- Final scoreboard for every run: XP earned, kills, level, recovered HP, total damage, current combat stats, acquired perks and personal best (duration, kills, XP).
- Fixed Lightning's start description to **“Damage 10–100 hit · 50% Shock for 4s; shocked targets take double damage”**.
- Removed the accidental free 36% Chain Lightning chance at level 1; chain requires a relevant upgrade.
- Death renderer prefers `assets/death-reaper-v018.png` for the latest selected Death artwork, with an original silhouette fallback if the binary artwork has not been uploaded yet.


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

*Older notes describe the game as it existed then. For current damage numbers, use the current gameplay table above.*
