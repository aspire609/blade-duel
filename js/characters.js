// Jointed humanoid (ragdoll-capable), weapon models, weapon stats, blade trail ribbon
const SKIN=0xc99a7a;
function human(armor,trim,eye,k){
 const g=new THREE.Group(),bd=new THREE.Group(),to=new THREE.Group(),
 A=new THREE.MeshStandardMaterial({color:armor,metalness:.75,roughness:.35}),T=new THREE.MeshStandardMaterial({color:trim,metalness:.8,roughness:.3}),
 E=new THREE.MeshBasicMaterial({color:eye}),D=new THREE.MeshStandardMaterial({color:0x1c1a24,roughness:.8}),ms=[A,T,D];
 to.position.y=.92;g.add(bd);bd.add(to);
 const add=(geo,m,x,y,z,p)=>{const q=new THREE.Mesh(geo,m);q.position.set(x,y,z);q.castShadow=true;p.add(q);return q};
 add(new THREE.CylinderGeometry(.3,.24,.78,12),A,0,.36,0,to);add(new THREE.CylinderGeometry(.33,.31,.12,12),T,0,.72,0,to);
 add(new THREE.CylinderGeometry(.26,.28,.16,12),T,0,.92,0,bd);
 add(new THREE.SphereGeometry(.14,10,8),T,-.4,.66,0,to);add(new THREE.SphereGeometry(.14,10,8),T,.4,.66,0,to);
 const hd=new THREE.Group();hd.position.set(0,.78,0);to.add(hd);hd.o={x:0,z:0,vx:0,vz:0};hd.bx=hd.bz=0;
 add(new THREE.SphereGeometry(.21,16,12),A,0,.14,0,hd);add(new THREE.BoxGeometry(.3,.05,.08),E,0,.16,.18,hd);
 const piv=(p,x,y,len,r,m,hand)=>{const q=new THREE.Group();q.position.set(x,y,0);p.add(q);add(new THREE.CylinderGeometry(r,r*.85,len,8),m,0,-len/2,0,q);
  if(hand)add(new THREE.SphereGeometry(.09,8,6),T,0,-len-.01,0,q);q.o={x:0,z:0,vx:0,vz:0};q.bx=q.bz=0;return q};
 // local +x is the character's LEFT, so the right (sword) arm sits at -x
 const l1=piv(bd,-.14,.92,.9,.11,D),l2=piv(bd,.14,.92,.9,.11,D),aR=piv(to,-.4,.63,.72,.075,A,true),aL=piv(to,.4,.63,.72,.075,A,true);
 const JA=[l1,l2,aL,aR,hd];
 g.scale.setScalar(k||1);S.add(g);
 return{g,bd,to,hd,l1,l2,aL,aR,ms,eye:E,J:JA,JA,J0:JA,ph:0,rc:0,dl:0,rg:null}}
const P=human(0x8da2c8,0xffd27a,0x8cefff,1);P.J=P.J0=[P.l1,P.l2,P.hd]; // arms are IK-driven for the player

// ---- joint springs + ragdoll ----
function stepJoints(m,dt,loose){const k=loose?6:70,c=loose?1.6:11,lim=loose?2.4:1.2;
 for(const j of m.J){const o=j.o;o.vx+=(-o.x*k-o.vx*c)*dt;o.vz+=(-o.z*k-o.vz*c)*dt;o.x+=o.vx*dt;o.z+=o.vz*dt;
  o.x=Math.max(-lim,Math.min(lim,o.x));o.z=Math.max(-lim,Math.min(lim,o.z));j.rotation.x=j.bx+o.x;j.rotation.z=j.bz+o.z}}
function flail(m,p){for(const j of m.J){j.o.vx+=(Math.random()-.5)*p*14;j.o.vz+=(Math.random()-.5)*p*14}}
function startRag(m,kx,kz,p){if(m.rg)return;const g=m.g,fy=g.rotation.y,s=(kx*Math.sin(fy)+kz*Math.cos(fy))>=0?1:-1;
 for(const a of[m.aL,m.aR]){a.scale.y=1;a.rotation.set(0,0,0)}m.J=m.JA;
 m.rg={vx:kx,vz:kz,vy:2+p*2,t:0,tv:2+p*2,s,rz:Math.random()-.5};flail(m,p*1.6)}
