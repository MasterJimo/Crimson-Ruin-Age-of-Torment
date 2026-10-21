<!-- MAINTAINER NOTE: Keep README focused on gameplay, controls and asset credits. Do not add version histories, "what's new", changelogs, release notes, or numbered update announcements here. Use GitHub Releases or CHANGELOG.md for those instead. -->

# Crimson Ruin: Age of Torment

**[▶ PLAY THE GAME](https://masterjimo.github.io/Crimson-Ruin-Age-of-Torment/)**

A free, single-player **dark-fantasy arena survival roguelike** for desktop and mobile browsers, created by **MrJim** ([MasterJimo](https://github.com/MasterJimo)). Fight escalating hordes, defeat bosses, collect experience and shape a build around **Blood, Fire, Lightning or Poison**.

**Content notice:** 18+ creator advisory for gothic horror, dark themes, frightening creatures and stylised fantasy violence.

## How to play

1. Choose **Easy** or **Hardcore**, then pick your element.
2. Move around the courtyard and avoid enemy attacks. **Spells fire automatically** at nearby enemies.
3. Collect blue XP crystals, choose power-ups on level-up and use shrines, reliquaries and elemental Ascensions to strengthen your build.
4. Survive as long as you can (up to **30 minutes**). Hardcore gets substantially more difficult as the run continues.

### Controls

| Action | Desktop | Phone / tablet |
|---|---|---|
| Move | **W / A / S / D** or **arrow keys** | Drag the **on-screen analog joystick** in any direction |
| Pause / resume and open Character Stats / Encyclopedia | **P**, **O** or **Esc** | **PAUSE** button |
| Music, SFX and mute | On-screen sound controls | **SOUND** settings |

The browser version supports portrait and landscape layouts. The **Encyclopedia** explains monsters, elemental mechanics, items, power-ups, scaling and Hunter's Oaths. For a shorter introduction, see [About & Controls](about.html).

### Special systems

- **Cursed champions and reliquaries:** Defeat marked enemies or bosses to receive a reliquary; choose a safer **CLAIM** reward or a stronger **DESECRATE** reward with a temporary damage-taken curse.
- **Torment Ascensions:** Acquire a sigil and develop an element to choose one of two special evolutions for that element (one Ascension per run).
- **Hunter's Oaths:** Optional achievements that unlock cosmetic titles; they do not increase combat power.
- **Combat Clarity:** Cinematic, Balanced and Performance effect presets to reduce visual clutter without changing gameplay.

### Fire and Lightning status VFX — v0.33.6

The first small flame and spark implementation was too weak at real in-game
enemy sizes. Fire now surrounds the animated monster with **layered, glowing
yellow/orange flames across the limbs, torso, shoulders and head**, plus
looping rising embers and a stronger orange silhouette rim. One tiny cached
transparent Canvas flame is reused for all enemies; flames follow each
sprite rather than remaining fixed on the floor. Lightning now runs a
**prominent branching blue-white bolt from head to feet**, with additional
flickering torso arcs, forks and a blue rim-light. Both use high-contrast
Canvas drawing against the dark courtyard, scale to large bosses, and vary
details across Cinematic/Balanced/Performance presets.

This is a real-time implementation on the game's current monster sprite
renderer—not a pre-rendered concept image. Burn duration/DPS, Shock chance,
duration and double-damage mechanic remain unchanged. Combined statuses
coexist without hiding boss attack-warning overlays. Combat damage and
collision are unaffected.

### Fire & Lightning — v0.33.7: actual-assets Canvas demo integration

Fire and Shock visuals are now directly based on the **approved working
Canvas demonstration**, not on an imagined concept image. The real skeleton
body occupies only about 28×38 pixels inside its 61×72 game sprite, so the
effect anchors are measured to that **visible skeleton body**, not the
192×192 atlas tile or its empty space. Eight narrow semi-transparent Fire
flames sit against its head, arms, ribs and ankles; five rising tiny embers
appear on top. Shock uses four branching, slim blue/white traces across
the spine, arms and legs. They animate with stable frame-based jitter.

The original monster frame is drawn first, followed by a screen-blended
status tint matching the demo; Poison continues to use its existing
separate green replacement treatment. The same local body coordinates
scale with each enemy's real onscreen sprite dimensions. All modes and
bosses are supported. Heavy waves and the Performance preset reduce
ornamental detail without hiding the core effect. No Burn/Shock damage,
timers, chance, mechanics or hitboxes were changed.

## Core mechanics

In addition to Poison's toxic-green silhouette and mist, enemies
affected by **Burn** now glow warm orange and show small flickering flame
tongues. Enemies affected by **Shock** receive a cool-blue tint and short,
jagged electric arcs that travel across their animated models. Effects are
rendered with cached, tinted original sprite frames and lightweight Canvas
paths; Combat Clarity controls their visual complexity. Both are purely
cosmetic: elemental damage, duration, stacking, enemies and bosses retain
their previous mechanics.



Poisoned creatures are visibly **tinted a muted toxic green** with a faint,
animated green mist around their model (no overhead droplet icon). The effect
uses cached, recoloured monster animation frames and the existing Combat
Clarity preset to limit the mist on slower devices. Poison stacks, DPS and
other elements' combat and visuals are unchanged.


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

## Shrines

| Shrine | Spawn timing | Mechanic |
|---|---|---|
| **Life Shrine** | **2** at run start, further spawn attempts every **42–64s**, max **4** active | Restores **1 HP/s for 30s**, capped at max HP; **no instant heal**. Collecting another refreshes duration rather than stacking. |
| **Magnet Shrine** | **Guaranteed at 00:45**. After each collection, the next spawns randomly **90–150s later**; max **1** active. | Instantly collects **all unclaimed map XP** and grants **15s of global XP collection** for new drops. |
| **Power Shrine** | **Guaranteed at 02:00**, then randomly **4–6 minutes after the previous pickup**; maximum **1** active. | Grants **1 Legendary (75%) or Mythic (25%) perk immediately**, without consuming XP or a level. **Hemorrhagic has a 40% roll for Blood** until acquired; otherwise Element Power weighs **×5**, Critical Damage **×3**, and Forward Shot / Spread Shot / Piercing Fangs / Deadly Precision / Rapid Fire **×2**. Banned and capped perks cannot roll. |

## Assets and Credits

Credits below refer to materials actually loaded by the game, with the original authors and source links preserved from the existing README and [audio source notes](assets/audio/SOURCES.md). **CC0 applies only to the individual works labelled CC0; it is not a license for the entire game.**

### Music

| Music | Composer / artist | Original source | Used in game | License |
|---|---|---|---|---|
| **Ancient Caverns (horror ambient loop)** | **[congusbongus](https://opengameart.org/users/congusbongus)** (published under this creator name; legal name not listed) | [OpenGameArt — Ancient caverns](https://opengameart.org/content/ancient-caverns-horror-ambient-loop) | Streamed from [`caverns.ogg`](https://opengameart.org/sites/default/files/caverns.ogg), referenced by [`game.js`](game.js) → `MUSIC_TRACKS.caverns`; **not stored in this repository** | [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/) |

### Sound effects (third-party recordings)

The four in-game elemental attack samples are **short edited derivatives** of these Freesound recordings. Their local MP3 versions are under [`assets/audio/`](assets/audio/); the full conversion/edit details are in [`assets/audio/SOURCES.md`](assets/audio/SOURCES.md).

| In-game effect | Creator (Freesound) | Original recording and link | Local file | License |
|---|---|---|---|---|
| **Blood attack** | **[_stubb](https://freesound.org/people/_stubb/)** | [Blood Spatter_Squelch_Near_Mono](https://freesound.org/people/_stubb/sounds/406582/) | [`assets/audio/attack-blood.mp3`](assets/audio/attack-blood.mp3) | [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/) |
| **Fire attack** | **[qubodup](https://freesound.org/people/qubodup/)** | [Fire Spell](https://freesound.org/people/qubodup/sounds/442871/) | [`assets/audio/attack-fire.mp3`](assets/audio/attack-fire.mp3) | [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/) |
| **Lightning attack** | **[JoelAudio](https://freesound.org/people/JoelAudio/)** | [ELECTRIC_ZAP_001.wav](https://freesound.org/people/JoelAudio/sounds/136542/) | [`assets/audio/attack-lightning.mp3`](assets/audio/attack-lightning.mp3) | [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/) |
| **Poison attack** | **[qubodup](https://freesound.org/people/qubodup/)** | [Slime Attack 1](https://freesound.org/people/qubodup/sounds/751338/) | [`assets/audio/attack-poison.mp3`](assets/audio/attack-poison.mp3) | [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/) |

**Additional source-layer credits:** The Freesound description for qubodup's **Fire Spell** also credits CC0 inputs by **[SoundCollectah](https://freesound.org/people/SoundCollectah/sounds/109360/)**, **[qubodup](https://freesound.org/people/qubodup/sounds/176724/)**, **[Leandri140029](https://freesound.org/people/Leandri140029/sounds/437547/)** and **[hellonyou](https://freesound.org/people/hellonyou/sounds/426852/)**. qubodup's **Slime Attack 1** combines the creator's own [Slime](https://freesound.org/people/qubodup/sounds/127449/) and [Chicken Meat Slime](https://freesound.org/people/qubodup/sounds/211605/) recordings. These are **credits for source recordings used to create the published Freesound effects**, not separate audio files included in Crimson Ruin.

All four shipped MP3 clips were converted/cropped, normalised and faded for gameplay use, as detailed in [the audio source notes](assets/audio/SOURCES.md). Other UI/combat cues were created by **[MasterJimo](https://github.com/MasterJimo)** and synthesised by the browser's **Web Audio API** in [`game.js`](game.js); they do not use additional external sound files.

### Artwork and visual assets

The following visual assets were **created/generated by [MasterJimo](https://github.com/MasterJimo)** for Crimson Ruin and are stored locally in [`assets/`](assets/). The file paths identify where each image is used. Third-party music and audio recordings keep their own creator credits and licenses above.

| Artwork / usage | Files in the repository | Creator |
|---|---|---|
| Main menu and courtyard | [`approved-menu-full-v0291.webp`](assets/approved-menu-full-v0291.webp), [`courtyard-new-v021.webp`](assets/courtyard-new-v021.webp) | **[MasterJimo](https://github.com/MasterJimo)** |
| Hunter, creatures and bosses | [`veilwarden-opaque-v103.png`](assets/veilwarden-opaque-v103.png), [`monsters-hd-v032.webp`](assets/monsters-hd-v032.webp), [`monsters-v031.png`](assets/monsters-v031.png), [`death-reaper-v019.webp`](assets/death-reaper-v019.webp) | **[MasterJimo](https://github.com/MasterJimo)** |
| Elemental spells, particles and skill icons | [`effects.png`](assets/effects.png), [`elemental-projectiles-v11.png`](assets/elemental-projectiles-v11.png), [`elemental-skills-v0301.webp`](assets/elemental-skills-v0301.webp), [`skill-icons-v0231.webp`](assets/skill-icons-v0231.webp), [`projectiles/skeleton_archer_arrow.png`](assets/projectiles/skeleton_archer_arrow.png), [`projectiles/watcher_eye_arcane_bolt.png`](assets/projectiles/watcher_eye_arcane_bolt.png), [`projectiles/necromancer_dark_bolt.png`](assets/projectiles/necromancer_dark_bolt.png) | **[MasterJimo](https://github.com/MasterJimo)** |
| Shrines, fountain and interface ribbon | [`blood-fountain-v014.png`](assets/blood-fountain-v014.png), [`magnet-shrine-v020.webp`](assets/magnet-shrine-v020.webp), [`power-shrine-v025.png`](assets/power-shrine-v025.png), [`easy-ribbon-v019.webp`](assets/easy-ribbon-v019.webp) | **[MasterJimo](https://github.com/MasterJimo)** |

### Game and technology

- **Game creator:** **MrJim** ([MasterJimo](https://github.com/MasterJimo)).
- **Implementation:** JavaScript, HTML, CSS, Canvas 2D and browser Web Audio API; see [`game.js`](game.js), [`sprites.js`](sprites.js), [`assets.js`](assets.js), [`monsters.js`](monsters.js) and [`style.css`](style.css).
- **Privacy information:** [Privacy Policy](privacy.html).

