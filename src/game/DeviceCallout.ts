import * as THREE from 'three';
import { t, type Language } from './language';
import type { Action } from './types';
import { devices } from './DeviceCatalog';

const labels:Record<Action,string>={plan:'planLabel',craft:'craftLabel',power:'powerLabel',comms:'commsLabel',navigate:'navLabel',science:'scienceLabel',analyze:'analyzeLabel',recycle:'recycleLabel',grow:'growLabel',event:'eventLabel',pause:'pauseLabel',advance:'advanceLabel',skip:'skipLabel',shelter:'shelterLabel',continue:'continueLabel'};
const copy:Record<Action,[string,string,string,string]>={
 plan:['選擇基地位置：日照和水需要取捨。','拖曳基地棋子到地點後放開。','Choose a site: sunlight and water trade off.','Drag the habitat token to a site.'],
 craft:['檢查飛船，為探索做好準備。','拖曳推進桿，再放開。','Test the craft before exploring.','Drag and release the throttle.'],
 power:['增加電力，會消耗一些水。','拖曳滑桿，再放開。','More power costs some water.','Drag and release the slider.'],
 comms:['建立通訊，讓觀測資料傳回基地。','點擊按鍵建立通訊。','Connect the relay to send observations.','Click the key to connect.'],
 navigate:['選擇探索路線；遠路消耗更多燃料。','拖曳航點，再放開。','Longer routes use more fuel.','Drag and release the waypoint.'],
 science:['觀測月球，調整方向與強度。','左右拖曳調整強度，上下瞄準。','Explore the Moon with your instrument.','Drag sideways for power; up/down to aim.'],
 analyze:['比較樣本，找出較強的訊號。','拖曳標記，再放開。','Compare the samples for a stronger signal.','Drag and release the marker.'],
 recycle:['使用電力回收水。','點擊開始回收。','Recycle water using electrical power.','Click to recycle.'],
 grow:['植物需要水和電力才能長大。','點擊開始種植。','Plants need water and power.','Click to grow food.'],
 event:['查看基地附近的情況。','點擊查看事件。','Check conditions near the base.','Click to inspect the event.'],
 pause:['暫停或恢復任務時間。','點擊切換。','Pause or resume mission time.','Click to toggle.'],
 advance:['推進一天，觀察資源變化。','拖曳到 100，放開以推進一天。','Advance one sol and watch supplies.','Drag to 100 and release to advance.'],
 skip:['加速或跳過數天，危機時會停止。','點擊跳過；拖曳切換加速。','Skip ahead; the clock stops at events.','Click to skip; drag for fast time.'],
 shelter:['保護乘員，但需要電力。','先打開安全蓋，再點避難桿。','Protect the crew at a power cost.','Open the safety cover, then click the lever.'],
 continue:['保留電力，乘員可能承受風險。','事件發生時點擊繼續作業。','Save power, but risk crew health.','Click during an event to continue.']};
export class DeviceCallout {
 private readonly group=new THREE.Group();private readonly canvas=document.createElement('canvas');private readonly texture:THREE.CanvasTexture;private readonly sprite:THREE.Sprite;private readonly line:THREE.Line;
 constructor(parent:THREE.Object3D){this.canvas.width=1024;this.canvas.height=448;this.texture=new THREE.CanvasTexture(this.canvas);this.texture.colorSpace=THREE.SRGBColorSpace;this.sprite=new THREE.Sprite(new THREE.SpriteMaterial({map:this.texture,transparent:true,depthTest:false}));this.sprite.scale.set(1.55,.68,1);this.sprite.position.set(.95,.8,.05);this.sprite.renderOrder=20;this.group.add(this.sprite);const geometry=new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0,.15,0),new THREE.Vector3(.27,.5,.02),new THREE.Vector3(.43,.55,.02)]);this.line=new THREE.Line(geometry,new THREE.LineBasicMaterial({color:'#eac775',depthTest:false}));this.line.renderOrder=20;this.group.add(this.line);this.group.visible=false;parent.add(this.group);}
 show(action:Action,lang:Language,position:THREE.Vector3,available:boolean){this.group.position.copy(position);this.group.visible=true;const c=this.canvas.getContext('2d')!;c.clearRect(0,0,1024,448);c.fillStyle='rgba(12,31,33,.95)';c.fillRect(3,3,1018,442);c.strokeStyle='#d7bb79';c.lineWidth=5;c.strokeRect(5,5,1014,438);c.fillStyle='#9fd4be';c.font='bold 46px Arial';c.fillText(t(lang,labels[action]),38,76,930);c.fillStyle='#e8eadc';c.font='36px Arial';const d=copy[action];const info=devices[action];c.fillText(lang==='zh'?info.zh:info.en,38,155,940);c.fillText(d[lang==='zh'?1:3],38,215,940);c.fillStyle=available?'#a9dcb7':'#e6b783';c.font='bold 31px Arial';c.fillText(available?(lang==='zh'?`狀態：可操作 · ${info.range}`:`READY · ${info.range}`):(lang==='zh'?`狀態：尚未就緒 · ${info.range}`:`NOT READY · ${info.range}`),38,290,940);c.fillStyle='#b8cabe';c.font='28px Arial';c.fillText(lang==='zh'?'按 Esc 或點擊空白處返回':'ESC OR CLICK EMPTY SPACE TO RETURN',38,380,940);this.texture.needsUpdate=true;}
 hide(){this.group.visible=false;}
}
