import assert from 'node:assert/strict';
import {speechTimeline,speechPitch} from '../src/game/SpeechTimeline.ts';
const times=speechTimeline('你好，朋友！');assert.equal(times.length,6);assert.ok(times[3]-times[2]>times[1]-times[0]);assert.ok(times.every((t,i)=>i===0||t>times[i-1]));assert.ok(speechPitch('好',1,'cheer')>speechPitch('好',1,'thinking'));assert.deepEqual(speechTimeline(''),[]);console.log('Speech timeline passed: character timing, punctuation pauses and emotional pitch.');
