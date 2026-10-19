/* Artwork assembled from the user's transparent PNG contact sheets. */
(() => {
  const atlasNames=['characters.png','effects.png'];
  const images={};
  for(const name of atlasNames){const i=new Image();i.src='assets/'+name;images[name]=i;}
  const meta={"hero_idle":{"atlas":"characters.png","x":50,"y":9,"w":270,"h":344},"hero_walk":{"atlas":"characters.png","x":383,"y":54,"w":344,"h":254},"hero_dash":{"atlas":"characters.png","x":753,"y":67,"w":344,"h":228},"hero_cast":{"atlas":"characters.png","x":1123,"y":40,"w":344,"h":282},"skeleton":{"atlas":"characters.png","x":65,"y":371,"w":239,"h":344},"bat":{"atlas":"characters.png","x":430,"y":371,"w":250,"h":344},"ghoul":{"atlas":"characters.png","x":753,"y":426,"w":344,"h":233},"wraith":{"atlas":"characters.png","x":1191,"y":371,"w":208,"h":344},"slime":{"atlas":"characters.png","x":56,"y":733,"w":257,"h":344},"cultist":{"atlas":"characters.png","x":430,"y":733,"w":250,"h":344},"warden":{"atlas":"characters.png","x":786,"y":733,"w":278,"h":344},"spider":{"atlas":"characters.png","x":1184,"y":733,"w":222,"h":344},"blood_bolt":{"atlas":"effects.png","x":6,"y":34,"w":240,"h":130},"ice_bolt":{"atlas":"effects.png","x":258,"y":49,"w":240,"h":99},"fire_bolt":{"atlas":"effects.png","x":510,"y":39,"w":240,"h":120},"lightning":{"atlas":"effects.png","x":762,"y":26,"w":240,"h":145},"void":{"atlas":"effects.png","x":6,"y":222,"w":240,"h":150},"blood_arc":{"atlas":"effects.png","x":258,"y":204,"w":240,"h":185},"poison":{"atlas":"effects.png","x":510,"y":226,"w":240,"h":141},"holy":{"atlas":"effects.png","x":762,"y":237,"w":240,"h":120},"bat_swarm":{"atlas":"effects.png","x":6,"y":431,"w":240,"h":127},"impact":{"atlas":"effects.png","x":258,"y":426,"w":240,"h":138},"frost_nova":{"atlas":"effects.png","x":510,"y":435,"w":240,"h":119},"rune":{"atlas":"effects.png","x":762,"y":420,"w":240,"h":149}};
  window.NoobArt={
    loaded(name){const q=meta[name];return !!q && images[q.atlas]?.complete && images[q.atlas].naturalWidth>0;},
    paint(ctx,name,x,y,width,height,opacity=1){
      const q=meta[name],img=q && images[q.atlas];
      if(!img || !img.complete || !img.naturalWidth)return false;
      ctx.save();ctx.globalAlpha*=opacity;ctx.imageSmoothingEnabled=true;
      ctx.imageSmoothingQuality='high';
      ctx.drawImage(img,q.x,q.y,q.w,q.h,x,y,width,height);
      ctx.restore();return true;
    },
    dimension(name){return meta[name]||null;}
  };
})();