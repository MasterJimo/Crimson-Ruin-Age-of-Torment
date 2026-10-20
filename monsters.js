/* Enemy catalog: a single source of truth for combat and the Bestiary.
   Values are BASE stats before time-tier and difficulty multipliers. */
(() => {
  const normal = (id,name,phase,hp,speed,damage,range,attack,interval,notes,extra={}) =>
    ({id,name,phase,hp,speed,damage,range,attack,interval,notes,r:extra.r||12,weight:extra.weight||1,
      xp:extra.xp||4,color:extra.color||'#ba6980',blood:extra.blood||'#8a1234',...extra});
  const entries=[
    normal('skeleton','Skeleton Swordsman',0,52,38,9,23,'Melee sword',1.35,'Approaches and swings a sword.',{weight:9,xp:3,r:11,color:'#ddd0b5'}),
    normal('plague_rat','Plague Rat',0,28,85,4,17,'Quick bite',.86,'Fragile, weak but fast. Time scaling lets it catch a hunter without speed upgrades.',{weight:6,xp:2,r:9,color:'#9f7581'}),
    normal('eye','Watcher Eye',0,47,20,16,240,'Arcane bolt volley',2.45,'Slow floating shooter. Gains +1 projectile at each five-minute threshold.',{weight:4,xp:4,r:10,color:'#f2a5ad',projectileSpeed:153}),
    normal('skeleton_archer','Skeleton Archer',0,55,22,20,265,'Heavy slow arrow',3.9,'Shoots harder than the Eye, but arrows travel slower and fire less often.',{weight:5,xp:4,r:11,color:'#d8c7ac',projectileSpeed:89}),
    normal('zombie','Zombie',0,150,18,26,24,'Heavy claw',1.95,'Extremely slow; close-range claw strikes hurt.',{weight:3,xp:7,r:14,color:'#a3a39c'}),
    normal('blood_slime','Blood Slime',600,160,24,8,20,'Melee + bleeding',1.5,'Each successful touch adds a 6s Bleed stack (max 8).', {weight:7,xp:6,r:13,color:'#ef4263'}),
    normal('succubus','Succubus',600,94,90,7,23,'Swift melee',.82,'Fast and agile; modest contact damage.',{weight:6,xp:5,r:12,color:'#b74d72'}),
    normal('imp','Imp',600,70,125,4,19,'Rapid melee',.69,'Very quick; can catch movement-speed 150 hunters.',{weight:6,xp:4,r:9,color:'#e44e61'}),
    normal('hellhound','Hellhound',600,145,45,12,24,'Bite + summons',1.25,'Stops to summon 1-2 additional Hellhounds, unless killed promptly.',{weight:4,xp:7,r:13,color:'#e45c3a',summonEvery:10.5}),
    normal('necromancer','Necromancer',600,105,19,29,290,'Fast dark bolt',3.15,'Extremely slow caster; fires a fast, high-damage projectile.',{weight:4,xp:8,r:12,color:'#bf386d',projectileSpeed:290}),
    normal('boss1','Gargoyle',180,1100,40,55,27,'Telegraphed line charge',7,'A long red straight-line warning precedes a brutal 55-damage charge.',{boss:true,bossAt:180,r:24,xp:45,color:'#9a8194'}),
    normal('boss3','Abomination',480,5200,15,32,29,'Heavy claw + circular slam',4.5,'Very slow and extremely durable; medium-radius AoE slam. Drops one Rare-Mythic perk, no XP cost.',{boss:true,bossAt:480,r:31,xp:0,color:'#b8a5a0'}),
    normal('boss2','Demon',1020,3400,66,23,28,'Three expanding circle blasts',6.8,'Pursues quickly, then detonates three successively larger circles.',{boss:true,bossAt:1020,r:27,xp:70,color:'#ae2638'})
  ];
  const byId=Object.fromEntries(entries.map(item=>[item.id,item]));
  const early=entries.filter(e=>!e.boss&&e.phase===0).map(e=>e.id);
  const late=entries.filter(e=>!e.boss&&e.phase===600).map(e=>e.id);
  window.CrimsonMonsters={entries,byId,early,late,bosses:entries.filter(e=>e.boss),tierMinutes:[0,5,10,15,20,25]};
})();