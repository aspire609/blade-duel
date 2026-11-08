// Renderer, camera, sky, lights, stone arena floor, pillars, torches, embers
const $=id=>document.getElementById(id),V=(x,y,z)=>new THREE.Vector3(x,y,z);
const cv=$('c'),R=new THREE.WebGLRenderer({canvas:cv,antialias:true});R.setPixelRatio(Math.min(devicePixelRatio,2));R.shadowMap.enabled=true;R.shadowMap.type=THREE.PCFSoftShadowMap;
const S=new THREE.Scene(),C=new THREE.PerspectiveCamera(65,1,.1,400);
function rs(){R.setSize(innerWidth,innerHeight,false);C.aspect=innerWidth/innerHeight;C.updateProjectionMatrix()}addEventListener('resize',rs);rs();
// dusk sky, stars, moon
{const k=document.createElement('canvas');k.width=2;k.height=256;const g=k.getContext('2d'),r=g.createLinearGradient(0,0,0,256);
 [[0,'#080a24'],[.55,'#2d2160'],[.85,'#a3416f'],[1,'#e88a6a']].forEach(a=>r.addColorStop(a[0],a[1]));g.fillStyle=r;g.fillRect(0,0,2,256);S.background=new THREE.CanvasTexture(k)}
S.fog=new THREE.Fog(0x2a1d4a,28,95);
const sp0=(()=>{const c=document.createElement('canvas');c.width=c.height=32;const g=c.getContext('2d'),r=g.createRadialGradient(16,16,0,16,16,16);r.addColorStop(0,'rgba(255,255,255,1)');r.addColorStop(.4,'rgba(255,255,255,.5)');r.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=r;g.fillRect(0,0,32,32);return new THREE.CanvasTexture(c)})();
{const n=500,p=new Float32Array(n*3);for(let i=0;i<n;i++){const a=Math.random()*6.283,e=Math.random()*1.2+.1,r=300;p[i*3]=Math.cos(a)*Math.cos(e)*r;p[i*3+1]=Math.sin(e)*r;p[i*3+2]=Math.sin(a)*Math.cos(e)*r}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(p,3));S.add(new THREE.Points(g,new THREE.PointsMaterial({size:1.6,sizeAttenuation:false,fog:false,color:0xdfe6ff})))}
const moon=new THREE.Sprite(new THREE.SpriteMaterial({map:sp0,color:0xbfcaff,fog:false,blending:THREE.AdditiveBlending,depthWrite:false}));moon.scale.set(90,90,1);moon.position.set(-120,110,-200);S.add(moon);
// lights
S.add(new THREE.HemisphereLight(0x8d80d8,0x1e1630,.85));
const dl=new THREE.DirectionalLight(0xaebcff,.95);dl.castShadow=true;dl.shadow.mapSize.set(1024,1024);const shc=dl.shadow.camera;shc.left=shc.bottom=-18;shc.right=shc.top=18;shc.far=80;S.add(dl,dl.target);
// arena floor with procedural stone tiles
const ft=(()=>{const c=document.createElement('canvas');c.width=c.height=256;const g=c.getContext('2d');g.fillStyle='#3d3a50';g.fillRect(0,0,256,256);
 for(let i=0;i<2600;i++){g.fillStyle='rgba('+(Math.random()<.5?'255,255,255':'0,0,0')+','+Math.random()*.08+')';g.fillRect(Math.random()*256,Math.random()*256,3,3)}
 g.strokeStyle='rgba(8,6,18,.75)';g.lineWidth=3;for(let i=0;i<=256;i+=64){g.beginPath();g.moveTo(i,0);g.lineTo(i,256);g.stroke();g.beginPath();g.moveTo(0,i);g.lineTo(256,i);g.stroke()}
 const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(24,24);t.anisotropy=4;return t})();
const flr=new THREE.Mesh(new THREE.CircleGeometry(70,64),new THREE.MeshStandardMaterial({map:ft,roughness:.85,metalness:.1}));flr.rotation.x=-Math.PI/2;flr.receiveShadow=true;S.add(flr);
const ring=(a,b,s,o)=>{const m=new THREE.Mesh(new THREE.RingGeometry(a,b,s),new THREE.MeshBasicMaterial({color:0x7fe3ff,transparent:true,opacity:o,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide}));m.rotation.x=-Math.PI/2;m.position.y=.03;S.add(m);return m};
ring(29.6,30,96,.55);ring(13.8,14,64,.3);const hex=ring(8,8.2,6,.45),hex2=ring(5.2,5.35,3,.4);
// pillars and torches
const stm=new THREE.MeshStandardMaterial({color:0x56516e,roughness:.9}),tl=[];
for(let i=0;i<14;i++){const a=i/14*6.283,r=36,h=6+Math.random()*6,p=new THREE.Mesh(new THREE.CylinderGeometry(1.1,1.4,h,10),stm);p.position.set(Math.cos(a)*r,h/2,Math.sin(a)*r);p.castShadow=p.receiveShadow=true;S.add(p);
 const c=new THREE.Mesh(new THREE.BoxGeometry(3.2,.7,3.2),stm);c.position.set(p.position.x,h+.2,p.position.z);c.rotation.y=Math.random();c.castShadow=true;S.add(c)}
for(let i=0;i<5;i++){const a=i/5*6.283+.3,x=Math.cos(a)*26,z=Math.sin(a)*26,p=new THREE.Mesh(new THREE.CylinderGeometry(.08,.12,2.2,6),new THREE.MeshStandardMaterial({color:0x2a2018}));p.position.set(x,1.1,z);p.castShadow=true;S.add(p);
 const f=new THREE.Sprite(new THREE.SpriteMaterial({map:sp0,color:0xff9a40,blending:THREE.AdditiveBlending,depthWrite:false}));f.scale.set(1.6,2.2,1);f.position.set(x,2.5,z);S.add(f);
 const l=new THREE.PointLight(0xff8a3a,1.1,24);l.position.set(x,2.7,z);S.add(l);tl.push({l,f,o:Math.random()*9})}
// embers
const EN=150,ep=new Float32Array(EN*3),eg=new THREE.BufferGeometry();for(let i=0;i<EN;i++){ep[i*3]=(Math.random()-.5)*60;ep[i*3+1]=Math.random()*9;ep[i*3+2]=(Math.random()-.5)*60}
eg.setAttribute('position',new THREE.BufferAttribute(ep,3));S.add(new THREE.Points(eg,new THREE.PointsMaterial({size:.14,color:0xff9a50,transparent:true,opacity:.8,blending:THREE.AdditiveBlending,depthWrite:false})));
