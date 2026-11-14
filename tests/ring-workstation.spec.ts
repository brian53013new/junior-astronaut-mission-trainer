import { test, expect } from '@playwright/test';
test('the seat turns to a side workstation and focuses its physical control',async({page},info)=>{
 test.setTimeout(100_000);await page.addInitScript(()=>{localStorage.setItem('outpost-welcome-3d-v1','done');localStorage.setItem('outpost-learning-journey-v2',JSON.stringify({version:2,curriculumVersion:2,activityVersion:1,index:1,awaiting:false,finished:false,reading:false,readingPage:0,attempts:0,lastChoice:null,records:[],finalTasks:[]}));});
 await page.goto('/?qa=1');await page.locator('#lobby-start').click();await page.waitForTimeout(3000);
 const mobile=info.project.name.includes('mobile'),w=page.viewportSize()!.width,h=page.viewportSize()!.height;
 if(mobile){const c=await page.context().newCDPSession(page);for(let i=0;i<2;i++){await c.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:w/2-78,y:100}]});await c.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:w/2+78,y:100}]});await c.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});}}else for(let i=0;i<4;i++)await page.keyboard.press('ArrowLeft');
 await page.waitForTimeout(3500);const p=await page.evaluate(()=>window.__OUTPOST_QA__!.screenPosition('power'));
 expect(p.x).toBeGreaterThan(0);expect(p.x).toBeLessThan(w);expect(p.y).toBeGreaterThan(0);expect(p.y).toBeLessThan(h);
 if(mobile)await page.touchscreen.tap(p.x,p.y);else await page.mouse.click(p.x,p.y);
 await expect.poll(()=>page.evaluate(()=>window.__OUTPOST_QA__!.selectedAction()),{timeout:12000}).toBe('power');
});

test('planning table switches its physical observation modes',async({page},info)=>{
 test.setTimeout(90_000);await page.addInitScript(()=>{localStorage.setItem('outpost-welcome-3d-v1','done');localStorage.setItem('outpost-learning-journey-v2',JSON.stringify({version:2,curriculumVersion:2,activityVersion:1,index:1,awaiting:false,finished:false,reading:false,readingPage:0,attempts:0,lastChoice:null,records:[],finalTasks:[]}));});
 await page.goto('/?qa=1');await page.locator('#lobby-start').click();await page.waitForTimeout(6500);const mobile=info.project.name.includes('mobile');if(mobile){const c=await page.context().newCDPSession(page);await c.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:100,y:100}]});await c.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:250,y:100}]});await c.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await page.waitForTimeout(3500);}let p=await page.evaluate(()=>window.__OUTPOST_QA__!.screenPosition('plan'));if(mobile)await page.touchscreen.tap(p.x,p.y);else await page.mouse.click(p.x,p.y);await expect.poll(()=>page.evaluate(()=>window.__OUTPOST_QA__!.selectedAction()),{timeout:10000}).toBe('plan');await page.waitForTimeout(3000);
 p=await page.evaluate(()=>window.__OUTPOST_QA__!.siteModePoint(1));if(mobile)await page.touchscreen.tap(p.x,p.y);else await page.mouse.click(p.x,p.y);await expect.poll(()=>page.evaluate(()=>window.__OUTPOST_QA__!.siteMode())).toBe(1);
 p=await page.evaluate(()=>window.__OUTPOST_QA__!.siteModePoint(2));if(mobile)await page.touchscreen.tap(p.x,p.y);else await page.mouse.click(p.x,p.y);await expect.poll(()=>page.evaluate(()=>window.__OUTPOST_QA__!.siteMode())).toBe(2);
});

test('seat completes a full rotation and reaches the rear training book',async({page},info)=>{
 test.setTimeout(120_000);await page.addInitScript(()=>{localStorage.setItem('outpost-welcome-3d-v1','done');localStorage.setItem('outpost-learning-journey-v2',JSON.stringify({version:2,curriculumVersion:2,activityVersion:1,index:1,awaiting:false,finished:false,reading:false,readingPage:0,attempts:0,lastChoice:null,records:[],finalTasks:[]}));});
 await page.goto('/?qa=1');await page.locator('#lobby-start').click();await page.waitForTimeout(5000);const mobile=info.project.name.includes('mobile'),w=page.viewportSize()!.width;
 const turn=async()=>{if(mobile){const c=await page.context().newCDPSession(page),delta=Math.PI/.004/4;for(let j=0;j<2;j++){await c.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:w/2+delta/2,y:100}]});await c.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:w/2-delta/2,y:100}]});await c.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});}}else{for(let i=0;i<5;i++)await page.keyboard.press('ArrowRight');}};
 await turn();await turn();const halfway=await page.evaluate(()=>window.__OUTPOST_QA__!.camera().yaw);expect(Math.abs(halfway)).toBeGreaterThan(2.8);await turn();await turn();const full=await page.evaluate(()=>window.__OUTPOST_QA__!.camera().yaw);expect(Math.abs(full)).toBeLessThan(.25);
 await turn();await turn();await page.waitForTimeout(3500);const p=await page.evaluate(()=>window.__OUTPOST_QA__!.bookPosition());expect(p.x).toBeGreaterThan(0);expect(p.x).toBeLessThan(w);expect(p.y).toBeGreaterThan(0);expect(p.y).toBeLessThan(page.viewportSize()!.height);if(mobile)await page.touchscreen.tap(p.x,p.y);else await page.mouse.click(p.x,p.y);await expect.poll(()=>page.evaluate(()=>window.__OUTPOST_QA__!.welcome().quiz),{timeout:15000}).toBe(true);
});
