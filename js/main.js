// Rendering frame, HUD, main loop, input handling, start and pause
function frame(dt){
 for(const s of PL){if(!s.visible)continue;const u=s.userData;u.l-=dt;if(u.l<=0){s.visible=false;continue}s.position.addScaledVector(u.v,dt);u.v.y-=8*dt;const q=u.l/u.m;s.material.opacity=q;s.scale.setScalar(u.s*(.4+q))}
 for(let i=0;i<EN;i++){ep[i*3+1]+=dt*(.6+(i%5)*.25);ep[i*3]+=Math.sin(time*.8+i)*dt*.4;if(ep[i*3+1]>10)ep[i*3+1]=0}eg.attributes.position.needsUpdate=true;
 for(const t of tl){const f=.85+Math.sin(time*13+t.o)*.1+Math.random()*.1;t.l.intensity=1.1*f;t.f.scale.set(1.5*f,2.1*f,1)}
 hex.rotation.z+=dt*.15;hex2.rotation.z-=dt*.25;shk*=Math.exp(-9*dt);
 R.render(S,C)}
function hud(){$('hf').style.width=pl.hp+'%';$('sf').style.width=Math.min(100,spd/12*100)+'%';$('sf').style.background=spd>W.ms?'#ffd27a':'#8cefff';
 $('st').innerHTML=score.toLocaleString()+'<small>Wave '+wave+'   Best '+best.toLocaleString()+'</small>';$('cb').textContent=combo>1?combo+' chain':'';
 $('bn').textContent=bnS;$('bn').style.opacity=bnT>0?Math.min(1,bnT,(2.6-bnT)*3):0}
let last=performance.now(),gm=0,gk=0;
const setGrip=()=>{grip=(gm||gk)?1:0};
function loop(now){let dt=Math.min(.033,(now-last)/1000);last=now;
 if(state==='play'){if(frz>0){frz-=dt;dt*=.08}update(dt);hud()}
 else if(state==='menu'){vm.x=Math.sin(time*1.7)*.85;vm.y=Math.sin(time*2.6)*.5}
 wh.style.display=state==='play'?'flex':'none';if(state!=='play')wpr.style.display='none';
 view(dt);frame(dt);requestAnimationFrame(loop)}
function begin(){if(state!=='pause')reset();state='play';['menu','over'].forEach(i=>$(i).classList.add('off'));$('hud').classList.remove('off');
 try{const p=cv.requestPointerLock();if(p&&p.catch)p.catch(()=>{})}catch(e){}}
$('go').onclick=begin;$('again').onclick=begin;
document.addEventListener('pointerlockchange',()=>{const was=locked;locked=document.pointerLockElement===cv;
 if(was&&!locked&&state==='play'){state='pause';gm=gk=0;setGrip();$('mp').textContent='Paused. Click below to pick your blade back up.';$('go').textContent='Resume';$('menu').classList.remove('off');$('hud').classList.add('off')}});
addEventListener('mousemove',e=>{if(state!=='play')return;
 if(locked){vm.x+=e.movementX*.004;vm.y-=e.movementY*.004;const l=Math.hypot(vm.x,vm.y);if(l>1.15){vm.x*=1.15/l;vm.y*=1.15/l}}
 else{vm.x=(e.clientX/innerWidth-.5)*2.3;vm.y=-(e.clientY/innerHeight-.5)*2.3}});
addEventListener('mousedown',e=>{if(e.button===2){gm=1;setGrip()}});
addEventListener('mouseup',e=>{if(e.button===2){gm=0;setGrip()}});
addEventListener('contextmenu',e=>e.preventDefault());
addEventListener('keydown',e=>{const k=e.key.toLowerCase();keys[k]=1;if(k===' '||k.startsWith('arrow'))e.preventDefault();
 if(e.repeat||state!=='play')return;
 if(k==='f'){gk=1;setGrip()}else if(k==='g')pickAct();else if(k==='x')dropAct();else if(k>='1'&&k<='5')selSlot(+k-1)});
addEventListener('keyup',e=>{const k=e.key.toLowerCase();keys[k]=0;if(k==='f'){gk=0;setGrip()}});
addEventListener('blur',()=>{for(const k in keys)keys[k]=0;gm=gk=0;setGrip()});
reset();requestAnimationFrame(loop);