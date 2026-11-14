import { compareGravityWeight, getDataProvenance, getLunarSiteCandidates, getStoredNASAImages, type LoadedMissionData } from './NASADataProvider';
import type { MissionState } from './types';

type RoundId='assembly'|'plan'|'flight'|'signal'|'explore'|'repair'|'finale';
type EvidenceId='craft-reference'|'lola'|'gravity'|'donki'|'images-api'|'bvad'|'moonbase-reference';
type BoardState={round:number;completed:RoundId[];site:string;mass:number;powerPriority:number;priority:'science'|'crew';observation:'observe'|'infer'|'need'|'';choices:string[];attached:Partial<Record<RoundId,EvidenceId>>;records:Array<{round:string;action:string;result:string;at:string;source?:string}>;certificate:boolean};
type Round={id:RoundId;title:[string,string];hook:[string,string];action:[string,string];nova:[string,string];source:string;data:EvidenceId;room?:'assembly'|'comms'|'science'|'repair'};
type Evidence={id:EvidenceId;title:[string,string];tag:[string,string];meta:[string,string];source:[string,string];url:string;for:RoundId[];limit:[string,string]};

const rounds:Round[]=[
 {id:'assembly',title:['01 · 探測器組裝','01 · Probe assembly'],hook:['要讓小幫手看見月球、儲存電力並傳回發現，需要哪些零件？','What lets our helper see the Moon, store power and send discoveries home?'],action:['把航太器系統參考片放到組裝節點，再進工程實驗室親手安裝零件。','Place the spacecraft systems reference tile on Assembly, then fit the parts in the engineering lab.'],nova:['先看看零件怎麼合作，再帶著線索去工作台。','Let’s see how the parts work together, then take the clue to the bench.'],source:'NASA spacecraft systems context',data:'craft-reference',room:'assembly'},
 {id:'plan',title:['02 · 月球基地選址','02 · Lunar site planning'],hook:['選址時，地面高低和平不平會如何影響建造？','How could the height and steepness of the ground affect a base site?'],action:['使用 LOLA 地形資料比較代表點；選點後會更新遊戲中的資料與電力狀態。','Compare LOLA representative points; your choice updates simulated data and power.'],nova:['看座標和相對地形，也記住坡度是我們從稀疏點估算的。','Compare coordinates and relative topography; remember the slope is our estimate from sparse points.'],source:'NASA PDS Geosciences Node · LOLA RDR',data:'lola'},
 {id:'flight',title:['03 · 重力與載荷','03 · Gravity and payload'],hook:['同一個背包在地球和月球，質量相同，重量會一樣嗎？','Does the same backpack weigh the same on Earth and the Moon?'],action:['調整載荷與能源優先順序，比較重量；記錄後會改變模擬電力與安全狀態。','Adjust payload and power priority. Saving changes simulated power and safety.'],nova:['重量 = 質量 × 重力加速度。我們用 1.624 m/s² 做簡化比較。','Weight = mass × gravitational acceleration. We use 1.624 m/s² for a simple comparison.'],source:'NASA Science · Moon by the Numbers',data:'gravity'},
 {id:'signal',title:['04 · 通訊與事件資料','04 · Communications and event context'],hook:['遠方的訊息不會瞬間送到；太空通訊還要先對準天線。','Messages do not travel instantly. A space antenna must also be aimed.'],action:['把 DONKI 快照資料片放到通訊節點，再轉動天線、解碼並傳送訊號。','Place the DONKI snapshot tile, then align the antenna, decode and transmit.'],nova:['事件資料只提供任務背景；遊戲中的訊號效果是模擬規則。','The event is mission context only; signal effects are game rules.'],source:'NASA CCMC DONKI · user-supplied partial snapshot',data:'donki',room:'comms'},
 {id:'explore',title:['05 · 觀察、推論與證據','05 · Observation, inference and evidence'],hook:['看到地面有陰影，可以直接說那裡一定有水冰嗎？','Can a shadow on the ground prove there is water ice?'],action:['放入影像資料片，把陳述分類，再到觀測室調整儀器掃描。','Place the image evidence tile, classify the claim, then scan in the observatory.'],nova:['先分清楚看到了什麼、推論了什麼，還缺少什麼證據。','Separate what you observed, what you infer, and what evidence is still missing.'],source:'NASA Science Photojournal PIA13720 + Images API records',data:'images-api',room:'science'},
 {id:'repair',title:['06 · 維修與生命維持','06 · Repair and life support'],hook:['設備忽明忽暗時，先換零件還是先查供電路徑？','When equipment flickers, replace a part first or trace the power path?'],action:['放入 BVAD 參考資料片，到維修站診斷症狀並修復線路。','Place the BVAD reference tile, then diagnose the fault and repair the circuit.'],nova:['水資料有明確情境；維修成本則是教育抽象。','The water reference has a stated scenario; repair costs are educational abstractions.'],source:'NASA NTRS · BVAD Rev. 2 · NASA ECLSS',data:'bvad',room:'repair'},
 {id:'finale',title:['終章 · 維持月球前哨站','Finale · Sustain the lunar outpost'],hook:['下一次補給前，能源、用水和通訊備援要怎麼取捨？','Before resupply, how will you balance power, water and communications?'],action:['選擇兩項優先工作，看看資源軌改變，再檢視任務紀錄。','Choose two priorities, inspect the changed resource rails and review your record.'],nova:['把一路用過的證據和選擇連起來，完成任務回顧。','Connect the evidence and choices from the journey to finish the debrief.'],source:'NASA Moon Base FAQ · previous-round sources',data:'moonbase-reference'}
];

