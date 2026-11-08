import { curriculum,extendedCurriculum } from './Curriculum';
import { activities } from './LearningActivities';
import { questionOrder } from './QuestionOrder';
import { lessons, type Journey } from './Journey';
import type { Language } from './language';
import type { MissionState } from './types';
import '../reading.css';

export interface ReadingPanelCallbacks {
  previous: () => void;
  next: () => void;
  answer: (choice:number) => void;
  continueQuiz: () => void;
  close: () => void;
  restart: () => void;
  clue:(index:number,choice:number)=>void;
  planReflection:(field:'reason'|'caution',value:number)=>void;
  prediction:(choice:number)=>void;
  reflection:(choice:number)=>void;
  finishReflection:()=>void;
  reflectionNote:(value:string)=>void;
  repeat:()=>void;
}
/** A second presentation of the same Journey, used when 3D paper is too small.
 * It never owns course state, so closing, resizing or rotating cannot reset it. */
export class ReadingPanel {
  private readonly root:HTMLElement;
  private readonly page:HTMLElement;
  private readonly callbacks:ReadingPanelCallbacks;
  private visible=false;
  private review=0;private mission:MissionState|null=null;
  setMissionState(state:MissionState){this.mission={...state};}
  private lastKey='';
  constructor(callbacks:ReadingPanelCallbacks){
    this.callbacks=callbacks;
    this.root=document.createElement('section');
    this.root.id='reading-panel';this.root.dataset.ui='';
    this.root.setAttribute('aria-label','Learning desk');
    this.root.hidden=true;
    this.page=document.createElement('article');
    this.page.className='reading-paper';
    this.root.append(this.page);
    (document.querySelector('#app')??document.body).append(this.root);
  }
  show(journey:Journey,language:Language){this.visible=true;this.root.hidden=false;this.render(journey,language);}
  hide(){this.visible=false;this.root.hidden=true;}
  dispose(){this.root.remove();}
  private element<K extends keyof HTMLElementTagNameMap>(tag:K,className:string,text?:string){const el=document.createElement(tag);el.className=className;if(text!==undefined)el.textContent=text;return el;}
  private button(label:string,action:()=>void,cls='reading-button'){const b=this.element('button',cls,label);b.type='button';b.addEventListener('click',action);return b;}
  render(journey:Journey,language:Language){
    if(!this.visible)return;
    const zh=language==='zh';
    const lesson=journey.lesson;
    const data=curriculum[lesson.id];
    const key=`${journey.index}:${journey.reading}:${journey.readingPage}:${journey.questionIndex}:${journey.finished}:${this.review}`;
    const scroll=key===this.lastKey?this.page.scrollTop:0;
    this.lastKey=key;
    this.page.replaceChildren();
    const top=this.element('header','reading-header');
    const brand=this.element('div','reading-brand',zh?'NOVA 的太空學習桌':'NOVA’S SPACE STUDY');
    const close=this.button(zh?'返回艙內':'Back to cabin',this.callbacks.close,'reading-close');
    top.append(brand,close);
    this.page.append(top);
    const main=this.element('div','reading-content');
    const eyebrow=this.element('p','reading-eyebrow',journey.finished?(zh?'任務完成':'MISSION COMPLETE'):`${zh?'課程':'LESSON'} ${Math.min(journey.index+1,journey.total)} / ${journey.total}`);
    main.append(eyebrow,this.element('h2','reading-title',journey.finished?(zh?'恭喜，小小太空人！':'Congratulations, Junior Astronaut!'):(zh?lesson.zhTitle:lesson.enTitle)));
    const nav=this.element('nav','reading-navigation');nav.setAttribute('aria-label',zh?'教材與測驗操作':'Study and quiz controls');
    if(journey.finished){
      if(this.review===0){
        main.append(this.element('p','reading-body',zh?'你完成了太空訓練！打開任務紀錄，回顧一起做過的決定。':'You completed your space training! Open the mission log to revisit your decisions.'));
        const seal=this.element('div','reading-certificate',zh?'小小太空人 · 訓練完成':'JUNIOR ASTRONAUT · TRAINING COMPLETE');
        seal.append(this.element('small','reading-note',zh?'遊戲紀念，並非官方證書':'A game souvenir, not an official credential.'));main.append(seal);
      }else{
        const item=lessons[this.review-1];const course=curriculum[item.id];const record=journey.records.find(r=>r.id===item.id);
        main.append(this.element('h3','reading-section-title',`${this.review}/${journey.total} · ${zh?item.zhTitle:item.enTitle}`),this.element('p','reading-body',course.summary[language]));
        const retry=record?.attempts??0, review=Object.values(record?.concepts??{}).filter(v=>v==='review').length;
        main.append(this.element('p','reading-fact',zh?`修正 ${retry} 次 · ${review} 個觀念可以再複習`:`${retry} retries · ${review} concepts to revisit`));
        if(record?.prediction!==undefined)main.append(this.element('p','reading-note',(zh?'操作前的預測：':'Your prediction: ')+activities[item.id].choices[record.prediction][language]));if(record?.reflection!==undefined)main.append(this.element('p','reading-note',(zh?'操作後的理由：':'Your reason: ')+activities[item.id].answers[record.reflection][language]));if(item.id==='plan'&&record?.planReason!==undefined&&record.planCaution!==undefined){const reasons=zh?['考慮日照','考慮可能的冰與觀測','平衡電力和水']:['consider sunlight','consider possible ice and observation','balance power and water'];const cautions=zh?['電力需求','可用水仍需更多證據','地形和通訊條件']:['power needs','usable water needs more evidence','terrain and communications'];main.append(this.element('p','reading-note',zh?`我選這裡，因為${reasons[record.planReason]}；要小心${cautions[record.planCaution]}。`:`I chose it to ${reasons[record.planReason]}; I should watch ${cautions[record.planCaution]}.`));}if(record?.reflectionAttempts)main.append(this.element('p','reading-note',zh?`理由曾重試 ${record.reflectionAttempts} 次。`:`You retried your reason ${record.reflectionAttempts} times.`));if(record?.reflectionNote)main.append(this.element('p','reading-body',record.reflectionNote));if(record?.actions.length)main.append(this.element('p','reading-note',zh?'本課操作已保存在此瀏覽器。':'Actions for this lesson are saved in this browser.'));
      }
      nav.append(this.button(zh?'任務紀錄 →':'Mission log →',()=>{this.review=(this.review+1)%(journey.total+1);this.render(journey,language);},'reading-button reading-primary'),this.button(zh?'重新開始':'Play again',this.callbacks.restart));
    }else if(journey.reading){
      const p=data.pages[journey.readingPage];
      main.append(this.element('p','reading-page-number',`${zh?'教材':'TEXTBOOK'} ${journey.readingPage+1} / ${data.pages.length}`));
      main.append(this.element('h3','reading-section-title',p.title[language]));
      if(journey.readingPage===0&&lesson.id==='finale'&&this.mission){const m=this.mission;main.append(this.element('p','reading-fact',zh?`基地今日狀態（遊戲模擬）：電 ${Math.round(m.power)}、水 ${Math.round(m.water)}、食物 ${Math.round(m.food)}、乘員 ${Math.round(m.health)}。先想想哪一項最需要照顧。`:`Base status (game simulation): power ${Math.round(m.power)}, water ${Math.round(m.water)}, food ${Math.round(m.food)}, crew ${Math.round(m.health)}. Which needs attention first?`));}if(journey.readingPage===0){const goals=this.element('aside','reading-goals');goals.append(this.element('p','',`${zh?'學習目標':'Goal'} · ${data.objective[language]}`),this.element('p','',`${zh?'先備知識':'Before you begin'} · ${data.prerequisite[language]}`));main.append(goals);}
      main.append(this.element('p','reading-body',p.body[language]));
      if(lesson.id==='plan'&&journey.readingPage===2){const comparison=this.element('aside','reading-key');comparison.append(this.element('strong','',zh?'比較三個候選位置（遊戲模擬）':'Compare three candidate sites (game simulation)'));const lines=zh?['明亮山脊：用電較省；取水較難。','均衡邊緣：用電與取水需求較均衡。','陰影邊緣：模擬觀測加成；用電較多。']:['Sunlit ridge: less power use; harder water access.','Balanced rim: balanced power and water needs.','Shadow edge: simulated science bonus; more power use.'];for(const text of lines)comparison.append(this.element('p','',text));comparison.append(this.element('small','reading-note',zh?'這些數值和取捨是遊戲設定；陰影不保證有可用冰。':'These trade-offs are game rules; shadow does not guarantee usable ice.'));main.append(comparison);}
      if(lesson.id==='signal'&&journey.readingPage===1){const block=this.element('aside','reading-key');block.append(this.element('strong','',zh?'小實驗：距離與訊號時間':'Mini experiment: distance and signal time'),this.element('p','',zh?'選一個距離，看一看訊號路程。時間是示意，不是量測值。':'Choose a distance to watch the signal travel. Times are illustrative, not measurements.'));const status=this.element('p','reading-fact',zh?'等待發送':'Ready to send');const row=this.element('div','reading-navigation');for(const [near,delay] of [[true,700],[false,2100]] as const){const b=this.button(near?(zh?'近一點':'Near'):(zh?'遠一點':'Far'),()=>{status.textContent=zh?'訊號出發了……':'Signal travelling…';window.setTimeout(()=>{if(status.isConnected)status.textContent=zh?'訊號抵達！遠的路需要較久。':'Signal arrived! The longer route took more time.';},delay);});row.append(b);}block.append(row,status);main.append(block);}
      if(lesson.id==='repair'&&journey.readingPage===1){const block=this.element('aside','reading-key');block.append(this.element('strong','',zh?'先查看線索':'Inspect a clue first'),this.element('p','',zh?'假設通訊燈沒有亮。先查看線路標示，再決定連接方式。這是練習情境。':'Suppose the communications light is off. Check the line labels before connecting. This is a practice scenario.'));block.append(this.button(zh?'查看標示':'Inspect labels',()=>this.callbacks.clue(0,0)));if(journey.clueAnswers[0]===0)block.append(this.element('p','reading-fact',zh?'線索：通訊線與天線有關。配對後還需檢查結果。':'Clue: the data line goes to the antenna. Check the result after matching.'));main.append(block);}
      if(lesson.id==='plan'&&journey.readingPage===1){const demo=this.element('aside','reading-key');demo.append(this.element('strong','',zh?'小實驗：移動光源（遊戲示意）':'Mini experiment: move the light (illustration)'));const diagram=this.element('div','light-demo');const sun=this.element('span','light-sun','☀');const panel=this.element('span','light-panel',zh?'太陽能板':'Solar panel');diagram.append(sun,panel);const slider=document.createElement('input');slider.type='range';slider.min='0';slider.max='100';slider.value='75';slider.setAttribute('aria-label',zh?'移動示意光源':'Move the illustrated light');const text=this.element('p','',zh?'較多光照：面板可發電':'More light: the panel can generate power');slider.addEventListener('input',()=>{const v=Number(slider.value);sun.style.left=`${v}%`;text.textContent=v<30?(zh?'示意：被遮住的面板發電較少。':'Illustration: a shaded panel produces less power.'):(zh?'示意：光照較多，面板可以發電。':'Illustration: more light can power the panel.');});sun.style.left='75%';demo.append(diagram,slider,text);main.append(demo);}
      if(lesson.id==='explore'&&journey.readingPage===1){const block=this.element('aside','reading-key');block.append(this.element('strong','',zh?'先分辨：看見，還是猜想？':'First classify: observed or inferred?'));const statements=zh?['圖上有一塊暗區。','暗區一定有冰。']:['There is a dark area on the map.','The dark area definitely has ice.'];statements.forEach((line,i)=>{block.append(this.element('p','',line));const row=this.element('div','reading-navigation');[zh?'看見的':'Observed',zh?'猜想的':'Inferred'].forEach((label,n)=>{const b=this.button(label,()=>this.callbacks.clue(i,n));b.setAttribute('aria-pressed',String(journey.clueAnswers[i]===n));if(journey.clueAnswers[i]===n)b.classList.add('reading-primary');row.append(b);});block.append(row);});if(journey.clueAnswers.length){const good=journey.clueAnswers[0]===0&&journey.clueAnswers[1]===1;block.append(this.element('p','reading-note',good?(zh?'對！暗區是觀察，有冰需要更多證據。':'Yes! The dark area is observed; ice needs more evidence.'):(zh?'再想想：哪一句是影像直接顯示的？':'Try again: which statement is directly visible?')));}main.append(block);}
      if(journey.readingPage===2){const a=activities[lesson.id];main.append(this.element('h3','reading-section-title',a.predict[language]));const choices=this.element('div','reading-choices');a.choices.forEach((choice,i)=>{const b=this.button(choice[language],()=>this.callbacks.prediction(i),`reading-choice${journey.prediction===i?' selected':''}`);b.setAttribute('aria-pressed',String(journey.prediction===i));choices.append(b);});main.append(choices);}
      const more=document.createElement('details');more.className='reading-key';const caption=document.createElement('summary');caption.textContent=zh?'想知道更多':'Want to know more?';more.append(caption);for(const extra of extendedCurriculum[lesson.id]){more.append(this.element('strong','',extra.title[language]),this.element('p','',extra.body[language]));}main.append(more);
      const note=this.element('aside','reading-key');note.append(this.element('strong','',zh?'重要觀念':'KEY IDEA'),this.element('p','',p.emphasis[language]));main.append(note);
      if(p.illustration==='moon'){
        const figure=this.element('figure','reading-figure');const img=document.createElement('img');img.src='/data/lro-south-pole.jpg';img.alt=zh?'NASA 月球南極日照圖':'NASA lunar south pole illumination map';figure.append(img,this.element('figcaption','',zh?'NASA／GSFC／ASU 月球南極日照圖；亮暗代表日照條件，不是水量。':'NASA / GSFC / ASU lunar south-pole illumination map; brightness shows illumination, not water.'));main.append(figure);
      }
      if(journey.readingPage>0)nav.append(this.button(zh?'← 上一頁':'← Previous',this.callbacks.previous));
      nav.append(this.button(zh?'再聽一次':'Hear NOVA again',this.callbacks.repeat));const next=this.button(journey.readingPage<2?(zh?'我知道了 →':'I understand →'):(zh?'開始操作 →':'Start activity →'),this.callbacks.next,'reading-button reading-primary');next.disabled=(journey.readingPage===2&&journey.prediction===null)||(lesson.id==='explore'&&journey.readingPage===1&&(journey.clueAnswers[0]!==0||journey.clueAnswers[1]!==1))||(lesson.id==='repair'&&journey.readingPage===1&&journey.clueAnswers[0]!==0);nav.append(next);
    }else if(journey.reflectionPending){const a=activities[lesson.id];main.append(this.element('p','reading-page-number',zh?'完成後回想 · 4 / 4':'REFLECT AFTER TRYING · 4 / 4'),this.element('h3','reading-question',a.reflect[language]));if(lesson.id==='plan'){const action=journey.records.find(r=>r.id===lesson.id)?.actions.find(v=>v.startsWith('plan:'));if(action){const v=Number(action.split(':')[1]);main.append(this.element('p','reading-fact',zh?`你選擇：${v<1/3?'明亮山脊：較省電、取水較難':v>2/3?'陰影邊緣：模擬觀測加成、用電較多':'均衡邊緣：電與水較均衡'}。以下取捨是遊戲模擬。`:`Your selected site: ${v<1/3?'sunlit ridge: less power, harder water access':v>2/3?'shadow edge: simulated science bonus, more power':'balanced rim: balanced power and water'}. These trade-offs are simulated.`));}}if(lesson.id==='plan'){const form=this.element('div','reading-key');const fields=[{id:'reason' as const,label:zh?'我選這裡，因為……':'I chose this site because…',value:journey.planReason,options:zh?['考慮日照','考慮可能的冰與觀測','平衡電力和水']:['I considered sunlight','I considered possible ice and observation','I balanced power and water']},{id:'caution' as const,label:zh?'要小心……':'I should watch…',value:journey.planCaution,options:zh?['電力需求','可用水仍需更多證據','地形和通訊條件']:['Power needs','Usable water needs more evidence','Terrain and communications'] }];for(const field of fields){const label=document.createElement('label');label.textContent=field.label;const select=document.createElement('select');select.setAttribute('aria-label',field.label);const placeholder=document.createElement('option');placeholder.value='';placeholder.textContent=zh?'請選擇':'Choose one';select.append(placeholder);field.options.forEach((text,i)=>{const option=document.createElement('option');option.value=String(i);option.textContent=text;select.append(option);});select.value=field.value===null?'':String(field.value);select.addEventListener('change',()=>{if(select.value!=='')this.callbacks.planReflection(field.id,Number(select.value));});label.append(select);form.append(label);}main.append(form);}const choices=this.element('div','reading-choices');a.answers.forEach((choice,i)=>{const b=this.button(choice[language],()=>this.callbacks.reflection(i),`reading-choice${journey.reflectionChoice===i?' selected':''}`);b.setAttribute('aria-pressed',String(journey.reflectionChoice===i));choices.append(b);});main.append(choices);if(journey.reflectionChoice!==null){const note=this.element('aside','reading-explanation');note.append(this.element('p','',a.explain[journey.reflectionChoice][language]));main.append(note);}const label=this.element('label','reading-body',lesson.id==='finale'?(zh?'你做了什麼選擇？你看到什麼證據？（選填，保存在此瀏覽器）':'What did you choose, and what evidence did you see? (Optional; saved in this browser)'):(zh?'想多說一點？（選填，保存在此瀏覽器）':'Want to say more? (Optional; saved in this browser)'));const field=document.createElement('textarea');field.maxLength=500;field.rows=2;field.value=journey.records.find(r=>r.id===lesson.id)?.reflectionNote??'';field.addEventListener('change',()=>this.callbacks.reflectionNote(field.value));label.append(field);main.append(label);const proceed=this.button(zh?'繼續測驗 →':'Continue to questions →',this.callbacks.finishReflection,'reading-button reading-primary');proceed.disabled=journey.reflectionChoice!==a.correct||(lesson.id==='plan'&&(journey.planReason===null||journey.planCaution===null));nav.append(proceed);
    }else if(journey.awaiting){
      const q=journey.question;
      const types=zh?{concept:'概念理解',application:'實際應用',judgment:'情境判斷'}:{concept:'CONCEPT',application:'APPLICATION',judgment:'JUDGMENT'};
      main.append(this.element('p','reading-page-number',`${zh?'問題':'QUESTION'} ${journey.questionIndex+1} / ${data.questions.length} · ${types[q.category]}`));
      main.append(this.element('h3','reading-question',q.prompt[language]));
      if(q.interaction==='image'&&journey.lesson.id==='explore'){
        const figure=this.element('figure','reading-figure');const img=document.createElement('img');img.src='/data/lro-south-pole.jpg';img.alt=zh?'NASA 月球南極日照圖':'NASA lunar south pole illumination map';figure.append(img,this.element('figcaption','',zh?'NASA／GSFC／ASU · LRO 日照影像':'NASA / GSFC / ASU · LRO illumination image'));main.append(figure);
      }
      const choices=this.element('div','reading-choices');choices.setAttribute('role','group');choices.setAttribute('aria-label',zh?'答案':'Answers');
      questionOrder(q.id).forEach((i,displayIndex)=>{const answer=q.answers[i];const chosen=journey.lastChoice===i;const b=this.button(`${String.fromCharCode(65+displayIndex)}. ${answer[language]}`,()=>this.callbacks.answer(i),`reading-choice${chosen?' selected':''}`);b.disabled=journey.feedbackChoice!==null;b.setAttribute('aria-pressed',String(chosen));choices.append(b);});main.append(choices);
      if(journey.lastChoice!==null){const explanation=this.element('aside',`reading-explanation ${journey.feedbackChoice!==null?'correct':'retry'}`);explanation.setAttribute('role','status');explanation.append(this.element('strong','',journey.feedbackChoice!==null?(zh?'一起看看原因':'Let’s see why'):(zh?'再想一想':'Let’s try again')),this.element('p','',q.explanations[journey.lastChoice][language]));main.append(explanation);}
      if(journey.feedbackChoice!==null)nav.append(this.button(zh?'繼續 →':'Continue →',this.callbacks.continueQuiz,'reading-button reading-primary'));
    }else{
      main.append(this.element('p','reading-body',zh?'教材看完了！回到控制艙，跟著 NOVA 一起操作。':'You finished reading. Return to the cabin and try the activity with NOVA.'));
      nav.append(this.button(zh?'返回控制艙':'Return to cabin',this.callbacks.close,'reading-button reading-primary'));
    }
    this.page.append(main,nav);this.page.scrollTop=scroll;
  }
}
