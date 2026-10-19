/* NOOB SURVIVORS — HUNTER'S NOCTURNE
   Dependency-free dark fantasy arena survival game.
   Internal canvas: 640 x 360. Round length: 3 minutes. */
(() => {
  'use strict';
  const canvas = document.querySelector('#game');
  const ctx = canvas.getContext('2d', { alpha: false });
  ctx.imageSmoothingEnabled = false;
  // Pixel art stays sharp; curves, particles and glow render at 2x resolution.
  ctx.setTransform(2, 0, 0, 2, 0, 0);

  const W = 640, H = 360, TAU = Math.PI * 2, DURATION = 180;
  const $ = id => document.getElementById(id);
  const el = {
    intro:$('intro'), upgrade:$('upgrade'), upgradeCards:$('upgradeCards'), end:$('endScreen'), pause:$('pauseOverlay'),
    start:$('startBtn'), restart:$('restartBtn'), resume:$('resumeBtn'), pauseBtn:$('pauseBtn'), hud:$('hud'),
    hp:$('hpFill'), hpText:$('hpText'), xp:$('xpFill'), level:$('levelText'), kills:$('killText'), time:$('timeText'),
    sound:$('soundBtn'), musicVolume:$('musicVolume'), sfxVolume:$('sfxVolume'),
    musicVolumeValue:$('musicVolumeValue'), sfxVolumeValue:$('sfxVolumeValue'), xpStrip:$('xpStrip'),
    msg:$('message'), status:$('statusText'), portrait:$('portrait'), bossBar:$('bossBar'), bossFill:$('bossFill'), bossName:$('bossName'),
    stick:$('stick'), pad:$('mobilePad'), reroll:$('rerollBtn'), banish:$('banishBtn'), rerollCount:$('rerollCount'), banishCount:$('banishCount'), perkNotice:$('perkNotice')
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

  // A larger run-specific pool: banished powers never reappear this run.
  const POWERS = [
    {id:'damage',icon:'✦',name:'HUNTER\'S EDGE',desc:'+25% projectile damage',tier:'common',apply:p=>p.damage*=1.25},
    {id:'speed',icon:'➤',name:'SHADOW STRIDE',desc:'+16% move speed',tier:'common',apply:p=>p.speed*=1.16},
    {id:'rate',icon:'✧',name:'RAPID FIRE',desc:'+18% attack speed',tier:'common',apply:p=>p.attackRate*=1.18},
    {id:'multi',icon:'✹',name:'TWIN FANG',desc:'+1 projectile (max 5)',tier:'rare',can:p=>p.multishot<5,apply:p=>p.multishot++},
    {id:'vitality',icon:'♥',name:'BLOOD PACT',desc:'+25 max HP & heal 35',tier:'common',apply:p=>{p.maxHp+=25;p.hp=Math.min(p.maxHp,p.hp+35)}},
    {id:'magnet',icon:'◇',name:'SOUL MAGNET',desc:'+40% pickup range',tier:'common',apply:p=>p.magnet*=1.4},
    {id:'pierce',icon:'✴',name:'PIERCING FANGS',desc:'Shots pierce +1 foe',tier:'rare',can:p=>p.pierce<4,apply:p=>p.pierce++},
    {id:'restore',icon:'✚',name:'DARK RECOVERY',desc:'Heal 45 HP',tier:'common',can:p=>p.hp<p.maxHp-12,apply:p=>p.hp=Math.min(p.maxHp,p.hp+45)},
    {id:'velocity',icon:'➳',name:'QUICK SILVER',desc:'+28% projectile speed',tier:'common',apply:p=>p.projectileSpeed*=1.28},
    {id:'swell',icon:'◉',name:'ARCANE CALIBER',desc:'+25% projectile size',tier:'rare',can:p=>p.projectileSize<2.5,apply:p=>p.projectileSize*=1.25},
    {id:'armor',icon:'⬡',name:'IRON WILL',desc:'Take 10% less damage',tier:'rare',can:p=>p.armor<.5,apply:p=>p.armor=1-(1-p.armor)*.9},
    {id:'crit',icon:'✹',name:'DEADLY PRECISION',desc:'+12% crit chance',tier:'rare',can:p=>p.critChance<.6,apply:p=>p.critChance+=.12},
    {id:'critrage',icon:'✸',name:'EXECUTIONER',desc:'+40% critical damage',tier:'rare',apply:p=>p.critDamage+=.4},
    {id:'leech',icon:'♥',name:'VAMPIRIC TOUCH',desc:'8% chance to heal on hit',tier:'rare',can:p=>p.leechChance<.32,apply:p=>p.leechChance+=.08},
    {id:'fire',icon:'♨',name:'HELLFIRE',desc:'+18% fire shot chance',tier:'legendary',can:p=>p.fireChance<.72,apply:p=>p.fireChance+=.18},
    {id:'frost',icon:'❄',name:'FROSTBITE',desc:'+20% frost shot chance',tier:'rare',can:p=>p.frostChance<.8,apply:p=>p.frostChance+=.2},
    {id:'chain',icon:'ϟ',name:'STORMBRINGER',desc:'+16% chaining lightning',tier:'legendary',can:p=>p.chainChance<.64,apply:p=>p.chainChance+=.16},
    {id:'blast',icon:'✺',name:'BLOOD DETONATION',desc:'+18% explosive shot chance',tier:'legendary',can:p=>p.blastChance<.72,apply:p=>p.blastChance+=.18},
    {id:'souls',icon:'◆',name:'SOUL HARVEST',desc:'+30% XP earned',tier:'rare',apply:p=>p.xpBonus*=1.3},
    {id:'bane',icon:'⚔',name:'GIANT SLAYER',desc:'+40% boss damage',tier:'rare',apply:p=>p.bossDamage*=1.4},
    {id:'regen',icon:'✚',name:'BLOOD MENDING',desc:'+1 HP every 4 seconds',tier:'rare',can:p=>p.regen<2.5,apply:p=>p.regen+=.25},
    {id:'reroll',icon:'↻',name:'FATE TWISTER',desc:'+1 Reroll charge',tier:'rare',apply:(_p,g)=>g.rerolls++},
    {id:'banishtoken',icon:'✕',name:'CURSE BREAKER',desc:'+1 Banish charge',tier:'rare',apply:(_p,g)=>g.banishes++},
    {id:'orbits',icon:'☽',name:'HALO OF BLADES',desc:'+1 orbiting blade (max 4)',tier:'legendary',can:p=>p.orbits<4,apply:p=>p.orbits++}
  ];

  const MUSIC_TRACKS = {
    caverns:{label:'Ancient Caverns',src:'https://opengameart.org/sites/default/files/caverns.ogg'}
  };

  const sprite = window.NoobSprites.get;
  const portrait = el.portrait.getContext('2d');
  portrait.imageSmoothingEnabled = false;
  portrait.drawImage(sprite('heroPortrait'), 5, 1, 54, 62);

  const keys = new Set();
  let state = 'intro', game = null, raf = 0, last = 0, animTime = 0, shake = 0, flash = 0, muted = false, musicVolume = 10, sfxVolume = 5, sfx = null;
  let touchVec = {x:0,y:0}, activePointer = null;
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

  function startGame(){
    game = {
      time:0,
      player:{x:0,y:0,hp:100,maxHp:100,speed:113,damage:30,attackRate:1.55,multishot:1,pierce:0,magnet:1,xp:0,level:1,next:13,shotCd:.15,hitCd:0,walk:0,face:1,attackAnim:0,attackDir:0,attackSide:1,projectileSpeed:1,projectileSize:1,armor:0,critChance:0.06,critDamage:1.6,leechChance:0,fireChance:0,frostChance:0,chainChance:0,blastChance:0,xpBonus:1,bossDamage:1,regen:0,orbits:0,orbitCd:0},
      enemies:[], shots:[], drops:[], particles:[], texts:[], stains:[], corpses:[], gibs:[], impacts:[], slashBursts:[], magicFx:[], bolts:[], kills:0, spawn:.6, worldTime:0, upgradeChoices:[], nextNotice:25, bossWaves:0, bossNext:51,rerolls:2,banishes:2,banned:new Set(),banishMode:false
    };
    state='playing';
    el.intro.classList.add('hidden'); el.end.classList.add('hidden'); el.upgrade.classList.add('hidden'); el.pause.classList.add('hidden');
    el.hud.hidden = false; el.xpStrip.hidden = false; el.bossBar.hidden = true; el.pauseBtn.hidden = false; el.msg.textContent = ''; el.status.textContent = 'HUNT IN PROGRESS';
    updateHUD();
    for(let i=0;i<5;i++) spawnEnemy('skeleton',rand(180,320),rand(0,TAU));
    for(let i=0;i<2;i++) spawnEnemy('bat',rand(200,270),rand(0,TAU));
    playSound('start'); syncMusic();
  }

  function spawnEnemy(type=null,distance=null,angle=null){
    const p = game.player, t = game.time; let pool = ['skeleton'];
    if(t>14) pool.push('bat'); if(t>32) pool.push('slime'); if(t>53) pool.push('ghoul'); if(t>83) pool.push('cultist'); if(t>115) pool.push('wraith'); if(t>96) pool.push('spider');
    if(!type){ const weights=pool.map(k=>ENEMIES[k].weight); let q=Math.random()*weights.reduce((a,b)=>a+b,0); type = pool.find(k=>(q-=ENEMIES[k].weight)<=0) || pool[0]; }
    const def = ENEMIES[type], a = angle ?? rand(0,TAU), d = distance ?? rand(275,370), mult = 1 + Math.max(0, t - 30) / 180;
    game.enemies.push({type,x:p.x+Math.cos(a)*d,y:p.y+Math.sin(a)*d,hp:def.hp*mult,maxHp:def.hp*mult,speed:def.speed*(1+t/850),damage:def.damage,r:def.r,phase:rand(0,TAU),shot:rand(.8,2.3),hit:0,knockX:0,knockY:0});
  }

  // Mid-run miniboss: two appearances, clear tells, readable health bar.
  function spawnWarden(){
    const a=rand(0,TAU), p=game.player;
    const distance=245;
    const hp=480+game.bossWaves*240;
    game.enemies.push({type:'warden',x:p.x+Math.cos(a)*distance,y:p.y+Math.sin(a)*distance,hp,maxHp:hp,
      speed:31+game.bossWaves*3,damage:17,r:21,phase:0,shot:3.2,hit:0,
      knockX:0,knockY:0,windup:0,slamRadius:77,pulse:0,attacks:0});
    game.bossWaves++;
    game.bossNext=game.bossWaves===1?119:Infinity;
    el.bossBar.hidden=false; el.bossName.textContent=game.bossWaves===1?'CRIMSON WARDEN':'CRIMSON WARDEN · ENRAGED';
    flashMessage('⚔ THE WARDEN AWAKENS',2600);
    shake=Math.max(shake,5); playSound('boss');
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
    const p=game.player; p.xp += value*p.xpBonus;
    if(p.xp>=p.next){p.xp-=p.next;p.level++;p.next=Math.floor(12+p.level*8+p.level*p.level*1.5);state='upgrade';openUpgrade();playSound('level');}
  }
  function eligiblePowers(){return POWERS.filter(opt=>!game.banned.has(opt.id) && (!opt.can||opt.can(game.player)));}
  function rollChoices(previous=[]){
    const allowed=eligiblePowers();
    const alternative=allowed.filter(o=>!previous.includes(o.id));
    const selection=alternative.length>=3?alternative:allowed;
    for(let i=selection.length-1;i>0;i--){const j=(Math.random()*(i+1))|0;[selection[i],selection[j]]=[selection[j],selection[i]];}
    return selection.slice(0,3);
  }
  function renderUpgrade(){
    const g=game;
    el.upgradeCards.replaceChildren();
    g.upgradeChoices.forEach((opt,index)=>{
      const b=document.createElement('button');b.type='button';b.className='upgrade-card perk-'+opt.tier;
      b.innerHTML=`<span class="perk-tier">${opt.tier}</span><span class="glyph">${opt.icon}</span><strong>${opt.name}</strong><span class="detail">${opt.desc}</span><span class="hotkey">[ ${index+1} ]</span>`;
      b.addEventListener('click',()=>chooseUpgrade(index));el.upgradeCards.appendChild(b);
    });
    el.rerollCount.textContent=String(g.rerolls);el.banishCount.textContent=String(g.banishes);
    el.reroll.disabled=g.rerolls<=0;
    el.banish.disabled=g.banishes<=0 || eligiblePowers().length<=3;
    el.banish.classList.toggle('armed',g.banishMode);
    el.perkNotice.textContent=g.banishMode?'SELECT A CARD TO BANISH · CLICK BANISH TO CANCEL':'CHOOSE AN UPGRADE · R TO REROLL · B TO BANISH';
  }
  function openUpgrade(){
    game.banishMode=false;
    game.upgradeChoices=rollChoices();
    renderUpgrade();el.upgrade.classList.remove('hidden');el.status.textContent='CHOOSE A NEW POWER';updateHUD();
  }
  function rerollUpgrades(){
    if(state!=='upgrade'||game.rerolls<=0)return;
    const old=game.upgradeChoices.map(opt=>opt.id);
    game.rerolls--;game.banishMode=false;
    game.upgradeChoices=rollChoices(old);
    renderUpgrade();playSound('pickup');
  }
  function toggleBanish(){
    if(state!=='upgrade'||game.banishes<=0)return;
    game.banishMode=!game.banishMode;renderUpgrade();
  }
  function chooseUpgrade(index){
    if(state!=='upgrade')return;
    const choice=game.upgradeChoices[index];if(!choice)return;
    if(game.banishMode){
      if(game.banishes<=0||eligiblePowers().length<=3)return;
      game.banned.add(choice.id);game.banishes--;game.banishMode=false;
      const inView=game.upgradeChoices.filter(o=>!game.banned.has(o.id));
      const candidates=eligiblePowers().filter(o=>!inView.some(v=>v.id===o.id));
      const substitute=candidates[(Math.random()*candidates.length)|0];
      game.upgradeChoices=substitute?[...inView,substitute]:rollChoices();
      renderUpgrade();playSound('hit');return;
    }
    choice.apply(game.player,game);
    addParticles(game.player.x,game.player.y,'#ff8ba0',28,105,2,4);
    state='playing';el.upgrade.classList.add('hidden');el.status.textContent='HUNT IN PROGRESS';
    flashMessage(`✦ ${choice.name}`,1800);updateHUD();
  }
  function flashMessage(text,ms=1750){ el.msg.textContent=text; clearTimeout(flashMessage.timer); flashMessage.timer=setTimeout(()=>el.msg.textContent='',ms); }

  function die(won){
    state='end'; el.end.classList.remove('hidden'); el.pauseBtn.hidden=true; el.bossBar.hidden=true;
    $('endTitle').textContent = won ? 'YOU SURVIVED!' : 'YOU DIED';
    $('endEyebrow').textContent = won ? 'THE DAWN REMEMBERS YOUR NAME' : 'THE NIGHT CLAIMS ANOTHER SOUL';
    $('endSub').textContent = won ? 'Daybreak came. You lived through another massacre.' : 'The horde still hungers...';
    $('finalTime').textContent = timeText(game.time); $('finalKills').textContent = game.kills; $('finalLevel').textContent = game.player.level;
    const rank = game.kills >= 120 ? 'NIGHT REAPER' : game.kills >= 55 ? 'BLOOD HUNTER' : game.kills >= 20 ? 'CRYPT STALKER' : 'NOVICE HUNTER';
    $('huntRank').textContent = won ? `DAWN SURVIVOR · ${rank}` : rank;
    let best=game.kills;
    try {best=Math.max(best,Number(localStorage.getItem('noob-survivors-best-kills')||0)||0);localStorage.setItem('noob-survivors-best-kills',String(best));} catch(_){}
    $('bestKills').textContent = `BEST: ${best} KILLS`;
    el.end.classList.toggle('victory',won);
    el.status.textContent = won ? 'HUNT COMPLETE' : 'HUNT FAILED'; playSound('death');
  }
  function togglePause(){
    if(state==='playing'){ state='paused'; el.pause.classList.remove('hidden'); el.status.textContent='PAUSED'; }
    else if(state==='paused'){ state='playing'; el.pause.classList.add('hidden'); el.status.textContent='HUNT IN PROGRESS'; }
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
    p.attackAnim=.23;
    p.attackDir=aim;
    const speed=142*p.projectileSpeed;
    for(let i=0;i<p.multishot;i++){
      const angle=aim+(i-(p.multishot-1)/2)*.19;
      const fire=Math.random()<p.fireChance, frost=Math.random()<p.frostChance;
      const kind=fire?'fire_bolt':frost?'ice_bolt':'blood_bolt';
      game.shots.push({hostile:false,x:p.x+Math.cos(angle)*14,y:p.y+Math.sin(angle)*14,
        vx:Math.cos(angle)*speed,vy:Math.sin(angle)*speed,angle,life:Math.max(1.2,2.85/p.projectileSpeed),damage:p.damage,kind,fire,frost,size:p.projectileSize,
        pierce:p.pierce,hit:new Set()});
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
      game.player.hp=Math.min(game.player.maxHp,game.player.hp+22);
      el.bossBar.hidden=true;
      flashMessage('✦ WARDEN SLAIN · +22 HP',2400);
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
  function chainLightning(origin,damage,hitSet){
    const other=game.enemies.find(e=>e!==origin&&!hitSet.has(e)&&dist2(e.x,e.y,origin.x,origin.y)<115*115);
    if(!other)return;
    hitSet.add(other);other.hp-=damage;other.hit=.2;
    game.bolts.push({x:origin.x,y:origin.y,toX:other.x,toY:other.y,life:.22,max:.22});
    addMagicFx(other.x,other.y,'lightning',45,.2);
    floatText(other.x,other.y-16,String(Math.ceil(damage)),'#d6b6ff');
    if(other.hp<=0)enemyDie(other);
  }
  function explodeAt(x,y,damage,primary,hitSet){
    addMagicFx(x,y,'impact',70,.35);
    for(const e of game.enemies.slice()){
      if(e===primary||hitSet.has(e)||dist2(e.x,e.y,x,y)>48*48)continue;
      hitSet.add(e);e.hp-=damage;e.hit=.16;
      if(e.hp<=0)enemyDie(e);
    }
  }

  function update(dt){
    if(!game || state!=='playing') return;
    const g=game, p=g.player; g.time+=dt; g.worldTime+=dt;
    if(g.time>=DURATION){ die(true); return; }
    if(g.time>=g.bossNext && !g.enemies.some(e=>e.type==='warden'))spawnWarden();
    if(g.time>g.nextNotice){ flashMessage(g.time>=150?'FINAL MINUTE!':'THE HORDE THICKENS...',2000); g.nextNotice+=35; }

    let mx=Number(keys.has('d')||keys.has('arrowright')) - Number(keys.has('a')||keys.has('arrowleft')) + touchVec.x;
    let my=Number(keys.has('s')||keys.has('arrowdown')) - Number(keys.has('w')||keys.has('arrowup')) + touchVec.y;
    const mag=Math.hypot(mx,my); p.moving=mag>.02; if(mag>0){ mx/=mag; my/=mag; p.x+=mx*p.speed*dt; p.y+=my*p.speed*dt; p.walk+=dt*11; p.face=mx<-.05?-1:mx>.05?1:p.face; }

    p.hp=Math.min(p.maxHp,p.hp+p.regen*dt);
    p.orbitCd=Math.max(0,p.orbitCd-dt);
    if(p.orbits>0 && p.orbitCd<=0){
      p.orbitCd=.4;
      for(let j=0;j<p.orbits;j++){const a=g.worldTime*2.7+j*TAU/p.orbits,xx=p.x+Math.cos(a)*42,yy=p.y+Math.sin(a)*42;
        for(const e of g.enemies.slice())if(dist2(e.x,e.y,xx,yy)<(e.r+11)**2){e.hp-=p.damage*.35;e.hit=.12;if(e.hp<=0)enemyDie(e);} }
    }
    p.shotCd -= dt; p.hitCd = Math.max(0,p.hitCd-dt); p.attackAnim=Math.max(0,p.attackAnim-dt);
    if(p.shotCd<=0){shoot(); p.shotCd=1/p.attackRate;}

    g.spawn -= dt;
    if(g.spawn<=0){
      const intensity=clamp(g.time/DURATION,0,1), count = 1 + (Math.random() < intensity*.85 ? 1 : 0) + (Math.random() < intensity*.28 ? 1 : 0);
      if(g.enemies.length<165)for(let i=0;i<count;i++) spawnEnemy();
      g.spawn = Math.max(.13, .60 - intensity*.38 - Math.random()*.08);
    }

    for(const e of g.enemies){
      const a=Math.atan2(p.y-e.y,p.x-e.x), d=Math.hypot(p.x-e.x,p.y-e.y); e.phase+=dt*6; e.hit=Math.max(0,e.hit-dt);
      if(e.burnTime>0){e.burnTime-=dt;e.hp-=(e.burnDps||0)*dt;if(e.hp<=0){enemyDie(e);continue;}}
      if(e.slowTime>0)e.slowTime=Math.max(0,e.slowTime-dt);
      const slowed=e.slowTime>0?.58:1;
      if(e.knockX||e.knockY){e.x+=e.knockX*dt;e.y+=e.knockY*dt;e.knockX*=Math.exp(-10*dt);e.knockY*=Math.exp(-10*dt);}
      if(e.type==='warden'){
        if(e.windup>0){
          e.windup-=dt;
          if(e.windup<=0){
            e.windup=0;e.pulse=.34;e.attacks++;
            addImpact(e.x,e.y,e.slamRadius,'#ed4262');
            if(dist2(p.x,p.y,e.x,e.y)<(e.slamRadius+7)**2)damagePlayer(19+Math.min(8,e.attacks));
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
      if(e.type==='cultist'){ e.shot-=dt; if(e.shot<=0 && d<270){ e.shot=1.5+Math.random()*.6; g.shots.push({hostile:true,x:e.x,y:e.y-8,vx:Math.cos(a)*128,vy:Math.sin(a)*128,life:2.2,damage:10,hit:new Set(),angle:a}); } }
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
          b.hit.add(e);const crit=Math.random()<p.critChance;const dmg=b.damage*(e.type==='warden'?p.bossDamage:1)*(crit?p.critDamage:1);e.hp-=dmg;e.hit=.18;
          if(b.fire){e.burnTime=2.4;e.burnDps=dmg*.13;}if(b.frost)e.slowTime=2.5;
          if(Math.random()<p.leechChance)p.hp=Math.min(p.maxHp,p.hp+2);
          if(Math.random()<p.chainChance)chainLightning(e,dmg*.55,b.hit);
          if(Math.random()<p.blastChance)explodeAt(e.x,e.y,dmg*.48,e,b.hit);
          const a=b.angle;
          const push=e.type==='warden'?3.5:8;
          e.knockX=Math.cos(a)*35;e.knockY=Math.sin(a)*35;
          e.x+=Math.cos(a)*push;e.y+=Math.sin(a)*push;
          addSlashBurst(e.x,e.y,a,e.type==='warden');
          addParticles(e.x,e.y,'#ffd5dc',5,46,2,3);
          floatText(e.x,e.y-20,`${Math.ceil(dmg)}${crit?'!':''}`,crit?'#ffd274':'#ffe9d0');
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
    for(let i=g.drops.length-1;i>=0;i--){
      const d=g.drops[i]; d.phase+=dt*5; d.life-=dt;
      const dd=Math.hypot(p.x-d.x,p.y-d.y);
      if(dd<84*p.magnet){ const a=Math.atan2(p.y-d.y,p.x-d.x), v=150+Math.max(0,90-dd)*2; d.x+=Math.cos(a)*v*dt; d.y+=Math.sin(a)*v*dt; }
      if(dd<17){ g.drops.splice(i,1); addParticles(d.x,d.y,'#ff8eb7',4,32,2,3); playSound('pickup'); gainXP(d.value); if(state!=='playing') break; }
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
    const xpPct=clamp(100*p.xp/p.next,0,100);
    el.xp.style.width=`${xpPct}%`; el.xpStrip.setAttribute('aria-valuenow',String(Math.round(xpPct)));
    el.level.textContent=p.level; el.kills.textContent=game.kills; el.time.textContent=timeText(game.time);
    const boss=game.enemies.find(e=>e.type==='warden');
    el.bossBar.hidden=!boss;
    if(boss)el.bossFill.style.width=`${clamp(boss.hp/boss.maxHp*100,0,100)}%`;
  }

  function drawFloor(cameraX,cameraY,t){
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
    const walking = Math.sin(p.walk)>0 ? 1 : 2;
    const pose = p.attackAnim>0 ? (p.attackAnim>.22 ? 3 : p.attackAnim>.11 ? 4 : 5) : (p.moving ? walking : 0);
    const art=pose===0?'hero_idle':pose===1||pose===2?'hero_walk':pose===3?'hero_cast':'hero_dash';
    if(!window.NoobArt?.paint(ctx,art,-30,-47,60,61))ctx.drawImage(sprite('hero',pose),-20,-32,40,47); ctx.restore();
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
        const width=45*(b.size||1),height=25*(b.size||1);
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
    for(const d of game.drops){ const x=Math.round(d.x-camX), y=Math.round(d.y-camY+Math.sin(d.phase)*2); ctx.fillStyle='#f9639a22'; ctx.fillRect(x-7,y-9,14,17); ctx.fillStyle='#8d234a'; ctx.fillRect(x-4,y-5,8,9); ctx.fillStyle='#ff89bb'; ctx.fillRect(x-2,y-8,4,11); ctx.fillStyle='#fff0fb'; ctx.fillRect(x-1,y-5,2,5); }
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
    const camX=p.x-W/2+(shake?rand(-shake,shake):0), camY=p.y-H/2+(shake?rand(-shake,shake):0);
    drawFloor(camX,camY,t);
    if(game){
      drawStains(camX,camY);
      drawCorpses(camX,camY);
      drawFragments(camX,camY);
      drawDrops(camX,camY,t);
      const objects=[...game.enemies.map(e=>({y:e.y,e})),{y:p.y,p}]; objects.sort((a,b)=>a.y-b.y);
      for(const item of objects){ if(item.e) drawEnemy(item.e,camX,camY,t); else drawPlayer(p,camX,camY,t); }
      drawShots(camX,camY,t); drawMagic(camX,camY); drawSlashBursts(camX,camY); drawImpacts(camX,camY); drawFx(camX,camY);
    } else {
      shadowAt(W/2,H/2+55,22,.5);if(!window.NoobArt?.paint(ctx,'hero_idle',W/2-32,H/2-48,64,78))ctx.drawImage(sprite('hero'),W/2-29,H/2-22,58,70);
    }
    const vignette=ctx.createRadialGradient(W/2,H/2,80,W/2,H/2,405);
    vignette.addColorStop(0,'#0000'); vignette.addColorStop(.75,'#170f1a20'); vignette.addColorStop(1,'#050307a0'); ctx.fillStyle=vignette; ctx.fillRect(0,0,W,H);
    ctx.fillStyle='rgba(123,20,52,0.025)'; ctx.fillRect(0,0,W,H);
    if(flash>0){ ctx.fillStyle=`rgba(170,16,42,${flash*.55})`; ctx.fillRect(0,0,W,H); }
  }

  function loop(ts){ if(!last) last=ts; const dt=Math.min((ts-last)/1000,.04); last=ts; animTime+=dt; update(dt); draw(animTime); raf=requestAnimationFrame(loop); }

  document.addEventListener('keydown',e=>{
    const k=e.key.toLowerCase();
    if(['arrowup','arrowdown','arrowleft','arrowright',' '].includes(k)) e.preventDefault();
    keys.add(k);
    if(k==='p'||k==='escape'){ if(state==='playing'||state==='paused') togglePause(); }
    if(state==='upgrade'&&['1','2','3'].includes(k)) chooseUpgrade(Number(k)-1);
    if(state==='upgrade'&&k==='r')rerollUpgrades();
    if(state==='upgrade'&&k==='b')toggleBanish();
    if(state==='intro'&&(k==='enter'||k===' ')) startGame();
    if(state==='end'&&k==='enter') startGame();
  });
  window.addEventListener('blur',()=>{ keys.clear(); touchVec={x:0,y:0}; if(state==='playing') togglePause(); });
  document.addEventListener('keyup',e=>keys.delete(e.key.toLowerCase()));

  el.reroll.addEventListener('click',rerollUpgrades);el.banish.addEventListener('click',toggleBanish);
  el.start.addEventListener('click',startGame); el.restart.addEventListener('click',startGame); el.pauseBtn.addEventListener('click',togglePause); el.resume.addEventListener('click',togglePause);
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

  const frame=$('frame'); let origin=null;
  frame.addEventListener('pointerdown',e=>{ if(e.pointerType==='mouse'||state!=='playing'||e.target.closest('button')||e.target.closest('select')||e.target.closest('label')) return; if(e.clientX>frame.getBoundingClientRect().left+frame.clientWidth*.66) return; activePointer=e.pointerId; origin={x:e.clientX,y:e.clientY}; try{ frame.setPointerCapture(e.pointerId); }catch(_){} moveStick(e); });
  function moveStick(e){ if(e.pointerId!==activePointer||!origin) return; const dx=e.clientX-origin.x, dy=e.clientY-origin.y, d=Math.hypot(dx,dy)||1; touchVec={x:dx/Math.max(38,d),y:dy/Math.max(38,d)}; const a=Math.min(d,38); el.stick.style.transform=`translate(calc(-50% + ${dx/d*a}px),calc(-50% + ${dy/d*a}px))`; }
  frame.addEventListener('pointermove',moveStick);
  function releaseStick(e){ if(e.pointerId!==activePointer) return; activePointer=null; origin=null; touchVec={x:0,y:0}; el.stick.style.transform='translate(-50%,-50%)'; }
  frame.addEventListener('pointerup',releaseStick); frame.addEventListener('pointercancel',releaseStick);

  if(matchMedia('(pointer:coarse)').matches) el.pad.classList.add('playing');
  requestAnimationFrame(loop);
})();