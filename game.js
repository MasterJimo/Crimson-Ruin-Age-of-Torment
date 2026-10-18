/* NOOB SURVIVORS — BLOOD MOON BUILD
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
    sound:$('soundBtn'), music:$('musicSelect'), musicVolume:$('musicVolume'), sfxVolume:$('sfxVolume'),
    musicVolumeValue:$('musicVolumeValue'), sfxVolumeValue:$('sfxVolumeValue'), xpStrip:$('xpStrip'),
    msg:$('message'), status:$('statusText'), portrait:$('portrait'),
    stick:$('stick'), pad:$('mobilePad')
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
    wraith:{name:'Wraith',hp:45,speed:68,damage:13,xp:6,r:11,color:'#8a7ed4',blood:'#66223d',weight:13}
  };

  const POWERS = [
    {id:'damage',icon:'✦',name:'BLOOD EDGE',desc:'+30% damage',apply:p=>p.damage*=1.3},
    {id:'speed',icon:'➤',name:'SHADOW FEET',desc:'+18% move speed',apply:p=>p.speed*=1.18},
    {id:'rate',icon:'✧',name:'HEXED RHYTHM',desc:'+20% attack speed',apply:p=>p.attackRate*=1.2},
    {id:'multi',icon:'✹',name:'TWIN CURSE',desc:'+1 projectile (max 5)',can:p=>p.multishot<5,apply:p=>p.multishot++},
    {id:'vitality',icon:'♥',name:'BLOOD PACT',desc:'+25 max health and heal',apply:p=>{p.maxHp+=25;p.hp=Math.min(p.maxHp,p.hp+40)}},
    {id:'magnet',icon:'◇',name:'SOUL THIEF',desc:'+50% pickup range',apply:p=>p.magnet*=1.5},
    {id:'pierce',icon:'✴',name:'GHOST LANCE',desc:'Projectiles pierce +1 enemy',can:p=>p.pierce<3,apply:p=>p.pierce++},
    {id:'restore',icon:'✚',name:'LAST BREATH',desc:'Recover 45 health',can:p=>p.hp<p.maxHp-15,apply:p=>p.hp=Math.min(p.maxHp,p.hp+45)}
  ];

  const MUSIC_TRACKS = {
    creepy:{label:'Creepy',src:'https://opengameart.org/sites/default/files/CrEEP.mp3'},
    battle:{label:'Battle Theme',src:'https://opengameart.org/sites/default/files/Battle.mp3'},
    caverns:{label:'Ancient Caverns',src:'https://opengameart.org/sites/default/files/caverns.ogg'}
  };

  const sprite = window.NoobSprites.get;
  const portrait = el.portrait.getContext('2d');
  portrait.imageSmoothingEnabled = false;
  portrait.drawImage(sprite('hero'), 5, 1, 54, 62);

  const keys = new Set();
  let state = 'intro', game = null, raf = 0, last = 0, animTime = 0, shake = 0, flash = 0, muted = false, musicVolume = 45, sfxVolume = 55, sfx = null;
  let touchVec = {x:0,y:0}, activePointer = null;
  let musicPlayer = null, currentTrack = el.music.value;

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
  function changeTrack(id){ currentTrack = id in MUSIC_TRACKS ? id : 'creepy'; syncMusic(); flashMessage(`♫ ${MUSIC_TRACKS[currentTrack].label}`, 1400); }

  function startGame(){
    game = {
      time:0,
      player:{x:0,y:0,hp:100,maxHp:100,speed:113,damage:30,attackRate:1.55,multishot:1,pierce:0,magnet:1,xp:0,level:1,next:13,shotCd:.15,hitCd:0,walk:0,face:1},
      enemies:[], shots:[], drops:[], particles:[], texts:[], stains:[], corpses:[], gibs:[], impacts:[], kills:0, spawn:.6, worldTime:0, upgradeChoices:[], nextNotice:25
    };
    state='playing';
    el.intro.classList.add('hidden'); el.end.classList.add('hidden'); el.upgrade.classList.add('hidden'); el.pause.classList.add('hidden');
    el.hud.hidden = false; el.xpStrip.hidden = false; el.pauseBtn.hidden = false; el.msg.textContent = ''; el.status.textContent = 'HUNT IN PROGRESS';
    updateHUD();
    for(let i=0;i<5;i++) spawnEnemy('skeleton',rand(180,320),rand(0,TAU));
    for(let i=0;i<2;i++) spawnEnemy('bat',rand(200,270),rand(0,TAU));
    playSound('start'); syncMusic();
  }

  function spawnEnemy(type=null,distance=null,angle=null){
    const p = game.player, t = game.time; let pool = ['skeleton'];
    if(t>14) pool.push('bat'); if(t>32) pool.push('slime'); if(t>53) pool.push('ghoul'); if(t>83) pool.push('cultist'); if(t>115) pool.push('wraith');
    if(!type){ const weights=pool.map(k=>ENEMIES[k].weight); let q=Math.random()*weights.reduce((a,b)=>a+b,0); type = pool.find(k=>(q-=ENEMIES[k].weight)<=0) || pool[0]; }
    const def = ENEMIES[type], a = angle ?? rand(0,TAU), d = distance ?? rand(275,370), mult = 1 + Math.max(0, t - 30) / 180;
    game.enemies.push({type,x:p.x+Math.cos(a)*d,y:p.y+Math.sin(a)*d,hp:def.hp*mult,maxHp:def.hp*mult,speed:def.speed*(1+t/850),damage:def.damage,r:def.r,phase:rand(0,TAU),shot:rand(.8,2.3),hit:0});
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
      const tone={shot:[470,260,.08,.03],hit:[96,45,.15,.065],pickup:[740,1100,.11,.045],level:[520,980,.45,.08],start:[180,390,.24,.05],hurt:[170,70,.2,.09],death:[300,55,.7,.065]}[kind]||[280,180,.1,.03];
      o.type = kind==='hit'||kind==='hurt' ? 'sawtooth' : 'triangle';
      o.frequency.setValueAtTime(tone[0],now); o.frequency.exponentialRampToValueAtTime(tone[1],now+tone[2]);
      g.gain.setValueAtTime(tone[3] * sfxVolume / 100,now); g.gain.exponentialRampToValueAtTime(.0001,now+tone[2]);
      o.connect(g); g.connect(sfx.destination); o.start(now); o.stop(now+tone[2]);
    } catch(_){}
  }

  function gainXP(value){
    const p=game.player; p.xp += value;
    if(p.xp >= p.next){ p.xp -= p.next; p.level++; p.next = Math.floor(12+p.level*8+p.level*p.level*1.5); state='upgrade'; openUpgrade(); playSound('level'); }
  }
  function openUpgrade(){
    const p=game.player, choices=POWERS.filter(i=>!i.can||i.can(p));
    for(let i=choices.length-1;i>0;i--){ const j=(Math.random()*(i+1))|0; [choices[i],choices[j]]=[choices[j],choices[i]]; }
    game.upgradeChoices=choices.slice(0,3); el.upgradeCards.innerHTML='';
    game.upgradeChoices.forEach((opt,index)=>{
      const b=document.createElement('button'); b.className='upgrade-card';
      b.innerHTML=`<span class="glyph">${opt.icon}</span><strong>${opt.name}</strong><span class="detail">${opt.desc}</span><span class="hotkey">[ ${index+1} ]</span>`;
      b.addEventListener('click',()=>chooseUpgrade(index)); el.upgradeCards.appendChild(b);
    });
    el.upgrade.classList.remove('hidden'); el.status.textContent='CHOOSE A NEW POWER'; updateHUD();
  }
  function chooseUpgrade(index){
    if(state!=='upgrade') return;
    const choice=game.upgradeChoices[index]; if(!choice) return;
    choice.apply(game.player); addParticles(game.player.x,game.player.y,'#ff8ba0',28,105,2,4);
    state='playing'; el.upgrade.classList.add('hidden'); el.status.textContent='HUNT IN PROGRESS';
    flashMessage(`✦ ${choice.name}`, 1800); updateHUD();
  }
  function flashMessage(text,ms=1750){ el.msg.textContent=text; clearTimeout(flashMessage.timer); flashMessage.timer=setTimeout(()=>el.msg.textContent='',ms); }

  function die(won){
    state='end'; el.end.classList.remove('hidden'); el.pauseBtn.hidden=true;
    $('endTitle').textContent = won ? 'YOU SURVIVED!' : 'YOU DIED';
    $('endEyebrow').textContent = won ? 'THE DAWN REMEMBERS YOUR NAME' : 'THE NIGHT CLAIMS ANOTHER SOUL';
    $('endSub').textContent = won ? 'Daybreak came. You lived through another massacre.' : 'The horde still hungers...';
    $('finalTime').textContent = timeText(game.time); $('finalKills').textContent = game.kills; $('finalLevel').textContent = game.player.level;
    el.status.textContent = won ? 'HUNT COMPLETE' : 'HUNT FAILED'; playSound('death');
  }
  function togglePause(){
    if(state==='playing'){ state='paused'; el.pause.classList.remove('hidden'); el.status.textContent='PAUSED'; }
    else if(state==='paused'){ state='playing'; el.pause.classList.add('hidden'); el.status.textContent='HUNT IN PROGRESS'; }
  }

  function shoot(){
    const p=game.player; let target=null, best=390*390;
    for(const e of game.enemies){ const d=dist2(e.x,e.y,p.x,p.y); if(d<best){ best=d; target=e; } }
    if(!target) return;
    const a=Math.atan2(target.y-p.y,target.x-p.x), count=p.multishot;
    for(let i=0;i<count;i++){
      const angle=a + (i - (count - 1) / 2) * .22;
      game.shots.push({x:p.x+Math.cos(angle)*13,y:p.y+Math.sin(angle)*13,vx:Math.cos(angle)*270,vy:Math.sin(angle)*270,life:1.45,damage:p.damage,pierce:p.pierce,hit:new Set(),angle});
    }
    addParticles(p.x+Math.cos(a)*12,p.y+Math.sin(a)*12,'#ff8da1',4,26,2,3); playSound('shot');
  }

  function enemyDie(e){
    const index=game.enemies.indexOf(e); if(index<0) return;
    game.enemies.splice(index,1); game.kills++;
    const def=ENEMIES[e.type];
    game.drops.push({x:e.x,y:e.y,value:def.xp,life:75,phase:rand(0,TAU)});
    addBloodBurst(e.x,e.y,e.type==='slime'?22:16,def.blood); addStain(e.x,e.y,e.type==='slime'?3:2);
    game.corpses.push({type:e.type,x:e.x,y:e.y,phase:e.phase,frame:(Math.random()*2)|0,scale:e.type==='bat'?1.05:e.type==='slime'?1.15:1,rot:rand(-0.3,0.3),age:0});
    if(game.corpses.length>44) game.corpses.shift();
    spawnFragments(e);
    addImpact(e.x,e.y,24,def.color);
    shake=Math.max(shake,2.4);
    playSound('hit');
    if(game.kills%25===0) flashMessage(`☠ ${game.kills} SLAIN`,1700);
  }

  function spawnFragments(e){
    const type=e.type, kinds={skeleton:'bone',bat:'wing',slime:'flesh',ghoul:'flesh',cultist:'cloth',wraith:'ether'};
    const count={skeleton:7,bat:5,slime:9,ghoul:6,cultist:6,wraith:7}[type];
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

  function update(dt){
    if(!game || state!=='playing') return;
    const g=game, p=g.player; g.time+=dt; g.worldTime+=dt;
    if(g.time>=DURATION){ die(true); return; }
    if(g.time>g.nextNotice){ flashMessage(g.time>=150?'FINAL MINUTE!':'THE HORDE THICKENS...',2000); g.nextNotice+=35; }

    let mx=Number(keys.has('d')||keys.has('arrowright')) - Number(keys.has('a')||keys.has('arrowleft')) + touchVec.x;
    let my=Number(keys.has('s')||keys.has('arrowdown')) - Number(keys.has('w')||keys.has('arrowup')) + touchVec.y;
    const mag=Math.hypot(mx,my); if(mag>0){ mx/=mag; my/=mag; p.x+=mx*p.speed*dt; p.y+=my*p.speed*dt; p.walk+=dt*11; p.face=mx<-.05?-1:mx>.05?1:p.face; }

    p.shotCd -= dt; p.hitCd = Math.max(0,p.hitCd-dt);
    if(p.shotCd<=0){ shoot(); p.shotCd = 1/p.attackRate; }

    g.spawn -= dt;
    if(g.spawn<=0){
      const intensity=clamp(g.time/DURATION,0,1), count = 1 + (Math.random() < intensity*.85 ? 1 : 0) + (Math.random() < intensity*.28 ? 1 : 0);
      for(let i=0;i<count;i++) spawnEnemy();
      g.spawn = Math.max(.13, .60 - intensity*.38 - Math.random()*.08);
    }

    for(const e of g.enemies){
      const a=Math.atan2(p.y-e.y,p.x-e.x), d=Math.hypot(p.x-e.x,p.y-e.y); e.phase+=dt*6; e.hit=Math.max(0,e.hit-dt);
      e.x += Math.cos(a)*e.speed*dt; e.y += Math.sin(a)*e.speed*dt;
      if(e.type==='bat'){ e.x+=Math.cos(g.worldTime*8+e.phase)*18*dt; e.y+=Math.sin(g.worldTime*6+e.phase)*12*dt; }
      if(e.type==='slime'){ e.x+=Math.sin(g.worldTime*2+e.phase)*7*dt; }
      if(e.type==='wraith'){ e.x+=Math.cos(g.worldTime*3+e.phase)*10*dt; e.y+=Math.sin(g.worldTime*2.8+e.phase)*10*dt; }
      if(e.type==='cultist'){ e.shot-=dt; if(e.shot<=0 && d<270){ e.shot=1.5+Math.random()*.6; g.shots.push({hostile:true,x:e.x,y:e.y-8,vx:Math.cos(a)*128,vy:Math.sin(a)*128,life:2.2,damage:10,hit:new Set(),angle:a}); } }
      if(d<e.r+9 && p.hitCd<=0){
        p.hp=Math.max(0,p.hp-e.damage); p.hitCd=.65; shake=6; flash=.23;
        floatText(p.x,p.y-28,`-${e.damage}`,'#ff9aac'); addBloodBurst(p.x,p.y,9,'#b01033'); playSound('hurt');
        if(p.hp<=0){ die(false); return; }
      }
    }

    for(let i=g.shots.length-1;i>=0;i--){
      const b=g.shots[i]; b.x+=b.vx*dt; b.y+=b.vy*dt; b.life-=dt;
      if(b.life<=0){ g.shots.splice(i,1); continue; }
      if(b.hostile){
        if(dist2(b.x,b.y,p.x,p.y)<12*12 && p.hitCd<=0){ p.hp=Math.max(0,p.hp-b.damage); p.hitCd=.65; shake=5; flash=.2; addBloodBurst(p.x,p.y,7,'#9c1832'); g.shots.splice(i,1); if(p.hp<=0){ die(false); return; } }
        continue;
      }
      let consumed=false;
      for(const e of g.enemies.slice()){
        if(!b.hit.has(e) && dist2(b.x,b.y,e.x,e.y-4)<(e.r+4)**2){
          b.hit.add(e); e.hp-=b.damage; e.hit=.15; addParticles(b.x,b.y,'#ff8ea2',5,55,2,3); floatText(e.x,e.y-20,String(Math.ceil(b.damage)),'#ffe0cf');
          if(e.hp<=0) enemyDie(e); else {addBloodBurst(e.x,e.y,5,ENEMIES[e.type].blood);addImpact(b.x,b.y,11,'#ec6984');}
          if(b.pierce<=0){ g.shots.splice(i,1); consumed=true; break; } b.pierce--;
        }
      }
      if(consumed) continue;
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

    shake=Math.max(0,shake-25*dt); flash=Math.max(0,flash-dt); updateHUD();
  }

  function updateHUD(){
    if(!game) return;
    const p=game.player;
    el.hp.style.width=`${100*p.hp/p.maxHp}%`; el.hpText.textContent=`${Math.ceil(p.hp)} / ${p.maxHp}`;
    const xpPct=clamp(100*p.xp/p.next,0,100);
    el.xp.style.width=`${xpPct}%`; el.xpStrip.setAttribute('aria-valuenow',String(Math.round(xpPct)));
    el.level.textContent=p.level; el.kills.textContent=game.kills; el.time.textContent=timeText(game.time);
  }

  function drawFloor(cameraX,cameraY,t){
    ctx.fillStyle='#241b23'; ctx.fillRect(0,0,W,H);
    const size=32, left=Math.floor(cameraX/size)-1, top=Math.floor(cameraY/size)-1;
    for(let gy=top; gy<top+15; gy++) for(let gx=left; gx<left+23; gx++){
      const x=Math.floor(gx*size-cameraX), y=Math.floor(gy*size-cameraY), h=hash(gx,gy), h2=hash(gx+52,gy-21);
      ctx.fillStyle = h<.2?'#292029':h<.52?'#30242b':h<.82?'#35272e':'#261c23'; ctx.fillRect(x,y,size+1,size+1);
      if(h2<.3){ ctx.fillStyle='#392832'; ctx.fillRect(x+6,y+12,17,8); ctx.fillStyle='#251a22'; ctx.fillRect(x+10,y+15,9,6); }
      else if(h2>.87){ ctx.fillStyle='#53414a'; ctx.fillRect(x+10,y+18,10,5); ctx.fillStyle='#785a65'; ctx.fillRect(x+11,y+18,6,2); }
      for(let j=0;j<3;j++){
        const a=hash(gx*7+j,gy*13-j), b=hash(gx*11-j,gy*5+j); const xx=x+Math.floor(a*29), yy=y+Math.floor(b*28);
        ctx.fillStyle=a>.55?'#51313d':'#3d2530'; ctx.fillRect(xx,yy,2,4); ctx.fillRect(xx-2,yy+2,1,2);
        if(a>.89){ ctx.fillStyle='#95717f'; ctx.fillRect(xx+1,yy+2,2,2); }
      }
      // Broken slate, hairline cracks, and ritual carvings. World-space seeded, no visual jitter.
      if(h2>.40&&h2<.63){
        ctx.strokeStyle='#5d414c';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(x+3,y+7);
        ctx.lineTo(x+14,y+15);ctx.lineTo(x+11,y+25);ctx.lineTo(x+23,y+29);ctx.stroke();
        ctx.strokeStyle='#20131b';ctx.beginPath();ctx.moveTo(x+5,y+8);ctx.lineTo(x+16,y+16);ctx.stroke();
      }
      if(h>.987&&h2>.7) drawRitualMark(x+16,y+16,t,gx+gy);
      if(h>.966&&h2<.62) drawGrave(x+8,y+5);
      else if(h>.913&&h<.938) drawTwigs(x+6,y+11);
      else if(h>.955&&h<.963) drawCandles(x+14,y+17,t);
      if(hash(gx+87,gy+54)>.994){
        ctx.fillStyle='#241216'; ctx.fillRect(x+13,y+8,3,18); ctx.fillStyle='#7d4d4d'; ctx.fillRect(x+10,y+7,9,2);
        ctx.fillStyle='#cc415d'; ctx.fillRect(x+12,y+3,5,5); ctx.fillStyle='#ffd5db'; ctx.fillRect(x+13,y+4,3,3);
        ctx.fillStyle=`rgba(208,62,88,${.035+Math.sin(t*3+gx)*.012})`; ctx.beginPath(); ctx.arc(x+15,y+6,32,0,TAU); ctx.fill();
      }
    }
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
      ctx.drawImage(sprite(c.type,c.frame),-wide/2,-flat/2,wide,flat);
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
      ctx.fillStyle=b.type==='bone'?'#d8c5af':b.type==='wing'?'#4d2d50':b.type==='cloth'?'#9a2949':b.type==='ether'?'#a294e1':'#ab183c';
      if(b.type==='bone'){
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
    ctx.drawImage(sprite('hero',Math.floor(p.walk*1.2)%2),-20,-32,40,47); ctx.restore();
    for(let i=0;i<3;i++){ const a=t*1.8+i*TAU/3; ctx.fillStyle=i===0?'#ffc7d2':'#f1607f'; ctx.fillRect(Math.round(x+Math.cos(a)*20),Math.round(y-8+Math.sin(a)*11),2,2); }
  }
  function drawEnemy(e,camX,camY,t){
    const x=Math.round(e.x-camX), y=Math.round(e.y-camY), w=e.type==='bat', hover=e.type==='wraith';
    const bob=w?Math.sin(e.phase)*4:hover?Math.sin(t*3+e.phase)*3:Math.sin(e.phase)*1.2;
    shadowAt(x,y+9,e.r+1,w?.2:.37);
    ctx.save(); ctx.translate(x,Math.round(y+bob));
    if(e.hit>0){ ctx.globalAlpha=.62; ctx.shadowColor='#ffe0e7'; ctx.shadowBlur=10; }
    if(hover){ ctx.shadowColor='#8d7cff'; ctx.shadowBlur=13; }
    const sc=(e.type==='slime'?1.85:e.type==='bat'?1.95:1.7);
    ctx.drawImage(sprite(e.type,Math.floor(e.phase/3)%2),-Math.round(12*sc),-Math.round(18*sc),Math.round(24*sc),Math.round(28*sc)); ctx.restore();
    if(e.hit>0){ ctx.fillStyle='#45111d'; ctx.fillRect(x-12,y-29,24,3); ctx.fillStyle='#d8506d'; ctx.fillRect(x-12,y-29,24*e.hp/e.maxHp,3); }
  }
  function drawShots(camX,camY){
    for(const b of game.shots){ const x=b.x-camX, y=b.y-camY; ctx.save(); ctx.translate(x,y); ctx.rotate(b.angle);
      if(b.hostile){ ctx.fillStyle='#7d233840'; ctx.fillRect(-12,-7,23,14); ctx.fillStyle='#a02f4b'; ctx.fillRect(-5,-3,11,6); ctx.fillStyle='#ffc1cd'; ctx.fillRect(-2,-2,5,4); }
      else{ ctx.fillStyle='#ee567140'; ctx.fillRect(-10,-6,21,12); ctx.fillStyle='#7d2838'; ctx.fillRect(-10,-3,13,6); ctx.fillStyle='#f9b8bf'; ctx.fillRect(-5,-2,15,4); ctx.fillStyle='#fff3da'; ctx.fillRect(2,-1,7,2); }
      ctx.restore(); }
  }
  function drawDrops(camX,camY){
    for(const d of game.drops){ const x=Math.round(d.x-camX), y=Math.round(d.y-camY+Math.sin(d.phase)*2); ctx.fillStyle='#f9639a22'; ctx.fillRect(x-7,y-9,14,17); ctx.fillStyle='#8d234a'; ctx.fillRect(x-4,y-5,8,9); ctx.fillStyle='#ff89bb'; ctx.fillRect(x-2,y-8,4,11); ctx.fillStyle='#fff0fb'; ctx.fillRect(x-1,y-5,2,5); }
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
      drawShots(camX,camY,t); drawImpacts(camX,camY); drawFx(camX,camY);
    } else {
      shadowAt(W/2,H/2+55,22,.5); ctx.drawImage(sprite('hero'),W/2-29,H/2-22,58,70);
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
    if(state==='intro'&&(k==='enter'||k===' ')) startGame();
    if(state==='end'&&k==='enter') startGame();
  });
  window.addEventListener('blur',()=>{ keys.clear(); touchVec={x:0,y:0}; if(state==='playing') togglePause(); });
  document.addEventListener('keyup',e=>keys.delete(e.key.toLowerCase()));

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
    try { localStorage.setItem('noob-survivors-audio-v04',JSON.stringify({muted,musicVolume,sfxVolume,currentTrack})); } catch(_){}
  }
  try {
    const saved=JSON.parse(localStorage.getItem('noob-survivors-audio-v04') || 'null');
    if(saved && typeof saved==='object'){
      muted=Boolean(saved.muted);
      if(Number.isFinite(saved.musicVolume)) musicVolume=clamp(Math.round(saved.musicVolume),0,100);
      if(Number.isFinite(saved.sfxVolume)) sfxVolume=clamp(Math.round(saved.sfxVolume),0,100);
      if(saved.currentTrack in MUSIC_TRACKS){ currentTrack=saved.currentTrack; el.music.value=currentTrack; }
    }
  }catch(_){}
  updateAudioUI();
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
  el.music.addEventListener('change',e=>{changeTrack(e.target.value); rememberAudio();});

  const frame=$('frame'); let origin=null;
  frame.addEventListener('pointerdown',e=>{ if(e.pointerType==='mouse'||state!=='playing'||e.target.closest('button')||e.target.closest('select')||e.target.closest('label')) return; if(e.clientX>frame.getBoundingClientRect().left+frame.clientWidth*.66) return; activePointer=e.pointerId; origin={x:e.clientX,y:e.clientY}; try{ frame.setPointerCapture(e.pointerId); }catch(_){} moveStick(e); });
  function moveStick(e){ if(e.pointerId!==activePointer||!origin) return; const dx=e.clientX-origin.x, dy=e.clientY-origin.y, d=Math.hypot(dx,dy)||1; touchVec={x:dx/Math.max(38,d),y:dy/Math.max(38,d)}; const a=Math.min(d,38); el.stick.style.transform=`translate(calc(-50% + ${dx/d*a}px),calc(-50% + ${dy/d*a}px))`; }
  frame.addEventListener('pointermove',moveStick);
  function releaseStick(e){ if(e.pointerId!==activePointer) return; activePointer=null; origin=null; touchVec={x:0,y:0}; el.stick.style.transform='translate(-50%,-50%)'; }
  frame.addEventListener('pointerup',releaseStick); frame.addEventListener('pointercancel',releaseStick);

  if(matchMedia('(pointer:coarse)').matches) el.pad.classList.add('playing');
  requestAnimationFrame(loop);
})();
