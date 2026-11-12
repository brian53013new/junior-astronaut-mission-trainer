import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
/** Three tangible models in front of the central in-world workshop monitor. */
export class AssemblyVisual {
 readonly root=new THREE.Group();private parts:THREE.Group[]=[];
 constructor(parent:THREE.Object3D){parent.add(this.root);this.root.position.set(0,2.4,-1.72);this.root.visible=false;const metal=new THREE.MeshStandardMaterial({color:'#d6ceb8',metalness:.65,roughness:.34});const accent=new THREE.MeshStandardMaterial({color:'#669b9b',metalness:.5,roughness:.4});
  const panel=new THREE.Group();const frame=new THREE.Mesh(new RoundedBoxGeometry(.29,.20,.045,3,.008),metal);panel.add(frame);const glass=new THREE.Mesh(new THREE.BoxGeometry(.25,.16,.02),new THREE.MeshStandardMaterial({color:'#335c77',metalness:.45,roughness:.28}));glass.position.z=.035;panel.add(glass);for(let i=-1;i<=1;i++){const rib=new THREE.Mesh(new THREE.BoxGeometry(.006,.16,.009),metal);rib.position.set(i*.06,0,.048);panel.add(rib);}// Photovoltaic cells, busbars and a deployable root hinge identify the panel's purpose.
  const cellMat=new THREE.MeshStandardMaterial({color:'#244961',metalness:.55,roughness:.3});
  for(let x=0;x<4;x++)for(let y=0;y<2;y++){const cell=new THREE.Mesh(new THREE.BoxGeometry(.053,.068,.004),cellMat);cell.position.set(-.09+x*.06,-.04+y*.08,.049);panel.add(cell);}
  for(const x of [-.118,.118])for(const y of [-.075,.075]){const bolt=new THREE.Mesh(new THREE.SphereGeometry(.006,8,6),metal);bolt.position.set(x,y,.054);panel.add(bolt);}
  const hinge=new THREE.Mesh(new THREE.CylinderGeometry(.018,.018,.12,12),metal);hinge.rotation.x=Math.PI/2;hinge.position.set(-.165,0,0);panel.add(hinge);this.parts.push(panel);
  const tank=new THREE.Group();const body=new THREE.Mesh(new THREE.CylinderGeometry(.085,.085,.22,20),accent);body.rotation.z=Math.PI/2;tank.add(body);for(const x of [-.11,.11]){const end=new THREE.Mesh(new THREE.SphereGeometry(.085,16,12),metal);end.position.x=x;tank.add(end);}// Retaining straps and end couplings separate the vessel from its plumbing.
  const strapMat=new THREE.MeshStandardMaterial({color:'#384e4b',metalness:.55,roughness:.4});
  for(const x of [-.06,.06]){const strap=new THREE.Mesh(new THREE.TorusGeometry(.088,.007,8,24),strapMat);strap.rotation.y=Math.PI/2;strap.position.x=x;tank.add(strap);}
  for(const x of [-.19,.19]){const fitting=new THREE.Mesh(new THREE.CylinderGeometry(.027,.035,.045,16),metal);fitting.rotation.z=Math.PI/2;fitting.position.x=x;tank.add(fitting);}
  const valve=new THREE.Mesh(new THREE.CylinderGeometry(.015,.015,.065,12),metal);valve.position.y=.105;tank.add(valve);this.parts.push(tank);
  const shield=new THREE.Group();const plate=new THREE.Mesh(new RoundedBoxGeometry(.24,.21,.08,3,.015),metal);shield.add(plate);const brace=new THREE.Mesh(new THREE.BoxGeometry(.035,.22,.025),accent);brace.position.z=.05;brace.rotation.z=.6;shield.add(brace);// A sacrificial outer face and recessed fasteners show the layered shield assembly.
  const face=new THREE.Mesh(new RoundedBoxGeometry(.19,.16,.018,3,.008),new THREE.MeshStandardMaterial({color:'#9fada4',metalness:.35,roughness:.6}));face.position.z=.045;shield.add(face);
  for(const x of [-.09,.09])for(const y of [-.075,.075]){const bolt=new THREE.Mesh(new THREE.SphereGeometry(.008,10,6),metal);bolt.position.set(x,y,.058);shield.add(bolt);}
  const edge=new THREE.Mesh(new THREE.BoxGeometry(.19,.008,.01),accent);edge.position.set(0,-.065,.061);shield.add(edge);this.parts.push(shield);
  for(const part of this.parts){part.traverse(o=>{if(o instanceof THREE.Mesh)o.castShadow=true;});this.root.add(part);}this.update(false,[false,false,false]);
 }
 private point(x:number,y:number){return new THREE.Vector3((x/640-.5)*2.54,(.5-y/390)*1.89,0);}
 update(visible:boolean,placed:boolean[],drag?:{part:number;x:number;y:number}){this.root.visible=visible;if(!visible)return;for(let i=0;i<3;i++){let p=this.point(placed[i]?580:215,98+i*60);if(drag&&drag.part===i)p=this.point(drag.x,drag.y);this.parts[i].position.copy(p);this.parts[i].rotation.y=drag?.part===i?.35:0;this.parts[i].rotation.z=drag?.part===i?.12:0;}}
}
