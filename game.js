/* CRIMSON RUIN: AGE OF TORMENT — HUNTER'S NOCTURNE
   Dependency-free dark fantasy arena survival game.
   Internal canvas: 640 x 360. Round length: 3 minutes. */
(() => {
  'use strict';
  const canvas = document.querySelector('#game');
  const ctx = canvas.getContext('2d', { alpha: false });
  ctx.imageSmoothingEnabled = false;
  // Pixel art stays sharp; curves, particles and glow render at 2x resolution.
  ctx.setTransform(2, 0, 0, 2, 0, 0);

  const W = 640, H = 360, TAU = Math.PI * 2, DURATION = 1800;
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
  const deathArt=new Image();deathArt.decoding='async';deathArt.src='assets/death-reaper-v019.webp';
  const ribbonArt=new Image();ribbonArt.decoding='async';ribbonArt.src='assets/easy-ribbon-v019.webp';

  const $ = id => document.getElementById(id);
  const el = {
    intro:$('intro'), upgrade:$('upgrade'), upgradeCards:$('upgradeCards'), end:$('endScreen'), pause:$('pauseOverlay'),
    inventory:$('inventoryOverlay'), inventoryBtn:$('inventoryBtn'), inventoryClose:$('inventoryClose'),
    easyRetryOffer:$('easyRetryOffer'),easyYes:$('easyYes'),easyNo:$('easyNo'),
    inventoryElementIcon:$('inventoryElementIcon'), inventoryElementName:$('inventoryElementName'),
    inventoryElementDesc:$('inventoryElementDesc'), inventoryElementRank:$('inventoryElementRank'),
    inventoryPerks:$('inventoryPerks'), inventoryStats:$('inventoryStats'), inventoryPerkCount:$('inventoryPerkCount'),
    start:$('startBtn'), restart:$('restartBtn'), resume:$('resumeBtn'), hud:$('hud'), fountainBuff:$('fountainBuff'), magnetBuff:$('magnetBuff'),
    hp:$('hpFill'), hpText:$('hpText'), xp:$('xpFill'), level:$('levelText'), kills:$('killText'), time:$('timeText'),
    sound:$('soundBtn'), musicVolume:$('musicVolume'), sfxVolume:$('sfxVolume'),
    musicVolumeValue:$('musicVolumeValue'), sfxVolumeValue:$('sfxVolumeValue'), xpStrip:$('xpStrip'),
    msg:$('message'), status:$('statusText'), portrait:$('portrait'), bossBar:$('bossBar'), bossFill:$('bossFill'), bossName:$('bossName'),
    reroll:$('rerollBtn'), banish:$('banishBtn'), rerollCount:$('rerollCount'), banishCount:$('banishCount'), perkNotice:$('perkNotice')
  };
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const rand = (a, b) => a + Math.random() * (b - a);
  const dist2 = (a, b, c, d) => (a - c) ** 2 + (b - d) ** 2;
  const timeText = t => `${String(Math.floor(t / 60)).padStart(2, '0')}:${String(Math.floor(t % 60)).padStart(2, '0')}`;
  const hash = (x, y) => { let h = Math.imul(x, 374761393) + Math.imul(y, 668265263); h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967295; };

  const ENEMIES = {
    skeleton:{name:'Skeleton',hp:40,speed:39,damage:9,xp:3,r:12,color:'#e6dbc3',blood:'#88233c',weight:50},
    bat:{name:'Bat',hp:22,speed:84,damage:7,xp:2,r:10,color:'#9e5d94',blood:'#a81a45',weight:30},
    slime:{name:'Flesh Slime',hp:66,speed:26,damage:11,xp:4,r:13,color:'#c52f5b',blood:'#8a0e2e',weight:24},
    ghoul:{name:'Ghoul',hp:88,speed:46,damage:14,xp:5,r:12,color:'#b2a59b',blood:'#932245',weight:21},
    cultist:{name:'Cultist',hp:72,speed:35,damage:10,xp:5,r:11,color:'#ab3244',blood:'#74001d',weight:16},
    wraith:{name:'Wraith',hp:45,speed:68,damage:13,xp:6,r:11,color:'#8a7ed4',blood:'#66223d',weight:13},
    warden:{name:'CRIMSON WARDEN',hp:480,speed:31,damage:17,xp:35,r:21,color:'#dcaeb1',blood:'#a71037',weight:0},
    spider:{name:'Night Spider',hp:58,speed:61,damage:13,xp:5,r:12,color:'#6b3945',blood:'#9a1932',weight:14}
  };

  // v0.13: sixteen curated perks. Twelve are universal and four are
  // element-specific; only the power corresponding to the chosen element rolls.
  // Descriptions match the exact mechanic rather than promising an unrelated stat.
  // Rarity is rolled for EACH offered perk, not permanently assigned per perk.
  // The fifth (Mythic) band covers exactly 1% of normal RNG draws.
  const RARITY_TIERS=['common','magic','rare','legendary','mythic'];
  const RARITY_SCALE={common:1,magic:2,rare:4,legendary:8,mythic:16};
  function rollRarity(){
    const r=Math.random();
    return r<.54?'common':r<.79?'magic':r<.94?'rare':r<.99?'legendary':'mythic';
  }
  function rarityScale(tier){return RARITY_SCALE[tier]||1;}
  function shotBonus(scale){return scale>=16?3:scale>=8?2:1;}
  function spreadBonus(scale){return scale>=8?2:1;}
  function perkDescription(id,tier){
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
      case 'forward':return '+'+shotBonus(u)+' parallel projectile(s).';
      case 'spread':return '+'+(2*spreadBonus(u))+' angled projectile(s).';
      case 'pierce':return '+'+shotBonus(u)+' extra pierce.';
      case 'crit':return '+'+(3*u)+'% critical chance.';
      case 'crit_damage':return '+'+(10*u)+'% critical damage multiplier.';
      case 'blood_power':return '+'+(5*u)+'% Blood damage.';
      case 'hemorrhagic_burst':return '8-stack Blood detonation on every hit · +'+(10*(u-1))+'% burst potency.';
      case 'fire_power':return '+'+(5*u)+'% Fire damage.';
      case 'lightning_power':return '+'+(5*u)+'% Lightning damage.';
      case 'poison_power':return '+'+(5*u)+'% Poison damage.';
      default:return '';
    }
  }
  // A single effect for every Element Power: additive % of base elemental damage.
  // Common +5%, Magic +10%, Rare +20%, Legendary +40%, Mythic +80%.
  // No added proc chances, extra projectiles, or separate Burn affix.
  const POISON_DPS=15;
  // Burn snapshots 50% of the current basic Fire hit (including flat damage)
  // over two seconds; crits and Shock do not magnify this DoT.
  function burnDps(p){return (p.damage+p.flatDamage)*.5/2;}
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
        if(enemy.poisonStacks>0)enemy.poisonDps=enemy.poisonStacks*POISON_DPS*multiplier;
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
    {id:'forward',icon:'forward',name:'FORWARD SHOT',can:p=>p.forwardShots<3,apply:(p,g,u)=>p.forwardShots=Math.min(3,p.forwardShots+shotBonus(u))},
    {id:'spread',icon:'spread',name:'SPREAD SHOT',can:p=>p.spreadShots<8,apply:(p,g,u)=>p.spreadShots=Math.min(8,p.spreadShots+spreadBonus(u))},
    {id:'pierce',icon:'pierce',name:'PIERCING FANGS',can:p=>p.pierce<4,apply:(p,g,u)=>p.pierce=Math.min(4,p.pierce+shotBonus(u))},
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
  const ELEMENT_CHOICES = [
    {id:'blood',element:'blood',name:'BLOOD',desc:'20 DMG · Bleed on hit',longDesc:'20 direct damage. Every hit Bleeds for 50% of its damage over 8s, up to 8 stacks. Brutality and Blood Power improve Bleed.',tier:'rare'},
    {id:'fire',element:'fire',name:'FIRE',desc:'40 DMG · Burn over 2s',longDesc:'40 direct damage. One Burn deals 50% of the basic hit over 2s and refreshes on hit. Brutality and Fire Power improve Burn.',tier:'rare'},
    {id:'lightning',element:'lightning',name:'LIGHTNING',desc:'1–200 DMG · 50% Shock',longDesc:'Random 1–200 direct damage per hit. Each hit has a 50% chance to Shock for 4s; shocked enemies take double direct-hit damage.',tier:'rare'},
    {id:'poison',element:'poison',name:'POISON',desc:'15 DPS · Infinite stacks',longDesc:'Every hit adds a permanent 15 DPS Poison stack (120 damage per 8s). <strong>Infinite scaling</strong>: stacks never expire.',tier:'rare'}
  ];
  const ELEMENT_DAMAGE={blood:20,fire:40,lightning:1,poison:0};
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
      ['DAMAGE OVER TIME',`${fmt(direct*.5)} / 8s per stack`]
    ];
    if(p.element==='fire')return [
      ['DIRECT HIT',fmt(direct)],
      ['DAMAGE OVER TIME',`${fmt(burnDps(p)*2)} / 2s (1 stack)`]
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
    const xy=SKILL_ICON_CELLS[id];
    if(!xy)return '<span class="glyph">✦</span>';
    // Fractions of the atlas extent; the CSS background-size is 500% 500%.
    return `<span class="glyph ability-icon skill-icon-v023" style="background-position:${xy[0]*25}% ${xy[1]*25}%" role="img" aria-label="${id.replaceAll('_',' ')}"></span>`;
  }

  const MUSIC_TRACKS = {
    caverns:{label:'Ancient Caverns',src:'https://opengameart.org/sites/default/files/caverns.ogg'}
  };

  const sprite = window.NoobSprites.get;
  const portrait = el.portrait.getContext('2d');
  portrait.clearRect(0,0,el.portrait.width,el.portrait.height);
  portrait.imageSmoothingEnabled = true;
  if(!window.NoobArt?.paint(portrait,'hero_portrait',4,2,56,60)) portrait.drawImage(sprite('heroPortrait'), 5, 1, 54, 62);

  const keys = new Set();
  let state = 'intro', game = null, raf = 0, last = 0, animTime = 0, shake = 0, flash = 0, muted = false, musicVolume = 10, sfxVolume = 5, sfx = null;
  let musicPlayer = null, currentTrack = 'caverns';

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

  // Easy Mode is a one-run choice offered on the scoreboard when a hunter
  // dies before 05:00. No failure streak, prompt on the next start, or storage.
  function chooseEasyMode(yes){
    if(state!=='end'||!game||game.endingAt30||game.time>=300)return;
    startGame(Boolean(yes));
  }
  function startGame(easyMode=false){
    game = {
      time:0,totalXP:0,totalHealing:0,totalDamage:0,death:null,endingAt30:false,easyMode:Boolean(easyMode),spawnCounter:0,difficultyTier:0,
      perkRanks:Object.create(null),perkOrder:[],perkTiers:Object.create(null),
      player:{x:0,y:0,hp:100,maxHp:100,speed:100,damage:30,attackRate:1.55,multishot:1,forwardShots:0,spreadShots:0,flatDamage:0,elementRank:0,pierce:0,magnet:1,xp:0,level:1,next:13,shotCd:.15,hitCd:0,walk:0,face:1,attackAnim:0,attackDir:0,attackSide:1,projectileSpeed:1,projectileSize:1,armor:0,critChance:0.06,critDamage:1.6,fireChance:0,frostChance:0,chainChance:0,blastChance:0,xpBonus:1,bossDamage:1,regen:0,orbits:0,orbitCd:0,element:null,elementDamageBonus:0,bloodLance:0,bloodOrbChance:0,bloodSplashChance:0,hemorrhagicBurst:false,stormBonus:0,poisonMultiplier:1,poisonPowerUnits:0,hemorrhagicBurstBoost:1,fountainRegenTime:0,fountainRegenTick:0,magnetBuffTime:0},
      enemies:[], shots:[], drops:[], particles:[], texts:[], stains:[], corpses:[], gibs:[], impacts:[], slashBursts:[], magicFx:[], bolts:[], fountains:[], magnetShrines:[], nextFountainAt:rand(44,60), nextMagnetAt:45, magnetSpawned:false, kills:0, spawn:.27, worldTime:0, upgradeChoices:[], nextNotice:25, bossWaves:0, bossNext:51,rerolls:3,banishes:3,banned:new Set(),banishMode:false,elementChosen:false
    };
    spawnFountain(true);
    spawnFountain(true);
    state='upgrade';
    shake=0;flash=0;keys.clear();
    el.intro.classList.add('hidden'); el.end.classList.add('hidden'); el.pause.classList.add('hidden');
    el.inventory.classList.add('hidden');el.inventoryBtn.hidden=true;el.easyRetryOffer.classList.add('hidden');
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
    {hp:2.8,damage:2.4,speed:1.4,spawn:2,aggression:1.4},
    {hp:4.8,damage:4.2,speed:1.65,spawn:2.6,aggression:1.7},
    {hp:8,damage:7.2,speed:1.9,spawn:3.2,aggression:2},
    {hp:13,damage:12,speed:2.1,spawn:4,aggression:2.3},
    {hp:20,damage:18,speed:2.3,spawn:5,aggression:2.6}
  ];
  const SURGE_TITLES=['','THE SLAUGHTER BEGINS','NIGHTMARE UNLEASHED','NO MERCY','THE ABYSS OPENS','FINAL ONSLAUGHT'];
  function difficultyTier(seconds){return Math.min(5,Math.floor(Math.max(0,seconds)/300));}
  function difficultyAt(seconds,easy=false){
    const minute=Math.min(29,Math.floor(Math.max(0,seconds)/60));
    const surge=DIFFICULTY_SURGES[difficultyTier(seconds)],factor=easy?.5:1;
    return {
      minute,
      spawn:Math.min(60,Math.min(10,2*Math.pow(1.18,minute))*surge.spawn)*factor,
      hp:Math.pow(1.15,minute)*surge.hp*factor,
      damage:Math.pow(1.12,minute)*surge.damage*factor,
      speed:Math.pow(1.06,minute)*surge.speed*factor,
      aggression:surge.aggression*factor
    };
  }
  // Old enemies also gain the new stage bonus immediately. Their HP percentage
  // is preserved; newly spawned enemies additionally use the current minute ramp.
  function applyDifficultySurge(g,newTier){
    const previous=DIFFICULTY_SURGES[g.difficultyTier];
    const next=DIFFICULTY_SURGES[newTier];
    const hpRatio=next.hp/previous.hp;
    const damageRatio=next.damage/previous.damage;
    const speedRatio=next.speed/previous.speed;
    const aggressionRatio=next.aggression/previous.aggression;
    for(const enemy of g.enemies){
      enemy.hp*=hpRatio;enemy.maxHp*=hpRatio;
      enemy.damage*=damageRatio;enemy.speed*=speedRatio;
      enemy.aggression*=aggressionRatio;
    }
    g.difficultyTier=newTier;
    // Visible encirclement at the milestone, not merely tougher distant spawns.
    // Respect the global 230-enemy performance limit.
    const ambushCount=Math.min(230-g.enemies.length,10+newTier*4);
    const ambushTypes=['wraith','ghoul','cultist','spider'];
    const ambushOffset=rand(0,TAU);
    for(let i=0;i<ambushCount;i++){
      spawnEnemy(ambushTypes[i%ambushTypes.length],rand(165,225),
        ambushOffset+TAU*i/ambushCount);
    }
    g.spawn=Math.min(g.spawn,.08); // Regular pressure follows immediately.
    flashMessage(`☠ ${SURGE_TITLES[newTier]} · ${timeText(newTier*300)}`,2800);
    shake=Math.max(shake,3+newTier);
    playSound('boss');
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
  function spawnEnemy(type=null,distance=null,angle=null){
    const p = game.player, t = game.time; let pool = ['skeleton'];
    if(t>14) pool.push('bat'); if(t>32) pool.push('slime'); if(t>53) pool.push('ghoul'); if(t>83) pool.push('cultist'); if(t>115) pool.push('wraith'); if(t>96) pool.push('spider');
    if(!type){ const weights=pool.map(k=>ENEMIES[k].weight); let q=Math.random()*weights.reduce((a,b)=>a+b,0); type = pool.find(k=>(q-=ENEMIES[k].weight)<=0) || pool[0]; }
    // Shorter approach distance at each survival wall.
    const spawnRange=t>=600?[145,225]:t>=300?[170,255]:[225,345];
    const def=ENEMIES[type],a=angle??rand(0,TAU),d=distance??rand(...spawnRange);
    const diff=difficultyAt(t,game.easyMode),hp=def.hp*diff.hp;
    game.enemies.push({type,x:p.x+Math.cos(a)*d,y:p.y+Math.sin(a)*d,
      hp,maxHp:hp,speed:def.speed*diff.speed,damage:def.damage*diff.damage,r:def.r,
      phase:rand(0,TAU),shot:rand(.8,2.3),hit:0,knockX:0,knockY:0,
      aiRole:game.spawnCounter++%5,aggression:diff.aggression});
  }

  // Mid-run miniboss: two appearances, clear tells, readable health bar.
  function spawnWarden(){
    const a=rand(0,TAU), p=game.player;
    const distance=245;
    const diff=difficultyAt(game.time,game.easyMode),hp=(480+game.bossWaves*240)*diff.hp;
    game.enemies.push({type:'warden',x:p.x+Math.cos(a)*distance,y:p.y+Math.sin(a)*distance,hp,maxHp:hp,
      speed:(31+game.bossWaves*3)*diff.speed,damage:17*diff.damage,r:21,phase:0,shot:3.2,
      hit:0,knockX:0,knockY:0,windup:0,slamRadius:77,pulse:0,attacks:0,aiRole:0,aggression:diff.aggression});
    game.bossWaves++;
    game.bossNext=game.bossWaves===1?119:Infinity;
    el.bossBar.hidden=false; el.bossName.textContent=game.bossWaves===1?'CRIMSON WARDEN':'CRIMSON WARDEN · ENRAGED';
    flashMessage('⚔ THE WARDEN AWAKENS',2600);
    shake=Math.max(shake,5); playSound('boss');
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
    el.status.textContent='DEATH HAS COME · 30:00';
    flashMessage('THE REAPER COMES FOR ALL',1800);
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
  // Image-first sprite renderer. If the optional supplied Death image was not
  // yet uploaded as assets/death-reaper-v018.png, draw an original silhouette
  // rather than falling back to either previously rejected artwork.
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
  function damagePlayer(value){
    const p=game.player;
    if(p.hitCd>0)return false;
    const received=Math.max(1,Math.ceil(value*(1-p.armor)));p.hp=Math.max(0,p.hp-received);p.hitCd=.76;shake=Math.max(shake,6);flash=.18;
    addBloodBurst(p.x,p.y,12,'#ad1339'); floatText(p.x,p.y-24,`-${received}`,'#ffc9cd');
    playSound('hurt');
    if(p.hp<=0) die(false);
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
  function floatText(x,y,text,color='#ffd8df',size=10){ game.texts.push({x,y,text,color,size,life:.75,max:.75}); }

  function playSound(kind){
    if(muted || sfxVolume === 0) return;
    try {
      sfx ||= new (window.AudioContext||window.webkitAudioContext)();
      if(sfx.state==='suspended') sfx.resume();
      const o=sfx.createOscillator(), g=sfx.createGain(), now=sfx.currentTime;
      const tone={shot:[280,105,.12,.053],hit:[96,45,.15,.065],pickup:[740,1100,.11,.045],level:[520,980,.45,.08],start:[180,390,.24,.05],hurt:[170,70,.2,.09],death:[300,55,.7,.065],boss:[110,52,.5,.11],crack:[380,95,.09,.07]}[kind]||[280,180,.1,.03];
      o.type = kind==='hit'||kind==='hurt' ? 'sawtooth' : 'triangle';
      o.frequency.setValueAtTime(tone[0],now); o.frequency.exponentialRampToValueAtTime(tone[1],now+tone[2]);
      g.gain.setValueAtTime(tone[3] * sfxVolume / 100,now); g.gain.exponentialRampToValueAtTime(.0001,now+tone[2]);
      o.connect(g); g.connect(sfx.destination); o.start(now); o.stop(now+tone[2]);
    } catch(_){}
  }

  function gainXP(value){
    const p=game.player; const earned=value*p.xpBonus;game.totalXP+=earned;p.xp+=earned;
    if(p.xp>=p.next){
      p.xp-=p.next;
      p.level++;
      p.next=Math.floor(12+p.level*8+p.level*p.level*1.5);
      // Only a completed EXP bar restores health; the starting element choice doesn't.
      const healed=Math.min(20,p.maxHp-p.hp);
      if(healed>0){
        p.hp+=healed;game.totalHealing+=healed;
        floatText(p.x,p.y-33,`+${Math.round(healed)} HP`,'#98ffba',12);
        addParticles(p.x,p.y,'#74ffc2',12,52,2,3);
      }
      state='upgrade';openUpgrade();playSound('level');
    }
  }
  function eligiblePowers(){return POWERS.filter(opt=>!game.banned.has(opt.id) && (!opt.can||opt.can(game.player)));}
  const DAMAGE_POWER_IDS=new Set(["brutality","rapid_fire","forward","spread","pierce","crit","crit_damage","blood_power","fire_power","lightning_power","poison_power","hemorrhagic_burst"]);
  const DEFENSE_POWER_IDS=new Set(["movement","vitality","regen","armor"]);
  // Four unique cards: guaranteed offensive, guaranteed defensive, 2 RNG.
  // Legendary Blood is rolled separately at 5% per entire offering.
  function withRarity(perk){
    const tier=rollRarity();
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
    if(!damage||!defense||!random1||!random2)throw new Error('Cannot build four-card offer.');
    return [damage,defense,random1,random2].map(withRarity);
  }
  function renderUpgrade(){
    const g=game;
    el.upgradeCards.replaceChildren();
    g.upgradeChoices.forEach((opt,index)=>{
      const b=document.createElement('button');b.type='button';b.className='upgrade-card perk-'+opt.tier;
      b.innerHTML=`<span class="perk-tier">${g.elementChosen?(index===0?'ATTACK · ':index===1?'DEFENSE · ':'RANDOM · '):''}${opt.tier}</span><span class="perk-art-frame">${powerIcon(opt.id)}</span><strong>${opt.name}</strong><span class="detail">${opt.element?elementDescriptionHTML(opt):opt.desc}</span><span class="hotkey">[ ${index+1} ]</span>`;
      b.addEventListener('click',()=>chooseUpgrade(index));el.upgradeCards.appendChild(b);
    });
    const choosingElement=!g.elementChosen;
    el.upgrade.classList.toggle('element-select',choosingElement);
    el.reroll.hidden=choosingElement; el.banish.hidden=choosingElement;
    el.rerollCount.textContent=String(g.rerolls);el.banishCount.textContent=String(g.banishes);
    el.reroll.disabled=g.rerolls<=0;
    el.banish.disabled=g.banishes<=0 || eligiblePowers().length<=4;
    el.banish.classList.toggle('armed',g.banishMode);
    // Keep useful announcements for screen readers, without UI clutter.
    el.perkNotice.textContent=choosingElement?'Choose your starting element':
      g.banishMode?'Choose a power to banish. Press B to cancel.':
      'Choose your new power';
    el.upgrade.querySelector('h2').textContent=choosingElement?'CHOOSE YOUR ELEMENT':'NEW POWER';

  }
  function openUpgrade(){
    game.banishMode=false;
    game.upgradeChoices=game.elementChosen?rollChoices():ELEMENT_CHOICES;
    renderUpgrade();el.upgrade.classList.remove('hidden');el.status.textContent='CHOOSE A NEW POWER';updateHUD();
  }
  function rerollUpgrades(){
    if(state!=='upgrade'||!game.elementChosen||game.rerolls<=0)return;
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
      if(choice.element==='lightning')game.player.projectileSpeed*=1.25;
      game.player.shotCd=0;
      state='playing';el.upgrade.classList.add('hidden');
      el.status.textContent=`${choice.name} ATTUNED`;
      for(let i=0;i<5;i++)spawnEnemy('skeleton',rand(180,320),rand(0,TAU));
      for(let i=0;i<2;i++)spawnEnemy('bat',rand(200,270),rand(0,TAU));
      flashMessage(`✦ ${choice.name} ATTUNED`,2200);playSound('start');syncMusic();updateHUD();return;
    }
    if(game.banishMode){
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
    const magnitude=rarityScale(choice.tier);
    choice.apply(game.player,game,magnitude);
    if(!game.perkRanks[choice.id])game.perkOrder.push(choice.id);
    game.perkRanks[choice.id]=(game.perkRanks[choice.id]||0)+1;
    (game.perkTiers[choice.id]||(game.perkTiers[choice.id]=[])).push(choice.tier);
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
      ['PROJECTILES',(1+p.forwardShots)*(1+2*p.spreadShots)],
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
      `BEST: ${timeText(best.time)}  ·  ${num(best.kills)} KILLS  ·  ${num(best.xp)} XP${survived?'  ·  REAPER REACHED':''}`;
  }
  function die(won){
    if(state==='end')return;
    const survived=Boolean(won&&game.endingAt30);
    state='end';
    el.end.classList.remove('hidden');
    el.xpStrip.hidden=true;
    $('runRibbon').hidden=!game.easyMode;
    $('endModeBadge').classList.toggle('is-easy',Boolean(game.easyMode));
    el.inventory.classList.add('hidden');
    el.inventoryBtn.hidden=true;
    el.bossBar.hidden=true;
    $('endTitle').textContent=survived?'DEATH CLAIMS THE HUNTER':'YOU DIED';
    $('endEyebrow').textContent=survived?'THIRTY MINUTES · THE REAPER ARRIVES':'THE NIGHT CLAIMS ANOTHER SOUL';
    $('endSub').textContent=survived?
      'You endured 30 minutes. No one escapes the Reaper.':
      'The hunt ended before the Reaper appeared.';
    $('finalTime').textContent=timeText(game.time);
    $('finalKills').textContent=game.kills;
    $('finalLevel').textContent=game.player.level;
    const rank=game.kills>=1000?'CRIMSON LEGEND':game.kills>=300?'NIGHT REAPER':
      game.kills>=100?'BLOOD HUNTER':game.kills>=20?'CRYPT STALKER':'NOVICE HUNTER';
    $('huntRank').textContent=survived?`REAPER'S WITNESS · ${rank}`:rank;
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
    // Offer Easy Mode immediately on the results screen of ANY loss below 5m.
    // Yes and No both start the next run, with no lasting preference.
    el.easyRetryOffer.classList.toggle('hidden',Boolean(game.endingAt30||game.time>=300));
    el.end.classList.toggle('victory',survived);
    el.status.textContent=survived?'30:00 · REAPER HAS CLAIMED YOU':'HUNT FAILED';
    playSound('death');
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
      const perk=POWERS.find(v=>v.id===id);
      const rank=game.perkRanks[id]||0;
      if(!perk||rank<1)continue;
      perkTotal+=rank;
      const row=document.createElement('article');
      const tiers=game.perkTiers[id]||[];
      const latest=tiers[tiers.length-1]||'common';
      row.className='inventory-perk perk-'+latest;
      row.innerHTML=`<span class="inventory-perk-icon">${powerIcon(id)}</span>
        <div class="inventory-perk-copy"><div class="inventory-perk-heading"><strong>${perk.name}</strong><span class="inventory-rank">RANK ${rank}</span></div>
        <p>${tiers.map(v=>v.toUpperCase()).join(' · ')}</p>
        <p>Latest: ${perkDescription(id,latest)}</p></div>`;
      el.inventoryPerks.appendChild(row);
    }
    if(!game.perkOrder.length){
      const empty=document.createElement('p');empty.className='inventory-empty';
      empty.textContent='No passive upgrades yet. Collect blue crystals to level up.';
      el.inventoryPerks.appendChild(empty);
    }
    el.inventoryPerkCount.textContent=perkTotal+' PICKED · '+game.perkOrder.length+' TYPES';
    const shots=(1+p.forwardShots)*(1+2*p.spreadShots);
    const fmt=(n,d=1)=>Number(n).toFixed(d);
    const stats=[
      ...damageStatRows(p),
      ['ATTACKS / SEC',fmt(p.attackRate,2)],
      ['MOVE SPEED',fmt(p.speed,0)],
      ['PROJECTILES',String(shots)],
      ['PIERCE',String(p.pierce+(p.element==='blood'?p.bloodLance:0))],
      ['CRITICAL',Math.round(p.critChance*100)+'%'],
      ['CRIT DAMAGE','×'+p.critDamage.toFixed(2)],
      ['ARMOR',Math.round(p.armor*100)+'%'],
      ['XP BONUS','×'+fmt(p.xpBonus,2)],
      ['PICKUP RANGE',fmt(84*p.magnet,0)],
      ['REGEN',fmt(p.regen,2)+' HP/s'],
      ['LIFE SHRINE REGEN',p.fountainRegenTime>0?`${Math.ceil(p.fountainRegenTime)}s · +1 HP/s`:'—'],
      ['MAGNET SHRINE',p.magnetBuffTime>0?`${Math.ceil(p.magnetBuffTime)}s · GLOBAL XP`:'—'],
      ['MAX HEALTH',String(p.maxHp)],
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
  function openInventory(shouldFocus=true){
    if(state!=='playing'||!game?.elementChosen)return;
    keys.clear();shake=0;
    renderInventory();
    state='inventory';
    el.inventory.classList.remove('hidden');
    if(shouldFocus)el.inventoryClose.focus();
    el.status.textContent='POWER-UPS · PAUSED';
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

  // Restored classic slow projectile auto-fire. Each shot travels across the arena
  // and deals damage only on collision; no immediate or sweeping melee damage.
  function shoot(){
    const p=game.player;
    let target=null,best=370*370;
    for(const e of game.enemies){
      const d=dist2(e.x,e.y,p.x,p.y);
      if(d<best){best=d;target=e;}
    }
    if(!target)return;
    const aim=Math.atan2(target.y-p.y,target.x-p.x);
    p.face=Math.cos(aim)<0?-1:1;
    p.attackDir=aim;
    const speed=142*p.projectileSpeed;
    const directions=[0];
    for(let k=1;k<=p.spreadShots;k++)directions.push(-.36*k,.36*k);
    for(const fan of directions)for(let i=0;i<=p.forwardShots;i++){
      const angle=aim+fan;
      const offset=(i-p.forwardShots/2)*9;
      const element=p.element;
      const fire=element==='fire'||Math.random()<p.fireChance;
      const frost=!fire&&Math.random()<p.frostChance;
      const poison=element==='poison';
      const lightning=element==='lightning';
      const orb=element==='blood'&&Math.random()<p.bloodOrbChance;
      const kind=orb?'blood_orb_v11':fire?'fire_bolt_v11':lightning?'lightning_bolt_v11':poison?'poison_bolt_v11':frost?'ice_bolt':'blood_bolt_v11';
      const shotSpeed=orb?Math.max(44,speed*.35):speed;
      game.shots.push({hostile:false,x:p.x+Math.cos(angle)*14-Math.sin(angle)*offset,y:p.y+Math.sin(angle)*14+Math.cos(angle)*offset,
        vx:Math.cos(angle)*shotSpeed,vy:Math.sin(angle)*shotSpeed,angle,life:Math.max(1.5,orb?3.5:2.85/p.projectileSpeed),damage:poison?0:lightning?(1+Math.floor(Math.random()*200))*p.damage+p.flatDamage:p.damage+p.flatDamage,kind,fire,frost,poison,lightning,orb,size:p.projectileSize*(orb?1.55:1),
        pierce:orb?0:p.pierce+(element==='blood'?p.bloodLance:0),hit:new Set()});
    }
    addParticles(p.x+Math.cos(aim)*13,p.y+Math.sin(aim)*13,'#e8c3d0',4,25,2,3);
    playSound('shot');
  }

  function enemyDie(e){
    const index=game.enemies.indexOf(e); if(index<0) return;
    game.enemies.splice(index,1); game.kills++;
    const def=ENEMIES[e.type];
    if(e.type==='warden'){
      for(let i=0;i<14;i++)game.drops.push({x:e.x+rand(-39,39),y:e.y+rand(-32,32),value:4,life:75,phase:rand(0,TAU)});
      // The Warden drops XP only. It no longer gives unexplained healing.
      el.bossBar.hidden=true;
      flashMessage('✦ WARDEN SLAIN · BONUS XP',2400);
      addBloodBurst(e.x,e.y,52,'#b7103a');
      for(let i=0;i<4;i++)addImpact(e.x,e.y,42+i*10,'#f391a6');
    }else game.drops.push({x:e.x,y:e.y,value:def.xp,life:75,phase:rand(0,TAU)});
    addBloodBurst(e.x,e.y,e.type==='warden'?30:e.type==='slime'?22:16,def.blood); addStain(e.x,e.y,e.type==='slime'?3:2);
    game.corpses.push({type:e.type,x:e.x,y:e.y,phase:e.phase,frame:(Math.random()*2)|0,scale:e.type==='bat'?1.05:e.type==='slime'?1.15:1,rot:rand(-0.3,0.3),age:0});
    if(game.corpses.length>44) game.corpses.shift();
    spawnFragments(e);
    addImpact(e.x,e.y,24,def.color);
    shake=Math.max(shake,2.4);
    playSound('hit');
    if(game.kills%25===0) flashMessage(`☠ ${game.kills} SLAIN`,1700);
  }

  function spawnFragments(e){
    const type=e.type, kinds={skeleton:'bone',bat:'wing',slime:'flesh',ghoul:'flesh',cultist:'cloth',wraith:'ether',warden:'armour',spider:'wing'};
    const count={skeleton:7,bat:5,slime:9,ghoul:6,cultist:6,wraith:7,warden:19,spider:7}[type];
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
  // Bleed stacks are independent 8-second effects, each worth 50% of the hit.
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
      const damage=8*hitDamage*.5*(game.player.hemorrhagicBurstBoost||1);
      stacks.length=0;
      burstHemorrhage(enemy,damage);
      return;
    }
    const stack={time:8,dps:hitDamage*.5/8,total:hitDamage*.5};
    if(stacks.length<8)stacks.push(stack);
    else{
      let oldest=0;
      for(let i=1;i<stacks.length;i++)if(stacks[i].time<stacks[oldest].time)oldest=i;
      stacks[oldest]=stack;
    }
  }
  // Each Poison hit adds a permanent, unlimited 15 DPS stack (120 / 8s).
  // Aggregate DPS instead of allocating an object per stack.
  function applyPoisonStack(enemy,potency){
    enemy.poisonStacks=(enemy.poisonStacks||0)+1;
    enemy.poisonDps=enemy.poisonStacks*POISON_DPS*potency;
  }
  // Fire's single Burn deals half of the basic hit over 2s and refreshes.
  function refreshBurn(enemy,p){
    enemy.burnDps=burnDps(p);
    enemy.burnTime=2;
  }
  function chainLightning(origin,damage,hitSet){
    const other=game.enemies.find(e=>e!==origin&&!hitSet.has(e)&&dist2(e.x,e.y,origin.x,origin.y)<115*115);
    if(!other)return;
    hitSet.add(other);damage=applyHitDamage(other,damage);other.hit=.2;
    game.bolts.push({x:origin.x,y:origin.y,toX:other.x,toY:other.y,life:.22,max:.22});
    addMagicFx(other.x,other.y,'lightning',45,.2);
    floatText(other.x,other.y-16,String(Math.ceil(damage)),'#d6b6ff');
    if(other.hp<=0)enemyDie(other);
  }
  function explodeAt(x,y,damage,primary,hitSet){
    addMagicFx(x,y,'impact',70,.35);
    for(const e of game.enemies.slice()){
      if(e===primary||hitSet.has(e)||dist2(e.x,e.y,x,y)>48*48)continue;
      hitSet.add(e);applyHitDamage(e,damage);e.hit=.16;
      if(e.hp<=0)enemyDie(e);
    }
  }

  function update(dt){
    if(!game || state!=='playing') return;
    const g=game, p=g.player; g.time+=dt; g.worldTime+=dt;
    if(g.time>=DURATION){g.time=DURATION;startDeathArrival();return;}
    const nextTier=difficultyTier(g.time),surgeStarted=nextTier>g.difficultyTier;
    if(surgeStarted)applyDifficultySurge(g,nextTier);
    if(g.time>=g.bossNext && !g.enemies.some(e=>e.type==='warden'))spawnWarden();
    if(g.time>g.nextNotice){
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

    g.spawn-=dt;
    if(g.spawn<=0){
      const diff=difficultyAt(g.time,g.easyMode);
      const count=Math.min(12,Math.max(1,Math.round(diff.spawn*(1+Math.random()*.25))));
      const room=Math.max(0,230-g.enemies.length);
      for(let i=0;i<Math.min(count,room);i++)spawnEnemy();
      // Higher-tier spawn multipliers keep accelerating the horde through 25:00.
      g.spawn=Math.max(.045,.50/Math.sqrt(Math.max(1,diff.spawn)));
    }

    for(const e of [...g.enemies]){
      const aim=enemyTarget(e,p);
      const a=Math.atan2(aim.y-e.y,aim.x-e.x), d=Math.hypot(p.x-e.x,p.y-e.y); e.phase+=dt*6; e.hit=Math.max(0,e.hit-dt);
      tickBleedStacks(e,dt);
      if(e.burnTime>0){const elapsed=Math.min(dt,e.burnTime),dealt=(e.burnDps||0)*elapsed;e.hp-=dealt;g.totalDamage+=dealt;e.burnTime-=elapsed;}
      if(e.poisonDps>0){const dealt=e.poisonDps*dt;e.hp-=dealt;g.totalDamage+=dealt;}
      if(e.hp<=0){enemyDie(e);continue;}
      if(e.slowTime>0)e.slowTime=Math.max(0,e.slowTime-dt);
      if(e.shockTime>0)e.shockTime=Math.max(0,e.shockTime-dt);
      const slowed=e.slowTime>0?.58:1;
      if(e.knockX||e.knockY){e.x+=e.knockX*dt;e.y+=e.knockY*dt;e.knockX*=Math.exp(-10*dt);e.knockY*=Math.exp(-10*dt);}
      if(e.type==='warden'){
        if(e.windup>0){
          e.windup-=dt;
          if(e.windup<=0){
            e.windup=0;e.pulse=.34;e.attacks++;
            addImpact(e.x,e.y,e.slamRadius,'#ed4262');
            if(dist2(p.x,p.y,e.x,e.y)<(e.slamRadius+7)**2)damagePlayer(e.damage*(1+Math.min(8,e.attacks)/17));
            addBloodBurst(e.x,e.y,15,'#9e143d');shake=Math.max(shake,3.6);
          }
        }else{
          e.x+=Math.cos(a)*e.speed*slowed*dt; e.y+=Math.sin(a)*e.speed*slowed*dt;
          e.shot-=dt;
          if(e.shot<=0 && d<170){e.windup=1.18;e.shot=4.3+rand(0,.9);}
        }
        e.pulse=Math.max(0,e.pulse-dt);
      }else{e.x += Math.cos(a)*e.speed*slowed*dt; e.y += Math.sin(a)*e.speed*slowed*dt;}
      if(e.type==='bat'){ e.x+=Math.cos(g.worldTime*8+e.phase)*18*dt; e.y+=Math.sin(g.worldTime*6+e.phase)*12*dt; }
      if(e.type==='slime'){ e.x+=Math.sin(g.worldTime*2+e.phase)*7*dt; }
      if(e.type==='wraith'){ e.x+=Math.cos(g.worldTime*3+e.phase)*10*dt; e.y+=Math.sin(g.worldTime*2.8+e.phase)*10*dt; }
      if(e.type==='cultist'){ e.shot-=dt; if(e.shot<=0 && d<270){ e.shot=(1.5+Math.random()*.6)/(e.aggression||1); g.shots.push({hostile:true,x:e.x,y:e.y-8,vx:Math.cos(a)*128,vy:Math.sin(a)*128,life:2.2,damage:e.damage,hit:new Set(),angle:a}); } }
      if(d<e.r+9 && p.hitCd<=0){damagePlayer(e.damage); if(state==='end')return;}
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
          if(b.hit.has(e))continue;
          if(dist2(b.x,b.y,e.x,e.y-4)>Math.pow(e.r+5*(b.size||1),2))continue;
          b.hit.add(e);const crit=Math.random()<p.critChance;const dmg=applyHitDamage(e,b.damage*(e.type==='warden'?p.bossDamage:1)*(crit?p.critDamage:1));e.hit=.18;
          // Damage-over-time uses real seconds and the damage of the actual hit.
          if(p.element==='blood')applyBleedStack(e,dmg);
          if(b.fire)refreshBurn(e,p);
          if(b.lightning && Math.random()<.5){e.shockTime=4;floatText(e.x,e.y-35,'SHOCK!','#86d8ff');addMagicFx(e.x,e.y,'lightning',33,.19);}
          if(b.frost)e.slowTime=2.5;
          // Poison has no stack limit or expiry; every hit adds 15 DPS.
          if(b.poison)applyPoisonStack(e,p.poisonMultiplier);
          if(p.chainChance>0&&Math.random()<Math.min(.95,p.chainChance))chainLightning(e,dmg*.55,b.hit);
          if(b.orb){explodeAt(e.x,e.y,dmg*.7,e,b.hit);addMagicFx(e.x,e.y,'blood_orb_v11',70,.26);}
          else if(p.element==='blood'&&Math.random()<p.bloodSplashChance)explodeAt(e.x,e.y,dmg*.38,e,b.hit);
          if(Math.random()<p.blastChance)explodeAt(e.x,e.y,dmg*.48,e,b.hit);
          const a=b.angle;
          const push=e.type==='warden'?3.5:8;
          e.knockX=Math.cos(a)*35;e.knockY=Math.sin(a)*35;
          e.x+=Math.cos(a)*push;e.y+=Math.sin(a)*push;
          addSlashBurst(e.x,e.y,a,e.type==='warden');
          addParticles(e.x,e.y,'#ffd5dc',5,46,2,3);
          if(dmg>0)floatText(e.x,e.y-20,`${Math.ceil(dmg)}${crit?'!':''}`,crit?'#ffd274':'#ffe9d0');
          addMagicFx(e.x,e.y,b.fire?'impact':b.frost?'frost_nova':'impact',b.fire?40:28,.28);
          if(e.hp<=0)enemyDie(e);
          else addBloodBurst(e.x,e.y,e.type==='warden'?11:6,ENEMIES[e.type].blood);
          shake=Math.max(shake,1.5);
          if(b.pierce<=0){remove=true;break;}
          b.pierce--;
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
      if(dd<84*p.magnet){ const a=Math.atan2(p.y-d.y,p.x-d.x), v=150+Math.max(0,90-dd)*2; d.x+=Math.cos(a)*v*dt; d.y+=Math.sin(a)*v*dt; }
      if(dd<17){ g.drops.splice(i,1); addParticles(d.x,d.y,'#46caff',4,32,2,3); playSound('pickup'); gainXP(d.value); if(state!=='playing') break; }
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
    for(let i=g.bolts.length-1;i>=0;i--){g.bolts[i].life-=dt;if(g.bolts[i].life<=0)g.bolts.splice(i,1);}
    shake=Math.max(0,shake-25*dt); flash=Math.max(0,flash-dt); updateHUD();
  }

  function updateHUD(){
    if(!game) return;
    const p=game.player;
    el.hp.style.width=`${100*p.hp/p.maxHp}%`; el.hpText.textContent=`${Math.ceil(p.hp)} / ${p.maxHp}`;
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
    const xpPct=clamp(100*p.xp/p.next,0,100);
    el.xp.style.width=`${xpPct}%`; el.xpStrip.setAttribute('aria-valuenow',String(Math.round(xpPct)));
    el.level.textContent=p.level; el.kills.textContent=game.kills; el.time.textContent=timeText(game.time);
    const boss=game.enemies.find(e=>e.type==='warden');
    el.bossBar.hidden=!boss;
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
      // Repeat the arena outside the starting tile so exploration stays endless.
      // Alternate mirroring avoids a hard visual edge between repeat tiles.
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
        ctx.translate(x+(gx%2!==0?tile:0),y+(gy%2!==0?tile:0));
        ctx.scale(gx%2!==0?-1:1,gy%2!==0?-1:1);
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
    // Fallen enemies collapse and flatten onto the floor rather than standing upright.
    for(const c of game.corpses){
      const x=c.x-camX,y=c.y-camY+10;
      shadowAt(x,y+3,18*c.scale,.42);
      ctx.save();ctx.translate(Math.round(x),Math.round(y));ctx.rotate(c.rot);
      ctx.globalAlpha=Math.min(.84,.5+c.age*1.8);
      if(c.type==='wraith') ctx.globalAlpha*=.48;
      const wide=c.type==='bat'?36:c.type==='slime'?31:26;
      const flat=c.type==='bat'?13:c.type==='slime'?11:9;
      if(!window.NoobArt?.paint(ctx,c.type,-wide/2,-flat/2,wide,flat,.65))ctx.drawImage(sprite(c.type==='spider'?'bat':c.type,c.frame),-wide/2,-flat/2,wide,flat);
      ctx.fillStyle=c.type==='skeleton'?'#b3a8a1':c.type==='wraith'?'#685681':'#4b1023';
      ctx.fillRect(-4,1,9,2);ctx.restore();
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
    const dimensions=window.NoobArt?.dimension(art);
    const height=78;
    const width=dimensions ? Math.max(40,Math.min(65, height*dimensions.w/dimensions.h)) : 43;
    if(!window.NoobArt?.paint(ctx,art,-width/2,12-height,width,height))
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
  function drawEnemy(e,camX,camY,t){
    const x=Math.round(e.x-camX), y=Math.round(e.y-camY), w=e.type==='bat', hover=e.type==='wraith';
    const bob=w?Math.sin(e.phase)*4:hover?Math.sin(t*3+e.phase)*3:Math.sin(e.phase)*1.2;
    shadowAt(x,y+9,e.r+1,w?.2:.37);
    if(e.type==='warden'){
      ctx.save();ctx.globalAlpha=.25+Math.sin(t*4)*.06;ctx.fillStyle='#d34765';
      ctx.beginPath();ctx.ellipse(x,y+8,33,13,0,0,TAU);ctx.fill();ctx.restore();
      if(e.windup>0){
        const prog=1-e.windup/1.18;
        ctx.save();ctx.globalAlpha=.25+prog*.45;ctx.strokeStyle='#ff728c';ctx.lineWidth=1.5+prog*2;
        ctx.setLineDash([5,5]);ctx.beginPath();ctx.arc(x,y,e.slamRadius,0,TAU);ctx.stroke();ctx.setLineDash([]);
        ctx.globalAlpha=.08+prog*.22;ctx.fillStyle='#e12850';ctx.beginPath();ctx.arc(x,y,e.slamRadius,0,TAU);ctx.fill();ctx.restore();
      }
      if(e.pulse>0){
        ctx.save();ctx.globalAlpha=e.pulse/.34*.52;ctx.strokeStyle='#ffd6df';ctx.lineWidth=4;
        ctx.beginPath();ctx.arc(x,y,e.slamRadius*(1-e.pulse/.34),0,TAU);ctx.stroke();ctx.restore();
      }
    }
    ctx.save(); ctx.translate(x,Math.round(y+bob));
    if(e.hit>0){ ctx.globalAlpha=.62; ctx.shadowColor='#ffe8eb'; ctx.shadowBlur=12; }
    else if(hover){ ctx.globalAlpha=.82+Math.sin(t*4+e.phase)*.10;ctx.shadowColor='#a38ffc'; ctx.shadowBlur=13; }
    else if(e.type==='cultist' && e.shot<.42){ctx.shadowColor='#f5689f';ctx.shadowBlur=8;}
    const sc=(e.type==='warden'?2.45:e.type==='slime'?1.85:e.type==='bat'?1.95:1.7);
    if(e.type==='slime'){const squash=1+Math.sin(e.phase*1.1)*.055;ctx.scale(1/squash,squash);}
    if(e.type==='warden' && e.windup>0){ctx.shadowColor='#ff789a';ctx.shadowBlur=14;}
    const size=e.type==='warden'?83:e.type==='slime'?57:e.type==='wraith'?64:e.type==='bat'?58:58;
    const bodyH=size*(e.type==='bat'||e.type==='ghoul'||e.type==='spider'?.8:1.08);
    if(!window.NoobArt?.paint(ctx,e.type,-size/2,-bodyH+14,size,bodyH))ctx.drawImage(sprite(e.type==='spider'?'bat':e.type,Math.floor(e.phase/3)%2),-Math.round(12*sc),-Math.round(18*sc),Math.round(24*sc),Math.round(28*sc));ctx.restore();
    if(e.type==='warden'&&e.hit>0){ctx.fillStyle='#ffe7db55';ctx.fillRect(x-23,y-41,46,36);}
    // Persistent, readable status overlays; colour belongs to the status effect.
    const statusSize=e.type==='warden'?36:22;
    if(e.poisonDps>0){
      ctx.save();ctx.globalAlpha=.25+.12*Math.sin(t*4+e.phase);
      ctx.fillStyle='#4cf14d';ctx.shadowColor='#6dff45';ctx.shadowBlur=14;
      ctx.beginPath();ctx.ellipse(x,y-13,statusSize,statusSize*.95,0,0,TAU);ctx.fill();
      for(let j=0;j<3;j++){const yy=(t*(8+j*3)+j*12+e.phase*2)%31;
        ctx.fillRect(x-10+j*9,y+9-yy,2,3);}
      ctx.restore();
      ctx.save();
      ctx.textAlign='center';ctx.font='bold 10px sans-serif';
      ctx.lineWidth=3;ctx.strokeStyle='#102310';ctx.fillStyle='#b1ff83';
      const stacks=`×${e.poisonStacks||1}`;
      ctx.strokeText(stacks,x,y-43);ctx.fillText(stacks,x,y-43);
      ctx.restore();
    }
    if(e.bleedStacks?.length){
      ctx.save();ctx.textAlign='center';ctx.font='bold 10px sans-serif';
      ctx.lineWidth=3;ctx.strokeStyle='#300d1d';ctx.fillStyle='#ff9fb6';
      const stackLabel=`×${e.bleedStacks.length}`;
      ctx.strokeText(stackLabel,x,y-52);ctx.fillText(stackLabel,x,y-52);
      ctx.restore();
      ctx.save();ctx.globalAlpha=.31+.17*Math.sin(t*9+e.phase);
      ctx.fillStyle='#ef214a';ctx.shadowColor='#ff174c';ctx.shadowBlur=9;
      ctx.beginPath();ctx.ellipse(x,y-14,statusSize*.75,statusSize*.95,0,0,TAU);ctx.fill();ctx.restore();
    }
    if(e.burnTime>0){
      ctx.save();ctx.globalAlpha=.68+.14*Math.sin(t*14+e.phase);
      ctx.fillStyle='#ff8a16';ctx.shadowColor='#ff560c';ctx.shadowBlur=12;
      for(let j=0;j<3;j++){
        const xx=x-11+j*11, rise=Math.sin(t*13+j*2+e.phase)*5;
        ctx.beginPath();ctx.moveTo(xx-3,y+5);ctx.lineTo(xx,y-19+rise);ctx.lineTo(xx+4,y+3);ctx.closePath();ctx.fill();
      }ctx.restore();
    }
    if(e.shockTime>0){
      ctx.save();ctx.shadowColor='#6dbdff';ctx.shadowBlur=8;
      ctx.strokeStyle='#67c8ff';ctx.lineWidth=1.3;
      ctx.globalAlpha=.65+.2*Math.sin(t*13+e.phase);
      ctx.beginPath();ctx.arc(x,y-14,e.r+5,0,TAU);ctx.stroke();ctx.restore();
    }
    if(e.hit>0 && e.type!=='warden'){ ctx.fillStyle='#45111d'; ctx.fillRect(x-12,y-29,24,3); ctx.fillStyle='#d8506d'; ctx.fillRect(x-12,y-29,24*e.hp/e.maxHp,3); }
  }
  function drawShots(camX,camY){
    for(const b of game.shots){
      const x=b.x-camX,y=b.y-camY;
      ctx.save();ctx.translate(x,y);ctx.rotate(b.angle);
      if(b.hostile){
        ctx.fillStyle='#7d233840';ctx.fillRect(-12,-7,23,14);
        ctx.fillStyle='#a02f4b';ctx.fillRect(-5,-3,11,6);
        ctx.fillStyle='#ffc1cd';ctx.fillRect(-2,-2,5,4);
      }else{
        const width=(b.orb?31:45)*(b.size||1),height=(b.orb?31:25)*(b.size||1);
        if(!window.NoobArt?.paint(ctx,b.kind||'blood_bolt',-width*.5,-height*.5,width,height)){
          ctx.fillStyle='#fda0ae';ctx.fillRect(-9,-3,18,6);
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
      const s=f.size* (1.12-f.life/f.max*.24);window.NoobArt?.paint(ctx,f.kind,f.x-camX-s/2,f.y-camY-s/2,s,s*.78,clamp(f.life/f.max,0,1));
    }
    for(const b of game.bolts){ctx.save();ctx.strokeStyle=`rgba(199,171,255,${b.life/b.max})`;ctx.lineWidth=2.4;ctx.shadowColor='#a17bff';ctx.shadowBlur=12;ctx.beginPath();ctx.moveTo(b.x-camX,b.y-camY);ctx.lineTo(b.toX-camX,b.toY-camY);ctx.stroke();ctx.restore();}
    const p=game.player;
    for(let i=0;i<p.orbits;i++){
      const a=game.worldTime*2.7+i*TAU/p.orbits,x=p.x+Math.cos(a)*42-camX,y=p.y+Math.sin(a)*42-camY;
      if(!window.NoobArt?.paint(ctx,'holy',x-16,y-10,32,20)){
        ctx.fillStyle='#f6dca3';ctx.fillRect(x-6,y-2,12,4);
      }
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
      drawDrops(camX,camY,t);
      const objects=[...game.enemies.map(e=>({y:e.y,e})),{y:p.y,p}]; objects.sort((a,b)=>a.y-b.y);
      for(const item of objects){ if(item.e) drawEnemy(item.e,camX,camY,t); else drawPlayer(p,camX,camY,t); }
      if(game.death)drawDeath(camX,camY,t);
      drawShots(camX,camY,t); drawMagic(camX,camY); drawSlashBursts(camX,camY); drawImpacts(camX,camY); drawFx(camX,camY);
    } else {
      shadowAt(W/2,H/2+55,22,.5);if(!window.NoobArt?.paint(ctx,'hero_idle',W/2-32,H/2-55,64,85))ctx.drawImage(sprite('hero'),W/2-29,H/2-22,58,70);
    }
    const vignette=ctx.createRadialGradient(W/2,H/2,80,W/2,H/2,405);
    vignette.addColorStop(0,'#0000'); vignette.addColorStop(.75,'#170f1a20'); vignette.addColorStop(1,'#050307a0'); ctx.fillStyle=vignette; ctx.fillRect(0,0,W,H);
    ctx.fillStyle='rgba(123,20,52,0.025)'; ctx.fillRect(0,0,W,H);
    drawFountainArrows(camX,camY);
    if(flash>0){ ctx.fillStyle=`rgba(170,16,42,${flash*.55})`; ctx.fillRect(0,0,W,H); }
  }

  function loop(ts){
    if(!last)last=ts;
    const dt=Math.min((ts-last)/1000,.04);last=ts;
    // Freeze scene animations and gameplay when paused/reading/results.
    if(state==='playing'||state==='death')animTime+=dt;
    if(state==='death')updateDeath(dt);else update(dt);
    draw(animTime);raf=requestAnimationFrame(loop);
  }

  document.addEventListener('keydown',e=>{
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
    if(state==='intro'&&(k==='enter'||k===' '))startGame();
    if(state==='end'&&k==='enter'&&e.target?.tagName!=='BUTTON')startGame(false);
  });
  window.addEventListener('blur',()=>{keys.clear();if(state==='playing')openInventory(false);});
  document.addEventListener('keyup',e=>keys.delete(e.key.toLowerCase()));

  el.reroll.addEventListener('click',rerollUpgrades);el.banish.addEventListener('click',toggleBanish);
  el.start.addEventListener('click',()=>startGame(false)); el.restart.addEventListener('click',()=>startGame(false)); el.resume.addEventListener('click',togglePause);
  el.inventoryBtn.addEventListener('click',togglePause);el.inventoryClose.addEventListener('click',closeInventory);
  el.easyYes.addEventListener('click',()=>chooseEasyMode(true));
  el.easyNo.addEventListener('click',()=>chooseEasyMode(false));
  function updateAudioUI(){
    el.sound.textContent=muted?'MUTE ON':'MUTE OFF';
    el.sound.setAttribute('aria-pressed',String(muted));
    el.sound.classList.toggle('is-muted',muted);
    el.musicVolume.value=String(musicVolume);
    el.sfxVolume.value=String(sfxVolume);
    el.musicVolumeValue.textContent=`${musicVolume}%`;
    el.sfxVolumeValue.textContent=`${sfxVolume}%`;
  }
  function rememberAudio(){
    try { localStorage.setItem('noob-survivors-audio-v06',JSON.stringify({muted,musicVolume,sfxVolume})); } catch(_){}
  }
  try {
    const saved=JSON.parse(localStorage.getItem('noob-survivors-audio-v06') || 'null');
    if(saved && typeof saved==='object'){
      muted=Boolean(saved.muted);
      if(Number.isFinite(saved.musicVolume)) musicVolume=clamp(Math.round(saved.musicVolume),0,100);
      if(Number.isFinite(saved.sfxVolume)) sfxVolume=clamp(Math.round(saved.sfxVolume),0,100);
    }
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