# Crimson Ruin: Age of Torment — Element Balance v0.17

| Element | Direct hit | Status damage | Special rules |
|---|---:|---|---|
| Blood | **20** | **50% of actual hit** per Bleed stack, spread over 8 seconds (10 at base) | Each Blood hit always inflicts Bleed, max **8** independent active stacks; additional hits refresh the oldest. |
| Fire | **40** | **20 total Burn** over 2 seconds, 10 DPS | Only one Burn stack, resets its 2s timer on hit. Fire Power increases direct damage by 25% and Burn DPS by 20%. |
| Lightning | **Random integer 10–100** | No DoT | 50% Shock chance for 4 seconds; direct hits on shocked enemies deal double damage. Nearby Chain Lightning chance starts at 36%. |
| Poison | **0** | Each hit applies **permanent +13 DPS** (= 104 total every 8 seconds) | No stack cap or expiry. Poison Power makes *new* stacks 35% stronger per rank. |

## Hemorrhagic Burst (legendary Blood)
- **5% independent chance per complete level-up three-card offer** (and per Reroll), **not per card**; unavailable to other elements and after acquisition or Banish.
- **Every direct Blood hit instantly creates 8 full-damage Bleed stacks and explodes them all in a compact AoE** (8 × 50% of that hit).
- Base hit = 20 direct damage, explosion = **80 AoE damage**. Regular hit damage still applies.
- Explosion hits the original target and nearby enemies. It consumes the stacks, does not keep ticking and does not cause secondary Bleed chain reactions.
- Blood Power increases hit and hence Bleed/explosion damage by 25% per rank.

## Blood Fountains
- 20 flat instant HP (max HP cap) + 10s timed regen: 1 HP after 3s, 6s and 9s.
- Red activation circle radius 36 world units; buff timer next to player's HP bar.
- Buff refreshes rather than stacks and is granted even at full HP.

## UI
- Desktop only. Chest icon lower-left opens the Grimoire; shortcut O; P pauses. No on-screen Pause icon.
- README patch notes are in descending version order v0.17 through v0.8.

## v0.19 — Current Poison and difficulty
- Hero starts with 100 movement speed. Brutality has `can:p=>p.element!=='poison'` and never appears in Poison level-up cards.
- Poison base stack = 13 DPS. Poison Power rank `r` changes it to **13 × (1 + 0.20 × r) DPS**, affecting all currently applied stacks as well as every new stack. This is additive *base damage* growth, not the previous 35% buff to newly applied stacks.
- Normal enemy multipliers for minute `m`: HP = 1.15^m, attack damage = 1.12^m, speed = 1.06^m. Spawning starts ~2× higher, pressure grows each minute with active-enemy cap 230. AI pursuers flank and lead the player, including while stationary.
- Three consecutive deaths before 05:00 (tracked in localStorage) trigger an optional YES/NO offer on the next run before the starting-element screen. Easy applies 0.5× enemy HP/damage/speed, reduced spawns and movement pressure. Scoreboard marks the run. Pink ribbon sprite is rendered on the hero; Death Reaper remains unavoidable at 30 minutes.
- Art: `assets/death-reaper-v019.webp` (user-selected Gothic Reaper), `assets/easy-ribbon-v019.webp` (user-supplied magenta bow), both optimized transparent WebP images.
