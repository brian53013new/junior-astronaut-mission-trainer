import { expect, test } from '@playwright/test';

test('audio starts on interaction, mutes, and preserves separate music level',async({page})=>{
 test.setTimeout(60_000);
 await page.addInitScript(()=>{
  const stats={oscillators:0,buffers:0};Object.defineProperty(window,'__audioTestStats',{value:stats});
  const oscillator=AudioContext.prototype.createOscillator;
  AudioContext.prototype.createOscillator=function(){const node=oscillator.call(this);const start=node.start.bind(node);node.start=(...args:Parameters<OscillatorNode['start']>)=>{stats.oscillators++;return start(...args);};return node;};
  const buffer=AudioContext.prototype.createBufferSource;
  AudioContext.prototype.createBufferSource=function(){const node=buffer.call(this);const start=node.start.bind(node);node.start=(...args:Parameters<AudioBufferSourceNode['start']>)=>{stats.buffers++;return start(...args);};return node;};
 });
 const counts=()=>page.evaluate(()=>(window as unknown as {__audioTestStats:{oscillators:number;buffers:number}}).__audioTestStats);
 await page.goto('/?qa=1');expect((await counts()).oscillators).toBe(0);await page.locator('#lobby-start').click();
 await expect.poll(async()=>(await counts()).buffers,{timeout:15000}).toBeGreaterThan(0);await expect.poll(async()=>(await counts()).oscillators,{timeout:15000}).toBeGreaterThan(1);
 await page.locator('.settings-gear').click();const music=page.locator('[data-input="music"]');await music.fill('25');await music.dispatchEvent('input');expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('outpost-audio-levels-v1')||'{}').music)).toBe(.25);
 const mute=page.locator('[data-action="mute"]');await mute.click();await expect(mute).toHaveAttribute('aria-pressed','true');await page.waitForTimeout(1000);const before=(await counts()).oscillators;await page.waitForTimeout(1800);expect((await counts()).oscillators).toBe(before);
 await mute.click();await expect(mute).toHaveAttribute('aria-pressed','false');await expect.poll(async()=>(await counts()).oscillators,{timeout:10000}).toBeGreaterThan(before);
});
