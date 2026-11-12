import { expect, test } from '@playwright/test';

test('communications lesson receives a sequence and sends a signal',async({page},info)=>{
 test.setTimeout(120_000);const mobile=info.project.name.includes('mobile');const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 await page.addInitScript(()=>{localStorage.setItem('outpost-welcome-3d-v1','done');localStorage.setItem('outpost-learning-journey-v2',JSON.stringify({version:2,curriculumVersion:2,activityVersion:1,index:3,awaiting:false,finished:false,reading:false,readingPage:0,attempts:0,lastChoice:null,records:[],finalTasks:[]}));});
 await page.goto('/?qa=1');await page.locator('#lobby-start').click();await page.waitForFunction(()=>Boolean(window.__OUTPOST_QA__));await page.evaluate(()=>window.__OUTPOST_QA__!.ready());await page.waitForTimeout(6000);
 const tap=async(x:number,y:number)=>{const p=await page.evaluate(([a,b])=>window.__OUTPOST_QA__!.screenPoint('map',a,b),[x,y]);if(mobile)await page.touchscreen.tap(p.x,p.y);else await page.mouse.click(p.x,p.y);await page.waitForTimeout(900);};
 await tap(320,200);await page.waitForTimeout(6000);await tap(565,22);await expect.poll(()=>page.evaluate(()=>window.__OUTPOST_QA__!.signal().active),{timeout:10000}).toBe(true);
 await expect.poll(()=>page.evaluate(()=>window.__OUTPOST_QA__!.communications().active)).toBe(true);await page.waitForTimeout(3500);const point=(kind:'dial'|'key'|'send',i=0)=>page.evaluate(([kind,i])=>window.__OUTPOST_QA__!.communicationsPoint(kind as 'dial'|'key'|'send',i as number),[kind,i] as const);let p=await point('dial');const cdp=mobile?await page.context().newCDPSession(page):null;
 if(cdp){await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[p]});await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:p.x+54,y:p.y}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});}else{await page.mouse.move(p.x,p.y);await page.mouse.down();await page.mouse.move(p.x+54,p.y,{steps:5});await page.mouse.up();}await expect.poll(()=>page.evaluate(()=>window.__OUTPOST_QA__!.communications().aligned)).toBe(true);
 await page.waitForTimeout(5000);for(const i of [0,2,1,3]){p=await point('key',i);if(mobile)await page.touchscreen.tap(p.x,p.y);else await page.mouse.click(p.x,p.y);await page.waitForTimeout(400);}
 await expect.poll(()=>page.evaluate(()=>window.__OUTPOST_QA__!.signal().solved),{timeout:10000}).toBe(true);
 p=await point('send');if(mobile)await page.touchscreen.tap(p.x,p.y);else await page.mouse.click(p.x,p.y);await expect.poll(()=>page.evaluate(()=>window.__OUTPOST_QA__!.welcome().quiz),{timeout:15000}).toBe(true);
 const state=await page.evaluate(()=>window.__OUTPOST_QA__!.state());expect(state.power).toBe(69);expect(state.data).toBe(10);expect(errors).toEqual([]);
});
