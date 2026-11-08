import assert from 'node:assert/strict';
import {MissionEngine} from '../src/game/MissionEngine.ts';
const event={id:'test',title:'test',note:'test',source:'test',effects:{},kind:'education'};
const e=new MissionEngine(()=>event);assert.equal(e.claimOrbit(1000).ok,true);assert.equal(e.state.power,69);assert.equal(e.claimOrbit(2000).ok,false);const r=new MissionEngine(()=>event);assert.equal(r.restore(e.snapshot()),true);assert.equal(r.orbitReward,true);
const base=new MissionEngine(()=>event);const tuned=new MissionEngine(()=>event);for(const g of [base,tuned])Object.assign(g.state,{planned:true,craftReady:true,commsReady:true});tuned.orbitReward=true;
assert.equal(base.execute('navigate',1000).ok,true);assert.equal(tuned.execute('navigate',1000).ok,true);assert.equal(tuned.state.propellant-base.state.propellant,2);
console.log('Orbit reward passed: resource cost, duplicate protection, saved state, and navigation fuel trade-off.');
