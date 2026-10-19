# Noob Survivors — Elemental Skills Implementation (v0.12)

## 1. Design rules
- Keep the game a lightweight HTML/CSS/Canvas 2D project, playable directly through GitHub Pages.
- **The Veilwarden** remains unchanged: idle and walking animations only; projectiles launch automatically.
- Keep Ancient Caverns music and the default 10% music / 5% SFX audio settings.
- Before gameplay begins, **Begin the Hunt** presents 4 primary elements instead of starting combat. Selection is mandatory and uses no rerolls/banishes. The game timer and enemies begin only after choosing.
- Subsequent level-ups provide three random upgrades with the existing 2 Reroll and 2 Banish charges. A banished perk does not return that run.

## 2. Asset layout
| Asset | Location | Usage |
| --- | --- | --- |
| Blue XP crystals | Drawn in `game.js` | Faceted electric-blue world drops; glowing blue XP gauge |
| Ability icons | `assets/ability-icons-v11.png` | 33 cropped icons from user-supplied 12-by-8 icon sheet; displayed on upgrade cards |
| Elemental attacks | `assets/elemental-projectiles-v11.png` | Blood, Fire, Lightning and Poison; each has an orb, bolt and spiral reference |
| Background, hero, enemies | Previous assets | No changes in v0.11 |

The spritesheet coordinates are registered in `assets.js`. New art has versioned filenames to avoid browser cache collisions.

## 3. Start weapon and first level-up
- **Before Level 1:** forced choice, keyboard **1–4** or touch/click. No reroll or banish. Each element has its own baseline hit and DOT.
- **Level 1:** an automatically fired slow projectile of the chosen element.
- **Blood:** keeps the starter projectile; enables Blood Lance / Sanguine Orb / Hemorrhage perks.
- **Fire:** all primary shots ignite enemies; burn duration increases with Cinder Veins.
- **Lightning:** 25% faster bolts and a chance to arc to another nearby enemy; Volt Cascade can further increase this chance.
- **Poison:** venom bolts apply damage over time; Venom Heart strengthens the effect.
- Each choice locks in a primary element for the current run and uses its own visuals. Details: [Element Balance](ELEMENT_BALANCE.md).

## 4. Normal perk progression (level 2 onward)
All existing 24 common, rare and legendary options remain, with icons mapped to the user-supplied art.

### Blood weapon branch
| Perk | Tier | Mechanical effect | Limits |
| --- | --- | --- | --- |
| Blood Lance | Rare | Each normal blood bolt pierces +1 enemy | +3 extra |
| Sanguine Orb | Legendary | +18% probability to replace a bolt with a slow orb; it bursts at the first hit and splashes nearby foes | 70% chance cap |
| Hemorrhage | Rare | +20% chance for a splash explosion when a bolt hits | 70% chance cap |

### Other branches
| Element | Baseline | Specialized upgrade |
| --- | --- | --- |
| Fire | Damage over time | Cinder Veins: burn lasts 50% longer, repeatable up to 3× |
| Lightning | Faster bolt and chain effect | Volt Cascade: increases chain probability by 20%, up to +75% |
| Poison | Venom damage over time | Venom Heart: poison duration and DPS gain +35%, repeatable up to 3× |

### Shared upgrades (examples)
- Hunter's Edge — projectile damage +25% (`damage`, sword icon)
- Shadow Stride — movement speed +16% (`speed`, wing icon)
- Rapid Fire — attack speed +18% (`rate`, volley icon)
- Twin Fang — +1 projectile (max 5) (`multi`, bullet icon)
- Piercing Fangs — +1 pierce (`pierce`, forked arrow icon)
- Soul Magnet — +40% crystal pickup range (`magnet`, magnet icon)
- Blood Pact, Dark Recovery, Blood Mending — health and regeneration (heart/cross icons)
- Iron Will — 10% damage reduction (shield icon)
- Quick Silver, Arcane Caliber, Deadly Precision — projectile speed, size and critical chance
- Fate Twister / Curse Breaker — +1 Reroll / +1 Banish

## 5. Implementation and verification order
- [x] Inspect and preserve existing gameplay and animation state.
- [x] Extract and compress both supplied sheets into transparent asset atlases.
- [x] Replace XP drops with luminous blue crystal graphics.
- [x] Replace perk symbols with actual ability icons.
- [x] Implement first-level-up elemental attunement with 4 cards.
- [x] Implement Blood Lance, slow burst orb, blood splash, burning bolts, chain lightning and poison DOT.
- [x] Keep other regular upgrades and Reroll/Banish functional.
- [x] Test desktop and mobile selection, hit effects, and normal upgrade flow.
- [x] Base assets and systems published for v0.11.
- [ ] Publish v0.12 rules, gold frame, and UI changes on GitHub `main`; verify GitHub Pages.

## 6. Controls and caveats
- WASD/arrows — move; attacks are automatic.
- **1/2/3/4** — choose an element before gameplay begins.
- **1/2/3**, **R**, **B** — choose, reroll, banish later perks.
- The 2D sprites are still images, not rigged 3D animations. Additional supplied asset sheets can be swapped in later without changing the basic build architecture.