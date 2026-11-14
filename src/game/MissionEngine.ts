import type { Action, MissionState, ScenarioEvent } from './types';
import { BASELINE_GAME_WATER_POINTS, siteProfile } from './SitePlanner.ts';
import type { WorkshopKind } from './Workshop';

export type CommandResult={ok:boolean;kind:'action'|'time'|'event'|'error'|'paused';message:string;event?:ScenarioEvent;timeAdvanced?:number;}
export type MissionSnapshot={version:1;state:MissionState;settings:{power:number;craft:number;science:number;aim:number;navigate:number;plan:number;analyze:number};commandCount:number;activeEvent:ScenarioEvent|null;workshopRewards?:Record<WorkshopKind,boolean>;signalReward?:boolean;orbitReward?:boolean;lastTrainingSupplySol?:number};
const clamp=(n:number)=>Math.max(0,Math.min(100,n));
export const initialMission=():MissionState=>({power:72,water:68,food:54,health:100,propellant:82,shielding:0,sol:1,cycle:1,planned:false,craftReady:false,commsReady:false,navReady:false,data:0,discoveries:0,eventOpen:false,paused:false,commandSpent:false,lastCommandAt:0});

export class MissionEngine {
  readonly state=initialMission();
  commandCount=0;
  private cooldownUntil=0;
  private activeEvent:ScenarioEvent|null=null;readonly workshopRewards:Record<WorkshopKind,boolean>={assembly:false,repair:false};signalReward=false;orbitReward=false;lastTrainingSupplySol=-1;
  readonly settings={power:.5,craft:.5,science:.5,aim:.5,navigate:.5,plan:.5,analyze:.5};
  configure(action:Action,value:number){if(!Number.isFinite(value))return false;if(action==='power'||action==='craft'||action==='science'||action==='navigate'||action==='plan'||action==='analyze'){this.settings[action]=Math.max(0,Math.min(1,value));return true;}return false;}
  configureAim(value:number){if(!Number.isFinite(value))return false;this.settings.aim=Math.max(0,Math.min(1,value));return true;}
  constructor(private readonly eventForSol:(sol:number)=>ScenarioEvent){}

  snapshot():MissionSnapshot{return{version:1,state:{...this.state,lastCommandAt:0},settings:{...this.settings},commandCount:this.commandCount,activeEvent:this.activeEvent?{...this.activeEvent,effects:{...this.activeEvent.effects}}:null,workshopRewards:{...this.workshopRewards},signalReward:this.signalReward,orbitReward:this.orbitReward,lastTrainingSupplySol:this.lastTrainingSupplySol};}
  restore(input:unknown):boolean{
    if(!input||typeof input!=='object')return false;const v=input as Partial<MissionSnapshot>,s=v.state,p=v.settings;
    if(v.version!==1||!s||!p||!Number.isInteger(v.commandCount)||Number(v.commandCount)<0||Number(v.commandCount)>1000)return false;
    const resources=['power','water','food','health','propellant','shielding','data'] as const;
    if(!resources.every(k=>typeof s[k]==='number'&&Number.isFinite(s[k])&&s[k]>=0&&s[k]<=100))return false;
    if(!Number.isInteger(s.sol)||s.sol<1||s.sol>60||!Number.isInteger(s.discoveries)||s.discoveries<0||s.discoveries>3)return false;
    if(!(['planned','craftReady','commsReady','navReady','eventOpen','paused','commandSpent'] as const).every(k=>typeof s[k]==='boolean'))return false;
    if(!(['power','craft','science','aim','navigate','plan','analyze'] as const).every(k=>typeof p[k]==='number'&&Number.isFinite(p[k])&&p[k]>=0&&p[k]<=1))return false;
    const event=v.activeEvent;
    if(s.eventOpen){if(!event||typeof event.id!=='string'||typeof event.title!=='string'||typeof event.note!=='string'||typeof event.source!=='string'||!['education','nasa-snapshot','nasa-live'].includes(event.kind)||!event.effects||typeof event.effects!=='object')return false;const allowed=new Set(['power','water','food','health','propellant']);if(!Object.entries(event.effects).every(([key,value])=>allowed.has(key)&&typeof value==='number'&&Number.isFinite(value)&&Math.abs(value)<=100))return false;}
    Object.assign(this.state,{power:s.power,water:s.water,food:s.food,health:s.health,propellant:s.propellant,shielding:s.shielding,sol:s.sol,cycle:s.sol,planned:s.planned,craftReady:s.craftReady,commsReady:s.commsReady,navReady:s.navReady,data:s.data,discoveries:s.discoveries,eventOpen:s.eventOpen,paused:s.paused,commandSpent:s.commandSpent,lastCommandAt:0});Object.assign(this.settings,{power:p.power,craft:p.craft,science:p.science,aim:p.aim,navigate:p.navigate,plan:p.plan,analyze:p.analyze});this.commandCount=Number(v.commandCount);this.signalReward=v.signalReward===true;this.orbitReward=v.orbitReward===true;this.lastTrainingSupplySol=Number.isInteger(v.lastTrainingSupplySol)&&Number(v.lastTrainingSupplySol)>=0&&Number(v.lastTrainingSupplySol)<=s.sol?Number(v.lastTrainingSupplySol):-1;this.workshopRewards.assembly=v.workshopRewards?.assembly===true;this.workshopRewards.repair=v.workshopRewards?.repair===true;this.activeEvent=s.eventOpen&&event?{...event,effects:{...event.effects}}:null;this.cooldownUntil=0;return true;
  }

