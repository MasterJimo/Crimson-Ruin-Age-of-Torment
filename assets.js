/* Artwork assembled from the user's transparent PNG contact sheets. */
(() => {
  const atlasNames=['characters.png','effects.png','crimson-heir-v092.png'];
  const images={};
  for(const name of atlasNames){const i=new Image();i.src='assets/'+name;images[name]=i;}
  const meta={"hero_attack":{"atlas":"crimson-heir-v092.png","x":464,"y":997,"w":357,"h":248},"hero_walk3":{"atlas":"crimson-heir-v092.png","x":464,"y":644,"w":195,"h":343},"hero_walk2":{"atlas":"crimson-heir-v092.png","x":0,"y":644,"w":185,"h":341},"hero_walk1":{"atlas":"crimson-heir-v092.png","x":464,"y":0,"w":189,"h":342},"hero_idle":{"atlas":"crimson-heir-v092.png","x":0,"y":0,"w":459,"h":634},"hero_walk":{"atlas":"hero_crimson_heir.png","x":466,"y":79,"w":170,"h":462},"hero_dash":{"atlas":"hero_crimson_heir.png","x":956,"y":152,"w":480,"h":315},"hero_cast":{"atlas":"crimson-heir-v092.png","x":0,"y":997,"w":271,"h":272},"skeleton":{"atlas":"characters.png","x":65,"y":371,"w":239,"h":344},"bat":{"atlas":"characters.png","x":430,"y":371,"w":250,"h":344},"ghoul":{"atlas":"characters.png","x":753,"y":426,"w":344,"h":233},"wraith":{"atlas":"characters.png","x":1191,"y":371,"w":208,"h":344},"slime":{"atlas":"characters.png","x":56,"y":733,"w":257,"h":344},"cultist":{"atlas":"characters.png","x":430,"y":733,"w":250,"h":344},"warden":{"atlas":"characters.png","x":786,"y":733,"w":278,"h":344},"spider":{"atlas":"characters.png","x":1184,"y":733,"w":222,"h":344},"blood_bolt":{"atlas":"effects.png","x":6,"y":34,"w":240,"h":130},"ice_bolt":{"atlas":"effects.png","x":258,"y":49,"w":240,"h":99},"fire_bolt":{"atlas":"effects.png","x":510,"y":39,"w":240,"h":120},"lightning":{"atlas":"effects.png","x":762,"y":26,"w":240,"h":145},"void":{"atlas":"effects.png","x":6,"y":222,"w":240,"h":150},"blood_arc":{"atlas":"effects.png","x":258,"y":204,"w":240,"h":185},"poison":{"atlas":"effects.png","x":510,"y":226,"w":240,"h":141},"holy":{"atlas":"effects.png","x":762,"y":237,"w":240,"h":120},"bat_swarm":{"atlas":"effects.png","x":6,"y":431,"w":240,"h":127},"impact":{"atlas":"effects.png","x":258,"y":426,"w":240,"h":138},"frost_nova":{"atlas":"effects.png","x":510,"y":435,"w":240,"h":119},"rune":{"atlas":"effects.png","x":762,"y":420,"w":240,"h":149}};
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