function ragStep(m,dt){const r=m.rg,g=m.g;
 g.position.x+=r.vx*dt;g.position.z+=r.vz*dt;const f=Math.exp(-2.2*dt);r.vx*=f;r.vz*=f;
 r.vy-=22*dt;g.position.y+=r.vy*dt;
 if(g.position.y<0){g.position.y=0;if(r.vy<-3){flail(m,.5);burst(V(g.position.x,.1,g.position.z),0x8a84a0,5,2,.5,.7)}r.vy=r.vy<-3?-r.vy*.25:0}
 if(r.t<1.5){r.tv+=(g.position.y>.05?3:16)*dt;r.t+=r.tv*dt;
  if(r.t>=1.5){r.t=1.5;if(r.tv>2.5){flail(m,.7);burst(V(g.position.x,.1,g.position.z),0x8a84a0,8,3,.6,.8);r.tv=-r.tv*.3;r.t=1.49}else r.tv=0}}
 m.bd.rotation.x=r.s*r.t;m.bd.rotation.z=r.rz*r.t*.4;m.bd.position.y=Math.sin(r.t)*.26-(m.sk||0);
 stepJoints(m,dt,true)}
function resetRag(m){m.rg=null;m.dead=0;m.sk=0;m.bd.rotation.set(0,0,0);m.bd.position.set(0,0,0);m.g.position.y=0;m.J=m.J0;
 for(const j of m.JA){j.o.x=j.o.z=j.o.vx=j.o.vz=0;j.bx=j.bz=0;j.rotation.set(0,0,0)}m.aL.scale.y=m.aR.scale.y=1}

// ---- weapon stats: L reach, hd hand offset, k/c spring (weight), dm damage, kb knockback, hp hit points along blade,
// g2 off-hand grip point, ms min swing speed, th thrust bonus, bl blunt/heavy (ignores armor)
const WP={
 fist:{n:'Hands',L:.55,hd:.55,k:320,c:25,dm:.65,kb:1.5,hp:[.3,.55],g2:.3,ms:3.4,th:0,bl:1},
 dagger:{n:'Dagger',L:.75,hd:0,k:330,c:24,dm:.75,kb:.7,hp:[.3,.5,.75],g2:.3,ms:3.2,th:.9,bl:0},
 sword:{n:'Longsword',L:1.55,hd:0,k:240,c:21,dm:1,kb:1,hp:[.5,.85,1.2,1.55],g2:.85,ms:4.2,th:.7,bl:0},
 spear:{n:'Spear',L:2.5,hd:.2,k:210,c:20,dm:1.05,kb:.8,hp:[1.3,1.8,2.2,2.5],g2:1.1,ms:4,th:1.2,bl:0},
 axe:{n:'Battle Axe',L:1.5,hd:0,k:150,c:16,dm:1.75,kb:1.5,hp:[1,1.25,1.5],g2:.55,ms:4,th:0,bl:1},
 mace:{n:'War Mace',L:1.3,hd:0,k:130,c:15,dm:1.6,kb:2,hp:[.95,1.15,1.35],g2:.5,ms:3.8,th:0,bl:1}};
