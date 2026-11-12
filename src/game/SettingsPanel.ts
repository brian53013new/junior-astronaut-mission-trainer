import '../settings.css';

export type SettingsLanguage='zh'|'en';
export type SettingsTextSize='normal'|'large'|'xlarge';
export type SettingsSoundGroup='music'|'effects'|'voice';
export interface SettingsValues {
 language:SettingsLanguage;
 levels:Record<SettingsSoundGroup,number>;
 master:number;
 muted:boolean;
 textSize:SettingsTextSize;
 allowZoom:boolean;
 reducedMotion:boolean;
}
export interface SettingsCallbacks {
 onLevel(group:SettingsSoundGroup,value:number):void;
 onMaster(value:number):void;
 onMute():void;
 onLanguage():void;
 onTextSize(value:SettingsTextSize):void;
 onZoom(enabled:boolean):void;
 onMotion(reduced:boolean):void;
 onResetView():void;
 onRepeat():void;
 onRestart():void;
 onProjectInfo():void;
 onOpenChange(open:boolean):void;
}

/** Non-modal, keyboard accessible settings. The game remains responsible for state. */
export class SettingsPanel {
 private readonly root=document.createElement('div');
 private readonly gear:HTMLButtonElement;
 private readonly panel:HTMLElement;
 private readonly abort=new AbortController();
 private language:SettingsLanguage;
 private open=false;
 private muted:boolean;
 constructor(private readonly callbacks:SettingsCallbacks,initial:SettingsValues){
  this.language=initial.language;this.muted=initial.muted;
  this.root.id='game-settings';
  this.root.innerHTML=`<button type="button" class="settings-gear" aria-controls="settings-panel" aria-expanded="false"><svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 8.6a3.4 3.4 0 1 0 0 6.8 3.4 3.4 0 0 0 0-6.8Z"/><path d="M19.2 13.4a7.5 7.5 0 0 0 0-2.8l1.6-1.2-1.7-3-1.9.7a7.6 7.6 0 0 0-2.4-1.4l-.3-2h-3.4l-.4 2a7.6 7.6 0 0 0-2.4 1.4l-1.9-.7-1.7 3 1.6 1.2a7.5 7.5 0 0 0 0 2.8l-1.6 1.2 1.7 3 1.9-.7a7.6 7.6 0 0 0 2.4 1.4l.4 2h3.4l.3-2a7.6 7.6 0 0 0 2.4-1.4l1.9.7 1.7-3-1.6-1.2Z"/></svg></button>
  <section id="settings-panel" class="settings-panel" hidden role="dialog" aria-modal="false" aria-labelledby="settings-title"><header><div><small>OUTPOST / OPTIONS</small><h2 id="settings-title"></h2></div><button type="button" class="settings-close" data-action="close" aria-label="Close">×</button></header>
   <div class="settings-scroll"><section><h3 data-label="sound"></h3><button type="button" class="settings-mute" data-action="mute"></button><label class="settings-range"><span data-label="master"></span><output data-output="master"></output><input data-input="master" type="range" min="0" max="100" step="5"></label><label class="settings-range"><span data-label="music"></span><output data-output="music"></output><input data-input="music" type="range" min="0" max="100" step="5"></label><label class="settings-range"><span data-label="effects"></span><output data-output="effects"></output><input data-input="effects" type="range" min="0" max="100" step="5"></label><label class="settings-range"><span data-label="voice"></span><output data-output="voice"></output><input data-input="voice" type="range" min="0" max="100" step="5"></label></section>
   <section><h3 data-label="display"></h3><label class="settings-select"><span data-label="text"></span><select data-input="text"><option value="normal"></option><option value="large"></option><option value="xlarge"></option></select></label><label class="settings-switch"><span data-label="zoom"></span><input data-input="zoom" type="checkbox"></label><label class="settings-switch"><span data-label="motion"></span><input data-input="motion" type="checkbox"></label></section>
   <section><h3 data-label="other"></h3><div class="settings-actions"><button type="button" data-action="language"></button><button type="button" data-action="reset"></button><button type="button" data-action="repeat"></button><button type="button" data-action="project-info"></button><button type="button" data-action="restart"></button></div></section></div>
  </section>`;
  document.querySelector('#app')?.append(this.root);
  this.gear=this.root.querySelector<HTMLButtonElement>('.settings-gear')!;
  this.panel=this.root.querySelector<HTMLElement>('.settings-panel')!;
  const opts={signal:this.abort.signal};
  this.gear.addEventListener('click',()=>this.setOpen(!this.open),opts);
  for(const type of ['pointerdown','pointerup','pointermove','pointercancel','click','wheel'] as const)this.root.addEventListener(type,e=>e.stopPropagation(),opts);
  this.root.querySelector<HTMLButtonElement>('[data-action="close"]')!.addEventListener('click',()=>this.setOpen(false),opts);
  this.root.querySelector<HTMLButtonElement>('[data-action="mute"]')!.addEventListener('click',()=>{this.callbacks.onMute();},opts);
  this.root.querySelector<HTMLButtonElement>('[data-action="language"]')!.addEventListener('click',()=>this.callbacks.onLanguage(),opts);
  this.root.querySelector<HTMLButtonElement>('[data-action="reset"]')!.addEventListener('click',()=>{this.callbacks.onResetView();this.setOpen(false);},opts);
  this.root.querySelector<HTMLButtonElement>('[data-action="repeat"]')!.addEventListener('click',()=>{this.callbacks.onRepeat();this.setOpen(false);},opts);
  this.root.querySelector<HTMLButtonElement>('[data-action="project-info"]')!.addEventListener('click',()=>{this.callbacks.onProjectInfo();this.setOpen(false);},opts);
  this.root.querySelector<HTMLButtonElement>('[data-action="restart"]')!.addEventListener('click',()=>{this.callbacks.onRestart();this.setOpen(false);},opts);
  for(const group of ['master','music','effects','voice'] as const){const input=this.input(group);input.addEventListener('input',()=>{const value=Number(input.value)/100;this.setOutput(group,value);if(group==='master')this.callbacks.onMaster(value);else this.callbacks.onLevel(group,value);},opts);}
  this.select().addEventListener('change',()=>this.callbacks.onTextSize(this.select().value as SettingsTextSize),opts);
  this.input('zoom').addEventListener('change',()=>this.callbacks.onZoom(this.input('zoom').checked),opts);
  this.input('motion').addEventListener('change',()=>this.callbacks.onMotion(this.input('motion').checked),opts);
  window.addEventListener('keydown',e=>{if(this.open&&e.key==='Escape'){e.stopImmediatePropagation();e.preventDefault();this.setOpen(false);this.gear.focus();}},{...opts,capture:true});
  this.input('zoom').checked=initial.allowZoom;this.input('motion').checked=initial.reducedMotion;this.select().value=initial.textSize;
  this.setAudio(initial.master,initial.muted,initial.levels);this.setLanguage(initial.language);
 }
 private input(name:string){return this.root.querySelector<HTMLInputElement>(`[data-input="${name}"]`)!;}
 private select(){return this.root.querySelector<HTMLSelectElement>('[data-input="text"]')!;}
 setTextScale(scale:number){this.select().value=scale>=1.75?'xlarge':scale>=1.25?'large':'normal';}
 private setOutput(name:string,value:number){this.root.querySelector<HTMLOutputElement>(`[data-output="${name}"]`)!.textContent=`${Math.round(value*100)}%`;}
 setAudio(master:number,muted:boolean,levels:Record<SettingsSoundGroup,number>){this.muted=muted;for(const [name,value] of Object.entries({master,...levels})){this.input(name).value=String(Math.round(value*100));this.setOutput(name,value);}this.updateMute();}
 setLevels(levels:Record<SettingsSoundGroup,number>){for(const [name,value] of Object.entries(levels)){this.input(name).value=String(Math.round(value*100));this.setOutput(name,value);}}
 private updateMute(){const button=this.root.querySelector<HTMLButtonElement>('[data-action="mute"]')!;button.textContent=this.language==='zh'?(this.muted?'解除靜音':'靜音'):(this.muted?'Unmute':'Mute');button.setAttribute('aria-pressed',String(this.muted));}
 setLanguage(language:SettingsLanguage){this.language=language;const z=language==='zh';const labels:Record<string,string>={sound:z?'聲音':'Sound',master:z?'總音量':'Master',music:z?'背景音樂':'Music',effects:z?'音效':'Effects',voice:z?'NOVA 聲音':'NOVA voice',display:z?'畫面與閱讀':'Display & reading',text:z?'文字大小':'Text size',zoom:z?'允許鏡頭縮放':'Allow camera zoom',motion:z?'減少動態效果':'Reduce motion',other:z?'其他':'More'};this.root.querySelectorAll<HTMLElement>('[data-label]').forEach(el=>{el.textContent=labels[el.dataset.label!]??'';});this.root.querySelector<HTMLElement>('#settings-title')!.textContent=z?'設定':'Settings';this.gear.setAttribute('aria-label',z?'開啟設定':'Open settings');this.root.querySelector<HTMLButtonElement>('[data-action="close"]')!.setAttribute('aria-label',z?'關閉設定':'Close settings');const actions:Record<string,string>={language:z?'切換 English':'繁體中文',reset:z?'重設視角':'Reset view',repeat:z?'重聽 NOVA':'Replay NOVA','project-info':z?'NASA 資料與作品提交':'NASA sources & project checklist',restart:z?'重新開始':'Restart'};for(const [name,text] of Object.entries(actions))this.root.querySelector<HTMLElement>(`[data-action="${name}"]`)!.textContent=text;const options=this.select().options;options[0].textContent=z?'一般':'Normal';options[1].textContent=z?'大字':'Large';options[2].textContent=z?'超大字':'Extra large';this.updateMute();}
 setOpen(open:boolean){if(this.open===open)return;this.open=open;this.panel.hidden=!open;this.gear.setAttribute('aria-expanded',String(open));document.body.classList.toggle('settings-open',open);this.callbacks.onOpenChange(open);}
 destroy(){this.abort.abort();document.body.classList.remove('settings-open');this.root.remove();}
}