const evidence:Evidence[]=[
 {id:'craft-reference',title:['航太器系統參考','Spacecraft systems reference'],tag:['REFERENCE','REFERENCE'],meta:['課程背景 · 非遊戲規格','Learning context · not a vehicle spec'],source:['NASA 科學與航太器背景','NASA science and spacecraft context'],url:'https://science.nasa.gov/solar-system/spacecraft/',for:['assembly'],limit:['僅作零件功能背景；本遊戲組裝結果是教育模型。','Context for part functions only; assembly outcomes are educational models.']},
 {id:'lola',title:['LOLA 地形代表點','LOLA topography samples'],tag:['MEASURED + DERIVED','MEASURED + DERIVED'],meta:['使用者提供的 PDS RDR 樣本 · 2010–2011 UTC','User-supplied PDS RDR samples · 2010–2011 UTC'],source:['NASA PDS Geosciences Node','NASA PDS Geosciences Node'],url:'https://pds-geosciences.wustl.edu/missions/lro/lola.htm',for:['plan'],limit:['相對地形為產品欄位；坡度由稀疏點估算，非官方坡度欄或安全評估。','Relative topography is a product field; slope is estimated from sparse points, not an official slope field or safety assessment.']},
 {id:'gravity',title:['月球表面重力','Lunar surface gravity'],tag:['REFERENCE','REFERENCE'],meta:['1.624 m/s² · NASA Science','1.624 m/s² · NASA Science'],source:['NASA Moon by the Numbers','NASA Moon by the Numbers'],url:'https://science.nasa.gov/moon/by-the-numbers/',for:['flight'],limit:['用於重量比較；不是正式飛行或軌道計算。','Used for a weight comparison; not a flight or orbit calculation.']},
 {id:'donki',title:['太空天氣事件快照','Space-weather event snapshot'],tag:['USER SNAPSHOT · PARTIAL','USER SNAPSHOT · PARTIAL'],meta:['使用者提供 · 部分資料 · 非即時','User supplied · partial · not live'],source:['NASA CCMC DONKI','NASA CCMC DONKI'],url:'https://ccmc.gsfc.nasa.gov/tools/DONKI/',for:['signal'],limit:['CME、GST、HSS、IPS 與空 SEP；FLR 未取得。效果不代表輻射劑量或健康風險。','CME, GST, HSS, IPS and empty SEP; FLR unavailable. Effects are not dose or health-risk estimates.']},
 {id:'images-api',title:['月球影像證據','Lunar image evidence'],tag:['SOURCED IMAGE','SOURCED IMAGE'],meta:['五筆使用者提供的 API 結果 + 靜態 PIA13720','Five user-supplied API results + static PIA13720'],source:['NASA Images API / NASA Science Photojournal','NASA Images API / NASA Science Photojournal'],url:'https://images.nasa.gov/',for:['explore'],limit:['PIA13720 是靜態 Photojournal 來源；明暗不是水冰測量。','PIA13720 is a static Photojournal image; brightness is not an ice measurement.']},
 {id:'bvad',title:['BVAD 水用量基準','BVAD water-use reference'],tag:['REFERENCE','REFERENCE'],meta:['Rev. 2 · 表 4-20 · 印刷頁 72','Rev. 2 · Table 4-20 · printed p. 72'],source:['NASA Technical Reports Server','NASA Technical Reports Server'],url:'https://ntrs.nasa.gov/citations/20210024855',for:['repair'],limit:['水基準依文件情境；修理耗用是遊戲化抽象。','Water baseline is scenario-specific; repair costs are game abstractions.']},
 {id:'moonbase-reference',title:['基地系統背景','Moon-base systems context'],tag:['REFERENCE','REFERENCE'],meta:['NASA 公開說明','NASA public reference'],source:['NASA Moon Base FAQ','NASA Moon Base FAQ'],url:'https://www.nasa.gov/moon-base-frequently-asked-questions/',for:['finale'],limit:['遊戲資源與結果不是任務安全建議。','Game resources and outcomes are not mission-safety advice.']}
];

const fresh=():BoardState=>({round:0,completed:[],site:'',mass:20,powerPriority:50,priority:'science',observation:'',choices:[],attached:{},records:[],certificate:false});

export class MissionBoard {
 private state:BoardState=this.restore();
 private open=false;
 private language:'zh'|'en'='zh';
 private events:LoadedMissionData['events']=[];
 private readonly root=document.createElement('section');
 private selectedData:EvidenceId|null=null;
 private dragging:{id:EvidenceId;pointerId:number;x:number;y:number;moved:boolean;element:HTMLElement}|null=null;
 private dropPreview='';
 private message='';
 private suppressClick=false;
 private readonly onPointerDown=(event:PointerEvent)=>this.pointerDown(event);
 private readonly onPointerMove=(event:PointerEvent)=>this.pointerMove(event);
 private readonly onPointerUp=(event:PointerEvent)=>this.pointerUp(event);
 private readonly onPointerCancel=(event:PointerEvent)=>this.cancelPointer(event);
 private readonly onKeyDown=(event:KeyboardEvent)=>this.keyDown(event);

