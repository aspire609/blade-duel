// Mouse-driven weapon physics, hit/parry detection, procedural player animation and camera
function aimArm(arm,sx,tgt){const a=P.to.worldToLocal(tgt.clone()).sub(V(sx,.63,0)),ln=a.length();
 arm.scale.y=Math.min(1.8,Math.max(.55,ln/.72));arm.quaternion.setFromUnitVectors(V(0,-1,0),a.normalize())}
function view(dt){
 gb+=((grip?1:0)-gb)*Math.min(1,dt*10);
 const kk=W.k*(1+.5*gb),cc=W.c*(1+.3*gb);
 const tgt=rot(vm.x*2,1.25+vm.y*1.4,-2.1),px=pl.x,pz=pl.z;tgt.x+=px;tgt.z+=pz;
 for(let i=0;i<3;i++){const h=dt/3;XV.x+=((tgt.x-X.x)*kk-XV.x*cc)*h;XV.y+=((tgt.y-X.y)*kk-XV.y*cc)*h;XV.z+=((tgt.z-X.z)*kk-XV.z*cc)*h;X.x+=XV.x*h;X.y+=XV.y*h;X.z+=XV.z*h}
 const hl=rot(.42-.12*gb,1.2+vm.y*.25-.08*gb,-.4-.15*gb);hilt.set(px+hl.x,hl.y,pz+hl.z);
 dirV.copy(X).sub(hilt).normalize();const tip=hilt.clone().addScaledVector(dirV,W.L);
 if(tip.y<.12){tip.y=.12;dirV.copy(tip).sub(hilt).normalize();if(spd>6&&Math.random()<.5)burst(tip,0xffd9a0,3,4,.3,.35)}
 const rv=tip.clone().sub(prevTip).divideScalar(Math.max(dt,.001));rv.x-=pl.vx;rv.z-=pl.vz;prevTip.copy(tip);
 spd+=(Math.min(40,rv.length())-spd)*Math.min(1,dt*18);tipV.copy(rv);
 sw.position.copy(hilt);sw.lookAt(hilt.clone().add(dirV));
 const sf=Math.max(0,Math.min(1,(spd-3)/9));gl.material.opacity=W===WP.fist?0:sf*.55;bm.emissiveIntensity=.6+sf*2;
 // ---- player body ----
 const pg=P.g;
 if(P.rg){ragStep(P,dt)}
 else{
  pg.position.set(px,0,pz);pg.rotation.y=yaw+Math.PI;
  if(state!=='play')time+=dt;
  const vl=Math.hypot(pl.vx,pl.vz),mv=Math.min(1,vl/4),fv=-(pl.vx*Math.sin(yaw)+pl.vz*Math.cos(yaw)),dir=fv<-.3?-1:1,br=Math.sin(time*1.9);
  const ph0=P.ph;P.ph+=dt*(2+vl*1.5)*dir*(vl>.2?1:0);
  if(vl>1.5&&Math.floor(P.ph/Math.PI)!==Math.floor(ph0/Math.PI))burst(V(px,.05,pz),0x8a84a0,3,1.4,.4,.5);
  pg.updateMatrixWorld(true);const lt=pg.worldToLocal(tip.clone()),look=Math.atan2(lt.x,lt.z);
  P.rc*=Math.exp(-6*dt);P.dl+=((pl.dd>0?.55:0)-P.dl)*Math.min(1,dt*12);
  const s=Math.sin(P.ph),ls=Math.min(1,dt*10);
  P.l1.bx=s*.8*mv+.06;P.l2.bx=-s*.8*mv-.1;P.l1.bz=-.07*(1-mv)-.05*gb;P.l2.bz=.07*(1-mv)+.05*gb;
  P.bd.position.y=-Math.abs(s)*.07*mv-.05*gb+br*.008;
  P.bd.rotation.x=-P.rc+P.dl;
  P.to.rotation.x+=(.08+mv*.16*(dir>0?1:-.3)+sf*.12+br*.012-P.to.rotation.x)*ls;
  P.to.rotation.y+=(Math.max(-.7,Math.min(.7,look*.45))-P.to.rotation.y)*ls;
  P.to.scale.y=1+br*.01;
  P.hd.bx=-P.to.rotation.x*.6+Math.max(-.4,Math.min(.4,(1.4-lt.y)*.12));
  P.hd.rotation.y=Math.max(-.6,Math.min(.6,look*.3-P.to.rotation.y*.5));
  stepJoints(P,dt,false);
  pg.updateMatrixWorld(true);
  aimArm(P.aR,-.4,hilt.clone().addScaledVector(dirV,W.hd));
  const gp=hilt.clone().addScaledVector(dirV,W.g2),gd=P.to.localToWorld(V(.36,.3+br*.01,.5));
  aimArm(P.aL,.4,gd.lerp(gp,gb));
 }
 // ---- trail ribbon ----
 th.unshift({b:hilt.clone().addScaledVector(dirV,Math.min(.4,W.L*.3)),t:tip.clone()});if(th.length>TN)th.pop();
 for(let i=0;i<TN;i++){const h=th[Math.min(i,th.length-1)],k=(1-i/(TN-1))*sf*1.3;tpos[i*6]=h.b.x;tpos[i*6+1]=h.b.y;tpos[i*6+2]=h.b.z;tpos[i*6+3]=h.t.x;tpos[i*6+4]=h.t.y;tpos[i*6+5]=h.t.z;
  tcol[i*6]=.1*k;tcol[i*6+1]=.4*k;tcol[i*6+2]=.6*k;tcol[i*6+3]=.4*k;tcol[i*6+4]=.9*k;tcol[i*6+5]=k}
 tgm.attributes.position.needsUpdate=tgm.attributes.color.needsUpdate=true;
 // ---- blade versus enemies (with parry) ----
 if(state==='play'&&spd>W.ms){
  const pts=W.hp.map(s=>hilt.clone().addScaledVector(dirV,s)),thr=Math.max(0,tipV.dot(dirV));
  for(const e of en){if(e.dead)continue;
   if(e.wt&&(e.m==='wind'||e.m==='strike')&&spd>3.5){e.hold.updateMatrixWorld(true);const ew=e.hold.localToWorld(V(0,0,WP[e.wt].L*.7));
    if(pts.some(q=>q.distanceTo(ew)<.6)){const od=Math.hypot(e.x-pl.x,e.z-pl.z)||1;
     e.m='rec';e.t=0;e.cd=1.1;e.st=.55;e.eye.color.setHex(0xff2a2a);e.kx+=(e.x-pl.x)/od*4;e.kz+=(e.z-pl.z)/od*4;e.rc=.5;flail(e,.8);
     burst(ew,0xfff0b0,18,7,.35,.5);shk=Math.max(shk,.25);frz=Math.max(frz,.05);continue}}
   if(e.hc>0)continue;
   for(const q of pts){const dx=q.x-e.x,dz=q.z-e.z;
    if(Math.hypot(dx,dz)<.55*e.sc+.12&&q.y>0&&q.y<2*e.sc){
     let dmg=Math.min(80,8+spd*4.4)*W.dm;
     if(W.th&&thr>4)dmg*=1+Math.min(1,thr/12)*W.th*(grip?1.35:.6);
     if(e.big&&!W.bl&&!(thr>5&&grip))dmg*=.55; // armor shrugs off plain slashes
     e.hp-=dmg;e.hc=.28;e.st=.45;e.rc=Math.min(.8,.2+dmg/90);flail(e,dmg/70);
     if(e.m==='wind'||e.m==='strike'){e.m='walk';e.cd=.9;e.eye.color.setHex(0xff2a2a)}
     const tl2=Math.hypot(tipV.x,tipV.z)||1,od=Math.hypot(e.x-pl.x,e.z-pl.z)||1,kb=Math.min(12,spd*.8)*W.kb;
     e.kx+=(tipV.x/tl2*.6+(e.x-pl.x)/od*.4)*kb;e.kz+=(tipV.z/tl2*.6+(e.z-pl.z)/od*.4)*kb;
     burst(q,0xfff0c0,14,8,.4,.5);burst(q,0xff8a3a,8,6,.5,.35);burst(q,0xc01828,6,5,.5,.4);
     if(dmg>25)splat(e.x+(Math.random()-.5),e.z+(Math.random()-.5),.7+Math.random()*.6);
     shk=Math.max(shk,Math.min(.3,spd*.02));frz=Math.max(frz,.04);
     if(e.hp<=0)kill(e);break}}}}
 // ---- camera ----
 if(state==='menu'){orb+=dt*.35;C.position.set(px+Math.cos(orb)*7,2.4,pz+Math.sin(orb)*7);C.lookAt(px,1.4,pz)}
 else{const cp=rot(.9,2.5,5.3),k=1-Math.exp(-9*dt),mvb=Math.min(1,Math.hypot(pl.vx,pl.vz)/4);
  C.position.x+=(px+cp.x-C.position.x)*k;C.position.y+=(cp.y+Math.abs(Math.sin(P.ph))*.06*mvb-C.position.y)*k;C.position.z+=(pz+cp.z-C.position.z)*k;
  const la=rot(0,0,-4);C.position.x+=(Math.random()-.5)*shk;C.position.y+=(Math.random()-.5)*shk;C.lookAt(px+la.x,1.5,pz+la.z)}
 dl.position.set(px-14,26,pz-10);dl.target.position.set(px,0,pz);
}