import type { MissionState, Action } from './types';
import type { Language } from './language';
import { siteProfile } from './SitePlanner.ts';
import type { WorkshopKind } from './Workshop';

export type ScreenKind = 'telemetry' | 'map' | 'checklist';
export type ScreenCommand = Action | 'language' | 'tutorial' | 'skipTutorial' | 'restart' | 'return' | 'assembly' | 'repair' | 'claimWorkshop' | 'soundToggle' | 'soundDown' | 'soundUp' | 'signal' | 'signal0' | 'signal1' | 'signal2' | 'signal3' | 'signalReplay' | 'signalClaim' | 'signalReturn' | 'musicDown' | 'musicUp' | 'effectsDown' | 'effectsUp' | 'voiceDown' | 'voiceUp';
export interface ScreenInfo {
  language: Language; mission: MissionState; source: string; science: string; log: string[];
  notice: string; guide: string; finished: boolean; debrief: string; fast: boolean; sitePlan?: number; audioVolume?:number;audioLevels?:{music:number;effects:number;voice:number};audioMuted?:boolean;audioReady?:boolean;signalMode?:boolean;signalCursor?:number;signalStarted?:number;signalSolved?:boolean;signalClaimed?:boolean; workshopMode?:WorkshopKind|null; workshopParts?:boolean[]; workshopClaimed?:boolean; workshopPointer?:{part:number;x:number;y:number};journeyIndex?:number;journeyTotal?:number;journeyAwaiting?:boolean;
}
export type ScreenButton = { x:number; y:number; w:number; h:number; command:ScreenCommand; label:string };
const button=(x:number,y:number,w:number,h:number,command:ScreenCommand,label:string):ScreenButton=>({x,y,w,h,command,label});
export function screenButtons(kind:ScreenKind, info:ScreenInfo):ScreenButton[] {
  const z=info.language==='zh';
  if(info.signalMode&&kind==='map')return [button(30,180,130,55,'signal0','●'),button(180,180,130,55,'signal1','▲'),button(330,180,130,55,'signal2','■'),button(480,180,130,55,'signal3','◆'),button(25,310,170,48,'signalReturn',z?'返回':'BACK'),button(210,310,190,48,'signalReplay',z?'重播訊號':'REPLAY'),button(415,310,200,48,'signalClaim',z?'傳送訊號':'TRANSMIT')];
  if(info.workshopMode&&((info.workshopMode==='assembly'&&kind==='map')||(info.workshopMode==='repair'&&kind==='telemetry')))return [button(24,310,170,48,'return',z?'返回儀表':'BACK'),button(210,310,210,48,'claimWorkshop',z?'啟用完成的設備':'ACTIVATE DEVICE')];
  if(kind==='telemetry') return [button(485,7,130,30,'repair',z?'線路檢修':'REPAIR')];
  if(kind==='map') return [button(420,7,95,30,'assembly',z?'組裝':'BUILD'),button(520,7,95,30,'signal',z?'訊號':'SIGNAL')];
  return [];
}
export function screenCommandAt(kind:ScreenKind,info:ScreenInfo,u:number,v:number):ScreenCommand|null {
 const x=u*640,y=(1-v)*390;
 return screenButtons(kind,info).find(b=>x>=b.x&&x<=b.x+b.w&&y>=b.y&&y<=b.y+b.h)?.command??null;
}
function text(c:CanvasRenderingContext2D,s:string,x:number,y:number,max=585){c.fillText(s,x,y,max);}
export function drawConsoleScreen(c:CanvasRenderingContext2D,kind:ScreenKind,info:ScreenInfo,route:number,time:number){
 const z=info.language==='zh',s=info.mission;
 c.fillStyle='#0b171a';c.fillRect(0,0,640,390);
 const grad=c.createLinearGradient(0,0,0,390);grad.addColorStop(0,'#192d30');grad.addColorStop(1,'#0a1415');c.fillStyle=grad;c.fillRect(0,0,640,390);
 c.fillStyle='#b5c9bf';c.font='bold 23px Arial';text(c,kind==='telemetry'?(z?'01 / 生命維持與設備':'01 / SYSTEMS & LIFE SUPPORT'):kind==='map'?(z?'02 / 月球南極任務':'02 / LUNAR SOUTH POLE'):(z?'03 / 發現與任務紀錄':'03 / DISCOVERIES & LOG'),22,31);
 if(info.signalMode&&kind==='map'){drawSignal(c,info);return;}if(info.workshopMode&&((info.workshopMode==='assembly'&&kind==='map')||(info.workshopMode==='repair'&&kind==='telemetry'))){drawWorkshop(c,info);return;}
 c.fillStyle='#7fa48f';c.fillRect(22,42,596,2);c.fillStyle=time%2<1?'#8fd0a1':'#3d7967';c.fillRect(600,18,9,9);c.font='17px Arial';
 if(kind==='telemetry'){
   const rows:[[string,string],number][]=[[["電力","POWER"],s.power],[["水 / 氧氣","WATER / O₂"],s.water],[["食物","FOOD"],s.food],[["乘員健康","CREW"],s.health],[["燃料","FUEL"],s.propellant],[["安全防護","SHELTER"],s.shielding]];
   rows.forEach(([names,v],i)=>{const y=73+i*33;c.fillStyle='#c3d1c3';text(c,names[z?0:1],24,y);c.fillStyle='#293f3b';c.fillRect(230,y-14,275,12);c.fillStyle=v<25?'#db896c':'#83b59c';c.fillRect(230,y-14,275*Math.max(0,Math.min(100,v))/100,12);c.fillStyle='#e0e1ce';text(c,`${Math.round(v)}%`,525,y);});
   c.fillStyle='#b7c5b8';c.font='16px Arial';text(c,`${z?'飛船':'CRAFT'} ${s.craftReady?'✓':'—'}   ${z?'通訊':'COMMS'} ${s.commsReady?'✓':'—'}   ${z?'導航':'NAV'} ${s.navReady?'✓':'—'}`,24,288);
 } else if(kind==='map'){
   c.fillStyle='#1c3030';c.fillRect(22,54,596,188);c.strokeStyle='#526e65';c.lineWidth=1;for(let x=40;x<620;x+=45){c.beginPath();c.moveTo(x,55);c.lineTo(x,240);c.stroke();}for(let y=75;y<240;y+=35){c.beginPath();c.moveTo(22,y);c.lineTo(618,y);c.stroke();}
   c.strokeStyle='#dfb866';c.lineWidth=3;c.beginPath();c.moveTo(52,210);c.lineTo(220,170);c.lineTo(315+route*90,125);c.lineTo(555,80);c.stroke();
   c.fillStyle='#a8c8b6';c.font='14px Arial';text(c,z?'NASA LRO 教育資源啟發 · 地點數值為模擬':'NASA LRO EDUCATOR KIT · FICTIONAL SITE VALUES',35,72);c.fillStyle='#e6dfc5';c.font='17px Arial';text(c,z?'基地':'HABITAT',40,225);text(c,z?'考察目標':'RIDGE',495,75);c.beginPath();c.arc(315+route*90,125,7,0,Math.PI*2);c.fill();
   const progress=Array.from({length:info.journeyTotal??5},(_,i)=>i<(info.journeyIndex??0));for(let i=0;i<progress.length;i++){const w=570/progress.length;c.fillStyle=progress[i]?'#b9d39c':'#334944';c.fillRect(25+i*w,244,w-5,8);}c.fillStyle='#d6dfc9';c.font='12px Arial';c.fillText(`${z?'任務進度':'MISSION'} ${progress.filter(Boolean).length}/${info.journeyTotal??5}`,500,240);c.fillStyle=s.eventOpen?'#ffb280':'#adcabb';c.font='bold 18px Arial';text(c,s.eventOpen?(z?'環境事件：選擇避難或繼續':'EVENT: CHOOSE SHELTER OR CONTINUE'):(z?'規劃 → 船體 → 通訊 → 導航 → 觀測':'PLAN → CRAFT → RELAY → NAV → SCIENCE'),24,271);
   c.font='15px Arial';c.fillStyle='#a9bbb2';const site=siteProfile(info.sitePlan??.5);if(s.eventOpen){c.fillStyle='#f2d4a9';c.font='14px Arial';text(c,z?'避難：用電、減輕部分影響；繼續：省電、乘員可能受影響':'SHELTER: USE POWER, REDUCE SOME IMPACT · CONTINUE: SAVE POWER, RISK CREW',24,320);}text(c,s.planned?`${z?'基地位置':'BASE'}: ${z?site.zh:site.en} · ${z?site.zhTrade:site.enTrade}`:`${z?'候選':'CANDIDATE'}: ${z?site.zh:site.en} · ${z?site.zhTrade:site.enTrade}`,24,296);
 } else {
   c.fillStyle='#e0ded0';c.font='bold 20px Arial';text(c,`${z?'任務日':'DAY'} ${String(s.sol).padStart(2,'0')}  ·  ${s.paused?(z?'暫停':'PAUSED'):(z?'運行':'ACTIVE')}${info.fast?'  ·  FAST':''}`,23,76);
   c.font='17px Arial';c.fillStyle='#b5c8bb';text(c,`${z?'資料':'DATA'} ${s.data}/75  ·  ${z?'發現':'DISCOVERIES'} ${s.discoveries}`,23,105);
   if(info.finished){const lines=info.debrief.split('|');text(c,lines[0],23,134);text(c,lines[1]??'',23,159);text(c,info.source,23,187);}else{text(c,info.science,23,134);text(c,info.source,23,159);text(c,info.notice||info.log[0]||info.guide,23,187);}
   c.fillStyle='#8ca79c';c.font='14px Arial';text(c,z?'教育用簡化模型；非 NASA 認證或任務決策工具':'EDUCATIONAL SIMULATION · NOT NASA CERTIFIED',23,211);c.font='bold 17px Arial';c.fillStyle='#d7dfce';text(c,z?'最近的任務紀錄':'RECENT MISSION LOG',23,247);c.font='15px Arial';for(let i=0;i<Math.min(4,info.log.length);i++)text(c,`• ${info.log[i]}`,23,276+i*22);
 }
 for(const b of screenButtons(kind,info)){c.fillStyle='#284641';c.fillRect(b.x,b.y,b.w,b.h);c.fillStyle='#a8cbb2';c.fillRect(b.x,b.y,4,b.h);c.fillStyle='#46685b';c.fillRect(b.x,b.y,b.w,3);c.strokeStyle='#91b49d';c.strokeRect(b.x+.5,b.y+.5,b.w-1,b.h-1);c.fillStyle='#eff0de';c.font='bold 16px Arial';c.textAlign='center';text(c,b.label,b.x+b.w/2,b.y+b.h/2+5,b.w-10);c.textAlign='left';}
 c.fillStyle='#89a79a';c.font='13px Arial';text(c,kind==='checklist'?(z?'設定請使用右上角齒輪':'SETTINGS: USE THE GEAR IN THE TOP CORNER'):(z?'點選螢幕操作 · Esc 返回控制桌':'CLICK SCREEN TO OPERATE · ESC RETURNS'),23,384);
}

