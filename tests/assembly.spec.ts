import { finishProbe } from './finish-probe';
import { expect, test } from '@playwright/test';
import { curriculum } from '../src/game/Curriculum';
import { questionOrder } from '../src/game/QuestionOrder';

test('the first lesson assembles real parts and progresses to reflection',async({page},info)=>{
 test.setTimeout(160_000);const mobile=info.project.name.includes('mobile');const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 await page.addInitScript(()=>{localStorage.setItem('outpost-welcome-3d-v1','done');if(!localStorage.getItem('outpost-learning-journey-v2'))localStorage.setItem('outpost-learning-journey-v2',JSON.stringify({version:2,curriculumVersion:2,activityVersion:1,index:0,awaiting:false,finished:false,reading:false,readingPage:0,attempts:0,lastChoice:null,records:[],finalTasks:[]}));});
 await page.goto('/?qa=1');await page.locator('#lobby-start').click();await page.waitForFunction(()=>Boolean(window.__OUTPOST_QA__));await page.evaluate(()=>window.__OUTPOST_QA__!.ready());await page.waitForTimeout(6000);
 const point=(x:number,y:number)=>page.evaluate(([a,b])=>window.__OUTPOST_QA__!.screenPoint('map',a,b),[x,y]);
 const tap=async(x:number,y:number)=>{const p=await point(x,y);if(mobile)await page.touchscreen.tap(p.x,p.y);else await page.mouse.click(p.x,p.y);await page.waitForTimeout(2000);};
 await tap(320,200);await page.waitForTimeout(5000);await tap(468,22);
 await expect.poll(()=>page.evaluate(()=>window.__OUTPOST_QA__!.workshop().mode),{timeout:10000}).toBe('assembly');
 await expect.poll(()=>page.evaluate(()=>window.__OUTPOST_QA__!.assemblyBay().active)).toBe(true);await page.waitForTimeout(2500);
 const cdp=mobile?await page.context().newCDPSession(page):null;
 for(let i=0;i<3;i++){
  const a=await page.evaluate(i=>window.__OUTPOST_QA__!.assemblyPoint('part',i),i),b=await page.evaluate(i=>window.__OUTPOST_QA__!.assemblyPoint('socket',i),i);
  if(cdp){await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[a]});await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[b]});await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});}
  else{await page.mouse.move(a.x,a.y);await page.mouse.down();await page.mouse.move(b.x,b.y,{steps:8});await page.mouse.up();}
  await expect.poll(()=>page.evaluate(index=>window.__OUTPOST_QA__!.workshop().parts[index],i),{timeout:10000}).toBe(true);
 }
 await finishProbe(page,mobile);
 {const p=await page.evaluate(()=>window.__OUTPOST_QA__!.assemblyPoint('activate',0));if(mobile)await page.touchscreen.tap(p.x,p.y);else await page.mouse.click(p.x,p.y);}await expect.poll(()=>page.evaluate(()=>window.__OUTPOST_QA__!.welcome().quiz),{timeout:15000}).toBe(true);
 const state=await page.evaluate(()=>window.__OUTPOST_QA__!.state());expect(state.shielding).toBe(10);expect(state.power).toBe(68);
 await page.waitForTimeout(5000);const paper=async(x:number,y:number)=>{const p=await page.evaluate(([a,b])=>window.__OUTPOST_QA__!.paperPosition(a,b),[x,y]);if(mobile)await page.touchscreen.tap(p.x,p.y);else await page.mouse.click(p.x,p.y);await page.waitForTimeout(1500);};
 await paper(300,350);await paper(800,710);
 for(const q of curriculum.assembly.questions){const slot=questionOrder(q.id).indexOf(q.correct);await paper(300,350+slot*96);await paper(800,710);}
 await expect.poll(()=>page.evaluate(()=>window.__OUTPOST_QA__!.lesson().id),{timeout:15000}).toBe('plan');
 await page.reload();await page.locator('#lobby-start').click();await expect.poll(()=>page.evaluate(()=>window.__OUTPOST_QA__?.lesson().id),{timeout:15000}).toBe('plan');expect(errors).toEqual([]);
});
