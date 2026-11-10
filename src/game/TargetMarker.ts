import * as THREE from 'three';
/** A world-space locator and dashed tether; it never participates in hit testing. */
export class TargetMarker {
 private readonly root=new THREE.Group();private readonly symbol=new THREE.Group();private readonly tether:THREE.Line;private readonly glow:THREE.MeshBasicMaterial;
 constructor(scene:THREE.Scene){scene.add(this.root);this.root.visible=false;this.root.renderOrder=14;this.glow=new THREE.MeshBasicMaterial({color:'#e8b866',transparent:true,opacity:.72,depthWrite:false,depthTest:false});
  const shaft=new THREE.Mesh(new THREE.BoxGeometry(.035,.25,.02),this.glow);shaft.position.y=.06;this.symbol.add(shaft);for(const side of [-1,1]){const wing=new THREE.Mesh(new THREE.BoxGeometry(.035,.17,.02),this.glow);wing.position.set(side*.055,-.09,0);wing.rotation.z=side*.75;this.symbol.add(wing);}const ring=new THREE.Mesh(new THREE.TorusGeometry(.22,.012,8,48),this.glow);this.symbol.add(ring);this.root.add(this.symbol);
  const geometry=new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0,0,0),new THREE.Vector3(0,.68,0)]);const material=new THREE.LineDashedMaterial({color:'#edc986',transparent:true,opacity:.65,dashSize:.065,gapSize:.045,depthTest:false,depthWrite:false});this.tether=new THREE.Line(geometry,material);this.tether.computeLineDistances();this.root.add(this.tether);
 }
 snapshot(){return {id:String(this.root.userData.targetId??''),visible:this.root.visible,x:this.root.position.x,y:this.root.position.y,z:this.root.position.z};}
 hide(){this.root.visible=false;}
 show(point:THREE.Vector3,camera:THREE.Camera,now:number,idle:number,reduced:boolean,id:string){this.root.userData.targetId=id;this.root.visible=true;this.root.position.copy(point);const bob=reduced?0:.035*Math.sin(now*.002);this.symbol.position.set(0,.68+bob,0);this.symbol.quaternion.copy(camera.quaternion);this.glow.opacity=Math.min(.9,.58+idle*.08+(reduced?0:.08*(.5+.5*Math.sin(now*.002))));}
}
