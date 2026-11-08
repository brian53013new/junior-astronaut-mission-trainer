import assert from 'node:assert/strict';
import { MissionEngine } from '../src/game/MissionEngine.ts';
import { tutorialTarget } from '../src/game/TutorialGuide.ts';
import { focusPreset } from '../src/game/FocusPreset.ts';
import { loadMissionData, offlineEvents } from '../src/game/NASADataProvider.ts';
import { beginDrag, moveDrag } from '../src/game/DragControls.ts';
import { stepFastClock } from '../src/game/FastClock.ts';
import { t } from '../src/game/language.ts';
import { readFile } from 'node:fs/promises';
import { PerspectiveCamera, Vector3 } from 'three';

const event={id:'training',title:'eventDust',note:'noteDust',source:'sourceScenario',effects:{power:-12},kind:'education'};
const mission=new MissionEngine(()=>event);
let time=1000,powerDemonstrated=false,observed=false;
for(let i=0;i<40&&!observed;i++){
  const action=tutorialTarget(mission.state,powerDemonstrated);
  const result=mission.execute(action,time);time+=1000;
  assert.equal(result.ok,true,`Tutorial blocked at ${action}: ${result.message}`);
  if(action==='power')powerDemonstrated=true;
  if(action==='science')observed=true;
}
assert.equal(observed,true,'Tutorial must reach a scientific observation');
assert.equal(mission.state.discoveries,1);
assert.ok(mission.state.sol<12,'The tutorial must finish before the mission ends');
for(const scenario of offlineEvents){
  const game=new MissionEngine(()=>scenario);let now=1000,seenPower=false,succeeded=false;
  for(let i=0;i<40&&!succeeded&&game.state.sol<12;i++){
    const action=tutorialTarget(game.state,seenPower);
    const result=game.execute(action,now);now+=1000;
    assert.equal(result.ok,true,`${scenario.id}: ${action}: ${result.message}`);
    if(action==='power')seenPower=true;
    if(action==='science')succeeded=true;
  }
  assert.equal(succeeded,true,`${scenario.id}: guide should reach the observation before mission end`);
}
for(const scenario of offlineEvents){
  const game=new MissionEngine(()=>scenario);let now=1000,seenPower=false,succeeded=false;
  for(let i=0;i<40&&!succeeded&&game.state.sol<12;i++){
    const action=tutorialTarget(game.state,seenPower);
    if(['power','plan','craft','navigate','science'].includes(action))game.configure(action,.45);
    const result=game.execute(action,now);now+=1000;
    assert.equal(result.ok,true,`${scenario.id}: adjusted ${action}: ${result.message}`);
    if(action==='power')seenPower=true;
    if(action==='science')succeeded=true;
  }
  assert.equal(succeeded,true,`${scenario.id}: adjusted tutorial should reach an observation`);
}
for(let dayCode=0;dayCode<offlineEvents.length;dayCode++)for(const setting of [.45,.5]){
  const game=new MissionEngine(sol=>offlineEvents[(sol+dayCode)%offlineEvents.length]);let now=1000,seenPower=false,succeeded=false;
  for(let i=0;i<40&&!succeeded&&game.state.sol<12;i++){
    const action=tutorialTarget(game.state,seenPower);
    if(['power','plan','craft','navigate','science'].includes(action))game.configure(action,setting);
    const result=game.execute(action,now);now+=1000;
    assert.equal(result.ok,true,`day ${dayCode}, setting ${setting}: ${action}: ${result.message}`);
    if(action==='power')seenPower=true;
    if(action==='science')succeeded=true;
  }
  assert.equal(succeeded,true,`day ${dayCode}, setting ${setting}: guide should reach an observation`);
}
const double=new MissionEngine(()=>event);
assert.equal(double.execute('event',500).message,'monitorClear');
assert.equal(double.commandCount,0,'Environmental monitoring must not consume a command');
double.configure('power',1);
assert.equal(double.execute('power',1000).ok,true);
assert.equal(double.state.power,96);
assert.equal(double.state.water,64);
const lowThrottle=new MissionEngine(()=>event),highThrottle=new MissionEngine(()=>event);
for(const game of [lowThrottle,highThrottle])game.state.planned=true;
lowThrottle.configure('craft',0);highThrottle.configure('craft',1);
assert.equal(lowThrottle.execute('craft',1000).ok,true);
assert.equal(highThrottle.execute('craft',1000).ok,true);
assert.ok(highThrottle.state.power<lowThrottle.state.power);
assert.ok(highThrottle.state.propellant<lowThrottle.state.propellant);
const powerPriority=new MissionEngine(()=>event),sciencePriority=new MissionEngine(()=>event);
for(const game of [powerPriority,sciencePriority])game.state.planned=true;
powerPriority.configure('plan',0);sciencePriority.configure('plan',1);
assert.equal(powerPriority.execute('advance',1000).ok,true);
assert.equal(sciencePriority.execute('advance',1000).ok,true);
assert.ok(powerPriority.state.power>sciencePriority.state.power);
assert.ok(powerPriority.state.water<sciencePriority.state.water);
assert.equal(double.execute('power',1100).ok,false);
assert.equal(double.state.power,96);
assert.equal(double.state.water,64);
const before=double.state.sol;
assert.equal(double.execute('pause',2000).ok,true);
assert.equal(double.execute('advance',2600).ok,false);
assert.equal(double.state.sol,before);
assert.equal(double.execute('pause',3200).ok,true);
assert.equal(double.execute('skip',4000).ok,true);
assert.equal(double.state.eventOpen,true);
const saved=double.snapshot(),resumed=new MissionEngine(()=>event);
assert.equal(resumed.restore(JSON.parse(JSON.stringify(saved))),true);
assert.equal(resumed.state.eventOpen,true);
assert.equal(resumed.commandCount,double.commandCount);
assert.equal(resumed.settings.power,1);
assert.equal(resumed.execute('shelter',5000).ok,true,'A restored event must remain actionable');
const broken=JSON.parse(JSON.stringify(saved));broken.state.power=-500;
const safeBefore=resumed.snapshot();
assert.equal(resumed.restore(broken),false);
assert.deepEqual(resumed.snapshot(),safeBefore,'Invalid saved data must not mutate the mission');
const brokenEvent=JSON.parse(JSON.stringify(saved));brokenEvent.activeEvent.effects.power=-999;
assert.equal(resumed.restore(brokenEvent),false,'Out-of-range event effects must not be restored');
const shortRoute=new MissionEngine(()=>event),longRoute=new MissionEngine(()=>event);
for(const game of [shortRoute,longRoute])Object.assign(game.state,{planned:true,craftReady:true,commsReady:true});
shortRoute.configure('navigate',0);
longRoute.configure('plan',1);longRoute.configure('navigate',1);
assert.equal(shortRoute.execute('navigate',1000).ok,true);
assert.equal(longRoute.execute('navigate',1000).ok,true);
assert.ok(longRoute.state.propellant<shortRoute.state.propellant);
assert.equal(shortRoute.execute('advance',2000).ok,true);
assert.equal(shortRoute.execute('navigate',3000).ok,true,'A route can be revised in a later sol');
const weakScan=new MissionEngine(()=>event),strongScan=new MissionEngine(()=>event);
for(const game of [weakScan,strongScan])Object.assign(game.state,{commsReady:true,navReady:true});
weakScan.configure('science',0);strongScan.configure('science',1);
assert.equal(weakScan.execute('science',1000).ok,true);
assert.equal(strongScan.execute('science',1000).ok,true);
assert.ok(strongScan.state.data>weakScan.state.data);
assert.ok(strongScan.state.power<weakScan.state.power);
const offTarget=new MissionEngine(()=>event),onTarget=new MissionEngine(()=>event);
for(const game of [offTarget,onTarget])Object.assign(game.state,{commsReady:true,navReady:true});
offTarget.configureAim(0);onTarget.configureAim(.5);
assert.equal(offTarget.execute('science',1000).ok,true);
assert.equal(onTarget.execute('science',1000).ok,true);
assert.ok(onTarget.state.data>offTarget.state.data);
const incorrect=new MissionEngine(()=>event),correct=new MissionEngine(()=>event);
for(const game of [incorrect,correct])Object.assign(game.state,{commsReady:true,data:25});
incorrect.configure('analyze',0);correct.configure('analyze',1);
assert.equal(incorrect.execute('analyze',1000).message,'analysisIncorrect');
assert.equal(correct.execute('analyze',1000).message,'dataFound');
const base={x:0,y:2.68,z:5.95},control={x:3,y:1,z:0};
const destination=focusPreset(base,control);
for(let i=0;i<10000;i++)assert.deepEqual(focusPreset(base,control),destination);
assert.ok(destination.position.z>control.z+2 && destination.position.z<base.z);
for(const pointer of [{x:0,y:0},{x:.4,y:-.2},{x:-.7,y:-.5},{x:.85,y:.65}]){
  const preset=focusPreset(base,control,pointer,1280/720,48);
  const camera=new PerspectiveCamera(48,1280/720,.1,100);
  camera.position.set(preset.position.x,preset.position.y,preset.position.z);
  camera.lookAt(preset.target.x,preset.target.y,preset.target.z);camera.updateMatrixWorld();
  const projected=new Vector3(control.x,control.y,control.z).project(camera);
  assert.ok(Math.abs(projected.x-pointer.x)<.001&&Math.abs(projected.y-pointer.y)<.001,'Focused control should remain under the cursor');
}
for(const pointer of [{x:-.8,y:-.8},{x:.8,y:.8},{x:.7,y:-.6}]){
  const mobileBase={x:0,y:4.3,z:7.6},mobileControl={x:.92,y:1.2,z:2.1},aspect=390/844;
  const preset=focusPreset(mobileBase,mobileControl,pointer,aspect,58);
  const camera=new PerspectiveCamera(58,aspect,.1,100);
  camera.position.set(preset.position.x,preset.position.y,preset.position.z);
  camera.lookAt(preset.target.x,preset.target.y,preset.target.z);camera.updateMatrixWorld();
  const projected=new Vector3(mobileControl.x,mobileControl.y,mobileControl.z).project(camera);
  assert.ok(Math.abs(projected.x-pointer.x)<.001&&Math.abs(projected.y-pointer.y)<.001,'Mobile focus should remain under the pointer');
}
const tap=moveDrag(beginDrag('power',100,100,.5,.5),104,102);
assert.equal(tap.moved,false,'A click must not be treated as a drag');
const wrongDirection=moveDrag(beginDrag('power',100,100,.5,.5),100,140);
assert.equal(wrongDirection.moved,true);
assert.equal(wrongDirection.changed,false,'Vertical movement must not commit the power slider');
const slider=moveDrag(beginDrag('power',100,100,.5,.5),280,100);
assert.equal(slider.value,1);
assert.equal(slider.changed,true);
const dial=moveDrag(beginDrag('science',100,100,.5,.5),190,20);
assert.equal(dial.value,1);
assert.equal(dial.aim,1);
assert.equal(dial.changed,true);
assert.equal(stepFastClock(9999,10000,false,false,false).advance,false);
assert.deepEqual(stepFastClock(10000,10000,false,false,false),{enabled:true,nextAt:20000,advance:true});
assert.equal(stepFastClock(12000,20000,true,false,false).nextAt,22000);
assert.equal(stepFastClock(22000,22000,false,true,false).enabled,false);
globalThis.window={setTimeout};
const sample={schemaVersion:1,provenance:{mode:'NASA-SNAPSHOT',dataset:'test',sourceUrl:'https://ccmc.gsfc.nasa.gov/test',retrievedAt:'2026-11-05',recordId:'test',limitations:'test'},records:[{id:'test',kind:'NASA',titleKey:'test',noteKey:'nasaMapping',sourceUrl:'https://ccmc.gsfc.nasa.gov/test',retrievedAt:'2026-11-05',effects:{},mappingDisclosure:'synthetic test'}]};
globalThis.fetch=async()=>({ok:true,json:async()=>sample});
assert.equal((await loadMissionData()).isFallback,false);
sample.records[0].sourceUrl='https://ccmc.gsfc.nasa.gov.evil.test/';
assert.equal((await loadMissionData()).isFallback,true,'Invalid source domains must fall back');
sample.records[0].sourceUrl='https://ccmc.gsfc.nasa.gov/test?API_KEY=example';
assert.equal((await loadMissionData()).isFallback,true,'Secrets must not be embedded in snapshot URLs');
globalThis.fetch=async()=>{throw new Error('offline');};
assert.equal((await loadMissionData()).isFallback,true);
const html=await readFile(new URL('../index.html',import.meta.url),'utf8');
const engineSource=await readFile(new URL('../src/game/MissionEngine.ts',import.meta.url),'utf8');
const keys=new Set([...html.matchAll(/data-i18n="([^"]+)"/g)].map(m=>m[1]));
for(const match of engineSource.matchAll(/(?:fail|ok)\('([^']+)'\)|message:'([^']+)'/g))keys.add(match[1]??match[2]);
for(const key of ['planLabel','craftLabel','powerLabel','commsLabel','navLabel','scienceLabel','analyzeLabel','recycleLabel','growLabel','eventLabel','pauseLabel','advanceLabel','skipLabel','shelterLabel','continueLabel','pauseDone','resumeDone','eventAlert','advanceDone','clockReady','nasaMapping'])keys.add(key);
for(const language of ['en','zh'])for(const key of keys){const value=t(language,key);assert.ok(value&&value!==key,`${language} localization missing: ${key}`);}
console.log('Core checks passed: guided mission, drag gestures, adjustable trade-offs, route revision, aim, data comparison, duplicate input, pause, event, snapshot fallback, and bounded focus preset.');
