/* NOOB SURVIVORS — THE HOLLOW NIGHT
   A dependency-free pixel survival game, deliberately kept simple to extend.
   Canvas internal resolution: 640 x 360. Game time: 3 minutes. */
(() => {
  'use strict';
  const canvas = document.querySelector('#game');
  const ctx = canvas.getContext('2d', { alpha:false });
  ctx.imageSmoothingEnabled = false;
  const W=640,H=360, TAU=Math.PI*2, DURATION=180;
  const $ = id=>document.getElementById(id);
  const el = {intro:$('intro'), upgrade:$('upgrade'), upgradeCards:$('upgradeCards'), end:$('endScreen'), pause:$('pauseOverlay'), start:$('startBtn'), restart:$('restartBtn'), resume:$('resumeBtn'), pauseBtn:$('pauseBtn'),hud:$('hud'),hp:$('hpFill'), hpText:$('hpText'),xp:$('xpFill'), level:$('levelText'),kills:$('killText'),time:$('timeText'), sound:$('soundBtn'), msg:$('message'),status:$('statusText'),portrait:$('portrait'), stick:$('stick'), pad:$('mobilePad')};
  const clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
  const rand=(a,b)=>a+Math.random()*(b-a);
  const dist2=(a,b,c,d)=> (a-c)**2+(b-d)**2;
  const timeText=t=>`${String(Math.floor(t/60)).padStart(2,'0')}:${String(Math.floor(t%60)).padStart(2,'0')}`;
  const hash=(x,y)=>{let h=Math.imul(x,374761393)+Math.imul(y,668265263); h=Math.imul(h^(h>>>13),1274126177); return ((h^(h>>>16))>>>0)/4294967295};
  const ENEMIES={
    skeleton:{name:'Szkielet',hp:40,speed:39,damage:9,xp:3,r:12,color:'#d6c8a0',weight:50},
    bat:{name:'Nietoperz',hp:22,speed:83,damage:7,xp:2,r:10,color:'#aa789d',weight:30},
    slime:{name:'Bagienny slime',hp:65,speed:26,damage:11,xp:4,r:13,color:'#8cba71',weight:24},
    ghoul:{name:'Ghul',hp:85,speed:46,damage:14,xp:5,r:12,color:'#83a780',weight:21},
    cultist:{name:'Kultysta',hp:70,speed:35,damage:10,xp:5,r:11,color:'#d18f76',weight:16},
    wraith:{name:'Zjawa',hp:45,speed:68,damage:13,xp:6,r:11,color:'#9cddc8',weight:13}
  };
  const POWERS=[
    {id:'damage',icon:'✦',name:'OSTRZE MROKU',desc:'+30% obrażeń',apply:p=>p.damage*=1.3},
    {id:'speed',icon:'➤',name:'SZYBKIE STOPY',desc:'+18% prędkości ruchu',apply:p=>p.speed*=1.18},
    {id:'rate',icon:'✧',name:'ZAKLĘTY RYTM',desc:'+20% szybkości ataku',apply:p=>p.attackRate*=1.2},
    {id:'multi',icon:'✹',name:'ROZDWOJENIE',desc:'+1 magiczny pocisk (maks. 5)',can:p=>p.multishot<5,apply:p=>p.multishot++},
    {id:'vitality',icon:'♥',name:'KRWAWY PAKT',desc:'+25 maks. zdrowia i leczenie',apply:p=>{p.maxHp+=25;p.hp=Math.min(p.maxHp,p.hp+40)}},
    {id:'magnet',icon:'◇',name:'ZŁODZIEJ DUSZ',desc:'+50% zasięgu zbierania',apply:p=>p.magnet*=1.5},
    {id:'pierce',icon:'✴',name:'WIDMOWY STRZAŁ',desc:'Pociski przebijają +1 wroga',can:p=>p.pierce<3,apply:p=>p.pierce++},
    {id:'restore',icon:'✚',name:'OSTATNIE TCHNIENIE',desc:'Odzyskaj 45 zdrowia',can:p=>p.hp<p.maxHp-15,apply:p=>p.hp=Math.min(p.maxHp,p.hp+45)}
  ];
  const keys = new Set(); let state='intro', game=null, raf=0,last=0,animTime=0,shake=0,flash=0,sound=false,audio=null,musicTick=0;
  let touchVec={x:0,y:0},activePointer=null;
  const sprite=window.NoobSprites.get;
  const portrait=el.portrait.getContext('2d'); portrait.imageSmoothingEnabled=false;
  portrait.drawImage(sprite('hero'),5,1,54,62);

  function startGame(){
    game={time:0,player:{x:0,y:0,hp:100,maxHp:100,speed:113,damage:30,attackRate:1.55,multishot:1,pierce:0,magnet:1,xp:0,level:1,next:13,shotCd:.15,hitCd:0,walk:0,face:1},enemies:[],shots:[],drops:[],particles:[],texts:[],kills:0,spawn:.6,worldTime:0,upgradeChoices:[],nextNotice:25};
    state='playing';el.intro.classList.add('hidden');el.end.classList.add('hidden');el.upgrade.classList.add('hidden');el.pause.classList.add('hidden');el.hud.hidden=false;el.pauseBtn.hidden=false;el.msg.textContent='';el.status.textContent='PRZETRWANIE W TOKU';updateHUD();
    for(let i=0;i<5;i++)spawnEnemy('skeleton',rand(180,320),rand(0,TAU));
    for(let i=0;i<2;i++)spawnEnemy('bat',rand(200,270),rand(0,TAU));
    playSound('start');
  }
  function spawnEnemy(type=null,distance=null,angle=null){
    const p=game.player,t=game.time;let pool=['skeleton'];
    if(t>14)pool.push('bat'); if(t>32)pool.push('slime');if(t>53)pool.push('ghoul');if(t>83)pool.push('cultist');if(t>115)pool.push('wraith');
    if(!type){const weights=pool.map(k=>ENEMIES[k].weight);let q=Math.random()*weights.reduce((a,b)=>a+b,0);type=pool.find(k=>(q-=ENEMIES[k].weight)<=0)||pool[0];}
    const def=ENEMIES[type]; const a=angle??rand(0,TAU),d=distance??rand(275,370);
    const mult=1+Math.max(0,t-30)/180;
    game.enemies.push({type,x:p.x+Math.cos(a)*d,y:p.y+Math.sin(a)*d,hp:def.hp*mult,maxHp:def.hp*mult,speed:def.speed*(1+t/850),damage:def.damage,r:def.r,phase:rand(0,TAU),shot:rand(.8,2.3),hit:0,poison:0});
  }
  function addParticles(x,y,color,count=7,power=55){
    for(let i=0;i<count;i++){if(game.particles.length>260)break;
      const a=rand(0,TAU),spd=rand(power*.25,power);
      game.particles.push({x,y,vx:Math.cos(a)*spd,vy:Math.sin(a)*spd,life:rand(.2,.65),max:.65,size:Math.random()<.5?2:3,color});}
  }
  function floatText(x,y,text,color='#ffdfaa',size=10){game.texts.push({x,y,text,color,size,life:.75,max:.75});}
  function playSound(kind){
    if(!sound)return;
    try {
      audio ||= new (window.AudioContext||window.webkitAudioContext)();
      if(audio.state==='suspended')audio.resume();
      const o=audio.createOscillator(),g=audio.createGain(),now=audio.currentTime;
      const tone={shot:[440,260,.09,.035],hit:[100,55,.12,.065],pickup:[600,1020,.11,.04],level:[540,940,.4,.07],start:[220,450,.24,.045],hurt:[180,70,.18,.1],death:[350,60,.7,.06]}[kind]||[300,180,.1,.03];
      o.type=kind==='hit'||kind==='hurt'?'sawtooth':'triangle';o.frequency.setValueAtTime(tone[0],now);o.frequency.exponentialRampToValueAtTime(tone[1],now+tone[2]);
      g.gain.setValueAtTime(tone[3],now);g.gain.exponentialRampToValueAtTime(.0001,now+tone[2]);o.connect(g);g.connect(audio.destination);o.start(now);o.stop(now+tone[2]);
    }catch(_){}
  }
  function gainXP(value){
    const p=game.player;p.xp+=value;
    if(p.xp>=p.next){p.xp-=p.next;p.level++;p.next=Math.floor(12+p.level*8+p.level*p.level*1.5);state='upgrade';openUpgrade();playSound('level');}
  }
  function openUpgrade(){
    const p=game.player,choices=POWERS.filter(i=>!i.can||i.can(p));
    for(let i=choices.length-1;i>0;i--){let j=Math.floor(Math.random()*(i+1));[choices[i],choices[j]]=[choices[j],choices[i]];}
    game.upgradeChoices=choices.slice(0,3);el.upgradeCards.innerHTML='';
    game.upgradeChoices.forEach((opt,index)=>{
      const b=document.createElement('button');b.className='upgrade-card';
      b.innerHTML=`<span class="glyph">${opt.icon}</span><strong>${opt.name}</strong><span class="detail">${opt.desc}</span><span class="hotkey">[ ${index+1} ]</span>`;
      b.addEventListener('click',()=>chooseUpgrade(index));el.upgradeCards.appendChild(b);
    });
    el.upgrade.classList.remove('hidden');el.status.textContent='WYBIERZ NOWĄ MOC';updateHUD();
  }
  function chooseUpgrade(index){
    if(state!=='upgrade')return;
    const choice=game.upgradeChoices[index];if(!choice)return;
    choice.apply(game.player);addParticles(game.player.x,game.player.y,'#dbefad',25,100);
    state='playing';el.upgrade.classList.add('hidden');el.status.textContent='PRZETRWANIE W TOKU';
    flashMessage('✦ '+choice.name,1800);updateHUD();
  }
  function flashMessage(text,ms=1750){el.msg.textContent=text;clearTimeout(flashMessage.timer);flashMessage.timer=setTimeout(()=>el.msg.textContent='',ms);}
  function die(won){
    state='end';el.end.classList.remove('hidden');el.pauseBtn.hidden=true;
    $('endTitle').textContent=won?'PRZETRWAŁEŚ!':'POLEGŁEŚ';
    $('endEyebrow').textContent=won?'THE DAWN REMEMBERS YOUR NAME':'THE NIGHT CLAIMS ANOTHER SOUL';
    $('endSub').textContent=won?'Świt nadszedł. Jeszcze jedna noc za tobą.':'Cienie wciąż są głodne...';
    $('finalTime').textContent=timeText(game.time);$('finalKills').textContent=game.kills;$('finalLevel').textContent=game.player.level;
    el.status.textContent=won?'WYPRAWA ZAKOŃCZONA':'WYPRAWA PRZERWANA';playSound('death');
  }
  function togglePause(){
    if(state==='playing'){state='paused';el.pause.classList.remove('hidden');el.status.textContent='PAUZA';}
    else if(state==='paused'){state='playing';el.pause.classList.add('hidden');el.status.textContent='PRZETRWANIE W TOKU';}
  }
  function shoot(){
    const p=game.player;
    let target=null,best=390*390;
    for(const e of game.enemies){const d=dist2(e.x,e.y,p.x,p.y);if(d<best){best=d;target=e;}}
    if(!target)return;
    const a=Math.atan2(target.y-p.y,target.x-p.x),count=p.multishot;
    for(let i=0;i<count;i++){
      const angle=a+(i-(count-1)/2)*.22;
      game.shots.push({x:p.x+Math.cos(angle)*13,y:p.y+Math.sin(angle)*13,vx:Math.cos(angle)*270,vy:Math.sin(angle)*270,life:1.45,damage:p.damage,pierce:p.pierce,hit:new Set(),angle});
    }
    addParticles(p.x+Math.cos(a)*12,p.y+Math.sin(a)*12,'#caffb1',3,20);playSound('shot');
  }
  function enemyDie(e){
    const index=game.enemies.indexOf(e);if(index<0)return;
    game.enemies.splice(index,1);game.kills++;
    const d=ENEMIES[e.type];game.drops.push({x:e.x,y:e.y,value:d.xp,life:75,phase:rand(0,TAU)});
    addParticles(e.x,e.y,d.color,e.type==='slime'?13:9,75);playSound('hit');
    if(game.kills%25===0)flashMessage('☠ '+game.kills+' POKONANYCH',1700);
  }
  function update(dt){
    if(!game||state!=='playing')return;
    const g=game,p=g.player;g.time+=dt;g.worldTime+=dt;
    if(g.time>=DURATION){die(true);return;}
    if(g.time>g.nextNotice){flashMessage(g.time>=150?'OSTATNIA MINUTA!':'CIEMNOŚĆ GĘSTNIEJE...',2000);g.nextNotice+=35;}
    let mx=Number(keys.has('d')||keys.has('arrowright'))-Number(keys.has('a')||keys.has('arrowleft'))+touchVec.x;
    let my=Number(keys.has('s')||keys.has('arrowdown'))-Number(keys.has('w')||keys.has('arrowup'))+touchVec.y;
    const mag=Math.hypot(mx,my);if(mag>0){mx/=mag;my/=mag;p.x+=mx*p.speed*dt;p.y+=my*p.speed*dt;p.walk+=dt*11;p.face=mx<-.05?-1:mx>.05?1:p.face;}
    p.shotCd-=dt;p.hitCd=Math.max(0,p.hitCd-dt);
    if(p.shotCd<=0){shoot();p.shotCd=1/p.attackRate;}
    // Spawn density gradually increases, but an upper bound keeps it performant on phones.
    g.spawn-=dt;
    if(g.spawn<=0 && g.enemies.length<115){spawnEnemy();if(g.time>100&&Math.random()<.23)spawnEnemy();g.spawn=.90/(1+g.time/98)*rand(.7,1.25);}
    for(let i=g.enemies.length-1;i>=0;i--){
      const e=g.enemies[i],def=ENEMIES[e.type];e.phase+=dt*(e.type==='bat'?10:4.3);e.hit=Math.max(0,e.hit-dt);e.shot-=dt;
      const a=Math.atan2(p.y-e.y,p.x-e.x),d=Math.hypot(p.x-e.x,p.y-e.y);
      if(e.type==='cultist'&&d<155&&d>90){e.x+=Math.cos(a+.8)*e.speed*dt*.5;e.y+=Math.sin(a+.8)*e.speed*dt*.5;}
      else {let s=e.speed;if(e.type==='bat')s*=1+.18*Math.sin(e.phase);e.x+=Math.cos(a)*s*dt;e.y+=Math.sin(a)*s*dt;}
      // Cultists burst a short stream of dark embers at the hero.
      if(e.type==='cultist'&&e.shot<=0&&d<230){e.shot=2.6;g.shots.push({hostile:true,x:e.x,y:e.y-8,vx:Math.cos(a)*128,vy:Math.sin(a)*128,life:2.2,damage:10,hit:new Set(),angle:a});}
      if(d<e.r+9 && p.hitCd<=0){p.hp=Math.max(0,p.hp-e.damage);p.hitCd=.65;shake=6;flash=.23;floatText(p.x,p.y-28,'-'+e.damage,'#ef8b7c');addParticles(p.x,p.y,'#e18f7c',7,80);playSound('hurt');if(p.hp<=0){die(false);return;}}
    }
    // Shots are simple fast-moving projectiles that can optionally pierce enemies.
    for(let i=g.shots.length-1;i>=0;i--){
      const b=g.shots[i];b.x+=b.vx*dt;b.y+=b.vy*dt;b.life-=dt;
      if(b.life<=0){g.shots.splice(i,1);continue;}
      if(b.hostile){if(dist2(b.x,b.y,p.x,p.y)<12*12&&p.hitCd<=0){p.hp=Math.max(0,p.hp-b.damage);p.hitCd=.65;shake=5;flash=.2;addParticles(p.x,p.y,'#d26d8d',6);g.shots.splice(i,1);if(p.hp<=0){die(false);return;}}continue;}
      let consumed=false;
      for(const e of g.enemies.slice()){
        if(!b.hit.has(e)&&dist2(b.x,b.y,e.x,e.y-4)<(e.r+4)**2){
          b.hit.add(e);e.hp-=b.damage;e.hit=.15;addParticles(b.x,b.y,'#c8e8a4',5,55);floatText(e.x,e.y-20,String(Math.ceil(b.damage)),'#f0dc99');
          if(e.hp<=0)enemyDie(e);
          if(b.pierce<=0){g.shots.splice(i,1);consumed=true;break;}b.pierce--;
        }
      }
      if(consumed)continue;
    }
    for(let i=g.drops.length-1;i>=0;i--){
      const d=g.drops[i];d.phase+=dt*5;d.life-=dt;
      const dd=Math.hypot(p.x-d.x,p.y-d.y);
      if(dd<84*p.magnet){const a=Math.atan2(p.y-d.y,p.x-d.x);const v=150+Math.max(0,90-dd)*2;d.x+=Math.cos(a)*v*dt;d.y+=Math.sin(a)*v*dt;}
      if(dd<17){g.drops.splice(i,1);addParticles(d.x,d.y,'#7df6bd',3,30);playSound('pickup');gainXP(d.value);if(state!=='playing')break;}
      else if(d.life<0)g.drops.splice(i,1);
    }
    for(let i=g.particles.length-1;i>=0;i--){const v=g.particles[i];v.x+=v.vx*dt;v.y+=v.vy*dt;v.vx*=.95;v.vy*=.95;v.life-=dt;if(v.life<=0)g.particles.splice(i,1);}
    for(let i=g.texts.length-1;i>=0;i--){const t=g.texts[i];t.y-=28*dt;t.life-=dt;if(t.life<=0)g.texts.splice(i,1);}
    shake=Math.max(0,shake-25*dt);flash=Math.max(0,flash-dt);updateHUD();
  }
  function updateHUD(){if(!game)return;const p=game.player;el.hp.style.width=`${100*p.hp/p.maxHp}%`;el.hpText.textContent=`${Math.ceil(p.hp)} / ${p.maxHp}`;el.xp.style.width=`${100*p.xp/p.next}%`;el.level.textContent=p.level;el.kills.textContent=game.kills;el.time.textContent=timeText(game.time);}
  function drawFloor(cameraX,cameraY,t){
    ctx.fillStyle='#18241c';ctx.fillRect(0,0,W,H);
    const size=32,left=Math.floor(cameraX/size)-1,top=Math.floor(cameraY/size)-1;
    for(let gy=top;gy<top+15;gy++)for(let gx=left;gx<left+23;gx++){
      const x=Math.floor(gx*size-cameraX),y=Math.floor(gy*size-cameraY),h=hash(gx,gy),h2=hash(gx+52,gy-21);
      ctx.fillStyle=h<.2?'#18271d':h<.52?'#1c2b20':h<.82?'#1a291e':'#202d21';ctx.fillRect(x,y,size+1,size+1);
      // Small chunky patches and broken stones create an illustrated forest floor.
      if(h2<.3){ctx.fillStyle='#273528';ctx.fillRect(x+6,y+12,17,8);ctx.fillStyle='#1d2c23';ctx.fillRect(x+10,y+15,9,6);}
      else if(h2>.87){ctx.fillStyle='#3a4035';ctx.fillRect(x+10,y+18,10,5);ctx.fillStyle='#4b5144';ctx.fillRect(x+11,y+18,6,2);}
      for(let j=0;j<3;j++){
        const a=hash(gx*7+j,gy*13-j),b=hash(gx*11-j,gy*5+j);
        const xx=x+Math.floor(a*29),yy=y+Math.floor(b*28);
        ctx.fillStyle=a>.55?'#33432c':'#243b29';ctx.fillRect(xx,yy,2,4);ctx.fillRect(xx-2,yy+2,1,2);
        if(a>.89){ctx.fillStyle='#6e7952';ctx.fillRect(xx+1,yy+2,2,2);}
      }
      // Graves, cracked obelisks, skeletal roots, and mushrooms stay consistent in world-space.
      if(h>.966&&h2<.62)drawGrave(x+8,y+5,h2);
      else if(h>.913&&h<.938)drawTwigs(x+6,y+11,h2);
      else if(h>.955&&h<.963)drawMushroom(x+14,y+17);
      if(hash(gx+87,gy+54)>.994){ // haunted lantern
        ctx.fillStyle='#293329';ctx.fillRect(x+13,y+8,3,18);ctx.fillStyle='#b29a62';ctx.fillRect(x+10,y+7,9,2);
        ctx.fillStyle='#d6b06d';ctx.fillRect(x+12,y+3,5,5);ctx.fillStyle='#ffe2a3';ctx.fillRect(x+13,y+4,3,3);
        ctx.fillStyle=`rgba(245,190,95,${.035+Math.sin(t*3+gx)*.012})`;ctx.beginPath();ctx.arc(x+15,y+6,32,0,TAU);ctx.fill();
      }
    }
  }
  function drawGrave(x,y,s){ctx.fillStyle='#101a15';ctx.fillRect(x+2,y+12,17,10);ctx.fillStyle='#394439';ctx.fillRect(x+4,y+4,13,17);ctx.fillStyle='#5a6351';ctx.fillRect(x+6,y+2,9,3);ctx.fillRect(x+4,y+6,2,12);ctx.fillStyle='#30382e';ctx.fillRect(x+7,y+10,7,9);ctx.fillStyle='#7a806a';ctx.fillRect(x+9,y+8,2,7);ctx.fillRect(x+7,y+11,6,2);ctx.fillStyle='#242f24';ctx.fillRect(x+1,y+20,20,3);}
  function drawTwigs(x,y,s){ctx.fillStyle='#34402d';ctx.fillRect(x+8,y+3,2,16);ctx.fillRect(x+3,y+10,6,2);ctx.fillRect(x+9,y+8,7,2);ctx.fillStyle='#697554';ctx.fillRect(x+8,y+3,1,9);}
  function drawMushroom(x,y){ctx.fillStyle='#aa8a70';ctx.fillRect(x+4,y+5,3,6);ctx.fillStyle='#8e6048';ctx.fillRect(x,y+1,11,5);ctx.fillStyle='#d2af85';ctx.fillRect(x+2,y+1,6,2);ctx.fillStyle='#f1d5aa';ctx.fillRect(x+5,y+2,2,2);}
  function paintSprite(kind,x,y,scale=1.55,frame=0,tint=null){
    const s=sprite(kind,frame);ctx.save();ctx.translate(Math.round(x),Math.round(y));
    if(tint){ctx.globalAlpha=.65;ctx.fillStyle=tint;}
    ctx.drawImage(s,-Math.round(12*scale),-Math.round(18*scale),Math.round(24*scale),Math.round(28*scale));ctx.restore();
  }
  function shadowAt(x,y,r=15,alpha=.35){ctx.fillStyle=`rgba(5,13,9,${alpha})`;ctx.beginPath();ctx.ellipse(x,y,r,r*.40,0,0,TAU);ctx.fill();}
  function drawPlayer(p,camX,camY,t){
    const x=p.x-camX,y=p.y-camY;
    ctx.fillStyle='#91b88714';ctx.beginPath();ctx.arc(x,y,34+Math.sin(t*3)*2,0,TAU);ctx.fill();
    ctx.strokeStyle='#a5c58a2b';ctx.lineWidth=1;ctx.beginPath();ctx.ellipse(x,y+9,27,11,0,0,TAU);ctx.stroke();
    shadowAt(x,y+11,19,.52);
    ctx.save();ctx.translate(Math.round(x),Math.round(y+Math.sin(p.walk)*1));ctx.scale(p.face,1);
    if(p.hitCd>0&&Math.floor(p.hitCd*13)%2===0)ctx.globalAlpha=.55;
    ctx.drawImage(sprite('hero',Math.floor(p.walk*1.2)%2),-20,-32,40,47);ctx.restore();
    // Small wisps of magic, orbiting the robe.
    for(let i=0;i<3;i++){const a=t*1.8+i*TAU/3;ctx.fillStyle=i===0?'#c0dd93':'#77b69a';ctx.fillRect(Math.round(x+Math.cos(a)*20),Math.round(y-8+Math.sin(a)*11),2,2);}
  }
  function drawEnemy(e,camX,camY,t){
    const x=Math.round(e.x-camX),y=Math.round(e.y-camY),w=e.type==='bat',hover=e.type==='wraith';
    const bob=w?Math.sin(e.phase)*4:hover?Math.sin(t*3+e.phase)*3:Math.sin(e.phase)*1.2;
    shadowAt(x,y+9,e.r+1,w?.2:.37);
    ctx.save();ctx.translate(x,Math.round(y+bob));
    if(e.hit>0){ctx.globalAlpha=.57;ctx.shadowColor='#ffe8c0';ctx.shadowBlur=9;}
    if(hover){ctx.shadowColor='#60b6a7';ctx.shadowBlur=13;}
    const sc=(e.type==='slime'?1.85:e.type==='bat'?1.95:1.7);
    ctx.drawImage(sprite(e.type,Math.floor(e.phase/3)%2),-Math.round(12*sc),-Math.round(18*sc),Math.round(24*sc),Math.round(28*sc));ctx.restore();
    if(e.hit>0){ctx.fillStyle='#c77661';ctx.fillRect(x-12,y-29,24,3);ctx.fillStyle='#c8dca5';ctx.fillRect(x-12,y-29,24*e.hp/e.maxHp,3);}
  }
  function drawShots(camX,camY,t){
    for(const b of game.shots){const x=b.x-camX,y=b.y-camY;ctx.save();ctx.translate(x,y);ctx.rotate(b.angle);
      if(b.hostile){ctx.fillStyle='#ad5b7f44';ctx.fillRect(-12,-7,23,14);ctx.fillStyle='#c57895';ctx.fillRect(-5,-3,11,6);ctx.fillStyle='#f2a4b3';ctx.fillRect(-2,-2,5,4);}
      else{ctx.fillStyle='#9af8b83d';ctx.fillRect(-10,-6,21,12);ctx.fillStyle='#608c68';ctx.fillRect(-10,-3,13,6);ctx.fillStyle='#d3f7ac';ctx.fillRect(-5,-2,15,4);ctx.fillStyle='#fff7cf';ctx.fillRect(2,-1,7,2);}
      ctx.restore();
    }
  }
  function drawDrops(camX,camY,t){for(const d of game.drops){const x=Math.round(d.x-camX),y=Math.round(d.y-camY+Math.sin(d.phase)*2);ctx.fillStyle='#65d99c33';ctx.fillRect(x-7,y-9,14,17);ctx.fillStyle='#398b75';ctx.fillRect(x-4,y-5,8,9);ctx.fillStyle='#88e7af';ctx.fillRect(x-2,y-8,4,11);ctx.fillStyle='#e0ffc5';ctx.fillRect(x-1,y-5,2,5);}}
  function drawFx(camX,camY){
    for(const p of game.particles){ctx.globalAlpha=clamp(p.life/p.max,0,1);ctx.fillStyle=p.color;ctx.fillRect(Math.round(p.x-camX),Math.round(p.y-camY),p.size,p.size);}
    ctx.globalAlpha=1;
    ctx.textAlign='center';ctx.textBaseline='middle';ctx.font='bold 11px Silkscreen,monospace';
    for(const t of game.texts){ctx.globalAlpha=Math.min(1,t.life*3);ctx.fillStyle='#090e0b';ctx.fillText(t.text,Math.round(t.x-camX+1),Math.round(t.y-camY+2));ctx.fillStyle=t.color;ctx.fillText(t.text,Math.round(t.x-camX),Math.round(t.y-camY));}
    ctx.globalAlpha=1;
  }
  function draw(t){
    const p=game?.player||{x:0,y:0,walk:0,face:1,hitCd:0};
    const camX=p.x-W/2+(shake?rand(-shake,shake):0),camY=p.y-H/2+(shake?rand(-shake,shake):0);
    drawFloor(camX,camY,t);
    if(game){
      drawDrops(camX,camY,t);
      // Y-sort player and monsters so overlapping feet read naturally.
      const objects=[...game.enemies.map(e=>({y:e.y,e})),{y:p.y,p}];objects.sort((a,b)=>a.y-b.y);
      for(const item of objects){if(item.e)drawEnemy(item.e,camX,camY,t);else drawPlayer(p,camX,camY,t);}
      drawShots(camX,camY,t);drawFx(camX,camY);
    } else {
      shadowAt(W/2,H/2+55,22,.5);
      ctx.drawImage(sprite('hero'),W/2-29,H/2-22,58,70);
    }
    // Moody forest vignette, cool moonlight and tiny upper-screen shafts.
    const vignette=ctx.createRadialGradient(W/2,H/2,80,W/2,H/2,405);
    vignette.addColorStop(0,'#0000');vignette.addColorStop(.75,'#09120d2b');vignette.addColorStop(1,'#030705ad');ctx.fillStyle=vignette;ctx.fillRect(0,0,W,H);
    if(flash>0){ctx.fillStyle=`rgba(185,60,48,${flash*.45})`;ctx.fillRect(0,0,W,H);}
  }
  function loop(ts){
    if(!last)last=ts;
    const dt=Math.min((ts-last)/1000,.04);last=ts;animTime+=dt;
    update(dt);draw(animTime);raf=requestAnimationFrame(loop);
  }
  // Keyboard interaction deliberately prevents browser scrolling with arrow keys and space.
  document.addEventListener('keydown',e=>{
    const k=e.key.toLowerCase();
    if(['arrowup','arrowdown','arrowleft','arrowright',' '].includes(k))e.preventDefault();
    keys.add(k);
    if(k==='p'||k==='escape'){if(state==='playing'||state==='paused')togglePause();}
    if(state==='upgrade'&&['1','2','3'].includes(k))chooseUpgrade(Number(k)-1);
    if(state==='intro'&&(k==='enter'||k===' '))startGame();
    if(state==='end'&&k==='enter')startGame();
  });
  window.addEventListener('blur',()=>{keys.clear();touchVec={x:0,y:0};if(state==='playing')togglePause();});
  document.addEventListener('keyup',e=>keys.delete(e.key.toLowerCase()));
  el.start.addEventListener('click',startGame);el.restart.addEventListener('click',startGame);el.pauseBtn.addEventListener('click',togglePause);el.resume.addEventListener('click',togglePause);
  el.sound.addEventListener('click',()=>{sound=!sound;el.sound.textContent=sound?'♪ ON':'♪ OFF';if(sound)playSound('pickup');});
  // Pointer joystick: touch left half of canvas or its dedicated control pad.
  const frame=$('frame');let origin=null;
  frame.addEventListener('pointerdown',e=>{
    if(e.pointerType==='mouse'||state!=='playing'||e.target.closest('button'))return;
    if(e.clientX>frame.getBoundingClientRect().left+frame.clientWidth*.66)return;
    activePointer=e.pointerId;origin={x:e.clientX,y:e.clientY};try{frame.setPointerCapture(e.pointerId);}catch(_){}
    moveStick(e);
  });
  function moveStick(e){
    if(e.pointerId!==activePointer||!origin)return;
    const dx=e.clientX-origin.x,dy=e.clientY-origin.y,d=Math.hypot(dx,dy)||1;
    touchVec={x:dx/Math.max(38,d),y:dy/Math.max(38,d)};
    const a=Math.min(d,38);el.stick.style.transform=`translate(calc(-50% + ${dx/d*a}px),calc(-50% + ${dy/d*a}px))`;
  }
  frame.addEventListener('pointermove',moveStick);
  function releaseStick(e){if(e.pointerId!==activePointer)return;activePointer=null;origin=null;touchVec={x:0,y:0};el.stick.style.transform='translate(-50%,-50%)';}
  frame.addEventListener('pointerup',releaseStick);frame.addEventListener('pointercancel',releaseStick);
  if(matchMedia('(pointer:coarse)').matches)el.pad.classList.add('playing');
  requestAnimationFrame(loop);
})();
