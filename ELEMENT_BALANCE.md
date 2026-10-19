# Noob Survivors — Element Balance v0.12

The player chooses a primary element **before gameplay begins** (after clicking Begin the Hunt). A selection pauses the clock and the first enemies have not yet spawned. No reroll/banish is used on this choice. The first normal level-up offers three perk cards, with existing reroll and banish.

| Starting skill | Immediate hit | Extra status | Duration / rules |
|---|---:|---|---|
| Blood Bolt | 16 | Bleeding totaling **50% of hit** (8 base damage) | 8 seconds (1 DPS for an unmodified 16 hit) |
| Fire Bolt | 20 | Burning totaling **100% of hit** (20 base damage) | 2 seconds (10 DPS) |
| Lightning Bolt | 20 | **50% chance** to apply Shock for **4 seconds** | Direct hits against shocked enemies deal **+100% damage (2×)**; Shock does not stop movement and can be refreshed. Chain effects also benefit from Shock. |
| Poison Bolt | 5 | Poison deals **100 damage every 8 seconds** | Every hit adds **one permanent stack** worth 12.5 DPS; unlimited stacks until enemy death. At 200 stacks = 2,500 DPS |

## Upgrade paths

Normal perks remain: damage, rate, extra shot, projectile speed, pierce, survivability, magnet, crit, luck-like utilities, etc. Icons now sit inside the user-supplied gold frame.

- **Blood**: Blood Lance (+1 pierce), Sanguine Orb (slow explosive orb), Hemorrhage (area splash).
- **Fire**: Cinder Veins (longer burn at the same total burn damage), cross-element Hellfire proc perk.
- **Lightning**: Volt Cascade (higher chain chance), Stormbringer proc perk.
- **Poison**: Venom Heart (+35% poison DPS). Poison never expires, and stacks indefinitely. Each hit adds +12.5 DPS multiplied by current Poison Power. Existing stacks keep their previous strength.

Bleed/burn refresh on reapplication with their damage based on the latest hit; permanent poison hits add +1 stack and +12.5 DPS with no cap; Fire only refreshes one stack for two seconds. Critical hits and damage upgrades scale DOT through actual hit damage.

## Interface rules

- Only `MUSIC`, `SFX` sliders and `MUTE` at top; soundtrack name is not shown.
- Compact footer: `MOVE WASD / arrows` and `PAUSE P`.
- `REROLL` and `BANISH` continue working on normal level-ups.
- XP drops stay bright blue crystals.

## v0.12.1 — Lightning Shock correction
- Lightning now applies **Shock** for 4 seconds on a 50% proc, rather than Freeze.
- Hits against a shocked enemy are multiplied by 2 while the effect is active. The hit that first applies Shock does not receive the bonus. Shock refreshes on reapplication.
- Shock does not slow enemies, and does not amplify ticking damage-over-time.
## v0.13.1 — Endgame Poison / refresh-only Fire
- Poison: 5 base direct hit plus **12.5 DPS per permanent stack** (100 per 8 seconds), **no stack cap**.
- 1/10/200 Poison hits on one surviving enemy = 12.5/125/2,500 DPS.
- Poison Power increases only future stacks. Stacks never expire and require no per-stack timers or objects.
- Fire: **one active burn only**; subsequent hits reset its 2-second timer and retain the stronger burn DPS rather than adding stacks.