 constructor(
  private launch:(room:NonNullable<Round['room']>)=>void,
  private finished:()=>void,
  private getMissionState:()=>MissionState,
  private applyDecision:(kind:RoundId,values:Record<string,unknown>)=>boolean
 ){
  this.root.id='mission-board';this.root.className='mission-board';this.root.hidden=true;this.root.setAttribute('aria-label','Lunar Mission Table');
  document.getElementById('app')?.append(this.root);
  this.root.addEventListener('pointerdown',this.onPointerDown);this.root.addEventListener('pointermove',this.onPointerMove);this.root.addEventListener('pointerup',this.onPointerUp);this.root.addEventListener('pointercancel',this.onPointerCancel);this.root.addEventListener('keydown',this.onKeyDown);
 }
 private restore():BoardState{
  try{const raw=JSON.parse(localStorage.getItem('outpost-mission-board-v1')||'null') as Partial<BoardState>|null;if(raw&&Array.isArray(raw.completed)&&Number.isInteger(raw.round)){
   const state={...fresh(),...raw,round:Math.max(0,Math.min(rounds.length,Number(raw.round))),attached:{...(raw.attached??{})},records:Array.isArray(raw.records)?raw.records:[]};
   for(const id of state.completed){const r=rounds.find(item=>item.id===id);if(r&&!state.attached[id])state.attached[id]=r.data;}
   return state;
  }}catch{/* damaged board state starts with a clean journey */}
  return fresh();
 }
 private save(){try{localStorage.setItem('outpost-mission-board-v1',JSON.stringify(this.state));}catch{/* browser storage is optional; MissionEngine keeps its own snapshot */}}
 show(language:'zh'|'en'){
  this.language=language;this.open=true;this.root.hidden=false;document.getElementById('mission-board-dock')?.remove();document.body.classList.add('board-mode');this.render();
 }
 hide(showDock=true){
  this.open=false;this.dragging=null;this.dropPreview='';this.root.hidden=true;document.body.classList.remove('board-mode');document.getElementById('mission-board-dock')?.remove();
  if(showDock){const dock=document.createElement('button');dock.id='mission-board-dock';dock.dataset.testid='mission-board-dock';dock.dataset.ui='';dock.className='board-primary';dock.textContent=this.language==='zh'?'任務桌':'Mission table';dock.addEventListener('click',()=>this.show(this.language));document.getElementById('app')?.append(dock);}
 }
 get visible(){return this.open;}
 get current(){return rounds[this.state.round]?.id??'certificate';}
 setData(data:LoadedMissionData){this.events=data.events;if(this.open)this.render();}
 completeRoom(room:NonNullable<Round['room']>,result:string){const round=rounds[this.state.round];if(!round||round.room!==room)return false;return this.complete(round.id,result);}
 private currentRound(){return rounds[this.state.round]??null;}
 private text(pair:[string,string],z=this.language==='zh'){return pair[z?0:1];}
 private status(id:RoundId){const index=rounds.findIndex(r=>r.id===id);if(this.state.completed.includes(id))return'done';if(index>Math.min(this.state.round,5))return'locked';if(index===this.state.round)return this.state.attached[id]===rounds[index].data?'available':'needs-data';return'locked';}
 private attach(dataId:EvidenceId,nodeId:string){
  const current=this.currentRound();if(!current||current.id==='finale'){this.message=this.language==='zh'?'目前沒有需要放置資料的回合。':'There is no evidence drop target in this round.';this.render();return false;}
  if(nodeId!==current.id){this.message=this.language==='zh'?'請把資料片放到目前亮起的任務節點。':'Drop the tile on the currently active mission node.';this.render();return false;}
  if(current.data!==dataId){const tile=evidence.find(item=>item.id===dataId)!;this.message=this.language==='zh'?`「${tile.title[0]}」不能解鎖這個任務，請查看它適用的任務。`:`${tile.title[1]} does not match this task. Check the tile’s compatible mission.`;this.render();return false;}
  this.state.attached[current.id]=dataId;this.selectedData=dataId;this.message=this.language==='zh'?`資料片已放入「${current.title[0]}」。可以開始這回合。`:`Evidence attached to ${current.title[1]}. This round is ready.`;this.save();this.render();return true;
 }
 private complete(id:RoundId,result:string,values:Record<string,unknown>={}){
  if(this.state.completed.includes(id))return false;
  if(id!=='finale'&&this.state.attached[id]!==rounds.find(r=>r.id===id)?.data){this.message=this.language==='zh'?'先把對應資料片放入任務節點。':'Attach the matching evidence tile first.';this.render();return false;}
  if(!this.applyDecision(id,values)){this.message=this.language==='zh'?'目前資源不足或選擇無效，調整後再試。':'Resources are insufficient or the choice is invalid. Adjust and try again.';this.render();return false;}
  this.state.completed.push(id);this.state.records.push({round:id,action:result,result,at:new Date().toISOString(),source:this.state.attached[id]??rounds.find(r=>r.id===id)?.data});
  this.state.round=Math.min(rounds.length,this.state.round+1);this.message=this.language==='zh'?'任務結果已記錄，右側資源狀態已更新。':'Result recorded. Check the updated resource rails.';this.save();this.finished();this.render();return true;
 }
 private pointerDown(event:PointerEvent){const tile=(event.target as HTMLElement).closest<HTMLElement>('.evidence-pick[data-evidence-id]');if(!tile||event.button!==0)return;const id=tile.dataset.evidenceId as EvidenceId;if(!evidence.some(x=>x.id===id))return;this.dragging={id,pointerId:event.pointerId,x:event.clientX,y:event.clientY,moved:false,element:tile};tile.classList.add('dragging');const cancel=this.root.querySelector<HTMLButtonElement>('.cancel-transfer');if(cancel)cancel.hidden=false;try{tile.setPointerCapture(event.pointerId);}catch{/* selection fallback remains available */}}
 private pointerMove(event:PointerEvent){const drag=this.dragging;if(!drag||drag.pointerId!==event.pointerId)return;if(Math.hypot(event.clientX-drag.x,event.clientY-drag.y)>8)drag.moved=true;if(!drag.moved)return;const target=document.elementFromPoint(event.clientX,event.clientY)?.closest<HTMLElement>('[data-drop-node]');this.dropPreview=target?.dataset.dropNode??'';this.root.dataset.dropPreview=this.dropPreview;}
 private pointerUp(event:PointerEvent){const drag=this.dragging;if(!drag||drag.pointerId!==event.pointerId)return;this.dragging=null;drag.element.classList.remove('dragging');const cancel=this.root.querySelector<HTMLButtonElement>('.cancel-transfer');if(cancel)cancel.hidden=true;delete this.root.dataset.dropPreview;if(!drag.moved){this.selectedData=drag.id;return;}this.suppressClick=true;window.setTimeout(()=>{this.suppressClick=false;},0);const target=document.elementFromPoint(event.clientX,event.clientY)?.closest<HTMLElement>('[data-drop-node]');if(target?.dataset.dropNode)this.attach(drag.id,target.dataset.dropNode);else{this.message=this.language==='zh'?'資料片沒有放到任務節點，已取消放置。':'The tile missed the mission node; placement was cancelled.';this.render();}}
 private cancelPointer(event:PointerEvent){const drag=this.dragging;if(!drag||drag.pointerId!==event.pointerId)return;this.dragging=null;drag.element.classList.remove('dragging');const cancel=this.root.querySelector<HTMLButtonElement>('.cancel-transfer');if(cancel)cancel.hidden=true;this.dropPreview='';delete this.root.dataset.dropPreview;this.message=this.language==='zh'?'已取消資料片移動。':'Evidence move cancelled.';this.render();}
 private keyDown(event:KeyboardEvent){if(event.key==='Escape'){if(this.dragging){this.dragging=null;this.dropPreview='';delete this.root.dataset.dropPreview;this.message=this.language==='zh'?'已取消資料片移動。':'Evidence move cancelled.';this.render();}else this.hide();return;}if(event.key!=='ArrowLeft'&&event.key!=='ArrowRight')return;const nodes=[...this.root.querySelectorAll<HTMLButtonElement>('[data-node-id]:not(:disabled)')].filter(node=>node.getClientRects().length>0);const at=nodes.indexOf(document.activeElement as HTMLButtonElement);if(at>=0){event.preventDefault();nodes[(at+(event.key==='ArrowRight'?1:nodes.length-1))%nodes.length]?.focus();}}
 private render(){
  const z=this.language==='zh',t=(pair:[string,string])=>pair[z?0:1],round=this.currentRound(),state=this.getMissionState(),sites=getLunarSiteCandidates().records,images=getStoredNASAImages(),event=this.events.find(item=>item.kind==='nasa-snapshot'||item.kind==='nasa-live');
  this.root.replaceChildren();this.root.removeAttribute('data-drop-preview');
  const shell=document.createElement('div');shell.className='mission-shell';
  const header=document.createElement('header');header.className='mission-header';
  const brand=document.createElement('div');brand.className='mission-brand';brand.innerHTML=`<span class="board-kicker">OUTPOST CONTROL / ${z?'月球任務桌':'LUNAR MISSION TABLE'}</span><h1>${z?'月球前哨站任務桌':'Lunar Mission Table'}</h1>`;
  const system=document.createElement('nav');system.className='board-system';system.setAttribute('aria-label',z?'系統功能':'System controls');
  const sysButton=(label:string,action:()=>void,testid:string)=>{const b=document.createElement('button');b.type='button';b.dataset.ui='';b.dataset.testid=testid;b.textContent=label;b.addEventListener('click',action);system.append(b);};
  sysButton(z?'設定':'Settings',()=>document.dispatchEvent(new CustomEvent('outpost:board-settings')),'board-settings');sysButton(z?'來源':'Sources',()=>document.dispatchEvent(new CustomEvent('outpost:open-sources')),'board-sources');sysButton(z?'教材':'Lessons',()=>{this.hide(false);document.dispatchEvent(new CustomEvent('outpost:open-lessons'));},'board-lessons');
  header.append(brand,system);shell.append(header);
  if(!round){this.renderCertificate(shell,z);this.root.append(shell);return;}
  const top=document.createElement('section');top.className='mission-question';top.setAttribute('aria-labelledby','current-question');
  const eyebrow=document.createElement('p');eyebrow.className='board-eyebrow';eyebrow.dataset.testid='current-round';eyebrow.textContent=round.id==='finale'?(z?'終章 · 綜合任務':'FINALE · INTEGRATED MISSION'):`${z?'回合':'TURN'} ${String(Math.min(this.state.round+1,6)).padStart(2,'0')} / 06 · ${t(round.title)}`;
  const question=document.createElement('h2');question.id='current-question';question.textContent=t(round.hook);question.dataset.testid='mission-question';
  const runtime=document.createElement('span');runtime.className='mission-runtime';runtime.textContent=z?'約 12–18 分鐘':'12–18 min';top.append(eyebrow,question,runtime);shell.append(top);
  const content=document.createElement('div');content.className='mission-layout';
  content.append(this.renderEvidenceTray(z,round));
  content.append(this.renderMap(z,round));
  content.append(this.renderResources(z,state));
  shell.append(content);
  shell.append(this.renderTask(z,round,sites,images,event));
  shell.append(this.renderNOVA(z,round));
  this.root.append(shell);
 }
 private renderEvidenceTray(z:boolean,round:Round){
  const tray=document.createElement('aside');tray.className='evidence-tray';tray.setAttribute('aria-label',z?'資料匣':'Evidence tray');
  const title=document.createElement('h2');title.textContent=z?'資料匣':'Evidence tray';const hint=document.createElement('p');hint.className='tray-hint';hint.textContent=z?'拖曳資料片到目前任務；也可選取後按「放入任務」。':'Drag a tile to the active task, or select one and use “Attach evidence”.';tray.append(title,hint);
  const cards=document.createElement('div');cards.className='evidence-list';cards.dataset.testid='evidence-tray';
  for(const item of evidence){
   const card=document.createElement('article');card.className=`evidence-piece ${this.selectedData===item.id?'selected':''} ${this.state.attached[round.id]===item.id?'attached':''}`;card.dataset.evidenceId=item.id;card.dataset.testid=`evidence-${item.id}`;
   const pick=document.createElement('button');pick.type='button';pick.className='evidence-pick';pick.dataset.evidenceId=item.id;pick.setAttribute('aria-label',`${z?'拖曳或選取資料片':'Drag or select evidence tile'}: ${this.text(item.title,z)}`);pick.innerHTML=`<span class="piece-grip" aria-hidden="true">⠿</span><span class="piece-title"></span><span class="piece-tag"></span><span class="piece-meta"></span>`;
   pick.querySelector('.piece-title')!.textContent=this.text(item.title,z);pick.querySelector('.piece-tag')!.textContent=this.text(item.tag,z);pick.querySelector('.piece-meta')!.textContent=this.text(item.meta,z);pick.addEventListener('click',()=>{if(this.suppressClick)return;this.selectedData=item.id;this.message='';this.render();});
   const detail=document.createElement('details');detail.className='piece-source';const summary=document.createElement('summary');summary.textContent=z?'來源與限制':'Source & limits';const body=document.createElement('div');const link=document.createElement('a');link.href=item.url;link.target='_blank';link.rel='noopener noreferrer';link.textContent=this.text(item.source,z);const note=document.createElement('p');note.textContent=this.text(item.limit,z);body.append(link,note);detail.append(summary,body);card.append(pick,detail);cards.append(card);
  }
  tray.append(cards);
  const attach=document.createElement('button');attach.type='button';attach.className='board-secondary attach-selected';attach.dataset.testid='attach-selected-evidence';attach.textContent=z?'將選取資料片放入目前任務':'Attach selected evidence';attach.disabled=!this.selectedData||round.id==='finale';attach.addEventListener('click',()=>{if(this.selectedData)this.attach(this.selectedData,round.id);});tray.append(attach);
  return tray;
 }
 private renderMap(z:boolean,round:Round){
  const wrap=document.createElement('section');wrap.className='mission-map-wrap';wrap.setAttribute('aria-label',z?'月面任務棋盤':'Lunar mission map');
  const map=document.createElement('div');map.className='mission-map';map.dataset.testid='mission-map';map.dataset.dropNode=round.id;
  const routes=document.createElementNS('http://www.w3.org/2000/svg','svg');routes.classList.add('mission-routes');routes.setAttribute('viewBox','0 0 1000 620');routes.setAttribute('aria-hidden','true');
  const paths=['M500 310 Q320 170 145 115','M500 310 Q500 140 500 110','M500 310 Q700 185 850 160','M500 310 Q720 400 820 470','M500 310 Q500 500 500 525','M500 310 Q295 410 150 425'];for(const d of paths){const path=document.createElementNS('http://www.w3.org/2000/svg','path');path.setAttribute('d',d);routes.append(path);}map.append(routes);
  const base=document.createElement('div');base.className='moon-outpost';base.dataset.testid='moon-outpost';base.innerHTML=`<span aria-hidden="true">⌂</span><b>${z?'月球前哨站':'LUNAR OUTPOST'}</b>`;map.append(base);
  const coords:[[number,number],[number,number],[number,number],[number,number],[number,number],[number,number]]=[[14,18],[50,16],[85,26],[83,76],[50,84],[15,70]];
  rounds.slice(0,6).forEach((item,index)=>{const status=this.status(item.id);const node=document.createElement('button');node.type='button';node.className=`mission-node node-${status}${item.id===round.id?' current':''}`;node.dataset.nodeId=item.id;node.dataset.testid=`mission-node-${item.id}`;node.dataset.dropNode=item.id;node.style.setProperty('--node-x',`${coords[index][0]}%`);node.style.setProperty('--node-y',`${coords[index][1]}%`);node.disabled=false;node.setAttribute('aria-current',item.id===round.id?'step':'false');const statusText=({done:z?'完成':'Complete',locked:z?'鎖定':'Locked',available:z?'可操作':'Ready', 'needs-data':z?'需要資料':'Needs data'} as Record<string,string>)[status];node.innerHTML=`<span class="node-number">${String(index+1).padStart(2,'0')}</span><span class="node-name"></span><span class="node-status"></span>`;node.querySelector('.node-name')!.textContent=this.text(item.title,z);node.querySelector('.node-status')!.textContent=statusText;node.addEventListener('click',()=>{if(item.id!==this.currentRound()?.id){this.message=status==='done'?(z?'這一回合已完成；可在任務紀錄查看。':'This turn is complete; see the mission record.'):(z?'請依序完成前面的任務節點。':'Complete the earlier mission nodes first.');this.render();}});map.append(node);});
  const route=document.createElement('nav');route.className='mobile-route-strip';route.setAttribute('aria-label',z?'六個任務節點':'Six mission nodes');rounds.slice(0,6).forEach((item,index)=>{const b=document.createElement('button');const status=this.status(item.id);b.type='button';b.dataset.nodeId=item.id;b.className=`route-stop node-${status} ${item.id===round.id?'current':''}`;b.disabled=false;b.setAttribute('aria-label',`${String(index+1).padStart(2,'0')} ${this.text(item.title,z)} · ${status}`);b.textContent=String(index+1).padStart(2,'0');b.addEventListener('click',()=>{if(item.id!==round.id){this.message=z?'任務依序展開；先完成目前節點。':'Missions unlock in order. Complete the active node first.';this.render();}});route.append(b);});wrap.append(map,route);
  const note=document.createElement('p');note.className='map-caption';note.textContent=z?'月面路線 · 資料片會連到目前亮起的節點':'Lunar route · evidence tiles connect to the active node';wrap.append(note);return wrap;
 }
 private renderResources(z:boolean,state:MissionState){
  const aside=document.createElement('aside');aside.className='resource-rail';aside.setAttribute('aria-label',z?'基地資源軌':'Outpost resource rails');const title=document.createElement('h2');title.textContent=z?'基地資源':'Outpost resources';aside.append(title);
  const items:[string,string,number][]=[[z?'電力':'Power','power',state.power],[z?'水':'Water','water',state.water],[z?'乘員安全':'Crew safety','health',state.health]];
  for(const [label,id,value] of items){const row=document.createElement('div');row.className='resource-track';row.dataset.testid=`resource-${id}`;const head=document.createElement('div');head.className='resource-head';const name=document.createElement('b');name.textContent=label;const val=document.createElement('span');val.textContent=`${Math.round(value)}%`;head.append(name,val);const track=document.createElement('div');track.className='resource-meter';track.setAttribute('role','meter');track.setAttribute('aria-label',label);track.setAttribute('aria-valuemin','0');track.setAttribute('aria-valuemax','100');track.setAttribute('aria-valuenow',String(Math.round(value)));const fill=document.createElement('i');fill.style.width=`${Math.max(0,Math.min(100,value))}%`;fill.className=`meter-fill meter-${id}`;track.append(fill);row.append(head,track);aside.append(row);}
  const data=document.createElement('div');data.className='resource-data';data.innerHTML=`<span>${z?'已收集資料':'Recorded data'}</span><b>${Math.round(state.data)}</b>`;aside.append(data);
  const progress=document.createElement('div');progress.className='mission-progress';const complete=Math.min(6,this.state.completed.filter(id=>id!=='finale').length);progress.innerHTML=`<b>${z?'六回合進度':'Six-turn progress'}</b><span>${complete} / 6</span>`;aside.append(progress);return aside;
 }
 private renderTask(z:boolean,round:Round,sites:any[],images:any[],event:LoadedMissionData['events'][number]|undefined){
  const panel=document.createElement('section');panel.className='mission-task';panel.dataset.testid='current-task';const title=document.createElement('div');title.className='task-title-row';const eyebrow=document.createElement('p');eyebrow.className='board-eyebrow';eyebrow.textContent=z?'目前任務':'ACTIVE TASK';const heading=document.createElement('h2');heading.textContent=round.id==='finale'? (z?'整合選擇':'Integrated choices'):round.id==='plan'?(z?'比較基地候選點':'Compare candidate base points'):round.id==='flight'?(z?'比較重量與能源':'Compare weight and power'):round.id==='explore'?(z?'分類影像線索':'Classify the image clue'):round.id==='signal'?(z?'完成天線訊號任務':'Complete the antenna signal task'):round.id==='repair'?(z?'診斷生命維持線路':'Diagnose the life-support circuit'):(z?'組裝並測試探測器':'Assemble and test the probe');title.append(eyebrow,heading);panel.append(title);
  const target=document.createElement('div');target.className=`task-drop-zone ${this.state.attached[round.id]===round.data?'has-evidence':''}`;target.dataset.dropNode=round.id;target.dataset.testid='task-evidence-target';target.setAttribute('aria-label',z?'目前任務資料放置區':'Evidence drop target for active mission');
  const tile=evidence.find(item=>item.id===round.data)!;const attached=this.state.attached[round.id]===round.data;
  target.innerHTML=`<span class="drop-symbol" aria-hidden="true">${attached?'✓':'＋'}</span><span class="drop-text"><b></b><small></small></span>`;target.querySelector('b')!.textContent=attached?this.text(['已放入資料片','Evidence attached'],z):this.text(['把相符的資料片拖到此處','Drop the matching evidence tile here'],z);target.querySelector('small')!.textContent=attached?`${this.text(tile.title,z)} · ${this.text(tile.tag,z)}`:this.text(['也可在左側選取資料，再按「放入任務」','Or select a tile in the tray and choose “Attach evidence”.'],z);panel.append(target);
  const description=document.createElement('p');description.className='task-instruction';description.textContent=this.text(round.action,z);panel.append(description);
  if(round.id==='plan')this.renderSiteChoices(panel,z,sites);
  else if(round.id==='flight')this.renderFlightChoices(panel,z);
  else if(round.id==='signal')this.renderSignalChoices(panel,z,event);
  else if(round.id==='explore')this.renderObservationChoices(panel,z,images);
  else if(round.id==='finale')this.renderFinalChoices(panel,z);
  const meta=document.createElement('details');meta.className='task-source';const summary=document.createElement('summary');summary.textContent=z?'目前資料來源與限制':'Source and limits for this turn';const desc=document.createElement('div');desc.className='board-data';this.renderSourceDetails(desc,round,z,sites,images,event);meta.append(summary,desc);panel.append(meta);
  if(round.room&&round.id!=='explore'){
   const roomName=({assembly:z?'工程實驗室':'Engineering lab',comms:z?'通訊工作站':'Communications station',science:z?'觀測室':'Observation room',repair:z?'維修工作站':'Repair station'} as const)[round.room];const go=document.createElement('button');go.type='button';go.className='board-primary task-primary';go.dataset.testid='enter-task-room';go.textContent=`${z?'進入':'Enter'} ${roomName} →`;go.disabled=!attached;go.addEventListener('click',()=>{if(!attached)return;this.hide(false);this.launch(round.room!);});panel.append(go);
  }else if(round.id==='plan'){
   const save=document.createElement('button');save.type='button';save.className='board-primary task-primary';save.dataset.testid='confirm-site';save.textContent=z?'記錄選址與比較結果':'Record site choice';save.disabled=!attached||!this.state.site;save.addEventListener('click',()=>{const candidate=sites.find((s:any)=>s.id===this.state.site);if(!candidate)return;const score=Math.max(0,Math.min(100,100-Math.abs(candidate.topographyRelativeToMeanRadius)/30-candidate.slope*2));this.complete('plan',`Selected ${candidate.name}; educational comparison score ${score.toFixed(0)}`,{score});});panel.append(save);
  }else if(round.id==='flight'){
   const save=document.createElement('button');save.type='button';save.className='board-primary task-primary';save.dataset.testid='save-flight-choice';save.textContent=z?'記錄重量與能源選擇':'Record weight and power choice';save.disabled=!attached;save.addEventListener('click',()=>this.complete('flight',`${this.state.mass} kg; power priority ${this.state.powerPriority}%`,{mass:this.state.mass,priority:this.state.powerPriority/100}));panel.append(save);
  }else if(round.id==='explore'){
   const go=document.createElement('button');go.type='button';go.className='board-primary task-primary';go.dataset.testid='enter-task-room';go.textContent=z?'帶著證據前往 3D 觀測室 →':'Take evidence into the 3D observatory →';go.disabled=!attached||this.state.observation!=='infer';go.addEventListener('click',()=>{if(!attached||this.state.observation!=='infer')return;this.hide(false);this.launch('science');});panel.append(go);
  }else if(round.id==='finale'){
   const save=document.createElement('button');save.type='button';save.className='board-primary task-primary';save.dataset.testid='complete-mission';save.textContent=z?'完成任務並建立學習紀錄':'Complete mission and save learning record';save.disabled=this.state.choices.length<2;save.addEventListener('click',()=>this.complete('finale',`Final priorities: ${this.state.choices.join(', ')}`,{choices:this.state.choices}));panel.append(save);
  }
  if(this.message){const status=document.createElement('p');status.className='mission-status-message';status.setAttribute('role','status');status.textContent=this.message;panel.append(status);}
  return panel;
 }
 private renderSiteChoices(root:HTMLElement,z:boolean,sites:any[]){
  const group=document.createElement('fieldset');group.className='decision-options';const legend=document.createElement('legend');legend.textContent=z?'選擇一個 LOLA 代表點':'Choose a LOLA representative point';group.append(legend);
  for(const site of sites){const b=document.createElement('button');b.type='button';b.className=`site-choice ${this.state.site===site.id?'selected':''}`;b.dataset.testid=`candidate-${site.id.replace('candidate-','').toLowerCase()}`;b.setAttribute('aria-pressed',String(this.state.site===site.id));b.innerHTML=`<b></b><span class="site-values"></span><small></small>`;b.querySelector('b')!.textContent=site.name.replace('LOLA south-pole candidate point ','');b.querySelector('.site-values')!.textContent=`${site.latitude.toFixed(3)}°, ${site.longitude.toFixed(3)}° · ${site.topographyRelativeToMeanRadius} m · ${site.slope.toFixed(1)}°*`;b.querySelector('small')!.textContent=z?'相對地形 · 稀疏點估算坡度':'relative topography · sparse-point slope estimate';b.addEventListener('click',()=>{this.state.site=site.id;this.save();this.message='';this.render();});group.append(b);}
  const note=document.createElement('p');note.className='decision-limit';note.textContent=z?'坡度是衍生估算，不是官方坡度欄；分數是教育模型。':'Slope is derived, not an official field; score is an educational model.';group.append(note);root.append(group);
 }
 private renderFlightChoices(root:HTMLElement,z:boolean){
  const mass=field(z?'載荷質量':'Payload mass',this.state.mass,5,80,5,(v)=>{this.state.mass=v;this.save();this.render();},'flight-mass');root.append(mass);
  const priority=field(z?'能源優先度':'Power priority',this.state.powerPriority,20,90,5,(v)=>{this.state.powerPriority=v;this.save();this.render();},'flight-priority');root.append(priority);
  const w=compareGravityWeight(this.state.mass);const result=document.createElement('p');result.className='gravity-result';result.dataset.testid='gravity-result';result.textContent=`${this.state.mass} kg  ·  Earth ${w.earthWeightN.toFixed(1)} N  /  Moon ${w.lunarWeightN.toFixed(1)} N`;root.append(result);
 }
 private renderSignalChoices(root:HTMLElement,z:boolean,event:LoadedMissionData['events'][number]|undefined){
  const fieldset=document.createElement('fieldset');fieldset.className='decision-options signal-priority';const legend=document.createElement('legend');legend.textContent=z?'選擇優先傳送':'Choose what to send first';fieldset.append(legend);
  for(const [id,label] of [['science',z?'科學觀測資料':'Science observations'],['crew',z?'基地狀態訊息':'Crew status message']] as const){const labelEl=document.createElement('label');labelEl.className='decision-choice';const input=document.createElement('input');input.type='radio';input.name='signal-priority';input.value=id;input.checked=this.state.priority===id;input.addEventListener('change',()=>{this.state.priority=id;this.save();});labelEl.append(input,document.createTextNode(label));fieldset.append(labelEl);}root.append(fieldset);
  const context=document.createElement('p');context.className='event-context';context.dataset.testid='donki-context';context.textContent=event?`${event.eventType??'DONKI'} · ${event.observedAt??event.retrievedAt??''} · ${z?'教育模擬效果':'educational simulation effect'}`:z?'沒有可用事件紀錄；使用清楚標示的教育模擬情境。':'No event record is available; using an educational simulation.';root.append(context);
 }
 private renderObservationChoices(root:HTMLElement,z:boolean,images:any[]){
  const image=images[0];const claim=document.createElement('p');claim.className='observation-claim';claim.textContent=z?'「影像中的暗區證明有水冰」':'“Dark areas in the image prove there is water ice.”';root.append(claim);
  if(image?.thumbnailUrl){const figure=document.createElement('figure');figure.className='board-image-evidence';const img=document.createElement('img');img.src=image.thumbnailUrl;img.alt=image.title;img.loading='lazy';const cap=document.createElement('figcaption');cap.textContent=`${image.nasaId} · ${image.title} · ${image.dateCreated} · NASA Images API`;figure.append(img,cap);root.append(figure);}else{const staticNote=document.createElement('p');staticNote.className='image-fallback';staticNote.textContent=z?'已保存 NASA Images API 搜尋來源；PIA13720 為獨立靜態 Photojournal 圖片。':'Saved NASA Images API records are shown in Sources; PIA13720 is a separate static Photojournal image.';root.append(staticNote);}
  const fieldset=document.createElement('fieldset');fieldset.className='decision-options observation-options';const legend=document.createElement('legend');legend.textContent=z?'這句話屬於哪一類？':'Which category fits this statement?';fieldset.append(legend);
  for(const [id,label] of [['observe',z?'看見的證據':'Observed evidence'],['infer',z?'推論':'Inference'],['need',z?'仍需的資料':'More evidence needed']] as const){const l=document.createElement('label');l.className='decision-choice';const input=document.createElement('input');input.type='radio';input.name='observation-class';input.value=id;input.checked=this.state.observation===id;input.addEventListener('change',()=>{this.state.observation=id;this.message=id==='infer'?(z?'答對了：這是一種推論；單靠陰影仍不能證明有水冰。':'Correct: this is an inference; a shadow alone cannot prove water ice.'):(z?'再想想：陰影是影像線索；「證明有水冰」是推論，還需要其他測量。':'Try again: a shadow is an image clue; “proves ice” is an inference that needs more measurements.');this.save();this.render();});l.append(input,document.createTextNode(label));fieldset.append(l);}root.append(fieldset);
 }
 private renderFinalChoices(root:HTMLElement,z:boolean){
  const fieldset=document.createElement('fieldset');fieldset.className='decision-options finale-options';const legend=document.createElement('legend');legend.textContent=z?'選擇至少兩項基地優先工作':'Choose at least two outpost priorities';fieldset.append(legend);
  for(const [key,label] of [['energy',z?'投入能源維持生命系統':'Reserve power for life support'],['water',z?'優先回收用水':'Prioritize water recovery'],['comms',z?'保留通訊備援':'Keep communications backup']] as const){const l=document.createElement('label');l.className='decision-choice';const input=document.createElement('input');input.type='checkbox';input.checked=this.state.choices.includes(key);input.addEventListener('change',()=>{this.state.choices=input.checked?[...this.state.choices,key]:this.state.choices.filter(x=>x!==key);this.save();this.render();});l.append(input,document.createTextNode(label));fieldset.append(l);}root.append(fieldset);
 }
 private renderSourceDetails(root:HTMLElement,r:Round,z:boolean,sites:any[],images:any[],event:LoadedMissionData['events'][number]|undefined){
  const piece=evidence.find(item=>item.id===r.data)!;const link=document.createElement('a');link.href=piece.url;link.target='_blank';link.rel='noopener noreferrer';link.textContent=z?piece.source[0]:piece.source[1];const note=document.createElement('p');note.textContent=z?piece.limit[0]:piece.limit[1];root.append(link,note);
  if(r.id==='plan')for(const s of sites){const p=document.createElement('p');p.textContent=`${s.id} · ${s.latitude.toFixed(4)}°, ${s.longitude.toFixed(4)}° · ${s.topographyRelativeToMeanRadius} m · ${s.slope.toFixed(2)}°* · ${s.processingLevel}`;root.append(p);}
  if(r.id==='signal'&&event){const p=document.createElement('p');p.textContent=`${event.eventType} · ${event.observedAt??''} · ${event.id} · ${event.sourceUrl??''}`;root.append(p);}
  if(r.id==='explore')for(const image of images.slice(0,5)){const p=document.createElement('p');p.textContent=`${image.nasaId} · ${image.title} · ${image.dateCreated} · ${image.pageUrl}`;root.append(p);}
  if(r.id==='repair'){const p=document.createElement('p');p.textContent=z?'BVAD 水基準為文件情境值；遊戲資源轉換及修理成本為教育抽象。':'BVAD water baseline is scenario-specific; resource conversion and repair cost are educational abstractions.';root.append(p);}
  const status=getDataProvenance();const provenance=document.createElement('small');provenance.className='provenance-stamp';provenance.textContent=r.id==='signal'?`DONKI · ${status.donki.status}`:r.id==='explore'?`NASA Images API · ${images.length} saved results`:r.id==='plan'?`LOLA · ${status.lunar.verificationStatus??'user-supplied samples'}`:r.id==='flight'?`Gravity reference · ${status.flightPhysics?.retrievedAtUTC??'NASA Science'}`:r.id==='repair'?`BVAD · ${status.lifeSupport?.retrievedAtUTC??'NASA NTRS'}`:z?'資料狀態詳見來源卡':'See source cards for provenance';root.append(provenance);
 }
 private renderNOVA(z:boolean,round:Round){
  const footer=document.createElement('footer');footer.className='mission-coach';const icon=document.createElement('span');icon.className='nova-mark';icon.setAttribute('aria-hidden','true');icon.textContent='N';const label=document.createElement('b');label.textContent='NOVA';const copy=document.createElement('p');copy.textContent=round.id==='finale'? (z?'先選至少兩項，再檢查資源軌的變化。':'Choose at least two priorities, then check the resource rails.'):this.state.attached[round.id]===round.data?(z?round.nova[0]:round.nova[1]):z?'先把相符的資料片放到亮起的任務節點。':'Place the matching evidence tile on the active node.';const status=document.createElement('span');status.className='mission-live-status';status.setAttribute('aria-live','polite');status.textContent=this.message;const cancel=document.createElement('button');cancel.type='button';cancel.className='board-secondary cancel-transfer';cancel.textContent=z?'取消放置':'Cancel move';cancel.hidden=!this.dragging;cancel.addEventListener('click',()=>{this.dragging=null;this.dropPreview='';delete this.root.dataset.dropPreview;this.message=z?'已取消資料片移動。':'Evidence move cancelled.';this.render();});const exit=document.createElement('button');exit.type='button';exit.className='board-quiet cabin-return';exit.textContent=z?'返回控制艙':'Return to cabin';exit.addEventListener('click',()=>this.hide());footer.append(icon,label,copy,status,cancel,exit);return footer;
 }
 private renderCertificate(root:HTMLElement,z:boolean){
  const card=document.createElement('section');card.className='board-certificate';card.dataset.testid='mission-certificate';const badge=document.createElement('p');badge.className='board-eyebrow';badge.textContent=z?'任務完成':'MISSION COMPLETE';const title=document.createElement('h2');title.dataset.testid='mission-record-title';title.textContent=z?'月球前哨站訓練紀錄':'Lunar Outpost Training Record';const intro=document.createElement('p');intro.textContent=z?'六個任務回合與終章選擇已保存在這台裝置。':'Six mission turns and the finale choices are saved in this browser.';card.append(badge,title,intro);
  const list=document.createElement('ol');for(const record of this.state.records){const li=document.createElement('li');li.textContent=`${record.round}: ${record.result}`;list.append(li);}card.append(list);
  const limitation=document.createElement('p');limitation.textContent=z?'這是雙語教育模擬；NASA 資料、教育抽象和來源限制在各資料片中分開標示。':'This is a bilingual educational simulation. NASA data, game mappings and source limits are identified on evidence tiles.';card.append(limitation);
  const certificate=document.createElement('button');certificate.type='button';certificate.className='board-primary';certificate.dataset.testid='view-certificate';certificate.textContent=z?'查看結業證書':'View certificate';certificate.addEventListener('click',()=>{this.state.certificate=true;this.save();title.textContent=z?'小小太空人結業證書':'Junior Astronaut Certificate';badge.textContent=z?'任務結業證書':'TRAINING CERTIFICATE';certificate.disabled=true;});
  const returnButton=document.createElement('button');returnButton.type='button';returnButton.className='board-quiet';returnButton.textContent=z?'重新開始任務桌':'Restart mission table';returnButton.addEventListener('click',()=>{this.state=fresh();this.selectedData=null;this.message='';this.save();this.render();});card.append(certificate,returnButton);root.append(card);
 }
 dispose(){this.root.removeEventListener('pointerdown',this.onPointerDown);this.root.removeEventListener('pointermove',this.onPointerMove);this.root.removeEventListener('pointerup',this.onPointerUp);this.root.removeEventListener('pointercancel',this.onPointerCancel);this.root.removeEventListener('keydown',this.onKeyDown);this.root.remove();}
}

function field(label:string,value:number,min:number,max:number,step:number,onChange:(value:number)=>void,testid:string){
 const wrap=document.createElement('label');wrap.className='board-slider';wrap.dataset.testid=`${testid}-field`;const title=document.createElement('span');title.textContent=`${label}: ${value}${testid==='flight-priority'?'%':' kg'}`;const input=document.createElement('input');input.type='range';input.min=String(min);input.max=String(max);input.step=String(step);input.value=String(value);input.dataset.testid=testid;input.setAttribute('aria-label',label);input.addEventListener('input',()=>onChange(Number(input.value)));wrap.append(title,input);return wrap;
}
