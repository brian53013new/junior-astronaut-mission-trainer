import { PerspectiveCamera, Vector3 } from 'three';

export type Point3={x:number;y:number;z:number};
export type Point2={x:number;y:number};

/** Fixed camera destination for a control. The current camera position is never an input. */
export function focusPreset(base:Point3,control:Point3,pointer:Point2={x:0,y:0},aspect=1,fov=48){
  const direction=new Vector3(base.x-control.x,0,base.z-control.z).normalize();
  if(direction.lengthSq()<.01)direction.set(0,0,1);
  const position=new Vector3(control.x+direction.x*2.9,Math.min(base.y,control.y+1.65),control.z+direction.z*2.9);
  const anchor=new Vector3(control.x,control.y,control.z);
  const camera=new PerspectiveCamera(fov,aspect,.1,100);camera.position.copy(position);camera.rotation.order='YXZ';camera.lookAt(anchor);
  let pitch=camera.rotation.x,yaw=camera.rotation.y;
  const project=(x:number,y:number)=>{camera.rotation.set(x,y,0,'YXZ');camera.updateMatrixWorld();return anchor.clone().project(camera);};
  // Solve the focus orientation while keeping the control under the pointer.
  for(let i=0;i<7;i++){
    const point=project(pitch,yaw),ex=pointer.x-point.x,ey=pointer.y-point.y;
    if(Math.hypot(ex,ey)<.00001)break;
    const h=.0001,px=project(pitch+h,yaw),py=project(pitch,yaw+h);
    const a=(px.x-point.x)/h,b=(py.x-point.x)/h,c=(px.y-point.y)/h,d=(py.y-point.y)/h,det=a*d-b*c;
    if(Math.abs(det)<1e-8)break;
    pitch+=Math.max(-.4,Math.min(.4,(ex*d-b*ey)/det));
    yaw+=Math.max(-.4,Math.min(.4,(a*ey-ex*c)/det));
  }
  camera.rotation.set(pitch,yaw,0,'YXZ');camera.updateMatrixWorld();
  const target=position.clone().add(new Vector3(0,0,-8).applyQuaternion(camera.quaternion));
  return {position:{x:position.x,y:position.y,z:position.z},target:{x:target.x,y:target.y,z:target.z}};
}
