import { expect, test } from '@playwright/test';

test('science observation uses the instrument and opens reflection',async({page},info)=>{
 test.setTimeout(120_000);const mobile=info.project.name.includes('mobile');const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 await page.addInitScript(()=>{
  localStorage.setItem('outpost-welcome-3d-v1','done');localStorage.setItem('outpost-learning-journey-v2',JSON.stringify({version:2,curriculumVersion:2,activityVersion:1,index:4,awaiting:false,finished:false,reading:false,readingPage:0,attempts:0,lastChoice:null,records:[],finalTasks:[]}));
  const state={power:72,water:68,food:54,health:100,propellant:82,shielding:0,sol:1,cycle:1,planned:true,craftReady:true,commsReady:true,navReady:true,data:0,discoveries:0,eventOpen:false,paused:false,commandSpent:false,lastCommandAt:0};const settings={power:.5,craft:.5,science:.5,aim:.5,navigate:.5,plan:.5,analyze:.5};localStorage.setItem('outpost-mission-progress-v2',JSON.stringify({snapshot:{version:1,state,settings,commandCount:0,activeEvent:null}}));
 });
 await page.goto('/?qa=1');await page.locator('#lobby-start').click();await page.waitForFunction(()=>Boolean(window.__OUTPOST_QA__));await page.evaluate(()=>window.__OUTPOST_QA__!.ready());await page.waitForTimeout(6000);
 const cdp=mobile?await page.context().newCDPSession(page):null;
 if(cdp){await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:100,y:100}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:220,y:100}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await page.waitForTimeout(3000);}
 const point=()=>page.evaluate(()=>window.__OUTPOST_QA__!.screenPosition('science'));let p=await point();expect(p.x).toBeGreaterThan(0);expect(p.x).toBeLessThan(page.viewportSize()!.width);
 if(mobile)await page.touchscreen.tap(p.x,p.y);else await page.mouse.click(p.x,p.y);
 await expect.poll(()=>page.evaluate(()=>window.__OUTPOST_QA__!.selectedAction()),{timeout:15000}).toBe('science');await page.waitForTimeout(5000);p=await point();
 if(cdp){await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[p]});await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:p.x+65,y:p.y-25}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});}else{await page.mouse.move(p.x,p.y);await page.mouse.down();await page.mouse.move(p.x+65,p.y-25,{steps:8});await page.mouse.up();}
 await expect.poll(()=>page.evaluate(()=>window.__OUTPOST_QA__!.welcome().quiz),{timeout:15000}).toBe(true);const state=await page.evaluate(()=>window.__OUTPOST_QA__!.state());expect(state.discoveries).toBe(1);expect(state.commandSpent).toBe(true);expect(errors).toEqual([]);
});
