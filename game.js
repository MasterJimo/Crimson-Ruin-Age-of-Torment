/* CRIMSON RUIN: AGE OF TORMENT — HUNTER'S NOCTURNE
   Dependency-free dark fantasy arena survival game.
   Responsive canvas, 640 x 360 base world at 16:9. Round length: 30 minutes. */
(() => {
  'use strict';
  const canvas = document.querySelector('#game');
  const ctx = canvas.getContext('2d', { alpha: false });
  ctx.imageSmoothingEnabled = false;
  // The world uses consistent, undistorted units, while the canvas fills
  // the available playfield at the actual monitor resolution.
  // At 16:9 it shows 640 × 360 world units. Ultrawide shows more horizontally;
  // tall displays show more vertically instead of stretching the sprites.
  const BASE_WORLD_WIDTH=640, BASE_WORLD_HEIGHT=360;
  let W=BASE_WORLD_WIDTH, H=BASE_WORLD_HEIGHT;
  const TAU=Math.PI*2, DURATION=1800;
  let lastFrameWidth=0,lastFrameHeight=0,lastDensity=0;
  function resizePlayfield(){
    const bounds=canvas.getBoundingClientRect();
    const width=bounds.width,height=bounds.height;
    if(width<=0||height<=0)return;
    // Cap the backing surface near 4K so high-DPI / ultrawide monitors
    // do not allocate enormous render targets.
    const density=Math.max(.5,Math.min(window.devicePixelRatio||1,2,3840/width,2160/height));
    if(Math.abs(width-lastFrameWidth)<.1&&Math.abs(height-lastFrameHeight)<.1&&density===lastDensity)return;
    lastFrameWidth=width;lastFrameHeight=height;lastDensity=density;
    const scale=Math.min(width/BASE_WORLD_WIDTH,height/BASE_WORLD_HEIGHT);
    W=width/scale;H=height/scale;
    canvas.width=Math.max(1,Math.round(width*density));
    canvas.height=Math.max(1,Math.round(height*density));
    // Uniform logical-world scaling; no sprite or collision distortions.
    ctx.setTransform(canvas.width/W,0,0,canvas.height/H,0,0);
    ctx.imageSmoothingEnabled=false;
  }
  // ResizeObserver responds to menu/game transitions and window resizing.
  if(typeof ResizeObserver!=='undefined')new ResizeObserver(resizePlayfield).observe(canvas);
  window.addEventListener('resize',resizePlayfield);
  resizePlayfield();
  // User-supplied gothic courtyard. The existing floor remains a fallback while loading.
  const courtyard = new Image();
  courtyard.decoding = 'async';
  courtyard.src = 'assets/courtyard-new-v021.webp';
  const fountainArt = new Image();
  fountainArt.decoding = 'async';
  fountainArt.src = 'assets/blood-fountain-v014.png';
  const magnetArt = new Image();
  magnetArt.decoding = 'async';
  magnetArt.src = 'assets/magnet-shrine-v020.webp';
  const powerShrineArt=new Image();powerShrineArt.decoding='async';powerShrineArt.src='assets/power-shrine-v025.png';
  const deathArt=new Image();deathArt.decoding='async';deathArt.src='assets/death-reaper-v019.webp';
  const ribbonArt=new Image();ribbonArt.decoding='async';ribbonArt.src='assets/easy-ribbon-v019.webp';
  // Twelve provided skill illustrations packed into one 3-column / 4-row
  // transparent atlas: projectile, impact and particles for each element.
  const skillArt=new Image();
  skillArt.decoding='async';
  skillArt.src='assets/elemental-skills-v0301.webp';
  const SKILL_TILE=192,SKILL_ROWS={blood:0,lightning:1,fire:2,poison:3};
  function drawSkillFrame(element,frame,x,y,width,height,opacity=1){
    if(!skillArt.complete||!skillArt.naturalWidth)return false;
    const row=SKILL_ROWS[element];
    if(row===undefined)return false;
    ctx.save();ctx.globalAlpha*=opacity;ctx.imageSmoothingEnabled=true;
    ctx.drawImage(skillArt,frame*SKILL_TILE,row*SKILL_TILE,SKILL_TILE,SKILL_TILE,x,y,width,height);
    ctx.restore();return true;
  }

  const $ = id => document.getElementById(id);
  const el = {
    bleedBuff:$('bleedBuff'), powersTab:$('inventoryPowersTab'), bestiaryTab:$('inventoryBestiaryTab'),
    powersPage:$('inventoryPowersPage'), encyclopediaPage:$('inventoryEncyclopediaPage'), encyclopediaTab:$('inventoryEncyclopediaTab'), bestiaryPage:$('inventoryBestiaryPage'),
    intro:$('intro'), upgrade:$('upgrade'), upgradeCards:$('upgradeCards'), end:$('endScreen'), pause:$('pauseOverlay'),
    inventory:$('inventoryOverlay'), inventoryBtn:$('inventoryBtn'), inventoryClose:$('inventoryClose'),
    easyStart:$('easyStartBtn'),
    inventoryElementIcon:$('inventoryElementIcon'), inventoryElementName:$('inventoryElementName'),
    inventoryElementDesc:$('inventoryElementDesc'), inventoryElementRank:$('inventoryElementRank'),
    inventoryPerks:$('inventoryPerks'), inventoryStats:$('inventoryStats'), inventoryPerkCount:$('inventoryPerkCount'),
    start:$('startBtn'), restart:$('restartBtn'), resume:$('resumeBtn'), hud:$('hud'), fountainBuff:$('fountainBuff'), magnetBuff:$('magnetBuff'),
    hp:$('hpFill'), hpText:$('hpText'), xp:$('xpFill'), level:$('levelText'), kills:$('killText'), time:$('timeText'),
    sound:$('soundBtn'), musicVolume:$('musicVolume'), sfxVolume:$('sfxVolume'),
    musicVolumeValue:$('musicVolumeValue'), sfxVolumeValue:$('sfxVolumeValue'), xpStrip:$('xpStrip'),
    msg:$('message'), status:$('statusText'), bossBar:$('bossBar'), bossFill:$('bossFill'), bossName:$('bossName'),
    reroll:$('rerollBtn'), banish:$('banishBtn'), rerollCount:$('rerollCount'), banishCount:$('banishCount'), perkNotice:$('perkNotice')
  };
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const rand = (a, b) => a + Math.random() * (b - a);
  const dist2 = (a, b, c, d) => (a - c) ** 2 + (b - d) ** 2;
  const timeText = t => `${String(Math.floor(t / 60)).padStart(2, '0')}:${String(Math.floor(t % 60)).padStart(2, '0')}`;
  const hash = (x, y) => { let h = Math.imul(x, 374761393) + Math.imul(y, 668265263); h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967295; };

  // The placeholder enemy roster is removed until replacement sprites and balance are approved.
  // Re-enable spawning only after the new ENEMIES registry has been populated.
  const ENEMIES=window.CrimsonMonsters.byId;
  const ENEMY_SPAWNING_ENABLED=true;
  const MONSTER_ART_ORDER=['skeleton','plague_rat','eye','skeleton_archer','zombie','blood_slime','succubus','imp','hellhound','necromancer','boss1','boss3','boss2'];
  // Keep the tiny atlas as a fallback for slow/offline asset loads.
  const MONSTER_ART_INDEX=Object.fromEntries(MONSTER_ART_ORDER.map((id,index)=>[id,index]));
  const monsterAtlas=new Image();monsterAtlas.src='assets/monsters-v031.png';
  // High-detail atlas: 13 monster rows × 10 animation frames, 192 px per frame.
  // One cached texture for the entire horde instead of dozens of image requests.
  const MONSTER_HD_TILE=192,MONSTER_HD_FRAMES=10;
  const monsterHDAtlas=new Image();
  monsterHDAtlas.decoding='async';
  monsterHDAtlas.src='assets/monsters-hd-v032.webp';
  function monsterHDReady(){
    return monsterHDAtlas.complete&&monsterHDAtlas.naturalWidth===MONSTER_HD_TILE*MONSTER_HD_FRAMES
      &&monsterHDAtlas.naturalHeight===MONSTER_HD_TILE*MONSTER_ART_ORDER.length;
  }
  const MONSTER_FAST_ANIMS=new Set(['plague_rat','succubus','imp','hellhound','eye']);
  const MONSTER_IDLE_STATES=new Set(['chargeWarn','abominationWindup','demonBlast','summon']);
  function monsterHDFrame(e){
    // The supplied sheets contain 4 idle frames (3 fps) and 6 walk frames
    // (8 fps, 10 fps for faster creatures). Phase already advances at 6/s.
    const idle=e.attackWindup>0||MONSTER_IDLE_STATES.has(e.attackState);
    if(idle)return Math.floor(e.phase*.5)%4;
    const rate=MONSTER_FAST_ANIMS.has(e.type)?10/6:8/6;
    return 4+Math.floor(e.phase*rate)%6;
  }

  // v0.13: sixteen curated perks. Twelve are universal and four are
  // element-specific; only the power corresponding to the chosen element rolls.
  // Descriptions match the exact mechanic rather than promising an unrelated stat.
  // Rarity is rolled for EACH offered perk, not permanently assigned per perk.
  // The fifth (Mythic) band covers exactly 1% of normal RNG draws.
  const MAX_HUNTER_LEVEL=150;
  const RARITY_TIERS=['common','magic','rare','legendary','mythic'];
  const RARITY_SCALE={common:1,magic:2,rare:4,legendary:8,mythic:16};
  function rollRarity(){
    const r=Math.random();
    return r<.54?'common':r<.79?'magic':r<.94?'rare':r<.99?'legendary':'mythic';
  }
  function rarityScale(tier){return RARITY_SCALE[tier]||1;}
  function shotBonus(scale){return scale>=16?3:scale>=8?2:1;}
  function spreadBonus(scale){return scale>=8?2:1;}
  // Lightning interprets Spread Shot as +2 chains per spread point,
  // not extra angled projectiles. Each Forward Shot fires its own chain.
  const LIGHTNING_BASE_CHAINS=4,LIGHTNING_MAX_CHAINS=25;
  function lightningChainCount(p){return Math.min(LIGHTNING_MAX_CHAINS,LIGHTNING_BASE_CHAINS+p.pierce+2*p.spreadShots);}
  function attackProjectileCount(p){
    return p.element==='lightning'?1+Math.min(2,p.forwardShots):
      (1+p.forwardShots)*(1+2*p.spreadShots);
  }
  function perkDescription(id,tier,elementOverride=null){
    const u=rarityScale(tier),percent=n=>Math.round(n*100)+'%';
    switch(id){
      case 'brutality':return '+'+(5*u)+' flat hit damage (also improves Bleed and Burn).';
      case 'rapid_fire':return '+'+(6*u)+'% attack speed.';
      case 'movement':return '+'+(5*u)+'% base movement speed.';
      case 'vitality':return '+'+(10*u)+' maximum HP and heal '+(10*u)+' HP.';
      case 'regen':return '+'+(0.1*u).toFixed(2)+' HP each second.';
      case 'armor':return 'Reduce incoming damage by '+(3*u)+'%.';
      case 'knowledge':return '+'+(8*u)+'% XP from crystals.';
      case 'magnet':return '+'+(10*u)+'% crystal pickup radius.';
      case 'forward':return (elementOverride||game?.player?.element)==='lightning'?
        '+'+shotBonus(u)+' independent Chain Lightning shot(s) in distinct random directions (up to 3 total shots).':
        '+'+shotBonus(u)+' parallel projectile(s).';
      case 'spread':return (elementOverride||game?.player?.element)==='lightning'?
        '+'+(2*spreadBonus(u))+' chain bounces (up to 25 total).':
        '+'+(2*spreadBonus(u))+' angled projectile(s).';
      case 'pierce':{
        const amount=shotBonus(u),element=elementOverride||game?.player?.element;
        if(element==='blood')return '+'+amount+' Bleed stack(s) per hit.';
        if(element==='lightning')return '+'+amount+' chain bounce(s), up to 25 total.';
        if(element==='fire'||element==='poison')return '+'+(10*amount)+'% explosion radius.';
        return '+'+amount+' extra pierce.';
      }
      case 'crit':return '+'+(3*u)+'% critical chance.';
      case 'crit_damage':return '+'+(10*u)+'% critical damage multiplier.';
      case 'blood_power':return '+'+(5*u)+'% Blood damage.';
      case 'hemorrhagic_burst':return '8-stack Blood detonation on every hit · +'+(10*(u-1))+'% burst potency.';
      case 'fire_power':return '+'+(5*u)+'% Fire damage.';
      case 'lightning_power':return '+'+(5*u)+'% Lightning damage.';
      case 'poison_power':return '+'+(5*u)+'% Poison damage.';
      case 'survival_heal':return '+4 max HP, then heal at least 24 HP or 25% of max HP.';
      case 'survival_heart':return '+12 max HP and heal 12 HP.';
      case 'survival_regen':return '+0.15 HP per second permanently and heal 10 HP.';
      case 'survival_phoenix':return 'Gain 1 revival charge (max 2). At the cap, gain +8 max HP and heal 8 HP. Revive restores 35% HP.';
      default:return '';
    }
  }
  // A single effect for every Element Power: additive % of base elemental damage.
  // Common +5%, Magic +10%, Rare +20%, Legendary +40%, Mythic +80%.
  // No added proc chances, extra projectiles, or separate Burn affix.
  const POISON_DPS=15;
  // Burn deals 100% of the basic Fire hit PER SECOND for 2 seconds
  // (base: 43.2 DPS = 86.4 total DoT). Crits and Shock do not amplify Burn.
  function burnDps(p){return p.damage+p.flatDamage;}
  function syncActiveBurn(p,g){
    if(p.element!=='fire')return;
    for(const enemy of g.enemies){
      if(enemy.burnTime>0)enemy.burnDps=burnDps(p);
    }
  }
  function increaseElementDamage(p,g,rarityUnits){
    p.elementRank++;
    p.elementDamageBonus=(p.elementDamageBonus||0)+.05*rarityUnits;
    const multiplier=1+p.elementDamageBonus;
    if(p.element!=='poison')p.damage=ELEMENT_DAMAGE[p.element]*multiplier;
    // Existing elemental DoT scales by the same single damage modifier.
    // Existing Burn immediately benefits from Fire Power as well as Brutality.
    if(p.element==='fire')syncActiveBurn(p,g);
    if(p.element==='poison'){
      p.poisonMultiplier=multiplier;
      for(const enemy of g.enemies){
        if(enemy.poisonStacks>0)enemy.poisonDps=(enemy.poisonStackStrength||enemy.poisonStacks)*POISON_DPS*multiplier;
      }
    }
  }
  const POWERS = [
    {id:'brutality',icon:'brutality',name:'BRUTALITY',can:p=>p.element!=='poison',apply:(p,g,u)=>{p.flatDamage+=5*u;syncActiveBurn(p,g);}},
    {id:'rapid_fire',icon:'rapid_fire',name:'RAPID FIRE',apply:(p,g,u)=>p.attackRate*=1+.06*u},
    {id:'movement',icon:'movement',name:'SHADOW STRIDE',can:p=>p.speed<200,apply:(p,g,u)=>{p.speed=Math.min(200,p.speed+100*.05*u);}},
    {id:'vitality',icon:'vitality',name:'VITALITY',apply:(p,g,u)=>{const amount=10*u;p.maxHp+=amount;const before=p.hp;p.hp=Math.min(p.maxHp,p.hp+amount);g.totalHealing+=p.hp-before;}},
    {id:'regen',icon:'regen',name:'REGENERATION',can:p=>p.regen<2,apply:(p,g,u)=>{p.regen=Math.min(2,p.regen+.1*u);}},
    {id:'armor',icon:'armor',name:'IRON WILL',can:p=>p.armor<.80,apply:(p,g,u)=>{const reduction=Math.min(.80,.03*u);p.armor=Math.min(.80,1-(1-p.armor)*(1-reduction));}},
    {id:'knowledge',icon:'knowledge',name:'FORBIDDEN KNOWLEDGE',apply:(p,g,u)=>p.xpBonus*=1+.08*u},
    {id:'magnet',icon:'magnet',name:'SOUL MAGNET',apply:(p,g,u)=>p.magnet*=1+.1*u},
    {id:'forward',icon:'forward',name:'FORWARD SHOT',can:p=>p.forwardShots<(p.element==='lightning'?2:3),apply:(p,g,u)=>p.forwardShots=Math.min(p.element==='lightning'?2:3,p.forwardShots+shotBonus(u))},
    {id:'spread',icon:'spread',name:'SPREAD SHOT',can:p=>p.spreadShots<8&&(p.element!=='lightning'||lightningChainCount(p)<25),apply:(p,g,u)=>p.spreadShots=Math.min(8,p.spreadShots+spreadBonus(u))},
    {id:'pierce',icon:'pierce',name:'PIERCING FANGS',can:p=>p.pierce<(p.element==='lightning'?21:4)&&(p.element!=='lightning'||lightningChainCount(p)<25),apply:(p,g,u)=>p.pierce=Math.min(p.element==='lightning'?21:4,p.pierce+shotBonus(u))},
    {id:'crit',icon:'crit',name:'DEADLY PRECISION',can:p=>p.critChance<.85,apply:(p,g,u)=>p.critChance=Math.min(.85,p.critChance+.03*u)},
    {id:'crit_damage',icon:'crit',name:'CRITICAL DAMAGE',apply:(p,g,u)=>{p.critDamage+=.10*u;}},
    {id:'blood_power',icon:'blood_power',name:'BLOOD POWER',can:p=>p.element==='blood'&&p.elementRank<5,apply:(p,g,u)=>increaseElementDamage(p,g,u)},
    {id:'hemorrhagic_burst',icon:'blood_power',name:'HEMORRHAGIC BURST',can:p=>p.element==='blood'&&!p.hemorrhagicBurst,apply:(p,g,u)=>{p.hemorrhagicBurst=true;p.hemorrhagicBurstBoost=1+.1*(u-1);}},
    {id:'fire_power',icon:'fire_power',name:'FIRE POWER',can:p=>p.element==='fire'&&p.elementRank<5,apply:(p,g,u)=>increaseElementDamage(p,g,u)},
    {id:'lightning_power',icon:'lightning_power',name:'LIGHTNING POWER',can:p=>p.element==='lightning'&&p.elementRank<5,apply:(p,g,u)=>increaseElementDamage(p,g,u)},
    {id:'poison_power',icon:'poison_power',name:'POISON POWER',can:p=>p.element==='poison'&&p.elementRank<5,apply:(p,g,u)=>increaseElementDamage(p,g,u)}
  ];

  // The four starting cards are intentionally brief. Full mechanics remain
  // available in the paused Power-Up Grimoire.
  // Endless survival choices are reserved for depleted standard upgrade pools.
  // They never consume the normal 54/25/15/5/1 rarity roll or enter shrine pools.
  // All four remain meaningful and repeatable at any level.
  const SURVIVAL_BOONS=[
    {id:'survival_heal',icon:'vitality',name:'FIELD MEDIC',survival:true,apply:(p,g)=>{
      p.maxHp+=4;const old=p.hp;p.hp=Math.min(p.maxHp,p.hp+Math.max(24,p.maxHp*.25));g.totalHealing+=p.hp-old;
    }},
    {id:'survival_heart',icon:'vitality',name:'ENDURING HEART',survival:true,apply:(p,g)=>{
      p.maxHp+=12;const old=p.hp;p.hp=Math.min(p.maxHp,p.hp+12);g.totalHealing+=p.hp-old;
    }},
    {id:'survival_regen',icon:'regen',name:'MENDING VIGOR',survival:true,apply:(p,g)=>{
      p.regen+=.15;const old=p.hp;p.hp=Math.min(p.maxHp,p.hp+10);g.totalHealing+=p.hp-old;
    }},
    {id:'survival_phoenix',icon:'armor',name:'PHOENIX SIGIL',survival:true,apply:(p,g)=>{
      if(p.reviveCharges<2)p.reviveCharges++;
      else{p.maxHp+=8;const old=p.hp;p.hp=Math.min(p.maxHp,p.hp+8);g.totalHealing+=p.hp-old;}
    }}
  ];

  const ELEMENT_CHOICES = [
    {id:'blood',element:'blood',name:'BLOOD',desc:'21.6 DMG · Piercing spear',longDesc:'Very slow Blood Spear pierces every enemy. Each contact applies 1 Bleed stack (8s, up to 8); a slow enemy may be hit again by the same spear after 0.6s. Piercing Fangs adds Bleed stacks instead of pierce.',tier:'rare'},
    {id:'fire',element:'fire',name:'FIRE',desc:'43.2 DMG · Explosive fireball',longDesc:'Fast fireball detonates on the first target, dealing 43.2 direct damage. Its 55-unit blast applies 100% Burn to all nearby enemies for 2s. Piercing Fangs increases blast radius by 10% per point.',tier:'rare'},
    {id:'lightning',element:'lightning',name:'LIGHTNING',desc:'1–200 DMG · 4 chains',longDesc:'Lightning strikes the first target and chains to 4 additional enemies within 120 units. Each impact has a 50% chance to Shock. Piercing Fangs and Spread Shot add chains, up to 25 bounces. Forward Shot adds up to two independent Lightning bolts at distinct, randomly varied angles: one behind you with the first upgrade, then one to either rear side with the second. Maximum 3 bolts per attack.',tier:'rare'},
    {id:'poison',element:'poison',name:'POISON',desc:'15 DPS · Toxic splash',longDesc:'Toxic Orb bursts on the first enemy and adds 1 permanent Poison stack to all enemies in a 55-unit radius, matching Fireball. Each stack may crit. Piercing Fangs extends the Toxic Orb and Poison Proliferate radius by 10% per point. Death with 5+ stacks causes Poison Proliferate.',tier:'rare'}
  ];
  const ELEMENT_DAMAGE={blood:21.6,fire:43.2,lightning:1,poison:0}; // +8% base Blood and Fire
  const ELEMENT_ATTACK_RATE={blood:1,fire:1,lightning:1,poison:2};
  // User-supplied v0.23 art: four starting elements without arrows, 18
  // power-ups with upgrade arrows. Each cell already has the new gold frame.
  // 5 x 5 atlas, row major; other non-power-up game icons are unchanged.
  const SKILL_ICON_CELLS={"blood":[0,0],"fire":[1,0],"lightning":[2,0],"poison":[3,0],"blood_power":[4,0],"fire_power":[0,1],"lightning_power":[1,1],"poison_power":[2,1],"hemorrhagic_burst":[3,1],"brutality":[4,1],"rapid_fire":[0,2],"movement":[1,2],"vitality":[2,2],"regen":[3,2],"armor":[4,2],"knowledge":[0,3],"magnet":[1,3],"forward":[2,3],"spread":[3,3],"pierce":[4,3],"crit":[0,4],"crit_damage":[1,4]};
  // The opening choice is concise; the Grimoire shows the fuller explanation.
  function elementDescriptionHTML(choice,detailed=false){
    return (detailed?choice?.longDesc:choice?.desc)||'';
  }
  function damageStatRows(p){
    const fmt=n=>String(Number(n.toFixed(2)));
    const direct=p.damage+p.flatDamage;
    // Show only applicable attack types. The DoT value is the BASE effect
    // per application before crits; Blood's initial hit can scale the bleed.
    if(p.element==='blood')return [
      ['DIRECT HIT',fmt(direct)],
      ['DAMAGE OVER TIME',`${fmt(direct)} / 8s per stack (max 8)`]
    ];
    if(p.element==='fire')return [
      ['DIRECT HIT',fmt(direct)],
      ['DAMAGE OVER TIME',`${fmt(burnDps(p))} DPS × 2s (1 Burn)`]
    ];
    if(p.element==='lightning')return [
      ['DIRECT HIT',`${fmt(p.damage+p.flatDamage)}–${fmt(p.damage*200+p.flatDamage)}`]
    ];
    if(p.element==='poison')return [
      ['DAMAGE OVER TIME',`${fmt(POISON_DPS*p.poisonMultiplier)} DPS / stack`]
    ];
    return [['DIRECT HIT',fmt(direct)]];
  }
  function powerIcon(id){
    const xy=SKILL_ICON_CELLS[SURVIVAL_BOONS.find(p=>p.id===id)?.icon||id];
    if(!xy)return '<span class="glyph">✦</span>';
    // Fractions of the atlas extent; the CSS background-size is 500% 500%.
    return `<span class="glyph ability-icon skill-icon-v023" style="background-position:${xy[0]*25}% ${xy[1]*25}%" role="img" aria-label="${id.replaceAll('_',' ')}"></span>`;
  }

  const MUSIC_TRACKS = {
    caverns:{label:'Ancient Caverns',src:'https://opengameart.org/sites/default/files/caverns.ogg'}
  };

  const sprite = window.CrimsonSprites.get;

  const keys = new Set();
  let state = 'intro', game = null, raf = 0, last = 0, animTime = 0, shake = 0, flash = 0, muted = false, musicVolume = 10, sfxVolume = 5, sfx = null;
  let musicPlayer = null, currentTrack = 'caverns';
  // Four local CC0 Freesound samples: max 7 attack cues/s, max 2 voices.
  // One cue per attack action, NOT per multishot projectile or enemy hit.
  const ATTACK_AUDIO_PATHS=Object.freeze({
    blood:'assets/audio/attack-blood.mp3',
    fire:'assets/audio/attack-fire.mp3',
    lightning:'assets/audio/attack-lightning.mp3',
    poison:'assets/audio/attack-poison.mp3'
  });
  const ATTACK_AUDIO_MAX_RATE=7,ATTACK_AUDIO_MAX_VOICES=2;
  // User-uploaded short CC0 clips; per-element gain balances loudness.
  const ATTACK_AUDIO_CUTS={blood:.18,fire:.19,lightning:.13,poison:.18};
  const ATTACK_AUDIO_GAIN={blood:.60,fire:1,lightning:1.55,poison:1.55};
  let attackBuffers=Object.create(null),attackAudioLoading=false,attackLastAt=-Infinity,attackVoices=[];
  let sfxCompressor=null,sfxLimiter=null;
  function ensureSfx(){
    if(!sfx){
      sfx=new (window.AudioContext||window.webkitAudioContext)();
      sfxCompressor=sfx.createDynamicsCompressor();
      sfxCompressor.threshold.value=-21;
      sfxCompressor.knee.value=10;
      sfxCompressor.ratio.value=4;
      sfxCompressor.attack.value=.003;
      sfxCompressor.release.value=.13;
      sfxLimiter=sfx.createDynamicsCompressor();
      sfxLimiter.threshold.value=-4;
      sfxLimiter.knee.value=0;
      sfxLimiter.ratio.value=18;
      sfxLimiter.attack.value=.001;
      sfxLimiter.release.value=.07;
      sfxCompressor.connect(sfxLimiter);sfxLimiter.connect(sfx.destination);
    }
    if(sfx.state==='suspended')sfx.resume().catch(()=>{});
    return sfx;
  }
  async function loadAttackAudio(){
    if(attackAudioLoading||Object.keys(attackBuffers).length===4)return;
    attackAudioLoading=true;
    try{
      const audio=ensureSfx();
      await Promise.all(Object.entries(ATTACK_AUDIO_PATHS).map(async ([element,path])=>{
        if(attackBuffers[element])return;
        try{
          const response=await fetch(path);
          if(!response.ok)throw new Error('Audio '+response.status);
          attackBuffers[element]=await audio.decodeAudioData(await response.arrayBuffer());
        }catch(err){console.warn('Attack audio unavailable:',element,err);}
      }));
    }finally{attackAudioLoading=false;}
  }
  function playAttackSample(element){
    const audio=ensureSfx(),now=audio.currentTime;
    if(now-attackLastAt+0.002<1/ATTACK_AUDIO_MAX_RATE)return 'skip';
    attackVoices=attackVoices.filter(voice=>voice.endAt>now);
    if(attackVoices.length>=ATTACK_AUDIO_MAX_VOICES)return 'skip';
    attackLastAt=now;
    const buffer=attackBuffers[element];
    if(!buffer)return 'fallback';
    const source=audio.createBufferSource(),gain=audio.createGain();
    source.buffer=buffer;
    source.playbackRate.value=.96+Math.random()*.08; // Subtle +/-4% pitch variation.
    const length=Math.min(ATTACK_AUDIO_CUTS[element]||.18,buffer.duration/source.playbackRate.value);
    const fadeStart=Math.max(.004,length-.025);
    const volume=.70*(ATTACK_AUDIO_GAIN[element]||1)*sfxVolume/100;
    gain.gain.setValueAtTime(0,now);
    gain.gain.linearRampToValueAtTime(volume,now+.004);
    gain.gain.setValueAtTime(volume,now+fadeStart);
    gain.gain.linearRampToValueAtTime(0,now+length);
    source.connect(gain);gain.connect(sfxCompressor);
    const voice={endAt:now+length};
    attackVoices.push(voice);
    source.onended=()=>{const i=attackVoices.indexOf(voice);if(i>=0)attackVoices.splice(i,1);source.disconnect();gain.disconnect();};
    source.start(now);source.stop(now+length);
    return 'played';
  }

  function ensureMusicPlayer(){
    if (musicPlayer) return musicPlayer;
    musicPlayer = new Audio();
    musicPlayer.loop = true;
    musicPlayer.preload = 'auto';
    musicPlayer.volume = muted ? 0 : musicVolume / 100;
    return musicPlayer;
  }
  function syncMusic(){
    const track = MUSIC_TRACKS[currentTrack];
    const player = ensureMusicPlayer();
    if (player.getAttribute('src') !== track.src) player.setAttribute('src',track.src);
    player.volume = muted ? 0 : musicVolume / 100;
    if(muted || musicVolume === 0){ player.pause(); return; }
    player.play().catch(()=>{});
  }
  function changeTrack(id){ currentTrack = id in MUSIC_TRACKS ? id : 'caverns'; syncMusic(); }

  // Both modes are selectable immediately, for every run.
  // The results screen returns to this choice instead of forcing Hardcore.
  function returnToModeSelect(){
    if(state!=='end')return;
    game=null;state='intro';keys.clear();shake=0;flash=0;
    el.end.classList.add('hidden');
    el.intro.classList.remove('hidden');
    el.hud.hidden=true;el.xpStrip.hidden=true;el.bossBar.hidden=true;
    el.inventory.classList.add('hidden');el.inventoryBtn.hidden=true;
    el.msg.textContent='';el.status.textContent='CHOOSE YOUR MODE';
    el.start.focus();
  }
  function startGame(easyMode=false){
    game = {
      time:0,totalXP:0,totalHealing:0,totalDamage:0,death:null,endingAt30:false,easyMode:Boolean(easyMode),spawnCounter:0,difficultyTier:0,
      perkRanks:Object.create(null),perkOrder:[],perkTiers:Object.create(null),
      player:{enemyBleed:[],x:0,y:0,hp:100,maxHp:100,speed:100,damage:30,attackRate:1,multishot:1,forwardShots:0,spreadShots:0,flatDamage:0,elementRank:0,pierce:0,magnet:1,xp:0,level:1,next:13,shotCd:.15,hitCd:0,walk:0,face:1,attackAnim:0,attackDir:0,attackSide:1,projectileSpeed:1,projectileSize:1,armor:0,critChance:0.06,critDamage:1.6,fireChance:0,frostChance:0,chainChance:0,blastChance:0,xpBonus:1,bossDamage:1,regen:0,orbits:0,orbitCd:0,reviveCharges:0,element:null,elementDamageBonus:0,bloodLance:0,bloodOrbChance:0,bloodSplashChance:0,hemorrhagicBurst:false,stormBonus:0,poisonMultiplier:1,poisonPowerUnits:0,hemorrhagicBurstBoost:1,fountainRegenTime:0,fountainRegenTick:0,magnetBuffTime:0},
      enemies:[], shots:[], drops:[], particles:[], texts:[], stains:[], corpses:[], gibs:[], impacts:[], slashBursts:[], magicFx:[], poisonBursts:[], bolts:[], fountains:[], magnetShrines:[], powerShrines:[], nextFountainAt:rand(44,60), nextMagnetAt:45, magnetSpawned:false, nextPowerShrineAt:120, powerShrineSpawned:false, kills:0, spawn:.27, worldTime:0, upgradeChoices:[], nextNotice:25, bossWaves:0,bossNext:Infinity,bossSpawned:new Set(),rerolls:3,banishes:3,banned:new Set(),banishMode:false,elementChosen:false
    };
    spawnFountain(true);
    spawnFountain(true);
    state='upgrade';
    shake=0;flash=0;keys.clear();
    el.intro.classList.add('hidden'); el.end.classList.add('hidden'); el.pause.classList.add('hidden');
    el.inventory.classList.add('hidden');el.inventoryBtn.hidden=true;
    el.hud.hidden = false; el.xpStrip.hidden = false; el.bossBar.hidden = true; el.msg.textContent = ''; el.status.textContent = 'CHOOSE YOUR STARTING ELEMENT';
    updateHUD();
    openUpgrade();
    if(game.easyMode)el.status.textContent='EASY MODE · CHOOSE ELEMENT';
    // Audio begins after the player chooses a school (browser gesture).

  }

  // Blood fountains are stationary one-use healing pickups. Keep them separated
  // in world coordinates and prefer positions beyond the current camera view.
  function spawnFountain(initial=false){
    if(!game || game.fountains.length>=4) return false;
    const p=game.player;
    for(let attempt=0;attempt<48;attempt++){
      const a=rand(0,TAU), d=rand(initial?570:480,initial?1000:1120);
      const x=p.x+Math.cos(a)*d, y=p.y+Math.sin(a)*d;
      if(game.fountains.some(f=>dist2(x,y,f.x,f.y)<720*720))continue;
      game.fountains.push({x,y});
      return true;
    }
    return false;
  }

  // First Magnet Shrine is guaranteed at 00:45 of gameplay, closer to the
  // hunter. Further shrines arrive 90–150s after the previous pickup.
  // The deterministic fallback prevents unlucky placement rolls from
  // cancelling the guaranteed first shrine.
  function spawnMagnetShrine(first=false){
    const g=game;if(!g||g.magnetShrines.length)return false;
    const p=g.player;
    const place=(x,y)=>{
      if(g.fountains.some(f=>dist2(x,y,f.x,f.y)<300*300))return false;
      g.magnetShrines.push({x,y});return true;
    };
    for(let i=0;i<45;i++){
      const angle=rand(0,TAU),radius=rand(first?260:330,first?440:680);
      if(place(p.x+Math.cos(angle)*radius,p.y+Math.sin(angle)*radius))return true;
    }
    // Check many nearby fixed positions when RNG misses all safe spots.
    for(const radius of [320,440,560,680,820]){
      for(let i=0;i<24;i++){
        const a=TAU*i/24;
        if(place(p.x+Math.cos(a)*radius,p.y+Math.sin(a)*radius))return true;
      }
    }
    // Absolute fallback: never miss a scheduled shrine.
    g.magnetShrines.push({x:p.x+320,y:p.y});return true;
  }
  // Guaranteed at 02:00, later 4–6 minutes after each collected shrine.
  function spawnPowerShrine(first=false){
    const g=game;if(!g||g.powerShrines.length)return false;
    const p=g.player;
    const place=(x,y)=>{
      if(g.fountains.some(f=>dist2(x,y,f.x,f.y)<220*220))return false;
      if(g.magnetShrines.some(m=>dist2(x,y,m.x,m.y)<200*200))return false;
      g.powerShrines.push({x,y});return true;
    };
    for(let i=0;i<48;i++){
      const a=rand(0,TAU),d=rand(first?270:350,first?450:660);
      if(place(p.x+Math.cos(a)*d,p.y+Math.sin(a)*d))return true;
    }
    for(const d of [320,440,560,720,900])for(let i=0;i<24;i++){
      const a=TAU*i/24;
      if(place(p.x+Math.cos(a)*d,p.y+Math.sin(a)*d))return true;
    }
    g.powerShrines.push({x:p.x+320,y:p.y});return true;
  }
  // Transfer all live XP from the entire world in one pickup, not only
  // the viewport or the usual player magnet radius.
  function collectAllXP(){
    const g=game;
    if(!g||!g.drops.length)return 0;
    const value=g.drops.reduce((sum,d)=>sum+d.value,0);
    g.drops.length=0;
    if(value>0){
      addParticles(g.player.x,g.player.y,'#6edaff',20,110,2,4);
      gainXP(value);
    }
    return value;
  }
  function updateFountains(dt){
    const g=game, p=g.player;
    if(g.time>=g.nextFountainAt){
      // Retire distant unseen fountains to keep new spawns relevant to exploration.
      g.fountains=g.fountains.filter(f=>dist2(p.x,p.y,f.x,f.y)<2400*2400);
      spawnFountain();
      g.nextFountainAt=g.time+rand(42,64);
    }
    // Retire unreachable shrines and offer a replacement soon if one is lost.
    if(g.magnetShrines.length){
      g.magnetShrines=g.magnetShrines.filter(s=>dist2(p.x,p.y,s.x,s.y)<2500*2500);
      if(!g.magnetShrines.length&&g.nextMagnetAt===Infinity)
        g.nextMagnetAt=g.time+rand(30,60);
    }
    if(g.time>=g.nextMagnetAt){
      if(spawnMagnetShrine(!g.magnetSpawned)){
        g.magnetSpawned=true;
        g.nextMagnetAt=Infinity; // Await pickup before scheduling the next one.
      }else g.nextMagnetAt=g.time+10;
    }
    // Only one active shrine; if lost far offscreen, replace it soon.
    if(g.powerShrines.length){
      g.powerShrines=g.powerShrines.filter(s=>dist2(p.x,p.y,s.x,s.y)<2600*2600);
      if(!g.powerShrines.length&&g.nextPowerShrineAt===Infinity)
        g.nextPowerShrineAt=g.time+rand(40,65);
    }
    if(g.time>=g.nextPowerShrineAt){
      if(spawnPowerShrine(!g.powerShrineSpawned)){
        g.powerShrineSpawned=true;
        g.nextPowerShrineAt=Infinity;
      }else g.nextPowerShrineAt=g.time+10;
    }
    for(let i=g.powerShrines.length-1;i>=0;i--){
      const shrine=g.powerShrines[i];
      if(dist2(p.x,p.y,shrine.x,shrine.y)>39*39)continue;
      const perk=rollPowerShrineReward();
      if(!perk)continue;
      const tier=Math.random()<.25?'mythic':'legendary';
      g.powerShrines.splice(i,1);
      g.nextPowerShrineAt=g.time+rand(240,360);
      grantPowerUp({...perk,tier});
      addParticles(shrine.x,shrine.y,'#ffb76b',40,110,2,4);
      addImpact(shrine.x,shrine.y,65,'#ff673f');
      floatText(p.x,p.y-45,tier.toUpperCase()+' POWER!','#ffe9b4',12);
      flashMessage('✦ '+tier.toUpperCase()+' '+perk.name+' · POWER SHRINE',3300);
      playSound('level');
    }
    for(let i=g.magnetShrines.length-1;i>=0;i--){
      const shrine=g.magnetShrines[i];
      if(dist2(p.x,p.y,shrine.x,shrine.y)>40*40)continue;
      g.magnetShrines.splice(i,1);
      g.nextMagnetAt=g.time+rand(90,150);
      p.magnetBuffTime=15; // Refresh, never stack.
      addParticles(shrine.x,shrine.y,'#8deaff',35,130,2,4);
      addImpact(shrine.x,shrine.y,60,'#62cfff');
      playSound('level');
      flashMessage('✦ MAGNET SHRINE · ALL XP COLLECTED · 15s GLOBAL XP',2300);
      collectAllXP();
    }
    for(let i=g.fountains.length-1;i>=0;i--){
      const f=g.fountains[i];
      if(dist2(p.x,p.y,f.x,f.y)>36*36)continue;
      // Life shrine gives no instant HP; only 1 HP/s for 30s.
      p.fountainRegenTime=30;
      p.fountainRegenTick=0;
      g.fountains.splice(i,1);
      floatText(p.x,p.y-36,'REGEN · 30s','#ffb0c3',13);
      addParticles(f.x,f.y,'#ff4769',25,100,2,4);
      addImpact(f.x,f.y,35,'#ff5c82');
      playSound('level');
      flashMessage('♥ LIFE SHRINE · +1 HP/s FOR 30s',1900);
    }
  }

  // Major danger spikes at 05:00, 10:00, 15:00, 20:00 and 25:00.
  // Multipliers are TOTAL stage bonuses on top of the existing minute-by-minute
  // ramp. Keeping a finite enemy cap protects performance under heavy pressure.
  const DIFFICULTY_SURGES=[
    {hp:1,damage:1,speed:1,spawn:1,aggression:1},
    {hp:1.5,damage:1.15,speed:1.12,spawn:1.5,aggression:1.15},
    {hp:2.4,damage:1.35,speed:1.22,spawn:2,aggression:1.3},
    {hp:3.5,damage:1.55,speed:1.32,spawn:2.6,aggression:1.45},
    {hp:5,damage:1.8,speed:1.42,spawn:3.2,aggression:1.6},
    {hp:7,damage:2.1,speed:1.55,spawn:4,aggression:1.8}
  ];
  // Hardcore-only second-half escalation; the original DIFFICULTY_SURGES
  // above remain the exact source of truth for Easy and the first 15 minutes.
  // Each entry is a TOTAL multiplier, not an additional stacked modifier.
  const HARDCORE_ENDGAME_SURGES={
    3:{hp:8,damage:2.25,speed:1.45,spawn:5.2,aggression:1.85},
    4:{hp:15.5,damage:3.15,speed:1.58,spawn:8,aggression:2.1},
    5:{hp:29,damage:4.5,speed:1.7,spawn:11,aggression:2.4}
  };
  function surgeFor(tier,easy=false){
    return easy||tier<3?DIFFICULTY_SURGES[tier]:HARDCORE_ENDGAME_SURGES[tier];
  }
  const SURGE_TITLES=['','THE SLAUGHTER BEGINS','NIGHTMARE UNLEASHED','NO MERCY','THE ABYSS OPENS','FINAL ONSLAUGHT'];
  function difficultyTier(seconds){return Math.min(5,Math.floor(Math.max(0,seconds)/300));}
  function difficultyAt(seconds,easy=false){
    const minute=Math.min(29,Math.floor(Math.max(0,seconds)/60));
    const surge=surgeFor(difficultyTier(seconds),easy),factor=easy?.5:1;
    // Previous spawning plateaued at 40, so late-game Hardcore could not
    // increase horde pressure beyond that cap. Easy stays at the old cap.
    const spawnCap=!easy&&minute>=15?72:40;
    return {minute,
      hp:Math.pow(1.045,minute)*surge.hp*factor,
      damage:Math.pow(1.025,minute)*surge.damage*factor,
      speed:Math.pow(1.018,minute)*surge.speed*factor,
      spawn:Math.min(spawnCap,Math.min(8,2*Math.pow(1.14,minute))*surge.spawn)*factor,
      aggression:surge.aggression*factor};
  }
  function applyDifficultySurge(g,newTier){
    const previous=surgeFor(g.difficultyTier,g.easyMode),next=surgeFor(newTier,g.easyMode);
    for(const e of g.enemies){
      e.hp*=next.hp/previous.hp;e.maxHp*=next.hp/previous.hp;
      e.damage*=next.damage/previous.damage;e.speed*=next.speed/previous.speed;
      e.aggression*=next.aggression/previous.aggression;
    }
    g.difficultyTier=newTier;
    const pool=g.time<600?window.CrimsonMonsters.early:window.CrimsonMonsters.late;
    // Extra pressure at Hardcore 15/20/25 minutes, bounded by the same
    // 230-enemy active limit. Easy keeps the original burst size.
    const extra=!g.easyMode&&newTier>=3?8+(newTier-3)*6:0;
    const count=Math.max(0,Math.min(230-g.enemies.length,10+newTier*4+extra)),offset=rand(0,TAU);
    for(let i=0;i<count;i++)spawnEnemy(pool[i%pool.length],rand(165,225),offset+TAU*i/Math.max(1,count));
    g.spawn=Math.min(g.spawn,.08);
    flashMessage('☠ '+SURGE_TITLES[newTier],2000);
    shake=Math.max(shake,3+newTier);
  }
  function enemyTarget(enemy,player){
    const mode=enemy.aiRole||0,pressure=enemy.aggression||1;
    if(!mode)return {x:player.x,y:player.y};
    let vx=player.moveX||0,vy=player.moveY||0;
    // Even a stationary hero can be surrounded, rather than always targeted
    // at exactly the same center point by every enemy.
    if(Math.hypot(vx,vy)<.1){
      const dist=Math.max(1,Math.hypot(player.x-enemy.x,player.y-enemy.y));
      vx=(player.x-enemy.x)/dist;vy=(player.y-enemy.y)/dist;
    }
    const ahead=(mode>=3?74:25)*pressure;
    const flank=(mode%2?1:-1)*42*pressure;
    return {x:player.x+vx*ahead-vy*flank,y:player.y+vy*ahead+vx*flank};
  }
  function spawnEnemy(type=null,distance=null,angle=null,source=null){
    if(!ENEMY_SPAWNING_ENABLED||!game||game.enemies.length>=230)return null;
    const t=game.time,p=game.player;
    let pool=t<600?window.CrimsonMonsters.early:window.CrimsonMonsters.late;
    if(t<145){
      const unlock={skeleton:0,plague_rat:18,eye:48,skeleton_archer:85,zombie:135};
      pool=pool.filter(id=>t>=unlock[id]);
    }
    if(!type){
      let r=Math.random()*pool.reduce((n,id)=>n+ENEMIES[id].weight,0);
      type=pool.find(id=>(r-=ENEMIES[id].weight)<=0)||pool[0];
    }
    const def=ENEMIES[type];if(!def)return null;
    const origin=source||p,d=distance??rand(...(t>=600?[145,235]:[215,330])),a=angle??rand(0,TAU);
    const diff=difficultyAt(t,game.easyMode),hp=Math.ceil(def.hp*diff.hp*(source?.summoned?.65:1));
    const e={type,x:origin.x+Math.cos(a)*d,y:origin.y+Math.sin(a)*d,
      hp,maxHp:hp,speed:def.speed*diff.speed,damage:def.damage*diff.damage,r:def.r,
      phase:rand(0,TAU),shot:rand(1,2),hit:0,knockX:0,knockY:0,
      aiRole:game.spawnCounter++%5,aggression:diff.aggression,attackCd:rand(.4,1.5),
      attackWindup:0,attackAnim:0,attackState:'',attackTimer:0,attackStage:0,
      chargeAngle:0,chargeTravel:0,summonCd:def.summonEvery?rand(7,12):0,
      summoned:Boolean(source?.summoned),chargeHit:false};
    game.enemies.push(e);return e;
  }
  function spawnBoss(type){
    const def=ENEMIES[type];
    if(!def||game.bossSpawned.has(type))return;
    if(game.enemies.length>=230){const old=game.enemies.findIndex(e=>!ENEMIES[e.type]?.boss);if(old>=0)game.enemies.splice(old,1);}
    const e=spawnEnemy(type,Math.max(250,def.r+190));
    if(!e)return;
    game.bossSpawned.add(type);
    e.attackCd=type==='boss1'?3.3:2;
    flashMessage('⚔ '+def.name.toUpperCase()+' APPEARS',2300);
    shake=Math.max(shake,4);playSound('boss');
    el.bossBar.hidden=false;
  }

  // Exactly at 30:00 normal combat stops. An invulnerable Death rushes in,
  // reaches the hero, and forces the end scoreboard. Running or damage cannot
  // prevent the scripted finale.
  function startDeathArrival(){
    if(!game||state!=='playing'||game.death)return;
    const p=game.player;
    game.endingAt30=true;
    game.death={x:p.x+320,y:p.y-80,age:0,hit:false};
    game.time=DURATION;
    state='death';
    keys.clear();
    el.inventoryBtn.hidden=true;
    el.bossBar.hidden=true;
    el.status.textContent='30:00';
    flashMessage('...',1000);
    shake=Math.max(shake,8);
    playSound('boss');
    updateHUD();
  }
  function updateDeath(dt){
    if(state!=='death'||!game?.death)return;
    const d=game.death,p=game.player;
    d.age+=dt;
    const dx=p.x-d.x,dy=p.y-d.y,dist=Math.hypot(dx,dy);
    const step=Math.min(dist,Math.max(1500,dist*6)*dt);
    if(dist>.001){d.x+=dx/dist*step;d.y+=dy/dist*step;}
    if(dist<=30||d.age>=1.25){
      d.x=p.x;d.y=p.y;
      p.hp=0;
      shake=13;flash=.9;
      addBloodBurst(p.x,p.y,55,'#d00840');
      addImpact(p.x,p.y,105,'#ff244d');
      die(true);
    }
  }
  // Draw the current Reaper artwork, or a procedural silhouette if
  // the image cannot load.
  function drawDeath(camX,camY,t){
    const d=game?.death;if(!d)return;
    const x=d.x-camX,y=d.y-camY,glow=.55+.45*Math.sin(t*11);
    ctx.save();
    ctx.globalAlpha=.28;ctx.fillStyle='#ed214b';
    ctx.beginPath();ctx.ellipse(x,y+12,42,14,0,0,TAU);ctx.fill();
    ctx.globalAlpha=1;
    ctx.shadowColor='#ff1744';ctx.shadowBlur=12+18*glow;
    if(deathArt.complete&&deathArt.naturalWidth){
      const aspect=deathArt.naturalWidth/deathArt.naturalHeight;
      const h=154,w=Math.min(170,154*aspect);
      ctx.drawImage(deathArt,x-w/2,y-h+23,w,h);
    }else{
      // Simple grim silhouette, intentionally not the previous artwork.
      ctx.fillStyle='#150d19';ctx.strokeStyle='#ce254c';ctx.lineWidth=2;
      ctx.beginPath();ctx.moveTo(x,y-93);ctx.quadraticCurveTo(x-39,y-76,x-40,y-26);
      ctx.lineTo(x-55,y+19);ctx.lineTo(x-15,y+4);ctx.lineTo(x+4,y+24);
      ctx.lineTo(x+37,y+10);ctx.lineTo(x+46,y+20);
      ctx.quadraticCurveTo(x+48,y-61,x+19,y-91);ctx.closePath();ctx.fill();ctx.stroke();
      ctx.fillStyle='#d3b5ad';ctx.beginPath();ctx.ellipse(x,y-59,15,18,0,0,TAU);ctx.fill();
      ctx.fillStyle='#0b080f';ctx.fillRect(x-15,y-65,30,9);
      ctx.fillStyle='#ff315d';ctx.fillRect(x-10,y-61,5,3);ctx.fillRect(x+5,y-61,5,3);
      ctx.strokeStyle='#d9d3cb';ctx.lineWidth=5;
      ctx.beginPath();ctx.moveTo(x+24,y+10);ctx.lineTo(x+66,y-113);ctx.stroke();
      ctx.strokeStyle='#a2a2ac';ctx.lineWidth=8;ctx.beginPath();
      ctx.arc(x+36,y-107,38,-1.5,0.3);ctx.stroke();
    }
    ctx.restore();
  }
  // Direct hits grant 0.5s protection from further contact, projectiles
  // and AoE damage; any existing damage-over-time remains independent.
  const HUNTER_HIT_GRACE_SECONDS=0.5;
  function tryPhoenixRevive(){
    const p=game.player;
    if(p.hp>0||p.reviveCharges<=0)return false;
    p.reviveCharges--;
    p.hp=Math.max(1,Math.ceil(p.maxHp*.35));
    p.hitCd=Math.max(p.hitCd,2);
    p.enemyBleed.length=0;
    addParticles(p.x,p.y,'#ffca77',38,105,2,5);
    flashMessage('✦ PHOENIX SIGIL · REVIVED',2100);
    playSound('level');
    updateHUD();
    return true;
  }
  function damagePlayer(value){
    const p=game.player;
    if(p.hitCd>0)return false;
    const received=Math.max(1,Math.ceil(value*(1-p.armor)));p.hp=Math.max(0,p.hp-received);p.hitCd=HUNTER_HIT_GRACE_SECONDS;shake=Math.max(shake,6);flash=.18;
    addBloodBurst(p.x,p.y,12,'#ad1339'); floatText(p.x,p.y-24,`-${received}`,'#ffc9cd');
    playSound('hurt');
    if(p.hp<=0&&!tryPhoenixRevive()) die(false);
    return true;
  }

  function addSlashBurst(x,y,angle,critical=false){
    game.slashBursts.push({x,y,angle,life:.24,max:.24,size:critical?26:19});
    if(game.slashBursts.length>70)game.slashBursts.shift();
    addParticles(x,y,'#ffe4bc',critical?8:5,critical?105:75,1,3);
    addImpact(x,y,critical?27:18,'#ffb99b');
  }

  function addParticles(x,y,color,count=7,power=55,sizeA=2,sizeB=3,gravity=0){
    for(let i=0;i<count;i++){
      if(game.particles.length>360) break;
      const a=rand(0,TAU), spd=rand(power*.25,power);
      game.particles.push({x,y,vx:Math.cos(a)*spd,vy:Math.sin(a)*spd + gravity,life:rand(.18,.78),max:.78,size:Math.random()<.55?sizeA:sizeB,color});
    }
  }
  function addBloodBurst(x,y,amount=16,base='#8d0d29'){
    const palette=[base,'#bc163d','#e0536f','#4f0012'];
    for(let i=0;i<amount;i++){
      if(game.particles.length>520)break;
      const color = palette[(Math.random()*palette.length)|0];
      const a = rand(0, TAU), spd = rand(30, 125);
      game.particles.push({x,y,vx:Math.cos(a)*spd,vy:Math.sin(a)*spd - rand(0,20),life:rand(.35,.95),max:.95,size:Math.random()<.5?2:4,color, blood:true});
    }
  }
  function addStain(x,y,amount=2){
    for(let i=0;i<amount;i++){
      if(game.stains.length>110) game.stains.shift();
      game.stains.push({x:x+rand(-8,8),y:y+rand(-6,6),r:rand(5,14),alpha:rand(.28,.62),rot:rand(-.4,.4),tone:Math.random()<.35?'#4a0617':'#6a0019'});
    }
  }
  function floatText(x,y,text,color='#ffd8df',size=10){
    // Bound damage-number spam in late-game hordes; visual only, no lost damage.
    if(game.texts.length>=140)return;
    game.texts.push({x,y,text,color,size,life:.75,max:.75});
  }

  function playSound(kind){
    if(muted || sfxVolume === 0) return;
    try {
      if(kind==='start')void loadAttackAudio();
      if(kind==='shot'&&game?.player?.element){
        // Throttle only the audio: gameplay and shot frequency are unchanged.
        if(playAttackSample(game.player.element)!=='fallback')return;
      }
      const audio=ensureSfx();
      const o=audio.createOscillator(), g=audio.createGain(), now=audio.currentTime;
      const tone={shot:[280,105,.12,.053],hit:[96,45,.15,.065],pickup:[740,1100,.11,.045],level:[520,980,.45,.08],start:[180,390,.24,.05],hurt:[170,70,.2,.09],death:[300,55,.7,.065],boss:[110,52,.5,.11],crack:[380,95,.09,.07]}[kind]||[280,180,.1,.03];
      o.type = kind==='hit'||kind==='hurt' ? 'sawtooth' : 'triangle';
      o.frequency.setValueAtTime(tone[0],now); o.frequency.exponentialRampToValueAtTime(tone[1],now+tone[2]);
      g.gain.setValueAtTime(tone[3] * sfxVolume / 100,now); g.gain.exponentialRampToValueAtTime(.0001,now+tone[2]);
      o.connect(g); g.connect(sfxCompressor); o.start(now); o.stop(now+tone[2]);
    } catch(_){}
  }

  function gainXP(value){
    const p=game.player;
    const earned=Math.max(0,Number.isFinite(value*p.xpBonus)?value*p.xpBonus:0);
    game.totalXP+=earned;
    // XP still counts toward the run score, but no new level/card screens
    // are generated past the explicit safety cap.
    if(p.level>=MAX_HUNTER_LEVEL){p.xp=0;return;}
    p.xp+=earned;
    if(p.xp>=p.next){
      p.xp-=p.next;
      p.level++;
      p.next=p.level>=MAX_HUNTER_LEVEL?Infinity:
        Math.floor(12+p.level*8+p.level*p.level*1.5);
      state='upgrade';openUpgrade();playSound('level');
    }
  }
  function eligiblePowers(){return POWERS.filter(opt=>!game.banned.has(opt.id) && (!opt.can||opt.can(game.player)));}
  // Rare skills are weighted; Blood gets exclusive 40% Hemorrhagic Burst
  // as long as it is eligible. Everything respects bans and max ranks.
  function rollPowerShrineReward(){
    const eligible=eligiblePowers();
    const special=eligible.find(p=>p.id==='hemorrhagic_burst');
    if(special&&Math.random()<.40)return special;
    const pool=eligible.filter(p=>p!==special);
    if(!pool.length)return special||null;
    const weight=p=>p.id.endsWith('_power')?5:p.id==='crit_damage'?3:
      ['forward','spread','pierce','crit','rapid_fire'].includes(p.id)?2:1;
    let roll=Math.random()*pool.reduce((sum,p)=>sum+weight(p),0);
    for(const perk of pool){roll-=weight(perk);if(roll<0)return perk;}
    return pool[pool.length-1];
  }
  // Shared bookkeeping for level-ups and instant Shrine rewards.
  function grantPowerUp(choice){
    const magnitude=rarityScale(choice.tier);
    choice.apply(game.player,game,magnitude);
    if(!game.perkRanks[choice.id])game.perkOrder.push(choice.id);
    game.perkRanks[choice.id]=(game.perkRanks[choice.id]||0)+1;
    (game.perkTiers[choice.id]||(game.perkTiers[choice.id]=[])).push(choice.tier);
  }
  const DAMAGE_POWER_IDS=new Set(["brutality","rapid_fire","forward","spread","pierce","crit","crit_damage","blood_power","fire_power","lightning_power","poison_power","hemorrhagic_burst"]);
  const DEFENSE_POWER_IDS=new Set(["movement","vitality","regen","armor"]);
  // Four unique cards: guaranteed offensive, guaranteed defensive, 2 RNG.
  // Legendary Blood is rolled separately at 5% per entire offering.
  function withRarity(perk){
    // Survival fallback is a fixed reward, not a random rarity modifier.
    const tier=perk.survival?'common':rollRarity();
    return {...perk,tier,desc:perkDescription(perk.id,tier)};
  }
  function rollChoices(previous=[]){
    const eligible=eligiblePowers();
    const legendary=eligible.find(p=>p.id==='hemorrhagic_burst');
    const pool=eligible.filter(p=>p.id!=='hemorrhagic_burst'),selected=[];
    const pick=choices=>{
      const unused=choices.filter(p=>!selected.includes(p));
      if(!unused.length)return null;
      const fresh=unused.filter(p=>!previous.includes(p.id));
      const options=fresh.length?fresh:unused;
      const result=options[(Math.random()*options.length)|0];
      selected.push(result);return result;
    };
    let damage=pick(pool.filter(p=>DAMAGE_POWER_IDS.has(p.id)));
    const defense=pick(pool.filter(p=>DEFENSE_POWER_IDS.has(p.id)));
    if(legendary&&Math.random()<.05){
      if(damage)selected.splice(selected.indexOf(damage),1);
      damage=legendary;selected.push(legendary);
    }
    const random1=pick(pool),random2=pick(pool);
    // If a category ran dry, replace missing slots with repeatable bonuses.
    // Never throw: even an empty/banned standard pool gives four unique cards.
    const slots=[damage,defense,random1,random2];
    for(let i=0;i<slots.length;i++)
      if(!slots[i])slots[i]=pick(SURVIVAL_BOONS);
    return slots.map(withRarity);
  }
  function renderUpgrade(){
    const g=game;
    el.upgradeCards.replaceChildren();
    g.upgradeChoices.forEach((opt,index)=>{
      const b=document.createElement('button');b.type='button';b.className='upgrade-card perk-'+opt.tier;
      b.innerHTML=`<span class="perk-tier">${g.elementChosen?(opt.survival?'SURVIVAL · ':index===0?'ATTACK · ':index===1?'DEFENSE · ':'RANDOM · '):''}${opt.tier}</span><span class="perk-art-frame">${powerIcon(opt.id)}</span><strong>${opt.name}</strong><span class="detail">${opt.element?elementDescriptionHTML(opt):opt.desc}</span><span class="hotkey">[ ${index+1} ]</span>`;
      b.addEventListener('click',()=>chooseUpgrade(index));el.upgradeCards.appendChild(b);
    });
    const choosingElement=!g.elementChosen;
    el.upgrade.classList.toggle('element-select',choosingElement);
    el.reroll.hidden=choosingElement; el.banish.hidden=choosingElement;
    el.rerollCount.textContent=String(g.rerolls);el.banishCount.textContent=String(g.banishes);
    el.reroll.disabled=g.rerolls<=0||g.upgradeChoices.every(opt=>opt.survival);
    el.banish.disabled=g.banishes<=0 || eligiblePowers().length<=4;
    el.banish.classList.toggle('armed',g.banishMode);
    // Keep useful announcements for screen readers, without UI clutter.
    el.perkNotice.textContent=choosingElement?'Choose your starting element':
      g.banishMode?'Choose a power to banish. Press B to cancel.':
      'Choose your new power';
    el.upgrade.querySelector('h2').textContent=choosingElement?'CHOOSE YOUR ELEMENT':
      g.upgradeChoices.every(opt=>opt.survival)?'SURVIVAL REWARDS':'NEW POWER';

  }
  function openUpgrade(){
    game.banishMode=false;
    game.upgradeChoices=game.elementChosen?rollChoices():ELEMENT_CHOICES;
    renderUpgrade();el.upgrade.classList.remove('hidden');el.status.textContent='CHOOSE A NEW POWER';updateHUD();
  }
  function rerollUpgrades(){
    if(state!=='upgrade'||!game.elementChosen||game.rerolls<=0||
      game.upgradeChoices.every(opt=>opt.survival))return;
    const old=game.upgradeChoices.map(opt=>opt.id);
    game.rerolls--;game.banishMode=false;
    game.upgradeChoices=rollChoices(old);
    renderUpgrade();playSound('pickup');
  }
  function toggleBanish(){
    if(state!=='upgrade'||!game.elementChosen||game.banishes<=0)return;
    game.banishMode=!game.banishMode;renderUpgrade();
  }
  function chooseUpgrade(index){
    if(state!=='upgrade')return;
    const choice=game.upgradeChoices[index];if(!choice)return;
    if(!game.elementChosen){
      if(!choice.element)return;
      game.player.element=choice.element;game.elementChosen=true;
      el.inventoryBtn.hidden=false;
      game.player.damage=ELEMENT_DAMAGE[choice.element];
      game.player.attackRate=ELEMENT_ATTACK_RATE[choice.element];
      game.player.shotCd=0;
      attackLastAt=-Infinity;attackVoices=[];
      state='playing';el.upgrade.classList.add('hidden');
      el.status.textContent=`${choice.name} ATTUNED`;
      for(let i=0;i<5;i++)spawnEnemy('skeleton',rand(175,285),rand(0,TAU));
      flashMessage(`✦ ${choice.name} ATTUNED`,2200);playSound('start');syncMusic();updateHUD();return;
    }
    if(game.banishMode){
      if(choice.survival){flashMessage('SURVIVAL BONUS CANNOT BE BANISHED',1800);return;}
      if(game.banishes<=0||eligiblePowers().length<=4)return;
      const remaining=eligiblePowers().filter(p=>p.id!==choice.id);
      if(remaining.length<4||!remaining.some(p=>DAMAGE_POWER_IDS.has(p.id))||
         !remaining.some(p=>DEFENSE_POWER_IDS.has(p.id))){
        flashMessage('KEEP AT LEAST ONE ATTACK AND DEFENSE',1800);
        return;
      }
      game.banned.add(choice.id);game.banishes--;game.banishMode=false;
      game.upgradeChoices=rollChoices(game.upgradeChoices.map(p=>p.id));
      renderUpgrade();playSound('hit');return;
    }
    grantPowerUp(choice);
    addParticles(game.player.x,game.player.y,'#ff8ba0',28,105,2,4);
    state='playing';el.upgrade.classList.add('hidden');el.status.textContent='HUNT IN PROGRESS';
    flashMessage(`✦ ${choice.tier.toUpperCase()} ${choice.name}`,1800);
    // The magnet shrine may collect enough XP for multiple levels at once:
    // present every earned upgrade in sequence instead of losing levels.
    if(game.player.xp>=game.player.next)gainXP(0);
    updateHUD();
  }
  function flashMessage(text,ms=1750){ el.msg.textContent=text; clearTimeout(flashMessage.timer); flashMessage.timer=setTimeout(()=>el.msg.textContent='',ms); }

  function addScoreRows(parent,rows,kind){
    parent.replaceChildren();
    for(const [label,value] of rows){
      const node=document.createElement('div');node.className=kind;
      const caption=document.createElement('span');caption.textContent=label;
      const strong=document.createElement('strong');strong.textContent=String(value);
      node.append(caption,strong);parent.appendChild(node);
    }
  }
  function renderRunBoard(survived,best){
    const p=game.player;
    const num=n=>Math.round(n||0).toLocaleString('en-US');
    addScoreRows($('runSummary'),[
      ['SURVIVAL',timeText(game.time)],
      ['KILLS',num(game.kills)],
      ['TOTAL XP',num(game.totalXP)],
      ['LEVEL',p.level],
      ['HP RESTORED',num(game.totalHealing)],
      ['DAMAGE DEALT',num(game.totalDamage)]
    ],'run-summary-tile');
    addScoreRows($('runStats'),[
      ['ELEMENT',(p.element||'NONE').toUpperCase()],
      ['MAX HEALTH',p.maxHp],
      ['ATTACK RATE',p.attackRate.toFixed(2)+'/s'],
      ['MOVE SPEED',Math.round(p.speed)],
      ['CRIT CHANCE',Math.round(p.critChance*100)+'%'],
      ['CRIT DAMAGE','×'+p.critDamage.toFixed(2)],
      ['ARMOR',Math.round(p.armor*100)+'%'],
      ['XP MULTIPLIER','×'+p.xpBonus.toFixed(2)],
      ['PROJECTILES',attackProjectileCount(p)],
      ['PICKUP RADIUS',Math.round(84*p.magnet)]
    ],'run-stat-tile');
    const taken=game.perkOrder||[];
    const perks=taken.map(id=>{
      const perk=POWERS.find(x=>x.id===id);
      const tiers=game.perkTiers[id]||[];
      return perk?`${perk.name} ×${game.perkRanks[id]||1} [${tiers.map(t=>t.toUpperCase()).join(' / ')}]`:null;
    }).filter(Boolean);
    const list=$('runPerks');list.replaceChildren();
    if(!perks.length)list.textContent='No upgrades acquired';
    else for(const item of perks){
      const badge=document.createElement('span');badge.className='run-perk-chip';
      badge.textContent=item;list.appendChild(badge);
    }
    $('runBest').textContent=
      `BEST: ${timeText(best.time)}  ·  ${num(best.kills)} KILLS  ·  ${num(best.xp)} XP${survived?(ENEMY_SPAWNING_ENABLED?'  ·  RUN COMPLETE':'  ·  ARENA TEST COMPLETE'):''}`;
  }
  function die(won){
    if(state==='end')return;
    const survived=Boolean(won&&game.endingAt30);
    const emptyArenaComplete=survived&&!ENEMY_SPAWNING_ENABLED;
    state='end';
    el.end.classList.remove('hidden');
    el.xpStrip.hidden=true;
    $('runRibbon').hidden=!game.easyMode;
    $('endModeBadge').classList.toggle('is-easy',Boolean(game.easyMode));
    el.inventory.classList.add('hidden');
    el.inventoryBtn.hidden=true;
    el.bossBar.hidden=true;
    $('endTitle').textContent=emptyArenaComplete?'RUN COMPLETE':survived?'RUN COMPLETE':'YOU DIED';
    $('endEyebrow').textContent=emptyArenaComplete?'THIRTY MINUTES · EMPTY ARENA':survived?'THIRTY MINUTES COMPLETE':'THE NIGHT CLAIMS ANOTHER SOUL';
    $('endSub').textContent=emptyArenaComplete?'Enemy roster is being rebuilt and rebalanced.':survived?
      'You endured thirty minutes.':
      'The hunt ended before the Reaper appeared.';
    $('finalTime').textContent=timeText(game.time);
    $('finalKills').textContent=game.kills;
    $('finalLevel').textContent=game.player.level;
    const rank=game.kills>=1000?'CRIMSON LEGEND':game.kills>=300?'NIGHT REAPER':
      game.kills>=100?'BLOOD HUNTER':game.kills>=20?'CRYPT STALKER':'NOVICE HUNTER';
    $('huntRank').textContent=emptyArenaComplete?`ARENA TEST · ${rank}`:survived?`REAPER'S WITNESS · ${rank}`:rank;
    const current={time:Math.floor(game.time),kills:game.kills,xp:Math.floor(game.totalXP)};
    const best={...current};
    try{
      const prior=JSON.parse(localStorage.getItem('crimson-ruin-record-v018')||'{}');
      best.time=Math.max(prior.time||0,current.time);
      best.kills=Math.max(prior.kills||0,current.kills);
      best.xp=Math.max(prior.xp||0,current.xp);
      localStorage.setItem('crimson-ruin-record-v018',JSON.stringify(best));
    }catch(_){}
    $('bestKills').textContent=`BEST: ${best.kills} KILLS`;
    renderRunBoard(survived,best);
    $('runMode').textContent=game.easyMode?'EASY MODE USED':'HARDCORE MODE';
    // Easy Mode is available from the main menu on every new run.
    el.end.classList.toggle('victory',survived);
    el.status.textContent=emptyArenaComplete?'30:00 · ARENA TEST COMPLETE':survived?'30:00 · RUN COMPLETE':'HUNT FAILED';
    playSound(emptyArenaComplete?'level':'death');
  }
  // O opens a paused grimoire. Values and ranks come from the active run.
  function renderInventory(){
    if(!game || !game.elementChosen)return;
    const p=game.player;
    const chosen=ELEMENT_CHOICES.find(v=>v.element===p.element);
    el.inventoryElementIcon.innerHTML=powerIcon(p.element);
    el.inventoryElementName.textContent=chosen?.name || 'UNKNOWN';
    el.inventoryElementDesc.innerHTML=elementDescriptionHTML(chosen,true);
    el.inventoryElementRank.textContent='ELEMENT RANK '+(p.elementRank+1);
    el.inventoryPerks.replaceChildren();
    let perkTotal=0;
    for(const id of game.perkOrder){
      const perk=POWERS.find(v=>v.id===id)||SURVIVAL_BOONS.find(v=>v.id===id);
      const rank=game.perkRanks[id]||0;
      if(!perk||rank<1)continue;
      perkTotal+=rank;
      const row=document.createElement('article');
      const tiers=game.perkTiers[id]||[];
      const latest=tiers[tiers.length-1]||'common';
      row.className='inventory-perk perk-'+latest;
      row.innerHTML=`<span class="inventory-perk-icon">${powerIcon(id)}</span>
        <div class="inventory-perk-copy"><div class="inventory-perk-heading"><strong>${perk.name}</strong><span class="inventory-rank">RANK ${rank}</span></div>
        <p>${tiers.length>8?tiers.slice(0,4).map(v=>v.toUpperCase()).join(' · ')+' · … '+(tiers.length-6)+' MORE · '+tiers.slice(-2).map(v=>v.toUpperCase()).join(' · '):tiers.map(v=>v.toUpperCase()).join(' · ')}</p>
        <p>Latest: ${perkDescription(id,latest)}</p></div>`;
      el.inventoryPerks.appendChild(row);
    }
    if(!game.perkOrder.length){
      const empty=document.createElement('p');empty.className='inventory-empty';
      empty.textContent='No passive upgrades yet. Collect blue crystals to level up.';
      el.inventoryPerks.appendChild(empty);
    }
    el.inventoryPerkCount.textContent=perkTotal+' PICKED · '+game.perkOrder.length+' TYPES';
    const shots=attackProjectileCount(p);
    const fmt=(n,d=1)=>Number(n).toFixed(d);
    const stats=[
      ...damageStatRows(p),
      ['ATTACKS / SEC',fmt(p.attackRate,2)],
      ['MOVE SPEED',fmt(p.speed,0)],
      ['PROJECTILES',String(shots)],
      p.element==='blood'?['BLEED STACKS / HIT',String(1+p.pierce)]:
        p.element==='lightning'?['CHAIN BOUNCES',String(lightningChainCount(p))]:
        ['BLAST RADIUS',String(Math.round(55*(1+.1*p.pierce)))],
      ['CRITICAL',Math.round(p.critChance*100)+'%'],
      ['CRIT DAMAGE','×'+p.critDamage.toFixed(2)],
      ['ARMOR',Math.round(p.armor*100)+'%'],
      ['XP BONUS','×'+fmt(p.xpBonus,2)],
      ['PICKUP RANGE',fmt(84*p.magnet,0)],
      ['REGEN',fmt(p.regen,2)+' HP/s'],
      ['LIFE SHRINE REGEN',p.fountainRegenTime>0?`${Math.ceil(p.fountainRegenTime)}s · +1 HP/s`:'—'],
      ['MAGNET SHRINE',p.magnetBuffTime>0?`${Math.ceil(p.magnetBuffTime)}s · GLOBAL XP`:'—'],
      ['MAX HEALTH',String(p.maxHp)],
      ['REVIVAL CHARGES',String(p.reviveCharges||0)],
      ['BLEED CAP',p.element==='blood'?'8':'—']
    ];
    el.inventoryStats.replaceChildren();
    for(const [label,value] of stats){
      const tile=document.createElement('div');tile.className='inventory-stat';
      const caption=document.createElement('span');caption.textContent=label;
      const number=document.createElement('strong');number.textContent=value;
      tile.append(caption,number);el.inventoryStats.appendChild(tile);
    }
  }
  // The paused Codex uses one navigation controller for all knowledge sections.
  // All formulae and perk ranks below read existing gameplay functions / tables.
  const CODEX_SECTIONS={
    powers:['CHARACTER STATS','inventoryPowersTab','inventoryPowersPage'],
    bestiary:['MONSTER BESTIARY','inventoryBestiaryTab','inventoryBestiaryPage'],
    elements:['ELEMENTAL MECHANICS','inventoryElementsTab','inventoryElementsPage'],
    acquisition:['ITEM ACQUISITION','inventoryAcquisitionTab','inventoryAcquisitionPage'],
    catalog:['POWER-UP LIBRARY','inventoryCatalogTab','inventoryCatalogPage'],
    scaling:['ENEMY SCALING','inventoryScalingTab','inventoryScalingPage']
  };
  let inventorySection='powers',lastCodexSection='bestiary',bestiaryGroup='early',catalogGroup='offense',catalogRarity='common',codexFocus=null;
  function codexElement(tag,className='',value=''){
    const node=document.createElement(tag);
    if(className)node.className=className;
    if(value)node.textContent=value;
    return node;
  }
  function codexIntro(root,title,body){
    const heading=codexElement('h3','codex-page-title',title);
    const text=codexElement('p','codex-page-lead',body);
    root.append(heading,text);
  }
  function codexLink(root,section,label,focus=null){
    const button=codexElement('button','codex-crosslink',label+' ↗');
    button.type='button';
    button.addEventListener('click',()=>{codexFocus=focus;switchInventorySection(section);});
    root.append(button);return button;
  }
  function codexFilters(root,values,selected,change){
    const nav=codexElement('div','codex-filters');nav.setAttribute('role','group');nav.setAttribute('aria-label','Filter entries');
    for(const [value,label] of values){
      const button=codexElement('button','codex-filter'+(value===selected?' selected':''),label);
      button.type='button';button.setAttribute('aria-pressed',String(value===selected));
      button.addEventListener('click',()=>change(value));nav.append(button);
    }
    root.append(nav);
  }
  function codexArticle(title,shortText,body,open=false){
    const article=codexElement('details','codex-article');
    article.open=open;
    const summary=codexElement('summary','codex-article-heading',title);
    summary.append(codexElement('span','codex-article-short',shortText));
    const content=codexElement('div','codex-article-body',body);
    article.append(summary,content);
    return {article,content};
  }
  function switchInventorySection(section){
    if(state!=='inventory')return;
    // The pause menu has two main destinations: Character Stats and Encyclopedia.
    // Crosslinks between encyclopedia articles keep the Encyclopedia tab open.
    if(section==='encyclopedia')section=lastCodexSection;
    if(!CODEX_SECTIONS[section])section='powers';
    inventorySection=section;
    const character=section==='powers';
    if(!character)lastCodexSection=section;
    el.powersPage.hidden=!character;
    el.encyclopediaPage.hidden=character;
    el.powersTab.classList.toggle('active',character);
    el.encyclopediaTab.classList.toggle('active',!character);
    el.powersTab.setAttribute('aria-selected',String(character));
    el.encyclopediaTab.setAttribute('aria-selected',String(!character));
    for(const [key,[title,tabId,pageId]] of Object.entries(CODEX_SECTIONS)){
      if(key==='powers')continue;
      const active=key===section,tab=$(tabId),page=$(pageId);
      tab.classList.toggle('active',active);
      tab.setAttribute('aria-selected',String(active));
      page.hidden=!active;
    }
    const title=character?'CHARACTER STATS':'ENCYCLOPEDIA';
    $('inventoryTitle').textContent=title;
    el.status.textContent=title+' · PAUSED';
    if(character)renderInventory();
    else if(section==='bestiary')renderBestiary();
    else if(section==='elements')renderElements();
    else if(section==='acquisition')renderAcquisition();
    else if(section==='catalog')renderPowerLibrary();
    else if(section==='scaling')renderEnemyScaling();
  }
  function renderBestiary(){
    const root=el.bestiaryPage;root.replaceChildren();
    codexIntro(root,'FIELD GUIDE · MONSTERS','Select a group, then a creature for its attacks and combat stats.');
    codexFilters(root,[['early','00:00–10:00'],['late','AFTER 10:00'],['boss','BOSSES']],bestiaryGroup,value=>{bestiaryGroup=value;renderBestiary();});
    const grid=codexElement('div','codex-grid');
    const entries=window.CrimsonMonsters.entries.filter(m=>bestiaryGroup==='boss'?m.boss:bestiaryGroup==='early'?!m.boss&&m.phase===0:!m.boss&&m.phase===600);
    for(const monster of entries){
      const idx=window.CrimsonMonsters.entries.indexOf(monster);
      const card=codexArticle(monster.name,'HP '+monster.hp+' · SPEED '+monster.speed+' · HIT '+monster.damage,
        monster.attack+' every '+monster.interval+'s. '+monster.notes);
      const art=codexElement('span','codex-monster-art');
      // The original mini atlas remains visible until the HD artwork loads.
      art.style.backgroundImage="url('assets/monsters-hd-v032.webp'), url('assets/monsters-v031.png')";
      art.style.backgroundSize='1000% 1300%, 1300% 100%';
      art.style.backgroundPosition='0% '+(idx*100/12)+'%, '+(idx*100/12)+'% center';
      card.article.querySelector('summary').prepend(art);
      const tag=codexElement('p','codex-article-detail',monster.boss?'Boss appears '+timeText(monster.bossAt):
        'Spawn window: '+(monster.phase===0?'00:00–09:59':'10:00–29:59'));
      card.content.prepend(tag);
      if(monster.projectileSpeed)card.content.append(codexElement('p','codex-article-detail','Projectile speed: '+monster.projectileSpeed+' units/s'));
      if(monster.id==='blood_slime')codexLink(card.content,'elements','Compare Bleed mechanics','blood');
      grid.append(card.article);
    }
    root.append(grid);
    codexLink(root,'scaling','How monster stats scale every five minutes');
  }
  function renderElements(){
    const root=$('inventoryElementsPage');root.replaceChildren();
    codexIntro(root,'THE FOUR ELEMENTS','All four spells explained. Damage modifiers are additive to their base spell value; critical hits multiply direct damage.');
    const tiles=codexElement('div','codex-grid');
    const focus=codexFocus;codexFocus=null;
    const contents=[
      ['blood','BLOOD','Slow piercing spear · 80 units/s','Direct = (21.6 × (1 + 0.05 × Blood Power units) + Brutality). Each contact adds 1 + Piercing Fangs stacks, up to 8 lasting 8s. One stack = actual hit damage / 8 damage per second. A single spear may hit again after 0.6s. Hemorrhagic Burst replaces the damage-over-time stacks with an instant 8-stack blast.'],
      ['fire','FIRE','Exploding fireball · 290 units/s','Direct = 43.2 × (1 + 0.05 × Fire Power units) + Brutality. First hit explodes, radius = 55 × (1 + 0.1 × Piercing Fangs). Every target in the radius burns for 2s. Burn DPS = base Fire direct damage (before crit), refreshed on subsequent hits. All Fireballs from the same attack share one direct-hit record, including secondary blasts: only one can damage each enemy per salvo. Poison orbs can still shotgun.'],
      ['lightning','LIGHTNING','Chain Lightning · 235 units/s','Direct = random integer 1–200 × (1 + 0.05 × Lightning Power units) + Brutality. Each impact can Shock (50% chance, 4s); Shock doubles incoming direct damage. Base 4 chain jumps, +1 per Piercing Fangs and +2 per Spread Shot, max 25. Forward Shot adds 1 random rear bolt, then 2 separately angled rear-flank bolts (up to 3 total); bonus bolts never share the same direction.'],
      ['poison','POISON','Toxic Orb · 210 units/s','The explosion radius = 55 × (1 + 0.1 × Piercing Fangs). Every victim gets a permanent stack worth 15 × (1 + 0.05 × Poison Power units) DPS, multiplied by crit strength if that stack crits. At 5+ stacks on enemy defeat, Poison spreads 5 stacks to up to 6 nearby targets.']
    ];
    for(const [id,name,summary,body] of contents){
      const item=codexArticle(name,summary,body,focus?id===focus:id===game.player.element);
      codexLink(item.content,'catalog','Related '+name+' power-ups',id+'_power');
      tiles.append(item.article);
    }
    root.append(tiles);
    const formula=codexElement('p','codex-info-line','CRITICAL HITS: direct damage × current Crit Damage (starts ×1.6) when Crit Chance succeeds (starts at 6%). Poison stack crits are saved separately; Fire Burn is not increased by crits.');
    root.append(formula);
    codexLink(root,'acquisition','Where upgrades come from');
  }
  function renderAcquisition(){
    const root=$('inventoryAcquisitionPage');root.replaceChildren();
    codexIntro(root,'HOW REWARDS ARE FOUND','Real in-game probabilities. Percentages apply to the stated roll, not to individual monster kills.');
    const grid=codexElement('div','codex-grid');
    const source=[
      ['XP CRYSTALS','Guaranteed on normal enemy defeat','Each normal enemy drops its XP value as a crystal. Collect crystals to level up and select one of four upgrade cards. XP needed for the next level after reaching level L: floor(12 + 8L + 1.5L²).'],
      ['LEVEL-UP CARDS','Rarity rolled separately per standard card','Common 54% · Magic 25% · Rare 15% · Legendary 5% · Mythic 1%. While eligible, each offer includes an offensive, defensive and two further cards. Exhausted categories or insufficient distinct perks are filled with repeatable Common Survival rewards. Individual regular power-up odds depend on eligible options, bans and caps.'],
      ['POWER SHRINE','First at 02:00 · next 4–6 minutes after collection','Pick up a shrine for one immediate eligible upgrade without leveling up: 75% Legendary / 25% Mythic. With eligible Hemorrhagic Burst, it has a special 40% selection roll; otherwise eligible powers use weighted random choice.'],
      ['LIFE SHRINE','A fountain, not an RNG item drop','Grants +1 HP/s for 30 seconds, with no instant heal. New fountains appear roughly every 42–64 seconds. Refreshes rather than stacks.'],
      ['MAGNET SHRINE','First offered at 00:45','Immediately collects all XP crystals, then automatically collects new XP globally for 15 seconds. The next shrine becomes available 90–150 seconds after pickup.'],
      ['ABOMINATION REWARD','Guaranteed on boss defeat','One instant eligible power-up: Rare 65% · Legendary 29% · Mythic 6%. This does not use XP or increase the player level.'],
      ['ENDGAME SURVIVAL','When standard perks cannot fill a four-card offer','Four repeatable Common survival rewards become available only as replacements for unavailable normal cards: Field Medic (+4 maximum HP and heal 25%/at least 24), Enduring Heart (+12 maximum HP and heal 12), Mending Vigor (+0.15 permanent HP/s and heal 10), and Phoenix Sigil (up to 2 revival charges; additional sigils give +8 maximum HP). Each revival restores 35% HP and gives 2 seconds of protection. Level 150 is the cap: further crystals still add to total XP scored without forcing more upgrade screens.']
    ];
    for(const [name,shortText,description] of source){
      const {article,content}=codexArticle(name,shortText,description);
      if(name.includes('CARD')||name.includes('SHRINE')||name.includes('REWARD'))codexLink(content,'catalog','Browse available power-ups');
      grid.append(article);
    }
    root.append(grid);codexLink(root,'elements','Understand the four elemental attacks');
  }
  function renderPowerLibrary(){
    const root=$('inventoryCatalogPage');root.replaceChildren();
    codexIntro(root,'UPGRADE CATALOG','Browse the 18 regular perks plus four fixed late-game Survival rewards. Regular perk effects use their roll’s rarity multiplier, while Survival rewards are repeatable and fixed.');
    const categories=[
      ['offense','OFFENSE'],['defense','DEFENSE'],['utility','UTILITY'],['elemental','ELEMENTAL'],['survival','SURVIVAL']
    ];
    const byGroup={
      offense:['brutality','rapid_fire','forward','spread','pierce','crit','crit_damage'],
      utility:['knowledge','magnet'],
      defense:['movement','vitality','regen','armor'],
      elemental:['blood_power','hemorrhagic_burst','fire_power','lightning_power','poison_power'],
      survival:SURVIVAL_BOONS.map(p=>p.id)
    };
    if(codexFocus){
      const group=Object.keys(byGroup).find(k=>byGroup[k].includes(codexFocus));
      if(group)catalogGroup=group;
    }
    codexFilters(root,categories,catalogGroup,v=>{catalogGroup=v;codexFocus=null;renderPowerLibrary();});
    if(catalogGroup!=='survival')
      codexFilters(root,RARITY_TIERS.map(t=>[t,t.toUpperCase()]),catalogRarity,v=>{catalogRarity=v;renderPowerLibrary();});
    else root.append(codexElement('p','codex-info-line','These four repeatable rewards have fixed effects (Common) and are offered only when normal cards cannot fill four slots.'));
    const grid=codexElement('div','codex-grid');
    for(const id of byGroup[catalogGroup]){
      const perk=POWERS.find(p=>p.id===id)||SURVIVAL_BOONS.find(p=>p.id===id);if(!perk)continue;
      const focus=codexFocus===id;
      const selectedElement=game?.player?.element||'blood';
      const relatedElement=id.endsWith('_power')?id.replace('_power',''):id==='hemorrhagic_burst'?'blood':selectedElement;
      const description=perkDescription(id,perk.survival?'common':catalogRarity,relatedElement);
      const item=codexArticle(perk.name,description,'',focus);
      item.content.append(codexElement('p','codex-article-detail',perk.survival?'Survival reward · fixed Common effect':'Rarity: '+catalogRarity.toUpperCase()+' · magnitude ×'+rarityScale(catalogRarity)));
      if(['forward','spread','pierce'].includes(id)){
        item.content.append(codexElement('p','codex-article-detail','ELEMENT-SPECIFIC EFFECTS'));
        for(const elName of ['blood','fire','lightning','poison']){
          item.content.append(codexElement('p','codex-article-effect',elName.toUpperCase()+': '+perkDescription(id,catalogRarity,elName)));
        }
      }else item.content.append(codexElement('p','codex-article-effect',description));
      if(id.endsWith('_power')||id==='hemorrhagic_burst'||['forward','spread','pierce'].includes(id))codexLink(item.content,'elements','Element interaction',relatedElement);
      grid.append(item.article);
      if(focus){item.article.open=true;codexFocus=null;}
    }
    root.append(grid);
    codexLink(root,'acquisition','How rarity and upgrade acquisition work');
  }
  function renderEnemyScaling(){
    const root=$('inventoryScalingPage');root.replaceChildren();
    codexIntro(root,'TIME & SCALING','Enemies grow each minute, with danger spikes every five minutes. Hardcore becomes substantially harder starting at 15:00; Easy retains the original scaling throughout.');
    const detail=codexElement('p','codex-info-line','HP = base HP × tier HP × 1.045^minute. Damage = base damage × tier damage × 1.025^minute. Speed = base speed × tier speed × 1.018^minute. Easy Mode uses its original ×0.5 modifier; the 15:00+ Hardcore stage multipliers and spawn pressure are separate.');
    root.append(detail);
    const table=codexElement('table','bestiary-scale-table');
    table.innerHTML='<thead><tr><th>TIME</th><th>HP ×</th><th>DAMAGE ×</th><th>SPEED ×</th><th>SPAWN ×</th></tr></thead>';
    const body=codexElement('tbody');
    const base=difficultyAt(0,game?.easyMode||false);
    for(const minute of window.CrimsonMonsters.tierMinutes){
      const at=difficultyAt(minute*60,game?.easyMode||false);
      const row=codexElement('tr');
      for(const value of [String(minute).padStart(2,'0')+':00',(at.hp/base.hp).toFixed(2),(at.damage/base.damage).toFixed(2),(at.speed/base.speed).toFixed(2),(at.spawn/base.spawn).toFixed(2)]){
        row.append(codexElement('td','',value));
      }
      body.append(row);
    }
    table.append(body);root.append(table);
    root.append(codexElement('p','codex-info-line','After 10:00, only the later monster group spawns; existing enemies remain. In Hardcore, the 15:00/20:00/25:00 waves also reinforce and strengthen enemies already alive. The 230-enemy performance cap is unchanged. Watcher Eye fires one extra bolt every five minutes.'));
    codexLink(root,'bestiary','Open Monster Bestiary');
  }
  function openInventory(shouldFocus=true){
    if(state!=='playing'||!game?.elementChosen)return;
    keys.clear();shake=0;
    renderInventory();
    state='inventory';
    el.inventory.classList.remove('hidden');
    switchInventorySection('powers');
    if(shouldFocus)el.inventoryClose.focus();
    el.status.textContent='CHARACTER STATS · PAUSED';
  }
  function closeInventory(){
    if(state!=='inventory')return;
    state='playing';
    el.inventory.classList.add('hidden');
    el.status.textContent='HUNT IN PROGRESS';
    el.inventoryBtn.focus();
  }
  function toggleInventory(){
    if(state==='inventory')closeInventory();
    else if(state==='playing')openInventory();
  }
  // P (pause) and O (inventory) are a single control: both toggle the same
  // paused Grimoire. Closing either returns to the hunt.
  function togglePause(){
    if(state==='inventory')closeInventory();
    else if(state==='playing')openInventory();
  }

  // Blood: deliberately very slow and infinite piercing.
  // Lightning: projectile detonates into a 4+ chain spell on first impact.
  // Fire / Poison: fast impact orbs that splash their status over an area.
  function shoot(){
    const p=game.player;
    let target=null,best=370*370;
    for(const e of game.enemies){
      const d=dist2(e.x,e.y,p.x,p.y);
      if(d<best){best=d;target=e;}
    }
    if(!target)return;
    const aim=Math.atan2(target.y-p.y,target.x-p.x);
    p.face=Math.cos(aim)<0?-1:1;p.attackDir=aim;
    const element=p.element;
    const baseSpeed={blood:80,lightning:235,fire:290,poison:210}[element]||142;
    const speed=baseSpeed*p.projectileSpeed;
    // A Fireball salvo shares its hit record: one damaging Fireball per enemy.
    // Poison orbs intentionally keep independent hit records and can shotgun.
    const fireSalvoHits=element==='fire'?new Set():null;
    const directions=[0];
    const forwardCount=element==='lightning'?Math.min(2,p.forwardShots):p.forwardShots;
      // Every bonus lightning bolt chooses a different angle on EACH attack.
    // Shot 1 follows the enemy. Shot 2 goes behind the hunter. With a third
    // shot, extras occupy opposite rear flanks, so they never overlap.
    const lightningAngles=[aim];
    if(element==='lightning'&&forwardCount===1)
      lightningAngles.push(aim+Math.PI+(Math.random()-.5)*.45);
    if(element==='lightning'&&forwardCount>=2){
      const left=aim+1.95+Math.random()*.65;
      const right=aim-1.95-Math.random()*.65;
      if(Math.random()<.5)lightningAngles.push(left,right);
      else lightningAngles.push(right,left);
    }
    if(element!=='lightning')
      for(let k=1;k<=p.spreadShots;k++)directions.push(-.36*k,.36*k);
    for(const fan of directions)for(let i=0;i<=forwardCount;i++){
      const angle=element==='lightning'?lightningAngles[i]:aim+fan;
      const offset=(i-forwardCount/2)*9;
      const damage=element==='poison'?0:element==='lightning'?
        (1+Math.floor(Math.random()*200))*p.damage+p.flatDamage:p.damage+p.flatDamage;
      game.shots.push({
        hostile:false,element,
        x:p.x+Math.cos(angle)*14-Math.sin(angle)*offset,
        y:p.y+Math.sin(angle)*14+Math.cos(angle)*offset,
        vx:Math.cos(angle)*speed,vy:Math.sin(angle)*speed,angle,
        life:element==='blood'?Math.max(11,460/Math.max(1,speed)):
          Math.max(1.5,420/Math.max(1,speed)),
        damage,kind:element,fire:element==='fire',poison:element==='poison',
        lightning:element==='lightning',size:p.projectileSize,
        fireSalvoHits,hit:new Set(),lastHit:new Map()
      });
    }
    addParticles(p.x+Math.cos(aim)*13,p.y+Math.sin(aim)*13,
      element==='poison'?'#a2ff84':element==='lightning'?'#b4a9ff':
      element==='fire'?'#ffb47c':'#f67a94',4,25,2,3);
    playSound('shot');
  }
  function enemyDie(e){
    const index=game.enemies.indexOf(e);if(index<0)return;
    game.enemies.splice(index,1);game.kills++;
    proliferatePoison(e);
    const def=ENEMIES[e.type];
    if(e.type==='boss3'){
      // One perk (Rare/Legendary/Mythic) granted immediately, without XP cost.
      const perk=rollPowerShrineReward();
      if(perk){
        const roll=Math.random(),tier=roll<.65?'rare':roll<.94?'legendary':'mythic';
        grantPowerUp({...perk,tier});
        flashMessage('✦ '+tier.toUpperCase()+' POWER · ABOMINATION DEFEATED',2800);
        addParticles(e.x,e.y,'#eebd8d',44,135,2,5);
        playSound('level');
      }
    }else if(def.xp>0){
      const count=def.boss?14:1;
      for(let i=0;i<count;i++)game.drops.push({x:e.x+rand(-12,12),y:e.y+rand(-10,10),
        value:Math.max(1,def.xp/count),life:75,phase:rand(0,TAU)});
    }
    if(def.boss){
      el.bossBar.hidden=true;
      if(e.type!=='boss3')flashMessage('✦ '+def.name.toUpperCase()+' DEFEATED',2200);
    }
    addBloodBurst(e.x,e.y,def.boss?30:e.type==='blood_slime'?22:16,def.blood);
    addStain(e.x,e.y,e.type==='blood_slime'?3:2);
    game.corpses.push({type:e.type,x:e.x,y:e.y,phase:e.phase,frame:0,
      scale:def.boss?1.45:1,rot:rand(-.3,.3),age:0});
    if(game.corpses.length>44)game.corpses.shift();
    spawnFragments(e);addImpact(e.x,e.y,def.boss?43:24,def.color);
    shake=Math.max(shake,def.boss?5:2.4);playSound('hit');
    if(game.kills%25===0)flashMessage('☠ '+game.kills+' SLAIN',1700);
  }

  function spawnFragments(e){
    const type=e.type,kinds={skeleton:'bone',skeleton_archer:'bone',plague_rat:'flesh',eye:'ether',zombie:'flesh',blood_slime:'flesh',succubus:'wing',imp:'wing',hellhound:'flesh',necromancer:'cloth',boss1:'armour',boss2:'wing',boss3:'flesh'};
    const count=ENEMIES[type].boss?19:7;
    for(let i=0;i<count;i++){
      const a=rand(0,TAU),speed=rand(30,120),life=rand(9,17);
      game.gibs.push({type:kinds[type],color:ENEMIES[type].color,x:e.x+rand(-5,5),y:e.y+rand(-4,4),
        vx:Math.cos(a)*speed,vy:Math.sin(a)*speed-rand(12,35),rot:rand(-Math.PI,Math.PI),spin:rand(-7,7),
        size:rand(3,7),height:0,vh:rand(25,90),life,max:life,air:rand(.35,.75)});
    }
    if(game.gibs.length>90) game.gibs.splice(0,game.gibs.length-90);
  }
  function addImpact(x,y,r,color){
    game.impacts.push({x,y,radius:2,target:r,life:.28,max:.28,color});
    if(game.impacts.length>35) game.impacts.shift();
  }

  function addMagicFx(x,y,kind,size=38,life=.25){
    game.magicFx.push({x,y,kind,size,life,max:life});
    if(game.magicFx.length>64)game.magicFx.shift();
  }
  // Direct hits on a shocked enemy deal double damage. Damage-over-time does not count as a hit.
  function applyHitDamage(enemy, baseDamage){
    const finalDamage=baseDamage*(enemy.shockTime>0?2:1);
    enemy.hp-=finalDamage;
    if(game)game.totalDamage+=finalDamage;
    return finalDamage;
  }
  // Bleed stacks are independent 8-second effects, each worth 100% of the hit.
  // Blood has eight stacks by default. The legendary perk replaces them with
  // eight instant full-strength stacks and detonates on EVERY Blood hit.
  function tickBleedStacks(enemy,dt){
    const stacks=enemy.bleedStacks;
    if(!stacks||!stacks.length)return;
    for(let i=stacks.length-1;i>=0;i--){
      const stack=stacks[i],elapsed=Math.min(dt,stack.time);
      if(elapsed>0){const dealt=stack.dps*elapsed;enemy.hp-=dealt;game.totalDamage+=dealt;}
      stack.time-=dt;
      if(stack.time<=0)stacks.splice(i,1);
    }
  }
  function burstHemorrhage(origin,totalBleedDamage){
    const x=origin.x,y=origin.y;
    addMagicFx(x,y,'blood_orb_v11',102,.42);
    addImpact(x,y,82,'#fa3765');
    addBloodBurst(x,y,34,'#d80c3d');
    addParticles(x,y,'#fb6b8b',26,110,2,4);
    floatText(x,y-48,`BURST! ${Math.ceil(totalBleedDamage)}`,'#ffc0d0',12);
    // One direct area hit (including the triggering target), no chained Bleed.
    // Sum of all eight stacks' FULL original DoT totals, not just their
    // remaining lifetime; Shock still follows the normal direct-hit rule.
    for(const target of game.enemies.slice()){
      if(dist2(x,y,target.x,target.y)>(76+target.r)*(76+target.r))continue;
      applyHitDamage(target,totalBleedDamage);
      target.hit=.32;
      if(target.hp<=0)enemyDie(target);
    }
  }
  function applyBleedStack(enemy,hitDamage){
    const stacks=enemy.bleedStacks||(enemy.bleedStacks=[]);
    if(game.player.hemorrhagicBurst){
      // Instant 8-stack detonation on EVERY hit, replacing existing Bleed.
      const damage=(8+game.player.pierce)*hitDamage*(game.player.hemorrhagicBurstBoost||1);
      stacks.length=0;
      burstHemorrhage(enemy,damage);
      return;
    }
    const stack={time:8,dps:hitDamage/8,total:hitDamage};
    if(stacks.length<8)stacks.push(stack);
    else{
      let oldest=0;
      for(let i=1;i<stacks.length;i++)if(stacks[i].time<stacks[oldest].time)oldest=i;
      stacks[oldest]=stack;
    }
  }
  // Each poisoned hit snapshots its crit multiplier; summed potency also
  // allows older stacks and transmitted stacks to survive Poison Power picks.
  function applyPoisonStacks(enemy,count,critMultiplier=1){
    enemy.poisonStacks=(enemy.poisonStacks||0)+count;
    enemy.poisonStackStrength=(enemy.poisonStackStrength||0)+count*critMultiplier;
    enemy.poisonDps=enemy.poisonStackStrength*POISON_DPS*game.player.poisonMultiplier;
  }
  function applyPoisonStack(enemy,critMultiplier=1){
    applyPoisonStacks(enemy,1,critMultiplier);
  }
  // Innate Poison Proliferate: spread 5 stacks to up to 6 enemies. Its
  // radius matches Toxic Orb / Fireball and grows with Piercing Fangs.
  function proliferatePoison(source){
    if(game.player.element!=='poison'||(source.poisonStacks||0)<5)return;
    const radius=55*(1+.10*game.player.pierce);
    const nearby=game.enemies.filter(e=>
      dist2(source.x,source.y,e.x,e.y)<=(radius+e.r)*(radius+e.r)
    ).sort((a,b)=>dist2(source.x,source.y,a.x,a.y)-dist2(source.x,source.y,b.x,b.y)).slice(0,6);
    const averageCrit=(source.poisonStackStrength||source.poisonStacks)/source.poisonStacks;
    for(const enemy of nearby){
      applyPoisonStacks(enemy,5,averageCrit);
      addParticles(enemy.x,enemy.y,'#94ff74',5,42,2,3);
    }
    game.poisonBursts.push({x:source.x,y:source.y,radius,life:.52,max:.52});
    if(game.poisonBursts.length>24)game.poisonBursts.shift();
    addParticles(source.x,source.y,'#65ff80',24,90,2,4);
  }
  // Fire's single Burn deals the full basic hit each second for 2s; refreshes.
  function refreshBurn(enemy,p){
    enemy.burnDps=burnDps(p);
    enemy.burnTime=2;
  }
  // Four base bounces plus Piercing Fangs and Spread Shot; max 25 per chain.
  function chainLightning(origin,shot,hitSet){
    const p=game.player;
    let current=origin;
    for(let i=0;i<lightningChainCount(p);i++){
      const candidates=game.enemies.filter(e=>!hitSet.has(e)&&e!==current&&e.hp>0&&
        dist2(e.x,e.y,current.x,current.y)<=120*120);
      if(!candidates.length)break;
      candidates.sort((a,b)=>dist2(a.x,a.y,current.x,current.y)-dist2(b.x,b.y,current.x,current.y));
      const next=candidates[0],fromX=current.x,fromY=current.y;
      hitSet.add(next);
      const crit=Math.random()<p.critChance;
      const damage=applyHitDamage(next,shot.damage*(ENEMIES[next.type]?.boss?p.bossDamage:1)*
        (crit?p.critDamage:1));
      next.hit=.2;
      game.bolts.push({x:fromX,y:fromY,toX:next.x,toY:next.y,
        life:.26,max:.26,element:'lightning'});
      // Cap transient visuals at very high attack speed; all chain hits still land.
      if(game.bolts.length>200)game.bolts.splice(0,game.bolts.length-200);
      addSkillImpact('lightning',next.x,next.y,49,.30);
      floatText(next.x,next.y-16,String(Math.ceil(damage))+(crit?'!':''),
        crit?'#ffe39b':'#c9bcff');
      if(Math.random()<.5){
        next.shockTime=4;
        floatText(next.x,next.y-33,'SHOCK!','#86d8ff');
      }
      current=next;
      if(next.hp<=0)enemyDie(next);
    }
  }
  function addSkillImpact(element,x,y,size=60,life=.38){
    addMagicFx(x,y,'skill:'+element+':impact',size,life);
    addMagicFx(x,y,'skill:'+element+':particles',size*1.05,life*.75);
  }
  function elementalSplash(element,source,p){
    const radius=55*(1+.10*p.pierce);
    for(const target of game.enemies.slice()){
      if(dist2(source.x,source.y,target.x,target.y)>(radius+target.r)**2)continue;
      if(element==='fire')refreshBurn(target,p);
      else{
        const crit=Math.random()<p.critChance;
        applyPoisonStack(target,crit?p.critDamage:1);
      }
    }
    addSkillImpact(element,source.x,source.y,radius*1.65,.42);
    addImpact(source.x,source.y,radius,element==='fire'?'#ff943f':'#82ed4b');
    addParticles(source.x,source.y,element==='fire'?'#ffa355':'#8cfa75',14,70,2,4);
  }
  function explodeAt(x,y,damage,primary,hitSet){
    addMagicFx(x,y,'impact',70,.35);
    for(const e of game.enemies.slice()){
      if(e===primary||hitSet.has(e)||dist2(e.x,e.y,x,y)>48*48)continue;
      hitSet.add(e);applyHitDamage(e,damage);e.hit=.16;
      if(e.hp<=0)enemyDie(e);
    }
  }

  function addHunterBleed(){
    const p=game.player,stacks=p.enemyBleed;
    if(stacks.length>=8)stacks.shift();
    stacks.push({time:6,dps:.65+.11*difficultyTier(game.time)});
    updateHUD();
  }
  function tickHunterBleed(dt){
    const p=game.player;
    for(let i=p.enemyBleed.length-1;i>=0;i--){
      const b=p.enemyBleed[i],elapsed=Math.min(dt,b.time);
      p.hp=Math.max(0,p.hp-b.dps*elapsed*(1-p.armor));
      b.time-=dt;if(b.time<=0)p.enemyBleed.splice(i,1);
    }
    if(p.hp<=0&&!tryPhoenixRevive())die(false);
  }
  function enemyFire(e,p,def){
    const aim=Math.atan2(p.y-e.y,p.x-e.x),speed=def.projectileSpeed;
    const count=e.type==='eye'?1+difficultyTier(game.time):1,spread=e.type==='eye'?.16:0;
    for(let i=0;i<count;i++){
      const a=aim+(i-(count-1)/2)*spread;
      game.shots.push({hostile:true,enemyType:e.type,
        x:e.x+Math.cos(a)*14,y:e.y+Math.sin(a)*14-6,
        vx:Math.cos(a)*speed,vy:Math.sin(a)*speed,life:3.3,
        damage:e.damage,angle:a,hit:new Set()});
    }
    e.attackAnim=.3;addParticles(e.x,e.y-10,def.color,3,38,2,3);
  }
  function monsterStrike(e,p,def){
    if(Math.hypot(p.x-e.x,p.y-e.y)>def.range+12)return;
    if(damagePlayer(e.damage)&&e.type==='blood_slime')addHunterBleed();
    const a=Math.atan2(p.y-e.y,p.x-e.x);
    addSlashBurst(e.x+Math.cos(a)*16,e.y+Math.sin(a)*14,a);
  }
  function hitByCharge(e,p,startX,startY){
    const vx=e.x-startX,vy=e.y-startY,len2=vx*vx+vy*vy||1;
    const u=Math.max(0,Math.min(1,((p.x-startX)*vx+(p.y-startY)*vy)/len2));
    if(dist2(startX+vx*u,startY+vy*u,p.x,p.y)<(e.r+7)**2&&!e.chargeHit){
      e.chargeHit=true;damagePlayer(e.damage);
    }
  }
  function triggerBossBlast(e,p,stage){
    const radius=[50,94,142][stage],dmg=e.damage*[.85,1,1.15][stage];
    addImpact(e.x,e.y,radius,'#ff395d');
    addParticles(e.x,e.y,'#fc3156',17,100,2,4);
    if(dist2(p.x,p.y,e.x,e.y)<(radius+8)**2)damagePlayer(dmg);
  }
  function updateMonsterAI(e,dt,p,g){
    const def=ENEMIES[e.type];if(!def)return;
    const d=Math.hypot(p.x-e.x,p.y-e.y),a=Math.atan2(p.y-e.y,p.x-e.x);
    const move=()=>{
      const slow=e.slowTime>0?.58:1;
      e.x+=Math.cos(a)*e.speed*slow*dt;e.y+=Math.sin(a)*e.speed*slow*dt;
    };
    e.attackCd=Math.max(0,e.attackCd-dt);
    e.attackAnim=Math.max(0,e.attackAnim-dt);
    if(e.attackState==='chargeWarn'){
      e.attackTimer-=dt;
      if(e.attackTimer<=0){e.attackState='chargeDash';e.chargeTravel=0;e.chargeHit=false;}
      return;
    }
    if(e.attackState==='chargeDash'){
      const ox=e.x,oy=e.y,step=400*dt;
      e.x+=Math.cos(e.chargeAngle)*step;e.y+=Math.sin(e.chargeAngle)*step;
      e.chargeTravel+=step;hitByCharge(e,p,ox,oy);
      if(e.chargeTravel>=570){e.attackState='';e.attackCd=5.5;}
      return;
    }
    if(e.attackState==='abominationWindup'){
      e.attackTimer-=dt;
      if(e.attackTimer<=0){
        e.attackState='';e.attackCd=5;
        addImpact(e.x,e.y,79,'#ff476e');
        if(dist2(p.x,p.y,e.x,e.y)<87*87)damagePlayer(e.damage*1.28);
      }
      return;
    }
    if(e.attackState==='demonBlast'){
      e.attackTimer-=dt;
      if(e.attackTimer<=0){
        triggerBossBlast(e,p,e.attackStage);
        e.attackStage++;
        if(e.attackStage>=3){e.attackState='';e.attackCd=5.3;}
        else e.attackTimer=1.05;
      }
      return;
    }
    if(e.attackState==='summon'){
      e.attackTimer-=dt;
      if(e.attackTimer<=0){
        e.attackState='';e.summonCd=9.5;
        const room=Math.min(2,230-g.enemies.length);
        for(let i=0;i<room;i++)spawnEnemy('hellhound',20+i*9,rand(0,TAU),{x:e.x,y:e.y,summoned:true});
        addImpact(e.x,e.y,28,'#fa683f');
      }
      return;
    }
    if(e.attackWindup>0){
      e.attackWindup-=dt;
      if(e.attackWindup<=0){e.attackWindup=0;monsterStrike(e,p,def);e.attackCd=def.interval;}
      return;
    }
    if(e.type==='boss1'){
      if(e.attackCd<=0&&d<370){e.attackState='chargeWarn';e.attackTimer=2.6;e.chargeAngle=a;e.attackCd=8;}
      else move();
      return;
    }
    if(e.type==='boss3'){
      if(e.attackCd<=0&&d<115){e.attackState='abominationWindup';e.attackTimer=1.8;e.attackCd=6;}
      else if(d>def.range+8)move();
      else if(e.attackCd<=0)e.attackWindup=.55;
      return;
    }
    if(e.type==='boss2'){
      if(e.attackCd<=0&&d<160){e.attackState='demonBlast';e.attackTimer=1.05;e.attackStage=0;e.attackCd=7;}
      else if(d>50)move();
      return;
    }
    if(e.type==='hellhound'){
      e.summonCd-=dt;
      if(e.summonCd<=0&&g.enemies.length<225){e.attackState='summon';e.attackTimer=1.2;e.summonCd=12;return;}
    }
    if(def.projectileSpeed){
      if(d>def.range*.75)move();
      if(d<=def.range&&e.attackCd<=0){enemyFire(e,p,def);e.attackCd=def.interval;}
      return;
    }
    if(d>def.range+4)move();
    else if(e.attackCd<=0){
      e.attackWindup=e.type==='zombie'?.52:e.type==='skeleton'?.34:.16;
      e.attackAnim=e.attackWindup+.17;
    }
  }
  function update(dt){
    if(!game || state!=='playing') return;
    const g=game, p=g.player; g.time+=dt; g.worldTime+=dt;
    if(g.time>=DURATION){
      g.time=DURATION;
      if(ENEMY_SPAWNING_ENABLED)startDeathArrival();
      else{g.endingAt30=true;die(true);} // A clean finish, with no Reaper in the empty arena.
      return;
    }
    const nextTier=difficultyTier(g.time),surgeStarted=nextTier>g.difficultyTier;
    if(surgeStarted){
      if(ENEMY_SPAWNING_ENABLED)applyDifficultySurge(g,nextTier);
      else g.difficultyTier=nextTier;
    }
    for(const boss of window.CrimsonMonsters.bosses)if(g.time>=boss.bossAt)spawnBoss(boss.id);
    if(ENEMY_SPAWNING_ENABLED && g.time>g.nextNotice){
      if(!surgeStarted)flashMessage(g.time>=DURATION-60?'FINAL MINUTE!':'THE HORDE THICKENS...',2000);
      g.nextNotice+=35;
    }

    let mx=Number(keys.has('d')||keys.has('arrowright')) - Number(keys.has('a')||keys.has('arrowleft'));
    let my=Number(keys.has('s')||keys.has('arrowdown')) - Number(keys.has('w')||keys.has('arrowup'));
    const mag=Math.hypot(mx,my); p.moving=mag>.02; if(mag>0){ mx/=mag; my/=mag; p.x+=mx*p.speed*dt; p.y+=my*p.speed*dt; p.walk+=dt*11; p.face=mx<-.05?-1:mx>.05?1:p.face; }
    p.moveX=mag?mx:0;p.moveY=mag?my:0;

    updateFountains(dt);
    if(state!=='playing'){updateHUD();return;}
    // Continuous perk regeneration plus nonstacking 30s Life Shrine.
    if(p.regen>0){const old=p.hp;p.hp=Math.min(p.maxHp,p.hp+p.regen*dt);g.totalHealing+=p.hp-old;}
    if(p.fountainRegenTime>0){
      const elapsed=Math.min(dt,p.fountainRegenTime);
      p.fountainRegenTime=Math.max(0,p.fountainRegenTime-dt);
      p.fountainRegenTick+=elapsed;
      while(p.fountainRegenTick>=1){
        p.fountainRegenTick-=1;
        const before=p.hp;p.hp=Math.min(p.maxHp,p.hp+1);g.totalHealing+=p.hp-before;
      }
      if(p.fountainRegenTime<=0)p.fountainRegenTick=0;
    }
    // Magnet Shrine buff: all XP spawned for 15s is collected globally.
    if(p.magnetBuffTime>0){
      collectAllXP();
      p.magnetBuffTime=Math.max(0,p.magnetBuffTime-dt);
      if(state!=='playing'){updateHUD();return;}
    }
    p.orbitCd=Math.max(0,p.orbitCd-dt);
    if(p.orbits>0 && p.orbitCd<=0){
      p.orbitCd=.4;
      for(let j=0;j<p.orbits;j++){const a=g.worldTime*2.7+j*TAU/p.orbits,xx=p.x+Math.cos(a)*42,yy=p.y+Math.sin(a)*42;
        for(const e of g.enemies.slice())if(dist2(e.x,e.y,xx,yy)<(e.r+11)**2){applyHitDamage(e,p.damage*.35);e.hit=.12;if(e.hp<=0)enemyDie(e);} }
    }
    p.shotCd -= dt; p.hitCd = Math.max(0,p.hitCd-dt); p.attackAnim=Math.max(0,p.attackAnim-dt);
    if(p.shotCd<=0){shoot(); p.shotCd=1/p.attackRate;}

    tickHunterBleed(dt);
    if(state!=='playing')return;
    g.spawn-=dt;
    if(ENEMY_SPAWNING_ENABLED && g.spawn<=0){
      const diff=difficultyAt(g.time,g.easyMode);
      const count=Math.min(8,Math.max(1,Math.round(diff.spawn*(.45+Math.random()*.30))));
      const room=Math.max(0,230-g.enemies.length);
      for(let i=0;i<Math.min(count,room);i++)spawnEnemy();
      // Higher-tier spawn multipliers keep accelerating the horde through 25:00.
      g.spawn=Math.max(.045,.50/Math.sqrt(Math.max(1,diff.spawn)));
    }

    for(const e of [...g.enemies]){
      e.phase+=dt*6;e.hit=Math.max(0,e.hit-dt);
      tickBleedStacks(e,dt);
      if(e.burnTime>0){
        const elapsed=Math.min(dt,e.burnTime),dmg=(e.burnDps||0)*elapsed;
        e.hp-=dmg;g.totalDamage+=dmg;e.burnTime-=elapsed;
      }
      if(e.poisonDps>0){const dmg=e.poisonDps*dt;e.hp-=dmg;g.totalDamage+=dmg;}
      if(e.hp<=0){enemyDie(e);continue;}
      if(e.slowTime>0)e.slowTime=Math.max(0,e.slowTime-dt);
      if(e.shockTime>0)e.shockTime=Math.max(0,e.shockTime-dt);
      if(e.knockX||e.knockY){
        e.x+=e.knockX*dt;e.y+=e.knockY*dt;
        e.knockX*=Math.exp(-10*dt);e.knockY*=Math.exp(-10*dt);
      }
      updateMonsterAI(e,dt,p,g);
      if(state==='end')return;
    }

    for(let i=g.shots.length-1;i>=0;i--){
      const b=g.shots[i];
      // Substeps prevent slow bullets from tunneling through small fast enemies.
      const travel=Math.hypot(b.vx,b.vy)*dt;
      const substeps=Math.max(1,Math.ceil(travel/5));
      let remove=false;
      for(let step=0;step<substeps&&!remove;step++){
        b.x+=b.vx*dt/substeps;
        b.y+=b.vy*dt/substeps;
        if(b.hostile){
          if(dist2(b.x,b.y,p.x,p.y)<12*12){
            if(p.hitCd<=0){damagePlayer(b.damage);if(state==='end')return;}
            remove=true;
          }
          continue;
        }
        for(const e of g.enemies.slice()){
          if(b.element==='blood'){
            // No permanent hit-set for a slow Blood Spear: 0.6s cooldown
            // permits a second hit while an enemy remains inside the spear.
            const last=b.lastHit.get(e);
            if(last!==undefined&&g.time-last<.60)continue;
          }else if(b.hit.has(e)||b.fireSalvoHits?.has(e))continue;
          if(dist2(b.x,b.y,e.x,e.y-4)>(e.r+5*(b.size||1))**2)continue;
          b.hit.add(e);
          // Prevent direct/secondary Fireball hits from the same attack
          // from dealing damage to this enemy a second time.
          if(b.fireSalvoHits)b.fireSalvoHits.add(e);
          if(b.element==='blood')b.lastHit.set(e,g.time);
          const crit=Math.random()<p.critChance;
          const dmg=applyHitDamage(e,b.damage*(ENEMIES[e.type]?.boss?p.bossDamage:1)*
            (crit?p.critDamage:1));
          e.hit=.18;
          if(b.element==='blood'){
            if(p.hemorrhagicBurst)applyBleedStack(e,dmg);
            else for(let k=0;k<1+p.pierce;k++)applyBleedStack(e,dmg);
            addSkillImpact('blood',e.x,e.y,52,.33);
            if(Math.random()<p.bloodSplashChance)explodeAt(e.x,e.y,dmg*.38,e,b.hit);
          }else if(b.element==='lightning'){
            if(Math.random()<.5){
              e.shockTime=4;floatText(e.x,e.y-35,'SHOCK!','#86d8ff');
            }
            addSkillImpact('lightning',e.x,e.y,51,.33);
            chainLightning(e,b,b.hit);
          }else if(b.element==='fire'||b.element==='poison'){
            elementalSplash(b.element,e,p);
          }
          if(Math.random()<p.blastChance)
            explodeAt(e.x,e.y,dmg*.48,e,b.fireSalvoHits||b.hit);
          if(dmg>0)floatText(e.x,e.y-20,`${Math.ceil(dmg)}${crit?'!':''}`,
            crit?'#ffd274':'#ffe9d0');
          if(e.hp<=0)enemyDie(e);
          else if(b.element==='blood')addBloodBurst(e.x,e.y,ENEMIES[e.type]?.boss?11:6,ENEMIES[e.type].blood);
          shake=Math.max(shake,1.5);
          if(b.element!=='blood'){
            // Fire and Poison always detonate on the FIRST collision; Lightning
            // becomes a chain from that contact. Pierce instead alters their spell.
            remove=true;break;
          }
          // Blood Spear never stops or loses its ability to pierce.
        }
      }
      b.life-=dt;
      if(remove||b.life<=0)g.shots.splice(i,1);
    }

    for(let i=g.slashBursts.length-1;i>=0;i--){
      g.slashBursts[i].life-=dt;
      if(g.slashBursts[i].life<=0)g.slashBursts.splice(i,1);
    }
    // Absorb newly dropped XP on the same frame while the shrine is active.
    if(p.magnetBuffTime>0){
      collectAllXP();
      if(state!=='playing'){updateHUD();return;}
    }
    for(let i=g.drops.length-1;i>=0;i--){
      const d=g.drops[i]; d.phase+=dt*5; d.life-=dt;
      const dd=Math.hypot(p.x-d.x,p.y-d.y);
      if(dd<84*p.magnet&&dd>0){
        // Inspired by accelerating pickup-to-owner motion, with a clamped
        // positive speed: unlike min(12*time-4,6), XP never moves away first.
        d.pullTime=Math.min(.7,(d.pullTime||0)+dt);
        const ramp=d.pullTime/.7, speed=130+510*ramp*ramp;
        const step=Math.min(dd,speed*dt); // never overshoot or oscillate
        d.x+=(p.x-d.x)/dd*step;d.y+=(p.y-d.y)/dd*step;
      }else d.pullTime=0;
      if(dist2(d.x,d.y,p.x,p.y)<17*17){
        g.drops.splice(i,1);addParticles(d.x,d.y,'#46caff',4,32,2,3);
        playSound('pickup');gainXP(d.value);if(state!=='playing')break;
      }
      else if(d.life<0) g.drops.splice(i,1);
    }

    for(let i=g.particles.length-1;i>=0;i--){ const v=g.particles[i]; v.x+=v.vx*dt; v.y+=v.vy*dt; v.vx*=v.blood?.93:.95; v.vy*=v.blood?.94:.95; v.life-=dt; if(v.life<=0) g.particles.splice(i,1); }
    for(let i=g.texts.length-1;i>=0;i--){ const t=g.texts[i]; t.y-=28*dt; t.life-=dt; if(t.life<=0) g.texts.splice(i,1); }
    for(const c of g.corpses) c.age += dt;
    for(let i=g.gibs.length-1;i>=0;i--){
      const b=g.gibs[i]; b.life-=dt;
      if(b.life<=0){g.gibs.splice(i,1);continue;}
      if(b.air>0){
        b.air-=dt; b.x+=b.vx*dt;b.y+=b.vy*dt;b.height+=b.vh*dt;
        b.vh-=220*dt;b.vx*=Math.pow(.96,dt*60);b.vy*=Math.pow(.96,dt*60);b.rot+=b.spin*dt;
        if(b.height<0){b.height=0;b.air=0;b.vx=0;b.vy=0;}
      }
    }
    for(let i=g.impacts.length-1;i>=0;i--){
      const q=g.impacts[i];q.life-=dt;q.radius+=(q.target-q.radius)*Math.min(1,dt*21);
      if(q.life<=0)g.impacts.splice(i,1);
    }

    for(let i=g.magicFx.length-1;i>=0;i--){g.magicFx[i].life-=dt;if(g.magicFx[i].life<=0)g.magicFx.splice(i,1);}
    for(let i=g.poisonBursts.length-1;i>=0;i--){const b=g.poisonBursts[i];b.life-=dt;if(b.life<=0)g.poisonBursts.splice(i,1);}
    for(let i=g.bolts.length-1;i>=0;i--){g.bolts[i].life-=dt;if(g.bolts[i].life<=0)g.bolts.splice(i,1);}
    shake=Math.max(0,shake-25*dt); flash=Math.max(0,flash-dt); updateHUD();
  }

  function updateHUD(){
    if(!game) return;
    const p=game.player;
    el.hp.style.width=`${100*p.hp/p.maxHp}%`; el.hpText.textContent=`${Math.ceil(p.hp)} / ${p.maxHp}`;
    const bleed=p.enemyBleed||[];
    el.bleedBuff.hidden=!bleed.length;
    if(bleed.length){
      el.bleedBuff.textContent='🩸 ×'+bleed.length;
      el.bleedBuff.title='Bleed: '+bleed.length+'/8 stacks · '+bleed.reduce((sum,b)=>sum+b.dps,0).toFixed(1)+' DPS';
    }
    el.fountainBuff.hidden=p.fountainRegenTime<=0;
    if(p.fountainRegenTime>0){
      const remaining=Math.ceil(p.fountainRegenTime);
      el.fountainBuff.textContent=`✚ ${remaining}s`;
      el.fountainBuff.title=`Life Shrine: +1 HP per second (${remaining}s left)`;
    }
    el.magnetBuff.hidden=p.magnetBuffTime<=0;
    if(p.magnetBuffTime>0){
      const remaining=Math.ceil(p.magnetBuffTime);
      el.magnetBuff.textContent=`🧲 ${remaining}s`;
      el.magnetBuff.title=`Magnet Shrine: all map XP automatically collected (${remaining}s left)`;
    }
    const xpPct=p.level>=MAX_HUNTER_LEVEL?100:clamp(100*p.xp/p.next,0,100);
    el.xp.style.width=`${xpPct}%`; el.xpStrip.setAttribute('aria-valuenow',String(Math.round(xpPct)));
    el.level.textContent=p.level>=MAX_HUNTER_LEVEL?p.level+' MAX':p.level; el.kills.textContent=game.kills; el.time.textContent=timeText(game.time);
    const boss=game.enemies.find(e=>ENEMIES[e.type]?.boss);
    el.bossBar.hidden=!boss;
    if(boss)el.bossName.textContent=ENEMIES[boss.type].name.toUpperCase();
    if(boss)el.bossFill.style.width=`${clamp(boss.hp/boss.maxHp*100,0,100)}%`;
  }

  function drawFountains(camX,camY,t){
    for(const f of game.fountains){
      const x=f.x-camX,y=f.y-camY;
      if(x<-85||x>W+85||y<-100||y>H+100)continue;
      const pulse=.5+.5*Math.sin(t*2.8+f.x*.02);
      ctx.save();
      ctx.fillStyle=`rgba(238,40,77,${.065+pulse*.045})`;
      ctx.beginPath();ctx.ellipse(x,y+8,43,22,0,0,TAU);ctx.fill();
      ctx.strokeStyle=`rgba(255,64,94,${.65+pulse*.3})`;
      ctx.lineWidth=2.5;ctx.shadowColor='#ff2d55';ctx.shadowBlur=12;
      ctx.beginPath();ctx.arc(x,y,36,0,TAU);ctx.stroke();
      ctx.shadowBlur=0;
      shadowAt(x,y+15,29,.38);
      if(fountainArt.complete&&fountainArt.naturalWidth){
        ctx.imageSmoothingEnabled=true;
        ctx.drawImage(fountainArt,x-42,y-65,84,80);
      }else{
        ctx.fillStyle='#402b35';ctx.fillRect(x-20,y-4,40,20);
        ctx.fillStyle='#f23559';ctx.beginPath();ctx.ellipse(x,y,20,11,0,0,TAU);ctx.fill();
      }
      ctx.restore();
    }
  }

  function drawMagnetShrines(camX,camY,t){
    for(const s of game.magnetShrines){
      const x=s.x-camX,y=s.y-camY;
      if(x<-100||x>W+100||y<-110||y>H+100)continue;
      const pulse=.5+.5*Math.sin(t*3+s.x*.014);
      ctx.save();
      ctx.fillStyle=`rgba(39,147,255,${.08+pulse*.07})`;
      ctx.beginPath();ctx.ellipse(x,y+12,43,23,0,0,TAU);ctx.fill();
      ctx.strokeStyle=`rgba(96,208,255,${.7+pulse*.3})`;
      ctx.shadowColor='#4acfff';ctx.shadowBlur=10+8*pulse;ctx.lineWidth=2.4;
      ctx.beginPath();ctx.arc(x,y,40,0,TAU);ctx.stroke();ctx.shadowBlur=0;
      shadowAt(x,y+15,31,.32);
      if(magnetArt.complete&&magnetArt.naturalWidth){
        ctx.imageSmoothingEnabled=true;
        ctx.drawImage(magnetArt,x-34,y-77,68,98);
      }else{
        ctx.fillStyle='#12263f';ctx.fillRect(x-22,y-4,44,23);
        ctx.font='32px sans-serif';ctx.fillText('🧲',x-18,y-16);
      }
      ctx.restore();
    }
  }
  function drawPowerShrines(camX,camY,t){
    for(const s of game.powerShrines){
      const x=s.x-camX,y=s.y-camY;
      if(x<-105||x>W+105||y<-115||y>H+115)continue;
      const glow=.55+.45*Math.sin(t*3+s.x*.008);
      ctx.save();shadowAt(x,y+12,32,.5);
      ctx.strokeStyle='rgba(255,190,79,'+(.62+.3*glow)+')';
      ctx.shadowColor='#ff4d25';ctx.shadowBlur=12;ctx.lineWidth=2.4;
      ctx.beginPath();ctx.arc(x,y,39,0,TAU);ctx.stroke();
      ctx.shadowBlur=0;
      if(powerShrineArt.complete&&powerShrineArt.naturalWidth){
        ctx.imageSmoothingEnabled=true;ctx.drawImage(powerShrineArt,x-51,y-99,102,105);
      }else{
        ctx.fillStyle='#ad271b';ctx.fillRect(x-25,y-45,50,55);
        ctx.fillStyle='#ffdc7f';ctx.font='bold 32px serif';ctx.textAlign='center';ctx.fillText('✝',x,y-14);
      }
      ctx.restore();
    }
  }
  function drawPowerShrineArrow(camX,camY){
    if(state!=='playing'||!game.powerShrines.length)return;
    const s=game.powerShrines[0],x=s.x-camX,y=s.y-camY;
    if(x>=35&&x<=W-35&&y>=45&&y<=H-35)return;
    const a=Math.atan2(s.y-game.player.y,s.x-game.player.x);
    const nx=Math.cos(a),ny=Math.sin(a);
    const edge=Math.min((W/2-27)/Math.max(.001,Math.abs(nx)),(H/2-70)/Math.max(.001,Math.abs(ny)));
    const sx=W/2+nx*edge,sy=H/2+ny*edge;
    ctx.save();ctx.translate(sx,sy);ctx.rotate(a);
    ctx.fillStyle='#290c08';ctx.strokeStyle='#ffb764';ctx.lineWidth=2;
    ctx.shadowColor='#ff5325';ctx.shadowBlur=9;
    ctx.beginPath();ctx.arc(0,0,14,0,TAU);ctx.fill();ctx.stroke();
    ctx.fillStyle='#ffebbe';ctx.beginPath();ctx.moveTo(10,0);ctx.lineTo(-5,-7);ctx.lineTo(-2,0);ctx.lineTo(-5,7);ctx.closePath();ctx.fill();
    ctx.restore();
  }
  // Off-screen compass arrows only within roughly three screen widths.
  function drawFountainArrows(camX,camY){
    if(!game || state!=='playing')return;
    const p=game.player;
    let closest=null, nearest=Infinity;
    for(const f of game.fountains){
      const d2=dist2(f.x,f.y,p.x,p.y), x=f.x-camX,y=f.y-camY;
      if(d2>1760*1760 || (x>=34&&x<=W-34&&y>=54&&y<=H-30))continue;
      if(d2<nearest){closest=f;nearest=d2;}
    }
    if(!closest)return;
    const dx=closest.x-p.x,dy=closest.y-p.y,a=Math.atan2(dy,dx);
    const nx=Math.cos(a),ny=Math.sin(a);
    const roomX=nx>=0?W/2-25:W/2-25;
    const roomY=ny>=0?H/2-27:H/2-75;
    const edge=Math.min(roomX/Math.max(.001,Math.abs(nx)),roomY/Math.max(.001,Math.abs(ny)));
    const x=W/2+nx*edge,y=H/2+ny*edge;
    ctx.save();ctx.translate(x,y);ctx.rotate(a);
    ctx.shadowColor='#ff7597';ctx.shadowBlur=9;
    ctx.fillStyle='#210b18';ctx.strokeStyle='#d8567a';ctx.lineWidth=1.4;
    ctx.beginPath();ctx.arc(0,0,14,0,TAU);ctx.fill();ctx.stroke();
    ctx.fillStyle='#ffe2e8';ctx.beginPath();ctx.moveTo(10,0);ctx.lineTo(-4,-7);ctx.lineTo(-2,0);ctx.lineTo(-4,7);ctx.closePath();ctx.fill();
    ctx.restore();
  }

  function drawFloor(cameraX,cameraY,t){
    if(courtyard.complete && courtyard.naturalWidth){
      // Repeat the arena beyond the starting tile for endless exploration.
      // Horizontal mirroring joins side edges, but NEVER mirror vertically:
      // baked-in tombstones, crypts and monuments must remain upright.
      const tile = 1254, origin = -tile/2;
      const minX = Math.floor((cameraX-origin)/tile);
      const minY = Math.floor((cameraY-origin)/tile);
      const maxX = Math.floor((cameraX+W-origin)/tile);
      const maxY = Math.floor((cameraY+H-origin)/tile);
      ctx.save();
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      for(let gy=minY;gy<=maxY;gy++)for(let gx=minX;gx<=maxX;gx++){
        const x=Math.round(origin+gx*tile-cameraX), y=Math.round(origin+gy*tile-cameraY);
        ctx.save();
        ctx.translate(x+(gx%2!==0?tile:0),y);
        ctx.scale(gx%2!==0?-1:1,1);
        ctx.drawImage(courtyard,0,0,tile,tile);
        ctx.restore();
      }
      ctx.restore();
      return;
    }

    ctx.fillStyle='#211b23';ctx.fillRect(0,0,W,H);
    const size=52,left=Math.floor(cameraX/size)-1,top=Math.floor(cameraY/size)-1;
    for(let gy=top;gy<top+10;gy++)for(let gx=left;gx<left+15;gx++){
      const x=gx*size-cameraX,y=gy*size-cameraY,h=hash(gx,gy),n=hash(gx+52,gy-21);
      ctx.fillStyle=h<.25?'#2b242d':h<.54?'#302832':h<.8?'#28222c':'#332b34';
      ctx.fillRect(x+1,y+1,size-2,size-2);
      ctx.strokeStyle='rgba(151,126,133,.17)';ctx.lineWidth=1;
      ctx.strokeRect(x+1,y+1,size-2,size-2);
      ctx.strokeStyle='#4f414c';ctx.beginPath();ctx.moveTo(x+4+n*18,y+7);ctx.lineTo(x+12+n*25,y+20);ctx.lineTo(x+7+n*35,y+38);ctx.stroke();
      if(n>.90){ctx.fillStyle='#5e4a57';ctx.beginPath();ctx.ellipse(x+22,y+27,8,3,n*TAU,0,TAU);ctx.fill();}
      if(h>.967&&n<.64){drawGrave(x+14,y+10);}
      if(h>.984&&n>.67){drawRitualMark(x+25,y+28,t,gx*13+gy);}
      if(h>.94&&h<.947){drawCandles(x+17,y+22,t);}
    }
    const ambient=ctx.createRadialGradient(W*.52,H*.49,30,W*.52,H*.49,W*.66);
    ambient.addColorStop(0,'#54354516');ambient.addColorStop(1,'#0d071238');ctx.fillStyle=ambient;ctx.fillRect(0,0,W,H);
  }
  function drawGrave(x,y){ ctx.fillStyle='#090507'; ctx.fillRect(x+2,y+12,17,10); ctx.fillStyle='#64565c'; ctx.fillRect(x+4,y+4,13,17); ctx.fillStyle='#a18a93'; ctx.fillRect(x+6,y+2,9,3); ctx.fillRect(x+4,y+6,2,12); ctx.fillStyle='#3d3036'; ctx.fillRect(x+7,y+10,7,9); ctx.fillStyle='#d0adb4'; ctx.fillRect(x+9,y+8,2,7); ctx.fillRect(x+7,y+11,6,2); ctx.fillStyle='#2d2229'; ctx.fillRect(x+1,y+20,20,3); }
  function drawTwigs(x,y){ ctx.fillStyle='#62444e'; ctx.fillRect(x+8,y+3,2,16); ctx.fillRect(x+3,y+10,6,2); ctx.fillRect(x+9,y+8,7,2); ctx.fillStyle='#ae7484'; ctx.fillRect(x+8,y+3,1,9); }
  function drawCandles(x,y,t){ ctx.fillStyle='#e7ceb1'; ctx.fillRect(x+4,y+5,2,5); ctx.fillRect(x+8,y+3,2,7); ctx.fillStyle='#f36580'; ctx.fillRect(x+4,y+3,2,2); ctx.fillRect(x+8,y+1,2,2); ctx.fillStyle=`rgba(255,128,150,${0.18+Math.sin(t*6+x)*0.08})`; ctx.beginPath(); ctx.arc(x+5,y+4,8,0,TAU); ctx.arc(x+9,y+2,8,0,TAU); ctx.fill(); }
  function drawRitualMark(x,y,t,seed){
    ctx.save();ctx.strokeStyle=`rgba(151,43,75,${.15+Math.sin(t*.7+seed)*.03})`;ctx.lineWidth=.8;
    ctx.beginPath();ctx.arc(x,y,12,0,TAU);ctx.moveTo(x-8,y+7);ctx.lineTo(x,y-9);ctx.lineTo(x+8,y+7);ctx.closePath();ctx.stroke();
    ctx.strokeStyle='#bd4d65';ctx.beginPath();ctx.moveTo(x,y-4);ctx.lineTo(x,y+4);ctx.moveTo(x-4,y);ctx.lineTo(x+4,y);ctx.stroke();ctx.restore();
  }
  function shadowAt(x,y,r=15,alpha=.35){ ctx.fillStyle=`rgba(0,0,0,${alpha})`; ctx.beginPath(); ctx.ellipse(x,y,r,r*.4,0,0,TAU); ctx.fill(); }

  function drawStains(camX,camY){
    for(const s of game.stains){ ctx.globalAlpha=s.alpha; ctx.fillStyle=s.tone; ctx.beginPath(); ctx.ellipse(Math.round(s.x-camX),Math.round(s.y-camY),s.r,s.r*.62,s.rot,0,TAU); ctx.fill(); }
    ctx.globalAlpha=1;
  }
  function drawCorpses(camX,camY){
    for(const c of game.corpses){
      const x=c.x-camX,y=c.y-camY+10,def=ENEMIES[c.type];
      if(!def)continue;
      const wide=def.boss?46:c.type==='plague_rat'?32:26,flat=def.boss?16:10;
      shadowAt(x,y+3,18*c.scale,.42);
      ctx.save();ctx.translate(Math.round(x),Math.round(y));ctx.rotate(c.rot);
      ctx.globalAlpha=Math.min(.75,.4+c.age*1.8);
      const idx=MONSTER_ART_INDEX[c.type]??-1;
      if(idx>=0&&monsterHDReady()){
        ctx.imageSmoothingEnabled=true;
        // A still frame for dead enemies: animation is only for living sprites.
        ctx.drawImage(monsterHDAtlas,0,idx*MONSTER_HD_TILE,MONSTER_HD_TILE,MONSTER_HD_TILE,
          -wide/2,-flat/2,wide,flat);
      }else if(idx>=0&&monsterAtlas.complete&&monsterAtlas.naturalWidth){
        ctx.drawImage(monsterAtlas,idx*40,0,40,40,-wide/2,-flat/2,wide,flat);
      }else{
        ctx.fillStyle=def.color;ctx.fillRect(-wide/2,-flat/2,wide,flat);
      }
      ctx.fillStyle='#431022';ctx.fillRect(-4,1,9,2);
      ctx.restore();
    }
    ctx.globalAlpha=1;
  }
  function drawFragments(camX,camY){
    for(const b of game.gibs){
      const x=b.x-camX,y=b.y-camY;
      ctx.save();ctx.translate(Math.round(x),Math.round(y-b.height));ctx.rotate(b.rot);
      ctx.globalAlpha=Math.min(1,b.life/2);
      ctx.fillStyle=b.type==='armour'?'#9b929e':b.type==='bone'?'#d8c5af':b.type==='wing'?'#4d2d50':b.type==='cloth'?'#9a2949':b.type==='ether'?'#a294e1':'#ab183c';
      if(b.type==='armour'){ctx.fillRect(-b.size/2,-b.size/2,b.size,b.size*.75);ctx.fillStyle='#d8cad2';ctx.fillRect(-b.size/2,-b.size/2,b.size*.7,1.5);}
      else if(b.type==='bone'){
        ctx.fillRect(-b.size/2,-1.4,b.size,2.8);ctx.fillRect(-b.size/2,-2.5,2,5);
        ctx.fillStyle='#eee0cc';ctx.fillRect(-b.size/2,-2,b.size/2,1);
      } else if(b.type==='wing'){
        ctx.beginPath();ctx.moveTo(-b.size,0);ctx.lineTo(b.size,-b.size/2);ctx.lineTo(0,b.size);ctx.closePath();ctx.fill();
      } else if(b.type==='cloth'){
        ctx.fillRect(-b.size/2,-b.size/2,b.size,b.size*.7);ctx.fillStyle='#4f0a1c';ctx.fillRect(0,0,b.size*.5,b.size*.3);
      } else if(b.type==='ether'){
        ctx.shadowBlur=7;ctx.shadowColor='#a293ff';ctx.beginPath();ctx.arc(0,0,b.size/2,0,TAU);ctx.fill();
      } else {
        ctx.beginPath();ctx.ellipse(0,0,b.size*.7,b.size*.44,0,0,TAU);ctx.fill();
        ctx.fillStyle='#ed5f7b';ctx.fillRect(-1,-1,2,2);
      }
      ctx.restore();
    }
    ctx.globalAlpha=1;
  }
  function drawImpacts(camX,camY){
    for(const q of game.impacts){
      const x=q.x-camX,y=q.y-camY;
      ctx.save();ctx.globalAlpha=(q.life/q.max)*.75;ctx.strokeStyle=q.color;ctx.lineWidth=1.8;
      ctx.beginPath();ctx.arc(x,y,q.radius,0,TAU);ctx.stroke();
      ctx.strokeStyle='#fbcbd3';ctx.lineWidth=.8;ctx.beginPath();ctx.arc(x,y,q.radius*.66,0,TAU);ctx.stroke();ctx.restore();
    }
  }
  function drawPlayer(p,camX,camY,t){
    const x=p.x-camX, y=p.y-camY;
    ctx.fillStyle='rgba(229,70,104,0.08)'; ctx.beginPath(); ctx.arc(x,y,35+Math.sin(t*3)*2,0,TAU); ctx.fill();
    ctx.strokeStyle='rgba(242,120,149,0.18)'; ctx.lineWidth=1; ctx.beginPath(); ctx.ellipse(x,y+9,27,11,0,0,TAU); ctx.stroke();
    shadowAt(x,y+11,19,.52);
    ctx.save(); ctx.translate(Math.round(x),Math.round(y+Math.sin(p.walk)*1)); ctx.scale(p.face,1);
    if(p.hitCd>0 && Math.floor(p.hitCd*13)%2===0) ctx.globalAlpha=.55;
    // Projectile-only attacks: the Veilwarden keeps walking/idle poses while firing.
    // Three opaque, painted side-view frames preserve the armour and cloak textures.
    const walkIndex=Math.floor(p.walk*0.55)%3;
    const art=p.moving ? ['hero_walk1','hero_walk2','hero_walk3'][walkIndex] : 'hero_idle';
    const dimensions=window.CrimsonArt?.dimension(art);
    const height=78;
    const width=dimensions ? Math.max(40,Math.min(65, height*dimensions.w/dimensions.h)) : 43;
    if(!window.CrimsonArt?.paint(ctx,art,-width/2,12-height,width,height))
      ctx.drawImage(sprite('hero',p.moving?1:0),-20,-32,40,47);
    ctx.restore();
    if(game?.easyMode){
      ctx.save();
      if(ribbonArt.complete&&ribbonArt.naturalWidth){
        ctx.drawImage(ribbonArt,x-12,y-76+Math.sin(t*3)*1.2,25,25);
      }else{
        ctx.textAlign='center';ctx.font='bold 19px serif';ctx.fillText('🎀',x,y-65);
      }
      ctx.restore();
    }
    for(let i=0;i<3;i++){ const a=t*1.8+i*TAU/3; ctx.fillStyle=i===0?'#ffc7d2':'#f1607f'; ctx.fillRect(Math.round(x+Math.cos(a)*20),Math.round(y-8+Math.sin(a)*11),2,2); }
  }
  const GARGOYLE_WARNING_LENGTH=570*4; // 4× warning-line length; charge movement stays at the balanced 570 units.
  function drawEnemy(e,camX,camY,t){
    const def=ENEMIES[e.type];if(!def)return;
    const x=Math.round(e.x-camX),y=Math.round(e.y-camY);
    shadowAt(x,y+8,e.r*(def.boss?1.28:1),def.boss?.48:.34);
    ctx.save();
    const floating=['eye','succubus','imp','boss1','boss2'].includes(e.type);
    ctx.translate(x,Math.round(y+(floating?Math.sin(e.phase)*2.3:Math.sin(e.phase)*.9)));
    const wobble=e.type==='blood_slime'?1+Math.sin(e.phase*1.2)*.035:1;
    ctx.scale(wobble,1/wobble);
    if(e.hit>0){ctx.globalAlpha=.68;ctx.shadowColor='#fff0e9';ctx.shadowBlur=10;}
    else if(def.boss){ctx.shadowColor='#b74155';ctx.shadowBlur=7;}
    const width=def.boss?e.type==='boss3'?111:99:e.type==='plague_rat'?66:e.type==='hellhound'?74:61;
    const height=def.boss?e.type==='boss3'?113:104:e.type==='plague_rat'?46:e.type==='blood_slime'?55:72;
    const idx=MONSTER_ART_INDEX[e.type]??-1;
    if(idx>=0&&monsterHDReady()){
      ctx.imageSmoothingEnabled=true;
      // Preserve source detail at any monitor resolution while keeping
      // identical on-screen sprite sizes, foot anchors and collision radii.
      // A restrained rim-light helps silhouettes stand off the dark courtyard.
      ctx.shadowColor=def.boss?'rgba(255,194,179,.40)':'rgba(255,224,192,.23)';
      ctx.shadowBlur=def.boss?4:2;
      const frame=monsterHDFrame(e);
      ctx.drawImage(monsterHDAtlas,frame*MONSTER_HD_TILE,idx*MONSTER_HD_TILE,
        MONSTER_HD_TILE,MONSTER_HD_TILE,-width/2,-height+13,width,height);
    }else if(monsterAtlas.complete&&monsterAtlas.naturalWidth&&idx>=0){
      ctx.imageSmoothingEnabled=true;
      ctx.drawImage(monsterAtlas,idx*40,0,40,40,-width/2,-height+13,width,height);
    }else{
      ctx.fillStyle=def.color;
      ctx.beginPath();ctx.ellipse(0,-height*.47,width*.31,height*.42,0,0,TAU);ctx.fill();
      ctx.fillStyle='#f3b1ae';ctx.fillRect(-7,-height*.66,5,3);ctx.fillRect(4,-height*.66,5,3);
    }
    ctx.restore();
    if(e.attackState==='chargeWarn'){
      ctx.save();ctx.translate(x,y);ctx.rotate(e.chargeAngle);
      const pulse=.5+.5*Math.sin(t*12);
      // Bright layered red glow with a sharp white-hot center, even on a dark map.
      ctx.lineCap='round';
      ctx.shadowColor='#ff1639';ctx.shadowBlur=28;
      ctx.strokeStyle='rgba(255,20,45,'+(.67+pulse*.18)+')';
      ctx.lineWidth=27+pulse*5;
      ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(GARGOYLE_WARNING_LENGTH,0);ctx.stroke();
      ctx.shadowColor='#ff3547';ctx.shadowBlur=18;
      ctx.strokeStyle='#ff304b';ctx.lineWidth=12+pulse*2;
      ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(GARGOYLE_WARNING_LENGTH,0);ctx.stroke();
      ctx.shadowColor='#fff0ee';ctx.shadowBlur=9;
      ctx.strokeStyle='#ffe2df';ctx.lineWidth=3+pulse;
      ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(GARGOYLE_WARNING_LENGTH,0);ctx.stroke();
      ctx.restore();
    }
    if(e.attackState==='abominationWindup'||e.attackState==='demonBlast'){
      const radius=e.attackState==='abominationWindup'?79:[50,94,142][e.attackStage];
      ctx.save();ctx.strokeStyle='#ff536b';ctx.lineWidth=2.7;ctx.shadowColor='#ff274d';ctx.shadowBlur=11;
      ctx.globalAlpha=.75+.2*Math.sin(t*13);
      ctx.beginPath();ctx.arc(x,y,radius,0,TAU);ctx.stroke();
      ctx.fillStyle='rgba(231,43,75,.08)';ctx.fill();ctx.restore();
    }
    if(e.attackState==='summon'){
      ctx.save();ctx.strokeStyle='#ff9b60';ctx.lineWidth=2;ctx.shadowColor='#ff6637';ctx.shadowBlur=7;
      ctx.beginPath();ctx.arc(x,y,34,0,TAU);ctx.stroke();ctx.restore();
    }
    const size=def.boss?34:20;
    if(e.poisonDps>0){ctx.save();ctx.globalAlpha=.19;ctx.fillStyle='#4cf14d';ctx.shadowColor='#6dff45';ctx.shadowBlur=12;ctx.beginPath();ctx.arc(x,y-18,size,0,TAU);ctx.fill();ctx.restore();}
    if(e.burnTime>0){ctx.save();ctx.globalAlpha=.4;ctx.fillStyle='#ff7716';ctx.shadowColor='#ff4b12';ctx.shadowBlur=9;ctx.beginPath();ctx.arc(x,y-18,size*.85,0,TAU);ctx.fill();ctx.restore();}
    if(e.bleedStacks?.length){ctx.save();ctx.textAlign='center';ctx.strokeStyle='#350c19';ctx.lineWidth=3;ctx.fillStyle='#ff8da9';ctx.font='bold 10px sans-serif';ctx.strokeText('×'+e.bleedStacks.length,x,y-49);ctx.fillText('×'+e.bleedStacks.length,x,y-49);ctx.restore();}
    if(e.shockTime>0){ctx.save();ctx.strokeStyle='#67c8ff';ctx.lineWidth=2;ctx.beginPath();ctx.arc(x,y-15,size+5,0,TAU);ctx.stroke();ctx.restore();}
    if(e.hit>0&&!def.boss){ctx.fillStyle='#310e1b';ctx.fillRect(x-13,y-42,26,3);ctx.fillStyle='#d74b6c';ctx.fillRect(x-13,y-42,26*Math.max(0,e.hp/e.maxHp),3);}
  }
  function drawShots(camX,camY){
    for(const b of game.shots){
      const x=b.x-camX,y=b.y-camY;
      ctx.save();ctx.translate(x,y);ctx.rotate(b.angle);
      if(b.hostile){
        const eye=b.enemyType==='eye',arrow=b.enemyType==='skeleton_archer',necro=b.enemyType==='necromancer';
        ctx.shadowColor=eye?'#ff506c':arrow?'#fbd6a9':'#e949b4';
        ctx.shadowBlur=necro?12:5;
        ctx.fillStyle=eye?'#d72c55':arrow?'#a88b68':'#a63180';
        ctx.fillRect(-10,-3,20,6);
        ctx.fillStyle=arrow?'#ffe4b6':eye?'#ffbec7':'#eec6f8';
        ctx.fillRect(4,-2,6,4);
      }else{
        const size=b.size||1;
        const widths={blood:55,lightning:47,fire:39,poison:44};
        const heights={blood:18,lightning:17,fire:36,poison:37};
        const w=(widths[b.element]||45)*size,h=(heights[b.element]||25)*size;
        if(!drawSkillFrame(b.element,0,-w/2,-h/2,w,h)){
          if(!window.CrimsonArt?.paint(ctx,b.kind||'blood_bolt',-w/2,-h/2,w,h)){
            ctx.fillStyle='#fda0ae';ctx.fillRect(-9,-3,18,6);
          }
        }
      }
      ctx.restore();
    }
  }
  function drawSlashBursts(camX,camY){
    for(const fx of game.slashBursts){
      const x=fx.x-camX,y=fx.y-camY,p=1-fx.life/fx.max;
      ctx.save();ctx.translate(x,y);ctx.rotate(fx.angle);ctx.globalAlpha=(1-p)*.88;
      ctx.strokeStyle='#fff2d9';ctx.lineWidth=2.2;ctx.lineCap='round';
      ctx.beginPath();ctx.moveTo(-fx.size*(1-p*.3),-fx.size*.54);ctx.lineTo(fx.size*(1-p*.3),fx.size*.54);ctx.stroke();
      ctx.strokeStyle='#f47b8f';ctx.lineWidth=1.3;
      ctx.beginPath();ctx.moveTo(-fx.size*.6,fx.size*.65);ctx.lineTo(fx.size*.7,-fx.size*.45);ctx.stroke();
      ctx.restore();
    }
  }
  function drawDrops(camX,camY){
    for(const d of game.drops){
      const x=Math.round(d.x-camX), y=Math.round(d.y-camY+Math.sin(d.phase)*2);
      ctx.save();ctx.translate(x,y);ctx.shadowColor='#1699ff';ctx.shadowBlur=10;
      ctx.fillStyle='#0c63b8';ctx.beginPath();ctx.moveTo(0,-9);ctx.lineTo(6,-3);ctx.lineTo(4,6);ctx.lineTo(0,9);ctx.lineTo(-5,3);ctx.lineTo(-6,-3);ctx.closePath();ctx.fill();
      ctx.shadowBlur=0;ctx.fillStyle='#29b7ff';ctx.beginPath();ctx.moveTo(0,-8);ctx.lineTo(0,7);ctx.lineTo(-5,2);ctx.lineTo(-5,-2);ctx.closePath();ctx.fill();
      ctx.fillStyle='#b9efff';ctx.beginPath();ctx.moveTo(-1,-6);ctx.lineTo(4,-3);ctx.lineTo(0,1);ctx.closePath();ctx.fill();ctx.restore();
    }
  }
  function drawMagic(camX,camY){
    for(const f of game.magicFx){
      const s=f.size*(1.12-f.life/f.max*.24),alpha=clamp(f.life/f.max,0,1);
      if(f.kind.startsWith('skill:')){
        const [,element,frame]=f.kind.split(':');
        drawSkillFrame(element,frame==='impact'?1:2,f.x-camX-s/2,f.y-camY-s/2,s,s,alpha);
      }else window.CrimsonArt?.paint(ctx,f.kind,f.x-camX-s/2,f.y-camY-s/2,s,s*.78,alpha);
    }
    for(const b of game.bolts){
      const opacity=clamp(b.life/b.max,0,1);
      const x=b.x-camX,y=b.y-camY,dx=b.toX-b.x,dy=b.toY-b.y,length=Math.hypot(dx,dy);
      ctx.save();ctx.translate(x,y);ctx.rotate(Math.atan2(dy,dx));
      ctx.strokeStyle=`rgba(199,171,255,${opacity})`;ctx.lineWidth=2.4;ctx.shadowColor='#a17bff';ctx.shadowBlur=12;
      ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(length,0);ctx.stroke();
      if(b.element==='lightning')drawSkillFrame('lightning',0,0,-12,length,24,opacity);
      ctx.restore();
    }
    const p=game.player;
    for(let i=0;i<p.orbits;i++){
      const a=game.worldTime*2.7+i*TAU/p.orbits,x=p.x+Math.cos(a)*42-camX,y=p.y+Math.sin(a)*42-camY;
      if(!window.CrimsonArt?.paint(ctx,'holy',x-16,y-10,32,20)){
        ctx.fillStyle='#f6dca3';ctx.fillRect(x-6,y-2,12,4);
      }
    }
  }
  function drawPoisonBursts(camX,camY){
    for(const b of game.poisonBursts){
      const progress=1-b.life/b.max,r=b.radius*(1-(1-progress)**2),alpha=Math.max(0,1-progress);
      const x=b.x-camX,y=b.y-camY;
      ctx.save();
      ctx.strokeStyle='rgba(109,255,113,'+(.8*alpha)+')';
      ctx.fillStyle='rgba(63,230,106,'+(.10*alpha)+')';
      ctx.lineWidth=4+5*progress;ctx.shadowColor='#4eff79';ctx.shadowBlur=17*alpha;
      ctx.beginPath();ctx.arc(x,y,r,0,TAU);ctx.fill();ctx.stroke();
      ctx.shadowBlur=0;ctx.strokeStyle='rgba(190,255,128,'+(.44*alpha)+')';
      ctx.lineWidth=2;ctx.beginPath();ctx.arc(x,y,r*.82,0,TAU);ctx.stroke();
      ctx.restore();
    }
  }
  function drawFx(camX,camY){
    for(const p of game.particles){ ctx.globalAlpha=clamp(p.life/p.max,0,1); ctx.fillStyle=p.color; ctx.fillRect(Math.round(p.x-camX),Math.round(p.y-camY),p.size,p.size); }
    ctx.globalAlpha=1; ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.font='bold 11px Silkscreen,monospace';
    for(const t of game.texts){ ctx.globalAlpha=Math.min(1,t.life*3); ctx.fillStyle='#12070a'; ctx.fillText(t.text,Math.round(t.x-camX+1),Math.round(t.y-camY+2)); ctx.fillStyle=t.color; ctx.fillText(t.text,Math.round(t.x-camX),Math.round(t.y-camY)); }
    ctx.globalAlpha=1;
  }

  function draw(t){
    const p=game?.player||{x:0,y:0,walk:0,face:1,hitCd:0};
    // Never roll random camera offsets in any paused/overlay/end state.
    // Previously shake only decayed in update(), but draw() continued to
    // sample it forever while paused, causing the entire scene to jitter.
    const liveShake=(state==='playing'||state==='death')?shake:0;
    const camX=p.x-W/2+(liveShake?rand(-liveShake,liveShake):0),
          camY=p.y-H/2+(liveShake?rand(-liveShake,liveShake):0);
    drawFloor(camX,camY,t);
    if(game){
      drawStains(camX,camY);
      drawCorpses(camX,camY);
      drawFragments(camX,camY);
      drawFountains(camX,camY,t);
      drawMagnetShrines(camX,camY,t);
      drawPowerShrines(camX,camY,t);
      drawDrops(camX,camY,t);
      const objects=[...game.enemies.map(e=>({y:e.y,e})),{y:p.y,p}]; objects.sort((a,b)=>a.y-b.y);
      for(const item of objects){ if(item.e) drawEnemy(item.e,camX,camY,t); else drawPlayer(p,camX,camY,t); }
      if(game.death)drawDeath(camX,camY,t);
      drawShots(camX,camY,t); drawMagic(camX,camY); drawPoisonBursts(camX,camY); drawSlashBursts(camX,camY); drawImpacts(camX,camY); drawFx(camX,camY);
    } else {
      shadowAt(W/2,H/2+55,22,.5);if(!window.CrimsonArt?.paint(ctx,'hero_idle',W/2-32,H/2-55,64,85))ctx.drawImage(sprite('hero'),W/2-29,H/2-22,58,70);
    }
    const vignette=ctx.createRadialGradient(W/2,H/2,80,W/2,H/2,405);
    vignette.addColorStop(0,'#0000'); vignette.addColorStop(.75,'#170f1a20'); vignette.addColorStop(1,'#050307a0'); ctx.fillStyle=vignette; ctx.fillRect(0,0,W,H);
    ctx.fillStyle='rgba(123,20,52,0.025)'; ctx.fillRect(0,0,W,H);
    drawFountainArrows(camX,camY);
    if(game)drawPowerShrineArrow(camX,camY);
    if(flash>0){ ctx.fillStyle=`rgba(170,16,42,${flash*.55})`; ctx.fillRect(0,0,W,H); }
  }

  function loop(ts){
    // Also catch fullscreen/zoom transitions in browsers without ResizeObserver.
    if(typeof ResizeObserver==='undefined')resizePlayfield();
    if(!last)last=ts;
    const dt=Math.min((ts-last)/1000,.04);last=ts;
    // Freeze scene animations and gameplay when paused/reading/results.
    if(state==='playing'||state==='death')animTime+=dt;
    if(state==='death')updateDeath(dt);else update(dt);
    draw(animTime);raf=requestAnimationFrame(loop);
  }

  document.addEventListener('keydown',e=>{
    // Never treat OS/browser shortcuts (e.g. Alt+P, Ctrl+O) as game hotkeys.
    if(e.altKey||e.ctrlKey||e.metaKey)return;
    const k=e.key.toLowerCase();
    if(['arrowup','arrowdown','arrowleft','arrowright',' '].includes(k))e.preventDefault();
    if((k==='o'||k==='p'||k==='escape')&&(state==='playing'||state==='inventory')){
      e.preventDefault();if(!e.repeat)togglePause();
      return;
    }
    if(state==='inventory')return;
    keys.add(k);
    if(state==='upgrade'&&['1','2','3','4'].includes(k))chooseUpgrade(Number(k)-1);
    if(state==='upgrade'&&k==='r')rerollUpgrades();
    if(state==='upgrade'&&k==='b')toggleBanish();
    if(state==='intro'&&(k==='enter'||k===' ')&&!e.repeat&&e.target?.tagName!=='BUTTON')startGame(false);
    if(state==='intro'&&k==='e'&&!e.repeat)startGame(true);
    if(state==='end'&&k==='enter'&&e.target?.tagName!=='BUTTON')returnToModeSelect();
  });
  // Only Escape / P / O (or the in-game buttons) may toggle pause.
  // Changing browser focus, Alt+Tab or moving to another monitor must
  // NOT open the pause menu. Clear movement keys to prevent stuck walking
  // when the browser does not deliver a matching keyup event.
  window.addEventListener('blur',()=>keys.clear());
  document.addEventListener('visibilitychange',()=>{if(document.hidden)keys.clear();});
  document.addEventListener('keyup',e=>keys.delete(e.key.toLowerCase()));

  el.reroll.addEventListener('click',rerollUpgrades);el.banish.addEventListener('click',toggleBanish);
  el.start.addEventListener('click',()=>startGame(false));
  el.easyStart.addEventListener('click',()=>startGame(true));
  el.restart.addEventListener('click',returnToModeSelect);
  el.resume.addEventListener('click',togglePause);
  el.inventoryBtn.addEventListener('click',togglePause);
  el.inventoryClose.addEventListener('click',closeInventory);
  el.powersTab.addEventListener('click',()=>switchInventorySection('powers'));
  el.encyclopediaTab.addEventListener('click',()=>switchInventorySection('encyclopedia'));
  el.bestiaryTab.addEventListener('click',()=>switchInventorySection('bestiary'));
  for(const section of ['elements','acquisition','catalog','scaling']){
    $(CODEX_SECTIONS[section][1]).addEventListener('click',()=>switchInventorySection(section));
  }
  function updateAudioUI(){
    el.sound.textContent=muted?'MUTE ON':'MUTE OFF';
    el.sound.setAttribute('aria-pressed',String(muted));
    el.sound.classList.toggle('is-muted',muted);
    el.musicVolume.value=String(musicVolume);
    el.sfxVolume.value=String(sfxVolume);
    el.musicVolumeValue.textContent=`${musicVolume}%`;
    el.sfxVolumeValue.textContent=`${sfxVolume}%`;
  }
  // Keep settings from the previous audio preferences key on first load.
  const AUDIO_SETTINGS_KEY='crimson-ruin-audio-v06';
  const LEGACY_AUDIO_SETTINGS_KEY='noob-survivors-audio-v06';
  function rememberAudio(){
    try {
      localStorage.setItem(AUDIO_SETTINGS_KEY,JSON.stringify({muted,musicVolume,sfxVolume}));
      localStorage.removeItem(LEGACY_AUDIO_SETTINGS_KEY);
    }catch(_){}
  }
  try {
    const newSaved=localStorage.getItem(AUDIO_SETTINGS_KEY);
    const oldSaved=!newSaved?localStorage.getItem(LEGACY_AUDIO_SETTINGS_KEY):null;
    const saved=JSON.parse(newSaved||oldSaved||'null');
    if(saved && typeof saved==='object'){
      muted=Boolean(saved.muted);
      if(Number.isFinite(saved.musicVolume)) musicVolume=clamp(Math.round(saved.musicVolume),0,100);
      if(Number.isFinite(saved.sfxVolume)) sfxVolume=clamp(Math.round(saved.sfxVolume),0,100);
    }
    if(oldSaved)rememberAudio();
  }catch(_){}
  updateAudioUI();
  changeTrack('caverns');
  el.sound.addEventListener('click',()=>{
    muted=!muted; updateAudioUI(); rememberAudio();
    if(muted) ensureMusicPlayer().pause();
    else {playSound('pickup'); syncMusic();}
  });
  el.musicVolume.addEventListener('input',()=>{
    musicVolume=clamp(Number(el.musicVolume.value),0,100); updateAudioUI(); rememberAudio();
    if(musicPlayer) syncMusic();
  });
  el.sfxVolume.addEventListener('input',()=>{
    sfxVolume=clamp(Number(el.sfxVolume.value),0,100); updateAudioUI(); rememberAudio();
  });

  requestAnimationFrame(loop);
})();