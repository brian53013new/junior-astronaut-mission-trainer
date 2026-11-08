import assert from 'node:assert/strict';
import {screenButtons,screenCommandAt} from '../src/game/ConsoleScreens.ts';
const info={language:'zh',mission:{paused:false},source:'',science:'',log:[],notice:'',guide:'',finished:false,debrief:'',fast:false};
for(const kind of ['telemetry','map','checklist']) {
 const buttons=screenButtons(kind,info);
 if(kind==='checklist')assert.equal(buttons.length,0,'settings moved to the HUD');else assert.ok(buttons.length>=1,`${kind} needs an in-world command`);
 for(const b of buttons){assert.ok(b.x>=0&&b.y>=0&&b.x+b.w<=640&&b.y+b.h<=390);assert.equal(screenCommandAt(kind,info,(b.x+b.w/2)/640,1-(b.y+b.h/2)/390),b.command);}
 assert.equal(screenCommandAt(kind,info,.01,.99),null);
}
assert.deepEqual(screenButtons('checklist',info),[]);
info.workshopMode='assembly';assert.ok(screenButtons('map',info).some(b=>b.command==='claimWorkshop'));assert.ok(!screenButtons('telemetry',info).some(b=>b.command==='claimWorkshop'));delete info.workshopMode;
info.signalMode=true;assert.ok(screenButtons('map',info).some(b=>b.command==='signal0'));assert.ok(!screenButtons('checklist',info).some(b=>b.command==='signal0'));delete info.signalMode;
info.language='en';assert.deepEqual(screenButtons('checklist',info),[]);
console.log('3D screen hit regions passed: bounds, each command, blank area, time state and both languages.');
