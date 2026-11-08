// Game state, waves, enemy AI, damage, scoring, weapon pickups, update loop logic
const keys={};let state='menu',best=0,yaw=0,locked=false,time=0,orb=0,shk=0,frz=0,bnT=0,bnS='',wave=0,queue=0,spawnT=0,clearT=0,score=0,combo=0,comboT=0,spd=0;
let grip=0,gb=0,wid='sword',W=null,INV=['fist','sword'],pk=[],dropCD=0;
try{best=+localStorage.getItem('baBest3d')||0}catch(e){}
const vm={x:0,y:0},X=V(0,1.3,-2),XV=V(0,0,0),prevTip=V(0,0,0),tipV=V(0,0,0),pl={x:0,z:6,vx:0,vz:0,hp:100,inv:0,dc:0,dd:0,dx:0,dz:0};let en=[];
const rot=(x,y,z)=>V(x*Math.cos(yaw)+z*Math.sin(yaw),y,-x*Math.sin(yaw)+z*Math.cos(yaw)),hilt=V(0,1.2,0),dirV=V(0,0,-1);
// ---- weapon HUD (created here, no HTML changes needed) ----
const wh=document.createElement('div'),wpr=document.createElement('div');
wh.style.cssText='position:fixed;bottom:16px;left:50%;transform:translateX(-50%);display:none;gap:8px;z-index:6;pointer-events:none;font:600 13px system-ui,sans-serif;align-items:center';
wpr.style.cssText='position:fixed;bottom:76px;left:50%;transform:translateX(-50%);display:none;z-index:6;pointer-events:none;font:700 15px system-ui,sans-serif;color:#ffd27a;text-shadow:0 2px 8px #000;padding:6px 14px;background:rgba(10,8,24,.6);border:1px solid #ffd27a66;border-radius:8px';
document.body.append(wh,wpr);
function drawInv(){wh.innerHTML=INV.map((id,i)=>'<div style="padding:7px 12px;border-radius:8px;color:#fff;background:'+(id===wid?'rgba(255,210,122,.35)':'rgba(10,8,24,.55)')+';border:1px solid '+(id===wid?'#ffd27a':'#ffffff33')+'">'+(i+1)+' · '+WP[id].n+'</div>').join('')
 +'<div style="margin-left:8px;color:#fff;opacity:.6;font-size:12px">RMB / F half-sword grip · G pick up · X drop</div>'}
function equip(id){wid=id;W=WP[id];setWeapon(id);drawInv()}
function selSlot(i){if(state==='play'&&INV[i])equip(INV[i])}
// ---- pickups ----
function mkPick(id,x,z,vx,vz){if(pk.length>=14){const o=pk.shift();S.remove(o.g)}
 const m=makeWeapon(id),g=new THREE.Group();m.g.position.z=-WP[id].L/2;g.add(m.g);g.rotation.y=Math.random()*6.28;
 const s=new THREE.Sprite(new THREE.SpriteMaterial({map:sp0,color:0xffd27a,blending:THREE.AdditiveBlending,depthWrite:false,transparent:true,opacity:.7}));s.scale.set(2.2,2.2,1);s.position.y=-.1;g.add(s);
 g.position.set(x,.6,z);S.add(g);pk.push({g,id,x,z,vx:vx||0,vz:vz||0,y:.6,vy:3,o:Math.random()*6})}
const POOL=['sword','dagger','axe','mace','spear'];
function spawnPick(){const a=Math.random()*6.283,r=5+Math.random()*16;mkPick(POOL[Math.random()*POOL.length|0],Math.cos(a)*r,Math.sin(a)*r,0,0)}
function nearPick(){let b=null,bd=1.7;for(const p of pk){const d=Math.hypot(p.x-pl.x,p.z-pl.z);if(d<bd){bd=d;b=p}}return b}
function toss(id){mkPick(id,pl.x-Math.sin(yaw)*.9,pl.z-Math.cos(yaw)*.9,-Math.sin(yaw)*4,-Math.cos(yaw)*4)}
function pickAct(){const p=nearPick();if(!p||INV.includes(p.id))return;
 if(INV.length>=5){const di=wid!=='fist'?INV.indexOf(wid):INV.length-1;toss(INV[di]);INV.splice(di,1)}
 INV.push(p.id);S.remove(p.g);pk.splice(pk.indexOf(p),1);equip(p.id);burst(V(p.x,.6,p.z),0xffd27a,14,5,.5,.5)}
function dropAct(){if(wid==='fist'||dropCD>0)return;const id=wid;toss(id);INV.splice(INV.indexOf(id),1);dropCD=.4;equip('fist')}
function reset(){for(const e of en)S.remove(e.g);en=[];for(const p of pk)S.remove(p.g);pk=[];clearSplats();
 wave=0;score=0;combo=0;comboT=0;shk=0;frz=0;clearT=0;Object.assign(pl,{x:0,z:6,vx:0,vz:0,hp:100,inv:0,dc:0,dd:0});yaw=0;vm.x=vm.y=0;
 resetRag(P);P.rc=0;INV=['fist','sword'];grip=0;gb=0;equip('sword');for(let i=0;i<4;i++)spawnPick();
 C.position.set(1,2.6,11.4);nextWave()}