function makeWeapon(id){
 const g=new THREE.Group(),
 steel=new THREE.MeshStandardMaterial({color:0xe6eeff,metalness:1,roughness:.16,emissive:0x1b3d70,emissiveIntensity:.7}),
 gold=new THREE.MeshStandardMaterial({color:0xffc94a,metalness:.9,roughness:.3}),wood=new THREE.MeshStandardMaterial({color:0x5a3418,roughness:.8}),
 iron=new THREE.MeshStandardMaterial({color:0x7a7b8c,metalness:.9,roughness:.35,emissive:0x1b3d70,emissiveIntensity:.3});
 let bm=steel;
 const part=(geo,m,z,x,y)=>{const q=new THREE.Mesh(geo,m);q.position.set(x||0,y||0,z);q.castShadow=true;g.add(q);return q};
 const cyl=(r1,r2,len,m,z0)=>{const geo=new THREE.CylinderGeometry(r1,r2,len,8);geo.rotateX(Math.PI/2);return part(geo,m,z0+len/2)};
 const cone=(r,h,m,z)=>{const geo=new THREE.ConeGeometry(r,h,6);geo.rotateX(Math.PI/2);return part(geo,m,z)};
 if(id==='sword'){part(new THREE.BoxGeometry(.09,.024,1.3),steel,.8);cone(.046,.22,steel,1.55).geometry.rotateZ(0);
  part(new THREE.BoxGeometry(.42,.06,.08),gold,.12);part(new THREE.BoxGeometry(.055,.055,.3),wood,-.06);part(new THREE.SphereGeometry(.07,10,8),gold,-.22)}
 else if(id==='dagger'){part(new THREE.BoxGeometry(.06,.018,.5),steel,.42);cone(.035,.14,steel,.74);part(new THREE.BoxGeometry(.2,.04,.05),gold,.12);cyl(.025,.025,.2,wood,-.1);part(new THREE.SphereGeometry(.04,8,6),gold,-.12)}
 else if(id==='axe'){cyl(.035,.035,1.5,wood,-.2);part(new THREE.BoxGeometry(.5,.06,.34),steel,1.15);cone(.04,.2,steel,1.5);part(new THREE.BoxGeometry(.14,.05,.12),iron,1.15,-.3)}
 else if(id==='mace'){bm=iron;cyl(.04,.04,1.1,wood,-.2);part(new THREE.SphereGeometry(.16,12,10),iron,1.2);
  for(const d of[V(1,0,0),V(-1,0,0),V(0,1,0),V(0,-1,0),V(0,0,1)]){const q=new THREE.Mesh(new THREE.ConeGeometry(.04,.16,5),iron);q.position.set(d.x*.2,d.y*.2,1.2+d.z*.2);q.quaternion.setFromUnitVectors(V(0,1,0),d);g.add(q)}}
 else if(id==='spear'){cyl(.03,.03,2.6,wood,-.4);cone(.07,.4,steel,2.4);cyl(.05,.05,.06,gold,2.18)}
 else{bm=new THREE.MeshStandardMaterial();part(new THREE.SphereGeometry(.13,12,10),new THREE.MeshStandardMaterial({color:SKIN,roughness:.7}),.55)}
 return{g,bm}}
// the player's held weapon
const sw=new THREE.Group();let bm,wmod=null;
const gl=new THREE.Mesh(new THREE.BoxGeometry(.24,.12,1),new THREE.MeshBasicMaterial({color:0x66d8ff,transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false}));sw.add(gl);S.add(sw);
function setWeapon(id){if(wmod)sw.remove(wmod);const m=makeWeapon(id),L=WP[id].L;wmod=m.g;bm=m.bm;sw.add(wmod);
 gl.scale.set(id==='axe'||id==='mace'?.6:1,1,L);gl.position.z=L*.55;gl.visible=id!=='fist'}
setWeapon('sword');
// blade trail ribbon
const TN=18,tgm=new THREE.BufferGeometry(),tpos=new Float32Array(TN*6),tcol=new Float32Array(TN*6),ti=[],th=[];
for(let i=0;i<TN-1;i++){const a=i*2;ti.push(a,a+1,a+2,a+1,a+3,a+2)}
tgm.setAttribute('position',new THREE.BufferAttribute(tpos,3));tgm.setAttribute('color',new THREE.BufferAttribute(tcol,3));tgm.setIndex(ti);
const trail=new THREE.Mesh(tgm,new THREE.MeshBasicMaterial({vertexColors:true,blending:THREE.AdditiveBlending,transparent:true,depthWrite:false,side:THREE.DoubleSide}));trail.frustumCulled=false;S.add(trail);