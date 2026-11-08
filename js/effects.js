// Spark and hit-effect particle pool (burst) + blood splats
const PL=[];for(let i=0;i<170;i++){const s=new THREE.Sprite(new THREE.SpriteMaterial({map:sp0,blending:THREE.AdditiveBlending,depthWrite:false,transparent:true}));s.visible=false;s.userData={l:0,m:1,s:1,v:V(0,0,0)};S.add(s);PL.push(s)}
let pi=0;function burst(p,col,n,sp,life,size){for(let i=0;i<n;i++){const s=PL[pi++%PL.length],u=s.userData;s.visible=true;s.position.copy(p);s.material.color.setHex(col);u.v.set((Math.random()-.5)*sp,Math.random()*sp*.8,(Math.random()-.5)*sp);u.l=u.m=life*(.6+Math.random()*.6);u.s=size}}
// blood splats on the floor (ring buffer)
const SPL=[];for(let i=0;i<40;i++){const m=new THREE.Mesh(new THREE.PlaneGeometry(1,1),new THREE.MeshBasicMaterial({map:sp0,color:0x6a0f1c,transparent:true,opacity:.75,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2}));m.rotation.x=-Math.PI/2;m.position.y=.025;m.visible=false;S.add(m);SPL.push(m)}
let si=0;function splat(x,z,s){const m=SPL[si++%SPL.length];m.visible=true;m.position.x=x;m.position.z=z;m.scale.setScalar(s);m.rotation.z=Math.random()*6}
function clearSplats(){SPL.forEach(m=>m.visible=false)}