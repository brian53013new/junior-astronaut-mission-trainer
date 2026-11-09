import { expect, test } from '@playwright/test';

test('site planning uses the physical board and opens reflection',async({page},info)=>{
 test.setTimeout(120_000);const mobile=info.project.name.includes('mobile');const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 await page.addInitScript(()=>{localStorage.setItem('outpost-welcome-3d-v1','done');localStorage.setItem('outpost-learning-journey-v2',JSON.stringify({version:2,curriculumVersion:2,activityVersion:1,index:1,awaiting:false,finished:false,reading:false,readingPage:0,attempts:0,lastChoice:null,records:[],finalTasks:[]}));});
 await page.goto('/?qa=1');await page.locator('#lobby-start').click();await page.waitForFunction(()=>Boolean(window.__OUTPOST_QA__));await page.evaluate(()=>window.__OUTPOST_QA__!.ready());await page.waitForTimeout(6000);
 const cdp=mobile?await page.context().newCDPSession(page):null;
 if(cdp){await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:100,y:100}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:250,y:100}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await page.waitForTimeout(3500);}
 const point=()=>page.evaluate(()=>window.__OUTPOST_QA__!.screenPosition('plan'));let p=await point();expect(p.x).toBeGreaterThan(0);expect(p.x).toBeLessThan(page.viewportSize()!.width);
 if(mobile)await page.touchscreen.tap(p.x,p.y);else await page.mouse.click(p.x,p.y);
 await expect.poll(()=>page.evaluate(()=>window.__OUTPOST_QA__!.selectedAction()),{timeout:15000}).toBe('plan');await page.waitForTimeout(5000);p=await point();
 if(cdp){await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[p]});await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:p.x+70,y:p.y}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});}
 else{await page.mouse.move(p.x,p.y);await page.mouse.down();await page.mouse.move(p.x+70,p.y,{steps:8});await page.mouse.up();}
 await expect.poll(()=>page.evaluate(()=>window.__OUTPOST_QA__!.welcome().quiz),{timeout:15000}).toBe(true);
 const state=await page.evaluate(()=>window.__OUTPOST_QA__!.state());expect(state.planned).toBe(true);expect(state.commandSpent).toBe(true);expect(errors).toEqual([]);
});
