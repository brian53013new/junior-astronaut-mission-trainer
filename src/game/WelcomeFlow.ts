import type { Language } from './language';
import '../welcome.css';

const stepCopy=[
 {zhTitle:'你好，我是 NOVA！',enTitle:'Hi, I’m NOVA!',zh:'我們要一起照顧月球基地。先試著移動或轉動視角，看看訓練室。方向鍵、WASD 或觸控移動都可以。',en:'We will care for a lunar base together. Move or turn your view to look around the training room. Use arrow keys, WASD or touch controls.'},
 {zhTitle:'尋找目標',enTitle:'Find a target',zh:'觀察哪一件設備正在發光。引導標記會帶你找到真正的 3D 目標；只要輕點，不必快速滑動。',en:'Look for the glowing device. The guide marks its real 3D position. Tap gently; you do not need to swipe quickly.'},
 {zhTitle:'選取與特寫',enTitle:'Select and inspect',zh:'輕點發亮的設備選取它，再依提示按一下進入特寫。點空白處或按返回，回到工作區。',en:'Tap the highlighted device to select it, then follow the prompt to inspect it. Tap empty space or Back to return.'},
 {zhTitle:'實際拖動旋鈕',enTitle:'Drag a control',zh:'按住旋鈕並拖動，觀察數值連續改變；放開手指會結束操作。操作設備時，相機不會跟著轉。',en:'Press and drag the dial to change its value continuously. Releasing ends the gesture. The camera stays still while you operate.'},
 {zhTitle:'試試開關',enTitle:'Try a switch',zh:'找到開關並切換狀態。真正的按壓按鈕用點擊，旋鈕、滑桿和零件則依機械方式拖動。',en:'Find the switch and change its state. Press buttons with a tap; drag knobs, sliders and parts according to their mechanism.'},
 {zhTitle:'打開教材',enTitle:'Open the study book',zh:'打開訓練筆記，閱讀後使用上一頁／下一頁。使用雙指縮放鏡頭，也可從設定把文字放大；Esc 或返回回到艙內。',en:'Open the training book and use Previous / Next. Pinch to zoom the camera, or enlarge text in Settings. Escape or Back returns to the cabin.'},
 {zhTitle:'準備出發',enTitle:'Ready to depart',zh:'找到艙門就能進入訓練艙。你可以隨時切回 3D 迎賓室；完成後會接續原有課程進度。',en:'Find the hatch to enter the control cabin. You can switch back to the 3D welcome room at any time; your lesson progress stays the same.'}
] as const;

/** Accessible text alternative to WelcomeRoom, sharing its persisted 0–6 step. */
export class WelcomeFlow {
 private readonly root=document.createElement('section');
 private readonly controller=new AbortController();
 private language:Language='zh';
 private step=0;
 private active=false;
 private previousFocus:HTMLElement|null=null;
 constructor(private readonly callbacks:{onSpeak:(text:string)=>void;onStep:(step:number)=>void;onComplete:()=>void;onBack:(step:number)=>void}){
  this.root.id='welcome-flow';this.root.dataset.ui='';this.root.hidden=true;this.root.setAttribute('role','dialog');this.root.setAttribute('aria-modal','true');
  document.querySelector('#app')?.append(this.root);
  const opts={signal:this.controller.signal};
  for(const type of ['pointerdown','pointerup','pointermove','pointercancel','click','wheel'] as const)this.root.addEventListener(type,e=>e.stopPropagation(),opts);
  this.root.addEventListener('keydown',e=>{e.stopPropagation();if(e.key==='Escape'){e.preventDefault();this.returnTo3D();return;}if(e.key!=='Tab')return;const controls=[...this.root.querySelectorAll<HTMLButtonElement>('button:not([disabled])')];if(!controls.length)return;const first=controls[0],last=controls[controls.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}},opts);
 }
 start(language:Language,step=0){this.language=language;this.step=Math.max(0,Math.min(6,Math.trunc(step)));this.active=true;this.previousFocus=document.activeElement instanceof HTMLElement?document.activeElement:null;this.root.hidden=false;this.render(true);}
 setLanguage(language:Language){this.language=language;if(this.active)this.render(false);}
 dispose(){this.controller.abort();this.root.remove();this.active=false;}
 private button(label:string,handler:()=>void,cls='welcome-button'){const button=document.createElement('button');button.type='button';button.className=cls;button.textContent=label;button.addEventListener('click',handler,{signal:this.controller.signal});return button;}
 private next(){if(this.step<6){this.step++;this.callbacks.onStep(this.step);this.render(true);}else this.finish();}
 private skipStep(){if(this.step<6){this.step++;this.callbacks.onStep(this.step);this.render(true);}else this.finish();}
 private returnTo3D(){if(!this.active)return;this.active=false;this.root.hidden=true;this.callbacks.onBack(this.step);}
 private finish(){if(!this.active)return;this.active=false;this.root.hidden=true;this.root.replaceChildren();this.callbacks.onStep(6);this.callbacks.onComplete();if(this.previousFocus?.isConnected)this.previousFocus.focus();}
 private render(speak:boolean){if(!this.active)return;const z=this.language==='zh',copy=stepCopy[this.step];this.root.setAttribute('aria-label',z?'NOVA 的文字版迎賓教學':'NOVA’s text welcome tutorial');this.root.replaceChildren();const card=document.createElement('div');card.className='welcome-card';const header=document.createElement('header');header.className='welcome-header';const brand=document.createElement('span');brand.className='welcome-brand';brand.textContent='NOVA / TRAINING';const progress=document.createElement('span');progress.className='welcome-progress';progress.textContent=`${this.step+1} / 7`;header.append(brand,progress);card.append(header);const body=document.createElement('div');body.className='welcome-body';const avatar=document.createElement('div');avatar.className='welcome-avatar';avatar.setAttribute('aria-hidden','true');avatar.innerHTML='<i></i><i></i><b></b>';const text=document.createElement('div');text.className='welcome-copy';const title=document.createElement('h2');title.textContent=z?copy.zhTitle:copy.enTitle;const detail=document.createElement('p');detail.textContent=z?copy.zh:copy.en;text.append(title,detail);body.append(avatar,text);card.append(body);const stage=document.createElement('div');stage.className='welcome-stage';stage.append(this.button(this.step===6?(z?'進入訓練艙 →':'ENTER THE CABIN →'):(z?'下一步 →':'NEXT →'),()=>this.next(),'welcome-button welcome-primary'));const footer=document.createElement('footer');footer.className='welcome-footer';footer.append(this.button(z?'返回 3D 迎賓室':'Return to 3D welcome room',()=>this.returnTo3D(),'welcome-button welcome-quiet'));if(this.step<6)footer.append(this.button(z?'略過這一步':'Skip this step',()=>this.skipStep(),'welcome-button welcome-quiet'));card.append(stage,footer);this.root.append(card);if(speak)this.callbacks.onSpeak(z?copy.zh:copy.en);requestAnimationFrame(()=>this.root.querySelector<HTMLButtonElement>('.welcome-stage button')?.focus());}
}
