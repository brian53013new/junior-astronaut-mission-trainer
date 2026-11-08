import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import type { Language } from './language';

export type WelcomeTarget='button'|'knob'|'switch'|'book'|'door';
/** A real, raycastable 3D classroom. Interaction and tutorial progression are owned by Game. */
export class WelcomeRoom {
 readonly root=new THREE.Group();
 readonly hits:Record<WelcomeTarget,THREE.Mesh>;
 private readonly highlights=new Map<WelcomeTarget,THREE.Object3D>();
 private readonly canvas=document.createElement('canvas');
 private readonly screenTexture:THREE.CanvasTexture;
 private readonly keyCap=new THREE.Group();
 private readonly dial=new THREE.Group();
 private readonly lever=new THREE.Group();
 private readonly indicator:THREE.Mesh;
 private pressedAt=-1000;
 private switchOn=false;
 private language:Language='zh';
 private step=0;
 private readonly doorPanel=new THREE.Group();
 private doorOpen=false;
 constructor(scene:THREE.Scene){
  this.root.position.set(45,0,0);this.root.visible=false;scene.add(this.root);
  const metal=(color:string,roughness=.55,metalness=.42)=>new THREE.MeshStandardMaterial({color,roughness,metalness});
  const dark=metal('#202d2d',.65,.3),hull=metal('#a6aea1',.82,.18),trim=metal('#748881',.43,.62),gold=metal('#d3b876',.38,.58),table=metal('#59615a',.75,.24);
  const addBox=(parent:THREE.Object3D,w:number,h:number,d:number,x:number,y:number,z:number,material:THREE.Material,r=.03)=>{const m=new THREE.Mesh(new RoundedBoxGeometry(w,h,d,3,Math.min(r,w/4,h/4,d/4)),material);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;};
  const addCylinder=(parent:THREE.Object3D,r1:number,r2:number,h:number,x:number,y:number,z:number,material:THREE.Material)=>{const m=new THREE.Mesh(new THREE.CylinderGeometry(r1,r2,h,32),material);m.position.set(x,y,z);m.castShadow=true;parent.add(m);return m;};
  const addScrew=(parent:THREE.Object3D,x:number,y:number,z:number)=>{const bolt=addCylinder(parent,.025,.025,.012,x,y,z,trim);const slot=addBox(parent,.036,.004,.006,x,y+.008,z,dark,.001);return [bolt,slot];};
  const makeHit=(target:WelcomeTarget,x:number,y:number,z:number,w:number,h:number,d:number)=>{const hit=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),new THREE.MeshBasicMaterial({transparent:true,opacity:0,depthWrite:false}));hit.position.set(x,y,z);hit.userData.welcomeTarget=target;this.root.add(hit);return hit;};
  const glow=(target:WelcomeTarget,x:number,y:number,z:number,w:number,d:number)=>{const g=new THREE.Group();const m=new THREE.MeshBasicMaterial({color:'#f6cf73',transparent:true,opacity:.88,depthTest:false});for(const sx of [-1,1])addBox(g,.035,.025,d,sx*w/2,0,0,m,.005);for(const sz of [-1,1])addBox(g,w,.025,.035,0,0,sz*d/2,m,.005);g.position.set(x,y,z);g.visible=false;g.renderOrder=10;this.root.add(g);this.highlights.set(target,g);};
  // Structural shell, ribs and a view into space create an actual enclosed compartment.
  addBox(this.root,10,.18,10,0,-.1,0,dark);addBox(this.root,10,.18,10,0,4.8,0,hull);addBox(this.root,10,4.8,.2,0,2.4,-4.2,hull);addBox(this.root,.2,4.8,10,-4.9,2.4,0,hull);addBox(this.root,.2,4.8,10,4.9,2.4,0,hull);
  for(const x of [-4,-2,0,2,4]){addBox(this.root,.09,4.65,.13,x,2.35,-4.05,trim,.02);addBox(this.root,.08,.08,8.4,x,4.68,0,trim,.02);}
  for(const x of [-3,0,3]){const strip=addBox(this.root,1.7,.04,.15,x,4.68,-.1,new THREE.MeshStandardMaterial({color:'#ecf1dd',emissive:'#dbedd1',emissiveIntensity:.8}),.01);strip.castShadow=false;}
  const ambient=new THREE.HemisphereLight('#e5f5e8','#525c53',1.1);this.root.add(ambient);const taskLight=new THREE.PointLight('#ffe8b5',16,12,2);taskLight.position.set(0,3.7,.4);this.root.add(taskLight);
  const windowFrame=addBox(this.root,2.1,1.35,.14,-3.2,2.8,-4.02,trim,.08);void windowFrame;addBox(this.root,1.86,1.1,.08,-3.2,2.8,-3.92,new THREE.MeshBasicMaterial({color:'#0c1f28'}),.08);
  for(let i=0;i<36;i++){const p=new THREE.Mesh(new THREE.SphereGeometry(.012+(i%3)*.004,6,4),new THREE.MeshBasicMaterial({color:'#e6eecf'}));p.position.set(-4.02+(i*137%163)/100,2.34+(i*71%90)/100,-3.86);this.root.add(p);}
  // Hatch has physical depth and an emissive outline; it opens only on request.
  const hatch=new THREE.Group();hatch.position.set(3.15,0,-4.02);this.root.add(hatch);addBox(hatch,1.7,3.3,.20,0,1.65,0,trim,.12);this.doorPanel.position.set(-.72,0,.15);hatch.add(this.doorPanel);addBox(this.doorPanel,1.42,2.95,.14,.71,1.67,0,dark,.1);addBox(this.doorPanel,.08,.52,.08,1.12,1.65,.1,gold,.025);for(const side of [-1,1])addBox(hatch,.04,2.96,.03,side*.75,1.66,.14,new THREE.MeshBasicMaterial({color:'#a4d1b3'}),.01);
  // Wide working surface and supporting legs.
  addBox(this.root,6.4,.28,2.95,0,.83,.38,table,.08);addBox(this.root,6.12,.08,2.72,0,1.01,.35,metal('#798078',.67,.24),.04);
  for(const x of [-2.75,2.75])for(const z of [-.6,1.35])addBox(this.root,.23,.75,.23,x,.39,z,dark,.025);
  addBox(this.root,5.95,.08,.08,0,.96,1.74,trim,.025);
  // Monitor: fixed physical bezel and in-world high-resolution text.
  addBox(this.root,3.15,1.42,.18,0,2.05,-.92,dark,.08);addBox(this.root,.14,.52,.14,0,1.3,-.95,trim,.025);addBox(this.root,.95,.06,.4,0,1.08,-.95,trim,.025);
  this.canvas.width=1536;this.canvas.height=768;this.screenTexture=new THREE.CanvasTexture(this.canvas);this.screenTexture.colorSpace=THREE.SRGBColorSpace;this.screenTexture.anisotropy=4;
  const screen=new THREE.Mesh(new THREE.PlaneGeometry(2.88,1.17),new THREE.MeshBasicMaterial({map:this.screenTexture}));screen.position.set(0,2.05,-.815);this.root.add(screen);
  for(const x of [-1.48,1.48])for(const y of [1.45,2.65]){const screw=addCylinder(this.root,.027,.027,.015,x,y,-.8,trim);screw.rotation.x=Math.PI/2;}
  // Three separated training stations: spring button, calibrated dial, hinged toggle.
  const positions=[-1.9,0,1.9];for(const x of positions){addBox(this.root,1.42,.13,1.0,x,1.1,.55,dark,.05);addBox(this.root,1.27,.045,.85,x,1.18,.55,trim,.03);for(const dx of [-.55,.55])for(const dz of [-.35,.35])addScrew(this.root,x+dx,1.215,.55+dz);}
  this.keyCap.position.set(-1.9,1.31,.52);this.root.add(this.keyCap);addCylinder(this.keyCap,.26,.3,.18,0,0,0,metal('#d98062',.34,.18));const buttonFace=addCylinder(this.keyCap,.22,.22,.025,0,.1,0,metal('#edaa86',.4,.14));void buttonFace;const ring=addCylinder(this.root,.34,.34,.035,-1.9,1.23,.52,gold);void ring;
  this.dial.position.set(0,1.32,.52);this.root.add(this.dial);addCylinder(this.dial,.25,.29,.19,0,0,0,metal('#7faaa0',.36,.36));for(let i=0;i<16;i++){const a=i*Math.PI/8;const rib=addBox(this.dial,.025,.09,.035,Math.sin(a)*.25,0,Math.cos(a)*.25,trim,.004);rib.rotation.y=a;}addBox(this.dial,.035,.025,.18,0,.105,.04,gold,.006);for(let i=0;i<9;i++){const a=-1.3+i*.325;const tick=addBox(this.root,.018,.012,.09,Math.sin(a)*.4,1.22,.52-Math.cos(a)*.4,gold,.003);tick.rotation.y=-a;}
  this.lever.position.set(1.9,1.22,.52);this.root.add(this.lever);addCylinder(this.lever,.055,.065,.33,0,.14,0,trim);addCylinder(this.lever,.1,.1,.1,0,.31,0,metal('#d7c397',.4,.3));this.lever.rotation.z=-.4;
  const indicatorMaterial=new THREE.MeshStandardMaterial({color:'#71927e',emissive:'#466958',emissiveIntensity:.35});this.indicator=new THREE.Mesh(new THREE.SphereGeometry(.06,18,12),indicatorMaterial);this.indicator.position.set(2.36,1.25,.24);this.root.add(this.indicator);
  // Study book has a raised cover, paper block and actual large touch target.
  addBox(this.root,.85,.09,.62,-2.75,1.11,1.35,metal('#785740',.84,.1),.025);addBox(this.root,.78,.026,.55,-2.75,1.17,1.35,metal('#d9caac',.95,.02),.02);addBox(this.root,.035,.035,.57,-2.75,1.2,1.35,gold,.005);
  const hitButton=makeHit('button',-1.9,1.36,.52,.92,.55,.85),hitKnob=makeHit('knob',0,1.36,.52,.92,.55,.85),hitSwitch=makeHit('switch',1.9,1.38,.52,.92,.65,.85),hitBook=makeHit('book',-2.75,1.25,1.35,1.0,.4,.8),hitDoor=makeHit('door',3.15,1.7,-3.72,1.8,3.2,.5);
  this.hits={button:hitButton,knob:hitKnob,switch:hitSwitch,book:hitBook,door:hitDoor};
  glow('button',-1.9,1.25,.52,1.22,.83);glow('knob',0,1.25,.52,1.22,.83);glow('switch',1.9,1.25,.52,1.22,.83);glow('book',-2.75,1.22,1.35,.94,.7);
  const doorHighlight=new THREE.Mesh(new THREE.TorusGeometry(.8,.025,8,64),new THREE.MeshBasicMaterial({color:'#f6cf73',transparent:true,opacity:.9,depthTest:false}));doorHighlight.scale.set(1,1.8,1);doorHighlight.position.set(3.15,1.65,-3.82);doorHighlight.visible=false;doorHighlight.renderOrder=10;this.root.add(doorHighlight);this.highlights.set('door',doorHighlight);
  this.setStep(0,'zh');
 }
 setStep(step:number,language:Language){this.step=step;this.language=language;const target:Record<number,WelcomeTarget>={1:'button',2:'knob',3:'switch',4:'book',5:'door'};for(const [name,obj]of this.highlights)obj.visible=target[step]===name;this.drawScreen();}
 pressButton(){this.pressedAt=performance.now();}
 turnKnob(value:number){this.dial.rotation.y=THREE.MathUtils.clamp(value,0,1)*Math.PI*1.5;}
 toggleSwitch(){this.switchOn=!this.switchOn;this.lever.rotation.z=this.switchOn?.4:-.4;const m=this.indicator.material as THREE.MeshStandardMaterial;m.color.set(this.switchOn?'#b8efd0':'#71927e');m.emissiveIntensity=this.switchOn?1.3:.35;return this.switchOn;}
 openDoor(){this.doorOpen=true;}
 update(now:number,dt:number){const p=Math.max(0,Math.min(1,(now-this.pressedAt)/380));this.keyCap.position.y=1.31-(p<.35?.09*(p/.35):.09*Math.exp(-7*(p-.35)));this.doorPanel.rotation.y=THREE.MathUtils.damp(this.doorPanel.rotation.y,this.doorOpen?-1.25:0,5,dt);for(const obj of this.highlights.values())if(obj.visible)obj.traverse(o=>{if(o instanceof THREE.Mesh&&o.material instanceof THREE.MeshBasicMaterial)o.material.opacity=.65+.22*Math.sin(now*.005);});}
 private drawScreen(){const c=this.canvas.getContext('2d')!,z=this.language==='zh';c.fillStyle='#112b2d';c.fillRect(0,0,1536,768);c.strokeStyle='#98c4ac';c.lineWidth=7;c.strokeRect(20,20,1496,728);c.fillStyle='#d4bd82';c.font='bold 56px Arial';c.fillText(z?'NOVA 的訓練桌':'NOVA’S TRAINING DESK',72,100);const zh=['先看看四周，準備認識控制桌。','點擊亮起的實體按鈕。','拖動旋鈕，觀察它旋轉。','點擊開關，看看指示燈。','點擊桌上的訓練筆記。','點擊艙門，前往正式訓練。'];const en=['Look around and get to know the desk.','Click the glowing physical button.','Drag the dial and watch it turn.','Click the switch and watch the indicator.','Select the training book on the desk.','Select the hatch to begin training.'];c.fillStyle='#edf2de';c.font='52px Arial';const text=(z?zh:en)[Math.min(5,Math.max(0,this.step))];let line='',y=230;for(const ch of text){if(c.measureText(line+ch).width>1360){c.fillText(line,72,y);line=ch;y+=76;}else line+=ch;}if(line)c.fillText(line,72,y);c.fillStyle='#94bca5';c.font='36px Arial';c.fillText(z?'練習設備不消耗任務補給':'PRACTICE CONTROLS USE NO MISSION SUPPLIES',72,650);this.screenTexture.needsUpdate=true;}
}
