# Crimson Ruin: Age of Torment

**[▶ PLAY THE GAME](https://masterjimo.github.io/Crimson-Ruin-Age-of-Torment/)**

## Core mechanics

- A run lasts up to **30:00**; at 30:00 an invulnerable **Reaper** kills the hunter.
- Select one of four elements before combat; attacks automatically target nearby enemies. **Enemy spawning and the Reaper are disabled in the current empty-arena test build**; without enemy targets, auto-attacks do not fire.
- Starting stats: **100 HP**, movement speed **100**, **6% critical chance**, **×1.6 critical damage**. Base attack speed is determined by the selected element.
- Blue XP crystals grant levels. A level-up grants a power-up **without healing HP**. XP required for the next level after reaching level `L`: `floor(12 + 8L + 1.5L²)`.

## Elements

| Element | Base hit | Base attacks/s | Damage and status rules |
|---|---:|---:|---|
| **Blood** | **21.6** (+8%) | **1** | **Blood Spear:** slow **80 units/s** projectile with **unlimited pierce**. Every hit applies 1 Bleed stack (100% of hit damage over **8s**, max 8 stacks). The same enemy may be hit again after **0.6s** of continued contact. Piercing Fangs grants extra Bleed stacks per hit. |
| **Fire** | **43.2** (+8%) | **1** | **Fireball:** **290 units/s**, detonates on its first target, dealing direct damage there and applying Burn to **all** enemies within **55 units**. Burn = **43.2 DPS × 2s** at base, refreshed but not stacked. |
| **Lightning** | **Random 1–200** | **1** | **Chain Lightning:** strikes the first enemy then bounces **4 times** to distinct enemies within **120 units** of the previous target (up to **5 hits** initially). Each hit has **50%** Shock chance for **4s**. **Piercing Fangs** and **Spread Shot** add bounces, up to **25** per chain. **Forward Shot** launches up to **3 independent Chain Lightnings** per attack. |
| **Poison** | **0** | **2** | **Toxic Orb:** **210 units/s**. Its first impact splashes **1 permanent 15 DPS Poison stack** onto every enemy within **55 units**, matching Fireball. Each stack can crit. On death with **5+** stacks, Poison Proliferate spreads **5 stacks** to up to **6 enemies** within **55 units** (both radii gain **+10% per Piercing Fangs point**). No Proliferate text is shown; stacks remain unlimited. |

### Elemental damage formulas

Base shot interval is `1 / attacks per second`: **1.0s** for Blood, Fire and Lightning, and **0.5s** for Poison. Rapid Fire multiplies the selected element's attack speed normally.

- **Element Power:** Each upgrade adds `5% × rarity multiplier` to the base damage of the chosen element. Multiple bonuses **add**, rather than multiply.
- **Blood:** direct hit = `21.6 × (1 + Blood Power bonus) + flat damage`. Each Blood Spear collision adds `1 + Piercing Fangs points` Bleed stacks, each worth `actual hit damage / 8` DPS for 8 seconds, capped at **8 active stacks**. Spear pierces infinitely, with a **0.6s per-target repeat-hit cooldown** for each spear. Crits scale both the direct hit and Bleed.
- **Fire:** direct hit on first enemy = `43.2 × (1 + Fire Power bonus) + flat damage`. Every enemy within radius `55 × (1 + 0.1 × Piercing Fangs points)` gets a 2-second Burn. Burn DPS = `basic hit × 1.0`; subsequent explosions refresh rather than stack it. At base, the primary target takes **43.2 direct + 86.4 Burn** if the full Burn elapses; secondary targets receive Burn only.
- **Lightning:** each hit starts from the projectile's base roll `random integer 1–200 × (1 + Lightning Power bonus) + flat damage`, with independent crit and Shock rolls per enemy. From the first hit, bounce to the nearest unhit enemy within **120 units** of the last target; maximum `min(25, 4 + Piercing Fangs points + 2 × Spread Shot points)` bounces **per independent chain**. Forward Shot grants `min(3, 1 + Forward Shot points)` separate Chain Lightning projectiles, each with its own hit list and chaining. No repeated targets within one chain.
- **Poison:** Toxic Orb and Poison Proliferate radii = `55 × (1 + 0.1 × Piercing Fangs points)`; each enemy hit by the Toxic Orb blast gains one stack. Poison DPS = `15 × (1 + Poison Power bonus) × sum(crit multiplier of each stack)`. Individual stacks may crit (base ×1.6), are permanent, and have no count cap. At death with **5+** stacks, Poison Proliferate transfers **5 stacks** to up to **6 enemies** within the same blast radius, preserving average crit potency.

**Hemorrhagic Burst (Blood):** An independent **5% chance per four-card power-up offer** (including rerolls), available once per run. After selection, every Blood hit detonates Bleed immediately instead of leaving ticking stacks. Base area damage = `(8 + Piercing Fangs points) × hit damage` (**172.8** for an unmodified 21.6-damage hit with 0 Piercing Fangs points). Rarity adds `10% × (rarity multiplier − 1)` burst potency; the explosion does not spread Bleed.

## Power-ups and rarity

Every level-up offers **4 different cards**: one Attack, one Defense and two random. Each run includes **3 Rerolls** and **3 Banishes**; banished powers do not reappear that run. **Power-ups are element-specific where noted:** their effects can differ from the generic names.

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
| Forward Shot | **Blood / Fire / Poison:** +1 parallel projectile (+2 Legendary, +3 Mythic), max **3 extra**. **Lightning:** +1 independent Chain Lightning projectile per point, max **3 total** (2 extra); every chain has separate targets and bounces. |
| Spread Shot | **Blood / Fire / Poison:** +2 angled projectiles (+4 Legendary/Mythic), max **8 spread points**. **Lightning:** +2 chain bounces per spread point (+4 with Legendary/Mythic), **no angled shots**; max **25 combined bounces**. |
| Piercing Fangs | Grants **1 point** (+2 Legendary, +3 Mythic). **Blood:** +1 Bleed stack per hit and +1 stack worth of Hemorrhagic Burst damage; **Lightning:** +1 bounce per point, max **25 bounces** combined with Spread Shot; **Fire / Poison:** +10% area radius per point (including Poison Proliferate), max **4 points**. Blood Spear pierces every enemy. |
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
- **Easy Mode:** selectable before **every run**. Multiplies enemy HP, damage, speed, spawn pressure and aggression by **0.5** for that run; selection resets on returning to the mode-selection screen. **Hardcore Mode:** uses **×1** scaling.
- **Crimson Warden:** first appears after ~**51s** and may appear again from **119s** if the first is defeated. Its stats use the current difficulty multiplier.

## Shrines

| Shrine | Spawn timing | Mechanic |
|---|---|---|
| **Life Shrine** | **2** at run start, further spawn attempts every **42–64s**, max **4** active | Restores **1 HP/s for 30s**, capped at max HP; **no instant heal**. Collecting another refreshes duration rather than stacking. |
| **Magnet Shrine** | **Guaranteed at 00:45**. After each collection, the next spawns randomly **90–150s later**; max **1** active. | Instantly collects **all unclaimed map XP** and grants **15s of global XP collection** for new drops. |
| **Power Shrine** | **Guaranteed at 02:00**, then randomly **4–6 minutes after the previous pickup**; maximum **1** active. | Grants **1 Legendary (75%) or Mythic (25%) perk immediately**, without consuming XP or a level. **Hemorrhagic Burst has a 40% roll for Blood** until acquired; otherwise Element Power weighs **×5**, Critical Damage **×3**, and Forward Shot / Spread Shot / Piercing Fangs / Deadly Precision / Rapid Fire **×2**. Banned and capped perks cannot roll. |

## Music Credits

### Music

| Track | Artist | Source | License |
|---|---|---|---|
| Ancient Caverns | [congusbongus](https://opengameart.org/content/ancient-caverns-horror-ambient-loop) | [OpenGameArt](https://opengameart.org/content/ancient-caverns-horror-ambient-loop) | [CC0](https://creativecommons.org/publicdomain/zero/1.0/) |

### Sound Effects

| Element | Artist | Source | License |
|---|---|---|---|
| Blood | [_stubb](https://freesound.org/people/_stubb/) | [Freesound](https://freesound.org/people/_stubb/sounds/406582/) | [CC0](https://creativecommons.org/publicdomain/zero/1.0/) |
| Fire | [qubodup](https://freesound.org/people/qubodup/) | [Freesound](https://freesound.org/people/qubodup/sounds/442871/) | [CC0](https://creativecommons.org/publicdomain/zero/1.0/) |
| Lightning | [JoelAudio](https://freesound.org/people/JoelAudio/) | [Freesound](https://freesound.org/people/JoelAudio/sounds/136542/) | [CC0](https://creativecommons.org/publicdomain/zero/1.0/) |
| Poison | [qubodup](https://freesound.org/people/qubodup/) | [Freesound](https://freesound.org/people/qubodup/sounds/751338/) | [CC0](https://creativecommons.org/publicdomain/zero/1.0/) |
