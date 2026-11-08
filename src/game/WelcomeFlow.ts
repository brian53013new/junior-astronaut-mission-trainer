import type { Language } from './language';
import '../welcome.css';

/** A short, optional-to-replay practice. It never changes the mission simulation. */
export class WelcomeFlow {
 private readonly root=document.createElement('section');
 private readonly controller=new AbortController();
 private language:Language='zh';
 private step:0|1|2|3|4=0;
 private active=false;
 private previousFocus:HTMLElement|null=null;
 private static readonly storageKey='outpost-welcome-v1';
 constructor(private readonly callbacks:{onSpeak:(text:string)=>void;onComplete:()=>void}){
  this.root.id='welcome-flow';this.root.dataset.ui='';this.root.hidden=true;
  this.root.setAttribute('role','dialog');this.root.setAttribute('aria-modal','true');
  document.querySelector('#app')?.append(this.root);
  const opts={signal:this.controller.signal};
  for(const type of ['pointerdown','pointerup','pointermove','pointercancel','click','wheel'] as const)this.root.addEventListener(type,e=>e.stopPropagation(),opts);
  this.root.addEventListener('keydown',e=>{e.stopPropagation();if(e.key!=='Tab')return;const controls=[...this.root.querySelectorAll<HTMLButtonElement>('button:not([disabled])')];if(!controls.length)return;const first=controls[0],last=controls[controls.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}},opts);
 }
 static completed(){try{return localStorage.getItem(WelcomeFlow.storageKey)==='done';}catch{return false;}}
 start(language:Language){this.language=language;this.step=0;this.active=true;this.previousFocus=document.activeElement instanceof HTMLElement?document.activeElement:null;this.root.hidden=false;this.render(true);}
 setLanguage(language:Language){this.language=language;if(this.active)this.render(false);}
 dispose(){this.controller.abort();this.root.remove();this.active=false;}
 private say(){const z=this.language==='zh';const lines=z?[
  '嗨！我是 NOVA。我們要一起幫月球基地準備任務；我會陪你一步步練習。',
  '先練習看看！請點亮起的設備模型，看看它會做什麼。',
  '你找到了！這是練習用的設備畫面。現在請按返回。',
  '太好了！再打開訓練筆記，看看我們接下來的旅程。',
  '這是我們的任務地圖。六堂課和最後挑戰都完成後，就可以回顧旅程！'
 ]:[
  'Hi! I am NOVA. We will prepare a mission for our Moon base together, one step at a time.',
  'Let’s practice! Select the glowing practice device and see what it does.',
  'You found it! This is a practice device view. Now select Back.',
  'Nice work! Open the training book to see our journey.',
  'Here is our mission map. Finish six lessons and a final challenge, then review your journey!'
 ];this.callbacks.onSpeak(lines[this.step]);}
 private transition(step:0|1|2|3|4){this.step=step;this.render(true);}
 private button(label:string,handler:()=>void,style='welcome-button'){const button=document.createElement('button');button.type='button';button.className=style;button.textContent=label;button.addEventListener('click',handler,{signal:this.controller.signal});return button;}
 private finish(){if(!this.active)return;try{localStorage.setItem(WelcomeFlow.storageKey,'done');}catch{/* The session can proceed without local storage. */}this.active=false;this.root.hidden=true;this.root.replaceChildren();this.callbacks.onComplete();if(this.previousFocus?.isConnected)this.previousFocus.focus();}
 private render(speak:boolean){
  if(!this.active)return;
  const z=this.language==='zh';this.root.setAttribute('aria-label',z?'NOVA 的開始練習':'NOVA’s welcome practice');this.root.replaceChildren();
  const card=document.createElement('div');card.className='welcome-card';
  const header=document.createElement('header');header.className='welcome-header';
  const brand=document.createElement('span');brand.className='welcome-brand';brand.textContent='NOVA / TRAINING';
  const progress=document.createElement('span');progress.className='welcome-progress';progress.textContent=`${Math.min(this.step+1,5)} / 5`;
  header.append(brand,progress);card.append(header);
  const body=document.createElement('div');body.className='welcome-body';
  const avatar=document.createElement('div');avatar.className='welcome-avatar';avatar.setAttribute('aria-hidden','true');avatar.innerHTML='<i></i><i></i><b></b>';
  const text=document.createElement('div');text.className='welcome-copy';
  const h=document.createElement('h2'),p=document.createElement('p');
  const title=z?['嗨，我是 NOVA！','來試一次','這是設備特寫','打開訓練筆記','我們的任務地圖']:['Hi, I’m NOVA!','Let’s practice','Device close-up','Open the training book','Our mission map'];
  const detail=z?[
   '我們要一起幫月球基地準備任務。我會陪你一步步練習，學會像科學家一樣觀察和思考。',
   '先練習點選發亮的設備。這裡是練習畫面，不會消耗基地資源。',
   '選中設備後，可以看到它的名稱、用途與操作方式。現在按返回。',
   '訓練筆記會保存課程、問題和我們的進度。點書本繼續。',
   '我們會完成六堂課，再挑戰最後任務。準備好了，就開始閱讀第一課。'
  ]:[
   'We will prepare a mission for our lunar base together. I’ll help you practice observing and thinking like a scientist.',
   'Select the glowing device. This practice screen does not use base supplies.',
   'A selected device shows its name, purpose and controls. Select Back now.',
   'The training book keeps our lessons, questions and progress. Select the book to continue.',
   'We will complete six lessons and a final challenge. When you are ready, open the first lesson.'
  ];h.textContent=title[this.step];p.textContent=detail[this.step];text.append(h,p);body.append(avatar,text);card.append(body);
  const stage=document.createElement('div');stage.className='welcome-stage';
  if(this.step===0)stage.append(this.button(z?'一起開始 →':'Let’s begin →',()=>this.transition(1),'welcome-button welcome-primary'));
  if(this.step===1){const device=this.button(z?'✦ 練習設備':'✦ PRACTICE DEVICE',()=>this.transition(2),'welcome-device');device.setAttribute('aria-label',z?'選取發亮的練習設備':'Select the highlighted practice device');stage.append(device);}
  if(this.step===2){const sample=document.createElement('div');sample.className='welcome-sample';const name=document.createElement('strong');name.textContent=z?'練習設備':'Practice device';const d=document.createElement('p');d.textContent=z?'這是示範畫面。真正的設備會說明作用與目前狀態。':'This is a demonstration. Real devices show their purpose and current state.';sample.append(name,d);stage.append(sample,this.button(z?'← 返回':'← Back',()=>this.transition(3),'welcome-button welcome-primary'));}
  if(this.step===3)stage.append(this.button(z?'📖 打開訓練筆記':'📖 OPEN TRAINING BOOK',()=>this.transition(4),'welcome-book'));
  if(this.step===4){const list=document.createElement('ol');list.className='welcome-map';const names=z?['認識設備','選擇基地','飛行與軌道','太空通訊','科學觀測','設備維修','最終挑戰']:['Equipment','Choose a base','Flight & orbit','Space radio','Science','Repair','Final mission'];for(const name of names){const li=document.createElement('li');li.textContent=name;list.append(li);}stage.append(list,this.button(z?'開始第一課 →':'OPEN LESSON ONE →',()=>this.finish(),'welcome-button welcome-primary'));}
  card.append(stage);const footer=document.createElement('footer');footer.className='welcome-footer';footer.append(this.button(z?'再聽一次':'REPLAY NOVA',()=>this.say(),'welcome-button welcome-quiet'));if(this.step<4)footer.append(this.button(z?'跳過練習':'SKIP PRACTICE',()=>this.transition(4),'welcome-button welcome-quiet'));card.append(footer);this.root.append(card);if(speak)this.say();requestAnimationFrame(()=>this.root.querySelector<HTMLButtonElement>('.welcome-stage button')?.focus());
 }
}
