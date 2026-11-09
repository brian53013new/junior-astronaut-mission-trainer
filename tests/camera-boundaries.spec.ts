import {test,expect} from '@playwright/test';

test('repeated touch gestures stay inside the welcome room viewing limits',async({page,browserName},info)=>{
 test.skip(!info.project.name.includes('mobile')||browserName!=='chromium','Touch emulation is exercised on mobile and tablet Chromium.');test.setTimeout(180_000);
 await page.goto('/?qa=1');await page.locator('#lobby-start').click();await page.locator('#intro-skip').click();await page.waitForTimeout(1500);
 const cdp=await page.context().newCDPSession(page);const w=page.viewportSize()!.width,h=page.viewportSize()!.height;
 async function swipe(from:number,to:number,dy=0){const y=h*.21;await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:from,y}]});for(let i=1;i<=5;i++)await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:from+(to-from)*i/5,y:y+dy*i/5}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});}
 const yaw=()=>page.evaluate(()=>window.__OUTPOST_QA__!.camera().yaw);const pitch=()=>page.evaluate(()=>window.__OUTPOST_QA__!.camera().pitch);
 for(let i=0;i<7;i++)await swipe(w*.75,w*.25);const left=await yaw();expect(left).toBeGreaterThan(.9);expect(left).toBeLessThanOrEqual(1.021);await swipe(w*.75,w*.25);expect(await yaw()).toBeCloseTo(left,4);
 for(let i=0;i<12;i++)await swipe(w*.25,w*.75);const right=await yaw();expect(right).toBeLessThan(-.9);expect(right).toBeGreaterThanOrEqual(-1.021);await swipe(w*.25,w*.75);expect(await yaw()).toBeCloseTo(right,4);
 for(let i=0;i<5;i++)await swipe(w*.5,w*.5,h*.35);expect(await pitch()).toBeLessThanOrEqual(.261);
 const before=await yaw();await swipe(w*.4,w*.4+5);expect(await yaw()).toBeCloseTo(before,4);
});

test('off-screen training book provides a passive direction marker',async({page})=>{
 test.setTimeout(45_000);await page.addInitScript(()=>{localStorage.setItem('outpost-welcome-3d-v1','done');});await page.goto('/?qa=1');await page.locator('#lobby-start').click();await page.waitForTimeout(2500);
 // The initial study opens directly; return to the control desk to find its book.
 await page.keyboard.press('Escape');await page.waitForTimeout(2000);
 await expect(page.locator('#target-direction')).toBeVisible();
 expect(await page.locator('#target-direction').evaluate(el=>getComputedStyle(el).pointerEvents)).toBe('none');
});

test('main desk retains bounded cumulative touch rotation',async({page,browserName},info)=>{
 test.skip(!info.project.name.includes('mobile')||browserName!=='chromium','Touch emulation is exercised on mobile and tablet Chromium.');test.setTimeout(180_000);
 await page.addInitScript(()=>{localStorage.setItem('outpost-welcome-3d-v1','done');localStorage.setItem('outpost-learning-journey-v2',JSON.stringify({version:2,curriculumVersion:2,activityVersion:1,index:1,awaiting:false,finished:false,reading:false,readingPage:0,attempts:0,lastChoice:null,records:[],finalTasks:[]}));});
 await page.goto('/?qa=1');await page.locator('#lobby-start').click();await page.waitForTimeout(2500);const cdp=await page.context().newCDPSession(page),w=page.viewportSize()!.width,h=page.viewportSize()!.height;
 async function swipe(a:number,b:number){const y=h*.17;await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:a,y}]});for(let i=1;i<=4;i++)await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:a+(b-a)*i/4,y}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});}
 const yaw=()=>page.evaluate(()=>window.__OUTPOST_QA__!.camera().yaw);for(let i=0;i<7;i++)await swipe(w*.8,w*.2);expect(await yaw()).toBeCloseTo(.94,2);await swipe(w*.8,w*.2);expect(await yaw()).toBeCloseTo(.94,2);for(let i=0;i<12;i++)await swipe(w*.2,w*.8);expect(await yaw()).toBeCloseTo(-.94,2);
});