function drawWorkshop(c:CanvasRenderingContext2D,info:ScreenInfo){
 const z=info.language==='zh',kind=info.workshopMode!,placed=info.workshopParts??[false,false,false];
 const labels=kind==='assembly'?(z?['太陽能板','水槽','遮蔽板']:['SOLAR PANEL','WATER TANK','SHIELD']):(z?['電源線','水循環線','通訊線']:['POWER LINE','WATER LINE','DATA LINE']);
 const slots=kind==='assembly'?(z?['供電連接','水系統','乘員保護']:['POWER PORT','WATER SYSTEM','CREW PROTECTION']):(z?['水泵','天線','電池']:['WATER PUMP','ANTENNA','BATTERY']);
 c.fillStyle='#e1e8d8';c.font='bold 22px Arial';c.fillText(kind==='assembly'?(z?'設備組裝：零件拖到對應用途':'ASSEMBLY: DRAG EACH PART TO ITS USE'):(z?'故障檢修：觀察並接對線路':'REPAIR: MATCH LINES TO THEIR SYSTEMS'),22,32,595);
 c.fillStyle='#9bb5a7';c.font='15px Arial';c.fillText(z?'拖曳左側零件到右側插槽；配錯可以再試。':'DRAG FROM LEFT TO MATCHING SOCKET; RETRY IF WRONG.',25,58,590);
 const order=kind==='assembly'?[0,1,2]:[2,0,1];
 for(let i=0;i<3;i++){const y=76+i*60;c.fillStyle=placed[i]?'#395f4c':'#33423b';c.fillRect(28,y,217,45);c.strokeStyle=placed[i]?'#9bd8a8':'#a6a28a';c.strokeRect(28,y,217,45);c.fillStyle='#e5e6d9';c.font='bold 18px Arial';c.fillText((placed[i]?'✓  ':'●  ')+labels[i],40,y+29,190);
 c.fillStyle='#172b2a';c.fillRect(375,y,237,45);c.strokeStyle='#829f90';c.strokeRect(375,y,237,45);c.fillStyle='#d2ddce';c.fillText(slots[i],389,y+29,210);
 if(placed[i]){c.strokeStyle='#e0c67f';c.lineWidth=4;c.beginPath();c.moveTo(245,y+22);c.lineTo(300,y+22);c.lineTo(320,98+order[i]*60);c.lineTo(375,98+order[i]*60);c.stroke();}}
 if(info.workshopPointer){const p=info.workshopPointer;c.strokeStyle='#ebd08a';c.lineWidth=3;c.beginPath();c.moveTo(245,98+p.part*60);c.lineTo(p.x,p.y);c.stroke();c.fillStyle='#e9d08b';c.beginPath();c.arc(p.x,p.y,8,0,Math.PI*2);c.fill();}
 c.fillStyle='#aec4b2';c.font='15px Arial';c.fillText(info.notice?info.notice:info.workshopClaimed?(z?'已啟用；每次任務限一次。':'ACTIVATED ONCE THIS MISSION.'):(placed.every(Boolean)?(kind==='assembly'?(z?'消耗 4 電力，增加 10 遮蔽；佔用本回合。':'COST 4 POWER; +10 SHIELDING; USES ONE COMMAND.'):(z?'消耗 3 水冷卻，恢復 12 電力；佔用本回合。':'USE 3 WATER FOR COOLING; RESTORE 12 POWER.')):(z?'配對完成後，啟用設備觀察資源變化。':'MATCH ALL PARTS, THEN ACTIVATE TO SEE THE EFFECT.')),25,282,590);
 for(const b of screenButtons(kind==='assembly'?'map':'telemetry',info)){c.fillStyle='#284641';c.fillRect(b.x,b.y,b.w,b.h);c.fillStyle='#a8cbb2';c.fillRect(b.x,b.y,4,b.h);c.fillStyle='#46685b';c.fillRect(b.x,b.y,b.w,3);c.strokeStyle='#91b49d';c.strokeRect(b.x+.5,b.y+.5,b.w-1,b.h-1);c.fillStyle='#eff0de';c.font='bold 16px Arial';c.textAlign='center';c.fillText(b.label,b.x+b.w/2,b.y+b.h/2+5,b.w-10);c.textAlign='left';}
 c.fillStyle='#89a79a';c.font='14px Arial';c.fillText(z?'教育用模型 · Esc 返回控制桌':'EDUCATIONAL MODEL · ESC RETURNS',23,378);
}

