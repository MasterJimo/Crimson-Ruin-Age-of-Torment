# Crimson Ruin: Age of Torment

**[▶ PLAY THE GAME](https://masterjimo.github.io/Crimson-Ruin-Age-of-Torment/)**

## Ability-name and audio-default update

The Blood-exclusive perk is now named **Hemorrhagic** in all player-facing text, including the power-up card, the encyclopedia and documentation. Its combat effects and internal identifier remain unchanged. New players begin with **SFX at 1%**. Existing saved sound preferences are respected and will not be reset.

## Single-row utility HUD

During gameplay, the upper bar now contains a clickable **kills / level** display on
the left (opens Character Stats / Encyclopedia), the **HP meter** immediately
beside it, a smaller **fixed centered clock**, and the audio controls at the
right. The old chest icon and duplicate arena overlays are gone. Large kill
totals are compacted (for example `12.4K` or `1.2M`); the full count is still
available via hover, and the original value is used for scoring. On narrower
screens the audio controls wrap into a second header row, while the timer
remains in a stable grid cell.

## Courtyard texture clarity

The original gothic courtyard artwork remains unchanged. Once its WebP texture
loads, the game builds a **slightly sharper version** in a temporary Canvas
using a weak five-sample unsharp mask (strength `0.18`) and a small contrast
increase (`1.025`). The enhanced texture is cached and reused when drawing
the infinitely tiled courtyard, so there is **no extra image processing per
frame**. Characters, enemies, spells, HUD, hitboxes and gameplay are untouched.
If browser pixel access or memory is unavailable, the game continues with the
original texture automatically.

## Sharper animated monster sprites

All 13 ordinary enemies and bosses now use the original 192 × 192 transparent art frames, packed into one animated WebP atlas (`assets/monsters-hd-v032.webp`). Each enemy has four idle frames and six walking frames. The combat renderer selects the correct source frame at runtime and uses restrained silhouette lighting so creatures remain legible against the gothic courtyard. Visual sizes, damage, speeds, collision radii, spawns, and rewards are unchanged. A compact legacy atlas remains as a fallback if the HD texture has not loaded yet. The same high-resolution artwork appears in the Monster Bestiary.

## Manual pause and upright courtyard

**Escape**, **P**, or **O** toggle the paused Character Stats / Encyclopedia screen. Switching browser tabs, using Alt+Tab, or moving the pointer to another monitor does not automatically pause the game. On window blur or a hidden tab, held movement keys are cleared to avoid stuck movement; browsers may throttle animation in background tabs, so elapsed simulation time can advance more slowly there.

The endlessly repeated courtyard texture mirrors **horizontally only**. Vertical mirroring has been removed so painted gravestones, crypts, monuments, and their shadows remain upright throughout the map.

## Full-screen responsive playfield

Once a mode is selected, the arena fills the browser viewport instead of sitting inside a fixed-width 16:9 frame. The canvas backing resolution updates automatically on window resize and high-DPI displays (with a performance cap). The game uses a uniform world-to-screen scale: 16:9 shows the original 640 × 360 world units, ultrawide monitors show more horizontally, and taller monitors show more vertically. Sprites, hitboxes, projectiles, and movement do not stretch. The illustrated main menu keeps its original aspect ratio.

## Hardcore escalation at 15:00

Hardcore receives an additional, deliberately severe enemy-scaling curve starting **exactly at 15:00**. Earlier Hardcore gameplay (before 15:00) and **all of Easy Mode, including late waves, remain unchanged**. The existing base enemy stats and boss spawn times remain unchanged.

| Time | Hardcore HP stage | Damage stage | Speed stage | Spawn stage | Special surge group |
|---|---:|---:|---:|---:|---:|
| 15:00–19:59 | ×8 | ×2.25 | ×1.45 | ×5.2 | +8 extra enemies |
| 20:00–24:59 | ×15.5 | ×3.15 | ×1.58 | ×8 | +14 extra enemies |
| 25:00–29:59 | ×29 | ×4.5 | ×1.70 | ×11 | +20 extra enemies |

These are **total stage multipliers**, applied together with the original minute-by-minute HP/Damage/Speed formulas (not extra multiplicative stacks). Existing enemies gain the stage adjustment when a five-minute surge begins. Hardcore spawn pressure can reach 72 instead of 40, but the **maximum number of active enemies stays 230** to control performance. The horde's attack and movement behavior is otherwise unchanged. The Enemy Scaling page displays the appropriate live Hardcore or Easy values.

## Core mechanics

- A run lasts up to **30:00**.
- Select one of four elements before combat; attacks automatically target nearby enemies. Enemies arrive in two groups, and new bosses appear at fixed moments.
- Starting stats: **100 HP**, movement speed **100**, **6% critical chance**, **×1.6 critical damage**. Base attack speed is determined by the selected element. Direct enemy hits grant **0.5 seconds** of immunity against further contact, ranged and area attacks; existing damage-over-time effects still tick.
- Blue XP crystals grant levels. XP required for the next level after reaching level `L`: `floor(12 + 8L + 1.5L²)`. Normal level-ups do not restore HP by default; selected survival rewards may heal. **Maximum level: 150**. XP collected after that point still counts toward your total score without triggering more upgrade screens.

## Elements

| Element | Base hit | Base attacks/s | Damage and status rules |
|---|---:|---:|---|
| **Blood** | **21.6** (+8%) | **1** | **Blood Spear:** slow **80 units/s** projectile with **unlimited pierce**. Every hit applies 1 Bleed stack (100% of hit damage over **8s**, max 8 stacks). The same enemy may be hit again after **0.6s** of continued contact. Piercing Fangs grants extra Bleed stacks per hit. |
| **Fire** | **43.2** (+8%) | **1** | **Fireball:** **290 units/s**, detonates on its first target, dealing direct damage there and applying Burn to **all** enemies within **55 units**. Burn = **43.2 DPS × 2s** at base, refreshed but not stacked. Fireballs fired in the same attack **cannot shotgun**: an enemy can receive damage from only one Fireball (including bonus blast damage) per salvo. |
| **Lightning** | **Random 1–200** | **1** | **Chain Lightning:** strikes the first enemy then bounces **4 times** to distinct enemies within **120 units** of the previous target (up to **5 hits** initially). Each hit has **50%** Shock chance for **4s**. **Piercing Fangs** and **Spread Shot** add bounces, up to **25** per chain. **Forward Shot** launches up to **3 independent Chain Lightnings** per attack. The first targets an enemy; bonus bolts choose distinct, randomly varied rear directions at each attack and can never overlap. |
| **Poison** | **0** | **2** | **Toxic Orb:** **210 units/s**. Its first impact splashes **1 permanent 15 DPS Poison stack** onto every enemy within **55 units**, matching Fireball. Each stack can crit. **Poison can still shotgun**: overlapping Toxic Orbs from the same attack each add their own stacks. On death with **5+** stacks, Poison Proliferate spreads **5 stacks** to up to **6 enemies** within **55 units** (both radii gain **+10% per Piercing Fangs point**). No Proliferate text is shown; stacks remain unlimited. |

### Elemental damage formulas

Base shot interval is `1 / attacks per second`: **1.0s** for Blood, Fire and Lightning, and **0.5s** for Poison. Rapid Fire multiplies the selected element's attack speed normally.

- **Element Power:** Each upgrade adds `5% × rarity multiplier` to the base damage of the chosen element. Multiple bonuses **add**, rather than multiply.
- **Blood:** direct hit = `21.6 × (1 + Blood Power bonus) + flat damage`. Each Blood Spear collision adds `1 + Piercing Fangs points` Bleed stacks, each worth `actual hit damage / 8` DPS for 8 seconds, capped at **8 active stacks**. Spear pierces infinitely, with a **0.6s per-target repeat-hit cooldown** for each spear. Crits scale both the direct hit and Bleed.
- **Fire:** direct hit on first enemy = `43.2 × (1 + Fire Power bonus) + flat damage`. Every enemy within radius `55 × (1 + 0.1 × Piercing Fangs points)` gets a 2-second Burn. Burn DPS = `basic hit × 1.0`; subsequent explosions refresh rather than stack it. At base, the primary target takes **43.2 direct + 86.4 Burn** if the full Burn elapses; secondary targets receive Burn only.
- **Lightning:** each hit starts from the projectile's base roll `random integer 1–200 × (1 + Lightning Power bonus) + flat damage`, with independent crit and Shock rolls per enemy. From the first hit, bounce to the nearest unhit enemy within **120 units** of the last target; maximum `min(25, 4 + Piercing Fangs points + 2 × Spread Shot points)` bounces **per independent chain**. Forward Shot grants `min(3, 1 + Forward Shot points)` independent Chain Lightning projectiles. The first flies toward the target. With one bonus bolt, it fires at a randomly varied rear angle; with two bonus bolts, they take opposite randomly varied rear flanks. The three projectiles never share the same heading and have separate hit lists and chains. No repeated targets within one chain.
- **Poison:** Toxic Orb and Poison Proliferate radii = `55 × (1 + 0.1 × Piercing Fangs points)`; each enemy hit by the Toxic Orb blast gains one stack. Poison DPS = `15 × (1 + Poison Power bonus) × sum(crit multiplier of each stack)`. Individual stacks may crit (base ×1.6), are permanent, and have no count cap. At death with **5+** stacks, Poison Proliferate transfers **5 stacks** to up to **6 enemies** within the same blast radius, preserving average crit potency.

**Hemorrhagic (Blood):** An independent **5% chance per four-card power-up offer** (including rerolls), available once per run. After selection, every Blood hit detonates Bleed immediately instead of leaving ticking stacks. Base area damage = `(8 + Piercing Fangs points) × hit damage` (**172.8** for an unmodified 21.6-damage hit with 0 Piercing Fangs points). Rarity adds `10% × (rarity multiplier − 1)` burst potency; the explosion does not spread Bleed.

## Power-ups and rarity

Every level-up offers **4 different cards**: one Attack, one Defense and two random **while the relevant normal powers remain eligible**. If normal upgrades have reached their caps or been banished, any empty slots are replaced by distinct, repeatable **Survival Rewards**. This prevents late-game empty draws/crashes. Each run includes **3 Rerolls** and **3 Banishes**; survival rewards cannot be banished, and reroll is disabled when all four are the only possible choices. **Power-ups are element-specific where noted:** their effects can differ from the generic names.

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
| Forward Shot | **Blood / Fire / Poison:** +1 parallel projectile (+2 Legendary, +3 Mythic), max **3 extra**. **Lightning:** +1 independent Chain Lightning projectile per point, max **3 total** (2 extra); bonus shots use randomly varied and non-overlapping rear angles, with separate targets and bounces. |
| Spread Shot | **Blood / Fire / Poison:** +2 angled projectiles (+4 Legendary/Mythic), max **8 spread points**. **Lightning:** +2 chain bounces per spread point (+4 with Legendary/Mythic), **no angled shots**; max **25 combined bounces**. |
| Piercing Fangs | Grants **1 point** (+2 Legendary, +3 Mythic). **Blood:** +1 Bleed stack per hit and +1 stack worth of Hemorrhagic damage; **Lightning:** +1 bounce per point, max **25 bounces** combined with Spread Shot; **Fire / Poison:** +10% area radius per point (including Poison Proliferate), max **4 points**. Blood Spear pierces every enemy. |
| Deadly Precision | +`3u%` critical chance, max **85%** |
| Critical Damage | +`10u%` critical damage multiplier, no cap |
| Blood / Fire / Lightning / Poison Power | +`5u%` of elemental base damage, additive, max **5 picks** for the chosen element |

## Enemies and Monster Bestiary

Pause deliberately with **Escape**, **P**, or **O** (or the game's pause/inventory button) to open two main tabs: **Character Stats** (your current main spell and equipped power-ups on the left, real-time combat stats on the right) and **Encyclopedia**. Opening Encyclopedia reveals five chapters: **Monster Bestiary** (early/late/boss filters), **Elemental Mechanics** (all four spells and exact damage formulas), **Item Acquisition** (shrine timing, drops and rarity odds), **Power-Up Library** (18 perks, rarity and element-specific effects) and **Enemy Scaling** (five-minute stat table). Crosslinks jump between related articles. Enemy names are **not** displayed beneath creatures during combat.

**00:00–09:59 (early waves):** Skeleton Swordsman (simple sword melee), Plague Rat (weak but quick), Watcher Eye (slow caster, +1 projectile every 5 minutes), Skeleton Archer (high-damage slow arrow), Zombie (slow, heavy claw).

**10:00–29:59 (late waves):** Blood Slime (applies player Bleed up to 8 stacks), Succubus (swift melee), Imp (extremely fast melee), Hellhound (occasionally summons 1–2 more Hellhounds), Necromancer (slow caster with very fast heavy magic bolts).

After **10:00**, no further early-wave monsters spawn. Any that are still alive remain on the map until defeated.

### Bosses

- **03:00 Gargoyle:** 11,000 base HP (10× the previous 1,100), a brilliant red 2,280-unit warning line (4× the previous visual) and a 2.6s charge telegraph. The 570-unit charge itself and its base 55 damage remain unchanged.
- **08:00 Abomination:** **52,000 base HP (×10)**, very large HP pool and slow melee movement; warns for 1.8s before an AoE slam (radius 79). Defeating it awards **one Rare, Legendary or Mythic perk directly** without consuming XP or a level-up.
- **17:00 Demon:** **34,000 base HP (×10)**, fast pursuit and three consecutive warned AoE blasts, radii **50, 94 and 142**, each able to hit separately.
- The 08:00 and 17:00 boss times are provisional pending final balancing.

### Enemy difficulty scaling

Enemy stats are base values from the Bestiary times the following multiplier:

| Time | HP tier | Damage tier | Speed tier | Spawn tier |
| --- | ---: | ---: | ---: | ---: |
| 00:00 | ×1 | ×1 | ×1 | ×1 |
| 05:00 | ×1.5 | ×1.15 | ×1.12 | ×1.5 |
| 10:00 | ×2.4 | ×1.35 | ×1.22 | ×2 |
| 15:00 | ×3.5 | ×1.55 | ×1.32 | ×2.6 |
| 20:00 | ×5 | ×1.8 | ×1.42 | ×3.2 |
| 25:00 | ×7 | ×2.1 | ×1.55 | ×4 |

On top of the tier: **HP × 1.045^minute**, **damage × 1.025^minute**, **speed × 1.018^minute**. Spawn pressure grows at **1.14^minute** up to its cap. Easy Mode halves all these resulting enemy values. Already-spawned enemies inherit new tier jumps without resetting their current HP percentage.

**Blood Slime Bleed:** Each successful melee hit applies a 6-second stack, up to 8 at a time. One stack inflicts **0.65 + 0.11 × current five-minute tier HP/s** before armor. A small blood-droplet indicator near the HP bar displays active stacks.

## Endgame Survival Rewards

Four fixed **Common** replacement rewards are offered only when standard eligible power-ups cannot fill all four card slots. They are repeatable and do not dilute regular perk rarity chances or Power Shrine drops:

| Reward | Effect |
|---|---|
| **Field Medic** | +4 max HP, then restore at least 24 HP or 25% of maximum HP |
| **Enduring Heart** | +12 max HP and restore 12 HP |
| **Mending Vigor** | Permanent +0.15 HP/s regeneration and restore 10 HP |
| **Phoenix Sigil** | Gain a resurrection charge, up to 2. When holding 2 charges, grants +8 max HP and heals 8 instead |

A Phoenix revival triggers before death from a direct hit or bleeding, consumes one charge, restores **35% maximum HP**, clears enemy Bleed stacks, and gives **2 seconds** of damage immunity. The amount of XP collected remains unrestricted for scorekeeping, but leveling stops at level **150**.

## Smooth XP magnet movement

Normal blue XP crystals begin to accelerate when entering your effective **84 × Soul Magnet** pickup radius. Their attraction speed ramps positively from **130 to 640 units/s in 0.7 seconds**, with movement clamped to the remaining distance to prevent bouncing or overshooting. A crystal is collected when it reaches the hunter. The global Magnet Shrine still collects XP instantly. A cap of **140 simultaneous floating combat texts** limits visual spam without limiting damage.

## Shrines

| Shrine | Spawn timing | Mechanic |
|---|---|---|
| **Life Shrine** | **2** at run start, further spawn attempts every **42–64s**, max **4** active | Restores **1 HP/s for 30s**, capped at max HP; **no instant heal**. Collecting another refreshes duration rather than stacking. |
| **Magnet Shrine** | **Guaranteed at 00:45**. After each collection, the next spawns randomly **90–150s later**; max **1** active. | Instantly collects **all unclaimed map XP** and grants **15s of global XP collection** for new drops. |
| **Power Shrine** | **Guaranteed at 02:00**, then randomly **4–6 minutes after the previous pickup**; maximum **1** active. | Grants **1 Legendary (75%) or Mythic (25%) perk immediately**, without consuming XP or a level. **Hemorrhagic has a 40% roll for Blood** until acquired; otherwise Element Power weighs **×5**, Critical Damage **×3**, and Forward Shot / Spread Shot / Piercing Fangs / Deadly Precision / Rapid Fire **×2**. Banned and capped perks cannot roll. |

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
