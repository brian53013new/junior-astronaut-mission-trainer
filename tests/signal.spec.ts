import { expect, test } from '@playwright/test';

test('communications lesson receives a sequence and sends a signal',async({page},info)=>{
 test.setTimeout(120_000);const mobile=info.project.name.includes('mobile');const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 await page.addInitScript(()=>{localStorage.setItem('outpost-welcome-3d-v1','done');localStorage.setItem('outpost-learning-journey-v2',JSON.stringify({version:2,curriculumVersion:2,activityVersion:1,index:3,awaiting:false,finished:false,reading:false,readingPage:0,attempts:0,lastChoice:null,records:[],finalTasks:[]}));});
 await page.goto('/?qa=1');await page.locator('#lobby-start').click();await page.waitForFunction(()=>Boolean(window.__OUTPOST_QA__));await page.evaluate(()=>window.__OUTPOST_QA__!.ready());await page.waitForTimeout(6000);
 const tap=async(x:number,y:number)=>{const p=await page.evaluate(([a,b])=>window.__OUTPOST_QA__!.screenPoint('map',a,b),[x,y]);if(mobile)await page.touchscreen.tap(p.x,p.y);else await page.mouse.click(p.x,p.y);await page.waitForTimeout(900);};
 await tap(320,200);await page.waitForTimeout(6000);await tap(565,22);await expect.poll(()=>page.evaluate(()=>window.__OUTPOST_QA__!.signal().active),{timeout:10000}).toBe(true);
 await page.waitForTimeout(5000);for(const x of [95,395,245,545])await tap(x,207);
 await expect.poll(()=>page.evaluate(()=>window.__OUTPOST_QA__!.signal().solved),{timeout:10000}).toBe(true);
 await tap(515,334);await expect.poll(()=>page.evaluate(()=>window.__OUTPOST_QA__!.welcome().quiz),{timeout:15000}).toBe(true);
 const state=await page.evaluate(()=>window.__OUTPOST_QA__!.state());expect(state.power).toBe(69);expect(state.data).toBe(10);expect(errors).toEqual([]);
});