function nextWave(){wave++;queue=3+wave*2;spawnT=1.2;bnS='Wave '+wave;bnT=2.6;if(wave>1)spawnPick()}
function spawn(){const a=Math.random()*6.283,big=wave>=3&&Math.random()<.22,
 opts=big?['axe','mace']:wave<2?['sword','dagger',null]:wave<4?['sword','dagger','spear',null,'mace']:['sword','spear','axe','mace','dagger'],
 wt=opts[Math.random()*opts.length|0],
 m=human(big?0x4a2a3a:0x3a3f52,big?0xb03040:0x7a7f95,0xff2a2a,big?1.35:1);
 if(wt){const wm=makeWeapon(wt),h=new THREE.Group();h.rotation.x=Math.PI/2;h.position.y=-.72;h.add(wm.g);m.aR.add(h);m.hold=h}
 const w=wt?WP[wt]:WP.fist,sc=big?1.35:1;m.aR.bx=-.4;
 en.push({...m,wt,x:Math.cos(a)*25,z:Math.sin(a)*25,hp:big?230:95,sp:(big?1.7:2.4)+wave*.1,sc,big,kx:0,kz:0,hc:0,st:0,cd:1,m:'walk',t:0,ph:0,o:Math.random()*6,dead:0,dt:0,rc:0,
  rch:(1.3+w.L*.45)*sc,dmg:(big?30:18)*(wt?.7+.3*w.dm:.65)})}
function hurt(d,e){pl.hp-=d;pl.inv=.8;shk=.4;frz=.07;$('fl').style.opacity=1;P.rc=.55;flail(P,.8);
 const dx=pl.x-e.x,dz=pl.z-e.z,l=Math.hypot(dx,dz)||1;pl.vx=dx/l*7;pl.vz=dz/l*7;burst(V(pl.x,1.3,pl.z),0xff3a4a,18,6,.6,.5);
 if(pl.hp<=0){pl.hp=0;state='over';startRag(P,pl.vx,pl.vz,1.2);splat(pl.x,pl.z,2);try{if(score>best){best=score;localStorage.setItem('baBest3d',best)}}catch(x){}
  $('fs').textContent=score.toLocaleString();$('fd').textContent='You reached wave '+wave+'. Best score: '+best.toLocaleString()+'.';
  try{document.exitPointerLock()}catch(x){}setTimeout(()=>{$('over').classList.remove('off');$('hud').classList.add('off')},1100)}}
function kill(e){e.dead=1;e.dt=0;const m=1+Math.min(combo,20)*.1;score+=Math.round((e.big?80:25)*m);combo++;comboT=2.6;
 burst(V(e.x,1.2*e.sc,e.z),0xff4a4a,22,7,.8,.6);burst(V(e.x,1.2*e.sc,e.z),0xffd9a0,12,9,.5,.4);shk=Math.max(shk,.35);frz=.08;e.eye.color.setHex(0x222222);
 startRag(e,e.kx*.8,e.kz*.8,Math.min(1.5,.6+Math.hypot(e.kx,e.kz)*.08));e.g.position.set(e.x,0,e.z);
 splat(e.x,e.z,1.6+Math.random()*.8);
 if(e.hold&&Math.random()<.7){e.hold.visible=false;mkPick(e.wt,e.x,e.z,e.kx*.3+(Math.random()-.5)*3,e.kz*.3+(Math.random()-.5)*3)}}