  execute(action:Action,now=performance.now()):CommandResult{
    const s=this.state;if(now<this.cooldownUntil)return{ok:false,kind:'error',message:'cooldown'};
    if(action==='event'){if(!s.eventOpen||!this.activeEvent)return{ok:true,kind:'event',message:'monitorClear'};return{ok:true,kind:'event',message:'eventBrief',event:this.activeEvent};}
    if(action==='pause'){s.paused=!s.paused;this.cooldownUntil=now+450;return{ok:true,kind:'time',message:s.paused?'pauseDone':'resumeDone'};}
    if(action==='advance'||action==='skip')return this.advance(action==='advance'?1:3,now);
    if(s.paused)return{ok:false,kind:'paused',message:'clockPaused'};
    if(s.eventOpen&&action!=='shelter'&&action!=='continue')return{ok:false,kind:'event',message:'eventMustDecide'};
    if(s.commandSpent)return{ok:false,kind:'error',message:'solSpent'};
    const result=this.systemAction(action);if(result.ok){s.commandSpent=true;s.lastCommandAt=now;this.commandCount++;this.cooldownUntil=now+650;}return result;
  }
  /** Fictional training backup, never a real resupply or mission recommendation. */
  requestTrainingSupply(now=performance.now()):CommandResult{const s=this.state;if(s.paused)return{ok:false,kind:'paused',message:'clockPaused'};if(s.eventOpen)return{ok:false,kind:'event',message:'eventMustDecide'};if(now<this.cooldownUntil)return{ok:false,kind:'error',message:'cooldown'};if(this.lastTrainingSupplySol===s.sol)return{ok:false,kind:'error',message:'alreadyDone'};if(s.power>=18&&s.water>=18&&s.food>=18)return{ok:false,kind:'error',message:'alreadyDone'};s.power=Math.max(s.power,45);s.water=Math.max(s.water,45);s.food=Math.max(s.food,36);this.lastTrainingSupplySol=s.sol;this.cooldownUntil=now+650;return{ok:true,kind:'action',message:'trainingSupply'};}
  claimWorkshop(kind:WorkshopKind,now=performance.now()):CommandResult{
    const s=this.state;if(this.workshopRewards[kind])return {ok:false,kind:'error',message:'alreadyDone'};
    if(now<this.cooldownUntil)return {ok:false,kind:'error',message:'cooldown'};
    if(s.paused)return {ok:false,kind:'paused',message:'clockPaused'};
    if(s.eventOpen)return {ok:false,kind:'event',message:'eventMustDecide'};
    if(s.commandSpent)return {ok:false,kind:'error',message:'solSpent'};
    if(kind==='assembly'){if(s.power<4)return {ok:false,kind:'error',message:'insufficient'};s.power-=4;s.shielding=clamp(s.shielding+10);}
    else {if(s.water<3)return {ok:false,kind:'error',message:'insufficient'};s.water-=3;s.power=clamp(s.power+12);}
    this.workshopRewards[kind]=true;s.commandSpent=true;s.lastCommandAt=now;this.commandCount++;this.cooldownUntil=now+650;
    return {ok:true,kind:'action',message:kind==='assembly'?'assemblyDone':'repairDone'};
  }
  /** Board lessons are short training exercises, so unrelated legacy sol, pause and cooldown gates do not block a completed classroom task. Resource costs and one-time rewards still apply. */
  claimTrainingWorkshop(kind:WorkshopKind):CommandResult{const s=this.state;if(this.workshopRewards[kind])return {ok:false,kind:'error',message:'alreadyDone'};if(kind==='assembly'){if(s.power<4)return {ok:false,kind:'error',message:'insufficient'};s.power-=4;s.shielding=clamp(s.shielding+10);}else{if(s.water<3)return {ok:false,kind:'error',message:'insufficient'};s.water-=3;s.power=clamp(s.power+12);}this.workshopRewards[kind]=true;this.commandCount++;return {ok:true,kind:'action',message:kind==='assembly'?'assemblyDone':'repairDone'};}
  /** Apply the board-only decisions to the canonical simulation state; all deltas are explicitly educational mappings. */
  applyTrainingDecision(kind:'site'|'flight'|'finale',values:{score?:number;mass?:number;priority?:number;choices?:string[]}):CommandResult{
    const s=this.state;
    if(kind==='site'){
      const score=values.score;if(typeof score!=='number'||!Number.isFinite(score)||score<0||score>100)return{ok:false,kind:'error',message:'invalidValue'};
      s.planned=true;s.power=clamp(s.power+Math.round((score-50)/10));s.data=clamp(s.data+Math.round(score/10));this.commandCount++;
      return{ok:true,kind:'action',message:'siteDecisionRecorded'};
    }
    if(kind==='flight'){
      const mass=values.mass,priority=values.priority;if(typeof mass!=='number'||!Number.isFinite(mass)||mass<5||mass>80||typeof priority!=='number'||!Number.isFinite(priority)||priority<0||priority>1)return{ok:false,kind:'error',message:'invalidValue'};
      const loadCost=Math.max(1,Math.round(mass/20));if(s.power<loadCost)return{ok:false,kind:'error',message:'insufficient'};
      s.power-=loadCost;s.health=clamp(s.health+Math.round((priority-.5)*10));this.settings.power=priority;this.commandCount++;
      return{ok:true,kind:'action',message:'flightDecisionRecorded'};
    }
    const choices=values.choices;if(!Array.isArray(choices)||choices.length<2||choices.some(x=>!['energy','water','comms'].includes(x)))return{ok:false,kind:'error',message:'invalidValue'};
    if(choices.includes('energy')){if(s.power<5)return{ok:false,kind:'error',message:'insufficient'};s.power-=5;s.health=clamp(s.health+8);}
    if(choices.includes('water')){s.water=clamp(s.water+5);s.power=clamp(s.power-2);}
    if(choices.includes('comms')){s.data=clamp(s.data+3);s.power=clamp(s.power-2);}
    this.commandCount++;return{ok:true,kind:'action',message:'finaleDecisionRecorded'};
  }
  claimTrainingSignal():CommandResult{const s=this.state;if(this.signalReward)return {ok:false,kind:'error',message:'alreadyDone'};if(s.power<3)return {ok:false,kind:'error',message:'insufficient'};s.power-=3;s.data=clamp(s.data+10);this.signalReward=true;this.commandCount++;return {ok:true,kind:'action',message:'signalDone'};}
  /** A classroom observation uses the same resource state as the outpost sim but is not gated by unrelated legacy mission prerequisites. */
  claimTrainingObservation(power:number,aim:number):CommandResult{const s=this.state;if(!Number.isFinite(power)||!Number.isFinite(aim)||power<0||power>1||aim<0||aim>1)return{ok:false,kind:'error',message:'invalidValue'};const cost=6+Math.round(power*6);if(s.power<cost||s.propellant<4)return{ok:false,kind:'error',message:'insufficient'};if(s.discoveries>=3)return{ok:false,kind:'error',message:'scienceComplete'};this.settings.science=power;this.settings.aim=aim;s.power-=cost;s.propellant-=4;const alignment=1-Math.abs(aim-.8)*2;const yieldAmount=Math.max(1,Math.round((15+power*20)*(.5+.5*alignment)));s.data=clamp(s.data+yieldAmount);s.discoveries++;this.commandCount++;return{ok:true,kind:'action',message:'scienceFound'};}
  claimSignal(now=performance.now()):CommandResult{const s=this.state;if(this.signalReward)return {ok:false,kind:'error',message:'alreadyDone'};if(now<this.cooldownUntil)return {ok:false,kind:'error',message:'cooldown'};if(s.paused)return {ok:false,kind:'paused',message:'clockPaused'};if(s.eventOpen)return {ok:false,kind:'event',message:'eventMustDecide'};if(s.commandSpent)return {ok:false,kind:'error',message:'solSpent'};if(s.power<3)return {ok:false,kind:'error',message:'insufficient'};s.power-=3;s.data=clamp(s.data+10);s.commandSpent=true;s.lastCommandAt=now;this.commandCount++;this.signalReward=true;this.cooldownUntil=now+650;return {ok:true,kind:'action',message:'signalDone'};}
  claimOrbit(now=performance.now()):CommandResult{const s=this.state;if(this.orbitReward)return {ok:false,kind:'error',message:'alreadyDone'};if(now<this.cooldownUntil)return {ok:false,kind:'error',message:'cooldown'};if(s.paused)return {ok:false,kind:'paused',message:'clockPaused'};if(s.eventOpen)return {ok:false,kind:'event',message:'eventMustDecide'};if(s.commandSpent)return {ok:false,kind:'error',message:'solSpent'};if(s.power<3)return {ok:false,kind:'error',message:'insufficient'};s.power-=3;s.commandSpent=true;s.lastCommandAt=now;this.commandCount++;this.orbitReward=true;this.cooldownUntil=now+650;return {ok:true,kind:'action',message:'orbitDone'};}
  private systemAction(action:Action):CommandResult{
    const s=this.state;const fail=(message:string):CommandResult=>({ok:false,kind:'error',message});const ok=(message:string):CommandResult=>({ok:true,kind:'action',message});
    switch(action){
      case'plan':if(s.planned)return fail('alreadyDone');s.planned=true;return ok('planDone');
      case'craft':{const power=6+Math.round(this.settings.craft*4),fuel=2+Math.round(this.settings.craft*2);if(!s.planned)return fail('needsPlan');if(s.craftReady)return fail('alreadyDone');if(s.power<power||s.propellant<fuel)return fail('insufficient');s.power-=power;s.propellant-=fuel;s.craftReady=true;return ok('craftDone');}
      case'power':{const gain=12+Math.round(this.settings.power*12),water=2+Math.round(this.settings.power*2);if(s.power>88)return fail('powerEnough');if(s.water<water)return fail('insufficient');s.water-=water;s.power=clamp(s.power+gain);return ok('powerDone');}
      case'comms':if(!s.craftReady)return fail('needsCraft');if(s.commsReady)return fail('alreadyDone');if(s.power<5)return fail('insufficient');s.power-=5;s.commsReady=true;return ok('commsDone');
      case'navigate':{const fuel=Math.max(1,5+Math.round(this.settings.navigate*6+Math.abs(this.settings.plan-.5)*4-(this.settings.craft-.5)*2)-(this.orbitReward?2:0));if(!s.planned)return fail('needsPlan');if(!s.craftReady)return fail('needsCraft');if(!s.commsReady)return fail('needsComms');if(s.propellant<fuel||s.power<4)return fail('insufficient');s.propellant-=fuel;s.power-=4;s.navReady=true;return ok('navDone');}
      case'science':{const cost=6+Math.round(this.settings.science*6),alignment=1-Math.abs(this.settings.aim-.5)*2,bonus=s.planned?siteProfile(this.settings.plan).scienceBonus:0,yieldAmount=Math.round((15+this.settings.science*20)*(.5+.5*alignment))+bonus;if(!s.navReady)return fail('needsNav');if(!s.commsReady)return fail('needsComms');if(s.power<cost||s.propellant<4)return fail('insufficient');if(s.discoveries>=3)return fail('scienceComplete');s.power-=cost;s.propellant-=4;s.data=clamp(s.data+yieldAmount);s.discoveries++;return ok('scienceFound');}
      case'analyze':if(!s.commsReady)return fail('needsComms');if(s.data<25)return fail('needsScience');if(this.settings.analyze<.5)return fail('analysisIncorrect');s.data=0;return ok('dataFound');
      case'recycle':if(s.power<6)return fail('insufficient');if(s.water>88)return fail('waterEnough');s.power-=6;s.water=clamp(s.water+16);return ok('waterRecovered');
      case'grow':if(s.power<8||s.water<6)return fail('insufficient');if(s.food>88)return fail('foodEnough');s.power-=8;s.water-=6;s.food=clamp(s.food+12);return ok('foodGrown');
      case'event':return fail('noEvent');
      case'shelter':case'continue':if(!s.eventOpen||!this.activeEvent)return fail('noEvent');if(action==='shelter'){if(s.power<10)return fail('insufficient');s.power-=10;s.shielding=Math.min(100,s.shielding+15);this.applyEventEffects(.5,false);return this.closeEvent(ok('shelterDone'));}this.applyEventEffects(1,true);return this.closeEvent(ok('continueDone'));
      default:return fail('unknownControl');
    }
  }
  private applyEventEffects(scale:number,allowHealth:boolean){if(!this.activeEvent)return;for(const [key,value]of Object.entries(this.activeEvent.effects)){if(key==='health'&&!allowHealth)continue;const stat=key as keyof Pick<MissionState,'power'|'water'|'food'|'health'|'propellant'>;this.state[stat]=clamp(this.state[stat]+Number(value)*scale);}if(allowHealth&&this.activeEvent.kind!=='nasa-live'&&this.activeEvent.effects.health===undefined&&this.state.shielding<20)this.state.health=clamp(this.state.health-12);}
  private closeEvent(result:CommandResult){this.state.eventOpen=false;this.activeEvent=null;return result;}
  private advance(days:number,now:number):CommandResult{const s=this.state;if(s.paused)return{ok:false,kind:'paused',message:'clockPaused'};if(s.eventOpen)return{ok:false,kind:'event',message:'eventMustDecide'};if(now<this.cooldownUntil)return{ok:false,kind:'error',message:'cooldown'};let advanced=0;for(let i=0;i<days;i++){s.sol++;advanced++;s.commandSpent=false;const site=siteProfile(this.settings.plan);const powerUse=s.planned?site.powerUse:5;const waterUse=s.planned?site.waterUse:BASELINE_GAME_WATER_POINTS;s.power=clamp(s.power-powerUse);s.water=clamp(s.water-waterUse);s.food=clamp(s.food-4);if(s.power<12||s.water<12||s.food<10)s.health=clamp(s.health-6);if(s.sol%3===0){s.eventOpen=true;this.activeEvent=this.eventForSol(s.sol);break;}}s.cycle=s.sol;s.lastCommandAt=now;this.cooldownUntil=now+400;return{ok:true,kind:s.eventOpen?'event':'time',message:s.eventOpen?'eventAlert':'advanceDone',event:this.activeEvent??undefined,timeAdvanced:advanced};}
}