function drawSignal(c:CanvasRenderingContext2D,info:ScreenInfo){const z=info.language==='zh',elapsed=performance.now()-(info.signalStarted??0),show=elapsed<4500;const seq=['●','■','▲','◆'];c.fillStyle='#e4eadc';c.font='bold 22px Arial';c.fillText(z?'通訊挑戰：記住訊號，再依順序傳回':'SIGNAL PRACTICE: REMEMBER AND REPEAT',24,32,590);c.fillStyle='#a9c6b5';c.font='17px Arial';c.fillText(show?(z?'先觀察四個符號……':'WATCH THE FOUR SYMBOLS…'):(z?'依照剛才的順序點擊。':'NOW REPEAT THE SEQUENCE.'),26,75,590);c.font='bold 42px Arial';for(let i=0;i<4;i++){c.fillStyle=i<(info.signalCursor??0)?'#b6dc9e':'#dec98d';c.fillText(show?seq[i]:i<(info.signalCursor??0)?'✓':'?',75+i*145,145);}c.fillStyle='#a9c6b5';c.font='15px Arial';c.fillText(info.signalClaimed?(z?'訊號已傳送':'SIGNAL TRANSMITTED'):info.signalSolved?(z?'正確！傳送消耗 3 電力，獲得 10 資料。':'CORRECT! TRANSMIT: -3 POWER, +10 DATA.'):(info.notice||(z?'按重播可再看一次。':'REPLAY TO SEE THE PATTERN AGAIN.')),25,280,590);for(const b of screenButtons('map',info)){c.fillStyle='#243d3a';c.fillRect(b.x,b.y,b.w,b.h);c.strokeStyle='#85a798';c.strokeRect(b.x+.5,b.y+.5,b.w-1,b.h-1);c.fillStyle='#e3eadc';c.font=b.command.startsWith('signal')&&b.command.length===7?'bold 30px Arial':'bold 15px Arial';c.textAlign='center';c.fillText(b.label,b.x+b.w/2,b.y+b.h/2+7,b.w-10);c.textAlign='left';}c.fillStyle='#89a79a';c.font='14px Arial';c.fillText(z?'練習圖形訊號；不是 NASA 通訊編碼':'TEACHING SIGNALS · NOT NASA ENCODING',23,378);}