function update(dt){
 time+=dt;dropCD-=dt;
 const f=(keys.w||keys.arrowup?1:0)-(keys.s||keys.arrowdown?1:0),r=(keys.d||keys.arrowright?1:0)-(keys.a||keys.arrowleft?1:0),l=Math.hypot(f,r)||1;
 // manual aiming only: Q/E turn, or push the mouse to the far screen edge
 yaw+=((keys.q?1:0)-(keys.e?1:0))*2.2*dt;
 if(Math.abs(vm.x)>.85)yaw-=Math.sign(vm.x)*(Math.abs(vm.x)-.85)*3.5*dt;
 const ws=(keys.shift?6.4:4.2)*(grip?.78:1),tx=(-Math.sin(yaw)*f+Math.cos(yaw)*r)/l*ws,tz=(-Math.cos(yaw)*f-Math.sin(yaw)*r)/l*ws;
 if(keys[' ']&&pl.dc<=0){pl.dd=.22;pl.dc=1;pl.inv=Math.max(pl.inv,.4);pl.dx=f||r?tx/ws:-Math.sin(yaw);pl.dz=f||r?tz/ws:-Math.cos(yaw)}
 pl.dd-=dt;pl.dc-=dt;pl.inv-=dt;
 if(pl.dd>0){pl.vx=pl.dx*13;pl.vz=pl.dz*13;if(Math.random()<.8)burst(V(pl.x,.2,pl.z),0x8cefff,1,.5,.4,.8)}
 else{const k=1-Math.exp(-12*dt);pl.vx+=(tx-pl.vx)*k;pl.vz+=(tz-pl.vz)*k}
 pl.x+=pl.vx*dt;pl.z+=pl.vz*dt;const rr=Math.hypot(pl.x,pl.z);if(rr>29){pl.x*=29/rr;pl.z*=29/rr}
 $('fl').style.opacity=Math.max(0,+$('fl').style.opacity-dt*2);
 // pickups
 for(const p of pk){p.x+=p.vx*dt;p.z+=p.vz*dt;const fr=Math.exp(-3*dt);p.vx*=fr;p.vz*=fr;p.vy-=14*dt;p.y+=p.vy*dt;
  const fl=.25+Math.sin(time*3+p.o)*.04;if(p.y<fl){p.y=fl;p.vy=0}p.g.position.set(p.x,p.y,p.z);p.g.rotation.y+=dt*.7}
 const np=nearPick();if(np){wpr.style.display='block';wpr.textContent=INV.includes(np.id)?WP[np.id].n+' (already carried)':'G  —  pick up '+WP[np.id].n}else wpr.style.display='none';
 spawnT-=dt;if(queue>0&&spawnT<=0&&en.filter(e=>!e.dead).length<7){spawn();queue--;spawnT=Math.max(.8,2.2-wave*.12)}
 if(!queue&&!en.some(e=>!e.dead)){clearT+=dt;if(clearT>2){clearT=0;pl.hp=Math.min(100,pl.hp+25);nextWave()}}else clearT=0;
 bnT-=dt;comboT-=dt;if(comboT<=0)combo=0;
 for(const e of en){
  if(e.dead){e.dt+=dt;e.sk=Math.max(0,e.dt-5.5)*.35;ragStep(e,dt);if(e.dt>8.5){S.remove(e.g);e.rm=1}continue}
  const dx=pl.x-e.x,dz=pl.z-e.z,d=Math.hypot(dx,dz)||1;e.hc-=dt;e.st-=dt;e.cd-=dt;let mv=0;
  const kd=Math.exp(-5*dt);e.kx*=kd;e.kz*=kd;
  let atx=.14,aty=0,abx=-.4;
  if(e.st<=0){
   if(e.m==='walk'){if(d>e.rch)mv=e.sp;else if(e.cd<=0){e.m='wind';e.t=0}}
   else if(e.m==='wind'){e.t+=dt;const q=Math.min(1,e.t/.75);abx=-1.6-1.7*q;atx=-.1-.25*q;aty=-.5*q;e.eye.color.setHex(0xffffff);
    if(e.t>.75){e.m='strike';e.t=0;if(d<e.rch+.7*e.sc&&pl.inv<=0)hurt(e.dmg,e)}}
   else if(e.m==='strike'){e.t+=dt;const q=Math.min(1,e.t/.12);abx=-3.3+1.85*q;atx=.45*q;aty=-.5+1.1*q;if(e.t>.3){e.m='rec';e.t=0;e.cd=1.2;e.eye.color.setHex(0xff2a2a)}}
   else{e.t+=dt;abx=-1.4;atx=.2;aty=.3;if(e.t>.5)e.m='walk'}
  }else{abx=-.2;atx=-.2}
  e.x+=(dx/d*mv+e.kx)*dt;e.z+=(dz/d*mv+e.kz)*dt;
  for(const o of en)if(o!==e&&!o.dead){const ox=e.x-o.x,oz=e.z-o.z,od=Math.hypot(ox,oz)||1;if(od<1.1){e.x+=ox/od*3*dt;e.z+=oz/od*3*dt}}
  if(d<.8){e.x-=dx/d*(.8-d);e.z-=dz/d*(.8-d)}
  const er=Math.hypot(e.x,e.z);if(er>30){e.x*=30/er;e.z*=30/er}
  // procedural life: walk cycle, breathing, lean, swing twist, recoil
  e.ph+=dt*(mv?7.5+e.sp:0);const s=Math.sin(e.ph),br=Math.sin(time*1.7+e.o),ls=Math.min(1,dt*9);
  e.l1.bx=s*.6+.04;e.l2.bx=-s*.6-.04;e.l1.bz=-.06*(mv?0:1);e.l2.bz=.06*(mv?0:1);
  e.aR.bx+=(abx-e.aR.bx)*Math.min(1,dt*(e.m==='strike'?35:9));
  e.aL.bx=mv?-s*.5:-.25+Math.sin(time*1.5+e.o)*.05;
  e.to.rotation.x+=(atx-e.to.rotation.x)*ls;e.to.rotation.y+=(aty-e.to.rotation.y)*ls;e.to.scale.y=1+br*.01;
  e.rc*=Math.exp(-6*dt);e.bd.rotation.x=-e.rc;e.bd.position.y=-Math.abs(s)*.05*(mv?1:0)+br*.01;
  e.hd.bx=.08+br*.02;e.hd.rotation.y=mv?0:Math.sin(time*.9+e.o)*.25;
  stepJoints(e,dt,false);
  e.g.position.set(e.x,0,e.z);e.g.rotation.set(0,Math.atan2(dx,dz),0);
  e.ms.forEach(m=>m.emissive.setHex(e.hc>.1?0xff3020:0));
 }
 en=en.filter(e=>!e.rm);
}