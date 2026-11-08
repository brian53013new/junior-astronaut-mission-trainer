import { expect, test } from '@playwright/test';

test('the physical clock advances once per full turn and stops at an event',async({page},info)=>{
 test.skip(info.project.name.includes('mobile'),'Clock manipulation with touch is covered by the mobile control tests and requires device-specific tuning.');
 test.setTimeout(150_000);
 await page.addInitScript(()=>{
  localStorage.setItem('outpost-welcome-3d-v1','done');
  localStorage.setItem('outpost-learning-journey-v2',JSON.stringify({version:2,curriculumVersion:2,activityVersion:1,index:1,awaiting:false,finished:false,reading:false,readingPage:0,attempts:0,lastChoice:null,records:[],finalTasks:[]}));
 });
 await page.goto('/?qa=1');await page.locator('#lobby-start').click();await page.waitForFunction(()=>Boolean(window.__OUTPOST_QA__));await page.evaluate(()=>window.__OUTPOST_QA__!.ready());await page.waitForTimeout(6000);
 const state=()=>page.evaluate(()=>window.__OUTPOST_QA__!.state());const pos=(a:string)=>page.evaluate(name=>window.__OUTPOST_QA__!.screenPosition(name),a);
 const turn=async(dx:number)=>{
  let p=await pos('advance');await page.mouse.move(p.x,p.y);await page.waitForTimeout(400);await page.mouse.click(p.x,p.y);
  await expect.poll(()=>page.evaluate(()=>window.__OUTPOST_QA__!.selectedAction()),{timeout:15000}).toBe('advance');await page.waitForTimeout(5000);p=await pos('advance');
  await page.mouse.move(p.x,p.y);await page.mouse.down();await page.mouse.move(p.x+dx,p.y,{steps:10});await page.mouse.up();await page.waitForTimeout(1500);
 };
 const before=Number((await state()).sol);await turn(70);expect((await state()).sol).toBe(before);
 await turn(185);await expect.poll(async()=>Number((await state()).sol),{timeout:10000}).toBe(before+1);
 await turn(185);await expect.poll(async()=>Number((await state()).sol),{timeout:10000}).toBe(before+2);
 expect((await state()).eventOpen).toBe(true);
});
