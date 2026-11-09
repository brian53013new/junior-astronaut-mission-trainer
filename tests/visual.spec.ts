import { expect, test, type Page } from '@playwright/test';

type State={power:number;water:number;sol:number;commandSpent:boolean;commandCount:number};
const state=(page:Page)=>page.evaluate(()=>window.__OUTPOST_QA__!.state() as State);
async function enterDesk(page:Page){
 await page.addInitScript(()=>{
  localStorage.setItem('outpost-welcome-3d-v1','done');
  localStorage.setItem('outpost-learning-journey-v2',JSON.stringify({version:2,curriculumVersion:2,activityVersion:1,index:1,awaiting:false,finished:false,reading:false,readingPage:0,attempts:0,lastChoice:null,records:[],finalTasks:[]}));
 });
 await page.goto('/?qa=1');await page.locator('#lobby-start').click();
 await page.waitForFunction(()=>Boolean(window.__OUTPOST_QA__));await page.evaluate(()=>window.__OUTPOST_QA__!.ready());await page.waitForTimeout(6000);
}

test('physical power control changes supplies once and survives reload',async({page},info)=>{
 test.setTimeout(120_000);const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await enterDesk(page);
 const mobile=info.project.name.includes('mobile');const pos=()=>page.evaluate(()=>window.__OUTPOST_QA__!.screenPosition('power'));
 const before=await state(page);let p=await pos();expect(p.x).toBeGreaterThan(0);expect(p.x).toBeLessThan(page.viewportSize()!.width);
 if(mobile)await page.touchscreen.tap(p.x,p.y);else await page.mouse.click(p.x,p.y);
 await expect.poll(()=>page.evaluate(()=>window.__OUTPOST_QA__!.selectedAction()),{timeout:15000}).toBe('power');await page.waitForTimeout(5000);p=await pos();
 if(mobile){const cdp=await page.context().newCDPSession(page);await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:p.x,y:p.y}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:p.x+80,y:p.y}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});}
 else{await page.mouse.move(p.x,p.y);await page.mouse.down();await page.mouse.move(p.x+80,p.y,{steps:8});await page.mouse.up();}
 await expect.poll(async()=>(await state(page)).commandCount,{timeout:15000}).toBe(1);
 const after=await state(page);expect(after.power).toBeGreaterThan(before.power);expect(after.water).toBeLessThan(before.water);expect(after.commandSpent).toBe(true);
 await page.reload();await page.locator('#lobby-start').click();await page.waitForFunction(()=>Boolean(window.__OUTPOST_QA__));await page.evaluate(()=>window.__OUTPOST_QA__!.ready());
 const restored=await state(page);expect(restored.power).toBe(after.power);expect(restored.water).toBe(after.water);expect(restored.sol).toBe(after.sol);expect(restored.commandSpent).toBe(true);expect(errors).toEqual([]);
});

test('language choice and layout work at this viewport',async({page})=>{
 test.setTimeout(60_000);await page.addInitScript(()=>localStorage.setItem('outpost-language','en'));await page.goto('/?qa=1');
 await expect(page.locator('#lobby-subtitle')).toContainText('lunar adventure');await page.locator('#lobby-language').click();
 await expect(page.locator('#lobby-subtitle')).toContainText('月球');expect(await page.evaluate(()=>window.__OUTPOST_QA__!.language())).toBe('zh');
 const d=await page.evaluate(()=>({width:document.documentElement.clientWidth,scroll:document.documentElement.scrollWidth,height:document.documentElement.clientHeight,canvas:document.querySelector('canvas')!.getBoundingClientRect().toJSON()}));
 expect(d.scroll).toBeLessThanOrEqual(d.width);expect(d.canvas.width).toBe(d.width);expect(d.canvas.height).toBe(d.height);
});
