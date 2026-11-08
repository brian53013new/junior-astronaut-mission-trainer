import assert from 'node:assert/strict';
import { SignalGame } from '../src/game/SignalGame.ts';
import { MissionEngine } from '../src/game/MissionEngine.ts';
const s=new SignalGame();s.started=0;assert.equal(s.accept(0,1000),'wait');assert.equal(s.accept(1,5000),'wrong');assert.equal(s.cursor,0);
for(const n of [0,2,1])assert.equal(s.accept(n,5000),'correct');assert.equal(s.accept(3,5000),'complete');assert.equal(s.solved,true);
const event={id:'case',title:'case',note:'case',source:'case',effects:{},kind:'education'};const m=new MissionEngine(()=>event);assert.equal(m.claimSignal(1000).ok,true);assert.equal(m.state.power,69);assert.equal(m.state.data,10);assert.equal(m.claimSignal(2000).ok,false);
const copy=new MissionEngine(()=>event);assert.equal(copy.restore(m.snapshot()),true);assert.equal(copy.signalReward,true);assert.equal(copy.claimSignal(3000).ok,false);
s.replay(6000);assert.equal(s.solved,false);assert.equal(s.cursor,0);console.log('Signal sequence, retry, resource cost, one-time reward, and restored reward state passed.');
