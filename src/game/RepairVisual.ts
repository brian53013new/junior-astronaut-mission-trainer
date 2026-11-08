import * as THREE from 'three';

/** Physical connectors and cables aligned with the repair monitor's interaction zones. */
export class RepairVisual {
 readonly root=new THREE.Group();
 private readonly links=new THREE.Group();
 private readonly materials:THREE.MeshStandardMaterial[];
 private signature='';
 private readonly targetOrder=[2,0,1];
 constructor(parent:THREE.Object3D){
  parent.add(this.root);this.root.position.set(-2.72,2.4,-1.68);this.root.visible=false;
  this.materials=['#d5aa65','#83c0c5','#a8c68e'].map(color=>new THREE.MeshStandardMaterial({color,metalness:.25,roughness:.55}));
  const socket=new THREE.MeshStandardMaterial({color:'#b8b19c',metalness:.75,roughness:.3});
  for(let i=0;i<3;i++)for(const x of [253,367]){
   const p=this.point(x,98+i*60);const outer=new THREE.Mesh(new THREE.TorusGeometry(.055,.012,8,24),socket);outer.position.copy(p);this.root.add(outer);
   const inner=new THREE.Mesh(new THREE.CircleGeometry(.034,20),this.materials[x===253?i:this.targetOrder.indexOf(i)]);inner.position.copy(p);inner.position.z=.004;this.root.add(inner);
  }
  this.root.add(this.links);
 }
 private point(x:number,y:number){return new THREE.Vector3((x/640-.5)*2.54,(.5-y/390)*1.89,.015);}
 update(visible:boolean,placed:boolean[],drag?:{part:number;x:number;y:number}){
  this.root.visible=visible;if(!visible)return;
  const signature=JSON.stringify([placed,drag]);if(signature===this.signature)return;this.signature=signature;
  for(const child of [...this.links.children]){this.links.remove(child);if(child instanceof THREE.Mesh)child.geometry.dispose();}
  for(let i=0;i<3;i++){
   if(!placed[i]&&drag?.part!==i)continue;
   const start=this.point(253,98+i*60);const end=drag?.part===i?this.point(drag.x,drag.y):this.point(367,98+this.targetOrder[i]*60);
   const mid=start.clone().lerp(end,.5);mid.z+=.08;mid.y-=.04;
   const cable=new THREE.Mesh(new THREE.TubeGeometry(new THREE.QuadraticBezierCurve3(start,mid,end),24,.012,8,false),this.materials[i]);this.links.add(cable);
   const plug=new THREE.Mesh(new THREE.SphereGeometry(.024,12,8),this.materials[i]);plug.position.copy(end);this.links.add(plug);
  }
 }
}
