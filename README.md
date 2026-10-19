# Crimson Ruin: Age of Torment

**[▶ PLAY THE GAME](https://masterjimo.github.io/Crimson-Ruin-Age-of-Torment/)**

## Core mechanics

- A run lasts up to **30:00**; at 30:00 an invulnerable **Reaper** kills the hunter.
- Select one of four elements before combat; attacks automatically target nearby enemies.
- Starting stats: **100 HP**, movement speed **100**, **1.55 attacks/s**, **6% critical chance**, **×1.6 critical damage**.
- Blue XP crystals grant levels. A level-up restores up to **20 HP** and grants a power-up. XP required for the next level after reaching level `L`: `floor(12 + 8L + 1.5L²)`.

## Elements

| Element | Base hit | Damage and status rules |
|---|---:|---|
| **Blood** | **20** | Every hit applies Bleed equal to **50% of actual hit damage over 8s**. Up to **8 independent stacks** on each enemy; further hits replace the oldest stack. |
| **Fire** | **40** | Applies one refreshing Burn worth **50% of the basic hit over 2s** (base: **20 total / 10 DPS**). Burn cannot stack. |
| **Lightning** | **Random 1–200** | Each hit has **50% Shock chance** for **4s**. Shocked enemies take **×2 direct-hit damage**; DoT is unaffected. |
| **Poison** | **0** | Every hit applies a **permanent 15 DPS stack**, equivalent to **120 damage over 8s**. Stacks have no count or duration limit. |

### Elemental damage formulas

- **Element Power:** Each upgrade adds `5% × rarity multiplier` to the base damage of the chosen element. Multiple bonuses **add**, rather than multiply.
- **Blood:** basic hit = `20 × (1 + Blood Power bonus) + flat damage`. Bleed DPS per stack = `actual hit damage × 0.5 / 8`. Bleed therefore scales with flat damage, Blood Power, crits and other direct-hit modifiers.
- **Fire:** basic hit = `40 × (1 + Fire Power bonus) + flat damage`. Burn DPS = `basic hit × 0.5 / 2`. Burn scales with flat damage and Fire Power, but not critical damage or Shock.
- **Lightning:** hit = `random integer 1–200 × (1 + Lightning Power bonus) + flat damage`, followed by applicable direct-hit modifiers.
- **Poison:** total DPS = `number of stacks × 15 × (1 + Poison Power bonus)`. Existing stacks also gain the bonus. Flat damage is unavailable to Poison.

**Hemorrhagic Burst (Blood):** An independent **5% chance per four-card power-up offer** (including rerolls), available once per run. After selection, every Blood hit immediately creates and detonates 8 Bleed stacks in an area instead of leaving ticking stacks. Base area damage = `8 × (hit damage × 0.5) = 4 × hit damage`. Rarity adds `10% × (rarity multiplier − 1)` burst potency; the explosion does not spread Bleed.

## Power-ups and rarity

Every level-up offers **4 different cards**: one Attack, one Defense and two random. Each run includes **3 Rerolls** and **3 Banishes**; banished powers do not reappear that run.

| Rarity | Chance per card | Multiplier `u` | Element Power |
|---|---:|---:|---:|
| Common | 54% | ×1 | +5% |
| Magic | 25% | ×2 | +10% |
| Rare | 15% | ×4 | +20% |
| Legendary | 5% | ×8 | +40% |
| Mythic | 1% | ×16 | +80% |

| Power-up | Effect per pickup (`u` = rarity multiplier) |
|---|---|
| Brutality | +`5u` flat damage (Blood, Fire, Lightning); also scales Blood Bleed and Fire Burn |
| Rapid Fire | Attack rate ×`(1 + 0.06u)` |
| Shadow Stride | +`5u` movement speed, max **200** |
| Vitality | +`10u` maximum HP and heal up to `10u` HP |
| Regeneration | +`0.1u` HP/s, max **2 HP/s** |
| Iron Will | Multiplicative incoming-damage reduction by up to `3u%` per pick, max **80%** total reduction |
| Forbidden Knowledge | XP gained ×`(1 + 0.08u)` |
| Soul Magnet | Crystal pickup radius ×`(1 + 0.10u)` |
| Forward Shot | +1 parallel projectile (+2 Legendary, +3 Mythic), max **3 extra** |
| Spread Shot | +2 angled projectiles (+4 Legendary/Mythic), max **8 spread ranks** |
| Piercing Fangs | +1 pierce (+2 Legendary, +3 Mythic), max **4** |
| Deadly Precision | +`3u%` critical chance, max **85%** |
| Critical Damage | +`10u%` critical damage multiplier, no cap |
| Blood / Fire / Lightning / Poison Power | +`5u%` of elemental base damage, additive, max **5 picks** for the chosen element |

## Difficulty scaling

Let `m = floor(elapsed seconds / 60)`, capped at **29**. Enemies scale every minute and gain an additional five-minute tier modifier:

| Stat | Formula |
|---|---|
| Enemy HP | `base HP × 1.15^m × tier HP` |
| Enemy damage | `base damage × 1.12^m × tier damage` |
| Enemy speed | `base speed × 1.06^m × tier speed` |
| Spawn pressure | `min(60, min(10, 2 × 1.18^m) × tier spawn)` |
| Flanking aggression | `tier aggression multiplier` |

| From | Tier HP | Tier damage | Tier speed | Tier spawn | Tier aggression | Additional ambush |
|---|---:|---:|---:|---:|---:|---:|
| 00:00 | ×1 | ×1 | ×1 | ×1 | ×1 | — |
| **05:00** | ×2.8 | ×2.4 | ×1.4 | ×2 | ×1.4 | 14 |
| **10:00** | ×4.8 | ×4.2 | ×1.65 | ×2.6 | ×1.7 | 18 |
| **15:00** | ×8 | ×7.2 | ×1.9 | ×3.2 | ×2 | 22 |
| **20:00** | ×13 | ×12 | ×2.1 | ×4 | ×2.3 | 26 |
| **25:00** | ×20 | ×18 | ×2.3 | ×5 | ×2.6 | 30 |

These are **total tier multipliers**, not multipliers compounded across earlier five-minute tiers. At each threshold, existing enemies gain the next tier's stats immediately (preserving their HP percentage), and a ring of additional enemies spawns if there is room.

- Regular enemy spawn distance: **225–345** before 05:00, **170–255** from 05:00 and **145–225** from 10:00.
- Each spawn batch contains up to **12 enemies**. Interval: `max(0.045, 0.5 / sqrt(max(1, spawn pressure)))` seconds. Maximum **230 active enemies**.
- **Easy Mode:** multiplies enemy HP, damage, speed, spawn pressure and aggression by **0.5**. Available for the next run when the player dies before 05:00; resets afterward.
- **Crimson Warden:** first appears after ~**51s** and may appear again from **119s** if the first is defeated. Its stats use the current difficulty multiplier.

## Shrines

| Shrine | Spawn timing | Mechanic |
|---|---|---|
| **Life Shrine** | **2** at run start, further spawn attempts every **42–64s**, max **4** active | Restores **1 HP/s for 30s**, capped at max HP; **no instant heal**. Collecting another refreshes duration rather than stacking. |
| **Magnet Shrine** | **Guaranteed at 00:45**. After each collection, the next spawns randomly **90–150s later**; max **1** active. | Instantly collects **all unclaimed map XP** and grants **15s of global XP collection** for new drops. |
| **Power Shrine** | **Guaranteed at 02:00**, then randomly **4–6 minutes after the previous pickup**; maximum **1** active. | Grants **1 Legendary (75%) or Mythic (25%) perk immediately**, without consuming XP or a level. **Hemorrhagic Burst has a 40% roll for Blood** until acquired; otherwise Element Power weighs **×5**, Critical Damage **×3**, and Forward Shot / Spread Shot / Piercing Fangs / Deadly Precision / Rapid Fire **×2**. Banned and capped perks cannot roll. |
