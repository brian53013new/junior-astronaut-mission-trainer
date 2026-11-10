import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import type { WorkshopPart } from './Workshop';

/** A physical training bench. All coordinates and fixtures are fictional teaching aids. */
export class AssemblyBay {
 readonly root=new THREE.Group();readonly hits:THREE.Mesh[]=[];readonly activate:THREE.Mesh;readonly exit:THREE.Mesh;readonly passage:THREE.Mesh;
 private readonly pieces:THREE.Group[]=[];private readonly homes:THREE.Vector3[]=[];private readonly sockets:THREE.Vector3[]=[];private readonly socketRings:THREE.Mesh[]=[];
 private readonly lights:THREE.MeshStandardMaterial[]=[];private readonly labelCanvas=document.createElement('canvas');private readonly labelTexture:THREE.CanvasTexture;
 constructor(scene:THREE.Scene){
  scene.add(this.root);this.root.position.set(80,0,0);this.root.visible=false;
  const metal=new THREE.MeshStandardMaterial({color:'#aabac3',metalness:.7,roughness:.35}), dark=new THREE.MeshStandardMaterial({color:'#273f50',metalness:.5,roughness:.55}), shell=new THREE.MeshStandardMaterial({color:'#d3d9d3',metalness:.25,roughness:.55}), blue=new THREE.MeshStandardMaterial({color:'#294b65',metalness:.35,roughness:.4});
  const box=(parent:THREE.Object3D,w:number,h:number,d:number,x:number,y:number,z:number,material:THREE.Material)=>{const m=new THREE.Mesh(new RoundedBoxGeometry(w,h,d,3,.025),material);m.position.set(x,y,z);parent.add(m);return m;};
  const tag=(text:string,x:number,y:number,z:number)=>{const canvas=document.createElement('canvas');canvas.width=256;canvas.height=96;const c=canvas.getContext('2d')!;c.fillStyle='#142a38';c.fillRect(0,0,256,96);c.fillStyle='#f1e4bf';c.textAlign='center';c.font='bold 56px Arial';c.fillText(text,128,68,240);const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;const label=new THREE.Mesh(new THREE.PlaneGeometry(.42,.16),new THREE.MeshBasicMaterial({map:texture,side:THREE.DoubleSide}));label.rotation.x=-Math.PI/2;label.position.set(x,y,z);this.root.add(label);};

  box(this.root,6,.2,7,0,-.1,0,dark);box(this.root,6,4,.18,0,2,-3.45,shell);box(this.root,.18,4,7,-2.9,2,0,shell);for(const z of [-2.3,2.3])box(this.root,.18,4,2.4,2.9,2,z,shell);box(this.root,.18,1.2,2.2,2.9,3.4,0,shell);box(this.root,6,.18,7,0,4,0,shell);
  box(this.root,3.7,.22,4.8,0,.9,0,dark);box(this.root,3.55,.06,4.65,0,1.04,0,metal);
  for(const x of [-1.55,1.55])for(const z of [-2,2])box(this.root,.16,.82,.16,x,.41,z,dark);
  const hemi=new THREE.HemisphereLight('#e9f4f4','#60717c',1.2);this.root.add(hemi);const lamp=new THREE.PointLight('#e6eff0',18,9);lamp.position.set(0,3.5,1);this.root.add(lamp);
  // Probe chassis, mounting ports and three separate serviceable components.
  box(this.root,.55,.36,2.55,.52,1.27,0,shell);box(this.root,.42,.12,2.38,.52,1.51,0,dark);
  for(let i=0;i<3;i++){
   const z=(i-1)*1.12;const socket=new THREE.Vector3(.52,1.63,z);this.sockets.push(socket);tag(['SOLAR 太陽','BAT 電池','ANT 天線'][i],1.08,1.12,z);tag(['SOLAR 太陽','BAT 電池','ANT 天線'][i],-1.53,1.12,z);
   const ringMat=new THREE.MeshStandardMaterial({color:'#9dbec8',emissive:'#456675',emissiveIntensity:.25,metalness:.55,roughness:.4});const ring=new THREE.Mesh(new THREE.TorusGeometry(.23,.025,10,40),ringMat);ring.rotation.x=Math.PI/2;ring.position.copy(socket);this.root.add(ring);this.socketRings.push(ring);this.lights.push(ringMat);
   const part=new THREE.Group();part.position.set(-1.03,1.31,z);this.homes.push(part.position.clone());this.root.add(part);this.pieces.push(part);
   if(i===0){box(part,.58,.09,.55,0,0,0,metal);box(part,.48,.025,.43,0,.065,0,blue);for(const x of [-.12,0,.12])box(part,.008,.01,.42,x,.085,0,metal);}
   else if(i===1){box(part,.43,.29,.42,0,.1,0,shell);for(const x of [-.12,.12])box(part,.05,.08,.35,x,.27,0,metal);}
   else{box(part,.48,.12,.48,0,.02,0,metal);const antenna=new THREE.Mesh(new THREE.ConeGeometry(.18,.28,24,1,true),metal);antenna.position.y=.21;part.add(antenna);const tip=new THREE.Mesh(new THREE.SphereGeometry(.04,12,8),blue);tip.position.y=.36;part.add(tip);}
   const hit=new THREE.Mesh(new THREE.BoxGeometry(.7,.65,.7),new THREE.MeshBasicMaterial({transparent:true,opacity:0,depthWrite:false}));hit.position.y=.15;part.add(hit);this.hits.push(hit);
  }
  const activateBase=box(this.root,.54,.13,.45,1.33,1.13,-1.95,dark);void activateBase;const cap=new THREE.Mesh(new THREE.CylinderGeometry(.15,.17,.12,24),new THREE.MeshStandardMaterial({color:'#b9d4da',emissive:'#356779',emissiveIntensity:.3,metalness:.25,roughness:.4}));cap.position.set(1.33,1.27,-1.95);this.root.add(cap);this.activate=new THREE.Mesh(new THREE.BoxGeometry(.56,.45,.5),new THREE.MeshBasicMaterial({transparent:true,opacity:0,depthWrite:false}));this.activate.position.set(1.33,1.27,-1.95);this.root.add(this.activate);
this.passage=new THREE.Mesh(new THREE.BoxGeometry(.4,2.7,2.15),new THREE.MeshBasicMaterial({transparent:true,opacity:0,depthWrite:false}));this.passage.position.set(2.9,1.35,0);this.root.add(this.passage);  this.exit=box(this.root,.65,.22,.35,-1.25,1.17,-2.05,dark);this.exit.userData.exit=true;
  tag('BACK 返回',-1.25,1.3,-2.05);tag('START 啟動',1.33,1.36,-1.95);this.labelCanvas.width=1024;this.labelCanvas.height=512;this.labelTexture=new THREE.CanvasTexture(this.labelCanvas);this.labelTexture.colorSpace=THREE.SRGBColorSpace;const label=new THREE.Mesh(new THREE.PlaneGeometry(2.8,1.4),new THREE.MeshBasicMaterial({map:this.labelTexture}));label.position.set(0,2.6,-3.31);this.root.add(label);
 }
 show(placed:boolean[],zh:boolean){this.root.visible=true;for(let i=0;i<3;i++){this.pieces[i].position.copy(placed[i]?this.sockets[i]:this.homes[i]);this.pieces[i].rotation.set(0,0,0);this.lights[i].emissiveIntensity=placed[i]?1:.25;}this.draw(placed,zh);}
 draw(placed:boolean[],zh:boolean){const c=this.labelCanvas.getContext('2d')!;c.fillStyle='#122635';c.fillRect(0,0,1024,512);c.fillStyle='#e8c786';c.font='bold 48px Arial';c.fillText(zh?'探測器組裝工作台':'PROBE ASSEMBLY BAY',48,74);c.fillStyle='#eef1e8';c.font='35px Arial';const lines=zh?['拖動零件到接口；按住時可用雙指旋轉。','太陽能板收集光；電池儲存能量；天線傳送訊號。','完成三個安裝後，按右上方啟動鍵。','側牆通道前往另一工作室；深色鍵返回控制艙']:['Drag parts to ports; twist with two fingers while holding.','Solar panels collect light; batteries store energy; antennas send signals.','Install all three, then press the upper-right activation key.','Side hatch: other workshop. Dark key: cabin.'];lines.forEach((line,i)=>c.fillText(line,48,155+i*68,930));c.fillStyle='#9fc5d2';c.fillText(`${placed.filter(Boolean).length} / 3`,48,467);this.labelTexture.needsUpdate=true;}
 move(part:WorkshopPart,point:THREE.Vector3){this.pieces[part].position.set(THREE.MathUtils.clamp(point.x-80,-1.5,1.4),1.34,THREE.MathUtils.clamp(point.z,-2.15,2.15));}
 drop(part:WorkshopPart,point:THREE.Vector3){const local=point.clone();local.x-=80;const socket=this.sockets[part];const distance=Math.hypot(local.x-socket.x,local.z-socket.z);if(distance<.43){this.pieces[part].position.copy(socket);this.pieces[part].rotation.set(0,0,0);this.lights[part].emissiveIntensity=1;return true;}this.pieces[part].position.copy(this.homes[part]);this.pieces[part].rotation.set(0,0,0);return false;}
 rotate(part:WorkshopPart,delta:number,axis:'x'|'y'|'z'='y'){this.pieces[part].rotation[axis]+=delta;}
 rotation(part:WorkshopPart){return this.pieces[part].rotation.y;}
 boot(progress:number){this.pieces[0].rotation.z=Math.sin(Math.min(1,progress)*Math.PI/2)*.55;this.pieces[2].rotation.y=progress*2.5;for(const light of this.lights)light.emissiveIntensity=1.2+.5*Math.sin(progress*18);}
 targetIndex(part:WorkshopPart){return part;}
 point(kind:'part'|'socket'|'activate'|'passage',index=0){if(kind==='activate')return this.activate.getWorldPosition(new THREE.Vector3());if(kind==='passage')return this.passage.getWorldPosition(new THREE.Vector3());if(kind==='part')return this.hits[index].getWorldPosition(new THREE.Vector3());return this.root.localToWorld(new THREE.Vector3(this.sockets[index].x,1.31,this.sockets[index].z));}
 hide(){this.root.visible=false;}
}
