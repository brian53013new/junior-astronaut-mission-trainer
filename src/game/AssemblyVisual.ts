import * as THREE from 'three';
/** Three tangible models in front of the central in-world workshop monitor. */
export class AssemblyVisual {
 readonly root=new THREE.Group();private parts:THREE.Group[]=[];
 constructor(parent:THREE.Object3D){parent.add(this.root);this.root.position.set(0,2.4,-1.72);this.root.visible=false;const metal=new THREE.MeshStandardMaterial({color:'#d6ceb8',metalness:.65,roughness:.34});const accent=new THREE.MeshStandardMaterial({color:'#669b9b',metalness:.5,roughness:.4});
  const panel=new THREE.Group();const frame=new THREE.Mesh(new THREE.BoxGeometry(.29,.20,.045),metal);panel.add(frame);const glass=new THREE.Mesh(new THREE.BoxGeometry(.25,.16,.02),new THREE.MeshStandardMaterial({color:'#335c77',metalness:.45,roughness:.28}));glass.position.z=.035;panel.add(glass);for(let i=-1;i<=1;i++){const rib=new THREE.Mesh(new THREE.BoxGeometry(.006,.16,.009),metal);rib.position.set(i*.06,0,.048);panel.add(rib);}this.parts.push(panel);
  const tank=new THREE.Group();const body=new THREE.Mesh(new THREE.CylinderGeometry(.085,.085,.22,20),accent);body.rotation.z=Math.PI/2;tank.add(body);for(const x of [-.11,.11]){const end=new THREE.Mesh(new THREE.SphereGeometry(.085,16,12),metal);end.position.x=x;tank.add(end);}this.parts.push(tank);
  const shield=new THREE.Group();const plate=new THREE.Mesh(new THREE.BoxGeometry(.24,.21,.08),metal);shield.add(plate);const brace=new THREE.Mesh(new THREE.BoxGeometry(.035,.22,.025),accent);brace.position.z=.05;brace.rotation.z=.6;shield.add(brace);this.parts.push(shield);
  for(const part of this.parts){part.traverse(o=>{if(o instanceof THREE.Mesh)o.castShadow=true;});this.root.add(part);}this.update(false,[false,false,false]);
 }
 private point(x:number,y:number){return new THREE.Vector3((x/640-.5)*2.54,(.5-y/390)*1.89,0);}
 update(visible:boolean,placed:boolean[],drag?:{part:number;x:number;y:number}){this.root.visible=visible;if(!visible)return;for(let i=0;i<3;i++){let p=this.point(placed[i]?580:215,98+i*60);if(drag&&drag.part===i)p=this.point(drag.x,drag.y);this.parts[i].position.copy(p);this.parts[i].rotation.y=drag?.part===i?.35:0;this.parts[i].rotation.z=drag?.part===i?.12:0;}}
}
