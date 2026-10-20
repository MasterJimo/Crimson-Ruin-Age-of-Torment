/* Hand-painted micro sprites with a darker, cleaner pixel-HD palette. */
(() => {
  const cache = new Map();
  const make = (kind, frame = 0) => {
    const key = `${kind}-${frame}`;
    if (cache.has(key)) return cache.get(key);
    const c = document.createElement('canvas'); c.width = 24; c.height = 28;
    const x = c.getContext('2d'); x.imageSmoothingEnabled = false;
    const p = (color, a,b,w=1,h=1) => { x.fillStyle=color; x.fillRect(a,b,w,h); };

    if (kind==='hero') {
      // Grey / steel gothic hunter with a stronger Belmont-like silhouette,
      // but kept original: layered coat, headband, long silver hair and whip stance.
      const stride = frame===1 ? -2 : frame===2 ? 2 : 0;
      const attackPhase = frame>=3 ? frame-3 : -1; // 0 windup, 1 crack, 2 recovery
      const striking = attackPhase >= 0;
      // Boots and split coat tails
      p('#121318',6,17,12,10);
      p('#23262f',5+(stride>0?1:0),19,6,7); p('#373c46',13+(stride<0?-1:0),19,6,7);
      p('#5e6676',7,20,2,5); p('#9098a9',16,19,2,5);
      p('#17171b',7+stride,24,4,4); p('#17171b',14-stride,24,4,4);
      p('#8a6d3d',8+stride,26,3,1); p('#8a6d3d',15-stride,26,3,1);
      // Torso and belts
      p('#14161b',5,12,14,10); p('#414752',6,13,5,11); p('#2b2f39',12,13,6,10);
      p('#828b9b',7,14,3,8); p('#bcc4cf',7,14,2,6);
      p('#9a959d',10,16,7,2); p('#ddd8df',13,16,3,2);
      p('#31353d',11,18,4,5); p('#f2ead8',12,17,2,2);
      p('#8b7348',10,15,7,1); p('#d4c3ab',12,15,2,1);
      // Head, face, and stronger silver hair silhouette.
      p('#282328',7,3,11,11); p('#5e6470',7,1,10,9); p('#949aa7',8,2,8,4); p('#d9dde5',9,3,5,2);
      p('#e2b58f',10,8,6,5); p('#f7dec1',11,8,4,3); p('#252124',11,10,2,1); p('#252124',15,10,1,1); p('#8d6f68',12,12,3,1);
      // Headband and long hair fall.
      p('#777f8f',8,5,8,2); p('#cfd4df',8,6,2,1);
      p('#515762',6,6,3,9); p('#b7bcc7',7,6,2,7); p('#4a505a',16,6,2,8); p('#adb2be',16,7,2,6);
      if(frame===1){p('#595f6a',5,9,2,8); p('#c1c6d0',6,7,2,4); p('#444952',16,8,2,7);} 
      if(frame===2){p('#666c77',5,8,3,9); p('#c6cad4',7,8,2,5); p('#565b66',16,7,2,8);} 
      // Muted scarf and shoulder wrap.
      p('#5b6370',7,13,8,3); p('#aeb5c0',8,13,6,1);
      if(striking){p('#5b6370',4,14,4,2); p('#444b57',2,15,4,2);} else if(frame===1){p('#525a67',4,15,4,2);} else if(frame===2){p('#525a67',3,13,5,2);} 
      // Left arm / bracer.
      p('#24232a',3,14,4,7); p('#c4a184',4,19,3,3);
      // Whip arm and strike staging.
      if(attackPhase === 0){ // windup
        p('#20232a',18,13,4,6); p('#c4a184',19,17,3,3); p('#d7dde4',20,16,2,4); p('#7d838e',21,11,2,6);
      } else if(attackPhase === 1){ // crack
        p('#9ea6b4',18,7,4,3); p('#20232a',18,9,4,4); p('#e2e5ea',20,5,2,4); p('#8e949e',21,3,2,3);
      } else if(attackPhase === 2){ // recovery
        p('#40454f',17,11,5,4); p('#20232a',18,13,4,5); p('#d9dee5',20,12,2,4); p('#7f868f',21,8,2,5);
      } else {
        p('#24232a',18,14,4,6); p('#c4a184',19,18,3,3); p('#d5d8de',21,17,2,4); p('#7b7f88',21,12,2,6);
      }
    }
    // The old procedural enemy fallbacks were removed with the placeholder roster.

    cache.set(key,c);
    return c;
  };
  window.CrimsonSprites = { get:make };
})();