import * as THREE from 'three';
/** A short enclosed passage physically joins the engineering and repair bays. */
export class WorkshopCorridor {
 readonly root=new THREE.Group();
 constructor(scene:THREE.Scene){scene.add(this.root);this.root.position.x=85;this.root.visible=false;
  const wall=new THREE.MeshStandardMaterial({color:'#8295a0',roughness:.72,metalness:.25});const floor=new THREE.MeshStandardMaterial({color:'#334b59',roughness:.72,metalness:.35});
  const box=(w:number,h:number,d:number,x:number,y:number,z:number,m:THREE.Material)=>{const mesh=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);mesh.position.set(x,y,z);this.root.add(mesh);};
  box(4.4,.12,2.2,0,.04,0,floor);box(4.4,.12,2.2,0,3,0,wall);for(const z of [-1.1,1.1])box(4.4,3,.12,0,1.5,z,wall);
  for(const x of [-1.8,0,1.8]){for(const z of [-1,1])box(.07,2.7,.08,x,1.45,z,floor);box(.08,.04,1.8,x,2.9,0,new THREE.MeshBasicMaterial({color:'#d8ebef'}));}
  const light=new THREE.PointLight('#d9edf2',12,8);light.position.set(0,2.5,0);this.root.add(light);
 }
}
