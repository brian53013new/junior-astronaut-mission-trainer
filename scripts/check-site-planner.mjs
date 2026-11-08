import assert from 'node:assert/strict';
import {siteProfile,siteIndex} from '../src/game/SitePlanner.ts';
import {MissionEngine} from '../src/game/MissionEngine.ts';
const event={id:'test',title:'test',note:'test',source:'test',effects:{},kind:'education'};
for(const [value,index,power,water] of [[0,0,4,6],[.5,1,5,5],[1,2,6,5]]){
 assert.equal(siteIndex(value),index);const game=new MissionEngine(()=>event);game.configure('plan',value);
 assert.equal(game.execute('plan',1000).ok,true);assert.equal(game.execute('plan',1001).ok,false);
 assert.equal(game.execute('advance',2000).ok,true);assert.equal(game.state.power,72-power);assert.equal(game.state.water,68-water);
 const restored=new MissionEngine(()=>event);assert.equal(restored.restore(game.snapshot()),true);assert.equal(siteProfile(restored.settings.plan).id,siteProfile(value).id);
}
console.log('Site planning passed: three choices, resource trade-offs, duplicate command protection, and snapshot restoration.');
